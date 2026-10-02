const { rateLimit } = require("express-rate-limit");

// Rate limiter for authentication endpoints (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  statusCode: 429,
  skip: () => process.env.NODE_ENV === "test",
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
  skip: () => process.env.NODE_ENV === "test",
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many AI processing requests. Please try again after 15 minutes.",
    });
  },
});

// Rate limiter for forgot-password endpoint (prevents email spam / SMTP abuse)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  statusCode: 429,
  skip: () => process.env.NODE_ENV === "test",
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many password reset requests. Please try again after 15 minutes.",
    });
  },
});

// Rate limiter for reset-password endpoint (prevents token brute-force attempts)
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  statusCode: 429,
  skip: () => process.env.NODE_ENV === "test",
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many password reset attempts. Please try again after 15 minutes.",
    });
  },
});

module.exports = {
  authLimiter,
  aiLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};

