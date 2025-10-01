/**
 * Auto Email Sender - إرسال تلقائي فوري للإيميلات
 * يرسل الإيميل فور تأكيد الدفع بدون انتظار webhook
 */

import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { sendEmail } from '../utils/email.js';

/**
 * إرسال إيميل تلقائي فور تأكيد الدفع
 */
export const sendImmediateEmailOnPayment = async (paymentId) => {
  try {
    
    const payment = await Payment.findById(paymentId).populate('orderId');
    
    if (!payment) {
      return false;
    }

    if (!payment.orderId) {
      return false;
    }

    const order = payment.orderId;
    const customerEmail = order.guestInfo?.email;

    if (!customerEmail) {
      return false;
    }

    // تحقق إذا كان الإيميل تم إرساله مسبقاً
    if (order.deliveryEmailSent) {
      return true;
    }


    // إرسال الإيميل
    await sendEmail({
      to: customerEmail,
      template: 'order-confirmation',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.guestInfo?.name || 'عميل عزيز',
        items: order.items.map(item => ({
          title: item.serviceId ? item.serviceId.title : item.title,
          quantity: item.quantity,
          price: item.price
        })),
        total: order.total,
        currency: order.currency,
        orderDate: new Date(order.createdAt).toLocaleDateString('ar-SA'),
        notes: order.notes,
        description: order.description
      }
    });

    // تحديث قاعدة البيانات - تأكيد الطلب والإيميل
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'paid',
      status: 'confirmed',
      deliveryEmailSent: true,
      deliveredAt: new Date(),
      emailSentViaAutoSender: true
    });

    return true;

  } catch (error) {
    return false;
  }
};

/**
 * مراقبة الدفعات الجديدة وإرسال إيميلات تلقائية
 */
export const startAutoEmailMonitoring = () => {
  
  // فحص كل 10 ثوانٍ للدفعات الجديدة المؤكدة
  setInterval(async () => {
    try {
      // البحث عن دفعات مؤكدة بدون إيميل خلال آخر دقيقة
      const payments = await Payment.find({
        status: 'succeeded',
        createdAt: {
          $gte: new Date(Date.now() - 60 * 1000) // آخر دقيقة
        }
      }).populate({
        path: 'orderId',
        match: { deliveryEmailSent: { $ne: true } }
      });

      for (const payment of payments) {
        if (payment.orderId && !payment.orderId.deliveryEmailSent) {
          await sendImmediateEmailOnPayment(payment._id);
          
          // تأخير قصير بين الإيميلات
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
    }
  }, 10000); // كل 10 ثوانٍ

};

/**
 * إرسال إيميل فوري بعد العودة من PayPal
 */
export const scheduleEmailAfterPayPalReturn = (paymentId, delaySeconds = 15) => {
  
  setTimeout(async () => {
    try {
      const payment = await Payment.findById(paymentId).populate('orderId');
      
      if (!payment) {
        return;
      }

      // إرسال الإيميل إذا لم يرسل بعد
      if (payment.orderId && !payment.orderId.deliveryEmailSent) {
        await sendImmediateEmailOnPayment(paymentId);
      } else {
      }

    } catch (error) {
    }
  }, delaySeconds * 1000);
};
