/**
 * 🧹 مسارات API لإدارة تنظيف النظام
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCleanupStats, runManualCleanup, previewCleanup } from '../controllers/cleanupController.js';

const router = express.Router();

// جميع المسارات تتطلب مصادقة
router.use(authenticate);

/**
 * @swagger
 * /api/admin/cleanup/stats:
 *   get:
 *     summary: Get system cleanup statistics
 *     tags: [Admin, Cleanup]
 */
router.get('/stats', getCleanupStats);

/**
 * @swagger
 * /api/admin/cleanup/preview:
 *   get:
 *     summary: Preview cleanup without executing
 *     tags: [Admin, Cleanup]
 */
router.get('/preview', previewCleanup);

/**
 * @swagger
 * /api/admin/cleanup/run:
 *   post:
 *     summary: Execute manual cleanup
 *     tags: [Admin, Cleanup]
 */
router.post('/run', runManualCleanup);

export default router;
