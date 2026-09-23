const express = require("express");

const {
  createSubscriptionController,
  getSubscriptionController,
  verifyPaymentController,
  cancelSubscriptionController,
  razorpayWebhookController,
} = require("../controllers/subscription.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Razorpay Webhook endpoint (authenticated via HMAC signature, not JWT)
router.post("/webhook", razorpayWebhookController);

router.post("/create", protect, createSubscriptionController);

router.get("/", protect, getSubscriptionController);

router.post("/verify", protect, verifyPaymentController);

router.post("/cancel", protect, cancelSubscriptionController);

module.exports = router;
