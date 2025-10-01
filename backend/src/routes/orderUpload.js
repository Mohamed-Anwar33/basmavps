import express from 'express';
import { uploadOrderFiles, deleteOrderFile } from '../controllers/orderUploadController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Upload files for orders (allow both authenticated and guest users)
router.post('/files', optionalAuth, uploadOrderFiles);

// Delete uploaded file
router.delete('/files/:cloudinaryId', optionalAuth, deleteOrderFile);

export default router;
