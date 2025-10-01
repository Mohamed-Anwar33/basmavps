import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { adminAuth } from '../../middleware/adminAuth.js';
import User from '../../models/User.js';
import Service from '../../models/Service.js';
import Blog from '../../models/Blog.js';
import FAQ from '../../models/FAQ.js';
import Setting from '../../models/Setting.js';
import Contact from '../../models/Contact.js';
import Order from '../../models/Order.js';
import Media from '../../models/Media.js';
import AuditLog from '../../models/AuditLog.js';
import Banner from '../../models/Banner.js';
import blogRoutes from './blogs.js';
import { 
  getBlogs as getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  getBlogStatistics,
  uploadBlogCover
} from '../../controllers/admin/blogAdminController.js';
import { adminLogin, adminLogout, adminRefresh } from '../../controllers/admin/adminAuthController.js';
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  changeAdminPassword,
  toggleAdminStatus,
  deleteAdmin,
  getAdminStats
} from '../../controllers/admin/adminManagementController.js';

import { 
  getDashboardStats, 
  getContacts, 
  getAuditLogs,
  getUsers
} from '../../controllers/admin/adminController.js';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  bulkDeleteOrders,
  debugOrdersStatus,
  getOrderStatistics
} from '../../controllers/orderAdminController.js';
import { 
  getServices as getAdminServices,
  getCategories,
  createService,
  getServiceById,
  updateService,
  deleteService,
  bulkOperations as serviceBulkOperations,
  uploadPortfolioImages,
  deletePortfolioImage,
  getPortfolioImages,
  reorderPortfolioImages,
  uploadMainImages,
  deleteMainImage,
  getMainImages,
  reorderMainImages
} from '../../controllers/admin/serviceAdminController.js';
import {
  getSettings,
  updateSetting,
  bulkUpdateSettings,
  deleteSetting,
  updateSettingsByCategory
} from '../../controllers/admin/settingAdminController.js';
import {
  getFAQs,
  createFAQ,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  updateFAQOrder
} from '../../controllers/admin/faqAdminController.js';
import {
  getContentHubSummary,
  getPageContent,
  getPageContentByType,
  updatePageContent,
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  validatePageContent,
  bulkOperations,
  getVersionHistory,
  restoreVersion,
  getHomepageSections,
  getHomepageSectionByType,
  updateHomepageSection,
  updateSectionOrder
} from '../../controllers/admin/contentAdminController.js';
import { updateHeroSection, getAdminHeroSection } from '../../controllers/heroSectionController.js';
import { updateFoundationalStatement, getAdminFoundationalStatement } from '../../controllers/foundationalController.js';
import { getAdminSEOSettings, updateSEOSettings } from '../../controllers/seoController.js';
import { getAdminCountersSection, updateCountersSection } from '../../controllers/countersController.js';
import { getAdminWhatMakesUsDifferent, updateWhatMakesUsDifferent } from '../../controllers/whatMakesUsDifferentController.js';
import contactPageRoutes from './contactPage.js';
import {
  getMedia,
  uploadMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  getMediaUsage,
  upload
} from '../../controllers/admin/mediaAdminController.js';
import {
  validateSchema, 
  serviceSchema, 
  blogSchema, 
  settingSchema, 
  validateObjectId, 
  validatePagination,
  faqSchema,
  contactSchema,
  validateImageReorder,
  adminSchema,
  passwordChangeSchema,
  adminStatusSchema
} from '../../middleware/validation.js';
import { 
  uploadServiceImages, 
  handleUploadErrors, 
  validateImageUploadSecurity 
} from '../../middleware/imageUpload.js';
import { 
  validatePageType,
  validateSectionId,
  validateVersion,
  validateContentQuery,
  validateContentSecurity,
  rateLimitContent,
  validatePageContentUpdate,
  validateAddSection,
  validateUpdateSection,
  validateReorderSections,
  validateBulkOperation,
  validateContentValidation
} from '../../middleware/contentValidation.js';
// Import content controller functions
import {
  getPageContent as getContentPage,
  updatePageContent as updateContentPage,
  getAllPagesContent,
  deleteContentItem,
  seedDefaultContent
} from '../../controllers/admin/contentController.js';

const router = express.Router();

// Token verification endpoint (before requireAdmin middleware)
router.get('/verify-token', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ù…Ø² Ù…ØµØ§Ø¯Ù‚Ø©'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      data: {
        userId: decoded.userId,
        role: decoded.role,
        isValid: true
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Ø±Ù…Ø² Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± ØµØ­ÙŠØ­'
    });
  }
});

// Get current admin info endpoint (before requireAdmin middleware for auth verification)
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
    const admin = await User.findById(decoded.userId).select('-password');
    
    if (!admin || admin.role !== 'admin') {
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

// Public admin authentication routes (must be BEFORE adminAuth middleware)
router.post('/login', adminLogin);
router.post('/refresh', adminRefresh);
router.post('/logout', adminAuth, adminLogout);

// Banner management (temporary without auth for debugging)
router.get('/banners', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, pageSlug, position, isActive } = req.query;
    
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (pageSlug && pageSlug !== 'all') filter.pageSlug = pageSlug;
    if (position && position !== 'all') filter.position = position;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Banner.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: banners,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø¨Ù†Ø±Ø§Øª', error: error.message });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ success: true, data: banner, message: 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¨Ù†Ø± Ø¨Ù†Ø¬Ø§Ø­' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Ø®Ø·Ø£ ÙÙŠ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¨Ù†Ø±', error: error.message });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Ø§Ù„Ø¨Ù†Ø± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' });
    }
    res.json({ success: true, data: banner, message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨Ù†Ø± Ø¨Ù†Ø¬Ø§Ø­' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨Ù†Ø±', error: error.message });
  }
});

router.put('/banners/:id/toggle', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Ø§Ù„Ø¨Ù†Ø± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' });
    }
    
    banner.isActive = !banner.isActive;
    await banner.save();
    
    res.json({ 
      success: true, 
      message: `ØªÙ… ${banner.isActive ? 'ØªÙØ¹ÙŠÙ„' : 'Ø¥Ù„ØºØ§Ø¡ ØªÙØ¹ÙŠÙ„'} Ø§Ù„Ø¨Ù†Ø± Ø¨Ù†Ø¬Ø§Ø­`,
      data: { isActive: banner.isActive }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Ø®Ø·Ø£ ÙÙŠ ØªØºÙŠÙŠØ± Ø­Ø§Ù„Ø© Ø§Ù„Ø¨Ù†Ø±', error: error.message });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Ø§Ù„Ø¨Ù†Ø± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' });
    }
    res.json({ success: true, message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¨Ù†Ø± Ø¨Ù†Ø¬Ø§Ø­' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ø¨Ù†Ø±', error: error.message });
  }
});

// Apply admin authentication to all routes below
router.use(adminAuth);

// Get current admin info endpoint (after adminAuth middleware)
router.get('/me', async (req, res) => {
  try {
    console.log('🔍 /me DEBUG - req.user:', !!req.user);
    console.log('🔍 /me DEBUG - req.user keys:', req.user ? Object.keys(req.user) : 'no user');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'المستخدم غير مصرح له'
      });
    }

    // req.user is already set by adminAuth middleware
    res.json({
      success: true,
      data: {
        admin: {
          id: req.user._id || req.user.id,
          username: req.user.username,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          permissions: req.user.permissions || [],
          lastLogin: req.user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('❌ /me endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب بيانات المستخدم'
    });
  }
});

// Simple Content Management Routes (from our custom contentController)
router.get('/content', getAllPagesContent);
router.get('/content/:page', getContentPage);
router.put('/content/:page', updateContentPage);
router.delete('/content/:page/:key', deleteContentItem);
router.post('/content/seed', seedDefaultContent);

// Legacy compatibility routes for how-to-order
router.get('/how-to-order', (req, res, next) => {
  req.params.page = 'how-to-order';
  return getContentPage(req, res, next);
});
router.put('/how-to-order', (req, res, next) => {
  req.params.page = 'how-to-order';
  return updateContentPage(req, res, next);
});

// Frontend API compatibility routes for content/pages pattern
router.get('/content/pages/:pageType', (req, res, next) => {
  // Map frontend pageType to backend page names
  const pageTypeMap = {
    'howToOrder': 'how-to-order',
    'how-to-order': 'how-to-order'
  };
  req.params.page = pageTypeMap[req.params.pageType] || req.params.pageType;
  return getContentPage(req, res, next);
});
router.put('/content/pages/:pageType', (req, res, next) => {
  // Map frontend pageType to backend page names
  const pageTypeMap = {
    'howToOrder': 'how-to-order',
    'how-to-order': 'how-to-order'
  };
  req.params.page = pageTypeMap[req.params.pageType] || req.params.pageType;
  return updateContentPage(req, res, next);
});


// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users management
router.get('/users', validatePagination, getUsers);

// Orders management
router.get('/orders', validatePagination, getOrders);
router.get('/orders/statistics', getOrderStatistics); // 📊 احصائيات الطلبات
router.get('/orders/debug-status', debugOrdersStatus); // 🔍 تشخيص حالة الطلبات
router.get('/orders/debug-all', async (req, res) => {
  // 🔍 Quick debug route to see all orders
  try {
    const orders = await Order.find({}).select('_id orderNumber status paymentStatus createdAt').sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(o => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders/debug-find/:id', async (req, res) => {
  // 🔍 Debug specific order search
  try {
    const { id } = req.params;
    console.log('🔍 DEBUG: Searching for order:', id);
    
    // Test different search methods
    const results = {
      received_id: id,
      is_objectid: require('mongoose').Types.ObjectId.isValid(id),
      searches: {}
    };
    
    // Search by ObjectId
    if (require('mongoose').Types.ObjectId.isValid(id)) {
      const byId = await Order.findById(id);
      results.searches.by_objectid = {
        found: !!byId,
        order: byId ? {
          id: byId._id.toString(),
          orderNumber: byId.orderNumber,
          status: byId.status,
          paymentStatus: byId.paymentStatus
        } : null
      };
    }
    
    // Search by orderNumber
    if (id.includes('BD')) {
      const byOrderNumber = await Order.findOne({ orderNumber: id });
      results.searches.by_order_number = {
        found: !!byOrderNumber,
        order: byOrderNumber ? {
          id: byOrderNumber._id.toString(),
          orderNumber: byOrderNumber.orderNumber,
          status: byOrderNumber.status,
          paymentStatus: byOrderNumber.paymentStatus
        } : null
      };
    }
    
    // Search with any criteria
    const anyOrder = await Order.findOne({
      $or: [
        { _id: require('mongoose').Types.ObjectId.isValid(id) ? id : null },
        { orderNumber: id }
      ].filter(Boolean)
    });
    results.searches.any_criteria = {
      found: !!anyOrder,
      order: anyOrder ? {
        id: anyOrder._id.toString(),
        orderNumber: anyOrder.orderNumber,
        status: anyOrder.status,
        paymentStatus: anyOrder.paymentStatus
      } : null
    };
    
    res.json({ success: true, debug: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.put('/orders/:id/status', updateOrderStatus); // Remove validation temporarily
router.delete('/orders/:id/delete', validateObjectId(), deleteOrder); // 🗑️ حذف الطلبات المعلقة
router.post('/orders/bulk-delete', bulkDeleteOrders); // 🗑️ حذف جماعي للطلبات المعلقة

// Contacts management
router.get('/contacts', validatePagination, getContacts);

// Services management
router.get('/services', validatePagination, getAdminServices);
router.get('/services/categories', getCategories);
router.post('/services', validateSchema(serviceSchema), createService);
router.get('/services/:id', validateObjectId(), getServiceById);
router.put('/services/:id', validateObjectId(), validateSchema(serviceSchema), updateService);
router.delete('/services/:id', validateObjectId(), deleteService);
router.post('/services/bulk', serviceBulkOperations);

// Service image management with enhanced security
router.get('/services/:id/portfolio-images', validateObjectId(), getPortfolioImages);
router.post('/services/:id/portfolio-images', 
  validateImageUploadSecurity,
  uploadServiceImages.array('images', 10), 
  handleUploadErrors,
  uploadPortfolioImages
);
router.delete('/services/:id/portfolio-images/:imageId', 
  validateImageUploadSecurity,
  deletePortfolioImage
);
router.put('/services/:id/portfolio-images/reorder', 
  validateImageUploadSecurity,
  validateImageReorder,
  reorderPortfolioImages
);

// Service Main Images (Cover Images) Management Routes
router.get('/services/:id/main-images', validateObjectId(), getMainImages);
router.post('/services/:id/main-images', 
  validateImageUploadSecurity,
  uploadServiceImages.array('images', 5), 
  handleUploadErrors,
  uploadMainImages
);
router.delete('/services/:id/main-images/:imageId', 
  validateImageUploadSecurity,
  deleteMainImage
);
router.put('/services/:id/main-images/reorder', 
  validateImageUploadSecurity,
  validateImageReorder,
  reorderMainImages
);

// Blogs management 
router.get('/blogs/statistics', getBlogStatistics);
router.get('/blogs', validatePagination, getAdminBlogs);
router.post('/blogs', validateSchema(blogSchema), createBlog);
router.get('/blogs/:id', validateObjectId(), getBlogById);  
router.put('/blogs/:id', validateObjectId(), validateSchema(blogSchema), updateBlog);
router.delete('/blogs/:id', validateObjectId(), deleteBlog);
router.post('/blogs/:id/publish', validateObjectId(), publishBlog);
router.post('/blogs/:id/unpublish', validateObjectId(), unpublishBlog);
router.patch('/blogs/:id/publish', validateObjectId(), publishBlog);
router.patch('/blogs/:id/unpublish', validateObjectId(), unpublishBlog);
router.post('/blogs/upload-cover', upload.single('coverImage'), uploadBlogCover);

// FAQs management
router.get('/faqs', validatePagination, getFAQs);
router.post('/faqs', createFAQ);
router.get('/faqs/:id', validateObjectId(), getFAQById);
router.put('/faqs/:id', validateObjectId(), updateFAQ);
router.delete('/faqs/:id', validateObjectId(), deleteFAQ);
router.put('/faqs/order', updateFAQOrder);

// Settings management
router.get('/settings', (req, res, next) => {
  if (req.query.category === 'seo') {
    return getAdminSEOSettings(req, res, next);
  }
  return getSettings(req, res, next);
});
router.put('/settings', validateSchema(settingSchema), updateSetting);
router.put('/settings/bulk', bulkUpdateSettings);
router.put('/settings/:category', (req, res, next) => {
  if (req.params.category === 'seo') {
    return updateSEOSettings(req, res, next);
  }
  return updateSettingsByCategory(req, res, next);
});
router.delete('/settings/:id', validateObjectId(), deleteSetting);

// Content management
router.get('/content/summary', getContentHubSummary);
router.get('/content/pages', validateContentQuery, getPageContent);
router.get('/content/pages/:pageType', validatePageType, getPageContentByType);
router.put('/content/pages/:pageType', 
  validatePageType, 
  rateLimitContent, 
  validateContentSecurity, 
  validatePageContentUpdate, 
  updatePageContent
);

// Enhanced content management - sections
router.post('/content/pages/:pageType/sections', 
  validatePageType, 
  rateLimitContent, 
  validateContentSecurity, 
  validateAddSection, 
  addSection
);
router.put('/content/pages/:pageType/sections', 
  validatePageType, 
  rateLimitContent, 
  validateContentSecurity, 
  validateUpdateSection, 
  updateSection
);
router.delete('/content/pages/:pageType/sections/:sectionId', 
  validatePageType, 
  validateSectionId, 
  rateLimitContent, 
  removeSection
);
router.put('/content/pages/:pageType/sections/reorder', 
  validatePageType, 
  rateLimitContent, 
  validateReorderSections, 
  reorderSections
);

// Content validation and operations
router.post('/content/validate', 
  validateContentSecurity, 
  validateContentValidation, 
  validatePageContent
);
router.post('/content/bulk-operations', 
  rateLimitContent, 
  validateBulkOperation, 
  bulkOperations
);

// Version management
router.get('/content/pages/:pageType/versions', 
  validatePageType, 
  validatePagination, 
  getVersionHistory
);
router.post('/content/pages/:pageType/versions/:version/restore', 
  validatePageType, 
  validateVersion, 
  rateLimitContent, 
  restoreVersion
);

// Homepage sections (existing)
router.get('/content/homepage-sections', getHomepageSections);
router.get('/content/homepage-sections/:sectionType', (req, res, next) => {
  if (req.params.sectionType === 'counters') {
    return getAdminCountersSection(req, res, next);
  }
  if (req.params.sectionType === 'what-makes-us-different') {
    return getAdminWhatMakesUsDifferent(req, res, next);
  }
  return getHomepageSectionByType(req, res, next);
});
router.put('/content/homepage-sections/:sectionType', (req, res, next) => {
  if (req.params.sectionType === 'counters') {
    return updateCountersSection(req, res, next);
  }
  if (req.params.sectionType === 'what-makes-us-different') {
    return updateWhatMakesUsDifferent(req, res, next);
  }
  return updateHomepageSection(req, res, next);
});
router.put('/content/homepage-sections/order', updateSectionOrder);

// Hero Section and Foundational Statement
router.get('/hero-section', getAdminHeroSection);
router.put('/hero-section', updateHeroSection);
router.get('/foundational', getAdminFoundationalStatement);
router.put('/foundational', updateFoundationalStatement);

// SEO Settings
router.get('/settings/seo', getAdminSEOSettings);
router.put('/settings/seo', updateSEOSettings);

// Counters Section
router.get('/content/homepage-sections/counters', getAdminCountersSection);
router.put('/content/homepage-sections/counters', updateCountersSection);

// What Makes Us Different Section
router.get('/content/homepage-sections/what-makes-us-different', getAdminWhatMakesUsDifferent);
router.put('/content/homepage-sections/what-makes-us-different', updateWhatMakesUsDifferent);

// Media management
router.get('/media', validatePagination, getMedia);
router.post('/media/upload', upload.array('files', 10), uploadMedia);
router.get('/media/:id', validateObjectId(), getMediaById);
router.put('/media/:id', validateObjectId(), updateMedia);
router.delete('/media/:id', validateObjectId(), deleteMedia);
router.post('/media/bulk-delete', bulkDeleteMedia);
router.get('/media/:id/usage', validateObjectId(), getMediaUsage);

// Blog management
router.use('/blogs', blogRoutes);

// Contact Page management
router.use('/contact-page', contactPageRoutes);

// Policy Content management
import policyContentRoutes from './policyContent.js';
router.use('/', policyContentRoutes);

// Admin Management
router.get('/admins', getAdmins);
router.get('/admins/stats', getAdminStats);
router.get('/admins/:id', validateObjectId(), getAdminById);
router.post('/admins', validateSchema(adminSchema), createAdmin);
router.put('/admins/:id', validateObjectId(), validateSchema(adminSchema), updateAdmin);
router.put('/admins/:id/password', validateObjectId(), validateSchema(passwordChangeSchema), changeAdminPassword);
router.put('/admins/:id/status', validateObjectId(), validateSchema(adminStatusSchema), toggleAdminStatus);
router.delete('/admins/:id', validateObjectId(), deleteAdmin);

// Audit logs
router.get('/audit-logs', validatePagination, getAuditLogs);

export default router;

