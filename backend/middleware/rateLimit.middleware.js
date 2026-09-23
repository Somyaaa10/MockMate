const { rateLimit } = require("express-rate-limit");

// Rate limiter for authentication endpoints (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    });
  },
});

// Rate limiter for expensive Gemini AI endpoints (resume analysis, interview generation, answer evaluation)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // Limit each IP to 15 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  statusCode: 429,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many AI processing requests. Please try again after 15 minutes.",
    });
  },
});

module.exports = {
  authLimiter,
  aiLimiter,
};
