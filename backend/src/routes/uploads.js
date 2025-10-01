import express from 'express';
import { 
  uploadSingle, 
  uploadMultiple, 
  getMedia, 
  deleteMedia 
} from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.post('/single', authenticate, uploadSingle);
router.post('/multiple', authenticate, uploadMultiple);
router.get('/media', authenticate, validatePagination, getMedia);
router.delete('/media/:id', authenticate, validateObjectId(), deleteMedia);

export default router;
