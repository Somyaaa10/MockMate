const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const recordingService = require("../services/recording.service");

// Create Recording
const cloudinary = require("../config/cloudinary");
const Recording = require("../models/recording.model");

const createRecording = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Recording file is required",
    });
  }

  const { interviewId, duration } = req.body;

  if (!interviewId) {
    return res.status(400).json({
      success: false,
      message: "Interview ID is required",
    });
  }

  try {
    // Upload WebM file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "mockmate/recordings",
          public_id: `recording-${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    console.log("☁️ Cloudinary upload successful");
    console.log("Recording URL:", uploadResult.secure_url);

    // Save recording metadata
    const recording = await Recording.create({
      user: req.user._id,
      interview: interviewId,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      duration: duration ? Number(duration) : 0,
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Recording created successfully",
      data: recording,
    });
  } catch (error) {
    console.error("❌ Recording upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload recording",
      error: error.message,
    });
  }
};

module.exports = {
  createRecording,
};

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
