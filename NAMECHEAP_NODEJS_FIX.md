# 🔧 حل مشكلة Node.js للنشر على Namecheap

## المشكلة
عند محاولة تشغيل `npm install` تظهر رسالة خطأ:
```
npm ERR! path C:\Users\shoko\Desktop\Elhamd\node_modules\prisma
npm ERR! command failed
npm ERR! command C:\WINDOWS\system32\cmd.exe /d /s /c node scripts/preinstall-entry.js
npm ERR! ┌──────────────────────────────────────────────┐
npm ERR! │    Prisma only supports Node.js >= 18.18.    │
npm ERR! │    Please upgrade your Node.js version.      │
npm ERR! └──────────────────────────────────────────────┘
```

## السبب
- Node.js الحالي: v16.13.1
- Node.js المطلوب: >= 18.18.0
- التطبيق يتطلب إصدار أحدث من Node.js

## الحلول

### الحل 1: تحديث Node.js (موصى به)

#### للـ Windows:

**الطريقة الأولى: استخدام nvm-windows (الأفضل)**
1. قم بتنزيل nvm-windows من:
   https://github.com/coreybutler/nvm-windows/releases

2. قم بتثبيت البرنامج

3. افتح PowerShell جديد ونفذ:
```powershell
# تثبيت Node.js 20 LTS
nvm install 20.18.0

# استخدام Node.js 20
nvm use 20.18.0

# التحقق من الإصدارات
node --version
npm --version
```

**الطريقة الثانية: التحميل المباشر**
1. اذهب إلى https://nodejs.org/
2. قم بتنزيل **LTS version** (20.18.0)
3. قم بتثبيته (سيقوم بالتحديث التلقائي)
4. أعد تشغيل الكمبيوتر
5. تحقق من الإصدارات:
```powershell
node --version
npm --version
```

**الطريقة الثالثة: استخدام Chocolatey**
```powershell
# تثبيت Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# تثبيت Node.js LTS
choco install nodejs-lts

# التحقق من الإصدارات
node --version
npm --version
```

### الحل 2: استخدام السكريبتات المعدلة

#### تشغيل سكريبت الفحص:
```powershell
node scripts/check-environment.js
```

#### تشغيل سكريبت الإصلاح:
```powershell
node scripts/fix-nodejs.js
```

### الحل 3: الخطوات اليدوية

#### 1. تحديث Node.js
```powershell
# تحقق من الإصدار الحالي
node --version

# إذا كان أقل من 18، قم بالتحديث
# استخدم إحدى الطرق المذكورة أعلاه
```

#### 2. تنظيف المشروع
```powershell
# حذف node_modules و package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# تنظيف npm cache
npm cache clean --force
```

#### 3. إعادة التثبيت
```powershell
# تثبيت الاعتمادات
npm install

# توليد Prisma client
npm run db:generate

# بناء التطبيق
npm run build
```

### الحل 4: استخدام yarn كبديل

#### تثبيت yarn:
```powershell
npm install -g yarn
```

#### استخدام yarn:
```powershell
# تثبيت الاعتمادات
yarn install

# تشغيل التطبيق
yarn dev

# بناء التطبيق
yarn build
```

## بعد تحديث Node.js

### 1. التحقق من البيئة
```powershell
# التحقق من الإصدارات
node --version
npm --version

# تشغيل سكريبت الفحص
node scripts/check-environment.js
```

### 2. إعادة تثبيت الاعتمادات
```powershell
# حذف الملفات القديمة
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# تثبيت جديد
npm install
```

### 3. اختبار التطبيق
```powershell
# توليد Prisma client
npm run db:generate

# بناء التطبيق
npm run build

# تشغيل التطبيق
npm run dev
```

## التحضير للنشر على Namecheap

### 1. تحديث package.json
تأكد من وجود هذه السكريبتات في package.json:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon --exec \"npx tsx server.ts\" --watch server.ts --watch src --ext ts,tsx,js,jsx 2>&1 | tee dev.log",
    "build": "next build",
    "start": "NODE_ENV=production tsx server.ts 2>&1 | tee server.log",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:seed": "tsx prisma/seed.ts",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next node_modules",
    "reinstall": "npm run clean && npm install"
  }
}
```

### 2. إنشاء ملفات النشر
```powershell
# إنشاء ملف مضغوط للنشر
npm run build
Compress-Archive -Path .next,public,package.json,package-lock.json,prisma,db -DestinationPath elhamd-imports.zip
```

### 3. إعداد Namecheap
1. سجل دخول إلى Namecheap
2. اذهب إلى cPanel
3. اذهب إلى Setup Node.js App
4. اتبع التعليمات في NAMECHEAP_SETUP.md

## استكشاف الأخطاء

### إذا استمرت المشكلة:
1. تأكد من تحديث Node.js بشكل صحيح
2. أعد تشغيل الكمبيوتر
3. تحقق من متغيرات البيئة
4. جرب استخدام yarn بدلاً من npm

### التحقق من الإصدارات المطلوبة:
```powershell
# الإصدارات المطلوبة
node --version  # يجب أن يكون 18.18.0 أو أعلى
npm --version   # يجب أن يكون 8.0.0 أو أعلى
```

### إذا واجهت مشاكل في الاعتمادات:
```powershell
# حذف وإعادة التثبيت
npm run clean
npm install

# أو استخدام yarn
yarn install
```

## الدعم الفني

### موارد مفيدة:
- [Node.js Official Website](https://nodejs.org/)
- [nvm-windows GitHub](https://github.com/coreybutler/nvm-windows)
- [Namecheap Documentation](https://www.namecheap.com/support/knowledgebase/)
- [Prisma Documentation](https://www.prisma.io/docs)

### إذا استمرت المشكلة:
1. تحقق من سجلات الأخطاء
2. تأكد من توافق الإصدارات
3. جرب حلاً بديلاً
4. تواصل مع الدعم الفني

## ملاحظات هامة

- تأكد من تحديث Node.js قبل المتابعة
- احتفظ بنسخة احتياطية من مشروعك
- اختبر التطبيق محلياً قبل النشر
- تأكد من توافق إصدارات الحزم

بعد حل مشكلة Node.js، سيكون التطبيق جاهزاً للنشر على Namecheap بنجاح!