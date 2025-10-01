/**
 * 🕒 مجدول المهام التلقائية لتنظيف النظام
 * 
 * يقوم بتشغيل عمليات التنظيف بشكل دوري:
 * - كل 30 دقيقة: تنظيف المدفوعات الفاشلة
 * - كل ساعتين: تنظيف الطلبات المعلقة
 * - يومياً: تنظيف شامل مع تقرير
 */

import cron from 'node-cron';
import OrderCleanupService from '../services/OrderCleanupService.js';

class CleanupScheduler {
  
  static start() {
    
    // 🔄 كل 30 دقيقة: تنظيف سريع للمدفوعات الفاشلة
    cron.schedule('*/30 * * * *', async () => {
      try {
        const result = await OrderCleanupService.cleanupFailedPayments(0.5); // 30 دقيقة
        
        if (result.cleanedCount > 0) {
        }
      } catch (error) {
      }
    }, {
      timezone: "Asia/Riyadh"
    });
    
    // 🔄 كل ساعتين: تنظيف الطلبات المعلقة
    cron.schedule('0 */2 * * *', async () => {
      try {
        const result = await OrderCleanupService.cleanupPendingOrders(2);
        
        if (result.cleanedCount > 0) {
        }
      } catch (error) {
      }
    }, {
      timezone: "Asia/Riyadh"
    });
    
    // 🔄 يومياً في الساعة 2:00 ص: تنظيف شامل مع تقرير
    cron.schedule('0 2 * * *', async () => {
      try {
        const report = await OrderCleanupService.performFullCleanup();
        
        
      } catch (error) {
      }
    }, {
      timezone: "Asia/Riyadh"
    });
    
    // 🔄 كل أسبوع يوم الجمعة: تحليل وتقرير مفصل
    cron.schedule('0 1 * * 5', async () => {
      try {
        const stats = await OrderCleanupService.getCleanupStats();
        
        if (stats.needsCleanup) {
          // تنفيذ تنظيف إضافي إذا احتاج الأمر
          await OrderCleanupService.performFullCleanup();
        } else {
        }
      } catch (error) {
      }
    }, {
      timezone: "Asia/Riyadh"
    });
    
    
    // عرض المهام المجدولة
    this.showScheduledTasks();
  }
  
  static stop() {
    cron.destroyAll();
  }
  
  static showScheduledTasks() {
    console.log('   • Weekly (Friday 1:00 AM): Analysis and deep cleanup');
  }
  
  /**
   * تشغيل تنظيف فوري يدوي
   */
  static async runManualCleanup() {
    try {
      const report = await OrderCleanupService.performFullCleanup();
      return report;
    } catch (error) {
      throw error;
    }
  }
}

export default CleanupScheduler;
