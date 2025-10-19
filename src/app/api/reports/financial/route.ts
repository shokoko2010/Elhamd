interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        db.invoice.aggregate({
          where: {
            ...monthWhere,
            status: 'PAID'
          },
          _sum: {
            totalAmount: true
          }
        }),
        db.transaction.aggregate({
          where: {
            ...monthWhere,
            type: 'EXPENSE'
          },
          _sum: {
            amount: true
          }
        })
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
      // Expenses by category
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
      // Top invoices
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
      // Monthly trend for the last 6 months
      Promise.all(Array.from({ length: 6 }, async (_, i) => {
        const monthDate = addMonths(now, -i)
        const monthStart = startOfMonth(monthDate)
        const monthEnd = endOfMonth(monthDate)
        
        const [revenue, expenses] = await Promise.all([
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
          })
        ])

        return {
          month: format(monthDate, 'MMM yyyy', { locale: { code: 'ar' } }),
          revenue: revenue._sum.totalAmount || 0,
          expenses: expenses._sum.amount || 0
        }
      }))
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

    return NextResponse.json(financialReport)
  } catch (error) {
    console.error('Error fetching financial report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}