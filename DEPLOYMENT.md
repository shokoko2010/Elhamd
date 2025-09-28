# 🚀 دليل نشر Elhamd Imports على Namecheap

## 📋 المتطلبات الأساسية

1. **نطاق مسجل**: elhamdimports.com
2. **حساب Namecheap**: مع إمكانية الوصول إلى cPanel
3. **حساب GitHub**: لاستخدام GitHub Actions (اختياري)
4. **معرفة أساسية**: بالأوامر الطرفية وSSH

## 🎯 خيارات النشر

### الخيار الأول: النشر المباشر عبر cPanel (الأبسط)

#### الخطوة 1: تجهيز الملفات
```bash
# بناء التطبيق للإنتاج
npm run build

# ضغط الملفات
tar -czf elhamd-imports.tar.gz .next public package.json package-lock.json prisma
```

#### الخطوة 2: رفع الملفات إلى cPanel
1. سجل دخول إلى cPanel في Namecheap
2. اذهب إلى **File Manager**
3. ارفع ملف `elhamd-imports.tar.gz` إلى المجلد الرئيسي
4. استخرج الملفات

#### الخطوة 3: إعداد Node.js في cPanel
1. اذهب إلى **Setup Node.js App**
2. انقر **Create Application**
3. املأ الإعدادات:
   - **Node.js version**: 18.x أو 20.x
   - **Application mode**: Production
   - **Application root**: elhamd-imports
   - **Application URL**: elhamdimports.com
   - **Application startup file**: server.ts

#### الخطوة 4: تثبيت الاعتمادات
```bash
# في cPanel Terminal
cd elhamd-imports
npm install --production
npm run db:generate
```

#### الخطوة 5: إعداد متغيرات البيئة
1. في **Setup Node.js App**، اذهب إلى **Environment Variables**
2. أضف متغيرات البيئة من ملف `.env.production`

#### الخطوة 6: تشغيل التطبيق
```bash
# في cPanel Terminal
npm run start
```

### الخيار الثاني: النشر عبر GitHub Actions (متقدم)

#### الخطوة 1: إعداد Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/elhamd-imports.git
git push -u origin main
```

#### الخطوة 2: إنشاء GitHub Actions Workflow
أنشئ ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Namecheap

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        
    - name: Deploy to Namecheap
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        source: ".next/,public/,package.json,package-lock.json,prisma/"
        target: "/home/username/elhamd-imports"
        
    - name: Install dependencies on server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd elhamd-imports
          npm install --production
          npm run db:generate
          pm2 restart elhamd-imports
```

#### الخطوة 3: إعداد Secrets في GitHub
1. اذهب إلى **Settings > Secrets and variables > Actions**
2. أضف الـ Secrets التالية:
   - `HOST`: عنوان الخادم
   - `USERNAME`: اسم المستخدم
   - `KEY`: مفتاح SSH الخاص

### الخيار الثالث: النشر عبر Docker (الأكثر احترافية)

#### الخطوة 1: إنشاء Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### الخطوة 2: إنشاء docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/custom.db
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

#### الخطوة 3: النشر على الخادم
```bash
# على الخادم
git clone https://github.com/your-username/elhamd-imports.git
cd elhamd-imports
docker-compose up -d
```

## 🔧 إعداد النطاق في Namecheap

### 1. DNS Configuration
1. سجل دخول إلى Namecheap
2. اذهب إلى **Domain List > elhamdimports.com > Manage**
3. اذهب إلى **Advanced DNS**
4. أضف السجلات التالية:

```
Type: A Record
Host: @
Value: IP_ADDRESS_OF_YOUR_SERVER
TTL: Automatic

Type: A Record
Host: www
Value: IP_ADDRESS_OF_YOUR_SERVER
TTL: Automatic

Type: CNAME Record
Host: mail
Value: mail.elhamdimports.com
TTL: Automatic
```

### 2. SSL Certificate
1. في cPanel، اذهب إلى **SSL/TLS Status**
2. اختر النطاق `elhamdimports.com`
3. انقر **Run AutoSSL**

## 📱 إعداد الهاتف المحمول

### PWA Installation
بعد النشر، يمكن للمستخدمين تثبيت التطبيق على هواتفهم:
1. افتح `https://elhamdimports.com` في متصفح Chrome
2. انقر على قائمة المتصفح (ثلاث نقاط)
3. اختر **Add to Home screen** أو **Install app**

## 🚨 المراقبة والصيانة

### 1. مراقبة الأداء
```bash
# تثبيت PM2 للمراقبة
npm install -g pm2

# تشغيل التطبيق مع PM2
pm2 start server.ts --name elhamd-imports

# مراقبة الأداء
pm2 monit

# عرض السجلات
pm2 logs elhamd-imports
```

### 2. النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
cp /path/to/database.db /backup/location/database-$(date +%Y%m%d).db

# نسخ احتياطي للملفات
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/app
```

### 3. التحديثات
```bash
# سحب التحديثات
git pull origin main

# تثبيت الاعتمادات الجديدة
npm install

# إعادة البناء
npm run build

# إعادة التشغيل
pm2 restart elhamd-imports
```

## 📞 الدعم الفني

في حال واجهتك أي مشاكل:
1. تحقق من السجلات: `pm2 logs elhamd-imports`
2. تأكد من إعدادات DNS
3. تحقق من متغيرات البيئة
4. تأكد من صلاحيات الملفات

## 🎉 مبروك!

تم نشر تطبيق Elhamd Imports بنجاح. الآن يمكن للعملاء:
- تصفح السيارات المتاحة
- حجز اختبار قيادة
- حجز مواعيد الصيانة
- التواصل معكم مباشرة
- تثبيت التطبيق على هواتفهم

للمساعدة الإضافية، راجع وثائق Namecheap أو تواصل مع الدعم الفني.