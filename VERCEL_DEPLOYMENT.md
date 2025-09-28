# 🚀 دليل نشر Elhamd Imports على Vercel

## 📋 المتطلبات الأساسية

1. **حساب Vercel**: [vercel.com](https://vercel.com)
2. **حساب GitHub**: لربط المستودع
3. **نطاق elhamdimports.com**: مسجل وجاهز
4. **قاعدة بيانات PostgreSQL**: (موصى بها للإنتاج)

## 🎯 خطوات النشر

### الخطوة 1: إعداد قاعدة البيانات

#### الخيار أ: Vercel Postgres (الأبسط)
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك أو أنشئ مشروع جديد
3. اذهب إلى **Storage** ثم **Create Database**
4. اختر **PostgreSQL**
5. املأ التفاصيل واختر **Create**

#### الخيار ب: PostgreSQL خارجي (مثل Supabase, PlanetScale)
1. سجل في [Supabase](https://supabase.com) أو [PlanetScale](https://planetscale.com)
2. أنشئ قاعدة بيانات جديدة
3. احصل على رابط الاتصال

#### الخيار ج: Neon (Serverless PostgreSQL)
1. سجل في [Neon](https://neon.tech)
2. أنشئ مشروع جديد
3. احصل على رابط الاتصال

### الخطوة 2: ربط النطاق

1. في Vercel Dashboard، اذهب إلى **Settings**
2. اختر **Domains**
3. أضف النطاق: `elhamdimports.com`
4. اتبع التعليمات لإعداد DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com.
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

### الخطوة 3: إعداد البيئة

#### عبر Vercel Dashboard:
1. اذهب إلى **Settings** > **Environment Variables**
2. أضف المتغيرات من ملف `.env.vercel`

#### المتغيرات الأساسية:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=https://elhamdimports.com
NEXTAUTH_SECRET=your-super-secret-key
```

### الخطوة 4: ربط GitHub

#### الطريقة الأولى: من GitHub
1. اذهب إلى مستودعك على GitHub
2. اذهب إلى **Settings** > **Integrations**
3. اختر **Vercel**
4. اتبع التعليمات للربط

#### الطريقة الثانية: من Vercel
1. في Vercel Dashboard، انقر **New Project**
2. اختر **Import Git Repository**
3. اختر مستودع Elhamd Imports
4. اضغط **Import**

### الخطوة 5: تكوين النشر

#### إعدادات البناء:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

#### إعدادات البيئة:
```json
{
  "NODE_ENV": "production",
  "NEXTAUTH_URL": "https://elhamdimports.com"
}
```

### الخطوة 6: نشر قاعدة البيانات

#### توليد Prisma Client:
```bash
# محلياً قبل الرفع
npm run db:generate

# أو في Vercel بعد النشر
vercel env pull .env
npm run db:generate
```

#### تشغيل الـ Migrations:
```bash
# إذا كنت تستخدم Prisma Migrations
npx prisma migrate deploy

# أو إذا كنت تستخدم db push
npx prisma db push
```

### الخطوة 7: النشر الأولي

#### عبر Git:
```bash
git add .
git commit -m "Initial deployment to Vercel"
git push origin main
```

#### Vercel سيقوم تلقائياً بـ:
1. سحب الكود من GitHub
2. تثبيت الاعتمادات
3. بناء التطبيق
4. نشر التطبيق

### الخطوة 8: التحقق من النشر

#### اختبار الوظائف:
- [ ] الصفحة الرئيسية تعمل: `https://elhamdimports.com`
- [ ] SSL نشط (القفل الأخضر)
- [ ] صفحات السيارات تعمل
- [ ] نماذج الحجز تعمل
- [ ] PWA تعمل على الجوال
- [ ] Analytics تعمل

## 🔧 الإعدادات المتقدمة

### 1. **إعدادات الأداء**

#### Image Optimization:
```json
// في next.config.ts
images: {
  domains: ['your-image-domain.com'],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

#### Edge Functions:
```javascript
// في api/routes
export const config = {
  runtime: 'edge',
}
```

### 2. **إعدادات الأمان**

#### Environment Variables Protection:
```bash
# في Vercel Dashboard
# اختر "Protected" للمتغيرات الحساسة
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=your-db-url
```

#### Webhooks:
```bash
# إعداد webhooks للتحديثات التلقائية
vercel domains add elhamdimports.com
vercel certs issue elhamdimports.com
```

### 3. **إعدادات المراقبة**

#### Vercel Analytics:
1. اذهب إلى **Analytics** في Dashboard
2. تفعيل **Vercel Analytics**
3. أضف الكود إلى التطبيق:
```javascript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

#### Error Monitoring:
```javascript
// تثبيت Sentry
npm install @sentry/nextjs

// إعداد Sentry
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
});
```

## 📱 PWA Configuration

### إعداد Service Worker:
```javascript
// في public/sw.js
const CACHE_NAME = 'elhamd-imports-v1';
const urlsToCache = [
  '/',
  '/vehicles',
  '/test-drive',
  '/service',
  '/contact'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### إعداد Manifest:
```json
// في public/manifest.json
{
  "name": "Elhamd Imports",
  "short_name": "Elhamd",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb"
}
```

## 🔄 التحديثات التلقائية

### 1. **GitHub Actions**

#### إنشاء Workflow:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. **Webhooks**

#### إعداد Webhooks في GitHub:
1. اذهب إلى **Settings** > **Webhooks**
2. أضف webhook جديد:
   ```
   Payload URL: https://api.vercel.com/v1/integrations/deploy
   Content type: application/json
   Secret: your-webhook-secret
   ```

## 📊 المراقبة والتحليلات

### 1. **Vercel Analytics**
- **Real-time metrics**: زوار، تحميل الصفحات، معدل الارتداد
- **Performance metrics**: وقت التحميل، Core Web Vitals
- **Error tracking**: أخطاء JavaScript، أخطاء الخادم

### 2. **Google Analytics**
```javascript
// إعداد Google Analytics
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Analytics = () => {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag('config', 'GA_TRACKING_ID', {
        page_path: url,
      });
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  return null;
};
```

### 3. **Custom Monitoring**
```javascript
// إعداد مراقبة مخصصة
const monitorPerformance = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart);
  }
};
```

## 🚨 استكشاف الأخطاء وإصلاحها

### 1. **مشاكل الشائعة**

#### Build Errors:
```bash
# تحقق من إصدارات Node.js
node --version
npm --version

# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Errors:
```bash
# تحقق من رابط قاعدة البيانات
echo $DATABASE_URL

# اختبر الاتصال
npx prisma db pull
```

#### Environment Variables:
```bash
# سحب متغيرات البيئة
vercel env pull .env

# دفع متغيرات البيئة
vercel env push .env
```

### 2. **Logs و Debugging**

#### Vercel Logs:
1. اذهب إلى **Logs** في Dashboard
2. اختر البيئة (Production/Preview)
3. ابحث عن الأخطاء

#### Local Debugging:
```bash
# تشغيل محلي مع إعدادات الإنتاج
vercel env pull .env.production
npm run build
npm run start
```

## 🎉 مبروك!

تم نشر Elhamd Imports بنجاح على Vercel. الآن يمكنك:

### ✅ **المميزات المتاحة:**
- **نشر تلقائي**: كل دفعة إلى GitHub = نشر فوري
- **SSL مجاني**: شهادة SSL تلقائية
- **CDN عالمي**: سرعة فائقة في جميع أنحاء العالم
- **Analytics**: تحليلات مجانية
- **Preview Deployments**: روابط معاينة لكل PR
- **Rollbacks**: التراجع عن النشر بسهولة

### 📱 **PWA Features:**
- تثبيت التطبيق على الهواتف
- عمل بدون إنترنت
- إشعارات فورية
- أيقونة على الشاشة الرئيسية

### 🔧 **الصيانة:**
- تحديثات تلقائية
- مراقبة الأداء
- نسخ احتياطي تلقائي
- دعم فني 24/7

## 📞 الدعم الفني

إذا واجهت أي مشاكل:
1. **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
2. **Status Page**: [vercel.com/status](https://vercel.com/status)
3. **Support**: support@vercel.com
4. **Community**: [vercel.com/community](https://vercel.com/community)

للمساعدة الإضافية، راجع وثائق Next.js و Vercel أو تواصل مع الدعم الفني.