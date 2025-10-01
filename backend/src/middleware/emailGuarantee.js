/**
 * Email Guarantee Middleware - ضمان إرسال الإيميل 100%
 * يعمل كـ safety net لضمان وصول إيميلات التأكيد
 */

import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { sendEmail } from '../utils/email.js';

/**
 * فحص دوري للطلبات المدفوعة بدون إيميل
 */
export const checkUnsentEmails = async () => {
  try {
    
    // البحث عن طلبات مدفوعة بدون إيميل خلال آخر ساعة
    const unsentOrders = await Order.find({
      paymentStatus: 'paid',
      deliveryEmailSent: { $ne: true },
      createdAt: {
        $gte: new Date(Date.now() - 60 * 60 * 1000) // آخر ساعة
      }
    }).populate('items.serviceId');

    if (unsentOrders.length === 0) {
      return;
    }


    for (const order of unsentOrders) {
      try {
        
        const customerEmail = order.guestInfo?.email;
        if (!customerEmail) {
          continue;
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

        // تحديث حالة الطلب والإيميل
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'paid',
          status: 'confirmed',
          deliveryEmailSent: true,
          deliveredAt: new Date(),
          emailSentViaGuard: true
        });


      } catch (emailError) {
      }
    }

  } catch (error) {
  }
};

/**
 * بدء المراقبة التلقائية
 */
export const startEmailGuard = () => {
  
  // فحص كل 5 دقائق
  setInterval(checkUnsentEmails, 5 * 60 * 1000);
  
  // فحص فوري عند البدء
  setTimeout(checkUnsentEmails, 10000); // بعد 10 ثوانٍ من البدء
  
};

/**
 * إرسال إيميل فوري للطلب
 */
export const sendImmediateEmail = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('items.serviceId');
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentStatus !== 'paid') {
      throw new Error('Order not paid');
    }

    const customerEmail = order.guestInfo?.email;
    if (!customerEmail) {
      throw new Error('No customer email');
    }


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

    // تحديث حالة الطلب والإيميل
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'paid',
      status: 'confirmed',
      deliveryEmailSent: true,
      deliveredAt: new Date(),
      emailSentImmediately: true
    });

    return true;

  } catch (error) {
    return false;
  }
};
