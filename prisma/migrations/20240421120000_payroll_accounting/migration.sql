-- CreateEnum
CREATE TYPE "PayrollBatchStatus" AS ENUM ('PENDING', 'APPROVED', 'POSTED', 'PAID');

-- CreateTable
CREATE TABLE "payroll_batches" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" "PayrollBatchStatus" NOT NULL DEFAULT 'PENDING',
    "total_gross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_net" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "processed_at" TIMESTAMP,
    "approved_at" TIMESTAMP,
    "posted_at" TIMESTAMP,
    "paid_at" TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "payroll_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_payroll_accounts" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "expense_account_id" TEXT NOT NULL,
    "payable_account_id" TEXT NOT NULL,
    "cash_account_id" TEXT,
    "deduction_account_id" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "employee_payroll_accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employee_payroll_accounts_employee_id_key" UNIQUE ("employee_id"),
    CONSTRAINT "employee_payroll_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employee_payroll_accounts_expense_account_id_fkey" FOREIGN KEY ("expense_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_payroll_accounts_payable_account_id_fkey" FOREIGN KEY ("payable_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_payroll_accounts_cash_account_id_fkey" FOREIGN KEY ("cash_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employee_payroll_accounts_deduction_account_id_fkey" FOREIGN KEY ("deduction_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- AlterTable: journal_entries
ALTER TABLE "journal_entries" ADD COLUMN "payroll_batch_id" TEXT;
ALTER TABLE "journal_entries" ADD COLUMN "transaction_id" TEXT;

-- AlterTable: transactions
ALTER TABLE "transactions" ADD COLUMN "payroll_batch_id" TEXT;

-- AlterTable: payroll_records
ALTER TABLE "payroll_records" ADD COLUMN "approved_at" TIMESTAMP;
ALTER TABLE "payroll_records" ADD COLUMN "batch_id" TEXT;

-- CreateIndex
CREATE INDEX "payroll_batches_period_idx" ON "payroll_batches"("period");
CREATE INDEX "journal_entries_payroll_batch_id_idx" ON "journal_entries"("payroll_batch_id");
CREATE INDEX "transactions_payroll_batch_id_idx" ON "transactions"("payroll_batch_id");
CREATE INDEX "payroll_records_batch_id_idx" ON "payroll_records"("batch_id");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_payroll_batch_id_fkey" FOREIGN KEY ("payroll_batch_id") REFERENCES "payroll_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payroll_batch_id_fkey" FOREIGN KEY ("payroll_batch_id") REFERENCES "payroll_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "payroll_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
