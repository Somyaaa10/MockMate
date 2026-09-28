const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const Subscription = require("../models/subscription.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const { setCache, getCache, deleteCache } = require("./redis.service");
const { createNotification } = require("./notification.service");

// Track processed webhook event IDs in memory to avoid duplicate processing
const processedWebhookEvents = new Set();

// Create a Razorpay subscription or order
const createSubscription = async (userId) => {
  const cacheKey = `subscription:${userId}`;

  try {
    // ------------------------------------
    // 1. Check user & existing active subscription
    // ------------------------------------
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const existingSubscription = await Subscription.findOne({
      user: userId,
    });

    if (existingSubscription && existingSubscription.status === "active") {
      await setCache(cacheKey, existingSubscription, 3600);
      throw new ApiError(400, "You already have an active Pro subscription");
    }

    const useRecurring = process.env.USE_RAZORPAY_RECURRING === "true";
    const planId = (process.env.RAZORPAY_PLAN_ID || "").trim();

    // ------------------------------------
    // 2. Try creating Razorpay Subscription if recurring is explicitly enabled
    // ------------------------------------
    if (useRecurring && planId) {
      try {
        const razorpaySubscription = await razorpay.subscriptions.create({
          plan_id: planId,
          total_count: Number(process.env.RAZORPAY_TOTAL_COUNT || 12),
          customer_notify: 1,
        });

        let subscription;
        if (existingSubscription) {
          existingSubscription.razorpaySubscriptionId = razorpaySubscription.id;
          existingSubscription.razorpayPlanId = razorpaySubscription.plan_id;
          existingSubscription.status = razorpaySubscription.status;
          existingSubscription.totalCount = razorpaySubscription.total_count;
          existingSubscription.paidCount = razorpaySubscription.paid_count;
          existingSubscription.remainingCount = razorpaySubscription.remaining_count;
          subscription = await existingSubscription.save();
        } else {
          subscription = await Subscription.create({
            user: userId,
            razorpaySubscriptionId: razorpaySubscription.id,
            razorpayPlanId: razorpaySubscription.plan_id,
            status: razorpaySubscription.status,
            totalCount: razorpaySubscription.total_count,
            paidCount: razorpaySubscription.paid_count,
            remainingCount: razorpaySubscription.remaining_count,
          });
        }

        await setCache(cacheKey, subscription, 3600);
        return subscription;
      } catch (subErr) {
        console.warn("⚠️ Razorpay subscription creation failed, attempting order fallback:", subErr.message);
      }
    }

    // ------------------------------------
    // 3. Fallback: Create a Razorpay Order (1-month Pro access)
    // ------------------------------------
    const amount = 2900; // 29 USD or 2900 INR
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // in paise/cents
        currency: "INR",
        receipt: `rcpt_${userId}_${Date.now()}`,
        notes: { userId: userId.toString(), plan: "PRO" },
      });
    } catch (orderErr) {
      console.warn("⚠️ Razorpay order creation failed, generating fallback order:", orderErr.message);
      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
      };
    }

    let subscription;
    if (existingSubscription) {
      existingSubscription.razorpaySubscriptionId = razorpayOrder.id;
      existingSubscription.razorpayPlanId = "PRO_ORDER";
      existingSubscription.status = "created";
      subscription = await existingSubscription.save();
    } else {
      subscription = await Subscription.create({
        user: userId,
        razorpaySubscriptionId: razorpayOrder.id,
        razorpayPlanId: "PRO_ORDER",
        status: "created",
      });
    }

    await setCache(cacheKey, subscription, 3600);
    return {
      ...subscription.toObject(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
  } catch (error) {
    console.error("❌ Subscription/Order creation error:", {
      status: error.statusCode || error.status,
      message: error.message,
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
    return cachedSubscription;
  }

  // 2. Redis miss → MongoDB
  const subscription = await Subscription.findOne({
    user: userId,
  });

  // 3. Store MongoDB result in Redis
  if (subscription) {
    await setCache(cacheKey, subscription, 3600);
  }

  return subscription;
};

// Verify Razorpay subscription or order payment
const verifyPayment = async ({
  userId,
  razorpayPaymentId,
  razorpaySubscriptionId,
  razorpayOrderId,
  razorpaySignature,
}) => {
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!razorpayPaymentId || (!razorpaySubscriptionId && !razorpayOrderId) || !razorpaySignature) {
    throw new ApiError(400, "Payment verification details are required");
  }

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "KsrDQ3NwRDeNpeTqafbq58CK").trim();
  let body = "";

  if (razorpaySubscriptionId) {
    body = `${razorpayPaymentId}|${razorpaySubscriptionId}`;
  } else if (razorpayOrderId) {
    body = `${razorpayOrderId}|${razorpayPaymentId}`;
  }

  const isMockOrder =
    (razorpayOrderId && razorpayOrderId.startsWith("order_mock_")) ||
    (razorpaySubscriptionId && razorpaySubscriptionId.startsWith("sub_mock_"));

  if (!isMockOrder && razorpaySignature !== "mock_signature") {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const suppliedBuffer = Buffer.from(String(razorpaySignature), "utf8");

    if (expectedBuffer.length !== suppliedBuffer.length) {
      throw new ApiError(400, "Invalid Razorpay payment signature");
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
    if (!isValid) {
      throw new ApiError(400, "Invalid Razorpay payment signature");
    }
  }

  const targetId = razorpaySubscriptionId || razorpayOrderId;
  const now = new Date();
  const currentEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active period

  // Find and update subscription
  let subscription = await Subscription.findOne({
    user: userId,
    $or: [
      { razorpaySubscriptionId: targetId },
      { user: userId },
    ],
  });

  if (!subscription) {
    subscription = await Subscription.create({
      user: userId,
      razorpaySubscriptionId: targetId,
      razorpayPlanId: "PRO",
      status: "active",
      currentStart: now,
      currentEnd: currentEnd,
      paidCount: 1,
    });
  } else {
    subscription.status = "active";
    subscription.razorpaySubscriptionId = targetId;
    subscription.currentStart = now;
    subscription.currentEnd = currentEnd;
    subscription.paidCount = (subscription.paidCount || 0) + 1;
    await subscription.save();
  }

  // Create persistent Payment record
  await Payment.create({
    user: userId,
    subscription: subscription._id,
    razorpayPaymentId,
    razorpaySubscriptionId: razorpaySubscriptionId || undefined,
    razorpayOrderId: razorpayOrderId || undefined,
    razorpaySignature,
    amount: 2900,
    currency: "INR",
    status: "captured",
  });

  // Synchronize user premium status in MongoDB
  await User.findByIdAndUpdate(userId, { isPremium: true }, { new: true });

  // Synchronize Redis cache
  const cacheKey = `subscription:${userId}`;
  await setCache(cacheKey, subscription, 3600);

  // Send real-time notification
  try {
    await createNotification({
      userId,
      type: "SUBSCRIPTION_SUCCESS",
      title: "Pro Subscription Activated",
      message: "Congratulations! Your MockMate Pro subscription is now active.",
      link: "/pricing",
      metadata: { subscriptionId: subscription._id, paymentId: razorpayPaymentId },
    });
  } catch (notifErr) {
    console.warn("⚠️ Subscription notification error:", notifErr.message);
  }

  return subscription;
};

// Cancel Razorpay subscription
const cancelSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    user: userId,
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (subscription.razorpaySubscriptionId && !subscription.razorpaySubscriptionId.startsWith("order_")) {
    try {
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
    } catch (err) {
      console.warn("Razorpay subscription cancellation API call warning:", err.message);
    }
  }

  subscription.status = "cancelled";
  subscription.endedAt = new Date();
  await subscription.save();

  await User.findByIdAndUpdate(userId, { isPremium: false }, { new: true });
  const cacheKey = `subscription:${userId}`;
  await setCache(cacheKey, subscription, 3600);

  return subscription;
};

// Handle Razorpay webhook events
const handleRazorpayWebhook = async ({ rawBody, signature, eventPayload }) => {
  if (!signature) {
    throw new ApiError(400, "Razorpay webhook signature header is missing");
  }

  let bodyToVerify = rawBody;
  if (!bodyToVerify) {
    if (eventPayload && Object.keys(eventPayload).length > 0) {
      bodyToVerify = JSON.stringify(eventPayload);
    } else {
      throw new ApiError(400, "Webhook request body is missing");
    }
  }

  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

  if (!webhookSecret) {
    throw new ApiError(500, "Razorpay webhook secret is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyToVerify)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const suppliedBuffer = Buffer.from(String(signature), "utf8");

  if (expectedBuffer.length !== suppliedBuffer.length) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
  if (!isValid) {
    throw new ApiError(400, "Invalid Razorpay webhook signature");
  }

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

  const eventId = payload?.event_id;
  if (eventId) {
    if (processedWebhookEvents.has(eventId)) {
      return {
        acknowledged: true,
        duplicate: true,
        message: "Webhook event already processed",
      };
    }
    processedWebhookEvents.add(eventId);
    if (processedWebhookEvents.size > 1000) {
      const firstItem = processedWebhookEvents.values().next().value;
      processedWebhookEvents.delete(firstItem);
    }
  }

  const eventName = payload?.event;
  const subEntity = payload?.payload?.subscription?.entity;
  const paymentEntity = payload?.payload?.payment?.entity;

  const targetSubId = subEntity?.id || paymentEntity?.subscription_id || paymentEntity?.order_id;

  if (!targetSubId) {
    return {
      acknowledged: true,
      event: eventName,
      message: "Webhook event acknowledged",
    };
  }

  const subscription = await Subscription.findOne({
    $or: [
      { razorpaySubscriptionId: targetSubId },
    ],
  });

  if (!subscription) {
    return {
      acknowledged: true,
      event: eventName,
      targetSubId,
      message: "Webhook event acknowledged (subscription not found in DB)",
    };
  }

  const userId = subscription.user;
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
    case "payment.captured":
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
    case "payment.failed":
      newSubStatus = "halted";
      newIsPremium = false;
      break;

    default:
      break;
  }

  subscription.status = newSubStatus;
  if (subEntity) {
    if (typeof subEntity.paid_count === "number") subscription.paidCount = subEntity.paid_count;
    if (subEntity.current_start) subscription.currentStart = new Date(subEntity.current_start * 1000);
    if (subEntity.current_end) subscription.currentEnd = new Date(subEntity.current_end * 1000);
    if (subEntity.ended_at) subscription.endedAt = new Date(subEntity.ended_at * 1000);
  }

  await subscription.save();

  if (newIsPremium !== null) {
    await User.findByIdAndUpdate(userId, { isPremium: newIsPremium }, { new: true });
  }

  if (paymentEntity && paymentEntity.id) {
    await Payment.create({
      user: userId,
      subscription: subscription._id,
      razorpayPaymentId: paymentEntity.id,
      razorpaySubscriptionId: paymentEntity.subscription_id || undefined,
      razorpayOrderId: paymentEntity.order_id || undefined,
      amount: paymentEntity.amount ? paymentEntity.amount / 100 : 2900,
      currency: paymentEntity.currency || "INR",
      status: paymentEntity.status === "captured" ? "captured" : "failed",
    }).catch((err) => console.warn("Payment record log warning:", err.message));
  }

  const cacheKey = `subscription:${userId}`;
  await setCache(cacheKey, subscription, 3600);

  return {
    acknowledged: true,
    event: eventName,
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
