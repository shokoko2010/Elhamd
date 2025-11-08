import { db } from '@/lib/db'
import {
  AttendanceStatus,
  InvoicePaymentStatus,
  InvoiceStatus,
  PerformancePeriod,
  Prisma,
} from '@prisma/client'
import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns'

export interface PerformanceSyncMetadata {
  attendance: {
    presentDays: number
    lateDays: number
    absentDays: number
    excusedDays: number
    attendanceScore: number
    trackedDays: number
  }
  invoices: {
    created: number
    paid: number
    partiallyPaid: number
    draft: number
    revenue: number
    collected: number
    outstanding: number
    averageValue: number
  }
  conversions: {
    conversionRate: number
    followUpRate: number
  }
  scoring: {
    attendanceScore: number
    invoiceVolumeScore: number
    revenueScore: number
    paymentScore: number
    overallScore: number
  }
  period: {
    type: PerformancePeriod
    label: string
    range: { start: string; end: string }
  }
}

export type PerformanceMetricWithEmployee = Prisma.PerformanceMetricGetPayload<{
  include: {
    employee: {
      include: {
        user: {
          select: {
            id: true
            name: true
            email: true
          }
        }
        department: {
          select: {
            id: true
            name: true
          }
        }
        position: {
          select: {
            id: true
            title: true
          }
        }
      }
    }
  }
}>

export interface PerformanceSyncResult {
  record: PerformanceMetricWithEmployee
  metadata: PerformanceSyncMetadata
}

interface PeriodResolutionOptions {
  periodType: PerformancePeriod
  referenceDate: Date
  periodLabel?: string
  rangeOverride?: { start: Date; end: Date }
}

const TARGET_INVOICES = 25
const TARGET_REVENUE = 250_000

const presentStatuses = new Set<AttendanceStatus>([AttendanceStatus.PRESENT])
const lateStatuses = new Set<AttendanceStatus>([AttendanceStatus.LATE])
const excusedStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.ON_LEAVE,
  AttendanceStatus.SICK_LEAVE,
  AttendanceStatus.VACATION,
])
const absentStatuses = new Set<AttendanceStatus>([AttendanceStatus.ABSENT])

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function resolvePeriodRange({
  periodType,
  referenceDate,
  periodLabel,
  rangeOverride,
}: PeriodResolutionOptions) {
  if (rangeOverride) {
    const start = new Date(rangeOverride.start)
    const end = new Date(rangeOverride.end)
    return {
      start,
      end,
      label: periodLabel ?? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    }
  }

  const reference = startOfDay(referenceDate)

  switch (periodType) {
    case PerformancePeriod.DAILY: {
      const end = addDays(reference, 1)
      return {
        start: reference,
        end,
        label: periodLabel ?? reference.toISOString().slice(0, 10),
      }
    }
    case PerformancePeriod.WEEKLY: {
      const start = startOfWeek(reference, { weekStartsOn: 6 }) // Saturday-based week
      const end = addWeeks(start, 1)
      const label = periodLabel ?? `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`
      return { start, end, label }
    }
    case PerformancePeriod.QUARTERLY: {
      const start = startOfQuarter(reference)
      const end = addQuarters(start, 1)
      const label =
        periodLabel ?? `${start.getFullYear()}-Q${Math.floor(start.getMonth() / 3) + 1}`
      return { start, end, label }
    }
    case PerformancePeriod.YEARLY: {
      const start = startOfYear(reference)
      const end = addYears(start, 1)
      return { start, end, label: periodLabel ?? `${start.getFullYear()}` }
    }
    case PerformancePeriod.MONTHLY:
    default: {
      const start = startOfMonth(reference)
      const end = addMonths(start, 1)
      const label = periodLabel ?? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
      return { start, end, label }
    }
  }
}

function buildMetadata(params: {
  attendanceScore: number
  presentDays: number
  lateDays: number
  absentDays: number
  excusedDays: number
  trackedDays: number
  invoicesCreated: number
  paidInvoices: number
  partiallyPaidInvoices: number
  draftInvoices: number
  revenueGenerated: number
  revenueCollected: number
  outstandingRevenue: number
  averageInvoiceValue: number
  conversionRate: number
  followUpRate: number
  invoiceVolumeScore: number
  revenueScore: number
  paymentScore: number
  overallScore: number
  period: { type: PerformancePeriod; label: string; start: Date; end: Date }
}): PerformanceSyncMetadata {
  const metadata: PerformanceSyncMetadata = {
    attendance: {
      presentDays: params.presentDays,
      lateDays: params.lateDays,
      absentDays: params.absentDays,
      excusedDays: params.excusedDays,
      attendanceScore: params.attendanceScore,
      trackedDays: params.trackedDays,
    },
    invoices: {
      created: params.invoicesCreated,
      paid: params.paidInvoices,
      partiallyPaid: params.partiallyPaidInvoices,
      draft: params.draftInvoices,
      revenue: Number(params.revenueGenerated.toFixed(2)),
      collected: Number(params.revenueCollected.toFixed(2)),
      outstanding: Number(params.outstandingRevenue.toFixed(2)),
      averageValue: Number(params.averageInvoiceValue.toFixed(2)),
    },
    conversions: {
      conversionRate: params.conversionRate,
      followUpRate: params.followUpRate,
    },
    scoring: {
      attendanceScore: params.attendanceScore,
      invoiceVolumeScore: params.invoiceVolumeScore,
      revenueScore: params.revenueScore,
      paymentScore: params.paymentScore,
      overallScore: params.overallScore,
    },
    period: {
      type: params.period.type,
      label: params.period.label,
      range: {
        start: params.period.start.toISOString(),
        end: params.period.end.toISOString(),
      },
    },
  }

  return metadata
}

export async function updateEmployeePerformanceMetrics(options: {
  employeeId: string
  periodType?: PerformancePeriod
  referenceDate?: Date
  periodLabel?: string
  rangeOverride?: { start: Date; end: Date }
}): Promise<PerformanceSyncResult | null> {
  const periodType = options.periodType ?? PerformancePeriod.MONTHLY
  const referenceDate = options.referenceDate ?? new Date()

  const employee = await db.employee.findUnique({
    where: { id: options.employeeId },
  })

  if (!employee) {
    return null
  }

  const period = resolvePeriodRange({
    periodType,
    referenceDate,
    periodLabel: options.periodLabel,
    rangeOverride: options.rangeOverride,
  })

  const invoices = await db.invoice.findMany({
    where: {
      createdByEmployeeId: employee.id,
      isDeleted: false,
      issueDate: {
        gte: period.start,
        lt: period.end,
      },
    },
    select: {
      totalAmount: true,
      paidAmount: true,
      paymentStatus: true,
      status: true,
      issueDate: true,
      dueDate: true,
    },
  })

  const attendanceRecords = await db.attendanceRecord.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: period.start,
        lt: period.end,
      },
    },
    select: {
      status: true,
    },
  })

  const invoicesCreated = invoices.length
  const paidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === InvoicePaymentStatus.PAID,
  ).length
  const partiallyPaidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === InvoicePaymentStatus.PARTIALLY_PAID,
  ).length
  const draftInvoices = invoices.filter((invoice) => invoice.status === InvoiceStatus.DRAFT).length

  const revenueGenerated = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount ?? 0), 0)
  const revenueCollected = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount ?? 0), 0)
  const outstandingRevenue = Math.max(0, revenueGenerated - revenueCollected)
  const averageInvoiceValue = invoicesCreated > 0 ? revenueGenerated / invoicesCreated : 0

  const conversionRate = invoicesCreated > 0 ? Math.round((paidInvoices / invoicesCreated) * 100) : 0
  const followUpRate =
    invoicesCreated > 0
      ? Math.round(((paidInvoices + partiallyPaidInvoices) / invoicesCreated) * 100)
      : 0

  const presentDays = attendanceRecords.filter((record) => presentStatuses.has(record.status)).length
  const lateDays = attendanceRecords.filter((record) => lateStatuses.has(record.status)).length
  const excusedDays = attendanceRecords.filter((record) => excusedStatuses.has(record.status)).length
  const absentDays = attendanceRecords.filter((record) => absentStatuses.has(record.status)).length
  const trackedDays = attendanceRecords.length

  const attendanceScore = trackedDays
    ? Math.round(
        clamp(
          ((presentDays + excusedDays * 0.75 + lateDays * 0.5) / trackedDays) * 100,
          0,
          100,
        ),
      )
    : 0

  const averageCycleHours = invoicesCreated
    ? invoices.reduce((sum, invoice) => {
        if (!invoice.dueDate || !invoice.issueDate) {
          return sum
        }
        const diffMs = invoice.dueDate.getTime() - invoice.issueDate.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        if (!Number.isFinite(diffHours) || diffHours < 0) {
          return sum
        }
        return sum + diffHours
      }, 0) / invoicesCreated
    : 0

  const averageHandlingTime = Number(averageCycleHours.toFixed(2))
  const responseTime = Math.round(clamp(averageCycleHours * 60, 5, 480))

  const invoiceVolumeScore = clamp((invoicesCreated / TARGET_INVOICES) * 100, 0, 100)
  const revenueScore = clamp((revenueGenerated / TARGET_REVENUE) * 100, 0, 100)
  const paymentScore = outstandingRevenue > 0 ? clamp((revenueCollected / revenueGenerated) * 100, 0, 100) : 100

  const overallScore = Math.round(
    attendanceScore * 0.35 +
      conversionRate * 0.2 +
      invoiceVolumeScore * 0.2 +
      revenueScore * 0.2 +
      paymentScore * 0.05,
  )

  const customerRating = Number(
    clamp((attendanceScore / 20 + conversionRate / 25) / 2, 0, 5).toFixed(1),
  )

  const metadata = buildMetadata({
    attendanceScore,
    presentDays,
    lateDays,
    absentDays,
    excusedDays,
    trackedDays,
    invoicesCreated,
    paidInvoices,
    partiallyPaidInvoices,
    draftInvoices,
    revenueGenerated,
    revenueCollected,
    outstandingRevenue,
    averageInvoiceValue,
    conversionRate,
    followUpRate,
    invoiceVolumeScore,
    revenueScore,
    paymentScore,
    overallScore,
    period: { type: periodType, label: period.label, start: period.start, end: period.end },
  })

  const persisted = await db.performanceMetric.upsert({
    where: {
      employeeId_period_periodLabel: {
        employeeId: employee.id,
        period: periodType,
        periodLabel: period.label,
      },
    },
    update: {
      bookingsHandled: invoicesCreated,
      averageHandlingTime,
      customerRating,
      conversionRate,
      revenueGenerated,
      tasksCompleted: presentDays + excusedDays,
      customerSatisfaction: attendanceScore,
      responseTime,
      followUpRate,
      upsellSuccess: clamp((averageInvoiceValue / TARGET_REVENUE) * 100 * 4, 0, 100),
      overallScore,
      metricsMetadata: metadata as Prisma.JsonObject,
      notes: 'تم التحديث تلقائياً بناءً على الفواتير والحضور',
    },
    create: {
      employeeId: employee.id,
      period: periodType,
      periodLabel: period.label,
      bookingsHandled: invoicesCreated,
      averageHandlingTime,
      customerRating,
      conversionRate,
      revenueGenerated,
      tasksCompleted: presentDays + excusedDays,
      customerSatisfaction: attendanceScore,
      responseTime,
      followUpRate,
      upsellSuccess: clamp((averageInvoiceValue / TARGET_REVENUE) * 100 * 4, 0, 100),
      overallScore,
      metricsMetadata: metadata as Prisma.JsonObject,
      notes: 'تم إنشاء السجل تلقائياً بناءً على بيانات الفترة',
    },
    include: {
      employee: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          position: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  })

  return {
    record: persisted,
    metadata,
  }
}
