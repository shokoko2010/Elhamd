#!/bin/bash

# سكريبت لنشر مشروع Elhamd Imports على Vercel

echo "=== بدء عملية نشر Elhamd Imports على Vercel ==="

# التحقق من وجود Node.js و npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

# التحقق من وجود Vercel CLI
if ! command -l vercel &> /dev/null; then
    echo "📦 تثبيت Vercel CLI..."
    npm install -g vercel
fi

# التحقق من جودة الكود
echo "🔍 التحقق من جودة الكود..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ فشل التحقق من جودة الكود. يرجى إصلاح الأخطاء أولاً."
    exit 1
fi

# التحقق من وجود ملف vercel.json
if [ ! -f "vercel.json" ]; then
    echo "❌ ملف vercel.json غير موجود."
    exit 1
fi

# التحقق من وجود المتغيرات البيئية المطلوبة
echo "🔍 التحقق من المتغيرات البيئية..."
required_vars=("DATABASE_URL" "NEXTAUTH_URL" "NEXTAUTH_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "⚠️  المتغيرات البيئية التالية مفقودة:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "يرجى تعيين هذه المتغيرات قبل المتابعة."
    echo "مثال: export DATABASE_URL='your-database-url'"
    exit 1
fi

# بناء المشروع محليًا للتأكد من عدم وجود أخطاء
echo "🏗️  بناء المشروع محليًا..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ فشل بناء المشروع محليًا. يرجى إصلاح الأخطاء أولاً."
    exit 1
fi

# سؤال المستخدم عن نوع النشر
echo ""
echo "اختر نوع النشر:"
echo "1. نشر إلى الإنتاج (Production)"
echo "2. نشر تجريبي (Preview)"
read -p "أدخل رقم الخيار (1 أو 2): " deploy_type

case $deploy_type in
    1)
        echo "🚀 بدء النشر إلى الإنتاج..."
        vercel --prod
        ;;
    2)
        echo "🧪 بدء النشر التجريبي..."
        vercel
        ;;
    *)
        echo "❌ خيار غير صالح. يرجى اختيار 1 أو 2."
        exit 1
        ;;
esac

# التحقق من نجاح النشر
if [ $? -eq 0 ]; then
    echo "✅ تم النشر بنجاح!"
    echo ""
    echo "الخطوات التالية:"
    echo "1. تأكد من إعداد النطاق المخصص في لوحة تحكم Vercel"
    echo "2. تحقق من أن جميع المتغيرات البيئية مضبوطة بشكل صحيح"
    echo "3. اختبر الموقع للتأكد من عمل جميع الميزات"
    echo "4. تأكد من الاتصال بقاعدة البيانات يعمل بشكل صحيح"
else
    echo "❌ فشل عملية النشر. يرجى التحقق من السجلات وإعادة المحاولة."
    exit 1
fi

echo ""
echo "=== انتهت عملية النشر ==="