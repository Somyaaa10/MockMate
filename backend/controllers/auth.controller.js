const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const authService = require("../services/auth.service");

// register controller
const register = async (req, res) => {
  try {
    // get user data from request body
    const { fullName, email, password } = req.body;

    // register user using authService
    const user = await authService.registerUser({
      fullName,
      email,
      password,
    });

    // send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// login controller
const login = async (req, res) => {
  try {
    // get data from req body
    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user._id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get me
const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        mobile: req.user.mobile,
        designation: req.user.designation,
        profileImage: req.user.profileImage,
        isPremium: req.user.isPremium,
        isVerified: req.user.isVerified,
        // Only send whether a descriptor exists — never the raw array
        hasFaceDescriptor: Array.isArray(req.user.faceDescriptor) && req.user.faceDescriptor.length === 128,
        faceEnrolledAt: req.user.faceEnrolledAt || null,
      },
      "User profile fetched successfully",
    ),
  );
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, mobile, designation } = req.body;

  const user = await authService.updateProfile(req.user._id, {
    fullName,
    mobile,
    designation,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        designation: user.designation,
        profileImage: user.profileImage,
        isPremium: user.isPremium,
        isVerified: user.isVerified,
      },
      "Profile updated successfully",
    ),
  );
});

// Upload profile photo + store face descriptor from client-side face-api enrollment
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Profile image file is required" });
  }

  let faceDescriptor;
  try {
    const parsed = JSON.parse(req.body.faceDescriptor);
    if (!Array.isArray(parsed) || parsed.length !== 128) {
      throw new Error("Length mismatch");
    }
    faceDescriptor = parsed;
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid faceDescriptor: must be a JSON array of 128 numbers",
    });
  }

  const user = await authService.uploadProfilePhoto(
    req.user._id,
    req.file.buffer,
    req.file.mimetype,
    faceDescriptor
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        hasFaceDescriptor: user.faceDescriptor.length === 128,
        faceEnrolledAt: user.faceEnrolledAt,
      },
      "Profile photo uploaded and face enrolled successfully",
    ),
  );
});

// Get face descriptor — only for authenticated user, only for pre-interview verification
// The raw 128-float array is NEVER included in /auth/me to avoid unnecessary exposure
const getFaceDescriptor = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.user.faceDescriptor) || req.user.faceDescriptor.length !== 128) {
    return res.status(404).json({
      success: false,
      message: "No face descriptor enrolled. Please upload a profile photo first.",
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { faceDescriptor: req.user.faceDescriptor },
      "Face descriptor retrieved",
    ),
  );
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  getFaceDescriptor,
};
