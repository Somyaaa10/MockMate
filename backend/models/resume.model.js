const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    // AI Analysis
    atsScore: {
      type: Number,
      default: null,
    },

    candidateName: {
      type: String,
      default: "",
    },

    candidateEmail: {
      type: String,
      default: "",
    },

    candidatePhone: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    technicalSkills: {
      type: [String],
      default: [],
    },

    softSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    interviewQuestions: {
      type: [String],
      default: [],
    },

    experience: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        duration: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    projects: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        technologies: { type: [String], default: [] },
      },
    ],

    education: [
      {
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        year: { type: String, default: "" },
      },
    ],

    certifications: {
      type: [String],
      default: [],
    },

    recommendedTopics: {
      type: [String],
      default: [],
    },

    recommendedDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Resume", resumeSchema);

