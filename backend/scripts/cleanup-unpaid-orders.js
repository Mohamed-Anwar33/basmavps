import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path and load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Import models
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';

const cleanupUnpaidOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // العثور على الطلبات غير المدفوعة القديمة (أكثر من 24 ساعة)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    
    const unpaidOrders = await Order.find({
      paymentStatus: { $ne: 'paid' },
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    
    if (unpaidOrders.length === 0) {
      return;
    }
    
    // عرض تفاصيل الطلبات التي ستُحذف
    unpaidOrders.forEach(order => {
    });
    
    // حذف المدفوعات المرتبطة بهذه الطلبات
    const orderIds = unpaidOrders.map(o => o._id);
    const deletedPayments = await Payment.deleteMany({ orderId: { $in: orderIds } });
    
    // حذف الطلبات غير المدفوعة
    const deletedOrders = await Order.deleteMany({
      _id: { $in: orderIds }
    });
    
    
    // إحصائيات ما بعد الحذف
    const remainingOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    
    
  } catch (error) {
  } finally {
    await mongoose.connection.close();
  }
};

// تشغيل السكريبت
cleanupUnpaidOrders();
