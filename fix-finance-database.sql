-- Database Migration Script for Finance API Fix
-- Run this script in your Prisma Postgres database to add the missing metadata field

-- Add metadata column to payments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE payments ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to payments table';
    ELSE
        RAISE NOTICE 'metadata column already exists in payments table';
    END IF;
END $$;

-- Add metadata column to transactions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE transactions ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to transactions table';
    ELSE
        RAISE NOTICE 'metadata column already exists in transactions table';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('payments', 'transactions') 
    AND column_name = 'metadata'
ORDER BY table_name;