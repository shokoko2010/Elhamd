import { NextRequest, NextResponse } from 'next/server'
import { AdvancedReportingService } from '@/lib/advanced-reporting-service'

const reportingService = AdvancedReportingService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const reportType = searchParams.get('type') as 'sales' | 'customers' | 'employees' | 'services' | 'inventory'
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    const format = searchParams.get('format') as 'json' | 'csv' | 'excel' | 'pdf' || 'json'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Validate required parameters
    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      )
    }

    // Set default dates if not provided
    const now = new Date()
    let start: Date
    let end: Date = new Date(endDate || now)

    switch (period) {
      case 'daily':
        start = new Date(startDate || now.setDate(now.getDate() - 1))
        break
      case 'weekly':
        start = new Date(startDate || now.setDate(now.getDate() - 7))
        break
      case 'monthly':
        start = new Date(startDate || now.setMonth(now.getMonth() - 1))
        break
      case 'quarterly':
        start = new Date(startDate || now.setMonth(now.getMonth() - 3))
        break
      case 'yearly':
        start = new Date(startDate || now.setFullYear(now.getFullYear() - 1))
        break
      default:
        start = new Date(startDate || now.setMonth(now.getMonth() - 1))
    }

    // Generate report
    const reportConfig = {
      type: reportType,
      period,
      startDate: start,
      endDate: end,
      format,
      includeCharts: searchParams.get('includeCharts') === 'true',
      includeTrends: searchParams.get('includeTrends') === 'true',
      includeRecommendations: searchParams.get('includeRecommendations') === 'true'
    }

    const report = await reportingService.generateReport(reportConfig)

    // Handle different response formats
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: report,
        metadata: {
          generatedAt: new Date().toISOString(),
          reportType,
          period,
          dateRange: { start, end }
        }
      })
    } else {
      // For non-JSON formats, export and return as file
      const exportedData = await reportingService.exportReport(report, format)
      
      const contentType = {
        csv: 'text/csv',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pdf: 'application/pdf'
      }[format] || 'application/octet-stream'

      const filename = `${reportType}_report_${period}_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.${format}`

      return new NextResponse(exportedData, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      reportType,
      period,
      format = 'json',
      startDate,
      endDate,
      recipients,
      schedule
    } = body

    // Validate required parameters
    if (!reportType || !period) {
      return NextResponse.json(
        { error: 'Report type and period are required' },
        { status: 400 }
      )
    }

    // Set default dates if not provided
    const now = new Date()
    let start: Date
    let end: Date = new Date(endDate || now)

    switch (period) {
      case 'daily':
        start = new Date(startDate || now.setDate(now.getDate() - 1))
        break
      case 'weekly':
        start = new Date(startDate || now.setDate(now.getDate() - 7))
        break
      case 'monthly':
        start = new Date(startDate || now.setMonth(now.getMonth() - 1))
        break
      case 'quarterly':
        start = new Date(startDate || now.setMonth(now.getMonth() - 3))
        break
      case 'yearly':
        start = new Date(startDate || now.setFullYear(now.getFullYear() - 1))
        break
      default:
        start = new Date(startDate || now.setMonth(now.getMonth() - 1))
    }

    const reportConfig = {
      type: reportType,
      period,
      startDate: start,
      endDate: end,
      format,
      includeCharts: body.includeCharts || false,
      includeTrends: body.includeTrends || false,
      includeRecommendations: body.includeRecommendations || false
    }

    // Generate report
    const report = await reportingService.generateReport(reportConfig)

    // Schedule report if recipients are provided
    let scheduledReport = null
    if (recipients && schedule) {
      scheduledReport = await reportingService.scheduleReport(reportConfig, recipients, schedule)
    }

    return NextResponse.json({
      success: true,
      data: report,
      scheduledReport,
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType,
        period,
        dateRange: { start, end }
      }
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    )
  }
}