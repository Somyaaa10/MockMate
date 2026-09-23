const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const Interview = require("../models/interview.model");
const ApiError = require("../utils/ApiError");
const PLANS = require("../constants/plans");

/**
 * Get user quota information dynamically based on MongoDB data
 */
const getUserQuota = async (userId) => {
  const [user, activeSub, usedInterviewsCount] = await Promise.all([
    User.findById(userId).select("isPremium role"),
    Subscription.findOne({
      user: userId,
      status: "active",
    }),
    Interview.countDocuments({ user: userId }),
  ]);

  const isPro = Boolean(user?.isPremium || activeSub);
  const planConfig = isPro ? PLANS.PRO : PLANS.FREE;

  const used = usedInterviewsCount;
  const limit = planConfig.interviewLimit;
  const remaining = Math.max(0, limit - used);
  const quotaExceeded = used >= limit;

  return {
    plan: planConfig.name,
    isPremium: isPro,
    aiInterviewsUsed: used,
    aiInterviewsLimit: limit,
    aiInterviewsRemaining: remaining,
    quotaExceeded,
  };
};

/**
 * Check if the user has remaining interview quota. Throws HTTP 403 if exhausted.
 */
const checkAIInterviewQuota = async (userId) => {
  const quota = await getUserQuota(userId);

  if (quota.quotaExceeded) {
    throw new ApiError(
      403,
      `You have used all ${quota.aiInterviewsLimit} ${quota.plan === "FREE" ? "free " : ""}AI interviews. Upgrade your plan to continue.`,
      "INTERVIEW_LIMIT_REACHED",
    );
  }

  return quota;
};

module.exports = {
  getUserQuota,
  checkAIInterviewQuota,
};
