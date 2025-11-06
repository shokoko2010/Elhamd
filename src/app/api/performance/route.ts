import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PerformancePeriod, Prisma } from '@prisma/client'

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
  try {
    const { searchParams } = new URL(request.url)
    const filter = resolvePeriodFilter(searchParams.get('period'))

    let performanceMetrics: any[] = []
    let schemaMissing = false

    try {
      performanceMetrics = await db.performanceMetric.findMany({
        where: {
          ...(filter.periodType ? { period: filter.periodType } : {}),
          ...(filter.createdAtRange ? { createdAt: filter.createdAtRange } : {}),
        },
        include: {
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
              }
            }
          }
        },
        orderBy: {
          overallScore: 'desc'
        }
      })
    } catch (error) {
      if (isSchemaMissingError(error)) {
        schemaMissing = true
      } else {
        throw error
      }
    }

    if (schemaMissing) {
      return NextResponse.json({
        success: true,
        data: [],
        period: filter.label,
        periodType: filter.periodType,
        count: 0,
        warning: 'performance-metrics-unavailable'
      })
    }

    const normalizedMetrics = performanceMetrics.map((metric) => ({
      ...metric,
      period: filter.label,
      employee: {
        ...metric.employee,
        department: metric.employee?.department?.name ?? 'غير محدد',
        position: metric.employee?.position?.title ?? 'غير محدد',
      },
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
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات تقييم الأداء' },
      { status: 500 }
    )
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

    const createdAt = filter.createdAtRange?.gte ?? new Date()

    const employees = await db.employee.findMany({
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
        }
      }
    })

    // Create sample performance metrics for each employee
    for (const employee of employees) {
      await db.performanceMetric.upsert({
        where: {
          employeeId_period: {
            employeeId: employee.id,
            period: periodType
          }
        },
        update: {
          bookingsHandled: Math.floor(Math.random() * 50) + 10,
          averageHandlingTime: Math.random() * 30 + 15,
          customerRating: 3 + Math.random() * 2,
          conversionRate: Math.random() * 40 + 10,
          revenueGenerated: Math.random() * 50000 + 10000,
          tasksCompleted: Math.floor(Math.random() * 30) + 20,
          customerSatisfaction: 80 + Math.random() * 20,
          responseTime: Math.random() * 60 + 5,
          followUpRate: Math.random() * 30 + 60,
          upsellSuccess: Math.random() * 25 + 5,
          overallScore: 70 + Math.random() * 30,
          notes: 'تقييم أداء تلقائي'
        },
        create: {
          employeeId: employee.id,
          period: periodType,
          bookingsHandled: Math.floor(Math.random() * 50) + 10,
          averageHandlingTime: Math.random() * 30 + 15,
          customerRating: 3 + Math.random() * 2,
          conversionRate: Math.random() * 40 + 10,
          revenueGenerated: Math.random() * 50000 + 10000,
          tasksCompleted: Math.floor(Math.random() * 30) + 20,
          customerSatisfaction: 80 + Math.random() * 20,
          responseTime: Math.random() * 60 + 5,
          followUpRate: Math.random() * 30 + 60,
          upsellSuccess: Math.random() * 25 + 5,
          overallScore: 70 + Math.random() * 30,
          notes: 'تقييم أداء تلقائي',
          createdAt,
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء بيانات تقييم الأداء بنجاح',
      metricsCount: employees.length,
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