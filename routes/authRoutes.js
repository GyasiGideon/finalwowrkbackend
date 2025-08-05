// filepath: smart-dispense-backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", requestPasswordReset);

// Reset password
router.post("/reset-password", resetPassword);

export default router;
