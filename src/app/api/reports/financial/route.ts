interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authenticateProductionUser, executeWithRetry } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, format } from 'date-fns'
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
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers });
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

    const where: any = {}

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    // Generate monthly financial metrics
    const financialMetrics = []
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = addMonths(startDate, -i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthWhere = {
        ...where,
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }

      const [
        revenueData,
        expensesData
      ] = await Promise.all([
        safeExecute(
          () =>
            db.invoice.aggregate({
              where: {
                ...monthWhere,
                status: 'PAID'
              },
              _sum: {
                totalAmount: true
              }
            }),
          { _sum: { totalAmount: 0 } }
        ),
        safeExecute(
          () =>
            db.transaction.aggregate({
              where: {
                ...monthWhere,
                type: 'EXPENSE'
              },
              _sum: {
                amount: true
              }
            }),
          { _sum: { amount: 0 } }
        )
      ])

      const revenue = revenueData._sum.totalAmount || 0
      const expenses = expensesData._sum.amount || 0
      const profit = revenue - expenses

      financialMetrics.push({
        month: format(monthDate, 'MMM yyyy', { locale: { code: 'ar' } }),
        revenue,
        expenses,
        profit
      })
    }

    // Get current period detailed breakdown
    const currentPeriodWhere = {
      ...where,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    const [
      revenueByCategory,
      expensesByCategory,
      topInvoices,
      monthlyTrend
    ] = await Promise.all([
      // Revenue by category/type
      safeExecute(
        () =>
          db.invoice.groupBy({
            by: ['type'],
            where: {
              ...currentPeriodWhere,
              status: 'PAID'
            },
            _sum: {
              totalAmount: true
            },
            _count: {
              _all: true
            }
          }),
        [] as Array<{ type: string | null; _sum: { totalAmount: number | null }; _count: { _all: number } }>
      ),
      // Expenses by category
      safeExecute(
        () =>
          db.transaction.groupBy({
            by: ['category'],
            where: {
              ...currentPeriodWhere,
              type: 'EXPENSE'
            },
            _sum: {
              amount: true
            },
            _count: {
              _all: true
            }
          }),
        [] as Array<{ category: string | null; _sum: { amount: number | null }; _count: { _all: number } }>
      ),
      // Top invoices
      safeExecute(
        () =>
          db.invoice.findMany({
            where: {
              ...currentPeriodWhere,
              status: 'PAID'
            },
            include: {
              customer: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              totalAmount: 'desc'
            },
            take: 10
          }),
        [] as Array<{ totalAmount: number; customer: { id: string; name: string | null } | null }>
      ),
      // Monthly trend for the last 6 months
      Promise.all(
        Array.from({ length: 6 }, async (_, i) => {
          const monthDate = addMonths(now, -i)
          const monthStart = startOfMonth(monthDate)
          const monthEnd = endOfMonth(monthDate)

          const [revenue, expenses] = await Promise.all([
            safeExecute(
              () =>
                db.invoice.aggregate({
                  where: {
                    ...where,
                    createdAt: {
                      gte: monthStart,
                      lte: monthEnd
                    },
                    status: 'PAID'
                  },
                  _sum: {
                    totalAmount: true
                  }
                }),
              { _sum: { totalAmount: 0 } }
            ),
            safeExecute(
              () =>
                db.transaction.aggregate({
                  where: {
                    ...where,
                    createdAt: {
                      gte: monthStart,
                      lte: monthEnd
                    },
                    type: 'EXPENSE'
                  },
                  _sum: {
                    amount: true
                  }
                }),
              { _sum: { amount: 0 } }
            )
          ])

          return {
            month: format(monthDate, 'MMM yyyy', { locale: { code: 'ar' } }),
            revenue: revenue._sum.totalAmount || 0,
            expenses: expenses._sum.amount || 0
          }
        })
      )
    ])

    const financialReport = {
      metrics: financialMetrics,
      revenueByCategory,
      expensesByCategory,
      topInvoices,
      monthlyTrend: monthlyTrend.reverse(),
      period: {
        start: startDate,
        end: endDate,
        type: period
      }
    }

    return NextResponse.json(financialReport, { headers })
  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }}
    )
  }
}