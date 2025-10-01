import Contact from '../../models/Contact.js';
import AuditLog from '../../models/AuditLog.js';

/**
 * Get all contact messages for admin
 */
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status = 'all', type } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    // Get status counts
    const statusCounts = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'contacts', null, { filter }, req);

    res.json({
      success: true,
      data: {
        contacts,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
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
      error: 'Failed to retrieve contacts'
    });
  }
};

/**
 * Get contact by ID
 */
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Mark as read if unread
    if (contact.status === 'unread') {
      contact.status = 'read';
      await contact.save();
    }

    res.json({
      success: true,
      data: { contact }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact'
    });
  }
};

/**
 * Update contact status
 */
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    const oldStatus = contact.status;
    contact.status = status;
    if (adminNote) {
      contact.adminNote = adminNote;
    }
    contact.updatedAt = new Date();
    await contact.save();

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'contacts', contact._id, {
      before: { status: oldStatus },
      after: { status: contact.status },
      adminNote: adminNote
    }, req);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: { contact }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update contact status'
    });
  }
};

/**
 * Delete contact
 */
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    await Contact.findByIdAndDelete(id);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'delete', 'contacts', id, {
      name: contact.name,
      email: contact.email,
      subject: contact.subject
    }, req);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
};

/**
 * Bulk update contact status
 */
export const bulkUpdateContacts = async (req, res) => {
  try {
    const { ids, status, adminNote } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs are required'
      });
    }

    const updateData = { status, updatedAt: new Date() };
    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    const result = await Contact.updateMany(
      { _id: { $in: ids } },
      updateData
    );

    // Log admin action
    await AuditLog.logAction(req.user._id, 'update', 'contacts', null, {
      action: 'bulk_update',
      ids: ids,
      status: status,
      count: result.modifiedCount
    }, req);

    res.json({
      success: true,
      message: `${result.modifiedCount} contacts updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update contacts'
    });
  }
};

/**
 * Get contact statistics
 */
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      replied: 0,
      archived: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get contact statistics'
    });
  }
};

