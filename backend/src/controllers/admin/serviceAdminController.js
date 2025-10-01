import Service from '../../models/Service.js';
import AuditLog from '../../models/AuditLog.js';
import slugify from 'slugify';
import cloudinary from '../../utils/cloudinary.js';
import { processAndOptimizeImage } from '../../middleware/imageUpload.js';

/**
 * @swagger
 * tags:
 *   name: Admin Services
 *   description: Admin service management endpoints
 */

/**
 * @swagger
 * /api/admin/services:
 *   get:
 *     summary: Get all services for admin
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 */
export const getServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status = 'all' } = req.query;

    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;
    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(filter);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'services', null, { filter }, req);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve services'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/categories:
 *   get:
 *     summary: Get all unique categories used in services
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
export const getCategories = async (req, res) => {
  try {
    // Get all unique categories from services
    const categories = await Service.distinct('category');
    
    // Default categories with Arabic labels
    const defaultCategories = [
      { value: 'social-media', label: 'ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ' },
      { value: 'branding', label: 'Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©' },
      { value: 'web-design', label: 'ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹' },
      { value: 'print-design', label: 'Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ø·Ø¨Ø§Ø¹ÙŠ' },
      { value: 'cv-templates', label: 'Ù‚ÙˆØ§Ù„Ø¨ Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©' },
      { value: 'marketing', label: 'Ø§Ù„ØªØ³ÙˆÙŠÙ‚' },
      { value: 'consulting', label: 'Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª' },
      { value: 'linkedin', label: 'Ù„ÙŠÙ†ÙƒØ¯ Ø¥Ù†' },
      { value: 'banners', label: 'Ø§Ù„Ø¨Ø§Ù†Ø±Ø§Øª' },
      { value: 'content', label: 'Ø§Ù„Ù…Ø­ØªÙˆÙ‰' },
      { value: 'resumes', label: 'Ø§Ù„Ø³ÙŠØ± Ø§Ù„Ø°Ø§ØªÙŠØ©' },
      { value: 'logos', label: 'Ø§Ù„Ø´Ø¹Ø§Ø±Ø§Øª' },
      { value: 'consultation', label: 'Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø©' },
      { value: 'management', label: 'Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©' }
    ];
    
    // Merge default categories with database categories
    const allCategories = [...defaultCategories];
    
    // Add any new categories from database that aren't in defaults
    categories.forEach(category => {
      if (!defaultCategories.find(def => def.value === category)) {
        allCategories.push({
          value: category,
          label: category // Use the category name as label for new categories
        });
      }
    });
    
    // Sort categories alphabetically by Arabic label
    allCategories.sort((a, b) => a.label.localeCompare(b.label, 'ar'));

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'categories', null, {}, req);

    res.json({
      success: true,
      data: {
        categories: allCategories
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories'
    });
  }
};

/**
 * @swagger
 * /api/admin/services:
 *   post:
 *     summary: Create new service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 */
export const createService = async (req, res) => {
  try {
    const serviceData = req.body;

    // Generate slug if not provided
    if (!serviceData.slug && serviceData.title?.en) {
      serviceData.slug = slugify(serviceData.title.en, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
    }

    // Check if slug already exists
    if (serviceData.slug) {
      const existingService = await Service.findOne({ slug: serviceData.slug });
      if (existingService) {
        return res.status(400).json({
          success: false,
          error: 'Service with this slug already exists'
        });
      }
    }

    const service = new Service(serviceData);
    await service.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'create', 'services', service._id, {
      title: service.title,
      slug: service.slug
    }, req);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create service'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: { service }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve service'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // ØªØ³Ø¬ÙŠÙ„ Ù…ÙØµÙ„ Ù„Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Check if slug is being changed and if it already exists
    if (updateData.slug && updateData.slug !== service.slug) {
      const existingService = await Service.findOne({ slug: updateData.slug });
      if (existingService) {
        return res.status(400).json({
          success: false,
          error: 'Service with this slug already exists'
        });
      }
    }

    const oldData = service.toObject();
    
    // Handle nested uiTexts properly
    if (updateData.uiTexts) {
      // Deep merge for nested objects like qualityTitle, qualitySubtitle, etc.
      service.uiTexts = {
        ...service.uiTexts,
        ...updateData.uiTexts,
        // Handle nested objects properly
        ...(updateData.uiTexts.qualityTitle && {
          qualityTitle: {
            ...service.uiTexts?.qualityTitle,
            ...updateData.uiTexts.qualityTitle
          }
        }),
        ...(updateData.uiTexts.qualitySubtitle && {
          qualitySubtitle: {
            ...service.uiTexts?.qualitySubtitle,
            ...updateData.uiTexts.qualitySubtitle
          }
        }),
        ...(updateData.uiTexts.detailsTitle && {
          detailsTitle: {
            ...service.uiTexts?.detailsTitle,
            ...updateData.uiTexts.detailsTitle
          }
        }),
        ...(updateData.uiTexts.details && {
          details: {
            ...service.uiTexts?.details,
            ...updateData.uiTexts.details
          }
        }),
        ...(updateData.uiTexts.noticeTitle && {
          noticeTitle: {
            ...service.uiTexts?.noticeTitle,
            ...updateData.uiTexts.noticeTitle
          }
        }),
        ...(updateData.uiTexts.notice && {
          notice: {
            ...service.uiTexts?.notice,
            ...updateData.uiTexts.notice
          }
        })
      };
      
      delete updateData.uiTexts;
    }
    
    // Handle digitalDelivery specially if it exists
    if (updateData.digitalDelivery) {
      service.digitalDelivery = updateData.digitalDelivery;
    }
    
    // Handle image updates properly
    const { images, mainImages, portfolioImages, ...safeUpdateData } = updateData;
    
    Object.assign(service, safeUpdateData);
    
    // Update images if provided, otherwise keep existing ones
    if (images !== undefined) {
      service.images = images;
      }
    
    if (mainImages !== undefined) {
      // Convert string URLs to proper image objects if needed
      service.mainImages = mainImages.map((img, index) => {
        if (typeof img === 'string') {
          return {
            url: img,
            alt: '',
            order: index,
            uploadedAt: new Date(),
            uploadedBy: req.user._id
          };
        }
        return img;
      });
      }
    
    if (portfolioImages !== undefined) {
      // Convert string URLs to proper image objects if needed  
      service.portfolioImages = portfolioImages.map((img, index) => {
        if (typeof img === 'string') {
          return {
            url: img,
            alt: '',
            order: index,
            uploadedAt: new Date(),
            uploadedBy: req.user._id
          };
        }
        return img;
      });
      }
    
    await service.save();
    
    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'services', service._id, {
      before: { title: oldData.title, slug: oldData.slug },
      after: { title: service.title, slug: service.slug }
    }, req);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });

  } catch (error) {
    // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø£Ø®Ø·Ø§Ø¡ Ø§Ù„ØªØ­Ù‚Ù‚ Ø¨Ø´ÙƒÙ„ Ù…ÙØµÙ„
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach(key => {
        });
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}:
 *   delete:
 *     summary: Delete service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    await Service.findByIdAndDelete(id);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'delete', 'services', id, {
      title: service.title,
      slug: service.slug
    }, req);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/bulk:
 *   post:
 *     summary: Bulk operations on services
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - serviceIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate, delete, feature, unfeature]
 *               serviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 */
export const bulkOperations = async (req, res) => {
  try {
    const { action, serviceIds } = req.body;

    if (!serviceIds || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Service IDs are required'
      });
    }

    let updateData = {};
    let actionDescription = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        actionDescription = 'activated';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        actionDescription = 'deactivated';
        break;
      case 'feature':
        updateData = { isFeatured: true };
        actionDescription = 'featured';
        break;
      case 'unfeature':
        updateData = { isFeatured: false };
        actionDescription = 'unfeatured';
        break;
      case 'delete':
        await Service.deleteMany({ _id: { $in: serviceIds } });
        actionDescription = 'deleted';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    if (action !== 'delete') {
      await Service.updateMany(
        { _id: { $in: serviceIds } },
        updateData
      );
    }

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'services', null, {
      action,
      serviceIds,
      count: serviceIds.length
    }, req);

    res.json({
      success: true,
      message: `${serviceIds.length} services ${actionDescription} successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk operation'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/portfolio-images:
 *   post:
 *     summary: Upload portfolio images for a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               alt:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Invalid request or file validation error
 *       404:
 *         description: Service not found
 */
export const uploadPortfolioImages = async (req, res) => {
  try {
    const { id } = req.params;
    // Enhanced security: Verify admin permissions again at controller level
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø±ÙØ¹ ØµÙˆØ± Ø§Ù„Ø®Ø¯Ù…Ø§Øª',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Check if service exists
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Enhanced validation: Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ ØµÙˆØ±',
        code: 'NO_FILES_UPLOADED',
        details: 'ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ù„Ù ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„'
      });
    }

    // Security check: Validate maximum number of images per service
    const maxImagesPerService = 20;
    const currentImageCount = service.portfolioImages?.length || 0;
    const newImageCount = req.files.length;
    
    if (currentImageCount + newImageCount > maxImagesPerService) {
      return res.status(400).json({
        success: false,
        error: `ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„Ù„ØµÙˆØ±. Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ ${maxImagesPerService} ØµÙˆØ±Ø© Ù„ÙƒÙ„ Ø®Ø¯Ù…Ø©`,
        code: 'MAX_IMAGES_EXCEEDED',
        current: currentImageCount,
        attempting: newImageCount,
        maximum: maxImagesPerService
      });
    }

    // Process uploaded images with enhanced validation
    const uploadedImages = [];
    const altTexts = Array.isArray(req.body.alt) ? req.body.alt : (req.body.alt ? [req.body.alt] : []);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const altText = altTexts[i] || '';

      // Additional security validation for each file
      if (!file.path || !file.path.startsWith('https://')) {
        continue; // Skip invalid files
      }

      // Validate alt text if provided
      if (altText && altText.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'Ù†Øµ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¨Ø¯ÙŠÙ„ Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 200 Ø­Ø±Ù)',
          code: 'ALT_TEXT_TOO_LONG'
        });
      }

      const imageData = {
        url: file.path,
        alt: altText.trim(),
        order: (service.portfolioImages?.length || 0) + i,
        uploadedAt: new Date(),
        uploadedBy: req.user._id
      };

      uploadedImages.push(imageData);
    }

    // Ensure we have valid images to upload
    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ ØµÙˆØ± ØµØ­ÙŠØ­Ø©',
        code: 'NO_VALID_IMAGES'
      });
    }

    // Initialize portfolioImages array if it doesn't exist
    if (!service.portfolioImages) {
      service.portfolioImages = [];
    }

    // Add images to service using atomic update to avoid validation issues
    await Service.findByIdAndUpdate(
      id,
      { 
        $push: { 
          portfolioImages: { $each: uploadedImages } 
        } 
      },
      { new: true, runValidators: false } // Skip validation to avoid affecting other fields
    );

    // Enhanced audit logging
    await AuditLog.logAction(req.user._id, 'update', 'services', service._id, {
      action: 'upload_portfolio_images',
      imagesCount: uploadedImages.length,
      serviceTitle: service.title,
      imageUrls: uploadedImages.map(img => img.url),
      totalImagesAfter: service.portfolioImages.length
    }, req);

    res.json({
      success: true,
      message: `ØªÙ… Ø±ÙØ¹ ${uploadedImages.length} ØµÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­`,
      data: {
        uploadedImages,
        totalImages: service.portfolioImages.length,
        serviceId: service._id,
        serviceTitle: service.title
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'upload_portfolio_images_failed',
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±',
      code: 'UPLOAD_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/portfolio-images/{imageId}:
 *   delete:
 *     summary: Delete a portfolio image from a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Service or image not found
 */
export const deletePortfolioImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    // Enhanced security: Verify admin permissions again at controller level
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù ØµÙˆØ± Ø§Ù„Ø®Ø¯Ù…Ø§Øª',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Find service
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Find image in portfolio
    const imageIndex = service.portfolioImages.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„ØµÙˆØ±Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'IMAGE_NOT_FOUND'
      });
    }

    const imageToDelete = service.portfolioImages[imageIndex];

    // Security check: Verify image belongs to this service
    if (!imageToDelete.uploadedBy || imageToDelete.uploadedBy.toString() !== req.user._id.toString()) {
      // Allow super admins to delete any image
      if (!['super_admin', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ Ø­Ø°Ù ØµÙˆØ±Ø© Ù„Ù… ØªÙ‚Ù… Ø¨Ø±ÙØ¹Ù‡Ø§',
          code: 'NOT_IMAGE_OWNER'
        });
      }
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (imageToDelete.url.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageToDelete.url.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `basma-design/service-images/${publicIdWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Remove image from service
    service.portfolioImages.splice(imageIndex, 1);
    await service.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'services', service._id, {
      action: 'delete_portfolio_image',
      imageUrl: imageToDelete.url,
      serviceTitle: service.title
    }, req);

    res.json({
      success: true,
      message: 'ØªÙ… Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        deletedImage: imageToDelete,
        remainingImages: service.portfolioImages.length
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'delete_portfolio_image_failed',
      imageId: req.params.imageId,
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù Ø§Ù„ØµÙˆØ±Ø©',
      code: 'DELETE_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/portfolio-images:
 *   get:
 *     summary: Get all portfolio images for a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio images retrieved successfully
 *       404:
 *         description: Service not found
 */
export const getPortfolioImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Enhanced security: Verify admin permissions
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¹Ø±Ø¶ ØµÙˆØ± Ø§Ù„Ø®Ø¯Ù…Ø§Øª',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const service = await Service.findById(id).select('portfolioImages title');
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Log successful view action
    await AuditLog.logAction(req.user._id, 'view', 'services', service._id, {
      action: 'view_portfolio_images',
      serviceTitle: service.title,
      imagesCount: service.portfolioImages.length
    }, req);

    res.json({
      success: true,
      data: {
        serviceId: service._id,
        serviceTitle: service.title,
        portfolioImages: service.portfolioImages.sort((a, b) => a.order - b.order),
        totalImages: service.portfolioImages.length
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'view_portfolio_images_failed',
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ ØµÙˆØ± Ø§Ù„Ø®Ø¯Ù…Ø©',
      code: 'FETCH_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/portfolio-images/reorder:
 *   put:
 *     summary: Reorder portfolio images for a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageIds
 *             properties:
 *               imageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Images reordered successfully
 *       404:
 *         description: Service not found
 */
export const reorderPortfolioImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIds } = req.body;

    // Enhanced security: Verify admin permissions again at controller level
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ ØµÙˆØ± Ø§Ù„Ø®Ø¯Ù…Ø§Øª',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    if (!imageIds || !Array.isArray(imageIds)) {
      return res.status(400).json({
        success: false,
        error: 'Ù‚Ø§Ø¦Ù…Ø© Ù…Ø¹Ø±ÙØ§Øª Ø§Ù„ØµÙˆØ± Ù…Ø·Ù„ÙˆØ¨Ø©',
        code: 'INVALID_IMAGE_IDS'
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Security check: Verify all image IDs belong to this service
    const serviceImageIds = service.portfolioImages.map(img => img._id.toString());
    const invalidImageIds = imageIds.filter(imageId => !serviceImageIds.includes(imageId));
    
    if (invalidImageIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ø¨Ø¹Ø¶ Ù…Ø¹Ø±ÙØ§Øª Ø§Ù„ØµÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø© Ø£Ùˆ Ù„Ø§ ØªÙ†ØªÙ…ÙŠ Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø©',
        code: 'INVALID_IMAGE_IDS',
        invalidIds: invalidImageIds
      });
    }

    // Update order for each image
    imageIds.forEach((imageId, index) => {
      const imageIndex = service.portfolioImages.findIndex(
        img => img._id.toString() === imageId
      );
      if (imageIndex !== -1) {
        service.portfolioImages[imageIndex].order = index;
      }
    });

    await service.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'services', service._id, {
      action: 'reorder_portfolio_images',
      newOrder: imageIds,
      serviceTitle: service.title
    }, req);

    res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ± Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        portfolioImages: service.portfolioImages.sort((a, b) => a.order - b.order)
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'reorder_portfolio_images_failed',
      imageIds: req.body.imageIds,
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ Ø§Ù„ØµÙˆØ±',
      code: 'REORDER_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

// ==================== MAIN IMAGES MANAGEMENT ====================

/**
 * @swagger
 * /api/admin/services/{id}/main-images:
 *   post:
 *     summary: Upload main cover images for a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               alt:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Main images uploaded successfully
 *       400:
 *         description: Invalid request or file validation error
 *       404:
 *         description: Service not found
 */
export const uploadMainImages = async (req, res) => {
  try {
    const { id } = req.params;
    // Enhanced security: Verify admin permissions again at controller level
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø±ÙØ¹ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Check if service exists
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Enhanced validation: Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ ØµÙˆØ±',
        code: 'NO_FILES_UPLOADED',
        details: 'ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ù„Ù ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„'
      });
    }

    // Security check: Validate maximum number of main images per service
    const maxMainImagesPerService = 5;
    const currentImageCount = service.mainImages?.length || 0;
    const newImageCount = req.files.length;
    
    if (currentImageCount + newImageCount > maxMainImagesPerService) {
      return res.status(400).json({
        success: false,
        error: `ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù. Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ ${maxMainImagesPerService} ØµÙˆØ± ØºÙ„Ø§Ù Ù„ÙƒÙ„ Ø®Ø¯Ù…Ø©`,
        code: 'MAX_MAIN_IMAGES_EXCEEDED',
        current: currentImageCount,
        attempting: newImageCount,
        maximum: maxMainImagesPerService
      });
    }

    // Process uploaded images with enhanced validation
    const uploadedImages = [];
    const altTexts = Array.isArray(req.body.alt) ? req.body.alt : (req.body.alt ? [req.body.alt] : []);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const altText = altTexts[i] || '';

      // Additional security validation for each file
      if (!file.path || !file.path.startsWith('https://')) {
        continue; // Skip invalid files
      }

      // Validate alt text if provided
      if (altText && altText.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'Ù†Øµ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø¨Ø¯ÙŠÙ„ Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§Ù‹ (Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ 200 Ø­Ø±Ù)',
          code: 'ALT_TEXT_TOO_LONG'
        });
      }

      const imageData = {
        url: file.path,
        alt: altText.trim(),
        order: (service.mainImages?.length || 0) + i,
        uploadedAt: new Date(),
        uploadedBy: req.user._id
      };

      uploadedImages.push(imageData);
    }

    // Ensure we have valid images to upload
    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø£ÙŠ ØµÙˆØ± ØµØ­ÙŠØ­Ø©',
        code: 'NO_VALID_IMAGES'
      });
    }

    // Initialize mainImages array if it doesn't exist
    if (!service.mainImages) {
      service.mainImages = [];
    }

    // Add images to service using atomic update to avoid validation issues
    await Service.findByIdAndUpdate(
      id,
      { 
        $push: { 
          mainImages: { $each: uploadedImages } 
        } 
      },
      { new: true, runValidators: false } // Skip validation to avoid affecting other fields
    );

    // Enhanced audit logging
    await AuditLog.logAction(req.user._id, 'update', 'services', service._id, {
      action: 'upload_main_images',
      imagesCount: uploadedImages.length,
      serviceTitle: service.title,
      imageUrls: uploadedImages.map(img => img.url),
      totalImagesAfter: service.mainImages.length
    }, req);

    res.json({
      success: true,
      message: `ØªÙ… Ø±ÙØ¹ ${uploadedImages.length} ØµÙˆØ±Ø© ØºÙ„Ø§Ù Ø¨Ù†Ø¬Ø§Ø­`,
      data: {
        uploadedImages,
        totalImages: service.mainImages.length,
        serviceId: service._id,
        serviceTitle: service.title
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'upload_main_images_failed',
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù',
      code: 'UPLOAD_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/main-images/{imageId}:
 *   delete:
 *     summary: Delete a main image from a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Main image deleted successfully
 *       404:
 *         description: Service or image not found
 */
export const deleteMainImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    // Enhanced security: Verify admin permissions
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­Ø°Ù ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Find and remove the image
    const initialImageCount = service.mainImages?.length || 0;
    if (!service.mainImages || service.mainImages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ± ØºÙ„Ø§Ù Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø©',
        code: 'NO_MAIN_IMAGES'
      });
    }

    const imageIndex = service.mainImages.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„ØµÙˆØ±Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'IMAGE_NOT_FOUND'
      });
    }

    // Store image URL for potential cleanup
    const deletedImage = service.mainImages[imageIndex];
    
    // Remove image using atomic update to avoid validation issues
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { 
        $pull: { 
          mainImages: { _id: imageId } 
        } 
      },
      { new: true, runValidators: false } // Skip validation to avoid affecting other fields
    );
    
    // Reorder remaining images using another atomic update
    if (updatedService && updatedService.mainImages.length > 0) {
      const reorderedImages = updatedService.mainImages.map((img, index) => ({
        ...img.toObject(),
        order: index
      }));
      
      await Service.findByIdAndUpdate(
        id,
        { mainImages: reorderedImages },
        { runValidators: false }
      );
    }

    // Enhanced audit logging
    await AuditLog.logAction(req.user._id, 'delete', 'services', service._id, {
      action: 'delete_main_image',
      deletedImageId: imageId,
      deletedImageUrl: deletedImage.url,
      serviceTitle: service.title,
      remainingImages: service.mainImages.length
    }, req);

    res.json({
      success: true,
      message: 'ØªÙ… Ø­Ø°Ù ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        deletedImageId: imageId,
        remainingImages: service.mainImages.length,
        mainImages: service.mainImages.sort((a, b) => a.order - b.order)
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'delete_main_image_failed',
      imageId: req.params.imageId,
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø­Ø°Ù ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù',
      code: 'DELETE_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/main-images:
 *   get:
 *     summary: Get all main images for a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Main images retrieved successfully
 *       404:
 *         description: Service not found
 */
export const getMainImages = async (req, res) => {
  try {
    const { id } = req.params;
    // Enhanced security: Verify admin permissions
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¹Ø±Ø¶ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    // Sort images by order
    const sortedImages = (service.mainImages || []).sort((a, b) => a.order - b.order);

    // Log admin action (optional for read operations)
    await AuditLog.logAction(req.user._id, 'view', 'services', service._id, {
      action: 'view_main_images',
      imagesCount: sortedImages.length,
      serviceTitle: service.title
    }, req);

    res.json({
      success: true,
      data: {
        mainImages: sortedImages,
        serviceId: service._id,
        serviceTitle: service.title,
        totalImages: sortedImages.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù',
      code: 'FETCH_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

/**
 * @swagger
 * /api/admin/services/{id}/main-images/reorder:
 *   put:
 *     summary: Reorder main images for a service
 *     tags: [Admin Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Main images reordered successfully
 *       404:
 *         description: Service not found
 */
export const reorderMainImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIds } = req.body;
    // Enhanced security: Verify admin permissions
    if (!req.user || !['admin', 'super_admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validate request
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ù‚Ø§Ø¦Ù…Ø© Ù…Ø¹Ø±ÙØ§Øª Ø§Ù„ØµÙˆØ± Ù…Ø·Ù„ÙˆØ¨Ø©',
        code: 'INVALID_IMAGE_IDS'
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Ø§Ù„Ø®Ø¯Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©',
        code: 'SERVICE_NOT_FOUND'
      });
    }

    if (!service.mainImages || service.mainImages.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ± ØºÙ„Ø§Ù Ù„Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨Ù‡Ø§',
        code: 'NO_MAIN_IMAGES'
      });
    }

    // Validate that all imageIds exist in the service's main images
    const existingImageIds = service.mainImages.map(img => img._id.toString());
    const invalidIds = imageIds.filter(id => !existingImageIds.includes(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'ØªÙˆØ¬Ø¯ Ù…Ø¹Ø±ÙØ§Øª ØµÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©',
        code: 'INVALID_IMAGE_IDS',
        invalidIds
      });
    }

    // Reorder the images using atomic update to avoid validation issues
    const reorderedImages = service.mainImages.map(img => {
      const newOrder = imageIds.indexOf(img._id.toString());
      return {
        ...img.toObject(),
        order: newOrder !== -1 ? newOrder : img.order
      };
    }).sort((a, b) => a.order - b.order);

    await Service.findByIdAndUpdate(
      id,
      { mainImages: reorderedImages },
      { runValidators: false } // Skip validation to avoid affecting other fields
    );

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'services', service._id, {
      action: 'reorder_main_images',
      newOrder: imageIds,
      serviceTitle: service.title
    }, req);

    res.json({
      success: true,
      message: 'ØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù Ø¨Ù†Ø¬Ø§Ø­',
      data: {
        mainImages: service.mainImages.sort((a, b) => a.order - b.order)
      }
    });

  } catch (error) {
    // Enhanced error logging
    await AuditLog.logAction(req.user?._id, 'error', 'services', req.params.id, {
      action: 'reorder_main_images_failed',
      imageIds: req.body.imageIds,
      error: error.message,
      stack: error.stack
    }, req).catch(console.error);

    res.status(500).json({
      success: false,
      error: 'ÙØ´Ù„ ÙÙŠ Ø¥Ø¹Ø§Ø¯Ø© ØªØ±ØªÙŠØ¨ ØµÙˆØ± Ø§Ù„ØºÙ„Ø§Ù',
      code: 'REORDER_FAILED',
      details: 'Ø­Ø¯Ø« Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰'
    });
  }
};

