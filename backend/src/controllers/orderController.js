import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/email.js';

// Hide orderNumber before payment in API responses
const sanitizeOrderForResponse = (orderDoc) => {
  try {
    const o = orderDoc?.toObject ? orderDoc.toObject() : JSON.parse(JSON.stringify(orderDoc || {}));
    if (o && o.paymentStatus !== 'paid' && o.status !== 'delivered') {
      delete o.orderNumber;
    }
    
    // Include payment data if populated
    if (orderDoc?.paymentId && typeof orderDoc.paymentId === 'object') {
      o.payment = {
        status: orderDoc.paymentId.status,
        amount: orderDoc.paymentId.amount,
        currency: orderDoc.paymentId.currency,
        createdAt: orderDoc.paymentId.createdAt,
        meta: orderDoc.paymentId.meta
      };
    }
    
    return o;
  } catch {
    return orderDoc;
  }
};

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       default: 1
 *               guestInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               currency:
 *                 type: string
 *                 enum: [SAR, USD]
 *                 default: SAR
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 */
export const createOrder = async (req, res) => {
  try {
    const { items, guestInfo, currency = 'SAR', notes, description, additionalNotes, attachments, total: clientTotal } = req.body;
    const user = req.user;
    
    // 🔍 DEBUG: تسجيل معلومات المستخدم

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      });
    }

    // For guest orders, require guest info
    if (!user && (!guestInfo || !guestInfo.name || !guestInfo.email)) {
      return res.status(400).json({
        success: false,
        error: 'Guest information is required for guest orders'
      });
    }

    // Check email verification status for orders with email provided
    let emailVerified = false;
    if (guestInfo?.email) {
      // Import CheckoutEmailVerification model
      const CheckoutEmailVerification = (await import('../models/CheckoutEmailVerification.js')).default;
      
      // Check if this email has been verified
      const verification = await CheckoutEmailVerification.findOne({
        email: guestInfo.email.toLowerCase(),
        isUsed: true,
        expiresAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
      }).sort({ createdAt: -1 });
      
      emailVerified = !!verification;

    }

    // Validate and process items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Validate ObjectId to avoid CastError
      if (!mongoose.Types.ObjectId.isValid(item.serviceId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid service id: ${item.serviceId}`
        });
      }
      const service = await Service.findById(item.serviceId);
      if (!service || !service.isActive) {
        return res.status(400).json({
          success: false,
          error: `Service not found or inactive: ${item.serviceId}`
        });
      }

      const quantity = item.quantity || 1;
      let price = null;
      // Handle both correct and legacy shapes safely
      if (service && service.price) {
        if (typeof service.price === 'object') {
          price = service.price[currency] ?? null;
        } else if (typeof service.price === 'number') {
          // Legacy shape: single number assumed to be SAR only
          price = currency === 'SAR' ? service.price : null;
        }
      }

      // Fallback: if USD requested but only SAR exists, convert SAR->USD using 3.75 rate
      if (price == null && currency === 'USD' && service?.price && typeof service.price === 'object' && typeof service.price.SAR === 'number') {
        const rateSarPerUsd = 3.75;
        price = Math.round((service.price.SAR / rateSarPerUsd) * 100) / 100;
      }

      if (price == null) {
        return res.status(400).json({
          success: false,
          error: `Price not available in ${currency} for service: ${(service.title?.en || service.title?.ar || 'service')}`
        });
      }

      const titleAr = (service.title && (service.title.ar || service.title.en)) || service.slug || 'Ø®Ø¯Ù…Ø©';
      const titleEn = (service.title && (service.title.en || service.title.ar)) || service.slug || 'service';

      orderItems.push({
        serviceId: service._id,
        title: { ar: titleAr, en: titleEn },
        quantity,
        price,
        currency
      });

      subtotal += price * quantity;
    }

    // Calculate tax and total (15% VAT across all currencies; zero for free orders)
    const tax = subtotal > 0 ? Math.round(subtotal * 0.15 * 100) / 100 : 0;
    const calculatedTotal = subtotal + tax;
    
    // ðŸ”’ SECURITY: Validate client total against calculated total
    if (clientTotal !== undefined && Math.abs(clientTotal - calculatedTotal) > 0.01) {
      return res.status(400).json({
        success: false,
        error: `Invalid total amount. Expected: ${calculatedTotal}, Received: ${clientTotal}`
      });
    }
    
    const total = calculatedTotal;

    // Create order
    // Persist guestInfo even for logged-in users so the contact email/phone used in checkout
    // are saved on the order (and visible later in profile/orders UI and emails)
    
    // إذا كان المستخدم مسجل دخول، استخدم معلوماته
    // إذا لم يكن مسجل دخول، حاول ربطه بمستخدم موجود بنفس الإيميل
    let finalUserId = user?._id || null;

    // إذا لم يكن هناك مستخدم مسجل دخول، ابحث عن مستخدم بنفس الإيميل
    if (!finalUserId && guestInfo?.email) {

      const existingUser = await User.findOne({ 
        email: guestInfo.email.toLowerCase() 
      });
      if (existingUser) {
        finalUserId = existingUser._id;
      } else {

      }
    }

    const orderData = {
      userId: finalUserId,
      guestInfo: guestInfo ? {
        name: guestInfo.name,
        email: guestInfo.email?.toLowerCase?.() || guestInfo.email,
        phone: guestInfo.phone
      } : undefined,
      items: orderItems,
      subtotal,
      tax,
      discount: 0,
      total,
      currency,
      notes,
      description,
      additionalNotes,
      attachments: attachments || [],
      emailVerified: emailVerified, // Include email verification status
      emailVerifiedAt: emailVerified ? new Date() : null
    };

    const order = new Order(orderData);
    await order.save();

    // Populate service details
    await order.populate('items.serviceId');

    // Do NOT send order confirmation email before payment.
    // Order number will be communicated only after successful payment
    // via the payment verification flow (or Stripe webhook),
    // to match business logic requirements.

    // Log order creation (only for authenticated users)
    if (user && user._id) {
      await AuditLog.logAction(
        user._id,
        'create',
        'orders',
        order._id,
        { orderNumber: order.orderNumber },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: sanitizeOrderForResponse(order) }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create order'
    });
  }
};

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
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
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, paid, delivered, cancelled, refunded]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const user = req.user;

    // Debug logging

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Include orders owned by the user AND guest orders created with the same email
    // 🔥 NEW: Only show successful orders or very recent pending ones (< 2 hours)
    const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000));
    
    const filter = { 
      $and: [
        {
          $or: [
            // User's orders
            ...(user._id ? [{ userId: user._id }] : []),
            // Guest orders with same email
            ...(user.email ? [{ 'guestInfo.email': user.email }] : [])
          ]
        },
        {
          $or: [
            // Successful orders (always show)
            { paymentStatus: 'paid' },
            // Very recent pending orders (< 2 hours)
            {
              $and: [
                { paymentStatus: 'pending' },
                { createdAt: { $gte: twoHoursAgo } }
              ]
            }
          ]
        }
      ]
    };

    // If no valid user filters, return empty result
    if (!user._id && !user.email) {
      return res.json({
        success: true,
        data: {
          orders: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    if (status) {
      filter.$and.push({ status });
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate('items.serviceId')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    // Enrich orders with deliveryLinks for paid orders
    const enriched = orders.map((o) => {
      const plain = sanitizeOrderForResponse(o);
      if (o.paymentStatus === 'paid') {
        const deliveryLinks = [];
        for (const item of o.items) {
          // New structure
          if (item.serviceId && item.serviceId.digitalDelivery && item.serviceId.digitalDelivery.links) {
            const transformedLinks = item.serviceId.digitalDelivery.links.map(link => ({
              title: link.title,
              url: link.url,
              image: link.imageUrl,
              language: link.locale,
              tags: link.tags || []
            }));
            deliveryLinks.push(...transformedLinks);
          }
          // Legacy structure
          if (item.serviceId && item.serviceId.deliveryLinks && item.serviceId.deliveryLinks.length > 0) {
            deliveryLinks.push(...item.serviceId.deliveryLinks);
          }
        }
        plain.deliveryLinks = deliveryLinks;
      }
      return plain;
    });

    res.json({
      success: true,
      data: {
        orders: enriched,
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
      error: 'Failed to retrieve orders'
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       403:
 *         description: Access denied
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await Order.findById(id).populate('items.serviceId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    const isOwner = order.userId && order.userId.toString() === user._id.toString();
    const isGuestOrder = !order.userId && order.guestInfo && order.guestInfo.email === user.email;
    const isAdmin = ['admin', 'superadmin'].includes(user.role);

    if (!isOwner && !isGuestOrder && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Enrich single order with deliveryLinks when paid/delivered
    const plain = sanitizeOrderForResponse(order);
    if (['paid', 'delivered'].includes(order.status)) {
      const deliveryLinks = [];
      for (const item of order.items) {
        if (item.serviceId && item.serviceId.digitalDelivery && item.serviceId.digitalDelivery.links) {
          const transformedLinks = item.serviceId.digitalDelivery.links.map(link => ({
            title: link.title,
            url: link.url,
            image: link.imageUrl,
            language: link.locale,
            tags: link.tags || []
          }));
          deliveryLinks.push(...transformedLinks);
        }
        if (item.serviceId && item.serviceId.deliveryLinks && item.serviceId.deliveryLinks.length > 0) {
          deliveryLinks.push(...item.serviceId.deliveryLinks);
        }
      }
      plain.deliveryLinks = deliveryLinks;
    }

    res.json({
      success: true,
      data: { order: plain }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order'
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}/delivery:
 *   get:
 *     summary: Get order delivery links (for paid orders)
 *     tags: [Orders]
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
 *         description: Delivery links retrieved successfully
 *       404:
 *         description: Order not found
 *       403:
 *         description: Access denied or order not paid
 */
/**
 * @swagger
 * /api/orders/{id}/verify-email:
 *   post:
 *     summary: Mark order email as verified (for testing)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       404:
 *         description: Order not found
 */
export const verifyOrderEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Mark email as verified
    order.emailVerified = true;
    order.emailVerifiedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order email verified successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify order email'
    });
  }
};

export const getOrderDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await Order.findById(id).populate('items.serviceId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order
    const isOwner = order.userId && order.userId.toString() === user._id.toString();
    const isGuestOrder = !order.userId && order.guestInfo && order.guestInfo.email === user.email;

    if (!isOwner && !isGuestOrder) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if order is paid
    if (order.paymentStatus !== 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Order must be paid to access delivery links'
      });
    }

    // Collect delivery links from all services (support new digitalDelivery structure)
    const deliveryLinks = [];
    for (const item of order.items) {
      // New structure: digitalDelivery.links
      if (item.serviceId && item.serviceId.digitalDelivery && item.serviceId.digitalDelivery.links) {
        const transformedLinks = item.serviceId.digitalDelivery.links.map(link => ({
          title: link.title,
          url: link.url,
          image: link.imageUrl,
          language: link.locale,
          tags: link.tags || []
        }));
        deliveryLinks.push(...transformedLinks);
      }
      
      // Legacy structure: deliveryLinks (backward compatibility)
      if (item.serviceId && item.serviceId.deliveryLinks) {
        deliveryLinks.push(...item.serviceId.deliveryLinks);
      }
    }

    // Log delivery access
    await AuditLog.logAction(user._id, 'view', 'orders', order._id, 
      { action: 'delivery_access' }, req);

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        deliveryLinks,
        deliveredAt: order.deliveredAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve delivery links'
    });
  }
};

/**
 * @swagger
 * /api/orders/guest/{email}:
 *   get:
 *     summary: Get guest orders by email
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Guest orders retrieved successfully
 */
export const getGuestOrders = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await Order.findByGuestEmail(email);

    res.json({
      success: true,
      data: { orders: orders.map((o) => sanitizeOrderForResponse(o)) }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve guest orders'
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Update order (for testing purposes)
 *     tags: [Orders]
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
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *               orderNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 */
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, orderNumber } = req.body;
    const user = req.user;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId?.toString() !== user._id.toString() && 
        order.guestInfo?.email !== user.email) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this order'
      });
    }

    // Update fields if provided
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      
      // If marking as paid, generate order number
      if (paymentStatus === 'paid' && !order.orderNumber) {
        order.orderNumber = orderNumber || `BD${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }
    }

    if (orderNumber) {
      order.orderNumber = orderNumber;
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add Test Delivery Links to Existing Order (for testing)
 */
export const addTestDeliveryToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await Order.findById(id).populate('items.serviceId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // إضافة روابط تجريبية مضمونة
    const testDeliveryLinks = [
      {
        title: 'الملف النهائي - عالي الجودة',
        url: 'https://drive.google.com/file/d/1example123/view',
        description: 'ملف التصميم النهائي بصيغة عالية الجودة'
      },
      {
        title: 'ملفات المصدر للتعديل',
        url: 'https://drive.google.com/drive/folders/1example456',
        description: 'ملفات PSD وAI للتعديل المستقبلي'
      }
    ];

    // تحديث الطلب
    const updatedOrder = await Order.findByIdAndUpdate(id, {
      deliveryLinks: testDeliveryLinks,
      deliveredAt: new Date(),
      deliveryEmailSent: true,
      status: 'delivered',
      paymentStatus: 'paid'
    }, { new: true });

    res.json({
      success: true,
      message: 'تم إضافة روابط التسليم بنجاح',
      data: updatedOrder
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
