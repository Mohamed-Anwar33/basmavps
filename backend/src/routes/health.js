import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *       503:
 *         description: System is unhealthy
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    // Check uptime
    const uptime = Math.floor(process.uptime());

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${uptime}s`,
      database: dbStatus,
      memory: memoryUsageMB,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Return 503 if database is not connected
    if (dbStatus !== 'connected') {
      health.status = 'unhealthy';
      return res.status(503).json(health);
    }

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Email test endpoint
router.post('/email', async (req, res) => {
  try {
    const { sendTestEmail } = await import('../utils/email.js');
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø·Ù„ÙˆØ¨'
      });
    }
    
    const result = await sendTestEmail(to);
    
    res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠ Ø¨Ù†Ø¬Ø§Ø­!',
      data: {
        messageId: result.messageId,
        to,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'ÙØ´Ù„ ÙÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠ'
    });
  }
});

export default router;

