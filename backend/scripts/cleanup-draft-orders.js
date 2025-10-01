import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';

dotenv.config();

async function cleanupDraftOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // حذف الطلبات غير المدفوعة الأقدم من 24 ساعة
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    console.log('📅 Cutoff date:', cutoffDate.toISOString());

    const result = await Order.deleteMany({
      paymentStatus: 'pending',
      createdAt: { $lt: cutoffDate }
    });


    // إحصائيات الطلبات المتبقية
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingOrders = await Order.countDocuments({ paymentStatus: 'pending' });


    
  } catch (error) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// تشغيل التنظيف
cleanupDraftOrders();

// إضافة cron job للتشغيل التلقائي كل 6 ساعات
// يمكن إضافة هذا لـ package.json scripts:
// "cleanup": "node scripts/cleanup-draft-orders.js"
// ثم إضافة cron job: 0 */6 * * * cd /path/to/backend && npm run cleanup
