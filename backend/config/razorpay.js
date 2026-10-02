const Razorpay = require("razorpay");

const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

if (!key_id || !key_secret) {
  console.warn(
    "⚠️ Razorpay API credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not set in environment variables."
  );
}

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

module.exports = razorpay;
