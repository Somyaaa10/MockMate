const Razorpay = require("razorpay");

const key_id = (process.env.RAZORPAY_KEY_ID || "rzp_test_TPjI4mKbp7temR").trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || "KsrDQ3NwRDeNpeTqafbq58CK").trim();

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

module.exports = razorpay;
