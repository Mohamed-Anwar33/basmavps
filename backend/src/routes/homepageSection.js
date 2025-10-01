import express from 'express';
import {
  getHomepageSections,
  getHomepageSectionById,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  toggleSectionStatus,
  updateSectionOrder,
  initializeDefaultSections
} from '../controllers/homepageSectionController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHomepageSections);
router.get('/:id', getHomepageSectionById);

// Admin routes  
router.post('/', [authenticate, requireAdmin], createHomepageSection);
router.put('/:id', [authenticate, requireAdmin], updateHomepageSection);
router.delete('/:id', [authenticate, requireAdmin], deleteHomepageSection);
router.put('/:id/toggle', [authenticate, requireAdmin], toggleSectionStatus);
router.put('/:id/order', [authenticate, requireAdmin], updateSectionOrder);
router.post('/initialize', [authenticate, requireAdmin], initializeDefaultSections);

export default router;
