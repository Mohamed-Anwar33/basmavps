import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB URI المحلي
const LOCAL_URI = 'mongodb://127.0.0.1:27017/basma_db?directConnection=true&serverSelectionTimeoutMS=2000';

// المجموعات التي تحتوي على بيانات (حسب الفحص الأخير)
const COLLECTIONS_WITH_DATA = [
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

console.log('📦 تصدير البيانات من MongoDB المحلي إلى ملفات JSON');
console.log('📍 Local URI:', LOCAL_URI);

async function exportToJSON() {
  let connection;
  
  try {
    // الاتصال بقاعدة البيانات المحلية
    console.log('\n⏳ الاتصال بـ MongoDB المحلي...');
    connection = await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ تم الاتصال بنجاح!');
    
    const db = mongoose.connection.db;
    
    // إنشاء مجلد للتصدير
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFolderName = `basma-export-${timestamp}`;
    const exportPath = path.join(exportDir, exportFolderName);
    fs.mkdirSync(exportPath, { recursive: true });
    
    console.log(`📁 مجلد التصدير: ${exportPath}`);
    
    console.log('\n🔄 تصدير البيانات...');
    console.log('═'.repeat(60));
    
    let totalExported = 0;
    const exportSummary = {};
    
    // تصدير كل مجموعة إلى ملف JSON منفصل
    for (const collectionName of COLLECTIONS_WITH_DATA) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count === 0) {
          console.log(`⚪ ${collectionName.padEnd(25)}: لا توجد بيانات`);
          exportSummary[collectionName] = 0;
          continue;
        }
        
        console.log(`📦 ${collectionName.padEnd(25)}: جاري تصدير ${count} عنصر...`);
        
        const data = await collection.find({}).toArray();
        const fileName = `${collectionName}.json`;
        const filePath = path.join(exportPath, fileName);
        
        // كتابة البيانات إلى ملف JSON
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`✅ ${collectionName.padEnd(25)}: تم حفظ ${data.length} عنصر في ${fileName}`);
        
        totalExported += data.length;
        exportSummary[collectionName] = data.length;
        
      } catch (error) {
        console.error(`❌ ${collectionName}: خطأ في التصدير -`, error.message);
        exportSummary[collectionName] = 'خطأ';
      }
    }
    
    // إنشاء ملف الملخص
    const summaryPath = path.join(exportPath, 'export-summary.json');
    const summary = {
      exportDate: new Date().toISOString(),
      totalCollections: COLLECTIONS_WITH_DATA.length,
      totalDocuments: totalExported,
      collections: exportSummary,
      note: 'Use import-from-json.js to import these files to MongoDB Atlas'
    };
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // إنشاء دليل الاستيراد
    const importGuide = `
# دليل استيراد البيانات إلى MongoDB Atlas

## الملفات المُصدرة:
${COLLECTIONS_WITH_DATA.map(name => `- ${name}.json (${exportSummary[name]} عنصر)`).join('\n')}

## طريقة الاستيراد:

### الطريقة 1: استخدام السكريپت الآلي
\`\`\`bash
node scripts/import-from-json.js "${exportFolderName}"
\`\`\`

### الطريقة 2: استخدام MongoDB Compass
1. اتصل بـ MongoDB Atlas
2. لكل ملف JSON:
   - اختر المجموعة أو أنشئها
   - اضغط Import Data
   - اختر الملف JSON
   - اضغط Import

### الطريقة 3: استخدام mongoimport (إذا كانت أدوات MongoDB مثبتة)
\`\`\`bash
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection users --file users.json --jsonArray
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection services --file services.json --jsonArray
# كرر لكل مجموعة...
\`\`\`

## التحقق من النقل:
\`\`\`bash
node scripts/verify-atlas-data.js
\`\`\`

تاريخ التصدير: ${new Date().toLocaleString('ar-EG')}
إجمالي المستندات: ${totalExported}
`;
    
    const guidePath = path.join(exportPath, 'README.md');
    fs.writeFileSync(guidePath, importGuide);
    
    console.log('═'.repeat(60));
    console.log(`📊 إجمالي المستندات المُصدرة: ${totalExported}`);
    console.log(`📁 مجلد التصدير: ${exportPath}`);
    console.log(`📋 ملخص التصدير: export-summary.json`);
    console.log(`📖 دليل الاستيراد: README.md`);
    
    console.log('\n🎉 تم تصدير البيانات بنجاح!');
    console.log('\n📋 الخطوات التالية:');
    console.log('1. استخدم سكريپت import-from-json.js للاستيراد الآلي');
    console.log('2. أو استخدم MongoDB Compass للاستيراد اليدوي');
    console.log('3. أو استخدم mongoimport إذا كانت أدوات MongoDB مثبتة');
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n❌ لا يمكن الاتصال بـ MongoDB المحلي');
      console.error('💡 تأكد من أن MongoDB يعمل محلياً على المنفذ 27017');
    } else {
      console.error('\n❌ خطأ في التصدير:', error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n🔌 تم قطع الاتصال');
    }
  }
}

// تشغيل التصدير
exportToJSON();
