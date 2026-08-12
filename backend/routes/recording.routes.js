const express = require("express");

const router = express.Router();

// Middleware
const { protect } = require("../middleware/auth.middleware");
const uploadRecording = require("../middleware/recordingUpload.middleware");

// Controller
const {
  createRecording,
  getUserRecordings,
  getRecordingById,
  deleteRecording,
} = require("../controllers/recording.controller");

// Create recording
router.post("/", protect, uploadRecording.single("recording"), createRecording);

// Get current user's recordings
router.get("/", protect, getUserRecordings);

// Get single recording
router.get("/:id", protect, getRecordingById);

// Delete recording
router.delete("/:id", protect, deleteRecording);

module.exports = router;
