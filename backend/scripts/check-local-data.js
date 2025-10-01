import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/basma_db?directConnection=true&serverSelectionTimeoutMS=2000';

console.log('🔍 فحص البيانات في MongoDB المحلي...');

async function checkLocalData() {
  try {
    console.log('⏳ الاتصال بـ MongoDB المحلي...');
    
    const connection = await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ تم الاتصال بنجاح!');
    
    const db = mongoose.connection.db;
    console.log(`📁 قاعدة البيانات: ${db.databaseName}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 عدد المجموعات: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log('⚪ لا توجد مجموعات في قاعدة البيانات المحلية');
      console.log('💡 هذا يعني أن قاعدة البيانات فارغة أو لم يتم إنشاؤها بعد');
      return;
    }
    
    console.log('\n📋 المجموعات والبيانات:');
    console.log('═'.repeat(50));
    
    let totalDocuments = 0;
    let collectionsWithData = 0;
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📁 ${collection.name.padEnd(25)}: ${count.toString().padStart(6)} عنصر`);
      
      totalDocuments += count;
      if (count > 0) {
        collectionsWithData++;
        
        // Show sample document
        const sample = await db.collection(collection.name).findOne({});
        if (sample) {
          const fields = Object.keys(sample).slice(0, 3).join(', ');
          console.log(`   📄 عينة حقول: ${fields}...`);
        }
      }
    }
    
    console.log('═'.repeat(50));
    console.log(`📊 إجمالي المستندات: ${totalDocuments}`);
    console.log(`📚 مجموعات تحتوي على بيانات: ${collectionsWithData}/${collections.length}`);
    
    if (totalDocuments === 0) {
      console.log('\n⚪ قاعدة البيانات المحلية فارغة تماماً');
      console.log('💡 لا توجد بيانات للنقل إلى MongoDB Atlas');
      console.log('🎯 MongoDB Atlas جاهز للاستخدام مع التطبيق الجديد');
    } else {
      console.log('\n📦 توجد بيانات في قاعدة البيانات المحلية');
      console.log('🔄 يجب إعادة تشغيل عملية النقل');
    }
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n❌ لا يمكن الاتصال بـ MongoDB المحلي');
      console.error('💡 تأكد من أن MongoDB يعمل محلياً على المنفذ 27017');
      console.error('💡 أو أن قاعدة البيانات المحلية غير موجودة');
      console.log('\n✅ في هذه الحالة، MongoDB Atlas جاهز للاستخدام مباشرة');
    } else {
      console.error('❌ خطأ في الاتصال:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

checkLocalData();
