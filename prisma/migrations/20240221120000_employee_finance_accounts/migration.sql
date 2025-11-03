ALTER TABLE "employees"
  ADD COLUMN "payrollExpenseAccountId" TEXT,
  ADD COLUMN "payrollLiabilityAccountId" TEXT;

ALTER TABLE "employees"
  ADD CONSTRAINT "employees_payrollExpenseAccountId_fkey"
    FOREIGN KEY ("payrollExpenseAccountId")
    REFERENCES "chart_of_accounts"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "employees"
  ADD CONSTRAINT "employees_payrollLiabilityAccountId_fkey"
    FOREIGN KEY ("payrollLiabilityAccountId")
    REFERENCES "chart_of_accounts"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
