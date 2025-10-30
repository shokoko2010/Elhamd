interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const yearStart = startOfYear(now)
    const yearEnd = endOfYear(now)

    // Get real-time stats from database
    const [
      todayStats,
      weekStats,
      monthStats,
      yearStats,
      recentInvoices,
      recentCustomers,
      lowStockVehicles,
      overdueInvoices
    ] = await Promise.all([
      // Today's stats
      getPeriodStats(todayStart, todayEnd),
      // Week stats
      getPeriodStats(weekStart, weekEnd),
      // Month stats
      getPeriodStats(monthStart, monthEnd),
      // Year stats
      getPeriodStats(yearStart, yearEnd),
      // Recent invoices
      db.invoice.findMany({
        where: {
          createdAt: { gte: todayStart }
        },
        include: {
          customer: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Recent customers
      db.user.count({
        where: {
          createdAt: { gte: todayStart },
          role: 'CUSTOMER'
        }
      }),
      // Low stock vehicles
      db.vehicle.count({
        where: {
          status: 'SOLD'
        }
      }),
      // Overdue invoices
      db.invoice.count({
        where: {
          status: 'OVERDUE',
          dueDate: { lt: now }
        }
      })
    ])

    // Generate alerts based on real data
    const alerts = await generateSystemAlerts(lowStockVehicles, overdueInvoices)

    const quickStats = {
      today: todayStats,
      thisWeek: weekStats,
      thisMonth: monthStats,
      thisYear: yearStats
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: monthStats.revenue,
          totalSales: monthStats.sales,
          totalCustomers: await db.user.count({ where: { role: 'CUSTOMER' } }),
          totalVehicles: await db.vehicle.count(),
          averageOrderValue: monthStats.sales > 0 ? monthStats.revenue / monthStats.sales : 0,
          conversionRate: 0 // TODO: Calculate based on leads vs conversions
        },
        quickStats,
        alerts,
        recentActivity: {
          invoices: recentInvoices,
          newCustomers: recentCustomers
        },
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    )
  }
}

async function getPeriodStats(startDate: Date, endDate: Date) {
  try {
    const [invoices, paidInvoices, transactions] = await Promise.all([
      // Total invoices
      db.invoice.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      // Paid invoices
      db.invoice.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'PAID'
        },
        _sum: { totalAmount: true },
        _count: { _all: true }
      }),
      // All transactions
      db.transaction.aggregate({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      })
    ])

    return {
      sales: invoices,
      revenue: paidInvoices._sum.totalAmount || 0,
      paidSales: paidInvoices._count._all || 0,
      totalTransactions: transactions._sum.amount || 0
    }
  } catch (error) {
    console.error('Error getting period stats:', error)
    return {
      sales: 0,
      revenue: 0,
      paidSales: 0,
      totalTransactions: 0
    }
  }
}

async function generateSystemAlerts(lowStock: number, overdueCount: number) {
  const alerts = []

  if (lowStock > 0) {
    alerts.push({
      id: 'low-stock',
      type: 'inventory',
      severity: lowStock > 10 ? 'error' : 'warning',
      title: 'Low Stock Alert',
      message: `${lowStock} vehicles sold out, need to restock`,
      timestamp: new Date().toISOString(),
      action: '/admin/inventory'
    })
  }

  if (overdueCount > 0) {
    alerts.push({
      id: 'overdue-invoices',
      type: 'financial',
      severity: overdueCount > 5 ? 'error' : 'warning',
      title: 'Overdue Invoices',
      message: `${overdueCount} invoices are overdue and need follow-up`,
      timestamp: new Date().toISOString(),
      action: '/admin/finance'
    })
  }

  // Check for recent high-value sales
  const recentHighValueSale = await db.invoice.findFirst({
    where: {
      createdAt: { gte: startOfDay(new Date()) },
      totalAmount: { gte: 100000 }
    },
    orderBy: { totalAmount: 'desc' }
  })

  if (recentHighValueSale) {
    alerts.push({
      id: 'high-value-sale',
      type: 'performance',
      severity: 'success',
      title: 'High Value Sale!',
      message: `Sale of ${new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(recentHighValueSale.totalAmount)} completed`,
      timestamp: new Date().toISOString(),
      action: '/admin/finance'
    })
  }

  return alerts
}