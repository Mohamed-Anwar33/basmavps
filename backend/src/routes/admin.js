import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { adminLogin, getAdminProfile, adminLogout } from '../controllers/admin/adminAuthController.js';
import { getDashboardStats, getUsers, getAuditLogs } from '../controllers/admin/adminController.js';
import orderAdminRoutes from './orderAdmin.js';
import { getServices, getServiceById, createService, updateService, deleteService, bulkOperations, uploadPortfolioImages, deletePortfolioImage, getPortfolioImages, reorderPortfolioImages, uploadMainImages, deleteMainImage, getMainImages, reorderMainImages } from '../controllers/admin/serviceAdminController.js';
import { createBlog, updateBlog, deleteBlog, getBlogs as getAllBlogsAdmin, getBlogById as getBlogByIdAdmin, publishBlog, unpublishBlog } from '../controllers/admin/blogAdminController.js';
import { createFAQ, updateFAQ, deleteFAQ, getFAQs as getAllFaqsAdmin, getFAQById as getFaqByIdAdmin, updateFAQOrder } from '../controllers/admin/faqAdminController.js';
import { updateContactStatus, getContactStats, getContacts as getAllContactsAdmin, getContactById, deleteContact, bulkUpdateContacts } from '../controllers/admin/contactAdminController.js';
import { getPageContent, updatePageContent, addSection, updateSection, deleteSection, getAllPages } from '../controllers/admin/pageContentController.js';
import { updateHeroSection, getAdminHeroSection } from '../controllers/heroSectionController.js';
import { updateFoundationalStatement, getAdminFoundationalStatement } from '../controllers/foundationalController.js';
import { updateCountersSection, getAdminCountersSection } from '../controllers/countersController.js';
import { updateSEOSettings, getAdminSEOSettings } from '../controllers/seoController.js';
import { 
  uploadSingle, 
  uploadMultiple, 
  getMedia, 
  deleteMedia 
} from '../controllers/uploadController.js';
import { uploadBlogCover, deleteBlogCover } from '../controllers/cloudinaryController.js';
import { adminAuth, verifyToken } from '../middleware/adminAuth.js';
import { uploadServiceImages, validateImageUploadSecurity, handleUploadErrors } from '../middleware/imageUpload.js';
import realtimeSyncRoutes from './admin/realtimeSync.js';
import { getContentHubSummary } from '../controllers/admin/contentAdminController.js';
import { 
  getSettings, 
  updateSetting, 
  bulkUpdateSettings, 
  updateSettingsByCategory, 
  deleteSetting 
} from '../controllers/admin/settingAdminController.js';
import { updateAboutSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Admin Authentication Routes
router.post('/login', adminLogin);
router.post('/logout', adminAuth, adminLogout);

// Custom /me endpoint for frontend compatibility
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø©'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…Ø®ÙˆÙ„ Ù„Ù„ÙˆØµÙˆÙ„ Ù„Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø©'
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || [],
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± ØµØ­ÙŠØ­'
    });
  }
});

router.get('/verify-token', verifyToken);

// Admin Dashboard Routes
router.get('/dashboard/stats', adminAuth, getDashboardStats);

// Admin Management Routes
router.get('/users', adminAuth, getUsers);
router.get('/audit-logs', adminAuth, getAuditLogs);

// Admin Orders Management Routes
router.use('/orders', orderAdminRoutes);

// Admin Services Management Routes
router.get('/services', adminAuth, getServices);
router.get('/services/:id', adminAuth, getServiceById);
router.post('/services', adminAuth, createService);
router.put('/services/:id', adminAuth, updateService);
router.delete('/services/:id', adminAuth, deleteService);
router.post('/services/bulk', adminAuth, bulkOperations);

// Service Portfolio Images Management Routes
router.get('/services/:id/portfolio-images', adminAuth, getPortfolioImages);
router.post('/services/:id/portfolio-images', 
  adminAuth,
  validateImageUploadSecurity,
  uploadServiceImages.array('images', 10),
  handleUploadErrors,
  uploadPortfolioImages
);
router.delete('/services/:id/portfolio-images/:imageId', adminAuth, deletePortfolioImage);
router.put('/services/:id/portfolio-images/reorder', adminAuth, reorderPortfolioImages);

// Service Main Images (Cover Images) Management Routes
router.get('/services/:id/main-images', adminAuth, getMainImages);
router.post('/services/:id/main-images', 
  adminAuth,
  validateImageUploadSecurity,
  uploadServiceImages.array('images', 5),
  handleUploadErrors,
  uploadMainImages
);
router.delete('/services/:id/main-images/:imageId', adminAuth, deleteMainImage);
router.put('/services/:id/main-images/reorder', adminAuth, reorderMainImages);

// Admin Blog Management Routes
router.get('/blogs', adminAuth, getAllBlogsAdmin);
router.get('/blogs/:id', adminAuth, getBlogByIdAdmin);
router.post('/blogs', adminAuth, createBlog);
router.put('/blogs/:id', adminAuth, updateBlog);
router.delete('/blogs/:id', adminAuth, deleteBlog);

// Blog Cover Image Upload Routes
router.post('/blog/upload-cover', adminAuth, uploadBlogCover);
router.delete('/blog/delete-cover', adminAuth, deleteBlogCover);

// Admin FAQ Management Routes
router.get('/faqs', adminAuth, getAllFaqsAdmin);
router.get('/faqs/:id', adminAuth, getFaqByIdAdmin);
router.post('/faqs', adminAuth, createFAQ);
router.put('/faqs/:id', adminAuth, updateFAQ);
router.delete('/faqs/:id', adminAuth, deleteFAQ);
router.put('/faqs/order', adminAuth, updateFAQOrder);

// Admin Contact Management Routes
router.get('/contacts', adminAuth, getAllContactsAdmin);
router.get('/contacts/stats', adminAuth, getContactStats);
router.get('/contacts/:id', adminAuth, getContactById);
router.put('/contacts/:id/status', adminAuth, updateContactStatus);
router.delete('/contacts/:id', adminAuth, deleteContact);
router.put('/contacts/bulk', adminAuth, bulkUpdateContacts);

// Admin Page Content Management Routes
router.get('/page-content', adminAuth, getAllPages);
router.get('/page-content/:pageType', adminAuth, getPageContent);
router.put('/page-content/:pageType', adminAuth, updatePageContent);
router.post('/page-content/:pageType', adminAuth, addSection);
router.put('/page-content/:pageType/:sectionId', adminAuth, updateSection);
router.delete('/page-content/:pageType/:sectionId', adminAuth, deleteSection);

// Admin Content Specific Routes
router.get('/hero-section', adminAuth, getAdminHeroSection);
router.put('/hero-section', adminAuth, updateHeroSection);
router.get('/foundational', adminAuth, getAdminFoundationalStatement);
router.put('/foundational', adminAuth, updateFoundationalStatement);
router.get('/content/homepage-sections/counters', adminAuth, getAdminCountersSection);
router.put('/content/homepage-sections/counters', adminAuth, updateCountersSection);

// Settings Management Routes
router.get('/settings', adminAuth, (req, res, next) => {
  if (req.query.category === 'seo') {
    return getAdminSEOSettings(req, res, next);
  }
  return getSettings(req, res, next);
});
router.put('/settings', adminAuth, updateSetting);
router.put('/settings/bulk', adminAuth, bulkUpdateSettings);
router.put('/settings/:category', adminAuth, (req, res, next) => {
  if (req.params.category === 'seo') {
    return updateSEOSettings(req, res, next);
  }
  return updateSettingsByCategory(req, res, next);
});
router.put('/settings/about', adminAuth, updateAboutSettings);
router.delete('/settings/:id', adminAuth, deleteSetting);

// Content Management Routes
router.get('/content/summary', adminAuth, getContentHubSummary);

// Real-time Sync Routes
router.use('/sync', realtimeSyncRoutes);

export default router;

