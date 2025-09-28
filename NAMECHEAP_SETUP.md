# 🎯 دليل إعداد Namecheap لـ Elhamd Imports

## 📋 الخطوات التفصيلية للإعداد

### 1. **الدخول إلى Namecheap**

1. اذهب إلى [Namecheap.com](https://www.namecheap.com/)
2. سجل دخول بحسابك
3. من القائمة الجانبية، اختر **Domain List**
4. ابحث عن `elhamdimports.com` وانقر **Manage**

### 2. **إعداد DNS**

#### تغيير Nameservers
1. في صفحة إدارة النطاق، اذهب إلى **Nameservers**
2. اختر **Custom DNS**
3. أدخل Nameservers الخاصين بمزود الاستضافة:
   ```
   ns1.hosting-provider.com
   ns2.hosting-provider.com
   ```
4. انقر **Save Changes**

#### إضافة سجلات DNS
1. اذهب إلى **Advanced DNS**
2. أضف السجلات التالية:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | IP_ADDRESS | Automatic |
| A | www | IP_ADDRESS | Automatic |
| CNAME | mail | mail.elhamdimports.com | Automatic |
| MX | @ | mail.elhamdimports.com (Priority: 10) | Automatic |
| TXT | @ | v=spf1 include:_spf.google.com ~all | Automatic |

### 3. **إعداد الاستضافة (Hosting)**

#### الخيار أ: استخدام Namecheap Hosting
1. من لوحة تحكم Namecheap، اختر **Hosting**
2. انقر **Shared Hosting** ثم **Manage**
3. اختر **cPanel Login**

#### الخيار ب: استخدام استضافة خارجية
1. إذا كنت تستخدم استضافة أخرى، اتبع تعليمات مزود الخدمة
2. تأكد من ربط النطاق بالاستضافة

### 4. **إعداد cPanel**

#### بعد الدخول إلى cPanel:

1. **إعداد Node.js**:
   - ابحث عن **Setup Node.js App**
   - انقر **Create Application**
   - املأ الإعدادات:
     - **Node.js version**: 20.x
     - **Application mode**: Production
     - **Application root**: elhamd-imports
     - **Application URL**: elhamdimports.com
     - **Application startup file**: server.ts

2. **إعداد قاعدة البيانات**:
   - ابحث عن **MySQL Database Wizard**
   - أنشئ قاعدة بيانات جديدة:
     - **Database name**: elhamd_imports
     - **Username**: elhamd_user
     - **Password**: [strong_password]

3. **إعداد FTP**:
   - ابحث عن **FTP Accounts**
   - أنشئ حساب FTP جديد:
     - **Login**: elhamd_ftp
     - **Password**: [strong_password]
     - **Directory**: /elhamd-imports

### 5. **رفع الملفات**

#### عبر File Manager:
1. اذهب إلى **File Manager**
2. اذهب إلى المجلد الرئيسي (`/home/username/`)
3. أنشئ مجلد جديد: `elhamd-imports`
4. ارفع ملفات التطبيق

#### عبر FTP:
1. استخدم عميل FTP مثل FileZilla
2. اتصل بالخادم باستخدام بيانات FTP
3. ارفع الملفات إلى مجلد `elhamd-imports`

#### الملفات المطلوبة:
```
elhamd-imports/
├── .next/
├── public/
├── prisma/
├── db/
├── package.json
├── package-lock.json
├── server.ts
└── .env.production
```

### 6. **تثبيت الاعتمادات**

#### عبر Terminal في cPanel:
1. اذهب إلى **Terminal**
2. نفذ الأوامر التالية:
```bash
cd elhamd-imports
npm install --production
npm run db:generate
```

### 7. **إعداد متغيرات البيئة**

1. في **Setup Node.js App**، اذهب إلى **Environment Variables**
2. أضف المتغيرات التالية:

| Variable | Value |
|----------|-------|
| NODE_ENV | production |
| DATABASE_URL | file:/home/username/elhamd-imports/db/custom.db |
| NEXTAUTH_URL | https://elhamdimports.com |
| NEXTAUTH_SECRET | [your-secret-key] |

### 8. **إعداد SSL**

1. اذهب إلى **SSL/TLS Status**
2. اختر نطاق `elhamdimports.com`
3. انقر **Run AutoSSL**
4. انتظر حتى تكتمل العملية

### 9. **تشغيل التطبيق**

1. في **Setup Node.js App**، انقر **Restart**
2. انتظر بضع دقائق
3. افتح `https://elhamdimports.com` في المتصفح

### 10. **التحقق من النشر**

#### اختبر الوظائف التالية:
- [ ] الصفحة الرئيسية تعمل
- [ ] صفحة السيارات تعمل
- [ ] نموذج حجز اختبار القيادة
- [ ] نموذج حجز الصيانة
- [ ] صفحة الاتصال
- [ ] PWA تعمل على الجوال
- [ ] SSL نشط

### 11. **إعداد المراقبة**

#### تثبيت PM2:
```bash
# تثبيت PM2 عالمياً
npm install -g pm2

# تشغيل التطبيق مع PM2
pm2 start server.ts --name elhamd-imports

# حفظ إعدادات PM2
pm2 save

# إعداد PM2 للتشغيل التلقائي
pm2 startup
```

#### مراقبة الأداء:
```bash
# عرض حالة التطبيقات
pm2 status

# عرض السجلات
pm2 logs elhamd-imports

# مراقبة الأداء
pm2 monit
```

### 12. **النسخ الاحتياطي**

#### إعداد نسخ احتياطي تلقائي:
1. اذهب إلى **Backup**
2. اختر **Backup Wizard**
3. اتبع التعليمات لجدولة النسخ الاحتياطي

#### نسخ احتياطي يدوي:
```bash
# نسخ قاعدة البيانات
cp /home/username/elhamd-imports/db/custom.db /backup/custom-$(date +%Y%m%d).db

# نسخ الملفات
tar -czf /backup/elhamd-imports-$(date +%Y%m%d).tar.gz /home/username/elhamd-imports
```

### 13. **إعداد البريد الإلكتروني**

#### إنشاء حساب بريد:
1. اذهب إلى **Email Accounts**
2. انقر **Create**
3. املأ البيانات:
   - **Email**: info@elhamdimports.com
   - **Password**: [strong_password]
   - **Mailbox Size**: 1000 MB

#### إعداد Forwarders:
1. اذهب إلى **Forwarders**
2. أنشئ forwarder لـ `info@elhamdimports.com` إلى بريدك الشخصي

### 14. **إعداد الأمان**

#### تفعيل Firewall:
1. اذهب to **ModSecurity**
2. تفعيل **ModSecurity**

#### حماية المجلدات:
1. اذهب إلى **Directory Privacy**
2. اختر مجلد `elhamd-imports`
3. تفعيل الحماية بكلمة مرور

#### إعداد Hotlink Protection:
1. اذهب إلى **Hotlink Protection**
2. تفعيل الحماية من الاستخدام الخارجي

### 15. **التحسينات النهائية**

#### ضغط الصور:
1. اذهب إلى **Optimize Website**
2. اختر **Compress Content**

#### تفعيل Caching:
1. اذهب إلى **Caching**
2. تفعيل **OPcache**
3. تفعيل **Memcached**

#### إعداد CDN:
1. إذا كان متاحاً، اذهب to **Cloudflare**
2. اربط النطاق بـ Cloudflare CDN

## 🎉 مبروك!

تم إعداد Elhamd Imports بنجاح على Namecheap. الآن يمكنك:
- إدارة المحتوى عبر لوحة التحكم
- مراقبة الأداء عبر PM2
- تلقي الإشعارات عبر البريد الإلكتروني
- تحديث التطبيق بسهولة

## 📞 الدعم الفني

إذا واجهت أي مشاكل:
1. تحقق من سجلات الأخطاء: `pm2 logs elhamd-imports`
2. تأكد من إعدادات DNS
3. تحقق من متغيرات البيئة
4. اتصل بدعم Namecheap

للمساعدة الإضافية، راجع وثائق Namecheap أو تواصل مع الدعم الفني.