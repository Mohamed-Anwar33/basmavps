import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, '../.env') });

const ATLAS_URI = process.env.MONGODB_URI;

console.log('🔍 التحقق من البيانات في MongoDB Atlas');
console.log('☁️ Atlas URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@'));

async function verifyAtlasData() {
  let connection;
  
  try {
    // الاتصال بـ MongoDB Atlas
    console.log('\n⏳ الاتصال بـ MongoDB Atlas...');
    connection = await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ تم الاتصال بـ Atlas بنجاح!');
    
    const db = mongoose.connection.db;
    console.log(`📁 قاعدة البيانات: ${db.databaseName}`);
    
    // الحصول على قائمة جميع المجموعات
    const collections = await db.listCollections().toArray();
    console.log(`📚 عدد المجموعات: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log('\n⚪ لا توجد مجموعات في MongoDB Atlas');
      console.log('💡 قم بتشغيل عملية النقل أولاً');
      return;
    }
    
    console.log('\n📋 المجموعات والبيانات في Atlas:');
    console.log('═'.repeat(60));
    
    let totalDocuments = 0;
    let collectionsWithData = 0;
    const collectionStats = [];
    
    // فحص كل مجموعة
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`📁 ${collection.name.padEnd(25)}: ${count.toString().padStart(6)} عنصر`);
        
        totalDocuments += count;
        if (count > 0) {
          collectionsWithData++;
          
          // عينة من البيانات
          const sample = await db.collection(collection.name).findOne({});
          if (sample) {
            const fields = Object.keys(sample).slice(0, 3).join(', ');
            console.log(`   📄 عينة حقول: ${fields}...`);
          }
        }
        
        collectionStats.push({
          name: collection.name,
          count,
          hasData: count > 0
        });
        
      } catch (error) {
        console.error(`❌ ${collection.name}: خطأ في الفحص - ${error.message}`);
        collectionStats.push({
          name: collection.name,
          count: 'خطأ',
          hasData: false
        });
      }
    }
    
    console.log('═'.repeat(60));
    console.log(`📊 إجمالي المستندات: ${totalDocuments}`);
    console.log(`📚 مجموعات تحتوي على بيانات: ${collectionsWithData}/${collections.length}`);
    
    // مقارنة مع البيانات المتوقعة (حسب الفحص المحلي الأخير)
    const expectedData = {
      'users': 1,
      'services': 26,
      'orders': 2,
      'payments': 2,
      'blogs': 4,
      'faqs': 7,
      'settings': 116,
      'pagecontents': 7,
      'banners': 7,
      'admins': 3,
      'auditlogs': 2539,
      'contactpagecontents': 1,
      'contentversions': 42,
      'homepageSections': 3
    };
    
    console.log('\n🔍 مقارنة مع البيانات المتوقعة:');
    console.log('═'.repeat(60));
    
    let matchingCollections = 0;
    let totalExpected = 0;
    
    for (const [collectionName, expectedCount] of Object.entries(expectedData)) {
      totalExpected += expectedCount;
      const actualStat = collectionStats.find(stat => stat.name === collectionName);
      
      if (!actualStat) {
        console.log(`❌ ${collectionName.padEnd(25)}: مفقودة (متوقع: ${expectedCount})`);
      } else if (actualStat.count === expectedCount) {
        console.log(`✅ ${collectionName.padEnd(25)}: ${actualStat.count} عنصر (مطابق)`);
        matchingCollections++;
      } else if (actualStat.count === 'خطأ') {
        console.log(`❌ ${collectionName.padEnd(25)}: خطأ في الفحص (متوقع: ${expectedCount})`);
      } else {
        console.log(`⚠️ ${collectionName.padEnd(25)}: ${actualStat.count} عنصر (متوقع: ${expectedCount})`);
      }
    }
    
    console.log('═'.repeat(60));
    console.log(`📊 المجموعات المطابقة: ${matchingCollections}/${Object.keys(expectedData).length}`);
    console.log(`📊 إجمالي متوقع: ${totalExpected} | فعلي: ${totalDocuments}`);
    
    // اختبارات وظيفية
    console.log('\n🧪 اختبارات وظيفية:');
    console.log('═'.repeat(40));
    
    await runFunctionalTests(db);
    
    // تقييم النتيجة النهائية
    console.log('\n📋 التقييم النهائي:');
    console.log('═'.repeat(40));
    
    if (totalDocuments === 0) {
      console.log('❌ لا توجد بيانات في MongoDB Atlas');
      console.log('💡 قم بتشغيل عملية النقل أولاً');
    } else if (matchingCollections === Object.keys(expectedData).length && totalDocuments === totalExpected) {
      console.log('🎉 جميع البيانات تم نقلها بنجاح! ✨');
      console.log('✅ MongoDB Atlas جاهز للاستخدام مع التطبيق');
    } else if (totalDocuments > 0) {
      console.log('⚠️ تم نقل جزء من البيانات');
      console.log('💡 قد تحتاج إعادة تشغيل عملية النقل للمجموعات المفقودة');
    } else {
      console.log('❌ مشكلة في النقل');
      console.log('💡 راجع سجلات الأخطاء وأعد المحاولة');
    }
    
  } catch (error) {
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n❌ لا يمكن الاتصال بـ MongoDB Atlas');
      console.error('💡 تأكد من:');
      console.error('   - اتصال الإنترنت');
      console.error('   - صحة connection string في .env');
      console.error('   - إعدادات IP Whitelist في Atlas');
    } else {
      console.error('\n❌ خطأ في التحقق:', error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n🔌 تم قطع الاتصال');
    }
  }
}

async function runFunctionalTests(db) {
  const tests = [
    {
      name: 'اختبار المستخدمين',
      test: async () => {
        const collection = db.collection('users');
        const count = await collection.countDocuments();
        const sample = await collection.findOne({});
        return { count, hasEmail: !!sample?.email };
      }
    },
    {
      name: 'اختبار الخدمات',
      test: async () => {
        const collection = db.collection('services');
        const count = await collection.countDocuments();
        const sample = await collection.findOne({});
        return { count, hasTitle: !!sample?.title };
      }
    },
    {
      name: 'اختبار الإعدادات',
      test: async () => {
        const collection = db.collection('settings');
        const count = await collection.countDocuments();
        const sample = await collection.findOne({});
        return { count, hasKey: !!sample?.key };
      }
    },
    {
      name: 'اختبار الطلبات',
      test: async () => {
        const collection = db.collection('orders');
        const count = await collection.countDocuments();
        const sample = await collection.findOne({});
        return { count, hasOrderData: !!sample?._id };
      }
    },
    {
      name: 'اختبار المدفوعات',
      test: async () => {
        const collection = db.collection('payments');
        const count = await collection.countDocuments();
        const sample = await collection.findOne({});
        return { count, hasPaymentData: !!sample?._id };
      }
    }
  ];
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      
      if (result.count > 0) {
        const details = Object.entries(result)
          .filter(([key]) => key !== 'count')
          .map(([key, value]) => `${key}: ${value ? '✅' : '❌'}`)
          .join(', ');
        
        console.log(`✅ ${name}: ${result.count} عنصر ${details ? `(${details})` : ''}`);
      } else {
        console.log(`⚪ ${name}: لا توجد بيانات`);
      }
    } catch (error) {
      console.log(`❌ ${name}: خطأ في الاختبار`);
    }
  }
}

// تشغيل التحقق
verifyAtlasData();
