const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "INTERVIEW_COMPLETED",
        "INTERVIEW_REMINDER",
        "INTERVIEW_REPORT_READY",
        "SUBSCRIPTION_SUCCESS",
        "SUBSCRIPTION_EXPIRING",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "PEER_INTERVIEW_INVITE",
        "PEER_INTERVIEW_STARTED",
        "PEER_INTERVIEW_COMPLETED",
        "RESUME_ANALYSIS_COMPLETED",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user pagination and unread counts
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
