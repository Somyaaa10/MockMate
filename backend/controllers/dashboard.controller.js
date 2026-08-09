const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const dashboardService = require("../services/dashboard.service");

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, dashboard, "Dashboard fetched successfully"));
});

module.exports = {
  getDashboard,
};
