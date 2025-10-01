import express from 'express';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersStats,
  bulkUpdateOrders
} from '../controllers/orderAdminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with pagination and filtering
 *     tags: [Admin Orders]
 */
router.get('/', getOrders);

/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin Orders]
 */
router.get('/stats', getOrdersStats);

/**
 * @swagger
 * /api/admin/orders/bulk:
 *   put:
 *     summary: Bulk update orders
 *     tags: [Admin Orders]
 */
router.put('/bulk', bulkUpdateOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get single order details
 *     tags: [Admin Orders]
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin Orders]
 */
router.put('/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   put:
 *     summary: Update order details
 *     tags: [Admin Orders]
 */
router.put('/:id', updateOrderStatus); // Use same controller for now

export default router;
