import express from 'express';
import { 
  getBlogs, 
  getFeaturedBlogs, 
  getRecentBlogs, 
  getBlogBySlug, 
  getBlogTags 
} from '../controllers/blogController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validatePagination, validateSearch, validateSlug } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, validateSearch, getBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/recent', getRecentBlogs);
router.get('/tags', getBlogTags);
router.get('/:slug', validateSlug(), optionalAuth, getBlogBySlug);

export default router;
