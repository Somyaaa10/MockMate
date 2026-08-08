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
        profileImage: req.user.profileImage,
        isPremium: req.user.isPremium,
        isVerified: req.user.isVerified,
      },
      "User profile fetched successfully",
    ),
  );
});

module.exports = {
  register,
  login,
  getMe,
};
