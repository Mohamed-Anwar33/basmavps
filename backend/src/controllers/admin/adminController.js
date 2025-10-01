import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Payment from '../../models/Payment.js';
import Service from '../../models/Service.js';
import Blog from '../../models/Blog.js';
import Contact from '../../models/Contact.js';
import AuditLog from '../../models/AuditLog.js';
import OrderCleanupService from '../../services/OrderCleanupService.js';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get basic counts - فقط البيانات النظيفة
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' }); // فقط الطلبات المدفوعة
    const totalServices = await Service.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalContacts = await Contact.countDocuments();
    
    // 🧹 إحصائيات التنظيف المطلوبة
    const cleanupStats = await OrderCleanupService.getCleanupStats();

    // Get order statistics
    const orderStats = await Order.getStatistics(startDate, endDate);
    
    // Get payment statistics
    const paymentStats = await Payment.getStatistics(startDate, endDate);

    // Get recent activity
    const recentActivity = await AuditLog.getRecentActivity(10);

    // Get pending items with updated status fields
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const inProgressOrders = await Order.countDocuments({ status: 'in_progress' });
    const pendingPayments = await Order.countDocuments({ paymentStatus: 'pending' });
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalServices,
          totalBlogs,
          totalContacts
        },
        orders: orderStats,
        payments: paymentStats,
        pending: {
          orders: pendingOrders,
          inProgressOrders: inProgressOrders,
          pendingPayments: pendingPayments,
          contacts: newContacts,
          blogs: draftBlogs
        },
        // 🧹 إحصائيات التنظيف والصيانة
        cleanup: {
          needsCleanup: cleanupStats.needsCleanup,
          pendingOrders: cleanupStats.pendingOrders,
          failedPayments: cleanupStats.failedPayments,
          healthStatus: cleanupStats.needsCleanup ? 'warning' : 'healthy'
        },
        trends: {
          monthlyRevenue
        },
        recentActivity
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/{id}/payment-status:
 *   put:
 *     summary: Update order payment status
 *     tags: [Admin]
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
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order payment status updated successfully
 */
export const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, notes } = req.body;

    const order = await Order.findById(id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const oldPaymentStatus = order.paymentStatus || null;
    order.paymentStatus = paymentStatus;

    if (notes) {
      const adminNote = `[${new Date().toLocaleString('ar-SA')}] Payment: ${notes}`;
      order.notes = (order.notes ? order.notes + '\n' : '') + adminNote;
    }

    await order.save();

    // Optional notification to customer when becomes paid
    if (paymentStatus === 'paid') {
      try {
        const customerEmail = order.userId ? order.userId.email : order.guestInfo?.email;
        const customerName = order.userId ? order.userId.name : order.guestInfo?.name;
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: `ØªØ£ÙƒÙŠØ¯ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¯ÙØ¹ Ù„Ø·Ù„Ø¨Ùƒ #${order.orderNumber} - Ø¨ØµÙ…Ø© ØªØµÙ…ÙŠÙ…`,
            template: 'order-status-update',
            context: {
              customerName,
              orderNumber: order.orderNumber,
              serviceName: 'Ø·Ù„Ø¨Ùƒ',
              status: 'Ù…Ø¯ÙÙˆØ¹',
              statusColor: '#13c2c2',
              notes: notes || null,
              orderUrl: `${process.env.FRONTEND_URL}/profile/orders/${order._id}`
            }
          });
        }
      } catch (e) {
        }
    }

    await AuditLog.logAction(req.user._id, 'update', 'orders', order._id, {
      before: { paymentStatus: oldPaymentStatus },
      after: { paymentStatus }
    }, req);

    res.json({
      success: true,
      message: 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø¯ÙØ¹ Ø¨Ù†Ø¬Ø§Ø­',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order payment status' });
  }
};

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, editor, admin, superadmin]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'users', null, { filter }, req);

    res.json({
      success: true,
      data: {
        users,
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
      error: 'Failed to retrieve users'
    });
  }
};

// Order management functions moved to orderAdminController.js

// Order status update function moved to orderAdminController.js

/**
 * @swagger
 * /api/admin/contacts:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Admin]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, read, replied, archived]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Contact messages retrieved successfully
 */
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;
    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    // Log admin action
    await AuditLog.logAction(req.user._id, 'view', 'contacts', null, { filter }, req);

    res.json({
      success: true,
      data: {
        contacts,
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
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
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
 *           default: 50
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: collection
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, collection, userId } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (collection) filter.collection = collection;
    if (userId) filter.actorId = userId;

    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(filter)
      .populate('actorId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
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
      error: 'Failed to retrieve audit logs'
    });
  }
};

