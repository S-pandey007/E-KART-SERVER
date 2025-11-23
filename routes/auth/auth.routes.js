import express from "express";
import {
  forgotPasswordOTPController,
  resetPasswordController,
  loginController,
  refreshAccessTokenController,
  registerController,
  sendOtp,
  verifyOtpController,
  logoutController,
} from "../../controllers/auth/auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
const router = express.Router();

//send OTP route
router.post("/send-otp", sendOtp);

// verify OTP route
router.post("/verify-otp", verifyOtpController);

// register route

router.post("/register", registerController);

// login route
router.post("/login", loginController);

// refresh access token route
router.post("/refresh-token", refreshAccessTokenController);

// logout route
router.delete("/logout", authMiddleware, logoutController);

// forgot Password OTP route
router.post("/forgot-password-otp", forgotPasswordOTPController);

// reset Password route
router.post("/reset-password", resetPasswordController);
export default router;
