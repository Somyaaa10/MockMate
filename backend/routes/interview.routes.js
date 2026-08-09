const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  createInterview,
  startInterview,
  submitAnswer,
  getInterviewById,
  getUserInterviews,
  getInterviewReport,
} = require("../controllers/interview.controller");

// Create interview
router.post("/", protect, createInterview);

// Get all interviews for logged-in user
router.get("/", protect, getUserInterviews);

// Get interview report
// IMPORTANT: keep this BEFORE /:id
router.get("/:id/report", protect, getInterviewReport);

// Get single interview
router.get("/:id", protect, getInterviewById);

// Start interview
router.post("/:id/start", protect, startInterview);

// Submit answer
router.post("/:id/answer", protect, submitAnswer);

module.exports = router;
