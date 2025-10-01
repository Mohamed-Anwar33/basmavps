import FAQ from '../models/FAQ.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQ management endpoints
 */

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Get all active FAQs
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, services, payment, delivery, support]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQs retrieved successfully
 */
export const getFAQs = async (req, res) => {
  try {
    const { category, search } = req.query;

    let faqs;
    if (search) {
      faqs = await FAQ.search(search);
    } else {
      faqs = await FAQ.findActive(category);
    }

    res.json({
      success: true,
      data: { faqs }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve FAQs'
    });
  }
};

/**
 * @swagger
 * /api/faqs/categories:
 *   get:
 *     summary: Get FAQ categories with counts
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
export const getFAQCategories = async (req, res) => {
  try {
    const categories = await FAQ.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryMap = {
      'general': { ar: 'Ø¹Ø§Ù…', en: 'General' },
      'services': { ar: 'Ø§Ù„Ø®Ø¯Ù…Ø§Øª', en: 'Services' },
      'payment': { ar: 'Ø§Ù„Ø¯ÙØ¹', en: 'Payment' },
      'delivery': { ar: 'Ø§Ù„ØªØ³Ù„ÙŠÙ…', en: 'Delivery' },
      'support': { ar: 'Ø§Ù„Ø¯Ø¹Ù…', en: 'Support' }
    };

    const formattedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryMap[cat._id] || { ar: cat._id, en: cat._id },
      count: cat.count
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

/**
 * @swagger
 * /api/faqs/{id}/helpful:
 *   post:
 *     summary: Mark FAQ as helpful
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ marked as helpful
 *       404:
 *         description: FAQ not found
 */
export const markFAQHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    await faq.markHelpful();

    // Log the action if user is authenticated
    if (req.user) {
      await AuditLog.logAction(req.user._id, 'update', 'faqs', faq._id, 
        { action: 'marked_helpful' }, req);
    }

    res.json({
      success: true,
      message: 'FAQ marked as helpful'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark FAQ as helpful'
    });
  }
};

/**
 * @swagger
 * /api/faqs/{id}/not-helpful:
 *   post:
 *     summary: Mark FAQ as not helpful
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ marked as not helpful
 *       404:
 *         description: FAQ not found
 */
export const markFAQNotHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    await faq.markNotHelpful();

    // Log the action if user is authenticated
    if (req.user) {
      await AuditLog.logAction(req.user._id, 'update', 'faqs', faq._id, 
        { action: 'marked_not_helpful' }, req);
    }

    res.json({
      success: true,
      message: 'FAQ marked as not helpful'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark FAQ as not helpful'
    });
  }
};

