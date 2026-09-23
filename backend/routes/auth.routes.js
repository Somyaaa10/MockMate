const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const imageUpload = require("../middleware/imageUpload.middleware");

const router = express.Router();

const authController = require("../controllers/auth.controller");

// routes
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/me", protect, authController.getMe);
router.patch("/profile", protect, authController.updateProfile);

// Profile photo upload + face descriptor enrollment
router.post("/profile/photo", protect, imageUpload.single("profilePhoto"), authController.uploadProfilePhoto);

// Face descriptor retrieval (for pre-interview verification only)
router.get("/face-descriptor", protect, authController.getFaceDescriptor);

module.exports = router;
