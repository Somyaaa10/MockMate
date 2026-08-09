const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");

const {
  createPeerInterview,
  joinPeerInterview,
  startPeerInterview,
  completePeerInterview,
  getPeerInterview,
} = require("../controllers/peerInterview.controller");

// Create peer interview room
router.post("/", protect, createPeerInterview);

// Join peer interview room
router.post("/join", protect, joinPeerInterview);

router.get("/:roomCode", protect, getPeerInterview);

module.exports = router;
