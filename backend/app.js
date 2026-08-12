const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const resumeRoutes = require("./routes/resume.routes");
const aiRoutes = require("./routes/ai.routes");
const interviewRoutes = require("./routes/interview.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const peerInterviewRoutes = require("./routes/peerInterview.routes");
const recordingRoutes = require("./routes/recording.routes");

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser());

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/peer-interviews", peerInterviewRoutes);
app.use("/api/v1/recordings", recordingRoutes);

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MockMate Backend Running Successfully",
  });
});

module.exports = app;
