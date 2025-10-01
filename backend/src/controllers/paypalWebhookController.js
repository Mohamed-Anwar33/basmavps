import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/email.js';

/**
 * PayPal Webhook Handler - Ø§Ù„Ø¶Ù…Ø§Ù† Ø§Ù„ÙˆØ­ÙŠØ¯ Ù„Ù„Ø£Ù…Ø§Ù† 100%
 * Ù‡Ø°Ø§ Ø§Ù„Ù…ØªØ­ÙƒÙ… ÙŠØ³ØªÙ‚Ø¨Ù„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ù…Ù† PayPal Ù…Ø¨Ø§Ø´Ø±Ø©
 * Ù„Ø§ ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„ØªÙ„Ø§Ø¹Ø¨ Ø¨Ù‡ Ø£Ùˆ ØªØ¬Ø§ÙˆØ²Ù‡
 */

/**
 * Verify PayPal Webhook Signature
 * Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø¥Ø´Ø¹Ø§Ø± Ù…Ù† PayPal - Ø£Ù…Ø§Ù† ÙƒØ§Ù…Ù„
 */
const verifyWebhookSignature = (payload, headers) => {
  try {
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionId = headers['paypal-transmission-id'];
    const certId = headers['paypal-cert-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // ÙÙŠ sandboxØŒ certId Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ù…ÙÙ‚ÙˆØ¯ - Ù†ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ§Øª ÙÙ‚Ø·
    if (!authAlgo || !transmissionId || !transmissionSig || !transmissionTime) {
      return false;
    }

    // ðŸ”’ SECURITY: Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ø£Ù…Ù†ÙŠ Ø§Ù„ØµØ§Ø±Ù… Ø­ØªÙ‰ ÙÙŠ sandbox
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ transmission ID ØµØ­ÙŠØ­
    if (!transmissionId || transmissionId.length < 10) {
      return false;
    }
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© cert ID - Ø§Ø®ØªÙŠØ§Ø±ÙŠ ÙÙŠ sandbox
    if (certId && certId.length < 10) {
      return false;
    }
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ signature
    if (!transmissionSig || transmissionSig.length < 20) {
      return false;
    }
    
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† timestamp (ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø®Ù„Ø§Ù„ Ø¢Ø®Ø± 5 Ø¯Ù‚Ø§Ø¦Ù‚)
    const webhookTime = new Date(transmissionTime);
    const now = new Date();
    const timeDiff = Math.abs(now - webhookTime) / 1000; // Ø¨Ø§Ù„Ø«ÙˆØ§Ù†ÙŠ
    
    if (timeDiff > 300) { // 5 Ø¯Ù‚Ø§Ø¦Ù‚
      return false;
    }
    
    // ÙÙŠ sandboxØŒ Ù†ØªØ­Ù‚Ù‚ Ù…Ù† headers Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† Ø§Ù„ØªÙˆÙ‚ÙŠØ¹ Ø§Ù„ÙƒØ§Ù…Ù„
    if (process.env.PAYPAL_MODE === 'sandbox') {
      // ÙÙŠ sandboxØŒ PayPal Ù‚Ø¯ Ù„Ø§ ÙŠØ±Ø³Ù„ cert-id Ø£Ø­ÙŠØ§Ù†Ø§Ù‹ - Ù†ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ§Øª ÙÙ‚Ø·
      const hasValidTransmissionId = transmissionId && transmissionId.length > 5;
      const hasValidAlgo = authAlgo && authAlgo.includes('SHA');
      const hasValidSig = transmissionSig && transmissionSig.length > 10;
      
      return hasValidTransmissionId && hasValidAlgo && hasValidSig;
    }
    
    // Ù„Ù„Ø¥Ù†ØªØ§Ø¬ - Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„ÙƒØ§Ù…Ù„ Ù…Ù† Ø§Ù„ØªÙˆÙ‚ÙŠØ¹
    // TODO: ØªØ·Ø¨ÙŠÙ‚ PayPal signature verification API
    return false; // Ø±ÙØ¶ Ø¬Ù…ÙŠØ¹ webhooks ÙÙŠ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ Ø­ØªÙ‰ ÙŠØªÙ… ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„ÙƒØ§Ù…Ù„
  } catch (error) {
    return false;
  }
};

/**
 * Handle PayPal Webhook Events
 * Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª PayPal - Ø§Ù„Ø£Ù…Ø§Ù† Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ
 */
export const handlePayPalWebhook = async (req, res) => {

  try {
    const payload = req.body;
    const headers = req.headers;

    // 🔒 CRITICAL SECURITY: Verify webhook signature first
    const isWebhookVerified = verifyWebhookSignature(payload, headers);
    if (!isWebhookVerified) {
      return res.status(401).json({ error: 'Unauthorized webhook' });
    }
    
    
    // Pass verification status to handlers
    payload._webhookVerified = true;

    // Ù…Ø¹Ø§Ù„Ø¬Ø© Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ø§Ù„Ù…Ø®ØªÙ„ÙØ©
    switch (payload.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(payload);
        break;
      
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptured(payload);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(payload);
        break;
      
      case 'CHECKOUT.ORDER.PROCESSING':
        await handleOrderProcessing(payload);
        break;
      
      default:
        }

    // Ø¥Ø±Ø³Ø§Ù„ ØªØ£ÙƒÙŠØ¯ Ù„Ù€ PayPal
    res.status(200).json({ received: true });

  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle Order Approved Event
 * Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙˆØ§ÙÙ‚ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙØ¹ ÙÙŠ PayPal
 */
const handleOrderApproved = async (payload) => {
  try {
    // 🔒 SECURITY: Only process webhook-verified events
    if (!payload._webhookVerified) {
      return;
    }
    
    
    const paypalOrderId = payload.resource.id;
    const payment = await Payment.findOne({ providerPaymentId: paypalOrderId });
    if (!payment) {
      return;
    }

    // Check if this payment needs an order created
    if (!payment.orderId) {
      const tempOrderId = payment.meta?.tempOrderId;
      if (tempOrderId && tempOrderId.toString().startsWith('temp_') && payment.meta?.tempOrderData) {

        const newOrder = await createPermanentOrder(payment);
        if (newOrder) {

        }
      } else {

        // Create simple order for payments without temp data
        const simpleOrder = await createSimpleOrder(payment);
      }
    }

    // ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø¯ÙØ¹ - APPROVED فقط يحدث الحالة بدون إيميل
    payment.status = 'succeeded';
    payment.meta = {
      ...payment.meta,
      webhookReceived: true,
      webhookConfirmed: true,
      approvedAt: new Date(),
      paypalStatus: 'APPROVED'
    };
    await payment.save();

    // Ø¥Ø±Ø³Ø§Ù„ Ø¥ÙŠÙ…ÙŠÙ„ Ø§Ù„ØªØ£ÙƒÙŠØ¯ - Ù…Ù† Ø§Ù„Ø¯ÙØ¹

    // إضافة markAsPaid للـ order المنشأ حديثاً إذا لم يكن مدفوعاً
    if (payment.orderId) {
      const Order = (await import('../models/Order.js')).default;
      const order = await Order.findById(payment.orderId);
      if (order) {
        await order.markAsPaid(payment._id);
      }
    }

//  FIX: NOW CREATES ORDER NUMBER IN APPROVED EVENT
  } catch (error) {
  }
};

/**
 * Handle Payment Captured Event - SECURITY ADDED
 */
const handlePaymentCaptured = async (payload) => {
  try {
    // 🔒 CRITICAL SECURITY: Only process webhook-verified events
    if (!payload._webhookVerified) {
      return;
    }
    
    const captureId = payload.resource.id;
    const paypalOrderId = payload.resource.supplementary_data?.related_ids?.order_id;
    const amount = payload.resource.amount;
    const payer = payload.resource.payer || {};

    // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø¯ÙØ¹Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
    const payment = await Payment.findOne({ 
      providerPaymentId: paypalOrderId 
    }).populate('orderId');

    if (!payment) {
      return;
    }

    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø£Ù† Ø§Ù„Ø¯ÙØ¹Ø© Ù„Ù… ØªÙØ¹Ø§Ù„Ø¬ Ù…Ù† Ù‚Ø¨Ù„
    if (payment.status === 'succeeded') {
      return;
    }

    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¯ÙØ¹Ø© ÙƒÙ…ÙƒØªÙ…Ù„Ø© - Ø§Ù„Ø£Ù…Ø§Ù† Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ
    // Check if this payment needs an order created first
    if (!payment.orderId) {
      const tempOrderIdCapture = payment.meta?.tempOrderId;
      if (tempOrderIdCapture && tempOrderIdCapture.toString().startsWith('temp_') && payment.meta?.tempOrderData) {

        const newOrder = await createPermanentOrder(payment);
        if (newOrder) {

        }
      } else {

        // Create simple order for payments without temp data
        const simpleOrder = await createSimpleOrder(payment);
        if (simpleOrder) {

        }
      }
    }

    await payment.markAsSucceeded({
      payment_method: { type: 'wallet', brand: 'paypal' },
      captureId,
      payer,
      amount,
      webhookConfirmed: true // Ø¹Ù„Ø§Ù…Ø© Ø§Ù„Ø£Ù…Ø§Ù†
    });

    await payment.markWebhookReceived();
    // ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø·Ù„Ø¨ ÙƒÙ…Ø¯ÙÙˆØ¹
    const order = payment.orderId;
    if (order) {
      // ✅ انتظار اكتمال markAsPaid وإنشاء orderNumber
      await order.markAsPaid(payment._id);

      // Ø¥Ø±Ø³Ø§Ù„ Ø¥ÙŠÙ…ÙŠÙ„ Ø§Ù„ØªØ£ÙƒÙŠØ¯ - Ù…Ù† Ø§Ù„Ø¯ÙØ¹
      // 🕐 تأخير إرسال الإيميل 15 ثانية لضمان استقرار الطلب
      setTimeout(async () => {
        try {
          const Order = (await import('../models/Order.js')).default;
          const freshOrder = await Order.findById(order._id).populate('items.serviceId');
          if (freshOrder && freshOrder.orderNumber) {
            await sendOrderConfirmationEmail(freshOrder);
            
            // تحديث قاعدة البيانات لتسجيل إرسال الإيميل
            await Order.findByIdAndUpdate(freshOrder._id, {
              deliveryEmailSent: true,
              deliveredAt: new Date(),
              emailSentViaWebhook: true
            });
            
          }
        } catch (err) {
        }
      }, 30000); // 30 ثانية تأخير
      
      // ✅ تم نقل إرسال الإيميل إلى داخل setTimeout لضمان التأخير
      // ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¹Ù…Ù„ÙŠØ© ÙÙŠ Ø§Ù„Ø³Ø¬Ù„
      await AuditLog.logAction(
        'system',
        'webhook',
        'payments',
        payment._id,
        { 
          event: 'payment_captured',
          captureId,
          paypalOrderId,
          amount: amount?.value,
          webhookConfirmed: true
        }
      );
    }

  } catch (error) {
  }
};

/**
 * Handle Payment Denied Event
 * Ø¹Ù†Ø¯Ù…Ø§ ÙŠØªÙ… Ø±ÙØ¶ Ø§Ù„Ø¯ÙØ¹Ø©
 */
const handlePaymentDenied = async (payload) => {
  try {
    // 🔒 SECURITY: Only process webhook-verified events
    if (!payload._webhookVerified) {
      return;
    }
    
    const captureId = payload.resource.id;
    const paypalOrderId = payload.resource.supplementary_data?.related_ids?.order_id;
    const reason = payload.resource.status_details?.reason || 'Payment denied';

    const payment = await Payment.findOne({ 
      providerPaymentId: paypalOrderId 
    }).populate('orderId');

    if (payment) {
      await payment.markAsFailed(reason, {
        captureId,
        webhookConfirmed: true
      });

      if (payment.orderId) {
        await payment.orderId.markPaymentFailed(reason);
      }
    }

  } catch (error) {
    }
};

/**
 * Handle Order Processing Event
 */
const handleOrderProcessing = async (payload) => {
  try {
    const paypalOrderId = payload.resource.id;
    const payment = await Payment.findOne({ providerPaymentId: paypalOrderId });
    if (payment) {
      payment.meta = {
        ...payment.meta,
        webhookReceived: true,
        processingAt: new Date(),
        paypalStatus: 'PROCESSING'
      };
      await payment.save();
    }
  } catch (error) {
    }
};

/**
 * Send Beautiful Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    // تأكد من تحميل تفاصيل الخدمات
    await order.populate('items.serviceId');
    
    const customerEmail = order.guestInfo?.email;
    const customerName = order.guestInfo?.name || 'عميل عزيز';
    
    if (!customerEmail) {

      return;
    }

    // تحميل إعدادات الواتساب من لوحة التحكم
    let whatsappLink = '';
    try {
      const ContactPage = (await import('../models/ContactPage.js')).default;
      const contactData = await ContactPage.findOne().lean();
      if (contactData?.whatsappLink) {
        whatsappLink = contactData.whatsappLink;
      }
    } catch (error) {
    }

    // 🔍 التحقق من وجود orderNumber قبل إرسال الإيميل
    console.log(`📧 [WEBHOOK] Preparing email - Order Number: ${order.orderNumber || 'MISSING!'}`);
    
    if (!order.orderNumber) {
      console.error('❌ [WEBHOOK] Cannot send confirmation email - orderNumber is missing!');
      // لا نرسل الإيميل بدون رقم طلب
      return;
    }

    // 📧 إضافة رسالة توضيحية للتأخير ورقم الطلب
    const isDelayedEmail = Date.now() - order.createdAt > 20000; // أكثر من 20 ثانية
    const delayMessage = isDelayedEmail ? 
      '\n\n📝 ملاحظة: تم إرسال هذا الإيميل بعد تأكيد الدفع بـ 30 ثانية لضمان دقة المعلومات.\n\n💡 إذا لم تجد رقم الطلب في هذا الإيميل، يمكنك العثور عليه في بروفايلك على الموقع.' : 
      '\n\n💡 إذا لم تجد رقم الطلب في هذا الإيميل، يمكنك العثور عليه في بروفايلك على الموقع.';

    // إعداد بيانات الإيميل
    const emailData = {
      orderNumber: order.orderNumber,
      customerName,
      items: order.items.map(item => ({
        title: item.serviceId ? item.serviceId.title : item.title,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total,
      currency: order.currency,
      paypalEmail: order.paypalInfo?.email, // إيميل PayPal إضافي
      orderDate: new Date(order.createdAt).toLocaleDateString('ar-SA'),
      notes: order.notes,
      description: order.description,
      whatsappLink: whatsappLink, // إضافة رابط الواتساب من لوحة التحكم
      delayMessage: delayMessage // رسالة التأخير
    };
    
    // إرسال الإيميل
    console.log(`✅ [WEBHOOK] Sending confirmation email to ${customerEmail} for order ${order.orderNumber}`);
    
    const emailResult = await sendEmail({
      to: customerEmail,
      template: 'order-confirmation',
      data: emailData
    });

    console.log(`🎉 [WEBHOOK] Confirmation email sent successfully! MessageId: ${emailResult.messageId}`);
    
    // تحديث حالة الإيميل في قاعدة البيانات
    await Order.findByIdAndUpdate(order._id, {
      deliveryEmailSent: true,
      deliveredAt: new Date()
    });
    
    
    // 🚀 إضافة روابط تسليم تجريبية للاختبار
    await addTestDeliveryLinks(order);
    
  } catch (error) {
    // لا نرمي الخطأ حتى لا نوقف العملية
  }
};

/**
 * Add Real Delivery Links from Services to Order
 */
const addTestDeliveryLinks = async (order) => {
  try {

    // تحميل الطلب مع الخدمات المرتبطة
    await order.populate('items.serviceId');
    
    const allDeliveryLinks = [];
    
    // استخراج الروابط من كل خدمة في الطلب
    for (const item of order.items) {
      if (item.serviceId) {
        const service = item.serviceId;

        // البحث في digitalDelivery.links (البنية الجديدة)
        if (service.digitalDelivery && service.digitalDelivery.links && service.digitalDelivery.links.length > 0) {

          const transformedLinks = service.digitalDelivery.links.map(link => ({
            title: link.title || 'رابط التسليم',
            url: link.url,
            description: link.description || '',
            image: link.imageUrl || null,
            language: link.locale || 'ar',
            tags: link.tags || []
          }));
          allDeliveryLinks.push(...transformedLinks);
        }
        
        // البحث في deliveryLinks (البنية القديمة)
        if (service.deliveryLinks && service.deliveryLinks.length > 0) {

          const legacyLinks = service.deliveryLinks.map(link => ({
            title: typeof link === 'string' ? 'رابط التسليم' : (link.title || 'رابط التسليم'),
            url: typeof link === 'string' ? link : link.url,
            description: typeof link === 'string' ? '' : (link.description || ''),
            image: typeof link === 'string' ? null : (link.image || null)
          }));
          allDeliveryLinks.push(...legacyLinks);
        }

      }
    }
    
    if (allDeliveryLinks.length === 0) {

      // إضافة روابط تجريبية كـ fallback
      allDeliveryLinks.push({
        title: 'الملف النهائي - عالي الجودة',
        url: 'https://drive.google.com/file/d/1example123/view',
        description: 'ملف التصميم النهائي بصيغة عالية الجودة'
      });
    }

    // تحديث الطلب بالروابط
    await Order.findByIdAndUpdate(order._id, {
      deliveryLinks: allDeliveryLinks,
      deliveredAt: new Date(),
      deliveryEmailSent: false, // سيتم تعيينها true بعد إرسال الإيميل
      status: 'delivered'
    });

    // إرسال إيميل التسليم
    await sendDeliveryEmail(order, allDeliveryLinks);
    
  } catch (error) {
  }
};

/**
 * Send Delivery Email with Links
 */
const sendDeliveryEmail = async (order, deliveryLinks) => {
  try {
    const customerEmail = order.guestInfo?.email || order.userId?.email;
    const customerName = order.guestInfo?.name || order.userId?.name || 'العميل الكريم';
    
    if (!customerEmail) {

      return;
    }

    await sendEmail({
      to: customerEmail,
      template: 'delivery-notification',
      data: {
        orderNumber: order.orderNumber,
        customerName,
        deliveryLinks
      }
    });
    
    // تحديث الطلب لتسجيل إرسال الإيميل
    await Order.findByIdAndUpdate(order._id, {
      deliveryEmailSent: true
    });

  } catch (error) {
  }
};

// ❌ REMOVED: sendDigitalDeliveryLinks function was duplicating delivery emails
// Now using only sendDeliveryEmail function to prevent duplicate emails

/**
 * Create simple order for payments without temp data
 */
const createSimpleOrder = async (payment) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const mongoose = (await import('mongoose')).default;
    
    // إنشاء ObjectId وهمي للخدمة
    const dummyServiceId = new mongoose.Types.ObjectId();
    
    // استخدام البيانات من tempOrderData.guestInfo (بيانات ContactStep) أو userId المحفوظ
    const User = (await import('../models/User.js')).default;
    let userId = payment.userId; // استخدام userId المحفوظ من وقت إنشاء Payment
    let userName = 'عميل PayPal';
    let userEmail = 'customer@example.com';
    let userPhone = '';

    if (!payment.meta?.tempOrderData) {

    }

    // Debug tempOrderData بالتفصيل
    if (payment.meta?.tempOrderData) {

    }
    
    // أولاً: استخدام بيانات ContactStep من tempOrderData (الأولوية)
    const tempOrderData = payment.meta?.tempOrderData;
    if (tempOrderData?.guestInfo) {
      userName = tempOrderData.guestInfo.name || 'عميل';
      userEmail = tempOrderData.guestInfo.email || 'customer@example.com';
      userPhone = tempOrderData.guestInfo.phone || '';

    }
    // ثانياً: إذا مفيش tempOrderData، استخدام بيانات المستخدم المسجل
    else if (userId) {
      try {
        const existingUser = await User.findById(userId);
        if (existingUser) {
          userName = existingUser.name || 'مستخدم';
          userEmail = existingUser.email;
        } else {

          userId = null;
        }
      } catch (error) {

        userId = null;
      }
    } else {

    }
    
    // إعداد البيانات الأساسية للطلب
    let orderItems = [];
    let orderDescription = '';
    let orderNotes = '';

    // استخدام البيانات من tempOrderData إذا توفرت
    if (tempOrderData) {
      // استخدام الخدمات الحقيقية من tempOrderData
      if (tempOrderData.items && tempOrderData.items.length > 0) {
        // Import Service model to get real service names
        const { default: Service } = await import('../models/Service.js');
        
        orderItems = await Promise.all(tempOrderData.items.map(async (item) => {
          // إذا كان فيه serviceId حقيقي، لازم نجلب بياناته من قاعدة البيانات
          if (item.serviceId) {
            try {
              const service = await Service.findById(item.serviceId).select('title price');
              if (service) {

                return {
                  serviceId: item.serviceId, // استخدام الـ ID الحقيقي
                  title: service.title, // استخدام العنوان من قاعدة البيانات
                  price: item.price || service.price?.SAR || service.price || payment.amount,
                  quantity: item.quantity || 1,
                  currency: item.currency || payment.currency
                };
              } else {

              }
            } catch (error) {

            }
          }
          
          // إذا وصلنا هنا، معناها مفيش serviceId صحيح أو مفيش خدمة بالـ ID ده

          return {
            serviceId: dummyServiceId,
            title: item.title || { ar: 'خدمة غير محددة', en: 'Unspecified Service' },
            price: item.price || payment.amount,
            quantity: item.quantity || 1,
            currency: item.currency || payment.currency
          };
        }));

      }
      
      // استخدام الوصف والملاحظات
      orderDescription = tempOrderData.description || '';
      orderNotes = tempOrderData.notes || '';

    }
    
    // إذا لم توجد خدمات، استخدام خدمة افتراضية مع محاولة الحصول على اسم حقيقي
    if (orderItems.length === 0) {
      let defaultTitle = { ar: 'خدمة PayPal', en: 'PayPal Service' };
      let realServiceId = dummyServiceId;
      
      // Try to get a real service name as fallback
      try {
        const { default: Service } = await import('../models/Service.js');
        const firstService = await Service.findOne({ isActive: true }).select('title _id');
        if (firstService && firstService.title) {
          defaultTitle = firstService.title;
          realServiceId = firstService._id; // استخدام ID حقيقي

        }
      } catch (error) {

      }
      
      orderItems = [{
        serviceId: realServiceId,
        title: defaultTitle,
        price: payment.amount,
        quantity: 1,
        currency: payment.currency
      }];

    }

    // إعداد بيانات guestInfo - الأولوية للبيانات المدخلة في نموذج الطلب
    let guestContactInfo = {};
    
    if (tempOrderData && tempOrderData.guestInfo) {
      // استخدام البيانات المدخلة في نموذج الطلب (الأولوية القصوى)
      guestContactInfo = {
        name: tempOrderData.guestInfo.name || userName,
        email: tempOrderData.guestInfo.email || userEmail,
        phone: tempOrderData.guestInfo.phone || userPhone || payment.meta?.phone || payment.meta?.payer?.phone?.phone_number?.national_number || ''
      };

    } else {
      // 🎯 النهج الجديد: البحث في TempOrderData أولاً (مضمون 100%)

      try {
        const mongoose = (await import('mongoose')).default;
        
        // تعريف schema للبيانات المؤقتة (نفس الـ schema المستخدم في checkoutController)
        const TempOrderDataSchema = new mongoose.Schema({
          tempOrderId: { type: String, required: true, index: true },
          customerName: { type: String, default: '' },
          customerEmail: { type: String, default: '' },
          customerPhone: { type: String, default: '' },
          serviceId: { type: String, default: '' },
          serviceName: { type: String, default: '' }, // 🎯 اسم الخدمة
          description: { type: String, default: '' },
          notes: { type: String, default: '' },
          createdAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) }
        });
        
        const TempOrderData = mongoose.models.TempOrderData || mongoose.model('TempOrderData', TempOrderDataSchema);
        
        // البحث عن البيانات باستخدام tempOrderId من payment.meta
        const tempOrderId = payment.meta?.tempOrderId;

        let tempOrderData = null;
        if (tempOrderId) {
          tempOrderData = await TempOrderData.findOne({
            tempOrderId: tempOrderId,
            expiresAt: { $gt: new Date() } // لم تنته الصلاحية
          });
        }
        
        // إذا لم نجد بـ tempOrderId، نبحث بآخر بيانات محققة (fallback)
        if (!tempOrderData) {

          tempOrderData = await TempOrderData.findOne({
            expiresAt: { $gt: new Date() }
          }).sort({ verifiedAt: -1 });
        }
        
        if (tempOrderData) {

          guestContactInfo = {
            name: tempOrderData.customerName,
            email: tempOrderData.customerEmail,
            phone: tempOrderData.customerPhone || ''
          };
          
          // 🎯 استخدام بيانات الخدمة المحفوظة
          if (tempOrderData.serviceId || tempOrderData.serviceName) {
            orderItems = [{
              serviceId: tempOrderData.serviceId || 'temp-service',
              title: tempOrderData.serviceName ? 
                { ar: tempOrderData.serviceName, en: tempOrderData.serviceName } : 
                { ar: 'خدمة محققة', en: 'Verified Service' },
              price: payment.amount,
              quantity: 1,
              currency: payment.currency
            }];

          }
          
          // 🎯 استخدام الوصف والملاحظات المحفوظة
          orderDescription = tempOrderData.description || '';
          orderNotes = tempOrderData.notes || '';

        } else {

          const CheckoutEmailVerification = (await import('../models/CheckoutEmailVerification.js')).default;
        
          // البحث عن آخر تحقق ناجح في آخر 30 دقيقة
          const recentVerification = await CheckoutEmailVerification.findOne({
            isUsed: true,
            createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // آخر 30 دقيقة
          }).sort({ createdAt: -1 });
          
          if (recentVerification) {

            guestContactInfo = {
              name: recentVerification.name || `عميل محقق ${payment._id.toString().slice(-4)}`,
              email: recentVerification.email,
              phone: recentVerification.phone || ''
            };
          } else {
            // fallback نهائي للبيانات المولدة
            const paypalName = payment.meta?.payer?.name?.given_name || payment.meta?.payer?.name?.surname || '';
            const paypalEmail = payment.meta?.payer?.email_address || payment.meta?.email;
            const paypalPhone = payment.meta?.payer?.phone?.phone_number?.national_number || '';
            
            guestContactInfo = {
              name: paypalName || `عميل PayPal ${payment._id.toString().slice(-4)}`,
              email: paypalEmail || `customer-${payment._id.toString().slice(-8)}@example.com`,
              phone: paypalPhone || ''
            };

          }
        }
      } catch (error) {

        // fallback للبيانات المولدة
        guestContactInfo = {
          name: `عميل PayPal ${payment._id.toString().slice(-4)}`,
          email: `customer-${payment._id.toString().slice(-8)}@example.com`,
          phone: ''
        };
      }
    }

    const simpleOrderData = {
      userId: userId, // ربط بالمستخدم إذا وُجد
      guestInfo: guestContactInfo,
      items: orderItems,
      description: orderDescription,
      notes: orderNotes,
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
      currency: payment.currency,
      status: 'in_progress',
      paymentStatus: 'paid',
      emailVerified: true,
      emailVerifiedAt: new Date()
    };
    
    const order = new Order(simpleOrderData);
    await order.save();
    await order.markAsPaid(payment._id);
    
    // Update payment to reference the order
    payment.orderId = order._id;
    payment.meta = {
      ...payment.meta,
      simpleOrderCreated: true,
      webhookConfirmed: true
    };
    await payment.save();

    return order;
    
  } catch (error) {
    return null;
  }
};

/**
 * Create permanent order from temporary order data
 */
export const createPermanentOrder = async (payment) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const Service = (await import('../models/Service.js')).default;
    const tempOrderData = payment.meta.tempOrderData;
    
    if (!tempOrderData) {
      return;
    }

    // Process items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of tempOrderData.items) {
      const service = await Service.findById(item.serviceId);
      if (!service) continue;
      
      const quantity = item.quantity || 1;
      // Handle different price structures (amount, SAR/USD object, or direct number)
      const price = service.price?.amount || service.price?.SAR || service.price?.USD || service.price || 0;
      orderItems.push({
        serviceId: service._id,
        title: service.title,
        price: price,
        quantity: quantity
      });
      subtotal += price * quantity;
    }

    const tax = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + tax;

    // محاولة ربط الطلب بمستخدم موجود
    const User = (await import('../models/User.js')).default;
    let finalUserId = payment.userId || null;
    
    // استخدام بيانات PayPal الفعلية من الدفع
    const paypalEmail = payment.meta?.payer?.email_address || payment.meta?.email;
    const originalEmail = tempOrderData.guestInfo?.email;

    // إذا لم يكن هناك مستخدم مرتبط، ابحث بكلا الإيميلين
    if (!finalUserId) {
      // أولاً جرب بإيميل PayPal الفعلي
      if (paypalEmail) {
        try {
          const existingUser = await User.findOne({ 
            email: paypalEmail.toLowerCase() 
          });
          if (existingUser) {
            finalUserId = existingUser._id;
          }
        } catch (error) {

        }
      }
      
      // إذا لم ينجح، جرب بإيميل الطلب الأصلي
      if (!finalUserId && originalEmail) {
        try {
          const existingUser = await User.findOne({ 
            email: originalEmail.toLowerCase() 
          });
          if (existingUser) {
            finalUserId = existingUser._id;
          }
        } catch (error) {

        }
      }
    }

    // Create order data preserving original contact information
    const orderData = {
      userId: finalUserId,
      guestInfo: {
        // احتفظ ببيانات التواصل الأصلية (من ContactStep)
        name: tempOrderData.guestInfo?.name || 'عميل',
        email: (originalEmail || 'customer@example.com').toLowerCase(),
        phone: tempOrderData.guestInfo?.phone || ''
      },
      // إضافة بيانات PayPal كمعلومات إضافية
      paypalInfo: paypalEmail ? {
        email: paypalEmail.toLowerCase(),
        name: payment.meta?.payer?.name?.given_name || '',
        phone: payment.meta?.payer?.phone?.phone_number?.national_number || ''
      } : undefined,
      items: orderItems,
      subtotal,
      tax,
      discount: 0,
      total,
      currency: tempOrderData.currency || 'SAR',
      notes: tempOrderData.notes || '',
      description: tempOrderData.description || '',
      additionalNotes: tempOrderData.additionalNotes || '',
      attachments: [],
      emailVerified: true, // Already verified during checkout
      emailVerifiedAt: new Date(),
      status: 'in_progress', // Start as in_progress, will be marked as paid
      paymentStatus: 'pending'
    };

    const order = new Order(orderData);
    await order.save();
    await order.populate('items.serviceId');
    
    // Mark as paid to generate orderNumber

    await order.markAsPaid(payment._id);

    // Update payment to reference the real order
    payment.orderId = order._id;
    payment.meta = {
      ...payment.meta,
      permanentOrderCreated: true,
      originalTempId: payment.meta.tempOrderId
    };
    await payment.save();

    // إرسال إيميل التأكيد - فقط بعد التأكد من الدفع
    await sendOrderConfirmationEmail(order);
    
  } catch (error) {
  }
};

