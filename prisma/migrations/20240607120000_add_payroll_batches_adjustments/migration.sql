-- Create new enums for payroll batching and adjustments
CREATE TYPE "PayrollBatchFrequency" AS ENUM ('MONTHLY', 'BIWEEKLY', 'WEEKLY', 'CUSTOM');
CREATE TYPE "PayrollAdjustmentType" AS ENUM ('BONUS', 'ALLOWANCE', 'DEDUCTION', 'PENALTY', 'TAX', 'REIMBURSEMENT', 'OTHER');

-- Extend payroll records with batching and taxation support
ALTER TABLE "payroll_records"
  ADD COLUMN     "batch_id" TEXT,
  ADD COLUMN     "gross_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN     "taxes" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN     "calculation" JSONB,
  ADD COLUMN     "approved_at" TIMESTAMP(3);

-- Backfill gross salary for existing records
UPDATE "payroll_records"
SET "gross_salary" = COALESCE("basic_salary", 0) + COALESCE("allowances", 0) + COALESCE("overtime", 0) + COALESCE("bonus", 0)
WHERE "gross_salary" = 0;

-- Enforce explicit gross salary values on new inserts
ALTER TABLE "payroll_records"
  ALTER COLUMN "gross_salary" DROP DEFAULT;

-- Create payroll batch table
CREATE TABLE "payroll_batches" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3) NOT NULL,
  "frequency" "PayrollBatchFrequency" NOT NULL DEFAULT 'MONTHLY',
  "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
  "processed_at" TIMESTAMP(3),
  "approved_at" TIMESTAMP(3),
  "paid_at" TIMESTAMP(3),
  "next_run_at" TIMESTAMP(3),
  "total_gross" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_net" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "created_by" TEXT NOT NULL,
  "approved_by" TEXT,
  "metadata" JSONB,
  "calculation" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payroll_batches_pkey" PRIMARY KEY ("id")
);

-- Create payroll adjustments table
CREATE TABLE "payroll_adjustments" (
  "id" TEXT NOT NULL,
  "payroll_record_id" TEXT,
  "employee_id" TEXT NOT NULL,
  "type" "PayrollAdjustmentType" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "reason" TEXT,
  "effective_date" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "created_by" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payroll_adjustments_pkey" PRIMARY KEY ("id")
);

-- Foreign keys for payroll batches
ALTER TABLE "payroll_batches"
  ADD CONSTRAINT "payroll_batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payroll_batches"
  ADD CONSTRAINT "payroll_batches_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys for payroll adjustments
ALTER TABLE "payroll_adjustments"
  ADD CONSTRAINT "payroll_adjustments_payroll_record_id_fkey" FOREIGN KEY ("payroll_record_id") REFERENCES "payroll_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payroll_adjustments"
  ADD CONSTRAINT "payroll_adjustments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payroll_adjustments"
  ADD CONSTRAINT "payroll_adjustments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Link payroll records to batches
ALTER TABLE "payroll_records"
  ADD CONSTRAINT "payroll_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "payroll_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Useful indexes for new relations
CREATE INDEX "payroll_records_batch_id_idx" ON "payroll_records"("batch_id");
CREATE INDEX "payroll_batches_period_idx" ON "payroll_batches"("period");
CREATE INDEX "payroll_batches_status_idx" ON "payroll_batches"("status");
CREATE INDEX "payroll_adjustments_employee_id_idx" ON "payroll_adjustments"("employee_id");
CREATE INDEX "payroll_adjustments_payroll_record_id_idx" ON "payroll_adjustments"("payroll_record_id");
