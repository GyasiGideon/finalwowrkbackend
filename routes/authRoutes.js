// filepath: smart-dispense-backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  checkEmail,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Check if email exists
router.post("/check-email", checkEmail);

// Forgot password
router.post("/forgot-password", requestPasswordReset);

// Reset password
router.post("/reset-password", resetPassword);

export default router;
