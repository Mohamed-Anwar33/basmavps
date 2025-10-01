import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, '../.env') });

const ATLAS_URI = process.env.MONGODB_URI;

console.log('📥 استيراد البيانات من ملفات JSON إلى MongoDB Atlas');
console.log('☁️ Atlas URI:', ATLAS_URI.replace(/:[^:@]*@/, ':****@'));

async function importFromJSON(exportFolderName) {
  let connection;
  
  try {
    // التحقق من مجلد التصدير
    const exportDir = path.join(__dirname, '../exports');
    const exportPath = exportFolderName ? 
      path.join(exportDir, exportFolderName) : 
      findLatestExportFolder(exportDir);
    
    if (!fs.existsSync(exportPath)) {
      console.error(`❌ مجلد التصدير غير موجود: ${exportPath}`);
      console.log('\n💡 قم بتشغيل export-data-to-json.js أولاً لتصدير البيانات');
      process.exit(1);
    }
    
    console.log(`📁 مجلد الاستيراد: ${exportPath}`);
    
    // قراءة ملخص التصدير
    const summaryPath = path.join(exportPath, 'export-summary.json');
    let summary;
    if (fs.existsSync(summaryPath)) {
      summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      console.log(`📋 ملخص التصدير: ${summary.totalDocuments} مستند في ${summary.totalCollections} مجموعة`);
      console.log(`📅 تاريخ التصدير: ${new Date(summary.exportDate).toLocaleString('ar-EG')}`);
    }
    
    // الاتصال بـ MongoDB Atlas
    console.log('\n⏳ الاتصال بـ MongoDB Atlas...');
    connection = await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ تم الاتصال بـ Atlas بنجاح!');
    
    const db = mongoose.connection.db;
    
    // الحصول على قائمة ملفات JSON
    const jsonFiles = fs.readdirSync(exportPath).filter(file => file.endsWith('.json') && file !== 'export-summary.json');
    
    if (jsonFiles.length === 0) {
      console.error('❌ لا توجد ملفات JSON للاستيراد');
      process.exit(1);
    }
    
    console.log(`\n📦 العثور على ${jsonFiles.length} ملف JSON للاستيراد`);
    console.log('═'.repeat(60));
    
    let totalImported = 0;
    const importResults = {};
    
    // استيراد كل ملف JSON
    for (const fileName of jsonFiles) {
      const collectionName = fileName.replace('.json', '');
      const filePath = path.join(exportPath, fileName);
      
      try {
        console.log(`📥 ${collectionName.padEnd(25)}: جاري الاستيراد...`);
        
        // قراءة البيانات من الملف
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let data;
        
        try {
          data = JSON.parse(fileContent);
        } catch (parseError) {
          console.error(`❌ ${collectionName.padEnd(25)}: خطأ في قراءة JSON`);
          importResults[collectionName] = 'خطأ في القراءة';
          continue;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log(`⚪ ${collectionName.padEnd(25)}: لا توجد بيانات للاستيراد`);
          importResults[collectionName] = 0;
          continue;
        }
        
        const collection = db.collection(collectionName);
        
        // حذف البيانات الموجودة (اختياري)
        const existingCount = await collection.countDocuments();
        if (existingCount > 0) {
          console.log(`🗑️ ${collectionName.padEnd(25)}: حذف ${existingCount} عنصر موجود...`);
          await collection.deleteMany({});
        }
        
        // استيراد البيانات الجديدة
        const result = await collection.insertMany(data, { ordered: false });
        
        console.log(`✅ ${collectionName.padEnd(25)}: تم استيراد ${result.insertedCount} عنصر`);
        
        totalImported += result.insertedCount;
        importResults[collectionName] = result.insertedCount;
        
      } catch (error) {
        console.error(`❌ ${collectionName.padEnd(25)}: خطأ في الاستيراد - ${error.message}`);
        importResults[collectionName] = 'خطأ';
      }
    }
    
    console.log('═'.repeat(60));
    console.log(`📊 إجمالي المستندات المستوردة: ${totalImported}`);
    
    // التحقق من النتائج
    console.log('\n🔍 التحقق من البيانات المستوردة...');
    await verifyImportedData(db, Object.keys(importResults));
    
    // حفظ تقرير الاستيراد
    const importReport = {
      importDate: new Date().toISOString(),
      sourceFolder: exportFolderName || path.basename(exportPath),
      totalImported,
      results: importResults,
      atlasURI: ATLAS_URI.replace(/:[^:@]*@/, ':****@')
    };
    
    const reportPath = path.join(exportPath, 'import-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(importReport, null, 2));
    
    console.log(`\n📋 تقرير الاستيراد محفوظ في: import-report.json`);
    console.log('\n🎉 تم استيراد البيانات بنجاح إلى MongoDB Atlas!');
    console.log('\n✨ يمكنك الآن استخدام التطبيق مع MongoDB Atlas');
    
  } catch (error) {
    console.error('\n❌ خطأ في عملية الاستيراد:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n🔌 تم قطع الاتصال');
    }
  }
}

function findLatestExportFolder(exportDir) {
  if (!fs.existsSync(exportDir)) {
    throw new Error('مجلد exports غير موجود');
  }
  
  const folders = fs.readdirSync(exportDir)
    .filter(item => fs.statSync(path.join(exportDir, item)).isDirectory())
    .filter(folder => folder.startsWith('basma-export-'))
    .sort()
    .reverse();
  
  if (folders.length === 0) {
    throw new Error('لا توجد مجلدات تصدير');
  }
  
  return path.join(exportDir, folders[0]);
}

async function verifyImportedData(db, collectionNames) {
  console.log('\n📊 إحصائيات البيانات في MongoDB Atlas:');
  console.log('═'.repeat(50));
  
  let totalDocuments = 0;
  
  for (const collectionName of collectionNames) {
    try {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`📁 ${collectionName.padEnd(25)}: ${count.toString().padStart(6)} عنصر`);
      totalDocuments += count;
    } catch (error) {
      console.log(`📁 ${collectionName.padEnd(25)}: ${' ERROR'.padStart(6)}`);
    }
  }
  
  console.log('═'.repeat(50));
  console.log(`📊 إجمالي المستندات: ${totalDocuments}`);
  
  // اختبار الاستعلامات الأساسية
  console.log('\n🧪 اختبار الاستعلامات الأساسية...');
  
  try {
    // اختبار بعض المجموعات المهمة
    const tests = [
      { name: 'users', field: 'email' },
      { name: 'services', field: 'title' },
      { name: 'settings', field: 'key' }
    ];
    
    for (const test of tests) {
      try {
        const collection = db.collection(test.name);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          const sample = await collection.findOne({});
          const identifier = sample[test.field] || sample._id || 'غير محدد';
          console.log(`✅ ${test.name}: ${count} عنصر (عينة: ${identifier})`);
        } else {
          console.log(`⚪ ${test.name}: لا توجد بيانات`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: خطأ في الاختبار`);
      }
    }
    
    console.log('\n🎯 جميع الاختبارات اكتملت!');
    
  } catch (error) {
    console.error('❌ فشل في اختبار الاستعلامات:', error.message);
  }
}

// الحصول على اسم مجلد التصدير من المعاملات
const exportFolderName = process.argv[2];

if (exportFolderName) {
  console.log(`📂 استخدام مجلد التصدير المحدد: ${exportFolderName}`);
} else {
  console.log('📂 البحث عن أحدث مجلد تصدير...');
}

// تشغيل الاستيراد
importFromJSON(exportFolderName);
