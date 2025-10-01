import express from 'express';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';
import { adminAuth } from '../../middleware/adminAuth.js';
import realtimeSyncService from '../../utils/realtimeSync.js';
import ContentVersion from '../../models/ContentVersion.js';
import websocketServer from '../../utils/websocketServer.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/sync/content/{contentType}/{contentId}:
 *   put:
 *     summary: Sync content update with real-time broadcasting
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PageContent, HomepageSection, Service, Media]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: object
 *                 description: Updated content data
 *               optimistic:
 *                 type: boolean
 *                 description: Whether this is an optimistic update
 *               updateId:
 *                 type: string
 *                 description: Unique ID for optimistic updates
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Content not found
 *       409:
 *         description: Conflict detected
 */
router.put('/content/:contentType/:contentId',
  adminAuth,
  [
    param('contentType').isIn(['PageContent', 'HomepageSection', 'Service', 'Media']),
    param('contentId').isMongoId(),
    body('content').isObject(),
    body('optimistic').optional().isBoolean(),
    body('updateId').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const { content, optimistic = false, updateId } = req.body;
      const adminId = req.admin._id;

      let result;

      if (optimistic && updateId) {
        // Handle optimistic update
        const changes = realtimeSyncService.calculateChanges({}, content);
        result = await realtimeSyncService.handleOptimisticUpdate(
          contentType,
          contentId,
          changes,
          adminId,
          updateId
        );
      } else {
        // Handle regular sync update
        result = await realtimeSyncService.syncContentUpdate(
          contentType,
          contentId,
          content,
          adminId,
          req
        );
      }

      res.json({
        success: true,
        message: 'Content updated successfully',
        data: result
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('Concurrent modification')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          code: 'CONFLICT_DETECTED'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/content/{contentType}/{contentId}:
 *   delete:
 *     summary: Delete content with real-time sync
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PageContent, HomepageSection, Service, Media]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 */
router.delete('/content/:contentType/:contentId',
  adminAuth,
  [
    param('contentType').isIn(['PageContent', 'HomepageSection', 'Service', 'Media']),
    param('contentId').isMongoId()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const adminId = req.admin._id;

      const result = await realtimeSyncService.syncContentDeletion(
        contentType,
        contentId,
        adminId,
        req
      );

      res.json({
        success: true,
        message: 'Content deleted successfully',
        data: result
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/rollback:
 *   post:
 *     summary: Rollback optimistic update
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentType
 *               - contentId
 *               - updateId
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [PageContent, HomepageSection, Service, Media]
 *               contentId:
 *                 type: string
 *               updateId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update rolled back successfully
 */
router.post('/rollback',
  adminAuth,
  [
    body('contentType').isIn(['PageContent', 'HomepageSection', 'Service', 'Media']),
    body('contentId').isMongoId(),
    body('updateId').isString(),
    body('reason').optional().isString()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { contentType, contentId, updateId, reason = 'Manual rollback' } = req.body;

      await realtimeSyncService.rollbackOptimisticUpdate(
        contentType,
        contentId,
        updateId,
        reason
      );

      res.json({
        success: true,
        message: 'Update rolled back successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/versions/{contentType}/{contentId}:
 *   get:
 *     summary: Get content version history
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PageContent, HomepageSection, Service, Media]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: includeContent
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Version history retrieved successfully
 */
router.get('/versions/:contentType/:contentId',
  adminAuth,
  [
    param('contentType').isIn(['PageContent', 'HomepageSection', 'Service', 'Media']),
    param('contentId').isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('includeContent').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const { page = 1, limit = 20, includeContent = false } = req.query;

      const result = await realtimeSyncService.getContentWithHistory(
        contentType,
        contentId,
        { page: parseInt(page), limit: parseInt(limit), includeContent }
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/versions/{contentType}/{contentId}/restore/{version}:
 *   post:
 *     summary: Restore content to specific version
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PageContent, HomepageSection, Service, Media]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Version restored successfully
 *       404:
 *         description: Content or version not found
 */
router.post('/versions/:contentType/:contentId/restore/:version',
  adminAuth,
  [
    param('contentType').isIn(['PageContent', 'HomepageSection', 'Service', 'Media']),
    param('contentId').isMongoId(),
    param('version').isInt({ min: 1 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { contentType, contentId, version } = req.params;
      const adminId = req.admin._id;

      const result = await realtimeSyncService.restoreContentVersion(
        contentType,
        contentId,
        parseInt(version),
        adminId,
        req
      );

      res.json({
        success: true,
        message: 'Version restored successfully',
        data: result
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/versions/{contentType}/{contentId}/compare:
 *   get:
 *     summary: Compare two versions of content
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PageContent, HomepageSection, Service, Media]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: version1
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: version2
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Version comparison retrieved successfully
 */
router.get('/versions/:contentType/:contentId/compare',
  adminAuth,
  [
    param('contentType').isIn(['PageContent', 'HomepageSection', 'Service', 'Media']),
    param('contentId').isMongoId(),
    query('version1').isInt({ min: 1 }),
    query('version2').isInt({ min: 1 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { contentType, contentId } = req.params;
      const { version1, version2 } = req.query;

      const comparison = await ContentVersion.compareVersions(
        contentId,
        contentType,
        parseInt(version1),
        parseInt(version2)
      );

      res.json({
        success: true,
        data: comparison
      });

    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/stats:
 *   get:
 *     summary: Get real-time sync statistics
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync statistics retrieved successfully
 */
router.get('/stats',
  adminAuth,
  async (req, res) => {
    try {
      const stats = realtimeSyncService.getSyncStats();
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/sync/connections:
 *   get:
 *     summary: Get active WebSocket connections
 *     tags: [Admin - Real-time Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection information retrieved successfully
 */
router.get('/connections',
  adminAuth,
  async (req, res) => {
    try {
      const connectionStats = websocketServer.getConnectionStats();
      
      res.json({
        success: true,
        data: connectionStats
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
