/**
 * 🧹 سكريپت التنظيف اليدوي للطلبات والمدفوعات الفاشلة
 * 
 * الاستخدام:
 * npm run cleanup               - تنظيف شامل (افتراضي)
 * npm run cleanup orders       - تنظيف الطلبات فقط  
 * npm run cleanup payments     - تنظيف المدفوعات فقط
 * npm run cleanup preview      - معاينة فقط بدون حذف
 */

import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

import mongoose from 'mongoose';
import OrderCleanupService from '../src/services/OrderCleanupService.js';

// الحصول على المعاملات من سطر الأوامر
const args = process.argv.slice(2);
const command = args[0] || 'full'; // full, orders, payments, preview
const hoursThreshold = parseFloat(args[1]) || 2; // عدد الساعات الافتراضي

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
}

async function runCleanup() {
  console.log('─'.repeat(50));
  
  try {
    let result;
    
    switch (command.toLowerCase()) {
      case 'orders':
        result = await OrderCleanupService.cleanupPendingOrders(hoursThreshold);
        break;
        
      case 'payments':
        result = await OrderCleanupService.cleanupFailedPayments(hoursThreshold);
        break;
        
      case 'preview':
        console.log('👁️ معاينة التنظيف (بدون حذف فعلي)...');
        result = await previewCleanup(hoursThreshold);
        break;
        
      case 'full':
      default:
        result = await OrderCleanupService.performFullCleanup();
        break;
    }
    
    // عرض النتائج
    displayResults(result, command);
    
  } catch (error) {
    process.exit(1);
  }
}

async function previewCleanup(hoursThreshold) {
  const Order = (await import('../src/models/Order.js')).default;
  const Payment = (await import('../src/models/Payment.js')).default;
  
  const cutoffTime = new Date(Date.now() - (hoursThreshold * 60 * 60 * 1000));
  
  // العثور على الطلبات المعلقة (بدون حذف)
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
  
  // العثور على المدفوعات الفاشلة (بدون حذف)
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
  
  return {
    preview: true,
    pendingOrders: {
      count: pendingOrders.length,
      items: pendingOrders
    },
    failedPayments: {
      count: failedPayments.length,
      items: failedPayments
    },
    totalItems: pendingOrders.length + failedPayments.length
  };
}

function displayResults(result, command) {
  console.log('\n' + '═'.repeat(50));
  console.log('═'.repeat(50));
  
  if (result.preview) {
    
    if (result.totalItems > 0) {
    } else {
    }
    return;
  }
  
  if (result.summary) {
    // نتائج التنظيف الشامل
  } else {
    // نتائج التنظيف المحدد
  }
  
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  const totalCleaned = result.summary ? 
    (result.summary.ordersСleaned + result.summary.paymentsСleaned) :
    (result.cleanedCount || 0);
    
  if (totalCleaned === 0) {
  } else {
  }
}

async function main() {
  console.log('═'.repeat(50));
  
  await connectDB();
  await runCleanup();
  
  await mongoose.connection.close();
  process.exit(0);
}

// التعامل مع إشارات الإيقاف
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// تشغيل السكريپت
main().catch(async (error) => {
  await mongoose.connection.close();
  process.exit(1);
});
