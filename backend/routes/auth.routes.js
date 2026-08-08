const express = require("express");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

const authController = require("../controllers/auth.controller");

// routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);

module.exports = router;
