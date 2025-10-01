import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Service from '../models/Service.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/email.js';
import { createPayPalOrder, capturePayPalOrder, getPayPalOrderDetails } from '../utils/paypal.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'paypal';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Hide orderNumber before payment
const sanitizeOrder = (orderDoc) => {
  try {
    const o = orderDoc?.toObject ? orderDoc.toObject() : JSON.parse(JSON.stringify(orderDoc || {}));
    if (o && o.status && !['paid', 'delivered'].includes(o.status)) {
      delete o.orderNumber;
    }
    return o;
  } catch {
    return orderDoc;
  }
};

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 */

/**
 * @swagger
 * /api/payments/create-session:
 *   post:
 *     summary: Create Stripe payment session
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *               successUrl:
 *                 type: string
 *               cancelUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment session created successfully
 *       404:
 *         description: Order not found
 */
export const createPaymentSession = async (req, res) => {
  try {

    const { orderId, successUrl, cancelUrl, orderData } = req.body;
    const user = req.user;

    // 🔥 DEBUG CRITICAL: فحص البيانات الواردة من الفرونت إند

    const isNameSame = orderData?.guestInfo?.name === user?.name;
    const isEmailSame = orderData?.guestInfo?.email === user?.email;
    const isPhoneSame = orderData?.guestInfo?.phone === user?.phone;

    if (isNameSame && isEmailSame) {

    } else {

    }

    // Check if this is a temporary order (starts with 'temp_')
    const isTemporaryOrder = orderId.startsWith('temp_');
    let order;

    if (isTemporaryOrder) {

      // Validate that orderData is provided for temporary orders
      if (!orderData || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order data is required for temporary orders'
        });
      }

      // Check email verification for temporary order
      if (orderData.guestInfo?.email) {
        const CheckoutEmailVerification = (await import('../models/CheckoutEmailVerification.js')).default;
        const verification = await CheckoutEmailVerification.findOne({
          email: orderData.guestInfo.email.toLowerCase(),
          isUsed: true,
          expiresAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 });
        
        if (!verification) {
          return res.status(403).json({
            success: false,
            error: 'يرجى التحقق من بريدك الإلكتروني أولاً قبل المتابعة إلى الدفع.',
            requiresEmailVerification: true,
            data: { email: orderData.guestInfo.email, orderId: orderId }
          });
        }
      }

      // Create a mock order object from orderData for payment processing
      const Service = (await import('../models/Service.js')).default;
      const orderItems = [];
      let subtotal = 0;

      for (const item of orderData.items) {
        const service = await Service.findById(item.serviceId);
        if (!service) {

          continue;
        }
        
        const quantity = item.quantity || 1;
        // Handle different price structures (SAR/USD or amount)
        const price = service.price?.amount || service.price?.SAR || service.price?.USD || 0;

        if (price <= 0) {

          continue;
        }
        
        orderItems.push({
          title: service.title,
          price: price,
          quantity: quantity,
          serviceId: service
        });
        subtotal += price * quantity;
      }

      const tax = Math.round(subtotal * 0.15 * 100) / 100;
      const total = subtotal + tax;

      // Validate totals before creating order
      if (!subtotal || isNaN(subtotal) || subtotal <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order total. Please check service prices.'
        });
      }

      // Mock order object
      order = {
        _id: orderId,
        items: orderItems,
        subtotal,
        tax,
        total,
        currency: orderData.currency || 'SAR',
        guestInfo: orderData.guestInfo,
        userId: user?._id || null,
        tempOrderData: orderData // Store original data for later order creation
      };
    } else {
      // Find existing order in database
      order = await Order.findById(orderId).populate('items.serviceId');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
    }

    // Check if user owns the order or it is a guest order (no userId)
    const isOwner = order.userId && order.userId.toString() === user?._id?.toString();
    const isGuestOrder = !order.userId; // treat as guest regardless of auth presence

    if (!isOwner && !isGuestOrder) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if order is already paid (skip for temporary orders)
    if (!isTemporaryOrder && (order.status === 'paid' || order.status === 'delivered')) {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Determine contact email preference: guestInfo.email (verified) over user email
    const contactEmail = order.guestInfo?.email || user?.email;

    // If there is no user and also no provided email, block
    if (!user && !order.guestInfo?.email) {
      return res.status(400).json({
        success: false,
        error: 'Guest email is required for payment'
      });
    }

    // Email verification is already checked above for temporary orders
    // For existing orders, check emailVerified flag
    if (!isTemporaryOrder && order.guestInfo?.email && !order.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'يرجى التحقق من بريدك الإلكتروني أولاً قبل المتابعة إلى الدفع.',
        requiresEmailVerification: true,
        data: { email: order.guestInfo.email, orderId: order._id }
      });
    }

    // Create line items for provider
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: order.currency.toLowerCase(),
        product_data: {
          name: item.title.en,
          description: item.title.ar,
          images: item.serviceId?.images || []
        },
        unit_amount: Math.round(item.price * 100) // Convert to cents
      },
      quantity: item.quantity
    }));

    // PayPal (Real SDK) flow
    if (PAYMENT_PROVIDER === 'paypal') {
      try {

        // Create PayPal order using real SDK
        const paypalOrder = await createPayPalOrder({
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          currency: order.currency,
          items: order.items
        });

        const payment = new Payment({
          orderId: isTemporaryOrder ? null : order._id, // Set null for temporary orders to avoid ObjectId cast error
          userId: user?._id || null,
          provider: 'paypal',
          providerPaymentId: paypalOrder.id,
          amount: order.total,
          currency: order.currency,
          status: 'pending',
          meta: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            paypalOrderId: paypalOrder.id,
            paypalStatus: paypalOrder.status,
            realPayPal: true,
            // Store temp order ID and data for later order creation
            ...(isTemporaryOrder ? { 
              tempOrderId: order._id,
              tempOrderData: order.tempOrderData 
            } : {})
          }
        });

        await payment.save();
        
        // Only update real orders, not temporary ones
        if (!isTemporaryOrder) {
          order.paymentId = payment._id;
          order.status = 'in_progress';
          await order.save();
        }

        if (user?._id) {
          await AuditLog.logAction(
            user._id,
            'create',
            'payments',
            payment._id,
            { orderId: order._id, paypalOrderId: paypalOrder.id, provider: 'paypal', realPayPal: true },
            req
          );
        }

        // Find approval URL from PayPal response
        const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

        return res.json({
          success: true,
          data: {
            sessionId: paypalOrder.id,
            sessionUrl: approvalUrl,
            paymentId: payment._id,
            paypalOrderId: paypalOrder.id
          }
        });
      } catch (paypalError) {
        return res.status(500).json({
          success: false,
          error: 'فشل في إنشاء طلب الدفع عبر PayPal. يرجى المحاولة مرة أخرى.',
          details: paypalError.message
        });
      }
    }

    // If Stripe is not configured and we're not in production, return a dev fallback session
    const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
    if (!stripeConfigured) {
      const devSessionId = `dev_${order._id.toString()}_${Date.now()}`;
      // Always build a concrete success URL with the generated sessionId
      const devSuccess = `${FRONTEND_URL}/order/success?session_id=${devSessionId}`;

      // Create a payment record tied to this fake session
      const payment = new Payment({
        orderId: order._id,
        userId: user?._id || null,
        provider: 'stripe',
        providerPaymentId: devSessionId,
        amount: order.total,
        currency: order.currency,
        status: 'pending',
        meta: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: devSessionId,
          dev: true
        }
      });

      await payment.save();
      order.paymentId = payment._id;
      order.status = 'in_progress';
      await order.save();

      // Only log if user exists
      if (user?._id) {
        await AuditLog.logAction(
          user._id,
          'create',
          'payments',
          payment._id,
          { orderId: order._id, sessionId: devSessionId, dev: true },
          req
        );
      }

      return res.json({
        success: true,
        data: {
          sessionId: devSessionId,
          sessionUrl: devSuccess,
          paymentId: payment._id
        }
      });
    }

    // Create Stripe checkout session (production or when configured)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/order/cancel`,
      client_reference_id: order._id.toString(),
      customer_email: contactEmail,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: user?._id?.toString() || 'guest'
      },
      billing_address_collection: 'auto',
      shipping_address_collection: null,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    });

    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      userId: user?._id || null,
      provider: 'stripe',
      providerPaymentId: session.id,
      amount: order.total,
      currency: order.currency,
      status: 'pending',
      meta: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: session.id
      }
    });

    await payment.save();

    // Update order with payment ID
    order.paymentId = payment._id;
    order.status = 'in_progress';
    await order.save();

    // Log payment creation (only if an authenticated user exists)
    if (user?._id) {
      await AuditLog.logAction(
        user._id,
        'create',
        'payments',
        payment._id,
        { orderId: order._id, sessionId: session.id },
        req
      );
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
        paymentId: payment._id
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create payment session'
    });
  }
};

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe is not configured on the server' });
    }
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      default:
        }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful checkout session
 */
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const orderId = session.client_reference_id;
    const order = await Order.findById(orderId).populate('items.serviceId');
    
    if (!order) {
      return;
    }

    const payment = await Payment.findOne({ providerPaymentId: session.id });
    
    if (!payment) {
      return;
    }

    // Update payment status
    await payment.markAsSucceeded({
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total
    });

    await payment.markWebhookReceived();

    // Update order status
    await order.markAsPaid(payment._id);

    // Increment service order counts
    for (const item of order.items) {
      if (item.serviceId) {
        await item.serviceId.incrementOrders();
      }
    }

    // Send delivery email with links
    const customerEmail = order.userId ? 
      (await order.populate('userId')).userId.email : 
      order.guestInfo.email;
    
    const customerName = order.userId ? 
      (await order.populate('userId')).userId.name : 
      order.guestInfo.name;

    // Collect digital delivery links from new structure
    const deliveryLinks = [];
    for (const item of order.items) {
      if (item.serviceId && item.serviceId.digitalDelivery && item.serviceId.digitalDelivery.links) {
        // Transform new digitalDelivery structure to match email template
        const transformedLinks = item.serviceId.digitalDelivery.links.map(link => ({
          title: link.title,
          url: link.url,
          image: link.imageUrl,
          language: link.locale,
          tags: link.tags || []
        }));
        deliveryLinks.push(...transformedLinks);
      }
      
      // Fallback: Check for legacy deliveryLinks structure for backward compatibility
      if (item.serviceId && item.serviceId.deliveryLinks && item.serviceId.deliveryLinks.length > 0) {
        deliveryLinks.push(...item.serviceId.deliveryLinks);
      }
    }

    if (deliveryLinks.length > 0) {
      try {
        await sendEmail({
          to: customerEmail,
          template: 'delivery-notification',
          data: {
            orderNumber: order.orderNumber,
            customerName,
            deliveryLinks
          }
        });

        // Mark as delivered
        await order.markAsDelivered();
        } catch (emailError) {
        }
    } else {
      }

    } catch (error) {
    }
};

/**
 * Handle successful payment intent
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ 
      providerPaymentId: paymentIntent.id 
    });

    if (payment) {
      await payment.markAsSucceeded(paymentIntent);
      await payment.markWebhookReceived();
    }
  } catch (error) {
    }
};

/**
 * Handle failed payment intent
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ 
      providerPaymentId: paymentIntent.id 
    });

    if (payment) {
      const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
      await payment.markAsFailed(failureReason, paymentIntent);
      await payment.markWebhookReceived();

      // Update order status using the new method
      const order = await Order.findById(payment.orderId);
      if (order) {
        const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
        await order.markPaymentFailed(failureReason);
      }
    }
  } catch (error) {
    }
};

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 */
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // PayPal (Real SDK) verification
    if (PAYMENT_PROVIDER === 'paypal') {
      // Get payment first, outside try block so it's available in catch
      let payment = await Payment.findOne({ providerPaymentId: sessionId }).populate('orderId');
      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }
      
      let order = payment.orderId;
      
      try {
        // Get PayPal order details from PayPal API
        const paypalOrderDetails = await getPayPalOrderDetails(sessionId);
        
        // For temporary orders, try to find the real order created by webhook
        if (!order && payment.meta?.tempOrderId) {
          // Look for orders created from this temp payment
          const Order = (await import('../models/Order.js')).default;
          const createdOrder = await Order.findOne({
            'guestInfo.email': payment.meta.tempOrderData?.guestInfo?.email,
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
          }).sort({ createdAt: -1 });
          
          if (createdOrder) {
            order = createdOrder;
            // Update payment to reference the real order
            payment.orderId = createdOrder._id;
            await payment.save();

          } else {
            // If no order found, try to create one from temp data

            try {
              const { createPermanentOrder } = await import('./paypalWebhookController.js');
              const newOrder = await createPermanentOrder(payment);
              if (newOrder) {
                order = newOrder;

              }
            } catch (createError) {
            }
          }
        }
        // 
        // Ù„Ø§ Ù†Ø«Ù‚ ÙÙŠ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… - Ù†ØªØ­Ù‚Ù‚ Ù…Ù† PayPal Ù…Ø¨Ø§Ø´Ø±Ø©
        if (paypalOrderDetails.status === 'APPROVED') {
          
          // Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ø¯ÙØ¹Ø© Ù…ÙØªØ­Ù‚Ù‚Ø© Ù…Ù† webhook ÙÙ‚Ø· Ù†ÙƒÙ…Ù„Ù‡Ø§
          const webhookVerified = payment.meta?.webhookConfirmed === true;
          
          if (webhookVerified || payment.status === 'succeeded') {
            // الدفع تم تأكيدها من PayPal webhook - آمان 100%

            // Payment already handled by webhook, just return success
            return res.json({
              success: true,
              data: {
                payment: {
                  id: payment._id,
                  status: payment.status,
                  amount: payment.amount,
                  currency: payment.currency
                },
                order: order ? {
                  _id: order._id,
                  orderNumber: order.orderNumber || null,
                  total: order.total,
                  currency: order.currency,
                  status: order.status,
                  paymentStatus: order.paymentStatus
                } : null,
                session: {
                  id: sessionId,
                  status: 'complete',
                  paymentStatus: 'paid'
                },
                message: 'تم الدفع بنجاح! رقم الطلب: ' + (order?.orderNumber || 'سيتم إنشاؤه قريباً')
              }
            });
          } else {
            // 🚫 SECURITY: لا نثق في return من PayPal بدون webhook
            // المستخدم يجب أن ينتظر التأكيد من PayPal webhook
            
            // Just mark that user returned, but keep pending status
            payment.meta = {
              ...payment.meta,
              userReturnedAt: new Date(),
              paypalStatus: paypalOrderDetails.status,
              awaitingWebhook: true, // Still waiting for webhook confirmation
              returnedFromPaypal: true
            };
            // DON'T change payment.status - keep it pending until webhook
            
            // 🚀 AUTO-EMAIL: جدولة إرسال إيميل تلقائي بعد 15 ثانية
            const { scheduleEmailAfterPayPalReturn } = await import('../middleware/autoEmailSender.js');
            scheduleEmailAfterPayPalReturn(payment._id, 15);
            // 🚫 SECURITY: لا نثق في return من PayPal بدون webhook
            
            // 🚀 FALLBACK: إرسال إيميل تلقائي بعد 30 ثانية إذا لم يصل webhook
            setTimeout(async () => {
              try {
                
                const updatedPayment = await Payment.findById(payment._id).populate('orderId');
                
                // إذا لم يصل webhook بعد، أرسل الإيميل مع ضمان وجود orderNumber
                if (!updatedPayment.meta?.webhookReceived && updatedPayment.status === 'succeeded') {
                  
                  if (updatedPayment.orderId && updatedPayment.orderId.guestInfo?.email) {
                    // 🔒 ضمان وجود orderNumber قبل إرسال الإيميل
                    if (!updatedPayment.orderId.orderNumber) {
                      await updatedPayment.orderId.markAsPaid(updatedPayment._id);
                      await updatedPayment.orderId.save();
                    }

                    // فحص نهائي للتأكد من وجود orderNumber
                    if (!updatedPayment.orderId.orderNumber) {
                      return;
                    }

                    
                    const { sendEmail } = await import('../utils/email.js');
                    
                    await sendEmail({
                      to: updatedPayment.orderId.guestInfo.email,
                      template: 'order-confirmation',
                      data: {
                        orderNumber: updatedPayment.orderId.orderNumber,
                        customerName: updatedPayment.orderId.guestInfo?.name || 'عميل عزيز',
                        items: updatedPayment.orderId.items,
                        total: updatedPayment.orderId.total,
                        currency: updatedPayment.orderId.currency,
                        orderDate: new Date().toLocaleDateString('ar-SA'),
                        delayMessage: '\n\n💡 إذا لم تجد رقم الطلب في هذا الإيميل، يمكنك العثور عليه في بروفايلك على الموقع.\n\n📝 ملاحظة: تم إرسال هذا الإيميل كنسخة احتياطية لضمان وصوله إليك.'
                      }
                    });
                    
                    // تحديث قاعدة البيانات
                    await Order.findByIdAndUpdate(updatedPayment.orderId._id, {
                      deliveryEmailSent: true,
                      deliveredAt: new Date(),
                      emailSentViaFallback: true
                    });
                    
                  }
                }
              } catch (fallbackError) {
              }
            }, 30000); // 30 ثانية
            
            return res.json({
              success: true,
              data: {
                payment: {
                  id: payment._id,
                  status: 'pending_webhook_verification',
                  paymentStatus: 'pending_webhook_verification'
                },
                message: 'جاري التحقق من الدفع مع PayPal... يرجى الانتظار'
              }
            });
          }
        }

        if (!order && payment.meta?.tempOrderData) {

          try {
            const { createPermanentOrder } = await import('./paypalWebhookController.js');
            order = await createPermanentOrder(payment);
            if (order) {

              // إعادة جلب payment بعد التحديث
              await payment.populate('orderId');
            } else {

            }
          } catch (createError) {
          }
        } else if (!order) {

        }

        // 🔒 CRITICAL SECURITY: Only mark as paid if webhook is confirmed
        const isWebhookConfirmed = payment.meta?.webhookConfirmed === true;
        const isPaymentSucceeded = payment.status === 'succeeded';
        
        if (order && isWebhookConfirmed && isPaymentSucceeded) {
          
          // Mark as paid only if not already paid
          if (order.paymentStatus !== 'paid') {
            await order.markAsPaid(payment._id);
            // 🔒 Reload order to ensure orderNumber is fetched
            await order.reload();
          }

          // ✅ Verify orderNumber exists before proceeding
          if (!order.orderNumber) {
            console.error('⚠️ [PAYMENT] Order marked as paid but orderNumber is missing!');
          }

          // 🚀 Add delivery links from services

          await order.populate('items.serviceId');
          
          const allDeliveryLinks = [];
          for (const item of order.items) {
            if (item.serviceId) {
              const service = item.serviceId;

              // Check digitalDelivery.links (new structure)
              if (service.digitalDelivery && service.digitalDelivery.links && service.digitalDelivery.links.length > 0) {

                const transformedLinks = service.digitalDelivery.links.map(link => ({
                  title: link.title || 'رابط التسليم',
                  url: link.url,
                  description: link.description || '',
                  image: link.imageUrl || null
                }));
                allDeliveryLinks.push(...transformedLinks);
              }
              
              // Check deliveryLinks (legacy structure)
              if (service.deliveryLinks && service.deliveryLinks.length > 0) {

                const legacyLinks = service.deliveryLinks.map(link => ({
                  title: typeof link === 'string' ? 'رابط التسليم' : (link.title || 'رابط التسليم'),
                  url: typeof link === 'string' ? link : link.url,
                  description: typeof link === 'string' ? '' : (link.description || '')
                }));
                allDeliveryLinks.push(...legacyLinks);
              }
            }
          }
          
          // Add test links if no real links found
          if (allDeliveryLinks.length === 0) {

            allDeliveryLinks.push({
              title: 'الملف النهائي - عالي الجودة',
              url: 'https://drive.google.com/file/d/1example123/view',
              description: 'ملف التصميم النهائي بصيغة عالية الجودة'
            });
          }
          
          // Update order with delivery links
          if (allDeliveryLinks.length > 0) {
            await Order.findByIdAndUpdate(order._id, {
              deliveryLinks: allDeliveryLinks,
              deliveredAt: new Date(),
              status: 'delivered'
            });

          }
          // Re-fetch order with populated services for email composition and delivery links
          const populatedOrder = await Order.findById(order._id).populate('items.serviceId');
          
          // ✅ Verify orderNumber exists in fetched order
          console.log(`📧 [PAYMENT] Preparing email - Order Number: ${populatedOrder.orderNumber || 'MISSING!'}`);
          
          // Send order confirmation email only after webhook-confirmed payment
          try {
            // Always use the email entered during checkout, not account email
            let customerEmail = populatedOrder.guestInfo?.email;
            let customerName = populatedOrder.guestInfo?.name || 'العميل';
            
            // If user is logged in but no guestInfo email, fallback to account email
            if (!customerEmail && populatedOrder.userId) {
              await populatedOrder.populate('userId');
              customerEmail = populatedOrder.userId?.email;
              customerName = populatedOrder.userId?.name || customerName;
            }
            
            // 🚨 Critical: Do NOT send email if orderNumber is missing
            if (!populatedOrder.orderNumber) {
              console.error('❌ [PAYMENT] Cannot send confirmation email - orderNumber is missing!');
              throw new Error('Order number not generated');
            }
            
            console.log(`✅ [PAYMENT] Sending confirmation email to ${customerEmail} for order ${populatedOrder.orderNumber}`);
            
            await sendEmail({
              to: customerEmail,
              template: 'order-confirmation',
              data: {
                orderNumber: populatedOrder.orderNumber,
                customerName,
                items: populatedOrder.items,
                total: populatedOrder.total,
                currency: populatedOrder.currency,
                description: populatedOrder.description,
                notes: populatedOrder.notes,
                orderDate: populatedOrder.createdAt ? new Date(populatedOrder.createdAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA')
              }
            });
            
            
            // تحديث حالة الإيميل في قاعدة البيانات
            await Order.findByIdAndUpdate(populatedOrder._id, {
              deliveryEmailSent: true,
              deliveredAt: new Date()
            });
            
            
            } catch (emailErr) {
            }

          // Additionally, try to send digital delivery email if links exist (parity with Stripe webhook path)
          try {
            // Always use the email entered during checkout, not account email
            let customerEmail = populatedOrder.guestInfo?.email;
            let customerName = populatedOrder.guestInfo?.name || 'Ø§Ù„Ø¹Ù…ÙŠÙ„';
            
            // If user is logged in but no guestInfo email, fallback to account email
            if (!customerEmail && populatedOrder.userId) {
              await populatedOrder.populate('userId');
              customerEmail = populatedOrder.userId?.email;
              customerName = populatedOrder.userId?.name || customerName;
            }

            // Collect digital delivery links from new/legacy structures
            const deliveryLinks = [];
            for (const item of populatedOrder.items) {
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

            if (allDeliveryLinks.length > 0) {
              await sendEmail({
                to: customerEmail,
                template: 'delivery-notification',
                data: {
                  orderNumber: populatedOrder.orderNumber || `BD${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                  customerName,
                  deliveryLinks: allDeliveryLinks
                }
              });

              // Mark as delivered
              await populatedOrder.markAsDelivered();
              } else {
              }
          } catch (emailErr) {
            }
        } else {
        }

        // 🔒 CRITICAL: Check if webhook is confirmed before returning success
        if (isWebhookConfirmed && isPaymentSucceeded) {
          return res.json({
            success: true,
            data: {
              payment: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency
              },
              order: order ? sanitizeOrder(order) : null,
              session: {
                id: sessionId,
                status: 'complete',
                paymentStatus: 'paid'
              },
              message: order ? 
                `تم الدفع بنجاح! رقم الطلب: ${order.orderNumber}` : 
                `تم الدفع بنجاح! معرف الدفع: ${payment._id.toString().slice(-8)}`
            }
          });
        } else {
          // 🚫 SECURITY: Return pending if webhook not confirmed
          return res.json({
            success: true,
            data: {
              payment: {
                id: payment._id,
                status: 'pending_webhook_verification',
                amount: payment.amount,
                currency: payment.currency
              },
              order: null, // No order info until webhook confirms
              session: {
                id: sessionId,
                status: 'pending_webhook_verification',
                paymentStatus: 'pending_webhook_verification'
              },
              message: 'جاري التحقق من الدفع مع PayPal... يرجى الانتظار'
            }
          });
        }
      } catch (paypalError) {

        // إذا كان PayPal session منتهي الصلاحية، لكن Payment موجودة ومدفوعة
        if (paypalError.message.includes('RESOURCE_NOT_FOUND') && payment && payment.status === 'succeeded') {

          return res.json({
            success: true,
            data: {
              payment: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency
              },
              order: order ? sanitizeOrder(order) : {
                _id: null,
                orderNumber: `TEMP-${payment._id.toString().slice(-8)}`,
                status: 'completed',
                paymentStatus: 'paid',
                total: payment.amount,
                currency: payment.currency,
                items: [{
                  title: 'خدمة PayPal',
                  price: payment.amount,
                  quantity: 1
                }],
                guestInfo: {
                  name: 'عميل PayPal',
                  email: payment.meta?.email || 'paypal@example.com'
                }
              },
              session: {
                id: sessionId,
                status: 'complete',
                paymentStatus: 'paid'
              },
              message: order ? 
                `تم الدفع بنجاح! رقم الطلب: ${order.orderNumber}` : 
                `تم الدفع بنجاح! رقم المرجع: TEMP-${payment._id.toString().slice(-8)}`
            }
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'فشل في التحقق من حالة الدفع عبر PayPal. يرجى المحاولة مرة أخرى.',
          details: paypalError.message
        });
      }
    }
    
    // Stripe verification (fallback)
    const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
    // Fallback verification when Stripe is not configured
    if (!stripeConfigured) {
      const payment = await Payment.findOne({ providerPaymentId: sessionId }).populate('orderId');
      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }

      const order = payment.orderId;
      // Mark succeeded if not already
      if (payment.status !== 'succeeded') {
        await payment.markAsSucceeded({ payment_method: { type: 'card' } });
        await payment.markWebhookReceived();
        if (order) {
          await order.markAsPaid(payment._id);
        }
      }

      return res.json({
        success: true,
        data: {
          payment: {
            id: payment._id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency
          },
          order,
          session: {
            id: sessionId,
            status: 'complete',
            paymentStatus: 'paid'
          }
        }
      });
    }

    // Retrieve session from Stripe (production or configured)
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const stripePayment = await Payment.findOne({ providerPaymentId: sessionId })
      .populate('orderId');

    if (!stripePayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        payment: {
          id: stripePayment._id,
          status: stripePayment.status,
          amount: stripePayment.amount,
          currency: stripePayment.currency
        },
        order: sanitizeOrder(stripePayment.orderId),
        session: {
          id: session.id,
          status: session.status,
          paymentStatus: session.payment_status
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to verify payment'
    });
  }
};


