const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const resumeService = require("../services/resume.service");

const analyzeResume = asyncHandler(async (req, res) => {
  const result = await resumeService.analyzeResume(
    req.params.resumeId,
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Resume analyzed successfully"));
});

module.exports = {
  analyzeResume,
};
