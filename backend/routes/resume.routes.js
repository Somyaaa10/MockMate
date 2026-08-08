const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
} = require("../controllers/resume.controller");

// Upload Resume
router.post("/upload", protect, upload.single("resume"), uploadResume);

// Get all user's resumes
router.get("/", protect, getUserResumes);

// Get single resume
router.get("/:id", protect, getResumeById);

// Delete resume
router.delete("/:id", protect, deleteResume);

module.exports = router;
