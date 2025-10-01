import Order from '../models/Order.js';
import CheckoutEmailVerification from '../models/CheckoutEmailVerification.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/email.js';

/**
 * Save order data temporarily before payment
 * POST /api/checkout/save-temp-data
 * body: { tempOrderId, customerData, serviceData, projectData }
 */
export const saveTempOrderData = async (req, res) => {
  try {

    const { tempOrderId, customerData, serviceData, projectData } = req.body;

    if (!tempOrderId) {
      return res.status(400).json({ success: false, error: 'tempOrderId is required' });
    }

    const mongoose = (await import('mongoose')).default;
    
    // تعريف schema للبيانات المؤقتة
    const TempOrderDataSchema = new mongoose.Schema({
      tempOrderId: { type: String, required: true, index: true },
      customerName: { type: String, default: '' },
      customerEmail: { type: String, default: '' },
      customerPhone: { type: String, default: '' },
      serviceId: { type: String, default: '' },
      serviceName: { type: String, default: '' },
      description: { type: String, default: '' },
      notes: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) }
    });
    
    const TempOrderData = mongoose.models.TempOrderData || mongoose.model('TempOrderData', TempOrderDataSchema);
    
    // حفظ البيانات
    const savedData = await TempOrderData.findOneAndUpdate(
      { tempOrderId },
      {
        tempOrderId,
        customerName: customerData?.name || '',
        customerEmail: customerData?.email || '',
        customerPhone: customerData?.phone || '',
        serviceId: serviceData?.id || '',
        serviceName: serviceData?.name || '',
        description: projectData?.description || '',
        notes: projectData?.notes || '',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    return res.json({ 
      success: true, 
      message: 'تم حفظ البيانات المؤقتة بنجاح',
      data: savedData
    });
    
  } catch (error) {
    return res.status(500).json({ success: false, error: 'خطأ في حفظ البيانات' });
  }
};

/**
 * Send OTP code to the email used in checkout (guest orders)
 * POST /api/checkout/email/send-code
 * body: { orderId, email, name? }
 */
// 🔒 متغير عام لتتبع الطلبات الجارية (منع التداخل)
const ongoingRequests = new Map();

export const sendCheckoutEmailCode = async (req, res) => {
  try {
    const { orderId, email, name, phone, serviceId, description, notes } = req.body;

    if (!orderId || !email) {
      return res.status(400).json({ success: false, error: 'orderId and email are required' });
    }

    // 🔒 منع الطلبات المتزامنة - فحص الطلبات الجارية
    const requestKey = `${orderId}-${email.toLowerCase()}`;
    if (ongoingRequests.has(requestKey)) {
      return res.status(429).json({
        success: false,
        error: 'طلب جاري بالفعل. يرجى الانتظار.'
      });
    }

    // تسجيل الطلب كجاري
    ongoingRequests.set(requestKey, Date.now());
    
    // تنظيف الطلب بعد 10 ثواني (حماية من memory leaks)
    setTimeout(() => {
      ongoingRequests.delete(requestKey);
    }, 10000);

    // Check if orderId is a temporary ID (starts with 'temp_')
    const isTemporaryOrder = orderId.startsWith('temp_');
    
    if (isTemporaryOrder) {

      // For temporary orders, we'll create a simplified email verification
      // without requiring an existing order in database
      
      // 🔒 تحسين آلية منع التكرار - فحص أقوى
      const recent = await CheckoutEmailVerification.findOne({
        tempOrderId: orderId,
        email: email.toLowerCase(),
        createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
      }).sort({ createdAt: -1 });

      if (recent) {
        const timeLeft = Math.ceil((60 * 1000 - (Date.now() - recent.createdAt)) / 1000);
        return res.status(429).json({
          success: false,
          error: `يرجى الانتظار ${timeLeft} ثانية قبل إعادة إرسال الرمز`,
          timeLeft
        });
      }

      // 🔒 فحص إضافي: منع الطلبات المتزامنة (نفس الثانية)
      const sameSecond = await CheckoutEmailVerification.findOne({
        tempOrderId: orderId,
        email: email.toLowerCase(),
        createdAt: { $gt: new Date(Date.now() - 2 * 1000) } // آخر ثانيتين
      });

      if (sameSecond) {
        return res.status(429).json({
          success: false,
          error: 'طلب سريع جداً. يرجى الانتظار قليلاً.'
        });
      }

      // Invalidate previous codes for this temp order
      await CheckoutEmailVerification.updateMany(
        { tempOrderId: orderId, email: email.toLowerCase(), isUsed: false },
        { isUsed: true }
      );

      // Generate and save new code for temporary order
      const code = CheckoutEmailVerification.generateCode();

      const verification = new CheckoutEmailVerification({
        tempOrderId: orderId,
        email: email.toLowerCase(),
        name: name || '', // 🎯 حفظ الاسم
        phone: phone || '', // 🎯 حفظ الهاتف
        serviceId: serviceId || '', // 🎯 حفظ معرف الخدمة
        description: description || '', // 🎯 حفظ وصف المشروع
        notes: notes || '', // 🎯 حفظ الملاحظات
        code
      });

      await verification.save();

      // Send email with template
      try {
        console.log(`🔍 Attempting to send verification email to: ${email}`);
        console.log(`📧 Verification code: ${code}`);
        
        await sendEmail({
          to: email,
          template: 'email-verification',
          data: {
            name: name || 'العميل',
            code
          }
        });
        
        console.log(`✅ Verification email sent successfully to: ${email}`);

      } catch (emailError) {
        console.error(`❌ Email sending failed: ${emailError.message}`);
        
        // في وضع التطوير، نتجاهل خطأ الإيميل ونكمل العملية
        const isDevMode = process.env.NODE_ENV !== 'production';
        if (isDevMode) {
          console.log(`⚠️ Development mode: Ignoring email error and continuing...`);
          console.log(`🔧 Dev Code for testing: ${code}`);
        } else {
          return res.status(500).json({ success: false, error: 'فشل إرسال البريد الإلكتروني. حاول مرة أخرى لاحقاً.' });
        }
      }

      // Dev helper: if SMTP is not configured or not production, return the code for testing
      const isDevNoSmtp = (!process.env.SMTP_HOST) || process.env.NODE_ENV !== 'production';
      
      // 🔒 تنظيف الطلب الجاري عند النجاح
      ongoingRequests.delete(requestKey);
      
      return res.json({
        success: true,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.',
        ...(isDevNoSmtp ? { data: { devCode: code } } : {})
      });
    }

    // Handle regular orders with database IDs
    const order = await Order.findById(orderId);
    if (!order) {
      // 🔒 تنظيف الطلب الجاري عند الخطأ
      ongoingRequests.delete(requestKey);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Do not allow sending code for finalized orders
    if (['paid', 'delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return res.status(400).json({ success: false, error: 'Order status does not allow sending verification code' });
    }

    // Store/Update contact email under guestInfo even for logged-in orders
    if (!order.guestInfo) order.guestInfo = {};
    order.guestInfo.email = email.toLowerCase();
    order.guestInfo.name = name || order.guestInfo.name || 'Ø§Ù„Ø¹Ù…ÙŠÙ„';

    // Reset verification flags when sending a new code
    order.emailVerified = false;
    order.emailVerifiedAt = null;
    await order.save();

    // 🔒 تحسين آلية منع التكرار للطلبات الحقيقية
    const recent = await CheckoutEmailVerification.findOne({
      orderId: order._id,
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (recent) {
      const timeLeft = Math.ceil((60 * 1000 - (Date.now() - recent.createdAt)) / 1000);
      return res.status(429).json({
        success: false,
        error: `يرجى الانتظار ${timeLeft} ثانية قبل إعادة إرسال الرمز`,
        timeLeft
      });
    }

    // 🔒 فحص إضافي: منع الطلبات المتزامنة للطلبات الحقيقية
    const sameSecond = await CheckoutEmailVerification.findOne({
      orderId: order._id,
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 2 * 1000) }
    });

    if (sameSecond) {
      return res.status(429).json({
        success: false,
        error: 'طلب سريع جداً. يرجى الانتظار قليلاً.'
      });
    }

    // Invalidate previous codes
    await CheckoutEmailVerification.updateMany(
      { orderId: order._id, email: email.toLowerCase(), isUsed: false },
      { isUsed: true }
    );

    // Generate and save new code
    const code = CheckoutEmailVerification.generateCode();
    const verification = new CheckoutEmailVerification({
      orderId: order._id,
      email: email.toLowerCase(),
      code
    });
    await verification.save();

    // Send email with template
    try {

      await sendEmail({
        to: email,
        template: 'email-verification',
        data: {
          name: order.guestInfo?.name || 'العميل',
          code
        }
      });


    } catch (emailError) {
      return res.status(500).json({ success: false, error: 'فشل إرسال البريد الإلكتروني. حاول مرة أخرى لاحقاً.' });
    }

    // Log action (only if an authenticated user exists)
    if (order.userId) {
      await AuditLog.logAction(order.userId, 'create', 'checkout_email_verification', verification._id, {
        action: 'send_code',
        orderId: order._id,
        email: email.toLowerCase()
      }, req);
    }

    // Dev helper: if SMTP is not configured or not production, return the code for testing
    const isDevNoSmtp = (!process.env.SMTP_HOST) || process.env.NODE_ENV !== 'production';
    
    // 🔒 تنظيف الطلب الجاري عند النجاح
    ongoingRequests.delete(requestKey);
    
    return res.json({
      success: true,
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.',
      ...(isDevNoSmtp ? { data: { devCode: code } } : {})
    });
  } catch (error) {
    
    // 🔒 تنظيف الطلب الجاري عند الخطأ
    const { orderId, email } = req.body;
    if (orderId && email) {
      const requestKey = `${orderId}-${email.toLowerCase()}`;
      ongoingRequests.delete(requestKey);
    }
    
    return res.status(500).json({ success: false, error: 'حدث خطأ أثناء إرسال رمز التحقق' });
  }
};

/**
 * Verify OTP code for checkout email (guest orders)
 * POST /api/checkout/email/verify
 * body: { orderId, email, code }
 */
export const verifyCheckoutEmailCode = async (req, res) => {
  try {

    const { orderId, email, code } = req.body;

    if (!orderId || !email || !code) {

      return res.status(400).json({ 
        success: false, 
        error: 'orderId, email and code are required',
        details: {
          orderId: !!orderId,
          email: !!email,
          code: !!code
        }
      });
    }

    // Check if orderId is a temporary ID (starts with 'temp_')
    const isTemporaryOrder = orderId.startsWith('temp_');
    
    if (isTemporaryOrder) {

      // Dev helper: allow a master code in development when SMTP is not configured
      const isDevNoSmtp = (!process.env.SMTP_HOST) || process.env.NODE_ENV !== 'production';
      if (isDevNoSmtp && code === '000000') {
        return res.json({ 
          success: true, 
          message: 'تم التحقق من البريد الإلكتروني بنجاح (وضع التطوير).',
          verified: true
        });
      }

      // Find verification for temporary order
      const verification = await CheckoutEmailVerification.findOne({
        tempOrderId: orderId,
        email: email.toLowerCase(),
        code: code,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!verification) {
        // Increment attempts on latest code for this temp order/email
        const latest = await CheckoutEmailVerification.findOne({ 
          tempOrderId: orderId, 
          email: email.toLowerCase() 
        }).sort({ createdAt: -1 });
        
        if (latest) await latest.incrementAttempts();

        return res.status(400).json({ success: false, error: 'رمز غير صحيح أو منتهي الصلاحية' });
      }

      await verification.markAsUsed();

      // 🎯 حفظ البيانات في نموذج خاص للطلبات المؤقتة
      try {

        // إنشاء نموذج بسيط لحفظ بيانات الطلبات المؤقتة
        const mongoose = (await import('mongoose')).default;
        
        // تعريف schema بسيط للبيانات المؤقتة
        const TempOrderDataSchema = new mongoose.Schema({
          tempOrderId: { type: String, required: true, index: true },
          customerName: { type: String, required: true },
          customerEmail: { type: String, required: true },
          customerPhone: { type: String, default: '' },
          serviceId: { type: String, default: '' }, // 🎯 معرف الخدمة
          description: { type: String, default: '' }, // 🎯 وصف المشروع
          notes: { type: String, default: '' }, // 🎯 ملاحظات إضافية
          verifiedAt: { type: Date, default: Date.now },
          expiresAt: { type: Date, default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) } // تنتهي خلال ساعتين
        });
        
        // إنشاء أو استخدام النموذج
        const TempOrderData = mongoose.models.TempOrderData || mongoose.model('TempOrderData', TempOrderDataSchema);
        
        // 🎯 البحث عن بيانات الخدمة المرسلة عند إرسال الكود
        let savedServiceData = {};
        try {
          // البحث في CheckoutEmailVerification عن البيانات المحفوظة
          const latestVerification = await CheckoutEmailVerification.findOne({
            tempOrderId: orderId,
            email: verification.email
          }).sort({ createdAt: -1 });
          
          if (latestVerification) {
            savedServiceData = {
              serviceId: latestVerification.serviceId || '',
              description: latestVerification.description || '',
              notes: latestVerification.notes || ''
            };
          }
        } catch (e) {

        }

        // حفظ البيانات
        await TempOrderData.findOneAndUpdate(
          { tempOrderId: orderId },
          {
            tempOrderId: orderId,
            customerName: verification.name || 'عميل غير محدد',
            customerEmail: verification.email,
            customerPhone: verification.phone || '',
            serviceId: savedServiceData.serviceId || '',
            description: savedServiceData.description || '',
            notes: savedServiceData.notes || '',
            verifiedAt: new Date(),
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
          },
          { upsert: true, new: true }
        );

      } catch (error) {

      }

      return res.json({ 
        success: true, 
        message: 'تم التحقق من البريد الإلكتروني بنجاح. يمكنك المتابعة للدفع.',
        verified: true
      });
    }

    // Handle regular orders with database IDs
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Validate email matches order contact email
    if (email.toLowerCase() !== (order.guestInfo?.email || '').toLowerCase()) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني لا يطابق بيانات الطلب' });
    }

    // Dev helper: allow a master code in development when SMTP is not configured
    const isDevNoSmtp = (!process.env.SMTP_HOST) || process.env.NODE_ENV !== 'production';
    if (isDevNoSmtp && code === '000000') {
      order.emailVerified = true;
      order.emailVerifiedAt = new Date();
      await order.save();

      if (order.userId) {
        await AuditLog.logAction(order.userId, 'update', 'orders', order._id, {
          action: 'checkout_email_verified_dev_master_code',
          email: email.toLowerCase()
        }, req);
      }

      return res.json({ success: true, message: 'تم التحقق من البريد الإلكتروني بنجاح (وضع التطوير).' });
    }

    const verification = await CheckoutEmailVerification.findValidCode(order._id, email.toLowerCase(), code);

    if (!verification) {
      // Increment attempts on latest code for this order/email
      const latest = await CheckoutEmailVerification.findOne({ orderId: order._id, email: email.toLowerCase() })
        .sort({ createdAt: -1 });
      if (latest) await latest.incrementAttempts();

      return res.status(400).json({ success: false, error: 'رمز غير صحيح أو منتهي الصلاحية' });
    }

    await verification.markAsUsed();

    order.emailVerified = true;
    order.emailVerifiedAt = new Date();
    await order.save();

    // Log action (only if an authenticated user exists)
    if (order.userId) {
      await AuditLog.logAction(order.userId, 'update', 'orders', order._id, {
        action: 'checkout_email_verified',
        email: email.toLowerCase()
      }, req);
    }

    return res.json({ success: true, message: 'ØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø¨Ù†Ø¬Ø§Ø­. ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ù„Ù„Ø¯ÙØ¹.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'ÙØ´Ù„ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø±Ù…Ø² Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' });
  }
};

