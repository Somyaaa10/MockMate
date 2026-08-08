const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const resumeService = require("../services/resume.service");

// Resume upload controller
const uploadResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.uploadResume({
    userId: req.user._id,
    file: req.file,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, resume, "Resume uploaded successfully"));
});

// get all resume controller
const getUserResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getUserResumes(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, resumes, "Resumes fetched successfully"));
});

// get single resume controller
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, resume, "Resume fetched successfully"));
});

// Resume Delete controlller
const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Resume deleted successfully"));
});

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
};
