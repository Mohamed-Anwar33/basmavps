/**
 * 🧪 سكريبت اختبار ميزة حذف الطلبات المعلقة
 * 
 * يقوم بإنشاء طلبات تجريبية ومدفوعات لاختبار:
 * 1. حذف الطلبات المعلقة (يجب أن ينجح)
 * 2. منع حذف الطلبات المدفوعة (يجب أن يفشل)
 * 3. الحذف الجماعي للطلبات المختلطة
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
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';
import Service from '../src/models/Service.js';

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
}

async function createTestOrders() {
  
  // البحث عن خدمة موجودة أو إنشاء واحدة
  let service = await Service.findOne();
  if (!service) {
    service = new Service({
      title: { ar: 'خدمة تجريبية', en: 'Test Service' },
      description: { ar: 'وصف تجريبي', en: 'Test description' },
      category: 'testing',
      price: { SAR: 100, USD: 27 },
      isActive: true
    });
    await service.save();
  }

  const testOrders = [];
  
  // 1. طلب معلق بدون دفعة (قابل للحذف)
  const pendingOrder1 = new Order({
    items: [{
      serviceId: service._id,
      title: service.title,
      quantity: 1,
      price: 100,
      currency: 'SAR'
    }],
    subtotal: 100,
    tax: 15,
    total: 115,
    currency: 'SAR',
    status: 'pending',
    paymentStatus: 'pending',
    guestInfo: {
      name: 'عميل تجريبي 1',
      email: 'test1@example.com',
      phone: '0501234567'
    }
  });
  await pendingOrder1.save();
  testOrders.push(pendingOrder1);

  // 2. طلب معلق بدون دفعة (قابل للحذف)
  const pendingOrder2 = new Order({
    items: [{
      serviceId: service._id,
      title: service.title,
      quantity: 2,
      price: 100,
      currency: 'SAR'
    }],
    subtotal: 200,
    tax: 30,
    total: 230,
    currency: 'SAR',
    status: 'pending',
    paymentStatus: 'pending',
    guestInfo: {
      name: 'عميل تجريبي 2',
      email: 'test2@example.com',
      phone: '0501234568'
    }
  });
  await pendingOrder2.save();
  testOrders.push(pendingOrder2);

  // 3. طلب مدفوع (غير قابل للحذف)
  const paidOrder = new Order({
    items: [{
      serviceId: service._id,
      title: service.title,
      quantity: 1,
      price: 150,
      currency: 'SAR'
    }],
    subtotal: 150,
    tax: 22.5,
    total: 172.5,
    currency: 'SAR',
    status: 'in_progress',
    paymentStatus: 'paid',
    orderNumber: `BD${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-TEST`,
    guestInfo: {
      name: 'عميل مدفوع',
      email: 'paid@example.com',
      phone: '0501234569'
    }
  });
  await paidOrder.save();
  testOrders.push(paidOrder);

  // إنشاء دفعة ناجحة للطلب المدفوع
  const successfulPayment = new Payment({
    orderId: paidOrder._id,
    provider: 'paypal',
    providerPaymentId: `test_payment_${Date.now()}`,
    amount: 172.5,
    currency: 'SAR',
    status: 'succeeded',
    meta: {
      testPayment: true,
      createdForTest: true
    }
  });
  await successfulPayment.save();
  
  // ربط الدفعة بالطلب
  paidOrder.paymentId = successfulPayment._id;
  await paidOrder.save();
  

  // 4. طلب معلق مع دفعة فاشلة (قابل للحذف)
  const orderWithFailedPayment = new Order({
    items: [{
      serviceId: service._id,
      title: service.title,
      quantity: 1,
      price: 75,
      currency: 'SAR'
    }],
    subtotal: 75,
    tax: 11.25,
    total: 86.25,
    currency: 'SAR',
    status: 'pending',
    paymentStatus: 'pending',
    guestInfo: {
      name: 'عميل دفعة فاشلة',
      email: 'failed@example.com',
      phone: '0501234570'
    }
  });
  await orderWithFailedPayment.save();
  testOrders.push(orderWithFailedPayment);

  const failedPayment = new Payment({
    orderId: orderWithFailedPayment._id,
    provider: 'paypal',
    providerPaymentId: `failed_payment_${Date.now()}`,
    amount: 86.25,
    currency: 'SAR',
    status: 'failed',
    failureReason: 'Test failure',
    meta: {
      testPayment: true,
      createdForTest: true
    }
  });
  await failedPayment.save();
  
  orderWithFailedPayment.paymentId = failedPayment._id;
  await orderWithFailedPayment.save();

  return testOrders;
}

async function testDeleteAPIs() {
  
  // البحث عن الطلبات التجريبية
  const pendingOrders = await Order.find({ 
    paymentStatus: 'pending',
    'guestInfo.email': { $regex: 'test.*@example.com' }
  });
  
  const paidOrders = await Order.find({ 
    paymentStatus: 'paid',
    'guestInfo.email': 'paid@example.com'
  });


  if (pendingOrders.length === 0) {
    return;
  }

  // اختبار 1: محاولة حذف طلب معلق (يجب أن ينجح)
  try {
    const pendingOrderToDelete = pendingOrders[0];
    
    // محاكاة استدعاء API (نحذف مباشرة هنا)
    
    if (pendingOrderToDelete.paymentStatus === 'paid') {
    } else {
      await Order.findByIdAndDelete(pendingOrderToDelete._id);
    }
  } catch (error) {
  }

  // اختبار 2: محاولة حذف طلب مدفوع (يجب أن يفشل)
  if (paidOrders.length > 0) {
    try {
      const paidOrderToDelete = paidOrders[0];
      
      if (paidOrderToDelete.paymentStatus === 'paid') {
      } else {
      }
    } catch (error) {
    }
  }

  // اختبار 3: الحذف الجماعي
  const remainingPending = await Order.find({ 
    paymentStatus: 'pending',
    'guestInfo.email': { $regex: 'test.*@example.com|failed@example.com' }
  });
  
  if (remainingPending.length > 0) {
    
    // محاكاة الحذف الجماعي
    const deletedCount = await Order.deleteMany({
      _id: { $in: remainingPending.map(o => o._id) },
      paymentStatus: { $ne: 'paid' }
    });
    
  } else {
  }
}

async function cleanup() {
  
  // حذف جميع البيانات التجريبية
  const deletedOrders = await Order.deleteMany({
    $or: [
      { 'guestInfo.email': { $regex: 'test.*@example.com' } },
      { 'guestInfo.email': 'paid@example.com' },
      { 'guestInfo.email': 'failed@example.com' }
    ]
  });
  
  const deletedPayments = await Payment.deleteMany({
    'meta.testPayment': true
  });
  
  const deletedServices = await Service.deleteMany({
    category: 'testing'
  });
  
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test'; // test, create, cleanup
  
  console.log('═'.repeat(50));
  
  await connectDB();
  
  try {
    switch (command) {
      case 'create':
        await createTestOrders();
        break;
        
      case 'cleanup':
        await cleanup();
        break;
        
      case 'test':
      default:
        await createTestOrders();
        await testDeleteAPIs();
        break;
    }
    
  } catch (error) {
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// التعامل مع إشارات الإيقاف
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// تشغيل السكريپت
main().catch(async (error) => {
  await mongoose.connection.close();
  process.exit(1);
});
