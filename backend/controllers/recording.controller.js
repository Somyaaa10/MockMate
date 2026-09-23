const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const recordingService = require("../services/recording.service");

// Create Recording
const createRecording = asyncHandler(async (req, res) => {
  const { interviewId, duration } = req.body || {};

  const recording = await recordingService.createRecording({
    userId: req.user._id,
    interviewId,
    file: req.file,
    duration,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, recording, "Recording uploaded successfully"));
});

// Get User Recordings
const getUserRecordings = asyncHandler(async (req, res) => {
  const recordings = await recordingService.getUserRecordings(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, recordings, "Recordings fetched successfully"));
});

// Get Single Recording
const getRecordingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const recording = await recordingService.getRecordingById({
    userId: req.user._id,
    recordingId: id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, recording, "Recording fetched successfully"));
});

// Delete Recording
const deleteRecording = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await recordingService.deleteRecording({
    userId: req.user._id,
    recordingId: id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Recording deleted successfully"));
});

module.exports = {
  createRecording,
  getUserRecordings,
  getRecordingById,
  deleteRecording,
};
