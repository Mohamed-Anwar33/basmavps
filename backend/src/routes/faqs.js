import express from 'express';
import { 
  getFAQs, 
  getFAQCategories, 
  markFAQHelpful, 
  markFAQNotHelpful 
} from '../controllers/faqController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validateObjectId, validateSearch } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', validateSearch, getFAQs);
router.get('/categories', getFAQCategories);
router.post('/:id/helpful', validateObjectId(), optionalAuth, markFAQHelpful);
router.post('/:id/not-helpful', validateObjectId(), optionalAuth, markFAQNotHelpful);

export default router;
