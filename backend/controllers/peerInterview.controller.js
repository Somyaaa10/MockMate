const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const peerInterviewService = require("../services/peerInterview.service");

// Create Peer Interview
const createPeerInterview = asyncHandler(async (req, res) => {
  const { title, interviewType, difficulty } = req.body;

  const result = await peerInterviewService.createPeerInterview({
    userId: req.user._id,
    title,
    interviewType,
    difficulty,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, result, "Peer interview room created successfully"),
    );
});

// Join Peer Interview
const joinPeerInterview = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    throw new Error("Room code is required");
  }

  const result = await peerInterviewService.joinPeerInterview({
    userId: req.user._id,
    roomCode,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Joined peer interview successfully"));
});

// Start Peer Interview
const startPeerInterview = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    throw new Error("Room code is required");
  }

  const result = await peerInterviewService.startPeerInterview({
    userId: req.user._id,
    roomCode,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Peer interview started successfully"));
});

// Complete Peer Interview
const completePeerInterview = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    throw new Error("Room code is required");
  }

  const result = await peerInterviewService.completePeerInterview({
    userId: req.user._id,
    roomCode,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Peer interview completed successfully"),
    );
});

// Get Peer Interview
const getPeerInterview = asyncHandler(async (req, res) => {
  const { roomCode } = req.params;

  if (!roomCode) {
    throw new Error("Room code is required");
  }

  const result = await peerInterviewService.getPeerInterview({
    userId: req.user._id,
    roomCode,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Peer interview fetched successfully"));
});

// Export
module.exports = {
  createPeerInterview,
  joinPeerInterview,
  startPeerInterview,
  completePeerInterview,
  getPeerInterview,
};
