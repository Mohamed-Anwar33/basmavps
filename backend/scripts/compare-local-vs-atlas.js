import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB URIs
const LOCAL_URI = 'mongodb://127.0.0.1:27017/basma_db?directConnection=true&serverSelectionTimeoutMS=2000';
const ATLAS_URI = process.env.MONGODB_URI;

console.log('🔍 مقارنة البيانات بين MongoDB المحلي و MongoDB Atlas');
console.log('📍 Local URI:', LOCAL_URI);
console.log('☁️ Atlas URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@'));

// Collections to check
const COLLECTIONS_TO_CHECK = [
  'users',
  'services', 
  'orders',
  'payments',
  'blogs',
  'faqs',
  'contacts',
  'settings',
  'pagecontents',
  'banners',
  'checkoutemailverifications',
  'auditlogs',
  'admins',
  'emailverifications',
  'contactpagecontents',
  'homepageSections',
  'media',
  'contents',
  'contentversions',
  'policycontents'
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

async function getCollectionStats(connection, collectionName) {
  try {
    const collection = connection.db.collection(collectionName);
    const count = await collection.countDocuments();
    
    // Get sample document to check structure
    const sampleDoc = await collection.findOne({});
    
    return {
      count,
      exists: true,
      hasData: count > 0,
      sampleFields: sampleDoc ? Object.keys(sampleDoc).length : 0
    };
  } catch (error) {
    return {
      count: 0,
      exists: false,
      hasData: false,
      sampleFields: 0
    };
  }
}

async function compareData() {
  let localConnection, atlasConnection;
  
  try {
    // Connect to both databases
    console.log('\n🔌 الاتصال بقواعد البيانات...');
    localConnection = await connectToDatabase(LOCAL_URI, 'MongoDB المحلي');
    atlasConnection = await connectToDatabase(ATLAS_URI, 'MongoDB Atlas');
    
    console.log('\n📊 مقارنة البيانات...');
    console.log('═'.repeat(80));
    console.log('المجموعة'.padEnd(25) + 'محلي'.padStart(15) + 'Atlas'.padStart(15) + 'الحالة'.padStart(15));
    console.log('═'.repeat(80));
    
    let totalLocalDocs = 0;
    let totalAtlasDocs = 0;
    let missingCollections = [];
    let dataMismatches = [];
    
    for (const collectionName of COLLECTIONS_TO_CHECK) {
      const localStats = await getCollectionStats(localConnection, collectionName);
      const atlasStats = await getCollectionStats(atlasConnection, collectionName);
      
      totalLocalDocs += localStats.count;
      totalAtlasDocs += atlasStats.count;
      
      let status = '';
      if (!localStats.exists && !atlasStats.exists) {
        status = '⚪ غير موجود';
      } else if (localStats.count === atlasStats.count && localStats.count > 0) {
        status = '✅ متطابق';
      } else if (localStats.count === 0 && atlasStats.count === 0) {
        status = '⚪ فارغ';
      } else if (localStats.count > atlasStats.count) {
        status = '❌ ناقص';
        dataMismatches.push({
          collection: collectionName,
          local: localStats.count,
          atlas: atlasStats.count,
          missing: localStats.count - atlasStats.count
        });
      } else {
        status = '⚠️ زيادة';
      }
      
      console.log(
        collectionName.padEnd(25) + 
        localStats.count.toString().padStart(15) + 
        atlasStats.count.toString().padStart(15) + 
        status.padStart(15)
      );
    }
    
    console.log('═'.repeat(80));
    console.log('الإجمالي'.padEnd(25) + totalLocalDocs.toString().padStart(15) + totalAtlasDocs.toString().padStart(15));
    console.log('═'.repeat(80));
    
    // Summary
    console.log('\n📋 ملخص النتائج:');
    console.log(`📊 إجمالي المستندات المحلية: ${totalLocalDocs}`);
    console.log(`☁️ إجمالي المستندات في Atlas: ${totalAtlasDocs}`);
    
    if (dataMismatches.length > 0) {
      console.log('\n❌ مجموعات بها بيانات ناقصة:');
      for (const mismatch of dataMismatches) {
        console.log(`   • ${mismatch.collection}: ناقص ${mismatch.missing} مستند (محلي: ${mismatch.local}, Atlas: ${mismatch.atlas})`);
      }
      
      console.log('\n🔧 يجب إعادة تشغيل عملية النقل للمجموعات الناقصة');
    } else if (totalLocalDocs === totalAtlasDocs && totalAtlasDocs > 0) {
      console.log('\n🎉 تم نقل جميع البيانات بنجاح!');
      console.log('✅ MongoDB Atlas يحتوي على جميع البيانات المحلية');
      console.log('🔗 يمكنك الآن استخدام MongoDB Atlas بأمان');
    } else if (totalLocalDocs === 0 && totalAtlasDocs === 0) {
      console.log('\n⚪ كلا قاعدتي البيانات فارغتان');
      console.log('📝 لا توجد بيانات للنقل');
    } else {
      console.log('\n⚠️ هناك اختلاف في عدد المستندات');
      console.log('🔍 يرجى مراجعة التفاصيل أعلاه');
    }
    
    // Check specific important collections
    console.log('\n🔍 فحص المجموعات المهمة:');
    const importantCollections = ['users', 'services', 'orders', 'payments', 'settings'];
    
    for (const collectionName of importantCollections) {
      const localStats = await getCollectionStats(localConnection, collectionName);
      const atlasStats = await getCollectionStats(atlasConnection, collectionName);
      
      if (localStats.count > 0) {
        console.log(`📁 ${collectionName}:`);
        console.log(`   محلي: ${localStats.count} مستند`);
        console.log(`   Atlas: ${atlasStats.count} مستند`);
        
        if (localStats.count === atlasStats.count) {
          console.log(`   ✅ البيانات متطابقة`);
        } else {
          console.log(`   ❌ البيانات غير متطابقة - يحتاج إعادة نقل`);
        }
      }
    }
    
  } catch (error) {
    console.error('\n💥 خطأ في المقارنة:', error);
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

compareData();
