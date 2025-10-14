import { NextRequest, NextResponse } from 'next/server'
import { enhancedNotificationService } from '@/lib/enhanced-notification-service'
import { getAuthUser } from '@/lib/auth-server'
import { SecurityService } from '@/lib/security-service'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await security.checkRateLimit(clientIP, 'notification_stats')
    
    if (!rateLimitResult) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get date range from query parameters
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    let startDate: Date
    let endDate: Date

    if (startDateParam) {
      startDate = new Date(startDateParam)
    } else {
      // Default to 30 days ago
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
    }

    if (endDateParam) {
      endDate = new Date(endDateParam)
    } else {
      // Default to now
      endDate = new Date()
    }

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    // Get notification statistics
    const stats = await enhancedNotificationService.getNotificationStats(startDate, endDate)

    return NextResponse.json({
      success: true,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      stats,
      message: 'Notification statistics retrieved successfully'
    })

  } catch (error) {
    console.error('Notification stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}