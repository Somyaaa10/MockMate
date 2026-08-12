const Recording = require("../models/recording.model");
const PeerInterview = require("../models/peerInterview.model");

// Create recording
const createRecording = async ({ userId, interviewId, file, duration }) => {
  const interview = await PeerInterview.findById(interviewId);

  if (!interview) {
    throw new Error("Interview not found");
  }

  const isParticipant = interview.participants.some(
    (participant) => participant.user.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new Error("You are not a participant of this interview");
  }

  if (interview.status !== "completed") {
    throw new Error("Recording can only be saved after interview completion");
  }

  if (!file) {
    throw new Error("Recording file is required");
  }

  const uploadRecording = require("../utils/uploadRecording");

  const result = await uploadRecording(file.buffer);

  const recording = await Recording.create({
    interview: interviewId,
    user: userId,
    fileUrl: result.secure_url,
    publicId: result.public_id,
    duration: duration || 0,
    fileSize: file.size || 0,
    mimeType: file.mimetype || "video/webm",
    status: "completed",
  });

  return recording;
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
  const recording = await Recording.findById(recordingId).populate(
    "interview",
    "roomCode title status",
  );

  if (!recording) {
    throw new Error("Recording not found");
  }

  if (recording.user.toString() !== userId.toString()) {
    throw new Error("You are not authorized to access this recording");
  }

  return recording;
};

// Delete recording
const deleteRecording = async ({ userId, recordingId }) => {
  const recording = await Recording.findById(recordingId);

  if (!recording) {
    throw new Error("Recording not found");
  }

  if (recording.user.toString() !== userId.toString()) {
    throw new Error("You are not authorized to delete this recording");
  }

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
