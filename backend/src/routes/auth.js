import express from 'express';
import { 
  signup, 
  login, 
  refreshToken, 
  logout, 
  forgotPassword, 
  resetPassword, 
  getCurrentUser,
  activateAccount 
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/security.js';
import {
  verifyEmail,
  resendVerificationCode,
  getVerificationStatus
} from '../controllers/emailVerificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateSchema, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Public routes (rate-limited)
router.post('/signup', authLimiter, validateSchema(signupSchema), signup);

// Account activation route
router.get('/activate', activateAccount);

// Email verification routes
router.post('/verify-email', authenticate, validateSchema(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', authenticate, resendVerificationCode);
router.get('/verification-status', authenticate, getVerificationStatus);

// Public routes
router.post('/login', authLimiter, validateSchema(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, validateSchema(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateSchema(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;
