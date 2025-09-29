# Namecheap PM2 Lock Issue Solutions

## 🔍 المشكلة
عند محاولة تشغيل `npm run dev` أو `npm run build` على Namecheap، تظهر رسالة الخطأ:
```
Can't acquire lock for app: elhamdimport.com
```

## 💡 الأسباب المحتملة
1. عملية PM2 قيد التشغيل بالفعل
2. ملف قفل (lock file) لم يتم حذفه
3. عملية Node.js عالقة في الذاكرة
4. PM2 daemon في حالة غير مستقرة

## 🛠️ الحلول

### الحل 1: استخدام السكريبت التلقائي (موصى به)
```bash
# تشغيل السكريبت الكامل
./fix-pm2-lock.sh
```

### الحل 2: إصلاح سريع
```bash
# تشغيل الإصلاح السريع
./quick-fix.sh
```

### الحل 3: الإصلاح اليدوي
```bash
# الاتصال بالخادم
ssh -p 21098 bitcstcp@162.0.209.203

# الانتقال إلى مجلد المشروع
cd /home/bitcstcp/elhamd-imports

# إيقاف جميع عمليات PM2
pm2 stop all
pm2 delete all

# قتل PM2 daemon
pm2 kill

# حذف ملفات القفل
rm -f ~/.pm2/*.lock
rm -f ~/.pm2/dump.pm2

# قتل أي عمليات Node.js عالقة
pkill -f node

# إعادة تشغيل PM2
pm2 resurrect

# التحقق من الحالة
pm2 status
```

### الحل 4: إعادة تعيين كاملة
```bash
# إعادة تعيين PM2 بالكامل
pm2 kill
rm -rf ~/.pm2
pm2 update

# إعادة تشغيل PM2
pm2 resurrect
```

## 📋 الخطوات التالية بعد الإصلاح

### 1. التحقق من البيئة
```bash
# التحقق من إصدار Node.js
node --version

# يجب أن يكون 18 أو أعلى
# إذا كان أقل، قم بالتحديث:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. محاولة تشغيل التطبيق
```bash
# الدخول إلى مجلد المشروع
cd /home/bitcstcp/elhamd-imports

# تثبيت الاعتماديات (إذا لزم الأمر)
npm install

# تشغيل وضع التطوير
npm run dev

# أو تشغيل وضع الإنتاج
npm run build
npm start
```

### 3. استخدام PM2 لتشغيل التطبيق
```bash
# تشغيل التطبيق مع PM2
pm2 start npm --name "elhamd-imports" -- run dev

# أو للإنتاج
pm2 start npm --name "elhamd-imports" -- start

# حفظ العمليات
pm2 save

# إعداد PM2 للبدء التلقائي
pm2 startup
```

## 🔍 استكشاف الأخطاء الإضافية

### التحقق من استخدام الذاكرة والمعالج
```bash
# التحقق من استخدام الذاكرة
free -h

# التحقق من استخدام المعالج
top -bn1

# التحقق من مساحة القرص
df -h
```

### التحقق من الملفات المفتوحة
```bash
# التحقق من الملفات المفتوحة
lsof | grep node

# التحقق من منافذ الاستماع
netstat -tulpn | grep node
```

### التحقق من سجلات الأخطاء
```bash
# عرض سجلات PM2
pm2 logs

# عرض سجلات النظام
journalctl -u pm2 -f
```

## 🎯 نصائح للوقاية من المشاكل

### 1. إدارة العمليات بشكل صحيح
```bash
# دائماً أوقف العمليات قبل إعادة التشغيل
pm2 stop elhamd-imports
pm2 delete elhamd-imports

# ثم أعد تشغيلها
pm2 start npm --name "elhamd-imports" -- start
```

### 2. استخدام ملفات الإعداد
```bash
# إنشاء ملف ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'elhamd-imports',
    script: 'npm',
    args: 'start',
    cwd: '/home/bitcstcp/elhamd-imports',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# تشغيل التطبيق باستخدام ملف الإعداد
pm2 start ecosystem.config.js
```

### 3. المراقبة والصيانة
```bash
# مراقبة حالة التطبيق
pm2 monit

# إعادة تشغيل التطبيق تلقائياً عند الفشل
pm2 start elhamd-imports --restart-delay=3000

# تحديث PM2
pm2 update
```

## 📞 الحصول على المساعدة

إذا استمرت المشكلة، يمكنك:
1. التحقق من سجلات النظام: `journalctl -xe`
2. الاتصال بدعم Namecheap
3. محاولة إعادة تثبيت Node.js و PM2

---

**ملاحظة:** تأكد من أن لديك صلاحيات كافية (sudo) لتنفيذ بعض الأوامر.