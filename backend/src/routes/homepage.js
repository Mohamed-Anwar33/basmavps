import express from 'express';
import { getHomepageContent, getHeroSection, getCounters } from '../controllers/homepageController.js';

const router = express.Router();

// Public routes
router.get('/content', getHomepageContent);

export default router;
