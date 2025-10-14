#!/usr/bin/env node

/**
 * سكريبت للتحقق من البيئة قبل النشر على Vercel
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

const optionalEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('🔍 التحقق من البيئة قبل النشر على Vercel...\n');

// التحقق من المتغيرات المطلوبة
console.log('📋 المتغيرات المطلوبة:');
let allRequiredPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${maskSensitiveValue(varName, value)}`);
  } else {
    console.log(`❌ ${varName}: غير موجود`);
    allRequiredPresent = false;
  }
});

// التحقق من المتغيرات الاختيارية
console.log('\n📋 المتغيرات الاختيارية:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${maskSensitiveValue(varName, value)}`);
  } else {
    console.log(`⚠️  ${varName}: غير موجود (اختياري)`);
  }
});

// التحقق من صحة DATABASE_URL
if (process.env.DATABASE_URL) {
  console.log('\n🔍 التحقق من صحة DATABASE_URL...');
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.log('❌ DATABASE_URL يجب أن يبدأ بـ postgresql:// أو postgres://');
    allRequiredPresent = false;
  } else {
    console.log('✅ DATABASE_URL صالح');
  }
}

// التحقق من صحة NEXTAUTH_URL
if (process.env.NEXTAUTH_URL) {
  console.log('\n🔍 التحقق من صحة NEXTAUTH_URL...');
  const authUrl = process.env.NEXTAUTH_URL;
  
  try {
    new URL(authUrl);
    console.log('✅ NEXTAUTH_URL صالح');
  } catch (error) {
    console.log('❌ NEXTAUTH_URL غير صالح');
    allRequiredPresent = false;
  }
}

// النتيجة النهائية
console.log('\n📊 نتيجة التحقق:');
if (allRequiredPresent) {
  console.log('✅ جميع المتغيرات المطلوبة موجودة وصالحة');
  console.log('🚀 البيئة جاهزة للنشر على Vercel');
} else {
  console.log('❌ بعض المتغيرات المطلوبة مفقودة أو غير صالحة');
  console.log('🔧 يرجى إصلاح المشكلات قبل النشر');
  process.exit(1);
}

// دالة لإخفاء القيم الحساسة
function maskSensitiveValue(varName, value) {
  const sensitiveVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'EMAIL_PASS', 'GOOGLE_CLIENT_SECRET'];
  
  if (sensitiveVars.includes(varName)) {
    if (value.length > 10) {
      return value.substring(0, 6) + '...' + value.substring(value.length - 4);
    } else {
      return '***';
    }
  }
  
  return value;
}

console.log('\n💡 نصائح إضافية:');
console.log('1. تأكد من أن قاعدة البيانات قابلة للوصول من Vercel');
console.log('2. تأكد من أن NEXTAUTH_URL يتطابق مع نطاقك الفعلي');
console.log('3. استخدم كلمة سر قوية لـ NEXTAUTH_SECRET');
console.log('4. اختبر الاتصال بقاعدة البيانات محليًا قبل النشر');