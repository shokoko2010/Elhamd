-- ============================================
-- إصلاح schema قاعدة البيانات للمدفوعات
-- ============================================
-- قم بتشغيل هذا SQL في قاعدة بيانات Prisma Postgres

-- إضافة عمود metadata لجدول payments
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE payments ADD COLUMN metadata JSONB;
        RAISE NOTICE '✅ تم إضافة عمود metadata لجدول payments';
    ELSE
        RAISE NOTICE 'ℹ️ عمود metadata موجود بالفعل في جدول payments';
    END IF;
END $$;

-- إضافة عمود metadata لجدول transactions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE transactions ADD COLUMN metadata JSONB;
        RAISE NOTICE '✅ تم إضافة عمود metadata لجدول transactions';
    ELSE
        RAISE NOTICE 'ℹ️ عمود metadata موجود بالفعل في جدول transactions';
    END IF;
END $$;

-- التحقق من الأعمدة المضافة
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('payments', 'transactions') 
    AND column_name = 'metadata'
ORDER BY table_name;

-- ============================================
-- تعليمات التشغيل:
-- 1. اتصل بقاعدة بيانات Prisma Postgres
-- 2. انسخ والصق هذا الكود بالكامل
-- 3. قم بتشغيل الكود
-- 4. تحقق من النتائج
-- ============================================