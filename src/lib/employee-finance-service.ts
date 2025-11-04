import { db } from '@/lib/db'
import { AccountType, BalanceType } from '@prisma/client'

interface EmployeeAccountParams {
  employeeNumber: string
  employeeName: string
  branchId?: string | null
}

interface EmployeeAccountSyncParams extends EmployeeAccountParams {
  employeeId: string
  payrollExpenseAccountId?: string | null
  payrollLiabilityAccountId?: string | null
}

interface EmployeeAccountsResult {
  payrollExpenseAccountId: string
  payrollLiabilityAccountId: string
}

export class EmployeeFinanceService {
  private static readonly PAYROLL_EXPENSE_BASE_CODE = '5000'
  private static readonly PAYROLL_LIABILITY_BASE_CODE = '2100'

  private static normalizeName(name: string) {
    return name.trim().replace(/\s+/g, ' ')
  }

  private static async ensureAccount(code: string, data: {
    name: string
    type: AccountType
    normalBalance: BalanceType
    parentId?: string | null
  }) {
    return db.chartOfAccount.upsert({
      where: { code },
      update: {
        name: data.name,
        ...(data.parentId ? { parentId: data.parentId } : {})
      },
      create: {
        code,
        name: data.name,
        type: data.type,
        normalBalance: data.normalBalance,
        parentId: data.parentId ?? null
      }
    })
  }

  private static async ensureDefaultAccounts() {
    const payrollExpense = await this.ensureAccount(this.PAYROLL_EXPENSE_BASE_CODE, {
      name: 'مصروفات الرواتب',
      type: AccountType.EXPENSE,
      normalBalance: BalanceType.DEBIT
    })

    const payrollLiability = await this.ensureAccount(this.PAYROLL_LIABILITY_BASE_CODE, {
      name: 'ذمم الرواتب',
      type: AccountType.LIABILITY,
      normalBalance: BalanceType.CREDIT
    })

    return { payrollExpense, payrollLiability }
  }

  private static buildExpenseAccountCode(employeeNumber: string) {
    return `${this.PAYROLL_EXPENSE_BASE_CODE}-${employeeNumber}`
  }

  private static buildLiabilityAccountCode(employeeNumber: string) {
    return `${this.PAYROLL_LIABILITY_BASE_CODE}-${employeeNumber}`
  }

  public static async setupEmployeeAccounts(
    params: EmployeeAccountParams
  ): Promise<EmployeeAccountsResult> {
    const normalizedName = this.normalizeName(params.employeeName || params.employeeNumber)
    const { payrollExpense, payrollLiability } = await this.ensureDefaultAccounts()

    const expenseAccount = await this.ensureAccount(this.buildExpenseAccountCode(params.employeeNumber), {
      name: `مصروفات راتب - ${normalizedName}`,
      type: AccountType.EXPENSE,
      normalBalance: BalanceType.DEBIT,
      parentId: payrollExpense.id
    })

    const liabilityAccount = await this.ensureAccount(this.buildLiabilityAccountCode(params.employeeNumber), {
      name: `مستحقات موظف - ${normalizedName}`,
      type: AccountType.LIABILITY,
      normalBalance: BalanceType.CREDIT,
      parentId: payrollLiability.id
    })

    return {
      payrollExpenseAccountId: expenseAccount.id,
      payrollLiabilityAccountId: liabilityAccount.id
    }
  }

  public static async syncEmployeeAccounts(
    params: EmployeeAccountSyncParams
  ): Promise<EmployeeAccountsResult> {
    const accounts = await this.setupEmployeeAccounts({
      employeeNumber: params.employeeNumber,
      employeeName: params.employeeName,
      branchId: params.branchId
    })

    if (
      accounts.payrollExpenseAccountId !== params.payrollExpenseAccountId ||
      accounts.payrollLiabilityAccountId !== params.payrollLiabilityAccountId
    ) {
      await db.employee.update({
        where: { id: params.employeeId },
        data: {
          payrollExpenseAccountId: accounts.payrollExpenseAccountId,
          payrollLiabilityAccountId: accounts.payrollLiabilityAccountId
        }
      })
    }

    return accounts
  }
}
