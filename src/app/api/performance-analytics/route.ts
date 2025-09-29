interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { performanceAnalyticsService } from '@/lib/performance-analytics-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'current-metrics':
        return NextResponse.json(performanceAnalyticsService.getCurrentMetrics())

      case 'metrics-history':
        const period = searchParams.get('period') as 'hour' | 'day' | 'week' | 'month' || 'day'
        const limit = parseInt(searchParams.get('limit') || '100')
        return NextResponse.json(performanceAnalyticsService.getMetricsHistory({ period, limit }))

      case 'alerts':
        const resolved = searchParams.get('resolved') === 'true'
        const severity = searchParams.get('severity')?.split(',') as ('low' | 'medium' | 'high' | 'critical')[] || undefined
        const type = searchParams.get('type')?.split(',') as ('performance' | 'memory' | 'network' | 'error')[] || undefined
        const alertLimit = parseInt(searchParams.get('limit') || '50')
        return NextResponse.json(performanceAnalyticsService.getAlerts({ resolved, severity, type, limit: alertLimit }))

      case 'dashboard':
        return NextResponse.json(performanceAnalyticsService.getDashboardData())

      case 'health':
        const health = await performanceAnalyticsService.healthCheck()
        return NextResponse.json(health)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in performance analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'record-metrics':
        performanceAnalyticsService.recordMetrics(data.metrics)
        return NextResponse.json({ success: true, message: 'Metrics recorded' })

      case 'generate-report':
        const report = performanceAnalyticsService.generateReport(data.options)
        return NextResponse.json(report)

      case 'resolve-alert':
        const resolved = performanceAnalyticsService.resolveAlert(data.alertId)
        return NextResponse.json({ success: resolved, message: resolved ? 'Alert resolved' : 'Alert not found' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in performance analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}