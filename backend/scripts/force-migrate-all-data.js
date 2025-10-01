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

console.log('🚀 نقل قسري لجميع البيانات من MongoDB المحلي إلى MongoDB Atlas');
console.log('📍 Local URI:', LOCAL_URI);
console.log('☁️ Atlas URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@'));

async function connectToDatabase(uri, name) {
  try {
    const connection = await mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
    });
    
    console.log(`✅ اتصال ناجح بـ ${name}`);
    return connection;
  } catch (error) {
    console.error(`❌ فشل الاتصال بـ ${name}:`, error.message);
    throw error;
  }
}

async function getAllCollections(connection) {
  try {
    const collections = await connection.db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('خطأ في جلب المجموعات:', error.message);
    return [];
  }
}

async function getCollectionData(connection, collectionName) {
  try {
    const collection = connection.db.collection(collectionName);
    const count = await collection.countDocuments();
    
    if (count === 0) {
      console.log(`⚪ ${collectionName}: فارغة`);
      return [];
    }
    
    console.log(`📦 ${collectionName}: جاري جلب ${count} مستند...`);
    const data = await collection.find({}).toArray();
    console.log(`✅ ${collectionName}: تم جلب ${data.length} مستند`);
    return data;
  } catch (error) {
    console.error(`❌ ${collectionName}: خطأ في الجلب -`, error.message);
    return [];
  }
}

async function insertCollectionData(connection, collectionName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️ ${collectionName}: تم تخطي - لا توجد بيانات`);
    return 0;
  }
  
  try {
    const collection = connection.db.collection(collectionName);
    
    // Clear existing data in Atlas first
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      await collection.deleteMany({});
      console.log(`🗑️ ${collectionName}: تم حذف ${existingCount} مستند موجود`);
    }
    
    // Insert new data in batches
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        const result = await collection.insertMany(batch, { ordered: false });
        totalInserted += result.insertedCount;
        console.log(`📥 ${collectionName}: تم رفع ${result.insertedCount} مستند (${totalInserted}/${data.length})`);
      } catch (error) {
        console.error(`⚠️ ${collectionName}: خطأ في batch ${i}-${i + batchSize}:`, error.message);
        // Continue with next batch
      }
    }
    
    console.log(`✅ ${collectionName}: اكتمل الرفع - ${totalInserted}/${data.length} مستند`);
    return totalInserted;
  } catch (error) {
    console.error(`❌ ${collectionName}: فشل في الرفع -`, error.message);
    return 0;
  }
}

async function forceMigrateAllData() {
  let localConnection, atlasConnection;
  
  try {
    // Connect to both databases
    console.log('\n🔌 الاتصال بقواعد البيانات...');
    localConnection = await connectToDatabase(LOCAL_URI, 'MongoDB المحلي');
    atlasConnection = await connectToDatabase(ATLAS_URI, 'MongoDB Atlas');
    
    // Get all collections from local database
    console.log('\n📋 جلب قائمة المجموعات من قاعدة البيانات المحلية...');
    const allCollections = await getAllCollections(localConnection);
    
    if (allCollections.length === 0) {
      console.log('⚪ لا توجد مجموعات في قاعدة البيانات المحلية');
      return;
    }
    
    console.log(`📚 تم العثور على ${allCollections.length} مجموعة:`);
    allCollections.forEach(col => console.log(`   • ${col}`));
    
    // Create backup first
    console.log('\n💾 إنشاء نسخة احتياطية...');
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `complete-backup-${timestamp}.json`);
    
    const backup = {};
    let totalLocalDocs = 0;
    
    // Backup all collections
    for (const collectionName of allCollections) {
      console.log(`\n📁 معالجة مجموعة: ${collectionName}`);
      const data = await getCollectionData(localConnection, collectionName);
      backup[collectionName] = data;
      totalLocalDocs += data.length;
    }
    
    // Save backup
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`💾 تم حفظ النسخة الاحتياطية: ${backupFile}`);
    console.log(`📊 إجمالي المستندات في النسخة الاحتياطية: ${totalLocalDocs}`);
    
    // Migrate each collection
    console.log('\n🚚 بدء عملية النقل الشاملة...');
    let totalMigrated = 0;
    let successfulCollections = 0;
    
    for (const collectionName of allCollections) {
      console.log(`\n📁 نقل مجموعة: ${collectionName}`);
      
      const data = backup[collectionName];
      const migrated = await insertCollectionData(atlasConnection, collectionName, data);
      
      if (migrated > 0) {
        totalMigrated += migrated;
        successfulCollections++;
      }
    }
    
    console.log(`\n🎉 اكتملت عملية النقل!`);
    console.log(`📊 الإحصائيات:`);
    console.log(`   📚 مجموعات تم معالجتها: ${allCollections.length}`);
    console.log(`   ✅ مجموعات نُقلت بنجاح: ${successfulCollections}`);
    console.log(`   📄 إجمالي المستندات المحلية: ${totalLocalDocs}`);
    console.log(`   📤 إجمالي المستندات المنقولة: ${totalMigrated}`);
    
    if (totalMigrated === totalLocalDocs && totalLocalDocs > 0) {
      console.log(`\n✅ نجح النقل بالكامل! جميع البيانات موجودة في MongoDB Atlas`);
    } else if (totalMigrated < totalLocalDocs) {
      console.log(`\n⚠️ نقل جزئي: ${totalLocalDocs - totalMigrated} مستند لم ينتقل`);
    } else {
      console.log(`\n⚪ لا توجد بيانات للنقل`);
    }
    
    // Verify migration
    console.log('\n🔍 التحقق من النقل...');
    await verifyMigration(atlasConnection, allCollections);
    
  } catch (error) {
    console.error('\n💥 خطأ في عملية النقل:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('\n🔌 تم إغلاق الاتصال بـ MongoDB المحلي');
    }
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('🔌 تم إغلاق الاتصال بـ MongoDB Atlas');
    }
  }
}

async function verifyMigration(atlasConnection, collections) {
  console.log('\n📊 إحصائيات البيانات في MongoDB Atlas:');
  console.log('═'.repeat(50));
  
  let totalDocuments = 0;
  
  for (const collectionName of collections) {
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
  
  if (totalDocuments > 0) {
    console.log('\n🎯 MongoDB Atlas جاهز للاستخدام مع جميع البيانات!');
  } else {
    console.log('\n⚠️ لا توجد بيانات في MongoDB Atlas');
  }
}

// Run migration
forceMigrateAllData();
