const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const interviewService = require("../services/interview.service");

const createInterview = asyncHandler(async (req, res) => {
  const { resumeId, interviewType, difficulty, numberOfQuestions } = req.body;

  if (!resumeId) {
    throw new Error("resumeId is required");
  }

  const interview = await interviewService.createInterview({
    userId: req.user._id,
    resumeId,
    interviewType,
    difficulty,
    numberOfQuestions,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, interview, "Interview created successfully"));
});

const startInterview = asyncHandler(async (req, res) => {
  const result = await interviewService.startInterview(
    req.params.id,
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Interview started successfully"));
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;

  if (!answer) {
    throw new Error("Answer is required");
  }

  const result = await interviewService.submitAnswer({
    interviewId: req.params.id,
    userId: req.user._id,
    answer,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.completed
          ? "Interview completed successfully"
          : "Answer evaluated successfully",
      ),
    );
});

const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await interviewService.getInterviewById(
    req.params.id,
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview fetched successfully"));
});

const getUserInterviews = asyncHandler(async (req, res) => {
  const interviews = await interviewService.getUserInterviews(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, interviews, "Interviews fetched successfully"));
});
module.exports = {
  createInterview,
  startInterview,
  submitAnswer,
  getInterviewById,
  getUserInterviews,
};
