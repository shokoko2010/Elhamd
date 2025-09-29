# دليل النشر على Namecheap

## 📋 معلومات الاتصال بالخادم

- **IP الخادم**: 162.0.209.203
- **اسم المستخدم**: bitcstcp
- **منفذ SSH**: 21098
- **مسار النشر**: `/home/bitcstcp/elhamd-imports`
- **مسار الموقع العام**: `/home/bitcstcp/public_html`

## 🚀 طرق النشر

### الطريقة 1: النشر الثابت (موصى به للمواقع البسيطة)

هذه الطريقة مناسبة إذا كان موقعك لا يتطلب وظائف ديناميكية مثل قواعد البيانات أو API.

```bash
# تشغيل سكريبت النشر الثابت
./deploy-static.sh
```

**المميزات:**
- لا يتطلب Node.js على الخادم
- أسرع وأكثر استقراراً
- يعمل مع استضافة Namecheap العادية

**العيوب:**
- لا يدعم الوظائف الديناميكية
- لا يدعم قواعد البيانات
- لا يدعم API routes

### الطريقة 2: النشر الديناميكي (للمواقع المعقدة)

هذه الطريقة مناسبة إذا كان موقعك يتطلب وظائف ديناميكية.

```bash
# تشغيل سكريبت النشر الديناميكي
./deploy.sh
```

**المميزات:**
- يدعم جميع وظائف Next.js
- يدعم قواعد البيانات
- يدعم API routes

**العيوب:**
- يتطلب Node.js على الخادم
- أكثر تعقيداً في الإعداد
- قد يتطلب خطة استضافة أعلى

## 🔧 الإعداد الأولي

### 1. إنشاء مفتاح SSH
```bash
# إنشاء مفتاح SSH
ssh-keygen -t rsa -b 4096

# نسخ المفتاح العام إلى الخادم
ssh-copy-id -p 21098 bitcstcp@162.0.209.203
```

### 2. تثبيت المتطلبات على الخادم
```bash
# الاتصال بالخادم
ssh -p 21098 bitcstcp@162.0.209.203

# تثبيت Node.js (إذا لم يكن مثبتاً)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Git
sudo apt-get install -y git
```

### 3. تكوين البيئة
```bash
# إنشاء ملف .env على الخادم
cat > .env << EOF
NODE_ENV=production
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://elhamdimports.com"
EOF
```

## 📝 خطوات النشر اليدوي

### النشر الثابت
```bash
# 1. بناء المشروع
npm run build

# 2. تصدير الملفات الثابتة
npx next export

# 3. رفع الملفات إلى الخادم
scp -P 21098 -r out/* bitcstcp@162.0.209.203:/home/bitcstcp/public_html/

# 4. ضبط الصلاحيات
ssh -p 21098 bitcstcp@162.0.209.203 "chmod -R 755 /home/bitcstcp/public_html"
```

### النشر الديناميكي
```bash
# 1. بناء المشروع
npm run build

# 2. رفع الملفات إلى الخادم
scp -P 21098 -r .next bitcstcp@162.0.209.203:/home/bitcstcp/elhamd-imports/
scp -P 21098 -r public bitcstcp@162.0.209.203:/home/bitcstcp/elhamd-imports/
scp -P 21098 package.json bitcstcp@162.0.209.203:/home/bitcstcp/elhamd-imports/

# 3. تثبيت الاعتماديات على الخادم
ssh -p 21098 bitcstcp@162.0.209.203 "cd /home/bitcstcp/elhamd-imports && npm ci --only=production"

# 4. تشغيل التطبيق
ssh -p 21098 bitcstcp@162.0.209.203 "cd /home/bitcstcp/elhamd-imports && pm2 start npm --name elhamd-imports -- start"
```

## 🔍 استكشاف الأخطاء

### مشاكل SSH الشائعة
```bash
# اختبار الاتصال بالخادم
ssh -p 21098 bitcstcp@162.0.209.203

# إذا فشل الاتصال، تحقق من:
# 1. صحة بيانات الاعتماد
# 2. فتح المنفذ 21098
# 3. إعدادات جدار الحماية
```

### مشاكل Node.js
```bash
# التحقق من إصدار Node.js
node --version

# يجب أن يكون الإصدار 18 أو أعلى
# إذا كان الإصدار أقل، قم بالتحديث:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### مشاكل PM2
```bash
# عرض حالة التطبيقات
pm2 status

# عرض سجلات التطبيق
pm2 logs elhamd-imports

# إعادة تشغيل التطبيق
pm2 restart elhamd-imports

# إيقاف التطبيق
pm2 stop elhamd-imports
```

## 🌐 تكوين النطاق

### 1. إعدادات DNS في Namecheap
- **Type**: A
- **Host**: @
- **Value**: 162.0.209.203
- **TTL**: 1800

### 2. تكوين Apache (إذا لزم الأمر)
```apache
# في ملف .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
```

## 📞 الدعم

إذا واجهت أي مشاكل، يمكنك:
1. مراجعة سجلات الأخطاء: `pm2 logs elhamd-imports`
2. التحقق من حالة الخادم: `pm2 status`
3. الاتصال بالدعم الفني لـ Namecheap

## 🎯 التوصيات

1. **ابدأ بالنشر الثابت** - أسهل وأكثر استقراراً
2. **اختبر الوظائف الأساسية** - تأكد من أن الموقع يعمل
3. **انتقل للنشر الديناميكي** - فقط إذا كنت بحاجة للوظائف الديناميكية
4. **استخدم النسخ الاحتياطي** - دائماً احفظ نسخة من بياناتك

---

**ملاحظة:** تأكد من أن لديك صلاحيات كافية على الخادم قبل بدء عملية النشر.