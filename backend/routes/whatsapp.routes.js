const express = require("express");

const {
  verifyWebhook,
  receiveWebhook,
  generateWhatsAppLink,
} = require("../controllers/whatsapp.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Meta WhatsApp webhook
router.get("/webhook", verifyWebhook);
router.post("/webhook", receiveWebhook);

// Authenticated MockMate user
router.post("/link", protect, generateWhatsAppLink);

module.exports = router;
