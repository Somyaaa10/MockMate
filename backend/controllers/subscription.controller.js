const asyncHandler = require("../utils/asyncHandler");

const {
  createSubscription,
  getUserSubscription,
  verifyPayment,
  cancelSubscription,
  handleRazorpayWebhook,
} = require("../services/subscription.service");

// Create subscription / order
const createSubscriptionController = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const subscription = await createSubscription(userId);

  res.status(201).json({
    success: true,
    message: "Subscription created successfully",
    data: subscription,
  });
});

// Get current user's subscription
const getSubscriptionController = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const subscription = await getUserSubscription(userId);

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

// Verify Razorpay payment
const verifyPaymentController = asyncHandler(async (req, res) => {
  const { razorpayPaymentId, razorpaySubscriptionId, razorpayOrderId, razorpaySignature } =
    req.body || {};

  if (!razorpayPaymentId || (!razorpaySubscriptionId && !razorpayOrderId) || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification details are required",
    });
  }

  const subscription = await verifyPayment({
    userId: req.user._id || req.user.id,
    razorpayPaymentId,
    razorpaySubscriptionId,
    razorpayOrderId,
    razorpaySignature,
  });

  res.status(200).json({
    success: true,
    message: "Payment verified and subscription activated successfully",
    data: subscription,
  });
});

// Cancel subscription
const cancelSubscriptionController = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const subscription = await cancelSubscription(userId);

  res.status(200).json({
    success: true,
    message: "Subscription cancelled successfully",
    data: subscription,
  });
});

// Razorpay Webhook Listener
const razorpayWebhookController = asyncHandler(async (req, res) => {
  const signature =
    req.headers["x-razorpay-signature"] || req.headers["X-Razorpay-Signature"];

  const result = await handleRazorpayWebhook({
    rawBody: req.rawBody,
    signature,
    eventPayload: req.body,
  });

  return res.status(200).json({
    success: true,
    message: result.message || "Webhook processed successfully",
    data: result,
  });
});

module.exports = {
  createSubscriptionController,
  getSubscriptionController,
  verifyPaymentController,
  cancelSubscriptionController,
  razorpayWebhookController,
};
