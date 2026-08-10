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
const startPeerInterview = async (req, res) => {
  try {
    const { roomCode } = req.body || {};

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Room code is required",
      });
    }

    console.log("🔐 Authenticated user:", req.user);

    const result = await peerInterviewService.startPeerInterview({
      userId: req.user._id,
      roomCode,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Peer interview started successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message,
    });
  }
};

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
const getPeerInterview = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const peerInterview = await peerInterviewService.getPeerInterview({
      userId: req.user._id,
      roomCode,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Peer interview fetched successfully",
      data: peerInterview,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: error.message,
    });
  }
};

const getUserPeerInterviews = async (req, res) => {
  try {
    const interviews = await peerInterviewService.getUserPeerInterviews(
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Peer interviews fetched successfully",
      data: interviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// Export
module.exports = {
  createPeerInterview,
  joinPeerInterview,
  startPeerInterview,
  completePeerInterview,
  getPeerInterview,
  getUserPeerInterviews,
};
