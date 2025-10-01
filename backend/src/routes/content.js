import express from 'express';
import { getHeroSection } from '../controllers/heroSectionController.js';
import { getFoundationalStatement } from '../controllers/foundationalController.js';
import { getPublicPageContent } from '../controllers/publicContentController.js';
import { getCountersSection } from '../controllers/countersController.js';
import { getWhatMakesUsDifferent } from '../controllers/whatMakesUsDifferentController.js';

const router = express.Router();

// Hero section route - used by HeroSection component
router.get('/hero-section', getHeroSection);

// Foundational statement route - used by FoundationalStatement component  
router.get('/foundational', getFoundationalStatement);

// Public routes for content sections
router.get('/homepage-sections/counters', getCountersSection);
router.get('/homepage-sections/what-makes-us-different', getWhatMakesUsDifferent);

// Public page content by type (e.g., howToOrder, about, policies)
// Returns PageContent.content with sections and metadata
router.get('/page-content/:pageType', getPublicPageContent);

export default router;
