import Service from '../models/Service.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management endpoints
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services with pagination and filtering
 *     tags: [Services]
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
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [SAR, USD]
 *           default: SAR
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [ar, en]
 *           default: ar
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const getServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      currency = 'SAR',
      lang = 'ar',
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Add search filter
    if (search) {
      query.$or = [
        { [`title.${lang}`]: { $regex: search, $options: 'i' } },
        { [`description.${lang}`]: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Add price filter
    if (minPrice || maxPrice) {
      query[`price.${currency}`] = {};
      if (minPrice) query[`price.${currency}`].$gte = parseFloat(minPrice);
      if (maxPrice) query[`price.${currency}`].$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [services, total] = await Promise.all([
      Service.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Service.countDocuments(query)
    ]);

    // Calculate pagination info
    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          total,
          page: pageNum,
          pages,
          limit: limitNum
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
 * /api/services/featured:
 *   get:
 *     summary: Get featured services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Featured services retrieved successfully
 */
export const getFeaturedServices = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const services = await Service.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: { services }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve featured services'
    });
  }
};

/**
 * @swagger
 * /api/services/{slug}:
 *   get:
 *     summary: Get service by slug
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
export const getServiceBySlug = async (req, res) => {
  try {
    let { slug } = req.params;
    
    // Decode URL-encoded slug (for Arabic characters)
    try {
      slug = decodeURIComponent(slug);
      } catch (decodeError) {
      }

    // Check if the parameter is a MongoDB ObjectId (24 hex characters) or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let service;
    if (isObjectId) {
      // If it's an ObjectId, search by _id
      service = await Service.findOne({ _id: slug, isActive: true });
    } else {
      // If it's not an ObjectId, search by slug
      service = await Service.findOne({ slug, isActive: true });
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Increment views (safely)
    try {
      await service.incrementViews();
    } catch (viewError) {
      console.log('View increment failed:', viewError.message);
    }

    // Log view if user is authenticated
    if (req.user) {
      try {
        await AuditLog.logAction(req.user._id, 'view', 'services', service._id, null, req);
      } catch (logError) {
        console.log('Audit log failed:', logError.message);
      }
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
 * /api/services/categories:
 *   get:
 *     summary: Get all unique categories used in services (public endpoint)
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                           label:
 *                             type: string
 *       500:
 *         description: Server error
 */
export const getCategories = async (req, res) => {
  try {
    // Get all unique categories from active services only
    const categories = await Service.distinct('category', { isActive: true });
    
    // Default categories with Arabic labels - Based on actual database categories
    const defaultCategories = [
      { value: 'social-media', label: 'السوشيال ميديا' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'banners', label: 'البنرات' },
      { value: 'cv-design', label: 'تصميم السير الذاتية' },
      { value: 'content-writing', label: 'كتابة المحتوى' },
      { value: 'logo-design', label: 'تصميم الشعارات' },
      { value: 'consultation', label: 'الاستشارات' },
      { value: 'management', label: 'إدارة الحسابات' },
      { value: 'cv-templates', label: 'قوالب السير الذاتية' }
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
 * /api/services/categories/stats:
 *   get:
 *     summary: Get service categories with counts and stats
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Categories with stats retrieved successfully
 */
export const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.SAR' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryMap = {
      'social-media': { ar: 'ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ', en: 'Social Media' },
      'branding': { ar: 'Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©', en: 'Branding' },
      'web-design': { ar: 'ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹', en: 'Web Design' },
      'print-design': { ar: 'Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…Ø·Ø¨ÙˆØ¹', en: 'Print Design' },
      'cv-templates': { ar: 'Ù‚ÙˆØ§Ù„Ø¨ Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©', en: 'CV Templates' },
      'marketing': { ar: 'Ø§Ù„ØªØ³ÙˆÙŠÙ‚', en: 'Marketing' },
      'consulting': { ar: 'Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª', en: 'Consulting' }
    };

    const formattedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryMap[cat._id] || { ar: cat._id, en: cat._id },
      count: cat.count,
      avgPrice: Math.round(cat.avgPrice || 0)
    }));

    res.json({
      success: true,
      data: { categories: formattedCategories }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories'
    });
  }
};

