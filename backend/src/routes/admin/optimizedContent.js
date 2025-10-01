import express from 'express';
import {
  getContentHubSummary,
  getPageContent,
  getPageContentByType,
  updatePageContent,
  getHomepageSections,
  getHomepageSectionByType,
  updateHomepageSection
} from '../../controllers/admin/contentAdminController.js';
import {
  cachePageContent,
  cachePageContentList,
  cacheHomepageSections,
  cacheHomepageSection,
  cacheContentSummary,
  invalidatePageContent,
  invalidateHomepageSections,
  cacheHealthCheck
} from '../../middleware/cacheMiddleware.js';
import dbOptimizer from '../../utils/databaseOptimizer.js';
import cacheManager from '../../utils/cacheManager.js';
import backgroundProcessor from '../../utils/backgroundProcessor.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware
router.use(requireAuth);
router.use(requireRole(['admin', 'editor']));

// Apply database performance monitoring
router.use(dbOptimizer.createPerformanceMiddleware());

// Content Hub Summary (cached)
router.get('/summary', cacheContentSummary, getContentHubSummary);

// Page Content Routes (with caching)
router.get('/pages', cachePageContentList, getPageContent);
router.get('/pages/:pageType', cachePageContent, getPageContentByType);
router.put('/pages/:pageType', invalidatePageContent, updatePageContent);

// Homepage Sections Routes (with caching)
router.get('/homepage-sections', cacheHomepageSections, getHomepageSections);
router.get('/homepage-sections/:sectionType', cacheHomepageSection, getHomepageSectionByType);
router.put('/homepage-sections/:sectionType', invalidateHomepageSections, updateHomepageSection);

// Cache Management Routes
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = cacheManager.getStats();
    const dbStats = dbOptimizer.getPerformanceStats();
    const processorStats = backgroundProcessor.getStats();

    res.json({
      success: true,
      data: {
        cache: stats,
        database: dbStats,
        backgroundProcessor: processorStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance stats',
      error: error.message
    });
  }
});

router.post('/cache/flush', async (req, res) => {
  try {
    await cacheManager.flush();
    res.json({
      success: true,
      message: 'Cache flushed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to flush cache',
      error: error.message
    });
  }
});

router.delete('/cache/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const deletedCount = await cacheManager.delPattern(pattern);
    
    res.json({
      success: true,
      message: `Deleted ${deletedCount} cache entries`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete cache entries',
      error: error.message
    });
  }
});

// Database Optimization Routes
router.post('/database/optimize', async (req, res) => {
  try {
    await dbOptimizer.createOptimizedIndexes();
    res.json({
      success: true,
      message: 'Database optimization completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database optimization failed',
      error: error.message
    });
  }
});

router.get('/database/stats', async (req, res) => {
  try {
    const stats = await dbOptimizer.analyzeCollectionStats();
    const performanceStats = dbOptimizer.getPerformanceStats();
    
    res.json({
      success: true,
      data: {
        collections: stats,
        performance: performanceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get database stats',
      error: error.message
    });
  }
});

router.post('/database/cleanup', async (req, res) => {
  try {
    await dbOptimizer.cleanupOldData();
    res.json({
      success: true,
      message: 'Database cleanup completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database cleanup failed',
      error: error.message
    });
  }
});

// Background Processing Routes
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = backgroundProcessor.getJobStatus(parseInt(jobId));
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message
    });
  }
});

router.delete('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const cancelled = await backgroundProcessor.cancelJob(parseInt(jobId));
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel job',
      error: error.message
    });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const stats = backgroundProcessor.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get job stats',
      error: error.message
    });
  }
});

// Health Check Route
router.get('/health', cacheHealthCheck, async (req, res) => {
  try {
    const cacheHealth = res.locals.cacheHealth;
    const dbStats = dbOptimizer.getPerformanceStats();
    const processorStats = backgroundProcessor.getStats();

    const isHealthy = cacheHealth.healthy && 
                     dbStats.totalQueries > 0 && 
                     processorStats.activeJobs < 10;

    res.json({
      success: true,
      healthy: isHealthy,
      components: {
        cache: cacheHealth,
        database: {
          healthy: dbStats.totalQueries > 0,
          stats: dbStats
        },
        backgroundProcessor: {
          healthy: processorStats.activeJobs < 10,
          stats: processorStats
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      healthy: false,
      error: error.message
    });
  }
});

export default router;