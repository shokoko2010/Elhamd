# دليل النشر السريع على Vercel
## خطوات النشر في 10 دقائق

---

## 🚀 الخطوة 1: إعداد قاعدة البيانات (5 دقائق)

### الخيار الموصى به: Vercel Postgres

1. **اذهب إلى Vercel Dashboard**
   - https://vercel.com/dashboard

2. **أنشئ قاعدة بيانات جديدة**
   ```
   Dashboard → Storage → Create Database → Postgres
   ```

3. **انسخ المتغيرات البيئية**
   - سيتم إنشاء المتغيرات تلقائياً:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`

---

## 🔐 الخطوة 2: توليد NEXTAUTH_SECRET (1 دقيقة)

### على Windows:
```powershell
# في PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### على Mac/Linux:
```bash
openssl rand -base64 32
```

**احفظ الناتج** - ستحتاجه في الخطوة التالية

---

## ⚙️ الخطوة 3: إعداد المتغيرات البيئية (2 دقيقة)

1. **اذهب إلى Project Settings**
   ```
   Your Project → Settings → Environment Variables
   ```

2. **أضف المتغيرات التالية**:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `DATABASE_URL` | من Vercel Postgres | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
   | `NEXTAUTH_SECRET` | الناتج من الخطوة 2 | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |

---

## 📦 الخطوة 4: النشر (2 دقيقة)

### الطريقة 1: عبر GitHub (موصى به)

1. **Push الكود إلى GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **ربط المشروع بـ Vercel**
   ```
   Vercel Dashboard → New Project → Import Git Repository
   ```

3. **تكوين المشروع**
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `prisma generate && npm run build`
   - Output Directory: `.next`

4. **Deploy**
   - انقر على "Deploy"
   - انتظر حتى ين��هي البناء (3-5 دقائق)

### الطريقة 2: عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

---

## 🗄️ الخطوة 5: تشغيل Database Migrations (1 دقيقة)

بعد النشر الأول، قم بتشغيل migrations:

### الطريقة 1: عبر Vercel CLI
```bash
# تعيين DATABASE_URL محلياً
$env:DATABASE_URL="your-production-database-url"

# تشغيل migrations
npx prisma db push
```

### الطريقة 2: عبر Vercel Dashboard
```
Project → Settings → Environment Variables
→ أضف DATABASE_URL مؤقتاً
→ ثم في terminal محلي:
npx prisma db push
```

---

## ✅ الخطوة 6: التحقق من النشر

1. **افتح الموقع**
   ```
   https://your-project.vercel.app
   ```

2. **تحقق من الصفحات الأساسية**:
   - [ ] الصفحة الرئيسية تعمل
   - [ ] صفحة تسجيل الدخول تعمل
   - [ ] API routes تستجيب

3. **تحقق من قاعدة البيانات**:
   ```bash
   # في terminal محلي
   npx prisma studio
   ```

---

## 🔧 استكشاف الأخطاء

### خطأ: "Prisma Client not found"
**الحل**:
```json
// تأكد من أن vercel.json يحتوي على:
{
  "buildCommand": "prisma generate && npm run build"
}
```

### خطأ: "Database connection failed"
**الحل**:
1. تحقق من صحة `DATABASE_URL`
2. تأكد من أن قاعدة البيانات نشطة
3. تحقق من أن Vercel IP مسموح في قاعدة البيانات

### خطأ: "NextAuth session not working"
**الحل**:
1. تأكد من صحة `NEXTAUTH_URL`
2. تأكد من وجود `NEXTAUTH_SECRET`
3. تحقق من إعدادات cookies

---

## 📊 المراقبة والصيانة

### مراقبة الأداء
```
Vercel Dashboard → Your Project → Analytics
```

### مراقبة الأخطاء
```
Vercel Dashboard → Your Project → Logs
```

### مراقبة قاعدة البيانات
```
Vercel Dashboard → Storage → Your Database → Metrics
```

---

## 🎯 الخطوات التالية

### 1. إعداد النطاق المخصص
```
Project Settings → Domains → Add Domain
```

### 2. تفعيل HTTPS
- يتم تلقائياً بواسطة Vercel

### 3. إعداد النسخ الاحتياطي
```
Storage → Your Database → Backups → Enable
```

### 4. تحسين الأداء
- تفعيل Edge Functions
- تحسين الصور
- إضافة CDN

---

## 📝 ملاحظات مهمة

1. **المتغيرات البيئية**:
   - لا تشارك `NEXTAUTH_SECRET` مع أي شخص
   - استخدم متغيرات مختلفة للتطوير والإنتاج

2. **قاعدة البيانات**:
   - قم بعمل نسخ احتياطي دوري
   - راقب استخدام الموارد
   - استخدم connection pooling

3. **الأمان**:
   - غيّر `NEXTAUTH_SECRET` بشكل دوري
   - فعّل 2FA على حساب Vercel
   - راقب سجلات الأمان

---

## 🆘 الدعم

### الموارد المفيدة:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### المشاكل الشائعة:
- [Vercel Troubleshooting](https://vercel.com/docs/troubleshooting)
- [Prisma Troubleshooting](https://www.prisma.io/docs/guides/troubleshooting)

---

## ✨ تم!

مبروك! موقعك الآن منشور على Vercel 🎉

**الرابط**: https://your-project.vercel.app

---

**آخر تحديث**: 2024
**الحالة**: ✅ جاهز للنشر
