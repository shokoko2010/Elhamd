import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PerformancePeriod, Prisma } from '@prisma/client'
import { updateEmployeePerformanceMetrics } from '@/lib/performance-metric-sync'

const PERIOD_TYPES: PerformancePeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']

const isPerformancePeriod = (value: string | null): value is PerformancePeriod =>
  !!value && PERIOD_TYPES.includes(value as PerformancePeriod)

interface PeriodFilter {
  periodType: PerformancePeriod | null
  label: string
  createdAtRange?: { gte: Date; lt: Date }
}

const resolvePeriodFilter = (rawPeriod: string | null): PeriodFilter => {
  if (isPerformancePeriod(rawPeriod)) {
    return {
      periodType: rawPeriod,
      label: rawPeriod,
    }
  }

  if (rawPeriod && /^\d{4}-(0[1-9]|1[0-2])$/.test(rawPeriod)) {
    const start = new Date(`${rawPeriod}-01T00:00:00.000Z`)
    if (!Number.isNaN(start.getTime())) {
      const endExclusive = new Date(start)
      endExclusive.setMonth(endExclusive.getMonth() + 1)
      return {
        periodType: 'MONTHLY',
        label: rawPeriod,
        createdAtRange: {
          gte: start,
          lt: endExclusive,
        },
      }
    }
  }

  const now = new Date()
  const label = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return {
    periodType: 'MONTHLY',
    label,
    createdAtRange: {
      gte: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)),
      lt: new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)),
    },
  }
}

const isSchemaMissingError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ['P2021', 'P2022', 'P2023'].includes(error.code)
  }

  return error instanceof Error && error.message.toLowerCase().includes('does not exist')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filter = resolvePeriodFilter(searchParams.get('period'))

  try {
    const employees = await db.employee.findMany({ select: { id: true } })

    if (employees.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        period: filter.label,
        periodType: filter.periodType,
        count: 0,
      })
    }

    const metricsResults = await Promise.all(
      employees.map((employee) =>
        updateEmployeePerformanceMetrics({
          employeeId: employee.id,
          periodType: filter.periodType ?? PerformancePeriod.MONTHLY,
          periodLabel: filter.label,
          rangeOverride: filter.createdAtRange
            ? { start: filter.createdAtRange.gte, end: filter.createdAtRange.lt }
            : undefined,
        }),
      ),
    )

    const normalizedMetrics = metricsResults
      .filter((result): result is NonNullable<typeof result> => Boolean(result))
      .map((result) => ({
        ...result.record,
        period: filter.label,
        employee: {
          ...result.record.employee,
          department: result.record.employee?.department?.name ?? 'غير محدد',
          position: result.record.employee?.position?.title ?? 'غير محدد',
        },
        attendanceSummary: result.metadata.attendance,
        invoiceSummary: result.metadata.invoices,
        conversionSummary: result.metadata.conversions,
        scoringSummary: result.metadata.scoring,
      }))

    return NextResponse.json({
      success: true,
      data: normalizedMetrics,
      period: filter.label,
      periodType: filter.periodType,
      count: normalizedMetrics.length,
    })
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json({
      success: true,
      data: [],
      period: filter.label,
      periodType: filter.periodType,
      count: 0,
      warning: 'performance-metrics-error',
      error: 'حدث خطأ أثناء جلب بيانات تقييم الأداء'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const rawPeriod = typeof body?.period === 'string' ? (body.period as string) : null
    const bodyPeriodType =
      typeof body?.periodType === 'string' ? (body.periodType as string).toUpperCase() : null

    const filter = resolvePeriodFilter(rawPeriod)
    const periodType: PerformancePeriod = isPerformancePeriod(bodyPeriodType)
      ? (bodyPeriodType as PerformancePeriod)
      : filter.periodType ?? 'MONTHLY'

    const employees = await db.employee.findMany({ select: { id: true } })

    const metricsResults = await Promise.all(
      employees.map((employee) =>
        updateEmployeePerformanceMetrics({
          employeeId: employee.id,
          periodType,
          periodLabel: filter.label,
          rangeOverride: filter.createdAtRange
            ? { start: filter.createdAtRange.gte, end: filter.createdAtRange.lt }
            : undefined,
        }),
      ),
    )

    const createdCount = metricsResults.filter(Boolean).length

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات تقييم الأداء بناءً على النشاط الفعلي',
      metricsCount: createdCount,
      period: filter.label,
      periodType,
    })
  } catch (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({
        success: false,
        warning: 'performance-metrics-unavailable',
        message: 'جدول تقييم الأداء غير متاح في قاعدة البيانات الحالية'
      })
    }

    console.error('Error creating performance data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء بيانات تقييم الأداء' },
      { status: 500 }
    )
  }
}