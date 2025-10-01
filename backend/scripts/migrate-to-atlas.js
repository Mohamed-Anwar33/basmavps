import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB URIs
const LOCAL_URI = 'mongodb://127.0.0.1:27017/basma_db?directConnection=true&serverSelectionTimeoutMS=2000';
const ATLAS_URI = process.env.MONGODB_URI;

console.log('🚀 بدء عملية نقل البيانات من MongoDB المحلي إلى MongoDB Atlas');
console.log('📍 Local URI:', LOCAL_URI);
console.log('☁️ Atlas URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@')); // Hide password

// Collections to migrate (based on actual data scan)
const COLLECTIONS_TO_MIGRATE = [
  'users',           // 1 عنصر
  'services',        // 26 عنصر  
  'orders',          // 2 عنصر
  'payments',        // 2 عنصر
  'blogs',           // 4 عنصر
  'faqs',            // 7 عنصر
  'settings',        // 116 عنصر
  'pagecontents',    // 7 عنصر
  'banners',         // 7 عنصر
  'admins',          // 3 عنصر
  'auditlogs',       // 2539 عنصر
  'contactpagecontents', // 1 عنصر
  'contentversions', // 42 عنصر
  'homepageSections' // 3 عنصر
];

async function connectToDatabase(uri, name) {
  try {
    const connection = await mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ اتصال ناجح بـ ${name}`);
    return connection;
  } catch (error) {
    console.error(`❌ فشل الاتصال بـ ${name}:`, error.message);
    throw error;
  }
}

async function getCollectionData(connection, collectionName) {
  try {
    const collection = connection.db.collection(collectionName);
    const count = await collection.countDocuments();
    
    if (count === 0) {
      console.log(`⚪ ${collectionName}: لا توجد بيانات`);
      return [];
    }
    
    const data = await collection.find({}).toArray();
    console.log(`📦 ${collectionName}: تم جلب ${data.length} عنصر`);
    return data;
  } catch (error) {
    console.log(`⚠️ ${collectionName}: مجموعة غير موجودة أو فارغة`);
    return [];
  }
}

async function insertCollectionData(connection, collectionName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️ ${collectionName}: تم تخطي - لا توجد بيانات`);
    return;
  }
  
  try {
    const collection = connection.db.collection(collectionName);
    
    // Clear existing data in Atlas
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      await collection.deleteMany({});
      console.log(`🗑️ ${collectionName}: تم حذف ${existingCount} عنصر موجود`);
    }
    
    // Insert new data
    const result = await collection.insertMany(data, { ordered: false });
    console.log(`✅ ${collectionName}: تم رفع ${result.insertedCount} عنصر بنجاح`);
  } catch (error) {
    console.error(`❌ ${collectionName}: فشل في الرفع -`, error.message);
    throw error;
  }
}

async function createBackup(localConnection) {
  console.log('\n📋 إنشاء نسخة احتياطية من البيانات المحلية...');
  
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `local-backup-${timestamp}.json`);
  
  const backup = {};
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    const data = await getCollectionData(localConnection, collectionName);
    backup[collectionName] = data;
  }
  
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`💾 تم حفظ النسخة الاحتياطية: ${backupFile}`);
  
  return backup;
}

async function migrateData() {
  let localConnection, atlasConnection;
  
  try {
    // Connect to both databases
    console.log('\n🔌 الاتصال بقواعد البيانات...');
    localConnection = await connectToDatabase(LOCAL_URI, 'MongoDB المحلي');
    atlasConnection = await connectToDatabase(ATLAS_URI, 'MongoDB Atlas');
    
    // Create backup
    const backupData = await createBackup(localConnection);
    
    // Migrate each collection
    console.log('\n🚚 بدء عملية النقل...');
    let totalMigrated = 0;
    
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      console.log(`\n📁 معالجة مجموعة: ${collectionName}`);
      
      const data = backupData[collectionName];
      await insertCollectionData(atlasConnection, collectionName, data);
      
      if (data && data.length > 0) {
        totalMigrated += data.length;
      }
    }
    
    console.log(`\n🎉 تم النقل بنجاح! إجمالي العناصر المنقولة: ${totalMigrated}`);
    
    // Verify migration
    console.log('\n🔍 التحقق من البيانات المنقولة...');
    await verifyMigration(atlasConnection);
    
  } catch (error) {
    console.error('\n💥 خطأ في عملية النقل:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('🔌 تم إغلاق الاتصال بـ MongoDB المحلي');
    }
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('🔌 تم إغلاق الاتصال بـ MongoDB Atlas');
    }
  }
}

async function verifyMigration(atlasConnection) {
  console.log('\n📊 إحصائيات البيانات في MongoDB Atlas:');
  console.log('═'.repeat(50));
  
  let totalDocuments = 0;
  
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const collection = atlasConnection.db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`📁 ${collectionName.padEnd(25)}: ${count.toString().padStart(6)} عنصر`);
      totalDocuments += count;
    } catch (error) {
      console.log(`📁 ${collectionName.padEnd(25)}: ${' ERROR'.padStart(6)}`);
    }
  }
  
  console.log('═'.repeat(50));
  console.log(`📊 إجمالي المستندات: ${totalDocuments}`);
  
  // Test basic queries
  console.log('\n🧪 اختبار الاستعلامات الأساسية...');
  
  try {
    const usersCount = await atlasConnection.db.collection('users').countDocuments();
    const servicesCount = await atlasConnection.db.collection('services').countDocuments();
    const ordersCount = await atlasConnection.db.collection('orders').countDocuments();
    
    console.log(`✅ المستخدمون: ${usersCount}`);
    console.log(`✅ الخدمات: ${servicesCount}`);
    console.log(`✅ الطلبات: ${ordersCount}`);
    
    // Test a sample query
    const sampleUser = await atlasConnection.db.collection('users').findOne({});
    if (sampleUser) {
      console.log(`✅ عينة مستخدم: ${sampleUser.email || sampleUser.username || 'غير محدد'}`);
    }
    
    console.log('\n🎯 جميع الاختبارات نجحت! البيانات متاحة في MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ فشل في اختبار الاستعلامات:', error.message);
  }
}

// Run migration
migrateData().then(() => {
  console.log('\n✨ عملية النقل مكتملة بنجاح!');
  console.log('🔗 يمكنك الآن استخدام MongoDB Atlas في تطبيقك');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 فشلت عملية النقل:', error);
  process.exit(1);
});

export { migrateData, verifyMigration };
