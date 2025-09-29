interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { AdvancedReportingService } from '@/lib/advanced-reporting-service'

const reportingService = AdvancedReportingService.getInstance()

export async function GET(request: NextRequest) {
  try {
    // Get dashboard summary with all key metrics
    const dashboardSummary = await reportingService.getDashboardSummary()

    // Get additional real-time metrics
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const todayEnd = new Date(now.setHours(23, 59, 59, 999))

    // Get today's stats
    const todayStats = {
      sales: await getTodaySales(),
      newCustomers: await getTodayNewCustomers(),
      services: await getTodayServices(),
      revenue: await getTodayRevenue()
    }

    // Get alerts and notifications
    const alerts = await getSystemAlerts()

    // Get quick stats for different periods
    const quickStats = {
      today: todayStats,
      thisWeek: await getPeriodStats('weekly'),
      thisMonth: await getPeriodStats('monthly'),
      thisYear: await getPeriodStats('yearly')
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: dashboardSummary,
        quickStats,
        alerts,
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

// Helper functions to get various statistics
async function getTodaySales() {
  try {
    // This would query the database for today's sales
    // For now, return mock data
    return 12
  } catch (error) {
    console.error('Error getting today sales:', error)
    return 0
  }
}

async function getTodayNewCustomers() {
  try {
    // This would query the database for today's new customers
    return 5
  } catch (error) {
    console.error('Error getting today new customers:', error)
    return 0
  }
}

async function getTodayServices() {
  try {
    // This would query the database for today's services
    return 8
  } catch (error) {
    console.error('Error getting today services:', error)
    return 0
  }
}

async function getTodayRevenue() {
  try {
    // This would query the database for today's revenue
    return 125000
  } catch (error) {
    console.error('Error getting today revenue:', error)
    return 0
  }
}

async function getPeriodStats(period: 'weekly' | 'monthly' | 'yearly') {
  try {
    const report = await reportingService.generateReport({
      type: 'sales',
      period,
      startDate: getPeriodStartDate(period),
      endDate: new Date(),
      format: 'json'
    })

    return {
      revenue: report.summary.totalRevenue,
      sales: report.summary.totalVehiclesSold,
      averageOrderValue: report.summary.averageSalePrice,
      conversionRate: report.summary.conversionRate
    }
  } catch (error) {
    console.error(`Error getting ${period} stats:`, error)
    return {
      revenue: 0,
      sales: 0,
      averageOrderValue: 0,
      conversionRate: 0
    }
  }
}

function getPeriodStartDate(period: 'weekly' | 'monthly' | 'yearly'): Date {
  const now = new Date()
  switch (period) {
    case 'weekly':
      return new Date(now.setDate(now.getDate() - 7))
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() - 1))
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() - 1))
    default:
      return new Date(now.setMonth(now.getMonth() - 1))
  }
}

async function getSystemAlerts() {
  try {
    // This would check various system conditions and generate alerts
    return [
      {
        id: '1',
        type: 'inventory',
        severity: 'warning',
        title: 'Low Stock Alert',
        message: 'Only 5 vehicles remaining in stock',
        timestamp: new Date().toISOString(),
        action: '/admin/inventory'
      },
      {
        id: '2',
        type: 'performance',
        severity: 'info',
        title: 'Performance milestone',
        message: 'Sales target achieved for this month',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: '/admin/reports/sales'
      },
      {
        id: '3',
        type: 'system',
        severity: 'error',
        title: 'System Maintenance',
        message: 'Scheduled maintenance in 2 hours',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        action: '/admin/system'
      }
    ]
  } catch (error) {
    console.error('Error getting system alerts:', error)
    return []
  }
}