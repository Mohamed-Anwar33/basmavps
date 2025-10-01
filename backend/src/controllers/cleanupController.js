/**
 * 🧹 متحكم API لإدارة تنظيف النظام
 * 
 * يوفر endpoints للمديرين لمراقبة وإدارة عمليات التنظيف
 */

import OrderCleanupService from '../services/OrderCleanupService.js';
import CleanupScheduler from '../jobs/cleanupScheduler.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

/**
 * @swagger
 * /api/admin/cleanup/stats:
 *   get:
 *     summary: Get cleanup statistics
 *     tags: [Admin, Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup statistics retrieved
 */
export const getCleanupStats = async (req, res) => {
  try {
    // التحقق من صلاحيات المدير
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Admin role required'
      });
    }
    
    const stats = await OrderCleanupService.getCleanupStats();
    
    // إحصائيات إضافية
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    const additionalStats = {
      // إجمالي الطلبات في آخر 24 ساعة
      totalOrdersLast24h: await Order.countDocuments({
        createdAt: { $gte: twentyFourHoursAgo }
      }),
      
      // إجمالي المدفوعات في آخر 24 ساعة
      totalPaymentsLast24h: await Payment.countDocuments({
        createdAt: { $gte: twentyFourHoursAgo }
      }),
      
      // الطلبات المدفوعة بنجاح
      successfulOrders: await Order.countDocuments({
        paymentStatus: 'paid'
      }),
      
      // المدفوعات الناجحة
      successfulPayments: await Payment.countDocuments({
        status: 'succeeded'
      })
    };
    
    res.json({
      success: true,
      data: {
        cleanup: stats,
        system: additionalStats,
        timestamp: new Date(),
        recommendations: generateRecommendations(stats, additionalStats)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cleanup statistics'
    });
  }
};

/**
 * @swagger
 * /api/admin/cleanup/run:
 *   post:
 *     summary: Run manual cleanup
 *     tags: [Admin, Cleanup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [full, orders, payments]
 *                 default: full
 *               hoursThreshold:
 *                 type: number
 *                 default: 2
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 */
export const runManualCleanup = async (req, res) => {
  try {
    // التحقق من صلاحيات المدير
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Admin role required'
      });
    }
    
    const { type = 'full', hoursThreshold = 2 } = req.body;
    
    
    let result;
    
    switch (type) {
      case 'orders':
        result = await OrderCleanupService.cleanupPendingOrders(hoursThreshold);
        break;
        
      case 'payments':
        result = await OrderCleanupService.cleanupFailedPayments(hoursThreshold);
        break;
        
      case 'full':
      default:
        result = await OrderCleanupService.performFullCleanup();
        break;
    }
    
    // تسجيل العملية في Audit Log
    const AuditLog = (await import('../models/AuditLog.js')).default;
    await AuditLog.logAction(
      req.user._id,
      'cleanup',
      'system',
      null,
      {
        type,
        result: {
          ordersСleaned: result.summary?.ordersСleaned || result.cleanedCount || 0,
          paymentsСleaned: result.summary?.paymentsСleaned || 0
        }
      },
      req
    );
    
    res.json({
      success: true,
      message: `تم تنفيذ التنظيف ${type === 'full' ? 'الشامل' : type === 'orders' ? 'للطلبات' : 'للمدفوعات'} بنجاح`,
      data: result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في تنفيذ عملية التنظيف',
      details: error.message
    });
  }
};

/**
 * @swagger
 * /api/admin/cleanup/preview:
 *   get:
 *     summary: Preview what would be cleaned without actually doing it
 *     tags: [Admin, Cleanup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hoursThreshold
 *         schema:
 *           type: number
 *           default: 2
 *     responses:
 *       200:
 *         description: Cleanup preview generated
 */
export const previewCleanup = async (req, res) => {
  try {
    // التحقق من صلاحيات المدير
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - Admin role required'
      });
    }
    
    const { hoursThreshold = 2 } = req.query;
    const cutoffTime = new Date(Date.now() - (hoursThreshold * 60 * 60 * 1000));
    
    // البحث عن الطلبات المعلقة (بدون حذف)
    const pendingOrders = await Order.find({
      $and: [
        {
          $or: [
            { paymentStatus: 'pending' },
            { status: 'pending' }
          ]
        },
        { createdAt: { $lt: cutoffTime } },
        {
          $or: [
            { paymentId: null },
            { paymentId: { $exists: false } }
          ]
        }
      ]
    }).select('_id createdAt guestInfo.email total currency');
    
    // البحث عن المدفوعات الفاشلة (بدون حذف)
    const failedPayments = await Payment.find({
      $and: [
        {
          $or: [
            { status: 'failed' },
            { status: 'cancelled' },
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
    }).select('_id createdAt status provider amount currency');
    
    const preview = {
      pendingOrders: {
        count: pendingOrders.length,
        items: pendingOrders.map(order => ({
          id: order._id,
          createdAt: order.createdAt,
          email: order.guestInfo?.email,
          total: order.total,
          currency: order.currency,
          ageHours: Math.round((Date.now() - order.createdAt) / (1000 * 60 * 60))
        }))
      },
      failedPayments: {
        count: failedPayments.length,
        items: failedPayments.map(payment => ({
          id: payment._id,
          createdAt: payment.createdAt,
          status: payment.status,
          provider: payment.provider,
          amount: payment.amount,
          currency: payment.currency,
          ageHours: Math.round((Date.now() - payment.createdAt) / (1000 * 60 * 60))
        }))
      },
      totalItems: pendingOrders.length + failedPayments.length,
      cutoffTime,
      hoursThreshold: Number(hoursThreshold)
    };
    
    res.json({
      success: true,
      message: `معاينة التنظيف - ${preview.totalItems} عنصر سيتم حذفه`,
      data: preview
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'فشل في إنشاء معاينة التنظيف',
      details: error.message
    });
  }
};

/**
 * إنشاء توصيات بناءً على الإحصائيات
 */
function generateRecommendations(cleanupStats, systemStats) {
  const recommendations = [];
  
  if (cleanupStats.pendingOrders > 10) {
    recommendations.push({
      type: 'warning',
      message: `هناك ${cleanupStats.pendingOrders} طلب معلق يحتاج تنظيف`,
      action: 'فكر في تشغيل تنظيف الطلبات'
    });
  }
  
  if (cleanupStats.failedPayments > 20) {
    recommendations.push({
      type: 'warning', 
      message: `هناك ${cleanupStats.failedPayments} مدفوعة فاشلة تحتاج تنظيف`,
      action: 'يُنصح بتشغيل تنظيف المدفوعات'
    });
  }
  
  if (systemStats.totalOrdersLast24h === 0) {
    recommendations.push({
      type: 'info',
      message: 'لا توجد طلبات جديدة في آخر 24 ساعة',
      action: 'تحقق من حالة النظام'
    });
  }
  
  if (!cleanupStats.needsCleanup) {
    recommendations.push({
      type: 'success',
      message: 'النظام نظيف ولا يحتاج تنظيف',
      action: 'استمر في المراقبة الدورية'
    });
  }
  
  return recommendations;
}

export default {
  getCleanupStats,
  runManualCleanup, 
  previewCleanup
};
