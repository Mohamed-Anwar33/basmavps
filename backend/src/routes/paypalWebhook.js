import express from 'express';
import { handlePayPalWebhook } from '../controllers/paypalWebhookController.js';

const router = express.Router();

/**
 * PayPal Webhook Route - الضمان الوحيد للأمان 100%
 * هذا المسار يستقبل إشعارات PayPal المباشرة
 * لا يمكن للمستخدمين الوصول إليه أو التلاعب به
 */

/**
 * @swagger
 * /api/webhooks/paypal:
 *   post:
 *     summary: Handle PayPal webhook events (SECURE)
 *     description: Receives direct notifications from PayPal for payment verification
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Webhook processing failed
 */
router.post('/paypal', handlePayPalWebhook);

export default router;
