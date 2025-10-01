import express from 'express';
import { 
  getServices, 
  getFeaturedServices, 
  getServiceBySlug, 
  getCategories,
  getServiceCategories 
} from '../controllers/serviceController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validatePagination, validateSearch, validateSlug } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getServices);
router.get('/featured', getFeaturedServices);
router.get('/categories', getCategories);
router.get('/categories/stats', getServiceCategories);
router.get('/:slug', validateSlug(), optionalAuth, getServiceBySlug);

export default router;
