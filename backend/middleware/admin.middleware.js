const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Admin authorization middleware
 * Requires req.user to be established by protect middleware
 */
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied: Admin privileges required");
  }

  next();
});

module.exports = {
  requireAdmin,
};
