import FAQ from '../../models/FAQ.js';
import AuditLog from '../../models/AuditLog.js';

/**
 * Get all FAQs for admin
 */
export const getFAQs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status = 'all' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const faqs = await FAQ.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FAQ.countDocuments(filter);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'faqs', null, { filter }, req);

    res.json({
      success: true,
      data: {
        faqs,
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
      error: 'Failed to retrieve FAQs'
    });
  }
};

/**
 * Create new FAQ
 */
export const createFAQ = async (req, res) => {
  try {
    const faqData = req.body;
    
    // Set order if not provided
    if (!faqData.order) {
      const maxOrder = await FAQ.findOne().sort({ order: -1 }).select('order');
      faqData.order = (maxOrder?.order || 0) + 1;
    }

    const faq = new FAQ(faqData);
    await faq.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'create', 'faqs', faq._id, {
      question: faq.question,
      category: faq.category,
      status: faq.status
    }, req);

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: { faq }
    });

  } catch (error) {
    console.error('❌ FAQ Creation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create FAQ',
      details: error.message
    });
  }
};

/**
 * Get FAQ by ID
 */
export const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      data: { faq }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve FAQ'
    });
  }
};

/**
 * Update FAQ
 */
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    const oldData = faq.toObject();
    Object.assign(faq, updateData);
    await faq.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'faqs', faq._id, {
      before: { question: oldData.question, category: oldData.category, status: oldData.status },
      after: { question: faq.question, category: faq.category, status: faq.status }
    }, req);

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: { faq }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update FAQ'
    });
  }
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    await FAQ.findByIdAndDelete(id);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'delete', 'faqs', id, {
      question: faq.question,
      category: faq.category
    }, req);

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete FAQ'
    });
  }
};

/**
 * Update FAQ order
 */
export const updateFAQOrder = async (req, res) => {
  try {
    const { faqs } = req.body; // Array of {id, order}

    const bulkOps = faqs.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order }
      }
    }));

    await FAQ.bulkWrite(bulkOps);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'faqs', null, {
      action: 'reorder',
      items: faqs.length
    }, req);

    res.json({
      success: true,
      message: 'FAQ order updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update FAQ order'
    });
  }
};

