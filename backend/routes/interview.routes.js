const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  createInterview,
  startInterview,
  submitAnswer,
  getInterviewById,
  getUserInterviews,
} = require("../controllers/interview.controller");

// Create interview
router.post("/", protect, createInterview);

// Start interview
router.post("/:id/start", protect, startInterview);

// Submit answer
router.post("/:id/answer", protect, submitAnswer);

// Get all interviews for logged-in user
router.get("/", protect, getUserInterviews);

// Get single interview
router.get("/:id", protect, getInterviewById);

module.exports = router;
