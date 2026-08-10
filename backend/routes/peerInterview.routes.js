const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  createPeerInterview,
  joinPeerInterview,
  startPeerInterview,
  completePeerInterview,
  getPeerInterview,
  getUserPeerInterviews,
} = require("../controllers/peerInterview.controller");

// Create
router.post("/", protect, createPeerInterview);

// Join
router.post("/join", protect, joinPeerInterview);

// Start
router.post("/start", protect, startPeerInterview);

// Complete
router.post("/complete", protect, completePeerInterview);

// History
router.get("/", protect, getUserPeerInterviews);

// Single room
router.get("/:roomCode", protect, getPeerInterview);

module.exports = router;
