import mongoose from 'mongoose';

const ATLAS_URI = 'mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔗 اختبار الاتصال بـ MongoDB Atlas...');

async function testConnection() {
  try {
    console.log('⏳ جاري الاتصال...');
    
    await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ تم الاتصال بنجاح بـ MongoDB Atlas!');
    
    // Test basic operation
    const db = mongoose.connection.db;
    console.log(`📁 اسم قاعدة البيانات: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 عدد المجموعات: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 المجموعات الموجودة:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  • ${collection.name}: ${count} عنصر`);
      }
    } else {
      console.log('📭 قاعدة البيانات فارغة - جاهزة لاستقبال البيانات');
    }
    
    console.log('\n🎉 MongoDB Atlas جاهز للاستخدام!');
    
  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message);
    
    if (error.message.includes('IP')) {
      console.error('\n💡 الحل المقترح:');
      console.error('1. اذهب إلى MongoDB Atlas Dashboard');
      console.error('2. اختر Network Access');
      console.error('3. أضف IP Address الحالي أو اختر "Allow access from anywhere"');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
