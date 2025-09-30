# أوامر سريعة للنشر على Vercel

## 🚀 أوامر النشر

### تثبيت Vercel CLI
```bash
npm install -g vercel
```

### تسجيل الدخول
```bash
vercel login
```

### النشر للتطوير
```bash
vercel
```

### النشر للإنتاج
```bash
vercel --prod
```

---

## 🗄️ أوامر قاعدة البيانات

### توليد Prisma Client
```bash
npx prisma generate
```

### تطبيق Schema على قاعدة البيانات
```bash
npx prisma db push
```

### إنشاء Migration
```bash
npx prisma migrate dev --name init
```

### تطبيق Migrations في الإنتاج
```bash
npx prisma migrate deploy
```

### فتح Prisma Studio
```bash
npx prisma studio
```

### إعادة تعيين قاعدة البيانات
```bash
npx prisma migrate reset
```

---

## 🔐 توليد المفاتيح

### NEXTAUTH_SECRET (Windows PowerShell)
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### NEXTAUTH_SECRET (Mac/Linux)
```bash
openssl rand -base64 32
```

### UUID
```bash
node -e "console.log(require('crypto').randomUUID())"
```

---

## 📦 أوامر NPM

### تثبيت التبعيات
```bash
npm install
```

### تثبيت تبعيات الإنتاج فقط
```bash
npm ci --only=production
```

### تشغيل التطوير
```bash
npm run dev
```

### بناء المشروع
```bash
npm run build
```

### تشغيل الإنتاج
```bash
npm start
```

### فحص الأخطاء
```bash
npm run lint
```

### فحص الأنواع
```bash
npm run type-check
```

---

## 🔍 أوامر Git

### إضافة جميع الملفات
```bash
git add .
```

### Commit
```bash
git commit -m "Ready for deployment"
```

### Push إلى GitHub
```bash
git push origin main
```

### التحقق من الحالة
```bash
git status
```

### عرض السجل
```bash
git log --oneline -10
```

---

## 🌐 أوامر Vercel المتقدمة

### ربط مشروع موجود
```bash
vercel link
```

### عرض المتغيرات البيئية
```bash
vercel env ls
```

### إضافة متغير بيئي
```bash
vercel env add DATABASE_URL production
```

### سحب المتغيرات البيئية
```bash
vercel env pull .env.local
```

### عرض السجلات
```bash
vercel logs
```

### عرض النطاقات
```bash
vercel domains ls
```

### إضافة نطاق
```bash
vercel domains add yourdomain.com
```

---

## 🧪 أوامر الاختبار

### اختبار الاتصال بقاعدة البيانات
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✅ Connected')).catch(e => console.error('❌ Error:', e))"
```

### اختبار Build محلياً
```bash
npm run build && npm start
```

### اختبار Prisma Schema
```bash
npx prisma validate
```

---

## 🔧 أوامر الصيانة

### تنظيف node_modules
```bash
rm -rf node_modules
npm install
```

### تنظيف .next
```bash
rm -rf .next
npm run build
```

### تحديث التبعيات
```bash
npm update
```

### فحص التبعيات القديمة
```bash
npm outdated
```

### تدقيق الأمان
```bash
npm audit
```

### إصلاح مشاكل الأمان
```bash
npm audit fix
```

---

## 📊 أوامر المراقبة

### عرض استخدام الذاكرة
```bash
node --expose-gc -e "console.log(process.memoryUsage())"
```

### عرض معلومات النظام
```bash
node -e "console.log(process.platform, process.arch, process.version)"
```

### فحص المنافذ المستخدمة (Windows)
```powershell
netstat -ano | findstr :3000
```

### فحص المنافذ المستخدمة (Mac/Linux)
```bash
lsof -i :3000
```

---

## 🎯 سيناريوهات شائعة

### النشر الأول
```bash
# 1. تثبيت التبعيات
npm install

# 2. توليد Prisma Client
npx prisma generate

# 3. بناء المشروع
npm run build

# 4. النشر
vercel --prod

# 5. تطبيق Schema
npx prisma db push
```

### تحديث المشروع
```bash
# 1. Pull آخر التغييرات
git pull origin main

# 2. تثبيت التبعيات الجديدة
npm install

# 3. تحديث Prisma Client
npx prisma generate

# 4. تطبيق Migrations
npx prisma migrate deploy

# 5. بناء ونشر
npm run build
vercel --prod
```

### إصلاح مشاكل Build
```bash
# 1. تنظيف كل شيء
rm -rf node_modules .next

# 2. إعادة التثبيت
npm install

# 3. توليد Prisma Client
npx prisma generate

# 4. بناء ال��شروع
npm run build
```

### استعادة من نسخة احتياطية
```bash
# 1. استعادة قاعدة البيانات
# (استخدم أداة قاعدة البيانات الخاصة بك)

# 2. تطبيق Schema
npx prisma db push

# 3. إعادة النشر
vercel --prod
```

---

## 🆘 أوامر الطوارئ

### إيقاف جميع عمليات Node
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

### إعادة تعيين Vercel
```bash
vercel remove [project-name]
vercel link
```

### إعادة تعيين قاعدة البيانات (خطر!)
```bash
npx prisma migrate reset --force
```

### استعادة من Git
```bash
git reset --hard HEAD
git clean -fd
```

---

## 📝 ملاحظات مهمة

### قبل تشغيل أي أمر:
1. ✅ تأكد من أنك في المجلد الصحيح
2. ✅ تأكد من وجود ملف `.env` أو `.env.local`
3. ✅ تأكد من صحة المتغيرات البيئية
4. ✅ قم بعمل نسخة احتياطية قبل أوامر الحذف

### أوامر خطرة (استخدم بحذر):
- ⚠️ `npx prisma migrate reset`
- ⚠️ `rm -rf node_modules`
- ⚠️ `git reset --hard`
- ⚠️ `vercel remove`

### نصائح:
- 💡 استخدم `--help` لعرض المساعدة لأي أمر
- 💡 استخدم `--dry-run` للاختبار بدون تطبيق
- 💡 احفظ الأوامر المستخدمة بكثرة في ملف
- 💡 استخدم aliases للأوامر الطويلة

---

## 🔗 روابط سريعة

- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Prisma CLI Docs](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [NPM CLI Docs](https://docs.npmjs.com/cli)
- [Git Docs](https://git-scm.com/docs)

---

**آخر تحديث**: 2024
**الإصدار**: 1.0.0
