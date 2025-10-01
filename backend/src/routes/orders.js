import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getOrderDelivery, 
  getGuestOrders,
  verifyOrderEmail,
  updateOrder,
  addTestDeliveryToOrder
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateSchema, orderSchema, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/guest/:email', getGuestOrders);

// Protected/Guest routes (optionalAuth allows both authenticated users and guests)
router.post('/', optionalAuth, validateSchema(orderSchema), createOrder);
router.get('/my', authenticate, validatePagination, getMyOrders);
router.get('/:id', authenticate, validateObjectId(), getOrderById);
router.patch('/:id', authenticate, validateObjectId(), updateOrder);
router.get('/:id/delivery', authenticate, validateObjectId(), getOrderDelivery);
router.post('/:id/verify-email', validateObjectId(), verifyOrderEmail);
// Test endpoint to add delivery links to existing orders
router.post('/:id/add-test-delivery', authenticate, validateObjectId(), addTestDeliveryToOrder);

export default router;
