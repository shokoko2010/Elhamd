import { EntryStatus, PaymentMethod, PayrollStatus, Prisma, PrismaClient } from '@prisma/client'

import { db } from '@/lib/db'

type TransactionClient = Prisma.TransactionClient
type PrismaClientOrTransaction = PrismaClient | TransactionClient

interface JournalItemInput {
  accountId: string
  debit: number
  credit: number
  description?: string
}

interface PostingTotals {
  debit: number
  credit: number
}

export class AccountingService {
  constructor(private readonly prisma: PrismaClient = db) {}

  async postPayrollAccrual(batchId: string, actorId: string, tx?: TransactionClient) {
    const client = this.getClient(tx)
    const batch = await client.payrollBatch.findUnique({
      where: { id: batchId },
      include: {
        payrollRecords: {
          where: {
            status: {
              in: [PayrollStatus.APPROVED, PayrollStatus.PAID]
            }
          },
          include: {
            employee: {
              include: {
                payrollAccount: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        journalEntries: true
      }
    })

    if (!batch) {
      throw new Error('Payroll batch not found')
    }

    const records = batch.payrollRecords

    if (records.length === 0) {
      throw new Error('No approved payroll records available for posting')
    }

    const itemsMap = new Map<string, JournalItemInput>()

    for (const record of records) {
      const accountConfig = record.employee.payrollAccount

      if (!accountConfig) {
        throw new Error(`Missing payroll account configuration for employee ${record.employeeId}`)
      }

      const gross = record.basicSalary + record.allowances + record.overtime + record.bonus
      const deductions = record.deductions ?? 0
      const net = record.netSalary

      this.addAggregatedItem(itemsMap, {
        accountId: accountConfig.expenseAccountId,
        debit: gross,
        credit: 0,
        description: `Payroll expense - ${record.period}`
      })

      this.addAggregatedItem(itemsMap, {
        accountId: accountConfig.payableAccountId,
        debit: 0,
        credit: net,
        description: `Payroll payable - ${record.period}`
      })

      if (deductions > 0) {
        const deductionAccountId = accountConfig.deductionAccountId ?? accountConfig.payableAccountId
        this.addAggregatedItem(itemsMap, {
          accountId: deductionAccountId,
          debit: 0,
          credit: deductions,
          description: `Payroll deductions - ${record.period}`
        })
      }
    }

    const items = Array.from(itemsMap.values()).map((item) => ({
      accountId: item.accountId,
      debit: this.normalizeAmount(item.debit),
      credit: this.normalizeAmount(item.credit),
      description: item.description
    }))

    const totals = this.calculateTotals(items)

    const reference = `PAYROLL:${batch.period}:ACCRUAL`

    const existingEntry = batch.journalEntries.find((entry) => entry.reference === reference)

    const entry = await this.upsertJournalEntry(
      client,
      existingEntry?.id ?? null,
      {
        entryNumber: existingEntry?.entryNumber ?? (await this.generateJournalEntryNumber(client, 'PAY')),
        date: new Date(),
        description: `Payroll accrual posting for period ${batch.period}`,
        reference,
        status: EntryStatus.POSTED,
        createdBy: actorId,
        payrollBatchId: batchId,
        totalDebit: totals.debit,
        totalCredit: totals.credit
      },
      items
    )

    return { entry, totals }
  }

  async postPayrollPayment(batchId: string, actorId: string, tx?: TransactionClient) {
    const client = this.getClient(tx)
    const batch = await client.payrollBatch.findUnique({
      where: { id: batchId },
      include: {
        payrollRecords: {
          where: { status: PayrollStatus.PAID },
          include: {
            employee: {
              include: {
                payrollAccount: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        journalEntries: true
      }
    })

    if (!batch) {
      throw new Error('Payroll batch not found')
    }

    const paidRecords = batch.payrollRecords

    if (paidRecords.length === 0) {
      throw new Error('No paid payroll records available for payment posting')
    }

    const itemsMap = new Map<string, JournalItemInput>()

    for (const record of paidRecords) {
      const accountConfig = record.employee.payrollAccount

      if (!accountConfig) {
        throw new Error(`Missing payroll account configuration for employee ${record.employeeId}`)
      }

      if (!accountConfig.cashAccountId) {
        throw new Error(`Missing cash account configuration for employee ${record.employeeId}`)
      }

      const net = record.netSalary

      this.addAggregatedItem(itemsMap, {
        accountId: accountConfig.payableAccountId,
        debit: net,
        credit: 0,
        description: `Payroll payment - ${record.period}`
      })

      this.addAggregatedItem(itemsMap, {
        accountId: accountConfig.cashAccountId,
        debit: 0,
        credit: net,
        description: `Payroll disbursement - ${record.period}`
      })
    }

    const items = Array.from(itemsMap.values()).map((item) => ({
      accountId: item.accountId,
      debit: this.normalizeAmount(item.debit),
      credit: this.normalizeAmount(item.credit),
      description: item.description
    }))

    const totals = this.calculateTotals(items)

    if (totals.debit <= 0 || totals.credit <= 0) {
      throw new Error('Unable to calculate payroll payment totals')
    }

    const existingTransaction = await client.transaction.findFirst({
      where: { payrollBatchId: batchId }
    })

    const transaction = await this.upsertTransaction(client, existingTransaction?.id ?? null, {
      amount: totals.debit,
      batchId,
      period: batch.period,
      actorId,
      referenceId: existingTransaction?.referenceId
    })

    const reference = `PAYROLL:${batch.period}:PAYMENT`
    const existingEntry = batch.journalEntries.find((entry) => entry.reference === reference)

    const entry = await this.upsertJournalEntry(
      client,
      existingEntry?.id ?? null,
      {
        entryNumber: existingEntry?.entryNumber ?? (await this.generateJournalEntryNumber(client, 'PAY')),
        date: new Date(),
        description: `Payroll payment posting for period ${batch.period}`,
        reference,
        status: EntryStatus.POSTED,
        createdBy: actorId,
        payrollBatchId: batchId,
        transactionId: transaction.id,
        totalDebit: totals.debit,
        totalCredit: totals.credit
      },
      items
    )

    return { entry, transaction, totals }
  }

  private getClient(tx?: TransactionClient): PrismaClientOrTransaction {
    return tx ?? this.prisma
  }

  private addAggregatedItem(map: Map<string, JournalItemInput>, item: JournalItemInput) {
    const existing = map.get(item.accountId)

    if (existing) {
      existing.debit = this.normalizeAmount(existing.debit + item.debit)
      existing.credit = this.normalizeAmount(existing.credit + item.credit)
      if (!existing.description && item.description) {
        existing.description = item.description
      }
    } else {
      map.set(item.accountId, {
        accountId: item.accountId,
        debit: this.normalizeAmount(item.debit),
        credit: this.normalizeAmount(item.credit),
        description: item.description
      })
    }
  }

  private calculateTotals(items: JournalItemInput[]): PostingTotals {
    return items.reduce(
      (totals, item) => {
        totals.debit = this.normalizeAmount(totals.debit + item.debit)
        totals.credit = this.normalizeAmount(totals.credit + item.credit)
        return totals
      },
      { debit: 0, credit: 0 }
    )
  }

  private normalizeAmount(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
  }

  private async upsertJournalEntry(
    client: PrismaClientOrTransaction,
    entryId: string | null,
    data: {
      entryNumber: string
      date: Date
      description: string
      reference: string
      status: EntryStatus
      createdBy: string
      payrollBatchId: string
      transactionId?: string
      totalDebit: number
      totalCredit: number
    },
    items: JournalItemInput[]
  ) {
    const entry = entryId
      ? await client.journalEntry.update({
          where: { id: entryId },
          data: {
            date: data.date,
            description: data.description,
            reference: data.reference,
            status: data.status,
            totalDebit: data.totalDebit,
            totalCredit: data.totalCredit,
            transactionId: data.transactionId,
            payrollBatchId: data.payrollBatchId
          }
        })
      : await client.journalEntry.create({
          data: {
            entryNumber: data.entryNumber,
            date: data.date,
            description: data.description,
            reference: data.reference,
            status: data.status,
            totalDebit: data.totalDebit,
            totalCredit: data.totalCredit,
            transactionId: data.transactionId,
            payrollBatchId: data.payrollBatchId,
            createdBy: data.createdBy
          }
        })

    await client.journalEntryItem.deleteMany({ where: { entryId: entry.id } })

    if (items.length > 0) {
      await client.journalEntryItem.createMany({
        data: items.map((item) => ({
          entryId: entry.id,
          accountId: item.accountId,
          description: item.description,
          debit: item.debit,
          credit: item.credit
        }))
      })
    }

    return entry
  }

  private async upsertTransaction(
    client: PrismaClientOrTransaction,
    transactionId: string | null,
    options: { amount: number; batchId: string; period: string; actorId: string; referenceId?: string | null }
  ) {
    const referenceId = options.referenceId ?? `PAYROLL-PAY-${Date.now()}`
    const description = `Payroll payment for period ${options.period}`

    return transactionId
      ? client.transaction.update({
          where: { id: transactionId },
          data: {
            amount: this.normalizeAmount(options.amount),
            type: 'EXPENSE',
            category: 'Payroll Payment',
            description,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            date: new Date(),
            payrollBatchId: options.batchId,
            metadata: {
              updatedBy: options.actorId,
              updatedAt: new Date().toISOString()
            }
          }
        })
      : client.transaction.create({
          data: {
            referenceId,
            type: 'EXPENSE',
            category: 'Payroll Payment',
            amount: this.normalizeAmount(options.amount),
            currency: 'EGP',
            description,
            date: new Date(),
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            payrollBatchId: options.batchId,
            metadata: {
              createdBy: options.actorId,
              createdAt: new Date().toISOString()
            }
          }
        })
  }

  private async generateJournalEntryNumber(client: PrismaClientOrTransaction, prefix: string) {
    const count = await client.journalEntry.count({
      where: {
        entryNumber: {
          startsWith: prefix
        }
      }
    })

    return `${prefix}-${String(count + 1).padStart(6, '0')}`
  }
}
