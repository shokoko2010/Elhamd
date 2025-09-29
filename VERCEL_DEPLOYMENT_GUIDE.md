# دليل نشر مشروع Elhamd Imports على Vercel

## نظرة عامة
هذا الدليل يشرح عملية نشر موقع Elhamd Imports (وكيل سيارات TATA) على منصة Vercel.

## المتطلبات الأساسية
1. حساب على Vercel
2. حساب على GitHub مع المستودع الخاص بالمشروع
3. قاعدة بيانات PostgreSQL (Namecheap أو Vercel Postgres)
4. المتغيرات البيئية اللازمة

## الخطوة 1: إعداد Vercel.json
تم تحديث ملف `vercel.json` ليكون متوافقًا مع Vercel:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "NEXTAUTH_URL": "https://elhamdimports.com",
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.{js,ts}": {
      "maxDuration": 30
    }
  }
}
```

## الخطوة 2: إعداد قاعدة البيانات
### خيار 1: استخدام Namecheap PostgreSQL
1. تأكد من تفعيل الوصول البعيد لقاعدة البيانات
2. احصل على معلومات الاتصال:
   - Host: اسم الخادم
   - Port: 5432
   - Database: اسم قاعدة البيانات
   - Username: اسم المستخدم
   - Password: كلمة المرور

### خيار 2: استخدام Vercel Postgres
1. من لوحة تحكم Vercel، اذهب إلى Storage
2. أنشئ قاعدة بيانات PostgreSQL جديدة
3. انسخ معلومات الاتصال

## الخطوة 3: إعداد المتغيرات البيئية
في لوحة تحكم Vercel، أضف المتغيرات التالية:

### المتغيرات الأساسية
```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://elhamdimports.com
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
```

### متغيرات إضافية (إذا لزم الأمر)
```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

## الخطوة 4: ربط المشروع بـ GitHub
1. في لوحة تحكم Vercel، انقر على "New Project"
2. اختر مستودع GitHub الخاص بالمشروع
3. تأكد من أن إعدادات البناء صحيحة:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install`

## الخطوة 5: تشغيل البناء الأولي
1. انقر على "Deploy" لبدء عملية النشر
2. راقب سجل البناء للتأكد من عدم وجود أخطاء
3. إذا نجح البناء، سيتم نشر الموقع تلقائيًا

## الخطوة 6: إعداد النطاق المخصص
1. من إعدادات المشروع، اذهب إلى "Domains"
2. أضف نطاقك: `elhamdimports.com`
3. اتبع التعليمات لإعداد سجلات DNS

## استكشاف الأخطاء وإصلاحها

### مشكلة: فشل الاتصال بقاعدة البيانات
**الحل:**
1. تأكد من صحة `DATABASE_URL`
2. تأكد من تفعيل الوصول البعيد لقاعدة البيانات
3. تحقق من جدار الحماية والسماح بعناوين IP الخاصة بـ Vercel

### مشكلة: أخطاء في البناء
**الحل:**
1. تحقق من سجل البناء في Vercel
2. تأكد من أن جميع الاعتماديات مثبتة
3. قم بتشغيل `npm run lint` محليًا للتحقق من جودة الكود

### مشكلة: NextAuth لا يعمل
**الحل:**
1. تأكد من صحة `NEXTAUTH_URL`
2. تأكد من وجود `NEXTAUTH_SECRET`
3. تحقق من إعدادات قاعدة البيانات لجداول المصادقة

## الصيانة المستمرة

### تحديث المشروع
1. ادفع التغييرات إلى GitHub
2. سيقوم Vercel بإعادة النشر تلقائيًا

### مراقبة الأداء
1. استخدم لوحة تحكم Vercel لمراقبة الأداء
2. تحقق من سجلات الأخطاء بانتظام
3. راقب استخدام قاعدة البيانات

### النسخ الاحتياطي
1. قم بعمل نسخ احتياطي لقاعدة البيانات بانتظام
2. احتفظ بنسخة من المتغيرات البيئية في مكان آمن

## الخلاصة
بعد اتباع هذه الخطوات، سيتم نشر موقع Elhamd Imports بنجاح على Vercel مع الاتصال الكامل بقاعدة البيانات وجميع الميزات تعمل بشكل صحيح.