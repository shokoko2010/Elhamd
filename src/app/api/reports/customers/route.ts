interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authenticateProductionUser, executeWithRetry } from '@/lib/auth-server'
import { db } from '@/lib/db'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  addMonths,
  format,
} from 'date-fns'
import { Prisma } from '@prisma/client'

const isSchemaMissingError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ['P2021', 'P2022', 'P2023'].includes(error.code)
  }

  return error instanceof Error && error.message.toLowerCase().includes('does not exist')
}

const safeExecute = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await executeWithRetry(operation)
  } catch (error) {
    if (isSchemaMissingError(error)) {
      return fallback
    }

    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    }

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers })
    }

    const user = await authenticateProductionUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const branchId = searchParams.get('branchId')

    let startDate: Date
    let endDate: Date
    let monthsToShow = 12

    const now = new Date()

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        monthsToShow = 1
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 })
        endDate = endOfWeek(now, { weekStartsOn: 0 })
        monthsToShow = 3
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        monthsToShow = 12
        break
      case 'quarter':
        const currentMonth = now.getMonth()
        const quarterStart = Math.floor(currentMonth / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        monthsToShow = 12
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        monthsToShow = 24
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        monthsToShow = 12
    }

    const branchFilter = branchId && branchId !== 'all' ? branchId : null
    const customerBranchConditions = branchFilter
      ? [
          { user: { branchId: branchFilter } },
          { invoices: { some: { branchId: branchFilter } } },
        ]
      : []

    const withCustomerBranchFilter = (
      whereInput: Prisma.CustomerProfileWhereInput
    ): Prisma.CustomerProfileWhereInput => {
      if (!customerBranchConditions.length) {
        return whereInput
      }

      const existingAnd = Array.isArray(whereInput.AND)
        ? whereInput.AND
        : whereInput.AND
        ? [whereInput.AND]
        : []

      return {
        ...whereInput,
        AND: [
          ...existingAnd,
          {
            OR: customerBranchConditions,
          },
        ],
      }
    }

    const invoiceBranchFilter = branchFilter ? { branchId: branchFilter } : {}
    const leadBaseWhere: Prisma.LeadWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(branchFilter ? { branchId: branchFilter } : {}),
    }

    const customerMetrics: Array<{
      month: string
      newCustomers: number
      totalCustomers: number
      retention: number
    }> = []

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = addMonths(startDate, -i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      const monthCustomerWhere = withCustomerBranchFilter({
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      })

      const [newCustomersCount, totalCustomersAtEnd, activeCustomers] = await Promise.all([
        safeExecute(
          () =>
            db.customerProfile.count({
              where: monthCustomerWhere,
            }),
          0
        ),
        safeExecute(
          () =>
            db.customerProfile.count({
              where: withCustomerBranchFilter({
                createdAt: {
                  lte: monthEnd,
                },
              }),
            }),
          0
        ),
        safeExecute(
          () =>
            db.customerProfile.count({
              where: withCustomerBranchFilter({
                createdAt: {
                  lte: monthEnd,
                },
                OR: [
                  {
                    invoices: {
                      some: {
                        createdAt: {
                          gte: subDays(monthEnd, 90),
                        },
                        ...invoiceBranchFilter,
                      },
                    },
                  },
                  {
                    serviceBookings: {
                      some: {
                        createdAt: {
                          gte: subDays(monthEnd, 90),
                        },
                      },
                    },
                  },
                ],
              }),
            }),
          0
        ),
      ])

      const retention = totalCustomersAtEnd > 0 ? (activeCustomers / totalCustomersAtEnd) * 100 : 0

      customerMetrics.push({
        month: format(monthDate, 'MMM yyyy', { locale: { code: 'ar' } }),
        newCustomers: newCustomersCount,
        totalCustomers: totalCustomersAtEnd,
        retention: Math.round(retention * 100) / 100,
      })
    }

    const currentPeriodCustomerWhere = withCustomerBranchFilter({
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    })

    const [
      customerSegments,
      topCustomers,
      customerAcquisition,
      customerLifetimeValue,
      churnRate,
    ] = await Promise.all([
      safeExecute(
        () =>
          db.customerProfile.groupBy({
            by: ['segment'],
            where: currentPeriodCustomerWhere,
            _count: {
              _all: true,
            },
          }),
        [] as Array<{ segment: string | null; _count: { _all: number } }>
      ),
      safeExecute(
        () =>
          db.customerProfile.findMany({
            where: currentPeriodCustomerWhere,
            include: {
              user: {
                select: {
                  email: true,
                  phone: true,
                  name: true,
                },
              },
              invoices: {
                where: {
                  status: 'PAID',
                  ...invoiceBranchFilter,
                },
                select: {
                  totalAmount: true,
                },
              },
            },
            orderBy: {
              invoices: {
                _sum: {
                  totalAmount: 'desc',
                },
              },
            },
            take: 10,
          }),
        [] as Array<{
          id: string
          user: { email: string | null; phone: string | null; name: string | null } | null
          invoices: Array<{ totalAmount: number }>
        }>
      ),
      safeExecute(
        () =>
          db.lead.groupBy({
            by: ['source'],
            where: {
              ...leadBaseWhere,
              status: 'CLOSED_WON',
            },
            _count: {
              _all: true,
            },
          }),
        [] as Array<{ source: string | null; _count: { _all: number } }>
      ),
      safeExecute(
        () =>
          db.customerProfile.findMany({
            where: currentPeriodCustomerWhere,
            include: {
              invoices: {
                where: {
                  status: 'PAID',
                  ...invoiceBranchFilter,
                },
                select: {
                  totalAmount: true,
                  createdAt: true,
                },
              },
            },
          }),
        [] as Array<{
          id: string
          invoices: Array<{ totalAmount: number; createdAt: Date }>
        }>
      ),
      Promise.all([
        safeExecute(
          () =>
            db.customerProfile.count({
              where: withCustomerBranchFilter({
                createdAt: {
                  lte: subDays(startDate, 1),
                },
              }),
            }),
          0
        ),
        safeExecute(
          () =>
            db.customerProfile.count({
              where: withCustomerBranchFilter({
                createdAt: {
                  lte: subDays(startDate, 1),
                },
                AND: [
                  {
                    invoices: {
                      none: {
                        createdAt: {
                          gte: startDate,
                        },
                        ...invoiceBranchFilter,
                      },
                    },
                  },
                  {
                    serviceBookings: {
                      none: {
                        createdAt: {
                          gte: startDate,
                        },
                      },
                    },
                  },
                ],
              }),
            }),
          0
        ),
      ]),
    ])

    const customerLifetimeValueData = customerLifetimeValue.map(customer => {
      const totalSpent = customer.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const firstPurchase = customer.invoices.length > 0 ? Math.min(...customer.invoices.map(i => new Date(i.createdAt).getTime())) : 0
      const customerAge = firstPurchase > 0 ? (now.getTime() - firstPurchase) / (1000 * 60 * 60 * 24 * 365) : 0

      return {
        id: customer.id,
        totalSpent,
        customerAge: Math.round(customerAge * 100) / 100,
        lifetimeValue: customerAge > 0 ? totalSpent / customerAge : 0,
      }
    })

    const [customersAtStart, churnedCustomers] = churnRate
    const churnRateValue = customersAtStart > 0 ? (churnedCustomers / customersAtStart) * 100 : 0

    const topCustomersWithRevenue = topCustomers.map(customer => {
      const totalRevenue = customer.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      return {
        id: customer.id,
        name: customer.user?.name,
        email: customer.user?.email,
        phone: customer.user?.phone,
        revenue: totalRevenue,
        invoiceCount: customer.invoices.length,
      }
    })

    const customerReport = {
      metrics: customerMetrics,
      segments: customerSegments,
      topCustomers: topCustomersWithRevenue,
      acquisitionSources: customerAcquisition,
      customerLifetimeValue: customerLifetimeValueData
        .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
        .slice(0, 10),
      churnRate: Math.round(churnRateValue * 100) / 100,
      period: {
        start: startDate,
        end: endDate,
        type: period,
      },
    }

    return NextResponse.json(customerReport, { headers })
  } catch (error) {
    console.error('Error fetching customer report:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      }
    )
  }
}
