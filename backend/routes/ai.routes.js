const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { aiLimiter } = require("../middleware/rateLimit.middleware");
const { analyzeResume } = require("../controllers/ai.controller");

router.post("/resume/analyze/:resumeId", protect, aiLimiter, analyzeResume);

module.exports = router;
