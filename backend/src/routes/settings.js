import express from 'express';
import { getSettings, getSettingsByCategory, getBanners } from '../controllers/settingsController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management endpoints
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ar, en, both]
 *           default: both
 *         description: Language filter
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', getSettings);

/**
 * @swagger
 * /api/settings/{category}:
 *   get:
 *     summary: Get settings by category
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Settings category
 *     responses:
 *       200:
 *         description: Category settings retrieved successfully
 */
router.get('/:category', getSettingsByCategory);

export default router;
