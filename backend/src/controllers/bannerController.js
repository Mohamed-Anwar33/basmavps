import Banner from '../models/Banner.js';
import { validationResult } from 'express-validator';
import AuditLog from '../models/AuditLog.js';

// Get all banners with filtering and pagination
const getBanners = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      pageSlug,
      position,
      type,
      isActive,
      lang = 'ar'
    } = req.query;

    // Build filter object
    const filter = {};
    if (pageSlug) filter.pageSlug = pageSlug;
    if (position) filter.position = position;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Handle date-based filtering for active banners
    if (isActive === 'true') {
      const now = new Date();
      filter.$and = [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    const total = await Banner.countDocuments(filter);

    // Transform data based on language preference
    const transformedBanners = banners.map(banner => {
      if (lang === 'ar') {
        return {
          _id: banner._id,
          content: banner.title.ar,
          subtitle: banner.subtitle?.ar,
          description: banner.description?.ar,
          image: banner.image?.url,
          position: banner.position,
          pageSlug: banner.pageSlug,
          type: banner.type,
          isActive: banner.isActive,
          order: banner.order,
          createdAt: banner.createdAt,
          ctaButton: banner.ctaButton ? {
            text: banner.ctaButton.text.ar,
            link: banner.ctaButton.link,
            style: banner.ctaButton.style
          } : null
        };
      }
      return banner;
    });

    res.json({
      success: true,
      data: lang === 'ar' ? transformedBanners : banners,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب البنرات',
      error: error.message
    });
  }
};

// Get single banner by ID
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'البنر غير موجود'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø¨Ù†Ø±',
      error: error.message
    });
  }
};

// Create new banner
const createBanner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const bannerData = {
      ...req.body,
      createdBy: req.user?._id || req.admin?._id
    };

    const banner = new Banner(bannerData);
    await banner.save();

    // Log the action
    await AuditLog.create({
      actorId: req.user?._id || req.admin?._id,
      action: 'create',
      collectionName: 'Banner',
      documentId: banner._id,
      meta: {
        title: banner.title.ar,
        pageSlug: banner.pageSlug,
        position: banner.position
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء البنر بنجاح',
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء البنر',
      error: error.message
    });
  }
};

// Update banner
const updateBanner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user?._id || req.admin?._id
    };

    // Handle legacy content field - convert to title structure if needed
    if (updateData.content && !updateData.title) {
      updateData.title = {
        ar: updateData.content,
        en: updateData.content
      };
      delete updateData.content;
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'البنر غير موجود'
      });
    }

    // Log the action
    await AuditLog.create({
      actorId: req.user?._id || req.admin?._id,
      action: 'update',
      collectionName: 'Banner',
      documentId: banner._id,
      meta: {
        title: banner.title.ar,
        pageSlug: banner.pageSlug,
        position: banner.position
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث البنر بنجاح',
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث البنر',
      error: error.message
    });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'البنر غير موجود'
      });
    }

    // Log the action
    await AuditLog.create({
      actorId: req.user?._id || req.admin?._id,
      action: 'delete',
      collectionName: 'Banner',
      documentId: banner._id,
      meta: {
        title: banner.title.ar,
        pageSlug: banner.pageSlug,
        position: banner.position
      }
    });

    res.json({
      success: true,
      message: 'تم حذف البنر بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف البنر',
      error: error.message
    });
  }
};
// Update banner order
const updateBannerOrder = async (req, res) => {
  try {
    const { banners } = req.body;

    if (!Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: 'ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø§Ù„Ø¨Ù†Ø±Ø§Øª Ù…ØµÙÙˆÙØ©'
      });
    }

    // Update each banner's order
    const updatePromises = banners.map((item, index) => 
      Banner.findByIdAndUpdate(
        item.id,
        { 
          order: index + 1,
          updatedBy: req.user?._id || req.admin?._id
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Log the action
    await AuditLog.create({
      actorId: req.user?._id || req.admin?._id,
      action: 'update',
      collectionName: 'Banner',
      meta: {
        bannersCount: banners.length,
        action: 'bulk_reorder'
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث ترتيب البنرات بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ« ØªØ±ØªÙŠØ¨ Ø§Ù„Ø¨Ù†Ø±Ø§Øª',
      error: error.message
    });
  }
};

// Toggle banner status
const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'البنر غير موجود'
      });
    }

    banner.isActive = !banner.isActive;
    banner.updatedBy = req.user?._id || req.admin?._id;
    await banner.save();

    // Log the action
    await AuditLog.create({
      actorId: req.user?._id || req.admin?._id,
      action: banner.isActive ? 'activate' : 'deactivate',
      collectionName: 'Banner',
      documentId: banner._id,
      meta: {
        title: banner.title.ar,
        newStatus: banner.isActive
      }
    });

    res.json({
      success: true,
      message: `ØªÙ… ${banner.isActive ? 'ØªÙØ¹ÙŠÙ„' : 'Ø¥Ù„ØºØ§Ø¡ ØªÙØ¹ÙŠÙ„'} Ø§Ù„Ø¨Ù†Ø± Ø¨Ù†Ø¬Ø§Ø­`,
      data: { isActive: banner.isActive }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ ØªØºÙŠÙŠØ± Ø­Ø§Ù„Ø© Ø§Ù„Ø¨Ù†Ø±',
      error: error.message
    });
  }
};

// Track banner view
const trackBannerView = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'البنر غير موجود'
      });
    }

    await banner.incrementViews();

    res.json({
      success: true,
      message: 'تم تسجيل المشاهدة'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø©',
      error: error.message
    });
  }
};

// Track banner click
const trackBannerClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'البنر غير موجود'
      });
    }

    await banner.incrementClicks();

    res.json({
      success: true,
      message: 'تم تسجيل النقرة'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù†Ù‚Ø±Ø©',
      error: error.message
    });
  }
};

// Get banner analytics
const getBannerAnalytics = async (req, res) => {
  try {
    const { pageSlug, position, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (pageSlug) filter.pageSlug = pageSlug;
    if (position) filter.position = position;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Banner.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBanners: { $sum: 1 },
          activeBanners: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalClicks: { $sum: '$clicks' },
          avgViews: { $avg: '$views' },
          avgClicks: { $avg: '$clicks' }
        }
      }
    ]);

    const result = analytics[0] || {
      totalBanners: 0,
      activeBanners: 0,
      totalViews: 0,
      totalClicks: 0,
      avgViews: 0,
      avgClicks: 0
    };

    // Calculate CTR (Click Through Rate)
    result.ctr = result.totalViews > 0 ? 
      ((result.totalClicks / result.totalViews) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø¨Ù†Ø±Ø§Øª',
      error: error.message
    });
  }
};

export default {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerOrder,
  toggleBannerStatus,
  trackBannerView,
  trackBannerClick,
  getBannerAnalytics
};

