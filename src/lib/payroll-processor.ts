import { PayrollBatchStatus, PayrollStatus, Prisma, PrismaClient } from '@prisma/client'

import { db } from '@/lib/db'

import { AccountingService } from './accounting-service'

type TransactionClient = Prisma.TransactionClient
type PrismaClientOrTransaction = PrismaClient | TransactionClient

const TOTAL_EPSILON = 0.01

const payrollRecordInclude = {
  employee: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      },
      position: {
        select: {
          id: true,
          title: true
        }
      },
      payrollAccount: {
        include: {
          expenseAccount: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          payableAccount: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          cashAccount: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          deductionAccount: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }
    }
  },
  creator: {
    select: {
      id: true,
      name: true
    }
  },
  approver: {
    select: {
      id: true,
      name: true
    }
  },
  batch: true
} satisfies Prisma.PayrollRecordInclude

interface PayrollRecordMeta {
  id: string
  period: string
  createdBy: string
  batchId: string | null
}

export class PayrollProcessor {
  private readonly accountingService: AccountingService

  constructor(private readonly prisma: PrismaClient = db, accountingService?: AccountingService) {
    this.accountingService = accountingService ?? new AccountingService(prisma)
  }

  async createPayrollRecord(
    data: {
      employeeId: string
      period: string
      basicSalary: number
      allowances: number
      deductions: number
      overtime: number
      bonus: number
      netSalary: number
    },
    createdBy: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const batch = await this.getOrCreateBatch(tx, data.period, createdBy)

      const record = await tx.payrollRecord.create({
        data: {
          employeeId: data.employeeId,
          period: data.period,
          basicSalary: data.basicSalary,
          allowances: data.allowances,
          deductions: data.deductions,
          overtime: data.overtime,
          bonus: data.bonus,
          netSalary: data.netSalary,
          createdBy,
          batchId: batch.id
        },
        include: payrollRecordInclude
      })

      await this.recalculateBatch(tx, batch.id)

      return record
    })
  }

  async approvePayrollRecord(recordId: string, approverId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payrollRecord.findUnique({
        where: { id: recordId },
        select: {
          id: true,
          period: true,
          createdBy: true,
          batchId: true
        }
      })

      if (!existing) {
        throw new Error('Payroll record not found')
      }

      const approvedAt = new Date()

      await tx.payrollRecord.update({
        where: { id: recordId },
        data: {
          status: PayrollStatus.APPROVED,
          approvedBy: approverId,
          approvedAt
        }
      })

      const batchId = await this.ensureBatchAssignment(tx, existing)

      await this.postBatchAccrual(batchId, approverId, tx, {
        approvedBy: approverId,
        approvedAt
      })

      return this.loadPayrollRecord(tx, recordId)
    })
  }

  async markPayrollRecordPaid(recordId: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payrollRecord.findUnique({
        where: { id: recordId },
        select: {
          id: true,
          period: true,
          createdBy: true,
          batchId: true
        }
      })

      if (!existing) {
        throw new Error('Payroll record not found')
      }

      await tx.payrollRecord.update({
        where: { id: recordId },
        data: {
          status: PayrollStatus.PAID,
          payDate: new Date()
        }
      })

      const batchId = await this.ensureBatchAssignment(tx, existing)

      await this.postBatchPayment(batchId, actorId, tx)

      return this.loadPayrollRecord(tx, recordId)
    })
  }

  async updatePayrollRecordStatus(recordId: string, status: PayrollStatus, actorId: string) {
    if (status === PayrollStatus.APPROVED) {
      return this.approvePayrollRecord(recordId, actorId)
    }

    if (status === PayrollStatus.PAID) {
      return this.markPayrollRecordPaid(recordId, actorId)
    }

    return this.prisma.payrollRecord.update({
      where: { id: recordId },
      data: { status },
      include: payrollRecordInclude
    })
  }

  async postBatchAccrual(
    batchId: string,
    actorId: string,
    tx?: TransactionClient,
    options?: { approvedBy?: string; approvedAt?: Date }
  ) {
    const client = tx ?? this.prisma

    await this.recalculateBatch(client, batchId)

    const result = await this.accountingService.postPayrollAccrual(batchId, actorId, tx)

    const updateData: Prisma.PayrollBatchUpdateInput = {
      status: PayrollBatchStatus.POSTED,
      postedAt: new Date()
    }

    if (options?.approvedBy) {
      updateData.approvedBy = options.approvedBy
    }

    if (options?.approvedAt) {
      updateData.approvedAt = options.approvedAt
    }

    await client.payrollBatch.update({
      where: { id: batchId },
      data: updateData
    })

    return result
  }

  async postBatchPayment(batchId: string, actorId: string, tx?: TransactionClient) {
    const client = tx ?? this.prisma

    const recalculated = await this.recalculateBatch(client, batchId)

    const result = await this.accountingService.postPayrollPayment(batchId, actorId, tx)

    const updateData: Prisma.PayrollBatchUpdateInput = {}

    if (
      recalculated.totals.totalNet > 0 &&
      Math.abs(recalculated.totals.totalNet - recalculated.totals.totalPaid) <= TOTAL_EPSILON
    ) {
      updateData.status = PayrollBatchStatus.PAID
      updateData.paidAt = new Date()
    }

    if (Object.keys(updateData).length > 0) {
      await client.payrollBatch.update({
        where: { id: batchId },
        data: updateData
      })
    }

    return result
  }

  private async getOrCreateBatch(client: PrismaClientOrTransaction, period: string, createdBy: string) {
    const batch = await client.payrollBatch.findFirst({
      where: {
        period,
        status: {
          in: [PayrollBatchStatus.PENDING, PayrollBatchStatus.APPROVED, PayrollBatchStatus.POSTED]
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (batch) {
      return batch
    }

    return client.payrollBatch.create({
      data: {
        period,
        status: PayrollBatchStatus.PENDING,
        createdBy
      }
    })
  }

  private async ensureBatchAssignment(client: PrismaClientOrTransaction, record: PayrollRecordMeta) {
    if (record.batchId) {
      return record.batchId
    }

    const batch = await this.getOrCreateBatch(client, record.period, record.createdBy)

    await client.payrollRecord.update({
      where: { id: record.id },
      data: { batchId: batch.id }
    })

    return batch.id
  }

  private async recalculateBatch(client: PrismaClientOrTransaction, batchId: string) {
    const records = await client.payrollRecord.findMany({
      where: { batchId }
    })

    const totals = records.reduce(
      (acc, record) => {
        const gross = record.basicSalary + record.allowances + record.overtime + record.bonus
        acc.totalGross += gross
        acc.totalDeductions += record.deductions ?? 0
        acc.totalNet += record.netSalary

        if (record.status === PayrollStatus.PAID) {
          acc.totalPaid += record.netSalary
        }

        return acc
      },
      { totalGross: 0, totalDeductions: 0, totalNet: 0, totalPaid: 0 }
    )

    const batch = await client.payrollBatch.update({
      where: { id: batchId },
      data: {
        totalGross: Math.round((totals.totalGross + Number.EPSILON) * 100) / 100,
        totalDeductions: Math.round((totals.totalDeductions + Number.EPSILON) * 100) / 100,
        totalNet: Math.round((totals.totalNet + Number.EPSILON) * 100) / 100,
        totalPaid: Math.round((totals.totalPaid + Number.EPSILON) * 100) / 100
      }
    })

    return { batch, totals, records }
  }

  private loadPayrollRecord(client: PrismaClientOrTransaction, id: string) {
    return client.payrollRecord.findUnique({
      where: { id },
      include: payrollRecordInclude
    })
  }
}
