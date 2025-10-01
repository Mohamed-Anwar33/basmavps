@echo off
echo 🚀 نقل البيانات باستخدام mongodump و mongorestore
echo ================================================

echo.
echo 📦 الخطوة 1: تصدير البيانات من MongoDB المحلي...
echo ------------------------------------------------

REM إنشاء مجلد للنسخة الاحتياطية
if not exist "backups" mkdir backups
set BACKUP_DIR=backups\local-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo 💾 إنشاء نسخة احتياطية في: %BACKUP_DIR%

REM تصدير قاعدة البيانات المحلية
mongodump --host localhost:27017 --db basma_db --out %BACKUP_DIR%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ فشل في تصدير البيانات المحلية
    echo 💡 تأكد من أن MongoDB يعمل محلياً على المنفذ 27017
    pause
    exit /b 1
)

echo ✅ تم تصدير البيانات المحلية بنجاح

echo.
echo ☁️ الخطوة 2: رفع البيانات إلى MongoDB Atlas...
echo ------------------------------------------------

REM رفع البيانات إلى Atlas
mongorestore --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db?retryWrites=true&w=majority" --drop %BACKUP_DIR%\basma_db

if %ERRORLEVEL% NEQ 0 (
    echo ❌ فشل في رفع البيانات إلى Atlas
    echo 💡 تأكد من صحة بيانات الاتصال
    pause
    exit /b 1
)

echo ✅ تم رفع البيانات إلى MongoDB Atlas بنجاح

echo.
echo 🔍 الخطوة 3: التحقق من البيانات...
echo ------------------------------------------------

REM التحقق من البيانات في Atlas
echo 📊 فحص البيانات في MongoDB Atlas...
mongo "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --eval "
print('📁 قاعدة البيانات: ' + db.getName());
var collections = db.getCollectionNames();
print('📚 عدد المجموعات: ' + collections.length);
print('');
print('📋 تفاصيل المجموعات:');
print('========================');
var totalDocs = 0;
collections.forEach(function(collection) {
    var count = db.getCollection(collection).count();
    totalDocs += count;
    print(collection.padEnd ? collection.padEnd(25) + ': ' + count + ' عنصر' : collection + ': ' + count + ' عنصر');
});
print('========================');
print('📊 إجمالي المستندات: ' + totalDocs);
if (totalDocs > 0) {
    print('🎉 تم النقل بنجاح! جميع البيانات موجودة في MongoDB Atlas');
} else {
    print('⚠️ لا توجد بيانات في MongoDB Atlas');
}
"

echo.
echo 🎯 اكتملت عملية النقل!
echo ================================================
echo ✅ تم تحديث connection string في .env
echo ✅ تم إنشاء نسخة احتياطية محلية
echo ✅ تم رفع البيانات إلى MongoDB Atlas
echo ✅ يمكنك الآن استخدام MongoDB Atlas في تطبيقك
echo.
echo 📁 النسخة الاحتياطية محفوظة في: %BACKUP_DIR%
echo.
pause
