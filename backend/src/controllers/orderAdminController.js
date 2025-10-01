import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import AuditLog from '../models/AuditLog.js';
import Payment from '../models/Payment.js';

/**
 * @swagger
 * tags:
 *   name: Admin Orders
 *   description: Order management for admin panel
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders for admin panel
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number or customer info
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
export const getOrders = async (req, res) => {
  try {
    const { 
      scope = 'paid',
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build match criteria
    const match = {};
    
    // 🔧 FIX: Admin should see ALL orders, not just paid ones
    // This was causing issues where orders were visible in getOrders but not updateable
    if (scope === 'paid-only') {
      match.paymentStatus = 'paid'; // فقط الطلبات التي تم دفعها بنجاح
      match.orderNumber = { $exists: true, $ne: null }; // ضمان وجود رقم طلب صحيح
    }
    // Default behavior: show all orders for admin management
    
    if (status) {
      match.status = status;
    }
    
    if (paymentStatus) {
      match.paymentStatus = paymentStatus;
    }
    
    if (search) {
      match.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'guestInfo.name': { $regex: search, $options: 'i' } },
        { 'guestInfo.email': { $regex: search, $options: 'i' } },
        { 'guestInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get orders with population - remove problematic populates for now
    const orders = await Order.find(match)
      .populate('userId', 'name email phone createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
      
    // Get total count
    const total = await Order.countDocuments(match);
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Format orders for admin view
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // Add customer info - Priority: Payment form data > Guest info > User account
      if (order.guestInfo && (order.guestInfo.name || order.guestInfo.email || order.guestInfo.phone)) {
        // Use payment form data (what customer entered during checkout)
        orderObj.customerInfo = {
          isRegistered: !!order.userId,
          name: order.guestInfo.name || (order.userId ? order.userId.name : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'),
          email: order.guestInfo.email || (order.userId ? order.userId.email : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'),
          phone: order.guestInfo.phone || (order.userId ? order.userId.phone : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'),
          source: 'payment_form', // Indicates this came from payment form
          userCreatedAt: order.userId?.createdAt
        };
      } else if (order.userId) {
        // Fallback to user account data if no payment form data
        orderObj.customerInfo = {
          isRegistered: true,
          name: order.userId.name,
          email: order.userId.email,
          phone: order.userId.phone,
          source: 'user_account', // Indicates this came from user account
          userCreatedAt: order.userId.createdAt
        };
      } else if (order.customerInfo) {
        // Use existing customerInfo if available
        orderObj.customerInfo = {
          ...order.customerInfo,
          isRegistered: false,
          source: 'existing_data'
        };
      } else {
        // Default fallback
        orderObj.customerInfo = {
          isRegistered: false,
          name: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
          email: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
          phone: 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯',
          source: 'default'
        };
      }

      // Add payment info if exists
      if (order.paymentId) {
        orderObj.payment = {
          status: order.paymentId.status,
          amount: order.paymentId.amount,
          currency: order.paymentId.currency,
          createdAt: order.paymentId.createdAt
        };
      }

      // Extract service info from first item for frontend compatibility
      if (order.items && order.items.length > 0) {
        const firstItem = order.items[0];
        orderObj.service = {
          title: firstItem.serviceId?.title || firstItem.title,
          price: firstItem.price || firstItem.serviceId?.price,
          category: firstItem.serviceId?.category
        };
        
        // Backward compatibility - add total amount if not exists
        if (!orderObj.totalAmount && firstItem.price) {
          orderObj.totalAmount = firstItem.price * (firstItem.quantity || 1);
        }
      }

      // Add project description and notes for admin view
      if (order.description) {
        orderObj.description = order.description;
      }
      
      if (order.notes) {
        orderObj.additionalNotes = order.notes;
      }

      // Add attachments if they exist
      if (order.attachments && order.attachments.length > 0) {
        orderObj.attachments = order.attachments;
      }

      return orderObj;
    });

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        total: total,
        pages: totalPages,
        currentPage: parseInt(page),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get single order details
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       404:
 *         description: Order not found
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email phone')
      .populate('items.serviceId', 'title description category price')
      .populate('paymentId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const orderObj = order.toObject();
    
    // Add customer info
    if (order.userId) {
      orderObj.customer = {
        type: 'user',
        id: order.userId._id,
        name: order.userId.name,
        email: order.userId.email,
        phone: order.userId.phone
      };
    } else if (order.guestInfo) {
      orderObj.customer = {
        type: 'guest',
        name: order.guestInfo.name,
        email: order.guestInfo.email,
        phone: order.guestInfo.phone
      };
    }

    res.json({
      success: true,
      data: {
        order: orderObj
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, delivered, cancelled]
 *               notes:
 *                 type: string
 *                 description: Optional notes about the status change
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminUser = req.user;

    console.log('🔄 Order Status Update Request:', { id, status, notes, adminUser: adminUser?.email });

    // Enhanced validation - check if ID is ObjectId or orderNumber
    let searchCriteria = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('✅ Valid ObjectId format:', id);
      searchCriteria = { _id: id };
    } else if (id.includes('BD')) {
      console.log('✅ OrderNumber format detected:', id);
      searchCriteria = { orderNumber: id };
    } else {
      console.log('❌ Invalid ID format:', id);
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID format. Must be ObjectId or orderNumber (BD...)',
        debug: { received: id, isObjectId: mongoose.Types.ObjectId.isValid(id), includesBD: id.includes('BD') }
      });
    }

    // Validate status - include all statuses actually used in the system
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    console.log('🔍 Searching for order with criteria:', searchCriteria);
    
    // Try to find the order first with detailed logging - ALLOW ALL ORDERS, NOT JUST PAID
    let order = await Order.findOne(searchCriteria);
    console.log('📋 Order search result:', {
      found: !!order,
      orderNumber: order?.orderNumber,
      orderId: order?._id,
      status: order?.status,
      paymentStatus: order?.paymentStatus
    });
    
    if (!order) {
      console.log('❌ Order not found. Checking all orders for debug...');
      
      // Debug: Get all orders to see what's available
      const allOrders = await Order.find({}).select('_id orderNumber status paymentStatus').limit(10);
      console.log('🔍 Available orders sample:', allOrders.map(o => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus
      })));
      
      // 🔍 IMPORTANT: Check if the order exists with different payment status
      let orderWithDifferentPayment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        orderWithDifferentPayment = await Order.findById(id);
      } else if (id.includes('BD')) {
        orderWithDifferentPayment = await Order.findOne({ orderNumber: id });
      }
      
      if (orderWithDifferentPayment) {
        console.log('🎯 FOUND ORDER with different criteria:', {
          id: orderWithDifferentPayment._id,
          orderNumber: orderWithDifferentPayment.orderNumber,
          status: orderWithDifferentPayment.status,
          paymentStatus: orderWithDifferentPayment.paymentStatus
        });
        
        // Use the found order
        order = orderWithDifferentPayment;
      } else {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
          debug: {
            searchCriteria,
            receivedId: id,
            availableOrdersCount: allOrders.length,
            sampleOrders: allOrders.slice(0, 3).map(o => ({
              id: o._id.toString(),
              orderNumber: o.orderNumber,
              paymentStatus: o.paymentStatus
            }))
          }
        });
      }
    }

    const oldStatus = order.status;
    console.log('📊 Updating status from:', oldStatus, 'to:', status);

    // Use findByIdAndUpdate for better reliability
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { 
        status: status,
        ...(status === 'delivered' && oldStatus !== 'delivered' ? {
          deliveredAt: new Date(),
          deliveryEmailSent: true
        } : {}),
        ...(notes ? {
          notes: order.notes ? `${order.notes}\nStatus changed from "${oldStatus}" to "${status}" by ${adminUser.name || adminUser.email}: ${notes}` : `Status changed from "${oldStatus}" to "${status}" by ${adminUser.name || adminUser.email}: ${notes}`
        } : {})
      },
      { new: true }
    );

    console.log('✅ Order updated successfully:', updatedOrder ? 'Yes' : 'No');

    // Log the action
    await AuditLog.create({
      actorId: adminUser._id,
      action: 'update',
      collectionName: 'Order',
      documentId: order._id,
      changes: {
        status: { old: oldStatus, new: status }
      },
      meta: {
        notes,
        adminAction: 'status_update'
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: {
        order: {
          id: updatedOrder._id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          updatedAt: updatedOrder.updatedAt
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get orders statistics
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: month
 *         description: Statistics period
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
export const getOrdersStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get basic counts first
    const totalOrdersCount = await Order.countDocuments();
    const paidOrdersCount = await Order.countDocuments({ paymentStatus: 'paid' });
    
    // Get aggregated statistics - with fallback for empty results
    let stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } },
          averageOrderValue: { $avg: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', null] } },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgressOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Handle empty results with fallback
    const result = stats.length > 0 ? stats[0] : {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      inProgressOrders: 0,
      completedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      paidOrders: 0,
      pendingPayments: 0,
      failedPayments: 0
    };

    // Add overall stats
    result.totalOrdersOverall = totalOrdersCount;
    result.paidOrdersOverall = paidOrdersCount;

    res.json({
      success: true,
      data: {
        period,
        statistics: result
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics',
      details: error.message
    });
  }
};

// Bulk operations
export const bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, action, data } = req.body;
    const adminUser = req.user;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order IDs are required'
      });
    }

    let updateData = {};
    let logAction = '';

    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return res.status(400).json({
            success: false,
            error: 'Status is required for bulk status update'
          });
        }
        updateData.status = data.status;
        logAction = 'bulk_status_update';
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid bulk action'
        });
    }

    // Update orders
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      updateData
    );

    // Log the bulk action
    await AuditLog.create({
      actorId: adminUser._id,
      action: 'bulk_update',
      collectionName: 'Order',
      meta: {
        action: logAction,
        orderIds,
        updateData,
        modifiedCount: result.modifiedCount
      }
    });

    res.json({
      success: true,
      message: `ØªÙ… ØªØ­Ø¯ÙŠØ« ${result.modifiedCount} Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk update',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/{id}/delete:
 *   delete:
 *     summary: Delete a pending order (only unpaid orders)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       403:
 *         description: Cannot delete paid order
 *       404:
 *         description: Order not found
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    // التحقق من صلاحيات الإدارة
    if (!['admin', 'super_admin', 'superadmin'].includes(adminUser.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Admin privileges required',
        debug: { userRole: adminUser.role, allowedRoles: ['admin', 'super_admin', 'superadmin'] }
      });
    }

    // البحث عن الطلب
    const order = await Order.findById(id).populate('paymentId');
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود'
      });
    }

    // 🔒 SECURITY: منع حذف الطلبات المدفوعة بنجاح
    if (order.paymentStatus === 'paid') {
      return res.status(403).json({
        success: false,
        error: 'لا يمكن حذف طلب مدفوع بنجاح',
        details: `الطلب رقم ${order.orderNumber} تم دفعه بنجاح ولا يمكن حذفه`
      });
    }

    // التحقق من وجود دفعة مرتبطة ناجحة
    if (order.paymentId) {
      const payment = await Payment.findById(order.paymentId);
      if (payment && payment.status === 'succeeded') {
        return res.status(403).json({
          success: false,
          error: 'لا يمكن حذف طلب له دفعة ناجحة',
          details: 'يوجد دفعة ناجحة مرتبطة بهذا الطلب'
        });
      }
    }

    // جمع معلومات للـ audit log
    const orderInfo = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      status: order.status,
      total: order.total,
      currency: order.currency,
      guestInfo: order.guestInfo,
      createdAt: order.createdAt,
      deletedReason: 'Admin manual deletion - unpaid order'
    };

    // حذف المدفوعة المرتبطة إذا كانت موجودة وفاشلة
    if (order.paymentId) {
      const payment = await Payment.findById(order.paymentId);
      if (payment && ['pending', 'failed', 'cancelled'].includes(payment.status)) {
        await Payment.findByIdAndDelete(order.paymentId);
      }
    }

    // حذف الطلب
    await Order.findByIdAndDelete(id);

    // تسجيل العملية في Audit Log
    await AuditLog.create({
      actorId: adminUser._id,
      action: 'delete',
      collectionName: 'Order',
      documentId: id,
      meta: {
        deletedBy: adminUser.email,
        orderInfo,
        adminDelete: true,
        reason: 'Manual deletion of unpaid order'
      }
    });

    res.json({
      success: true,
      message: `تم حذف الطلب بنجاح`,
      data: {
        deletedOrderId: id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        deletedBy: adminUser.email,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في حذف الطلب',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/bulk-delete:
 *   post:
 *     summary: Bulk delete pending orders
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Orders deleted successfully
 */
export const bulkDeleteOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    const adminUser = req.user;

    // التحقق من صلاحيات الإدارة
    if (!['admin', 'super_admin', 'superadmin'].includes(adminUser.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Admin privileges required',
        debug: { userRole: adminUser.role, allowedRoles: ['admin', 'super_admin', 'superadmin'] }
      });
    }

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير قائمة معرفات الطلبات'
      });
    }

    // 🔍 Debug: فحص الطلبات المرسلة من Frontend
    
    // فحص جميع الطلبات أولاً
    const allOrders = await Order.find({ _id: { $in: orderIds } }).select('_id orderNumber paymentStatus status');
    allOrders.forEach(order => {
    });
    
    // البحث عن الطلبات والتحقق من أنها غير مدفوعة
    const orders = await Order.find({ 
      _id: { $in: orderIds },
      paymentStatus: { $ne: 'paid' } // فقط الطلبات غير المدفوعة
    }).populate('paymentId');
    

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم العثور على طلبات قابلة للحذف (طلبات غير مدفوعة)',
        debug: {
          receivedIds: orderIds.length,
          foundOrders: allOrders.length,
          unpaidOrders: orders.length,
          orders: allOrders.map(o => ({ id: o._id, paymentStatus: o.paymentStatus, status: o.status }))
        }
      });
    }

    let deletedCount = 0;
    const deletedOrders = [];
    const errors = [];

    for (const order of orders) {
      try {
        // التحقق من عدم وجود دفعة ناجحة
        if (order.paymentId) {
          const payment = await Payment.findById(order.paymentId);
          if (payment && payment.status === 'succeeded') {
            errors.push({
              orderId: order._id,
              error: `الطلب ${order.orderNumber || order._id} له دفعة ناجحة`
            });
            continue;
          }
          
          // حذف المدفوعة الفاشلة/المعلقة
          if (payment && ['pending', 'failed', 'cancelled'].includes(payment.status)) {
            await Payment.findByIdAndDelete(order.paymentId);
          }
        }

        // حذف الطلب
        await Order.findByIdAndDelete(order._id);
        deletedCount++;
        
        deletedOrders.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          total: order.total,
          currency: order.currency
        });

      } catch (error) {
        errors.push({
          orderId: order._id,
          error: error.message
        });
      }
    }

    // تسجيل العملية في Audit Log
    await AuditLog.create({
      actorId: adminUser._id,
      action: 'bulk_delete',
      collectionName: 'Order',
      meta: {
        deletedBy: adminUser.email,
        requestedIds: orderIds,
        deletedCount,
        deletedOrders,
        errors,
        adminBulkDelete: true
      }
    });

    res.json({
      success: true,
      message: `تم حذف ${deletedCount} طلب من أصل ${orderIds.length}`,
      data: {
        deletedCount,
        totalRequested: orderIds.length,
        deletedOrders,
        errors,
        deletedBy: adminUser.email,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في حذف الطلبات',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/debug-status:
 *   get:
 *     summary: Debug orders status
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders status retrieved
 */
export const debugOrdersStatus = async (req, res) => {
  try {
    // الحصول على جميع الطلبات مع حالاتها
    const allOrders = await Order.find({}).select('_id orderNumber paymentStatus status createdAt').sort({ createdAt: -1 }).limit(20);
    
    const statusBreakdown = {
      total: allOrders.length,
      paid: allOrders.filter(o => o.paymentStatus === 'paid').length,
      pending: allOrders.filter(o => o.paymentStatus === 'pending').length,
      failed: allOrders.filter(o => o.paymentStatus === 'failed').length,
      other: allOrders.filter(o => !['paid', 'pending', 'failed'].includes(o.paymentStatus)).length
    };
    
    res.json({
      success: true,
      data: {
        statusBreakdown,
        recentOrders: allOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt
        }))
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get debug info',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/orders/statistics:
 *   get:
 *     summary: Get orders statistics
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders statistics retrieved
 */
export const getOrderStatistics = async (req, res) => {
  try {
    const stats = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'in_progress' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ paymentStatus: 'pending' }),
      Order.countDocuments({ paymentStatus: 'failed' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ])
    ]);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inProgressOrders,
      completedOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      pendingPayments,
      failedPayments,
      revenueResult
    ] = stats;

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrders,
        pendingPayments,
        failedPayments,
        totalRevenue,
        ordersByStatus: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          in_progress: inProgressOrders,
          completed: completedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        ordersByPayment: {
          paid: paidOrders,
          pending: pendingPayments,
          failed: failedPayments
        }
      }
    });

  } catch (error) {
    console.error('Orders statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders statistics',
      details: error.message
    });
  }
};

