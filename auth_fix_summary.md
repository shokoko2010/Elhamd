# إصلاح مشكلة المصادقة في نظام إدارة المخزون

## المشكلة الأصلية
- المستخدم لا يمكنه تسجيل الدخول باستخدام حساب المسؤول `admin@alhamdcars.com` / `admin123`
- بعد تسجيل الدخول بنجاح، استدعاءات API للمخزون تعيد خطأ 401 "Unauthorized"
- ظهور خطأ 500 "Internal Server Error" عند محاولة الوصول إلى واجهات برمجة التطبيقات (APIs) للمخزون

## التحليل والتشخيص
اكتشفنا وجود **نظام مصادقة مزدوج متعارض** في النظام:
1. **نظام NextAuth للمصادقة** - يستخدم في مسارات API للمخزون
2. **نظام API مخصص للمصادقة** - يستخدم في مسارات API لتسجيل الدخول

المشكلة كانت أن API تسجيل الدخول يستخدم نظام المصادقة المخصص ويعيد JWT token، لكن API المخزون يستخدم نظام NextAuth للمصادقة، مما أدى إلى عدم تطابق المصادقة.

## الحلول المنفذة

### 1. إنشاء نظام مصادقة موحد (`/src/lib/unified-auth.ts`)
- دعم كل من NextAuth ونظام API المخصص
- توفير واجهة مستخدم موحدة للتحقق من الصلاحيات

```typescript
export async function getUnifiedUser(request: Request): Promise<UnifiedUser | null> {
  try {
    // أولاً محاولة استخدام جلسة NextAuth
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        phone: session.user.phone,
        branchId: session.user.branchId,
        permissions: session.user.permissions
      }
    }

    // العودة إلى مصادقة API token
    const apiUser = await getApiUser(request)
    if (apiUser) {
      return {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role,
        phone: apiUser.phone,
        branchId: apiUser.branchId,
        permissions: apiUser.permissions
      }
    }

    return null
  } catch (error) {
    console.error('Unified auth error:', error)
    return null
  }
}
```

### 2. تحديث مسارات API
تم تحديث جميع مسارات API المتعلقة بالمخزون لاستخدام نظام المصادقة الموحد:
- `/api/inventory/items`
- `/api/inventory/warehouses`
- `/api/inventory/suppliers`
- `/api/inventory/alerts`
- `/api/inventory/initialize`
- `/api/inventory/sync-vehicles`
- `/api/branches`

### 3. إنشاء عميل API (`/src/lib/api-client.ts`)
- إضافة تلقائية لرأس Authorization
- معالجة JWT token من localStorage

```typescript
export class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}

    // محاولة الحصول على API token من localStorage
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error getting auth token from localStorage:', error)
      }
    }

    return headers
  }
}
```

### 4. تحديث الواجهة الأمامية
تم تعديل صفحة إدارة المخزون لاستخدام عميل API الجديد:
- استبدال جميع استدعاءات fetch بعميل API الموحد

### 5. إصلاح مشاكل الاستيراد
تم إصلاح مشكلة استيراد `UserRole` من ملف `unified-auth.ts`:

```typescript
// إضافة تصدير UserRole
export { UserRole }
```

## النتائج
- ✅ تسجيل الدخول يعمل بشكل صحيح
- ✅ جميع واجهات برمجة التطبيقات تعيد استجابات JSON صالحة
- ✅ المصادقة تعمل عبر جميع مسارات API
- ✅ لا توجد أخطاء في linting
- ✅ النظام مستقر وجاهز للاستخدام

## الاختبارات
تم إنشاء وتشغيل اختبارات شاملة للتحقق من:
1. تسجيل الدخول والحصول على token
2. الوصول إلى عناصر المخزون
3. الوصول إلى المستودعات
4. الوصول إلى الموردين
5. الوصول إلى التنبيهات
6. الوصول إلى الفروع

جميع الاختبارات نجحت بنجاح.

## الملفات المعدلة
1. `/src/lib/unified-auth.ts` - إنشاء نظام مصادقة موحد
2. `/src/lib/api-client.ts` - إنشاء عميل API
3. `/src/app/admin/inventory/page.tsx` - تحديث الواجهة الأمامية
4. جميع مسارات API للمخزون - تحديث لاستخدام المصادقة الموحدة

## الخلاصة
تم حل مشكلة المصادقة بنجاح من خلال إنشاء نظام موحد يدعم كل من NextAuth والمصادقة المخصصة. النظام الآن يعمل بشكل متكامل ومستقر، ويمكن للمستخدمين الوصول إلى جميع وظائف إدارة المخزون بدون مشاكل.