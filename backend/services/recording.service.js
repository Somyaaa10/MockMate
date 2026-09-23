const mongoose = require("mongoose");
const Recording = require("../models/recording.model");
const PeerInterview = require("../models/peerInterview.model");
const cloudinary = require("../config/cloudinary");
const uploadRecording = require("../utils/uploadRecording");
const ApiError = require("../utils/ApiError");

// Create recording
const createRecording = async ({ userId, interviewId, file, duration }) => {
  if (!file) {
    throw new ApiError(400, "Recording file is required");
  }

  if (!interviewId || !mongoose.Types.ObjectId.isValid(interviewId)) {
    throw new ApiError(400, "Valid interview ID is required");
  }

  const interview = await PeerInterview.findById(interviewId);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const isParticipant = interview.participants.some(
    (participant) => participant.user.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this interview");
  }

  if (interview.status === "cancelled") {
    throw new ApiError(400, "Cannot save recording for a cancelled interview");
  }

  // Upload WebM file buffer to Cloudinary
  const result = await uploadRecording(file.buffer);

  try {
    const recording = await Recording.create({
      interview: interviewId,
      user: userId,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      duration: duration ? Number(duration) : 0,
      fileSize: file.size || file.buffer?.length || 0,
      mimeType: file.mimetype || "video/webm",
      status: "completed",
    });

    return recording;
  } catch (dbError) {
    // Cleanup Cloudinary asset if MongoDB document creation fails
    if (result && result.public_id) {
      try {
        await cloudinary.uploader.destroy(result.public_id, {
          resource_type: "video",
        });
      } catch (cleanupError) {
        console.error("⚠️ Failed to cleanup Cloudinary asset:", cleanupError.message);
      }
    }
    throw dbError;
  }
};

// Get user's recordings
const getUserRecordings = async (userId) => {
  return await Recording.find({
    user: userId,
  })
    .populate("interview", "roomCode title status")
    .sort({ createdAt: -1 });
};

// Get single recording
const getRecordingById = async ({ userId, recordingId }) => {
  if (!recordingId || !mongoose.Types.ObjectId.isValid(recordingId)) {
    throw new ApiError(400, "Valid recording ID is required");
  }

  const recording = await Recording.findById(recordingId).populate(
    "interview",
    "roomCode title status",
  );

  if (!recording) {
    throw new ApiError(404, "Recording not found");
  }

  if (recording.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this recording");
  }

  return recording;
};

// Delete recording
const deleteRecording = async ({ userId, recordingId }) => {
  if (!recordingId || !mongoose.Types.ObjectId.isValid(recordingId)) {
    throw new ApiError(400, "Valid recording ID is required");
  }

  const recording = await Recording.findById(recordingId);

  if (!recording) {
    throw new ApiError(404, "Recording not found");
  }

  if (recording.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this recording");
  }

  // Delete Cloudinary video asset
  if (recording.publicId) {
    try {
      await cloudinary.uploader.destroy(recording.publicId, {
        resource_type: "video",
      });
      console.log(`☁️ Cloudinary video asset deleted: ${recording.publicId}`);
    } catch (cloudinaryError) {
      console.error(
        "⚠️ Cloudinary asset deletion error:",
        cloudinaryError.message,
      );
    }
  }

  // Delete document from MongoDB
  await recording.deleteOne();

  return {
    recordingId,
    deleted: true,
  };
};

module.exports = {
  createRecording,
  getUserRecordings,
  getRecordingById,
  deleteRecording,
};
