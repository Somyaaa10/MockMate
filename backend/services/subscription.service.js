const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const Subscription = require("../models/subscription.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const { setCache, getCache, deleteCache } = require("./redis.service");

// Create a Razorpay subscription
const createSubscription = async (userId) => {
  const cacheKey = `subscription:${userId}`;

  try {
    // ------------------------------------
    // 1. Check MongoDB for existing subscription
    // ------------------------------------
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: {
        $in: ["created", "authenticated", "active", "pending"],
      },
    });

    if (existingSubscription) {
      // Keep Redis cache synchronized
      await setCache(cacheKey, existingSubscription, 3600);

      return existingSubscription;
    }

    // ------------------------------------
    // 2. Validate Razorpay configuration
    // ------------------------------------
    if (!process.env.RAZORPAY_PLAN_ID) {
      throw new Error("RAZORPAY_PLAN_ID is not configured");
    }

    // ------------------------------------
    // 3. Create Razorpay subscription
    // ------------------------------------
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: Number(process.env.RAZORPAY_TOTAL_COUNT || 12),
      customer_notify: 1,
    });

    // ------------------------------------
    // 4. Save subscription in MongoDB
    // ------------------------------------
    const subscription = await Subscription.create({
      user: userId,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayPlanId: razorpaySubscription.plan_id,
      status: razorpaySubscription.status,
      totalCount: razorpaySubscription.total_count,
      paidCount: razorpaySubscription.paid_count,
      remainingCount: razorpaySubscription.remaining_count,
    });

    // ------------------------------------
    // 5. Cache subscription in Redis
    // ------------------------------------
    await setCache(cacheKey, subscription, 3600);

    return subscription;
  } catch (error) {
    console.error("❌ Subscription creation failed:", {
      status: error.statusCode || error.status,
      message: error.message,
      razorpayError: error.error,
    });

    throw error;
  }
};

// Get user's subscription
const getUserSubscription = async (userId) => {
  const cacheKey = `subscription:${userId}`;

  // 1. Check Redis
  const cachedSubscription = await getCache(cacheKey);

  if (cachedSubscription) {
    console.log("⚡ Subscription returned from Redis");
    return cachedSubscription;
  }

  // 2. Redis miss → MongoDB
  console.log("🗄️ Subscription fetched from MongoDB");

  const subscription = await Subscription.findOne({
    user: userId,
  });

  // 3. Store MongoDB result in Redis
  if (subscription) {
    await setCache(cacheKey, subscription, 3600);
  }

  return subscription;
};

// Verify Razorpay subscription payment
const verifyPayment = async ({
  userId,
  razorpayPaymentId,
  razorpaySubscriptionId,
  razorpaySignature,
}) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
    throw new ApiError(400, "Payment verification details are required");
  }

  const body = `${razorpayPaymentId}|${razorpaySubscriptionId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const suppliedBuffer = Buffer.from(String(razorpaySignature), "utf8");

  // Prevent crypto.timingSafeEqual from throwing TypeError when buffer lengths differ
  if (expectedBuffer.length !== suppliedBuffer.length) {
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!isValid) {
    throw new ApiError(400, "Invalid Razorpay payment signature");
  }

  // Ensure subscription belongs to the authenticated user and update status
  const subscription = await Subscription.findOneAndUpdate(
    {
      razorpaySubscriptionId,
      user: userId,
    },
    {
      status: "active",
    },
    {
      new: true,
    },
  );

  if (!subscription) {
    throw new ApiError(404, "Subscription not found for this user");
  }

  // Synchronize user premium status in MongoDB
  await User.findByIdAndUpdate(userId, { isPremium: true }, { new: true });

  // Synchronize Redis cache
  const cacheKey = `subscription:${userId}`;
  await setCache(cacheKey, subscription, 3600);

  return subscription;
};

// Cancel Razorpay subscription
const cancelSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    user: userId,
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const cancelledSubscription = await razorpay.subscriptions.cancel(
    subscription.razorpaySubscriptionId,
  );

  subscription.status = cancelledSubscription.status;
  subscription.endedAt = cancelledSubscription.ended_at
    ? new Date(cancelledSubscription.ended_at * 1000)
    : new Date();

  await subscription.save();

  return subscription;
};

// Handle Razorpay subscription webhook events
const handleRazorpayWebhook = async ({ rawBody, signature, eventPayload }) => {
  if (!signature) {
    throw new ApiError(400, "Razorpay webhook signature header is missing");
  }

  // Ensure rawBody is a Buffer or String for signature calculation
  let bodyToVerify = rawBody;
  if (!bodyToVerify) {
    if (eventPayload && Object.keys(eventPayload).length > 0) {
      bodyToVerify = JSON.stringify(eventPayload);
    } else {
      throw new ApiError(400, "Webhook request body is missing");
    }
  }

  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (!webhookSecret) {
    throw new ApiError(500, "Razorpay webhook secret is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyToVerify)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const suppliedBuffer = Buffer.from(String(signature), "utf8");

  // Prevent crypto.timingSafeEqual from throwing TypeError on length mismatch
  if (expectedBuffer.length !== suppliedBuffer.length) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!isValid) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  // Signature valid -> parse event payload
  let payload = eventPayload;
  if (!payload || typeof payload !== "object") {
    try {
      payload = JSON.parse(
        Buffer.isBuffer(bodyToVerify)
          ? bodyToVerify.toString("utf8")
          : String(bodyToVerify),
      );
    } catch (parseError) {
      throw new ApiError(400, "Invalid JSON payload in webhook body");
    }
  }

  const eventName = payload?.event;
  const subEntity = payload?.payload?.subscription?.entity;

  if (!subEntity || !subEntity.id) {
    console.log(`ℹ️ Razorpay webhook event received: ${eventName || "unknown"}`);
    return {
      acknowledged: true,
      event: eventName,
      message: "Webhook event acknowledged (no subscription entity)",
    };
  }

  const razorpaySubscriptionId = subEntity.id;

  // Find MockMate subscription
  const subscription = await Subscription.findOne({ razorpaySubscriptionId });

  if (!subscription) {
    console.log(
      `⚠️ Razorpay webhook for unknown subscription ID: ${razorpaySubscriptionId}`,
    );
    return {
      acknowledged: true,
      event: eventName,
      razorpaySubscriptionId,
      message: "Webhook event acknowledged (subscription not found)",
    };
  }

  const userId = subscription.user;

  // Determine subscription and user premium status based on Razorpay event
  let newSubStatus = subscription.status;
  let newIsPremium = null;

  switch (eventName) {
    case "subscription.authenticated":
      newSubStatus = "authenticated";
      newIsPremium = false;
      break;

    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      newSubStatus = "active";
      newIsPremium = true;
      break;

    case "subscription.completed":
      newSubStatus = "completed";
      newIsPremium = false;
      break;

    case "subscription.cancelled":
      newSubStatus = "cancelled";
      newIsPremium = false;
      break;

    case "subscription.halted":
      newSubStatus = "halted";
      newIsPremium = false;
      break;

    case "subscription.paused":
      newSubStatus = "pending";
      newIsPremium = false;
      break;

    default:
      console.log(`ℹ️ Razorpay webhook event unhandled: ${eventName}`);
      return {
        acknowledged: true,
        event: eventName,
        razorpaySubscriptionId,
        message: "Webhook event acknowledged (unhandled event type)",
      };
  }

  // Idempotent field updates using absolute counts & dates from payload entity
  subscription.status = newSubStatus;

  if (typeof subEntity.paid_count === "number") {
    subscription.paidCount = subEntity.paid_count;
  }
  if (typeof subEntity.remaining_count === "number") {
    subscription.remainingCount = subEntity.remaining_count;
  }
  if (typeof subEntity.total_count === "number") {
    subscription.totalCount = subEntity.total_count;
  }
  if (subEntity.current_start) {
    subscription.currentStart = new Date(subEntity.current_start * 1000);
  }
  if (subEntity.current_end) {
    subscription.currentEnd = new Date(subEntity.current_end * 1000);
  }
  if (subEntity.ended_at) {
    subscription.endedAt = new Date(subEntity.ended_at * 1000);
  }

  await subscription.save();

  // Synchronize User.isPremium
  if (newIsPremium !== null) {
    await User.findByIdAndUpdate(userId, { isPremium: newIsPremium }, { new: true });
  }

  // Synchronize Redis Cache
  const cacheKey = `subscription:${userId}`;
  await setCache(cacheKey, subscription, 3600);

  return {
    acknowledged: true,
    event: eventName,
    razorpaySubscriptionId,
    status: newSubStatus,
    isPremium: newIsPremium,
  };
};

module.exports = {
  createSubscription,
  getUserSubscription,
  verifyPayment,
  cancelSubscription,
  handleRazorpayWebhook,
};
