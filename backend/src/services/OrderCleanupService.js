/**
 * 🧹 خدمة تنظيف الطلبات والمدفوعات الفاشلة
 * 
 * هذه الخدمة تتعامل مع:
 * 1. حذف الطلبات المعلقة القديمة (أكثر من 2 ساعة)
 * 2. حذف المدفوعات الفاشلة أو المعلقة القديمة
 * 3. تنظيف البيانات المؤقتة
 * 4. إرسال تقارير التنظيف للإدارة
 */

import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../utils/email.js';

class OrderCleanupService {
  
  /**
   * 🗑️ حذف الطلبات المعلقة القديمة
   * @param {number} hoursThreshold - عدد الساعات للحد الأدنى (افتراضي: 2)
   */
  static async cleanupPendingOrders(hoursThreshold = 2) {
    try {
      
      const cutoffTime = new Date(Date.now() - (hoursThreshold * 60 * 60 * 1000));
      
      // البحث عن الطلبات المعلقة القديمة
      const pendingOrders = await Order.find({
        $and: [
          {
            $or: [
              { paymentStatus: 'pending' },
              { status: 'pending' }
            ]
          },
          { createdAt: { $lt: cutoffTime } },
          // تأكد من عدم وجود دفعات ناجحة مرتبطة
          {
            $or: [
              { paymentId: null },
              { paymentId: { $exists: false } }
            ]
          }
        ]
      }).populate('paymentId');
      
      
      let cleanedCount = 0;
      const cleanupReport = [];
      
      for (const order of pendingOrders) {
        // تحقق إضافي: إذا كان هناك payment مربوط، تأكد من أنه فاشل أو معلق
        if (order.paymentId) {
          const payment = await Payment.findById(order.paymentId);
          if (payment && ['succeeded', 'processing'].includes(payment.status)) {
            continue;
          }
        }
        
        // جمع معلومات للتقرير
        const orderInfo = {
          orderId: order._id,
          createdAt: order.createdAt,
          guestInfo: order.guestInfo,
          total: order.total,
          currency: order.currency,
          items: order.items.length
        };
        cleanupReport.push(orderInfo);
        
        // حذف الطلب
        await Order.findByIdAndDelete(order._id);
        cleanedCount++;
        
      }
      
      return { cleanedCount, report: cleanupReport };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 🗑️ حذف المدفوعات الفاشلة أو المعلقة القديمة
   * @param {number} hoursThreshold - عدد الساعات للحد الأدنى (افتراضي: 1)
   */
  static async cleanupFailedPayments(hoursThreshold = 1) {
    try {
      
      const cutoffTime = new Date(Date.now() - (hoursThreshold * 60 * 60 * 1000));
      
      // البحث عن المدفوعات الفاشلة أو المعلقة القديمة
      const failedPayments = await Payment.find({
        $and: [
          {
            $or: [
              { status: 'failed' },
              { status: 'cancelled' },
              // المدفوعات المعلقة لأكثر من الحد المسموح
              {
                $and: [
                  { status: 'pending' },
                  { createdAt: { $lt: cutoffTime } }
                ]
              }
            ]
          },
          { createdAt: { $lt: cutoffTime } }
        ]
      });
      
      
      let cleanedCount = 0;
      const cleanupReport = [];
      
      for (const payment of failedPayments) {
        // جمع معلومات للتقرير
        const paymentInfo = {
          paymentId: payment._id,
          orderId: payment.orderId,
          status: payment.status,
          provider: payment.provider,
          amount: payment.amount,
          currency: payment.currency,
          createdAt: payment.createdAt,
          failureReason: payment.failureReason
        };
        cleanupReport.push(paymentInfo);
        
        // حذف المدفوعة
        await Payment.findByIdAndDelete(payment._id);
        cleanedCount++;
        
      }
      
      return { cleanedCount, report: cleanupReport };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 🧹 تنظيف شامل - تنفيذ جميع عمليات التنظيف
   */
  static async performFullCleanup() {
    try {
      
      const results = {
        startTime: new Date(),
        orders: null,
        payments: null,
        errors: []
      };
      
      // 1. تنظيف المدفوعات الفاشلة (1 ساعة)
      try {
        results.payments = await this.cleanupFailedPayments(1);
      } catch (error) {
        results.errors.push(`Payment cleanup failed: ${error.message}`);
      }
      
      // 2. تنظيف الطلبات المعلقة (2 ساعة)
      try {
        results.orders = await this.cleanupPendingOrders(2);
      } catch (error) {
        results.errors.push(`Order cleanup failed: ${error.message}`);
      }
      
      results.endTime = new Date();
      results.duration = results.endTime - results.startTime;
      
      // إنشاء تقرير شامل
      const report = {
        summary: {
          ordersСleaned: results.orders?.cleanedCount || 0,
          paymentsСleaned: results.payments?.cleanedCount || 0,
          totalErrors: results.errors.length,
          duration: `${Math.round(results.duration / 1000)}s`
        },
        details: results
      };
      
      
      // إرسال تقرير للإدارة إذا كان هناك تنظيف فعلي
      if (report.summary.ordersСleaned > 0 || report.summary.paymentsСleaned > 0) {
        await this.sendCleanupReport(report);
      }
      
      return report;
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 📧 إرسال تقرير التنظيف للإدارة
   */
  static async sendCleanupReport(report) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@basmadesign.com';
      
      await sendEmail({
        to: adminEmail,
        template: 'admin-cleanup-report',
        data: {
          report,
          timestamp: new Date().toLocaleString('ar-SA'),
          serverName: process.env.NODE_ENV || 'development'
        }
      });
      
      
    } catch (error) {
    }
  }
  
  /**
   * 🔍 فحص النظام وإرجاع إحصائيات التنظيف المطلوب
   */
  static async getCleanupStats() {
    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      const oneHourAgo = new Date(now.getTime() - (1 * 60 * 60 * 1000));
      
      // إحصائيات الطلبات المعلقة
      const pendingOrdersCount = await Order.countDocuments({
        $and: [
          {
            $or: [
              { paymentStatus: 'pending' },
              { status: 'pending' }
            ]
          },
          { createdAt: { $lt: twoHoursAgo } }
        ]
      });
      
      // إحصائيات المدفوعات الفاشلة
      const failedPaymentsCount = await Payment.countDocuments({
        $and: [
          {
            $or: [
              { status: 'failed' },
              { status: 'cancelled' },
              {
                $and: [
                  { status: 'pending' },
                  { createdAt: { $lt: oneHourAgo } }
                ]
              }
            ]
          }
        ]
      });
      
      return {
        pendingOrders: pendingOrdersCount,
        failedPayments: failedPaymentsCount,
        needsCleanup: pendingOrdersCount > 0 || failedPaymentsCount > 0
      };
      
    } catch (error) {
      return { pendingOrders: 0, failedPayments: 0, needsCleanup: false };
    }
  }
}

export default OrderCleanupService;
