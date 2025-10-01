import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const ATLAS_URI = process.env.MONGODB_URI;

console.log('🔗 اختبار الاتصال بـ MongoDB Atlas...');
console.log('📍 URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@')); // Hide password

async function testConnection() {
  try {
    console.log('\n⏳ جاري الاتصال...');
    
    const connection = await mongoose.connect(ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ تم الاتصال بنجاح بـ MongoDB Atlas!');
    
    // Get database info
    const db = connection.connection.db;
    const admin = db.admin();
    
    console.log('\n📊 معلومات قاعدة البيانات:');
    console.log('═'.repeat(40));
    console.log(`📁 اسم قاعدة البيانات: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 عدد المجموعات: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('\n📋 المجموعات الموجودة:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  • ${collection.name}: ${count} عنصر`);
      }
    } else {
      console.log('📭 لا توجد مجموعات (قاعدة بيانات فارغة)');
    }
    
    // Test write operation
    console.log('\n🧪 اختبار عملية الكتابة...');
    const testCollection = db.collection('connection_test');
    const testDoc = {
      message: 'اختبار الاتصال',
      timestamp: new Date(),
      success: true
    };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ تم إدراج مستند اختبار بنجاح');
    
    // Test read operation
    const retrievedDoc = await testCollection.findOne({ message: 'اختبار الاتصال' });
    if (retrievedDoc) {
      console.log('✅ تم قراءة المستند بنجاح');
    }
    
    // Clean up test document
    await testCollection.deleteOne({ _id: testDoc._id });
    console.log('🗑️ تم حذف مستند الاختبار');
    
    console.log('\n🎉 جميع الاختبارات نجحت! MongoDB Atlas جاهز للاستخدام');
    
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
    
  } catch (error) {
    console.error('\n❌ فشل الاتصال بـ MongoDB Atlas:');
    console.error('💥 الخطأ:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 مشكلة في المصادقة:');
      console.error('   • تأكد من صحة اسم المستخدم وكلمة المرور');
      console.error('   • تأكد من إعدادات الشبكة في MongoDB Atlas');
    } else if (error.message.includes('connection')) {
      console.error('\n🌐 مشكلة في الاتصال:');
      console.error('   • تأكد من اتصال الإنترنت');
      console.error('   • تأكد من إعدادات الـ IP Whitelist في MongoDB Atlas');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection();

export { testConnection };
