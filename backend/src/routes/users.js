import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile with orders and payments
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Get user's orders
    const orders = await Order.findByUser(user._id);

    // Get user's payments
    const payments = await Payment.find({ userId: user._id })
      .populate('orderId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        orders,
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          createdAt: payment.createdAt,
          order: payment.orderId
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    });
  }
});

export default router;

