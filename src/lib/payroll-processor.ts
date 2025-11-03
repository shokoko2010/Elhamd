import { EventEmitter } from 'events'
import {
  AccountType,
  AttendanceStatus,
  BalanceType,
  EmployeeStatus,
  PayrollAdjustmentType,
  PayrollBatchFrequency,
  PayrollStatus,
  PaymentMethod,
  PerformancePeriod,
  Prisma,
  EntryStatus
} from '@prisma/client'
import { addDays, addMonths, addWeeks, differenceInBusinessDays, differenceInMinutes } from 'date-fns'

import { db } from './db'
import { generateReferenceNumber } from './finance-validation'

export interface PayrollProcessingOptions {
  period: string
  startDate: Date
  endDate: Date
  createdBy: string
  frequency?: PayrollBatchFrequency
  employeeIds?: string[]
  includePerformanceBonus?: boolean
  forceRecalculate?: boolean
  scheduleNext?: boolean
  metadata?: Record<string, unknown>
}

export interface BatchStatusUpdate {
  batchId: string
  status: PayrollStatus
  actorId: string
  notes?: string
}

type EmployeeWithInputs = Prisma.EmployeeGetPayload<{
  include: {
    attendanceRecords: true
    performanceMetrics: true
    payrollAdjustments: true
    department: { select: { id: true; name: true } }
    position: { select: { id: true; title: true } }
    user: { select: { id: true; name: true; email: true } }
  }
}>

interface AttendanceSummary {
  overtime: number
  overtimeHours: number
  deductions: number
  absenceDays: number
  lateDays: number
}

interface AdjustmentSummary {
  allowanceTotal: number
  deductionTotal: number
  bonusTotal: number
  taxTotal: number
  adjustmentIds: string[]
  breakdown: Record<string, number>
}

interface BatchTotals {
  totalGross: number
  totalNet: number
  totalTax: number
  totalDeductions: number
}

const payrollBatchInclude = {
  records: {
    include: {
      employee: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } },
          position: { select: { id: true, title: true } }
        }
      },
      adjustments: true
    }
  },
  creator: { select: { id: true, name: true } },
  approver: { select: { id: true, name: true } }
} as const

type PayrollBatchWithDetails = Prisma.PayrollBatchGetPayload<{
  include: typeof payrollBatchInclude
}>

export class PayrollProcessor {
  private static instance: PayrollProcessor
  private readonly events = new EventEmitter()

  private constructor() {
    this.registerInternalHandlers()
  }

  static getInstance(): PayrollProcessor {
    if (!PayrollProcessor.instance) {
      PayrollProcessor.instance = new PayrollProcessor()
    }
    return PayrollProcessor.instance
  }

  async processPayrollBatch(options: PayrollProcessingOptions): Promise<PayrollBatchWithDetails> {
    const {
      period,
      startDate,
      endDate,
      frequency = PayrollBatchFrequency.MONTHLY,
      employeeIds,
      includePerformanceBonus = true,
      forceRecalculate = false,
      scheduleNext = false,
      createdBy,
      metadata
    } = options

    if (endDate < startDate) {
      throw new Error('End date must be after start date')
    }

    const existingBatch = await db.payrollBatch.findFirst({
      where: {
        period,
        status: { in: [PayrollStatus.PENDING, PayrollStatus.PROCESSED, PayrollStatus.APPROVED] }
      },
      include: {
        records: { select: { id: true } }
      }
    })

    if (existingBatch) {
      if (!forceRecalculate) {
        throw new Error('Payroll batch already exists for the requested period')
      }

      await db.$transaction([
        db.payrollRecord.updateMany({
          where: { batchId: existingBatch.id },
          data: { status: PayrollStatus.CANCELLED }
        }),
        db.payrollBatch.update({
          where: { id: existingBatch.id },
          data: {
            status: PayrollStatus.CANCELLED,
            metadata: {
              ...(existingBatch.metadata as Prisma.JsonObject | null) ?? {},
              cancelledAt: new Date().toISOString(),
              cancelledBy: createdBy,
              recalculatedTo: period
            } as Prisma.JsonObject
          }
        })
      ])
    }

    const employees = await db.employee.findMany({
      where: {
        status: EmployeeStatus.ACTIVE,
        ...(employeeIds ? { id: { in: employeeIds } } : {})
      },
      include: {
        attendanceRecords: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        performanceMetrics: {
          where: {
            period: this.toPerformancePeriod(frequency)
          },
          orderBy: { createdAt: 'desc' }
        },
        payrollAdjustments: {
          where: {
            OR: [
              { payrollRecordId: null },
              {
                effectiveDate: { lte: endDate },
                OR: [{ expiresAt: null }, { expiresAt: { gte: startDate } }]
              }
            ]
          }
        },
        department: { select: { id: true, name: true } },
        position: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    })

    if (employees.length === 0) {
      throw new Error('No employees matched the payroll criteria')
    }

    const recordPayloads = employees.map(employee => {
      const baseSalary = Number(employee.salary ?? 0)
      const attendance = this.calculateAttendanceImpact(employee.attendanceRecords ?? [], baseSalary, startDate, endDate)
      const adjustmentSummary = this.aggregateAdjustments(employee.payrollAdjustments ?? [], startDate, endDate)
      const performanceBonus = includePerformanceBonus
        ? this.calculatePerformanceBonus(employee.performanceMetrics?.[0], baseSalary)
        : 0

      const allowances = adjustmentSummary.allowanceTotal
      const overtime = attendance.overtime
      const bonus = adjustmentSummary.bonusTotal + performanceBonus
      const deductions = adjustmentSummary.deductionTotal + attendance.deductions
      const grossSalary = baseSalary + allowances + overtime + bonus
      const taxResult = this.calculateTax(grossSalary, adjustmentSummary.taxTotal)
      const netSalary = Math.max(grossSalary - taxResult.totalTax - deductions, 0)

      const calculation: Prisma.JsonObject = {
        baseSalary,
        allowances,
        overtime,
        performanceBonus,
        adjustments: adjustmentSummary.breakdown,
        attendance: {
          overtimeHours: attendance.overtimeHours,
          absenceDays: attendance.absenceDays,
          lateDays: attendance.lateDays
        },
        taxes: taxResult,
        deductions
      }

      return {
        data: {
          employeeId: employee.id,
          period,
          basicSalary: baseSalary,
          grossSalary,
          allowances,
          deductions,
          overtime,
          bonus,
          taxes: taxResult.totalTax,
          netSalary,
          status: PayrollStatus.PROCESSED,
          createdBy,
          calculation
        },
        adjustmentIds: adjustmentSummary.adjustmentIds
      }
    })

    const totals = this.aggregateBatchTotals(recordPayloads)
    const batchMetadata: Prisma.JsonValue | undefined = metadata
      ? (metadata as unknown as Prisma.JsonValue)
      : undefined

    const nextRunAt = scheduleNext ? this.calculateNextRun(endDate, frequency) : null
    const processedAt = new Date()

    const batch = await db.$transaction(async transaction => {
      const createdBatch = await transaction.payrollBatch.create({
        data: {
          period,
          startDate,
          endDate,
          frequency,
          status: PayrollStatus.PROCESSED,
          processedAt,
          nextRunAt,
          totalGross: totals.totalGross,
          totalNet: totals.totalNet,
          totalTax: totals.totalTax,
          totalDeductions: totals.totalDeductions,
          createdBy,
          metadata: batchMetadata,
          calculation: {
            totals,
            processedAt: processedAt.toISOString(),
            frequency
          } as Prisma.JsonValue
        }
      })

      const createdRecords = await Promise.all(
        recordPayloads.map(item =>
          transaction.payrollRecord.create({
            data: {
              employeeId: item.data.employeeId,
              batchId: createdBatch.id,
              period: item.data.period,
              basicSalary: item.data.basicSalary,
              grossSalary: item.data.grossSalary,
              allowances: item.data.allowances,
              deductions: item.data.deductions,
              overtime: item.data.overtime,
              bonus: item.data.bonus,
              taxes: item.data.taxes,
              netSalary: item.data.netSalary,
              status: item.data.status,
              createdBy: createdBy,
              calculation: item.data.calculation
            }
          })
        )
      )

      await Promise.all(
        createdRecords.map((record, index) => {
          const adjustmentIds = recordPayloads[index].adjustmentIds
          if (!adjustmentIds.length) {
            return Promise.resolve()
          }
          return transaction.payrollAdjustment.updateMany({
            where: { id: { in: adjustmentIds } },
            data: { payrollRecordId: record.id }
          })
        })
      )

      return createdBatch
    })

    const batchWithRelations = await db.payrollBatch.findUniqueOrThrow({
      where: { id: batch.id },
      include: payrollBatchInclude
    })

    this.events.emit('payroll:batch:processed', batchWithRelations)

    return batchWithRelations
  }

  async updateBatchStatus(input: BatchStatusUpdate): Promise<PayrollBatchWithDetails> {
    const { batchId, status, actorId, notes } = input

    const now = new Date()
    const recordUpdate: Prisma.PayrollRecordUpdateManyMutationInput = {
      status
    }

    if (status === PayrollStatus.APPROVED) {
      recordUpdate.approvedBy = actorId
      recordUpdate.approvedAt = now
    }

    if (status === PayrollStatus.PAID) {
      recordUpdate.payDate = now
      recordUpdate.status = PayrollStatus.PAID
    }

    const batchUpdate: Prisma.PayrollBatchUpdateInput = {
      status,
      updatedAt: now
    }

    if (status === PayrollStatus.APPROVED) {
      batchUpdate.approvedBy = actorId
      batchUpdate.approvedAt = now
    }

    if (status === PayrollStatus.PAID) {
      batchUpdate.paidAt = now
    }

    if (notes) {
      const metadataObject = await this.fetchBatchMetadata(batchId)
      const rawNotes = (metadataObject as { statusNotes?: unknown[] }).statusNotes
      const existingNotes = Array.isArray(rawNotes)
        ? [...rawNotes] as Record<string, unknown>[]
        : []
      batchUpdate.metadata = {
        ...metadataObject,
        statusNotes: [
          ...existingNotes,
          {
            status,
            notes,
            actorId,
            at: now.toISOString()
          }
        ]
      } as Prisma.JsonValue
    }

    const [, updatedBatch] = await db.$transaction([
      db.payrollRecord.updateMany({ where: { batchId }, data: recordUpdate }),
      db.payrollBatch.update({
        where: { id: batchId },
        data: batchUpdate,
        include: payrollBatchInclude
      })
    ])

    if (status === PayrollStatus.APPROVED) {
      this.events.emit('payroll:batch:approved', updatedBatch)
    } else if (status === PayrollStatus.PAID) {
      this.events.emit('payroll:batch:paid', updatedBatch)
    }

    return updatedBatch
  }

  on(
    event: 'payroll:batch:processed' | 'payroll:batch:approved' | 'payroll:batch:paid',
    listener: (batch: PayrollBatchWithDetails) => void
  ): void {
    this.events.on(event, listener)
  }

  off(
    event: 'payroll:batch:processed' | 'payroll:batch:approved' | 'payroll:batch:paid',
    listener: (batch: PayrollBatchWithDetails) => void
  ): void {
    this.events.off(event, listener)
  }

  private registerInternalHandlers(): void {
    this.events.on('payroll:batch:approved', batch => {
      void this.generateJournalEntries(batch)
    })

    this.events.on('payroll:batch:paid', batch => {
      void this.generatePaymentTransactions(batch)
    })
  }

  private calculateAttendanceImpact(
    records: EmployeeWithInputs['attendanceRecords'],
    baseSalary: number,
    startDate: Date,
    endDate: Date
  ): AttendanceSummary {
    if (!records || records.length === 0) {
      return { overtime: 0, overtimeHours: 0, deductions: 0, absenceDays: 0, lateDays: 0 }
    }

    const workingDays = Math.max(differenceInBusinessDays(endDate, startDate) + 1, 1)
    const dayRate = baseSalary / workingDays
    const hourlyRate = dayRate / 8

    let overtimeHours = 0
    let absenceDays = 0
    let lateDays = 0

    records.forEach(record => {
      if (record.status === AttendanceStatus.ABSENT) {
        absenceDays += 1
        return
      }

      if (record.status === AttendanceStatus.LATE) {
        lateDays += 1
      }

      if (record.checkIn && record.checkOut) {
        const minutesWorked = Math.max(differenceInMinutes(record.checkOut, record.checkIn), 0)
        const hoursWorked = minutesWorked / 60
        if (hoursWorked > 8) {
          overtimeHours += hoursWorked - 8
        }
      }
    })

    const overtime = overtimeHours * hourlyRate * 1.5
    const absencePenalty = absenceDays * dayRate
    const latePenalty = lateDays * dayRate * 0.25

    return {
      overtime,
      overtimeHours,
      deductions: absencePenalty + latePenalty,
      absenceDays,
      lateDays
    }
  }

  private aggregateAdjustments(
    adjustments: EmployeeWithInputs['payrollAdjustments'],
    startDate: Date,
    endDate: Date
  ): AdjustmentSummary {
    if (!adjustments || adjustments.length === 0) {
      return {
        allowanceTotal: 0,
        deductionTotal: 0,
        bonusTotal: 0,
        taxTotal: 0,
        adjustmentIds: [],
        breakdown: {}
      }
    }

    let allowanceTotal = 0
    let deductionTotal = 0
    let bonusTotal = 0
    let taxTotal = 0
    const adjustmentIds: string[] = []
    const breakdown: Record<string, number> = {}

    adjustments.forEach(adjustment => {
      if (adjustment.payrollRecordId) {
        return
      }

      const effectiveDate = adjustment.effectiveDate ?? startDate
      const rawExpiry = adjustment.expiresAt ?? endDate
      const rangeStart = rawExpiry >= effectiveDate ? effectiveDate : rawExpiry
      const rangeEnd = rawExpiry >= effectiveDate ? rawExpiry : effectiveDate

      if (rangeEnd < startDate || rangeStart > endDate) {
        return
      }

      adjustmentIds.push(adjustment.id)
      breakdown[adjustment.type] = (breakdown[adjustment.type] ?? 0) + Number(adjustment.amount)

      switch (adjustment.type) {
        case PayrollAdjustmentType.BONUS:
          bonusTotal += Number(adjustment.amount)
          break
        case PayrollAdjustmentType.ALLOWANCE:
        case PayrollAdjustmentType.REIMBURSEMENT:
          allowanceTotal += Number(adjustment.amount)
          break
        case PayrollAdjustmentType.DEDUCTION:
        case PayrollAdjustmentType.PENALTY:
          deductionTotal += Math.abs(Number(adjustment.amount))
          break
        case PayrollAdjustmentType.TAX:
          taxTotal += Math.abs(Number(adjustment.amount))
          break
        default:
          if (Number(adjustment.amount) >= 0) {
            allowanceTotal += Number(adjustment.amount)
          } else {
            deductionTotal += Math.abs(Number(adjustment.amount))
          }
      }
    })

    return {
      allowanceTotal,
      deductionTotal,
      bonusTotal,
      taxTotal,
      adjustmentIds,
      breakdown
    }
  }

  private calculatePerformanceBonus(metric: EmployeeWithInputs['performanceMetrics'][number] | undefined, baseSalary: number): number {
    if (!metric || baseSalary <= 0) {
      return 0
    }

    let bonus = 0

    if (metric.customerSatisfaction >= 90) {
      bonus += baseSalary * 0.07
    } else if (metric.customerSatisfaction >= 80) {
      bonus += baseSalary * 0.04
    }

    if (metric.conversionRate >= 0.3) {
      bonus += baseSalary * 0.03
    } else if (metric.conversionRate >= 0.2) {
      bonus += baseSalary * 0.015
    }

    if (metric.revenueGenerated > baseSalary * 3) {
      bonus += baseSalary * 0.05
    }

    return Math.min(bonus, baseSalary * 0.2)
  }

  private calculateTax(grossSalary: number, manualTaxAdjustments: number): { totalTax: number; effectiveRate: number } {
    if (grossSalary <= 0) {
      return { totalTax: manualTaxAdjustments, effectiveRate: 0 }
    }

    let remaining = grossSalary
    let tax = 0

    const brackets = [
      { limit: 10000, rate: 0.05 },
      { limit: 10000, rate: 0.1 },
      { limit: 15000, rate: 0.15 },
      { limit: Number.POSITIVE_INFINITY, rate: 0.2 }
    ]

    for (const bracket of brackets) {
      if (remaining <= 0) {
        break
      }
      const taxable = Math.min(remaining, bracket.limit)
      tax += taxable * bracket.rate
      remaining -= taxable
    }

    tax += manualTaxAdjustments
    const effectiveRate = tax / grossSalary

    return {
      totalTax: Math.max(tax, 0),
      effectiveRate: Number.isFinite(effectiveRate) ? effectiveRate : 0
    }
  }

  private aggregateBatchTotals(records: Array<{ data: { grossSalary: number; netSalary: number; taxes: number; deductions: number } }>): BatchTotals {
    return records.reduce<BatchTotals>(
      (acc, item) => ({
        totalGross: acc.totalGross + item.data.grossSalary,
        totalNet: acc.totalNet + item.data.netSalary,
        totalTax: acc.totalTax + item.data.taxes,
        totalDeductions: acc.totalDeductions + item.data.deductions
      }),
      { totalGross: 0, totalNet: 0, totalTax: 0, totalDeductions: 0 }
    )
  }

  private calculateNextRun(endDate: Date, frequency: PayrollBatchFrequency): Date {
    switch (frequency) {
      case PayrollBatchFrequency.WEEKLY:
        return addWeeks(endDate, 1)
      case PayrollBatchFrequency.BIWEEKLY:
        return addWeeks(endDate, 2)
      case PayrollBatchFrequency.CUSTOM:
        return addDays(endDate, 30)
      case PayrollBatchFrequency.MONTHLY:
      default:
        return addMonths(endDate, 1)
    }
  }

  private toPerformancePeriod(frequency: PayrollBatchFrequency): PerformancePeriod {
    switch (frequency) {
      case PayrollBatchFrequency.WEEKLY:
        return PerformancePeriod.WEEKLY
      case PayrollBatchFrequency.BIWEEKLY:
        return PerformancePeriod.WEEKLY
      case PayrollBatchFrequency.CUSTOM:
        return PerformancePeriod.MONTHLY
      case PayrollBatchFrequency.MONTHLY:
      default:
        return PerformancePeriod.MONTHLY
    }
  }

  private async fetchBatchMetadata(batchId: string): Promise<Prisma.JsonObject> {
    const batch = await db.payrollBatch.findUnique({
      where: { id: batchId },
      select: { metadata: true }
    })

    return ((batch?.metadata as Prisma.JsonObject | null) ?? {}) as Prisma.JsonObject
  }

  private async generateJournalEntries(batch: PayrollBatchWithDetails): Promise<void> {
    try {
      const totals = batch.calculation as Prisma.JsonObject | null
      const totalGross = Number((totals?.totals as any)?.totalGross ?? batch.totalGross ?? 0)
      const totalTax = Number((totals?.totals as any)?.totalTax ?? batch.totalTax ?? 0)
      const totalDeductions = Number((totals?.totals as any)?.totalDeductions ?? batch.totalDeductions ?? 0)
      const totalNet = Number((totals?.totals as any)?.totalNet ?? batch.totalNet ?? 0)

      const payrollExpenseAccount = await this.ensureAccount('6000-PAYROLL', 'Payroll Expense', AccountType.EXPENSE, BalanceType.DEBIT)
      const payrollLiabilityAccount = await this.ensureAccount('2100-PAYROLL-LIAB', 'Payroll Liability', AccountType.LIABILITY, BalanceType.CREDIT)
      const payrollTaxAccount = await this.ensureAccount('2105-PAYROLL-TAX', 'Payroll Tax Payable', AccountType.LIABILITY, BalanceType.CREDIT)
      const payrollDeductionAccount = await this.ensureAccount('2110-PAYROLL-DEDUCTIONS', 'Payroll Deductions Payable', AccountType.LIABILITY, BalanceType.CREDIT)

      const entryNumber = generateReferenceNumber('PAYRL')
      const description = `Payroll batch ${batch.period} approval`

      const entry = await db.journalEntry.create({
        data: {
          entryNumber,
          date: new Date(),
          description,
          totalDebit: totalGross,
          totalCredit: totalGross,
          status: EntryStatus.POSTED,
          createdBy: batch.createdBy
        }
      })

      await db.journalEntryItem.createMany({
        data: [
          {
            entryId: entry.id,
            accountId: payrollExpenseAccount.id,
            description: 'Payroll expense',
            debit: totalGross,
            credit: 0
          },
          {
            entryId: entry.id,
            accountId: payrollTaxAccount.id,
            description: 'Payroll taxes payable',
            debit: 0,
            credit: totalTax
          },
          {
            entryId: entry.id,
            accountId: payrollDeductionAccount.id,
            description: 'Payroll deductions payable',
            debit: 0,
            credit: totalDeductions
          },
          {
            entryId: entry.id,
            accountId: payrollLiabilityAccount.id,
            description: 'Net payroll payable',
            debit: 0,
            credit: totalNet
          }
        ]
      })

      await db.payrollBatch.update({
        where: { id: batch.id },
        data: {
          calculation: {
            ...(batch.calculation as Prisma.JsonObject | null) ?? {},
            journalEntryId: entry.id
          } as Prisma.JsonValue
        }
      })
    } catch (error) {
      console.error('Failed to generate payroll journal entry', error)
    }
  }

  private async generatePaymentTransactions(batch: PayrollBatchWithDetails): Promise<void> {
    try {
      const existing = await db.transaction.findFirst({
        where: {
          metadata: {
            path: ['batchId'],
            equals: batch.id
          }
        }
      })

      if (existing) {
        return
      }

      const records = await db.payrollRecord.findMany({
        where: { batchId: batch.id },
        include: {
          employee: {
            include: {
              user: { select: { id: true } }
            }
          }
        }
      })

      await Promise.all(
        records.map(record =>
          db.transaction.create({
            data: {
              referenceId: generateReferenceNumber('TXN'),
              branchId: null,
              type: 'EXPENSE',
              category: 'PAYROLL',
              amount: record.netSalary,
              currency: 'EGP',
              description: `Payroll payment for ${record.period}`,
              date: new Date(),
              paymentMethod: PaymentMethod.BANK_TRANSFER,
              customerId: record.employee?.userId ?? null,
              metadata: {
                payrollRecordId: record.id,
                batchId: batch.id
              }
            }
          })
        )
      )
    } catch (error) {
      console.error('Failed to generate payroll payment transactions', error)
    }
  }

  private async ensureAccount(code: string, name: string, type: AccountType, balance: BalanceType) {
    return db.chartOfAccount.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name,
        type,
        normalBalance: balance
      }
    })
  }
}

export const payrollProcessor = PayrollProcessor.getInstance()
