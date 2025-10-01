# حل مشكلة تحويل صفحة إعدادات الموقع إلى صفحة تسجيل الدخول

## المشكلة
عند محاولة الوصول إلى صفحة إعدادات الموقع في داشبورد الإدمن (`/admin/site-settings`)، كان يتم تحويل المستخدم إلى صفحة تسجيل الدخول حتى لو كان مسجلاً دخوله بالفعل كمدير.

## الأسباب الرئيسية

### 1. عدم توافق أنظمة المصادقة
- كانت الصفحة تستخدم `useSession` من NextAuth.js
- بينما النظام يستخدم SimpleAuth system
- هذا أدى إلى عدم التعرف على جلسة المستخدم الصحيحة

### 2. مشاكل في صلاحيات المستخدم
- كانت هناك مشكلة في تحليل الصلاحيات من قاعدة البيانات
- الصلاحيات كانت مخزنة كمعرفات (IDs) ولكن الكود كان يحاول تحليلها كأسماء صلاحيات

### 3. مشاكل في بيانات البذور (Seed Data)
- كانت هناك أخطاء في قيم الـ Enums في بيانات الاختبار
- بعض الحقول كانت تستخدم قيم غير موجودة في الـ Enums المعرّفة

## الحلول المنفذة

### 1. إصلاح نظام المصادقة في صفحة إعدادات الموقع
```typescript
// قبل الإصلاح
const { data: session, status } = useSession()

// بعد الإصلاح
const { user, loading, authenticated, isAdmin } = useAuth()
```

### 2. تحديث منطق التحقق من الصلاحيات
```typescript
useEffect(() => {
  if (!loading && !authenticated) {
    router.push('/login')
    return
  }

  if (!loading && authenticated && !isAdmin()) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      variant: "destructive"
    })
    router.push('/dashboard')
    return
  }
}, [loading, authenticated, isAdmin, router, toast])
```

### 3. إصلاح خدمة الصلاحيات
```typescript
// إصلاح تحليل الصلاحيات من قاعدة البيانات
if (user.roleTemplate?.permissions) {
  try {
    let templatePermissions: string[] = []
    if (typeof user.roleTemplate.permissions === 'string') {
      templatePermissions = JSON.parse(user.roleTemplate.permissions)
    } else if (Array.isArray(user.roleTemplate.permissions)) {
      templatePermissions = user.roleTemplate.permissions
    }
    
    // تحويل معرفات الصلاحيات إلى أسماء الصلاحيات
    const permissionNames = await db.permission.findMany({
      where: { id: { in: templatePermissions } },
      select: { name: true }
    })
    
    permissions = permissionNames.map(p => p.name as Permission)
  } catch (error) {
    console.error('Error parsing role template permissions:', error)
  }
}
```

### 4. إصلاح بيانات البذور
```typescript
// تصحيح قيم الـ Enums
status: 'CONFIRMED', // بدلاً من 'IN_PROGRESS'
paymentStatus: 'COMPLETED', // بدلاً من 'PAID'
```

## النتائج

### ✅ المصادقة تعمل بشكل صحيح
- المستخدمون يمكنهم تسجيل الدخول بنجاح
- الجلسات يتم الحفاظ عليها بشكل صحيح
- الصلاحيات يتم تحميلها من قاعدة البيانات

### ✅ صفحة إعدادات الموقع متاحة
- المستخدمون الإداريون يمكنهم الوصول إلى الصفحة
- المستخدمون غير المصرح لهم يتم تحويلهم بشكل صحيح
- الصفحة تعرض جميع الوظائف المطلوبة

### ✅ بيانات الاختبار مكتملة
- جميع الصلاحيات الأساسية تم إنشاؤها
- المستخدمون الاختباريون مع الصلاحيات الصحيحة
- المركبات والخدمات والحجوزات متوفرة

## خطوات الاستخدام

1. **تسجيل الدخول كمدير**
   - اذهب إلى `/login`
   - استخدم البريد الإلكتروني: `admin@elhamdimports.com`
   - استخدم كلمة المرور: `admin123`

2. **الوصول إلى صفحة إعدادات الموقع**
   - بعد تسجيل الدخول، اذهب إلى `/admin/site-settings`
   - ستجد الصفحة تعمل بشكل صحيح مع جميع الصلاحيات

3. **استخدام الميزات**
   - إدارة إعدادات الموقع
   - الوصول السريع إلى صفحات الإدارة الأخرى
   - إدارة الهيدر والفوتر

## الملفات المعدلة

1. `/src/app/admin/site-settings/page.tsx` - إصلاح نظام المصادقة
2. `/src/lib/permissions.ts` - إصلاح تحليل الصلاحيات
3. `/prisma/seed.ts` - إصلاح بيانات الاختبار

## التحقق من الحل

يمكن التحقق من أن الحل يعمل بشكل صحيح عن طريق:
- تسجيل الدخول كمدير والوصول إلى صفحة إعدادات الموقع
- التحقق من أن الصلاحيات يتم تحميلها بشكل صحيح
- التأكد من أن المستخدمين غير المصرح لهم يتم تحويلهم بشكل صحيح