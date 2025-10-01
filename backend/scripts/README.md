# Production Preparation Scripts

هذه مجموعة من السكريبتات لتحضير الموقع للنشر بأمان.

## 📋 السكريبتات المتاحة

### 1. النسخ الاحتياطي
```bash
node scripts/backup-before-cleanup.js
```
- ينشئ نسخة احتياطية كاملة من مجلد `src`
- ينشئ سكريبت استرداد تلقائي
- **يجب تشغيله قبل أي تعديلات**

### 2. إزالة console.log (معاينة)
```bash
node scripts/remove-console-logs.js --dry-run
```
- يعرض ما سيتم حذفه بدون تعديل الملفات
- آمن 100% للاختبار

### 3. إزالة console.log (فعلي)
```bash
node scripts/remove-console-logs.js
```
- يحذف console.log من الكود فعلياً
- **تأكد من عمل backup أولاً**

### 4. استرداد النسخة الاحتياطية
```bash
node scripts/restore-backup.js
```
- يسترد الكود من النسخة الاحتياطية
- يستخدم في حالة حدوث مشاكل

### 5. التحضير الشامل للإنتاج
```bash
node scripts/prepare-production.js
```
- سكريبت شامل يفحص كل شيء
- ينشئ backup تلقائياً
- يفحص الأمان والبيئة

## 🔒 الأمان

### الملفات المحمية من التعديل:
- `server.js` - ملف الخادم الرئيسي
- `logger.js` - نظام السجلات
- `auditLogger.js` - سجلات التدقيق
- `errorHandler.js` - معالج الأخطاء
- `production.js` - إعدادات الإنتاج

### المجلدات المحمية:
- `node_modules`
- `backup-*`
- `scripts`

## 📝 خطوات التحضير للإنتاج

### 1. إنشاء نسخة احتياطية
```bash
node scripts/backup-before-cleanup.js
```

### 2. معاينة التغييرات
```bash
node scripts/remove-console-logs.js --dry-run
```

### 3. تطبيق التغييرات (إذا كانت آمنة)
```bash
node scripts/remove-console-logs.js
```

### 4. فحص شامل
```bash
node scripts/prepare-production.js
```

### 5. في حالة المشاكل
```bash
node scripts/restore-backup.js
```

## ⚠️ تحذيرات مهمة

1. **اعمل backup دائماً قبل أي تعديل**
2. **اختبر بـ --dry-run أولاً**
3. **لا تحذف console.error أو console.warn**
4. **تأكد من تحديث .env.production**
5. **اختبر الموقع بعد التعديلات**

## 🔧 إعدادات الإنتاج

### متغيرات البيئة المطلوبة:
- `MONGODB_URI` - رابط قاعدة البيانات
- `JWT_ACCESS_SECRET` - مفتاح JWT
- `PAYPAL_CLIENT_ID` - معرف PayPal
- `SMTP_USER` - إعدادات البريد
- `FRONTEND_URL` - رابط الموقع

### إعدادات الأمان:
- Rate limiting مفعل
- Helmet security headers
- CORS محدود للدومينات المسموحة
- Input sanitization
- Request logging

## 📞 في حالة المشاكل

إذا حدثت أي مشاكل:

1. **توقف فوراً**
2. **شغل سكريبت الاسترداد:**
   ```bash
   node scripts/restore-backup.js
   ```
3. **تأكد من عمل الموقع**
4. **راجع الأخطاء في console**

## ✅ التحقق من النجاح

بعد التحضير للإنتاج:

1. الموقع يعمل بدون أخطاء
2. لا توجد console.log في production
3. جميع APIs تعمل
4. نظام الدفع يعمل
5. الإيميلات ترسل
6. لوحة التحكم تعمل

---

**💡 نصيحة:** اختبر كل شيء في بيئة staging قبل النشر النهائي!
