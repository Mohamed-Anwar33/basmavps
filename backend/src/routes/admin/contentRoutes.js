const express = require('express');
const router = express.Router();
const {
  getPageContent,
  updatePageContent,
  getAllPagesContent,
  deleteContentItem,
  seedDefaultContent
} = require('../../controllers/admin/contentController');
const { requireAdminAuth } = require('../../middleware/adminAuth');

// Apply admin authentication to all routes
// router.use(requireAdminAuth); // Commented out since admin auth is handled in main admin router

// Get all pages content
router.get('/', getAllPagesContent);

// Get content for specific page
router.get('/:page', getPageContent);

// Update content for specific page
router.put('/:page', updatePageContent);

// Delete specific content item
router.delete('/:page/:key', deleteContentItem);

// Seed default content
router.post('/seed', seedDefaultContent);

module.exports = router;
