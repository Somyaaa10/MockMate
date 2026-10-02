const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshTokenInRedis,
  verifyRefreshTokenInRedis,
  removeRefreshTokenFromRedis,
} = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");
const emailService = require("./email.service");

// registerUser function
const registerUser = async ({ fullName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  return user;
};

// loginUser function
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  const userIdStr = user._id.toString();
  const accessToken = generateAccessToken(userIdStr);
  const refreshToken = generateRefreshToken(userIdStr);

  // Store 7-day refresh token in Redis
  await storeRefreshTokenInRedis(userIdStr, refreshToken);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user,
  };
};

// Update user profile
const updateProfile = async (userId, { fullName, mobile, designation }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (fullName !== undefined) {
    user.fullName = fullName.trim();
  }

  if (mobile !== undefined) {
    user.mobile = mobile.trim();
  }

  if (designation !== undefined) {
    user.designation = designation.trim();
  }

  await user.save();

  return user;
};

// Upload profile photo and store face descriptor
const uploadProfilePhoto = async (userId, imageBuffer, mimetype, faceDescriptorArray) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!Array.isArray(faceDescriptorArray) || faceDescriptorArray.length !== 128) {
    throw new Error("Invalid face descriptor: must be an array of 128 numbers");
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mockmate/profiles",
        resource_type: "image",
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(imageBuffer);
  });

  user.profileImage = uploadResult.secure_url;
  user.faceDescriptor = Array.from(faceDescriptorArray);
  user.faceEnrolledAt = new Date();
  await user.save();

  return user;
};

// Forgot Password — Request reset link
const forgotPassword = async (emailInput) => {
  const genericMessage = "If an account exists with this email, a password reset link has been sent.";

  if (!emailInput || typeof emailInput !== "string" || !emailInput.trim()) {
    return { success: true, message: genericMessage };
  }

  const normalizedEmail = emailInput.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Security: Account enumeration guard — return generic message for non-existent users
  if (!user) {
    return { success: true, message: genericMessage };
  }

  // Generate 32-byte cryptographically secure raw token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash the raw token with SHA-256 for persistent database storage
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Expiration: 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpires = expiresAt;
  await user.save();

  // Send password reset email asynchronously
  await emailService.sendPasswordResetEmail({
    toEmail: user.email,
    fullName: user.fullName,
    rawResetToken: rawToken,
  });

  return { success: true, message: genericMessage };
};

// Reset Password — Confirm new password with raw token
const resetPassword = async ({ token, password, confirmPassword }) => {
  if (!token || typeof token !== "string" || !token.trim()) {
    throw new Error("Reset token is required");
  }

  if (!password || !confirmPassword) {
    throw new Error("Password and confirm password are required");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Hash incoming raw token to find corresponding database record
  const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires");

  if (!user) {
    throw new Error("This password reset link is invalid or has expired.");
  }

  // Update password (pre('save') hook in User schema hashes the password)
  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return {
    success: true,
    message: "Password reset successfully. You can now log in with your new password.",
  };
};

// Refresh access token using long-lived refresh token stored in Redis
const refreshAccessToken = async (refreshTokenInput) => {
  if (!refreshTokenInput || typeof refreshTokenInput !== "string" || !refreshTokenInput.trim()) {
    throw new Error("Refresh token is required");
  }

  const refreshToken = refreshTokenInput.trim();
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured in environment variables");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, secret);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  if (!decoded || !decoded.id) {
    throw new Error("Invalid refresh token payload");
  }

  const isStoredInRedis = await verifyRefreshTokenInRedis(decoded.id, refreshToken);
  if (!isStoredInRedis) {
    throw new Error("Refresh token has been revoked or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error("User associated with this token no longer exists");
  }

  // Generate new short-lived Access Token (15 minutes)
  const newAccessToken = generateAccessToken(user._id);

  return {
    accessToken: newAccessToken,
    refreshToken,
    token: newAccessToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

// Logout user and revoke refresh token from Redis
const logoutUser = async ({ userId, refreshToken }) => {
  let targetUserId = userId;
  if (!targetUserId && refreshToken && typeof refreshToken === "string") {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (secret) {
        const decoded = jwt.verify(refreshToken.trim(), secret);
        targetUserId = decoded?.id;
      }
    } catch {
      // Ignored if token invalid
    }
  }

  if (targetUserId && refreshToken) {
    await removeRefreshTokenFromRedis(targetUserId.toString(), refreshToken.trim());
  }

  return {
    success: true,
    message: "Logged out successfully",
  };
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  uploadProfilePhoto,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
};
