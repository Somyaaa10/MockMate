const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayPlanId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "pending",
        "halted",
        "cancelled",
        "completed",
        "expired",
      ],
      default: "created",
    },

    currentStart: {
      type: Date,
    },

    currentEnd: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },

    totalCount: {
      type: Number,
    },

    paidCount: {
      type: Number,
      default: 0,
    },

    remainingCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
