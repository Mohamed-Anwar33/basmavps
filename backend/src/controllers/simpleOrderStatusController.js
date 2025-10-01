import mongoose from 'mongoose';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Simple and clean order status update controller
 * يعمل مع جميع الطلبات بدون تعقيدات
 */
export const updateOrderStatusSimple = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminUser = req.user;

    console.log('🔄 Simple Order Status Update:', { id, status, admin: adminUser?.email });

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find order - Support both ObjectId AND orderNumber
    let order = null;
    let searchMethod = 'unknown';
    
    // Method 1: Try orderNumber if it looks like one
    if (id.includes('BD')) {
      order = await Order.findOne({ orderNumber: id });
      searchMethod = 'orderNumber';
      console.log('🔍 Search by orderNumber:', order ? 'Found' : 'Not found');
    }
    
    // Method 2: Try ObjectId with regex (this works when normal ObjectId fails)
    if (!order && mongoose.Types.ObjectId.isValid(id)) {
      try {
        // Use regex matching on _id as string - this works around ObjectId corruption
        order = await Order.findOne({
          $expr: { $eq: [{ $toString: "$_id" }, id] }
        });
        searchMethod = 'objectId_regex_string';
        console.log('🔍 Search by ObjectId (regex string match):', order ? 'Found' : 'Not found');
      } catch (objectIdError) {
        console.log('⚠️ ObjectId regex search error:', objectIdError.message);
      }
    }
    
    // Method 3: Try alternative ObjectId conversion
    if (!order && mongoose.Types.ObjectId.isValid(id)) {
      try {
        // Try converting to ObjectId and back to string
        const objId = new mongoose.Types.ObjectId(id);
        order = await Order.findOne({
          $expr: { $eq: ["$_id", objId] }
        });
        searchMethod = 'objectId_expr_match';
        console.log('🔍 Search by ObjectId (expr match):', order ? 'Found' : 'Not found');
      } catch (objectIdError) {
        console.log('⚠️ ObjectId expr search error:', objectIdError.message);
      }
    }
    
    // Method 4: Try direct string matching for orderNumber
    if (!order) {
      order = await Order.findOne({
        $or: [
          { orderNumber: id },
          { 'orderNumber': { $regex: id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
        ]
      });
      searchMethod = 'string_match';
      console.log('🔍 Search by string match:', order ? 'Found' : 'Not found');
    }

    if (!order) {
      console.log('❌ Order not found anywhere');
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        debug: {
          searchId: id,
          isObjectId: mongoose.Types.ObjectId.isValid(id),
          isOrderNumber: id.includes('BD')
        }
      });
    }

    console.log('✅ Order found:', {
      id: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      paymentStatus: order.paymentStatus,
      foundBy: searchMethod
    });

    // Store old status for logging
    const oldStatus = order.status;

    // Update the order status using findOneAndUpdate (more reliable than save)
    console.log('📝 Updating order status with findOneAndUpdate...');
    console.log('   Target order:', { orderNumber: order.orderNumber, oldStatus, newStatus: status });
    
    let updatedOrder;
    try {
      // Use findOneAndUpdate to avoid ObjectId issues
      updatedOrder = await Order.findOneAndUpdate(
        { orderNumber: order.orderNumber }, // Use orderNumber as it's more reliable
        { status: status },
        { new: true, runValidators: true }
      );
      
      if (!updatedOrder) {
        throw new Error('Order not found during update');
      }
      
      console.log('   ✅ Update successful:', { 
        orderNumber: updatedOrder.orderNumber, 
        newStatus: updatedOrder.status 
      });
      
    } catch (updateError) {
      console.error('❌ Update error details:', updateError);
      return res.status(500).json({
        success: false,
        error: 'فشل في حفظ التحديث في قاعدة البيانات',
        details: updateError.message
      });
    }

    console.log('✅ Order status updated successfully');

    // Create audit log
    try {
      await AuditLog.create({
        actorId: adminUser._id,
        action: 'update',
        collectionName: 'Order',
        documentId: updatedOrder._id,
        changes: {
          status: { old: oldStatus, new: updatedOrder.status }
        },
        meta: {
          adminAction: 'simple_status_update',
          adminEmail: adminUser.email,
          orderNumber: updatedOrder.orderNumber
        }
      });
    } catch (auditError) {
      console.log('⚠️ Audit log failed (non-critical):', auditError.message);
    }

    return res.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        oldStatus,
        newStatus: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Simple status update error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث حالة الطلب',
      details: error.message,
      debug: {
        errorName: error.name,
        errorStack: error.stack?.split('\n').slice(0, 3)
      }
    });
  }
};

/**
 * Get order details for debugging
 */
export const getOrderDetailsSimple = async (req, res) => {
  try {
    const { id } = req.params;
    
    let order = null;
    
    // Try orderNumber first
    if (id.includes('BD')) {
      order = await Order.findOne({ orderNumber: id });
    }
    
    // Try ObjectId with regex matching (works around ObjectId corruption)
    if (!order && mongoose.Types.ObjectId.isValid(id)) {
      try {
        order = await Order.findOne({
          $expr: { $eq: [{ $toString: "$_id" }, id] }
        });
      } catch (error) {
        console.log('ObjectId search error in getDetails:', error.message);
      }
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    return res.json({
      success: true,
      data: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
