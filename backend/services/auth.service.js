const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");

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

module.exports = {
  registerUser,
  loginUser,
};
