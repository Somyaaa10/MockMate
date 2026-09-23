const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

// registerUser function
const registerUser = async ({ fullName, email, password }) => {
  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
  });

  return user;
};

// loginUser function
const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ email }).select("+password");

  // USER NOT EXIST
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // if all info match comapre pass
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    token,
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

  // Validate face descriptor
  if (!Array.isArray(faceDescriptorArray) || faceDescriptorArray.length !== 128) {
    throw new Error("Invalid face descriptor: must be an array of 128 numbers");
  }

  // Upload image to Cloudinary
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

  // Delete previous profile image from Cloudinary if it had a public_id saved
  // (profileImage is just a URL, so we skip cleanup — Cloudinary handles storage lifecycle)

  user.profileImage = uploadResult.secure_url;
  user.faceDescriptor = Array.from(faceDescriptorArray);
  user.faceEnrolledAt = new Date();
  await user.save();

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  uploadProfilePhoto,
};
