const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtErr) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;

  next();
});

module.exports = {
  protect,
};
