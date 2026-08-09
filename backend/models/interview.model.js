const mongoose = require("mongoose");

// Question Schema
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  },
);

// Final Interview Feedback Schema
const finalFeedbackSchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      default: "",
    },

    technicalScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    communicationScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

// Interview Schema
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["technical", "hr", "behavioral", "mixed"],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    numberOfQuestions: {
      type: Number,
      min: 1,
      max: 20,
      default: 5,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["created", "in_progress", "completed", "cancelled"],
      default: "created",
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    // -----------------------------------------
    // Final AI report
    // -----------------------------------------
    finalFeedback: {
      type: finalFeedbackSchema,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Interview", interviewSchema);
