# دليل النقل اليدوي إلى MongoDB Atlas

## الطريقة الأولى: استخدام mongodump و mongorestore

### 1. تأكد من تثبيت MongoDB Tools
```bash
# تحميل MongoDB Database Tools من:
# https://www.mongodb.com/try/download/database-tools
```

### 2. تشغيل سكريپت النقل
```bash
# في PowerShell أو Command Prompt
cd backend\scripts
migrate-with-mongodump.bat
```

---

## الطريقة الثانية: استخدام MongoDB Compass (الأسهل)

### 1. تحميل MongoDB Compass
- اذهب إلى: https://www.mongodb.com/products/compass
- حمل وثبت MongoDB Compass

### 2. الاتصال بقاعدة البيانات المحلية
```
Connection String: mongodb://localhost:27017/basma_db
```

### 3. تصدير البيانات
- اختر قاعدة البيانات `basma_db`
- لكل مجموعة (Collection):
  - اضغط على المجموعة
  - اذهب إلى Collection → Export Data
  - اختر JSON format
  - احفظ الملف

### 4. الاتصال بـ MongoDB Atlas
```
Connection String: mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db
```

### 5. استيراد البيانات
- اختر قاعدة البيانات `basma_db`
- لكل مجموعة:
  - اضغط على CREATE COLLECTION
  - اسم المجموعة نفس الاسم المحلي
  - اضغط على Collection → Import Data
  - اختر الملف JSON المُصدر
  - اضغط Import

---

## الطريقة الثالثة: استخدام MongoDB Atlas Migration Tool

### 1. اذهب إلى MongoDB Atlas Dashboard
- سجل دخول إلى: https://cloud.mongodb.com/

### 2. استخدم Live Migration Tool
- اختر Cluster الخاص بك
- اذهب إلى ... → Migrate Data to this Cluster
- أدخل connection string المحلي:
```
mongodb://localhost:27017/basma_db
```

---

## الطريقة الرابعة: النقل اليدوي بالأوامر

### 1. تصدير كل مجموعة منفصلة
```bash
# تصدير المستخدمين
mongoexport --host localhost:27017 --db basma_db --collection users --out users.json

# تصدير الخدمات  
mongoexport --host localhost:27017 --db basma_db --collection services --out services.json

# تصدير الطلبات
mongoexport --host localhost:27017 --db basma_db --collection orders --out orders.json

# تصدير المدفوعات
mongoexport --host localhost:27017 --db basma_db --collection payments --out payments.json

# تصدير الإعدادات
mongoexport --host localhost:27017 --db basma_db --collection settings --out settings.json

# تصدير باقي المجموعات...
```

### 2. استيراد إلى Atlas
```bash
# استيراد المستخدمين
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection users --file users.json

# استيراد الخدمات
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection services --file services.json

# استيراد الطلبات  
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection orders --file orders.json

# استيراد المدفوعات
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection payments --file payments.json

# استيراد الإعدادات
mongoimport --uri "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --collection settings --file settings.json
```

---

## التحقق من النقل

### باستخدام MongoDB Compass:
1. اتصل بـ MongoDB Atlas
2. تحقق من وجود جميع المجموعات
3. تحقق من عدد المستندات في كل مجموعة

### باستخدام الأوامر:
```bash
# فحص البيانات في Atlas
mongo "mongodb+srv://basmatdesign:basma1234@cluster0.0wetdkc.mongodb.net/basma_db" --eval "
db.getCollectionNames().forEach(function(collection) {
    print(collection + ': ' + db.getCollection(collection).count() + ' documents');
});
"
```

---

## المجموعات المهمة التي يجب التأكد من نقلها:

- ✅ `users` - المستخدمون
- ✅ `services` - الخدمات  
- ✅ `orders` - الطلبات
- ✅ `payments` - المدفوعات
- ✅ `settings` - الإعدادات
- ✅ `admins` - المدراء
- ✅ `faqs` - الأسئلة الشائعة
- ✅ `blogs` - المقالات
- ✅ `contacts` - جهات الاتصال
- ✅ `banners` - البانرات
- ✅ `pagecontents` - محتوى الصفحات
- ✅ `contactpagecontents` - محتوى صفحة التواصل
- ✅ `homepageSections` - أقسام الصفحة الرئيسية

---

## بعد النقل الناجح:

1. ✅ تأكد من تحديث `.env` بـ connection string الجديد
2. ✅ اختبر التطبيق للتأكد من عمل جميع الوظائف
3. ✅ احتفظ بنسخة احتياطية من البيانات المحلية
4. ✅ يمكنك إيقاف MongoDB المحلي إذا أردت

---

## في حالة المشاكل:

### إذا فشل الاتصال بـ Atlas:
- تأكد من إضافة IP address في Network Access
- تأكد من صحة username وpassword
- تأكد من اتصال الإنترنت

### إذا فشل النقل:
- جرب الطريقة اليدوية باستخدام Compass
- تأكد من وجود البيانات في قاعدة البيانات المحلية
- تحقق من مساحة التخزين في Atlas

### للمساعدة:
- راجع MongoDB Atlas Documentation
- استخدم MongoDB Community Forums
- تواصل مع دعم MongoDB Atlas
