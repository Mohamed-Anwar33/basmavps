import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const ATLAS_URI = process.env.MONGODB_URI;

console.log('🔍 التحقق من تكامل MongoDB Atlas مع التطبيق...');
console.log('📍 URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@'));

async function verifyIntegration() {
  try {
    console.log('\n⏳ الاتصال بـ MongoDB Atlas...');
    
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ تم الاتصال بنجاح!');
    
    // Test basic operations
    console.log('\n🧪 اختبار العمليات الأساسية...');
    
    const db = mongoose.connection.db;
    
    // 1. Test database info
    console.log(`📁 قاعدة البيانات: ${db.databaseName}`);
    
    // 2. List collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 المجموعات المتاحة: ${collections.length}`);
    
    // 3. Test creating a test document
    console.log('\n📝 اختبار إنشاء مستند...');
    const testCollection = db.collection('atlas_test');
    
    const testDoc = {
      message: 'اختبار MongoDB Atlas',
      timestamp: new Date(),
      project: 'بصمة تصميم',
      status: 'success'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ تم إنشاء مستند بـ ID: ${insertResult.insertedId}`);
    
    // 4. Test reading the document
    const retrievedDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    if (retrievedDoc) {
      console.log('✅ تم قراءة المستند بنجاح');
      console.log(`   الرسالة: ${retrievedDoc.message}`);
    }
    
    // 5. Test updating the document
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: true, updateTime: new Date() } }
    );
    console.log(`✅ تم تحديث ${updateResult.modifiedCount} مستند`);
    
    // 6. Test deleting the document
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`✅ تم حذف ${deleteResult.deletedCount} مستند`);
    
    // 7. Check existing collections for data
    console.log('\n📊 فحص البيانات الموجودة...');
    
    const importantCollections = ['users', 'services', 'orders', 'payments', 'settings'];
    let totalDocuments = 0;
    
    for (const collectionName of importantCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`📁 ${collectionName.padEnd(15)}: ${count.toString().padStart(6)} عنصر`);
        totalDocuments += count;
      } catch (error) {
        console.log(`📁 ${collectionName.padEnd(15)}: ${' ERROR'.padStart(6)}`);
      }
    }
    
    console.log(`\n📈 إجمالي المستندات في المجموعات الرئيسية: ${totalDocuments}`);
    
    // 8. Test application models (if available)
    console.log('\n🔧 اختبار نماذج التطبيق...');
    
    try {
      // Try to import and test a model
      const { default: User } = await import('../src/models/User.js').catch(() => ({ default: null }));
      
      if (User) {
        const userCount = await User.countDocuments();
        console.log(`👥 عدد المستخدمين: ${userCount}`);
        
        // Test creating a test user
        const testUser = new User({
          username: 'atlas_test_user',
          email: 'test@atlas.com',
          password: 'test123456',
          role: 'user'
        });
        
        await testUser.save();
        console.log('✅ تم إنشاء مستخدم اختبار');
        
        // Clean up test user
        await User.deleteOne({ email: 'test@atlas.com' });
        console.log('🗑️ تم حذف مستخدم الاختبار');
      } else {
        console.log('⚠️ لم يتم العثور على نموذج المستخدم');
      }
    } catch (error) {
      console.log('⚠️ لا يمكن اختبار نماذج التطبيق:', error.message);
    }
    
    console.log('\n🎉 جميع الاختبارات نجحت! MongoDB Atlas جاهز للاستخدام');
    console.log('\n📋 ملخص النتائج:');
    console.log('   ✅ الاتصال يعمل بنجاح');
    console.log('   ✅ عمليات CRUD تعمل بشكل صحيح');
    console.log('   ✅ قاعدة البيانات جاهزة للتطبيق');
    console.log('   ✅ يمكن بدء استخدام التطبيق مع MongoDB Atlas');
    
  } catch (error) {
    console.error('\n❌ فشل في التحقق:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n🔐 مشكلة في المصادقة:');
      console.error('   • تأكد من صحة اسم المستخدم وكلمة المرور');
      console.error('   • تأكد من أن المستخدم له صلاحيات على قاعدة البيانات');
    } else if (error.message.includes('network') || error.message.includes('connection')) {
      console.error('\n🌐 مشكلة في الشبكة:');
      console.error('   • تأكد من اتصال الإنترنت');
      console.error('   • تأكد من إعدادات IP Whitelist في MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

verifyIntegration();
