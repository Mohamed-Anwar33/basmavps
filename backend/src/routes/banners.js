import express from 'express';
const router = express.Router();
import bannerController from '../controllers/bannerController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validate.js';
import {
  createBannerSchema,
  updateBannerSchema,
  updateBannerOrderSchema,
  getBannersQuerySchema
} from '../validation/bannerSchemas.js';

// Admin routes (protected) - Must come BEFORE /:id routes
router.get('/analytics/stats', adminAuth, bannerController.getBannerAnalytics);
router.put('/order/update', adminAuth, validate(updateBannerOrderSchema), bannerController.updateBannerOrder);
router.post('/', adminAuth, validate(createBannerSchema), bannerController.createBanner);
router.put('/:id', adminAuth, validate(updateBannerSchema), bannerController.updateBanner);
router.delete('/:id', adminAuth, bannerController.deleteBanner);
router.put('/:id/toggle', adminAuth, bannerController.toggleBannerStatus);

// Public routes (for frontend display) - /:id routes come LAST
router.get('/', validate(getBannersQuerySchema, 'query'), bannerController.getBanners);
router.get('/:id', bannerController.getBannerById);
router.post('/:id/view', bannerController.trackBannerView);
router.post('/:id/click', bannerController.trackBannerClick);

export default router;
