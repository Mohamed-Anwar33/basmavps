import express from 'express';
import { 
  createPaymentSession, 
  handleWebhook, 
  verifyPayment 
} from '../controllers/paymentController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { 
  rateLimitPaymentVerification,
  logSuspiciousActivity 
} from '../middleware/paymentSecurity.js';

const router = express.Router();

// Webhook route (must be before JSON parsing middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes with security middleware
router.post('/create-session', optionalAuth, logSuspiciousActivity, createPaymentSession);
router.post('/verify', optionalAuth, rateLimitPaymentVerification, logSuspiciousActivity, verifyPayment);

export default router;
