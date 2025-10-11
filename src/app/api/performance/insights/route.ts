interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId') || session.session.user.id

    // Get employee's performance metrics
    const metrics = await db.performanceMetric.findMany({
      where: {
        employeeId: employeeId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12 // Last 12 periods
    })

    if (metrics.length === 0) {
      return NextResponse.json([])
    }

    // Calculate trends and insights
    const recentMetrics = metrics.slice(0, 3)
    const olderMetrics = metrics.slice(3)

    const avgRecentRating = recentMetrics.reduce((sum, m) => sum + m.customerRating, 0) / recentMetrics.length
    const avgOlderRating = olderMetrics.length > 0 ? olderMetrics.reduce((sum, m) => sum + m.customerRating, 0) / olderMetrics.length : avgRecentRating

    const avgRecentConversion = recentMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / recentMetrics.length
    const avgOlderConversion = olderMetrics.length > 0 ? olderMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / olderMetrics.length : avgRecentConversion

    const avgRecentResponse = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const avgOlderResponse = olderMetrics.length > 0 ? olderMetrics.reduce((sum, m) => sum + m.responseTime, 0) / olderMetrics.length : avgRecentResponse

    const totalBookings = metrics.reduce((sum, m) => sum + m.bookingsHandled, 0)
    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenueGenerated, 0)

    // Generate insights based on data
    const insights: any[] = []

    // Rating insights
    if (avgRecentRating >= 4.5) {
      insights.push({
        id: 'high_rating',
        type: 'strength',
        title: 'Excellent Customer Ratings',
        description: `Your average customer rating of ${avgRecentRating.toFixed(1)}/5 is exceptional.`,
        impact: 'high',
        actionable: false,
        recommendations: [
          'Maintain this high level of service quality',
          'Share your best practices with the team',
          'Consider mentoring other employees'
        ]
      })
    } else if (avgRecentRating < 3.5) {
      insights.push({
        id: 'low_rating',
        type: 'weakness',
        title: 'Customer Rating Needs Improvement',
        description: `Your average customer rating of ${avgRecentRating.toFixed(1)}/5 is below target.`,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Focus on improving customer communication',
          'Attend customer service training',
          'Seek feedback from satisfied customers to understand what works'
        ]
      })
    }

    // Conversion rate insights
    if (avgRecentConversion > avgOlderConversion + 5) {
      insights.push({
        id: 'improving_conversion',
        type: 'trend',
        title: 'Improving Conversion Rate',
        description: `Your conversion rate has improved by ${(avgRecentConversion - avgOlderConversion).toFixed(1)}%.`,
        impact: 'medium',
        actionable: false,
        recommendations: [
          'Continue using your current successful approach',
          'Analyze what changed to sustain this improvement',
          'Share your conversion strategies with the team'
        ]
      })
    } else if (avgRecentConversion < 40) {
      insights.push({
        id: 'low_conversion',
        type: 'weakness',
        title: 'Low Conversion Rate',
        description: `Your conversion rate of ${avgRecentConversion.toFixed(1)}% is below the target of 40%.`,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Review your sales pitch and approach',
          'Attend sales training sessions',
          'Study top performers\' techniques',
          'Focus on building better customer relationships'
        ]
      })
    }

    // Response time insights
    if (avgRecentResponse < avgOlderResponse - 5) {
      insights.push({
        id: 'faster_response',
        type: 'strength',
        title: 'Improved Response Time',
        description: `Your average response time has improved by ${(avgOlderResponse - avgRecentResponse).toFixed(1)} minutes.`,
        impact: 'medium',
        actionable: false,
        recommendations: [
          'Maintain this quick response time',
          'Share your time management techniques',
          'Help team members improve their response times'
        ]
      })
    } else if (avgRecentResponse > 60) {
      insights.push({
        id: 'slow_response',
        type: 'weakness',
        title: 'Slow Response Time',
        description: `Your average response time of ${avgRecentResponse.toFixed(0)} minutes is above the target of 30 minutes.`,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Implement better time management strategies',
          'Use templates for common responses',
          'Prioritize urgent customer inquiries',
          'Consider using automation tools for routine tasks'
        ]
      })
    }

    // Revenue insights
    if (totalRevenue > 1000000) {
      insights.push({
        id: 'high_revenue',
        type: 'strength',
        title: 'Million EGP Revenue Generator',
        description: `You've generated over ${new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(totalRevenue)} in revenue.`,
        impact: 'high',
        actionable: false,
        recommendations: [
          'Continue your successful revenue generation strategies',
          'Mentor other team members',
          'Set even higher revenue goals for yourself'
        ]
      })
    }

    // Booking volume insights
    if (totalBookings > 200) {
      insights.push({
        id: 'high_volume',
        type: 'strength',
        title: 'High Booking Volume',
        description: `You've handled ${totalBookings} bookings, showing great productivity.`,
        impact: 'medium',
        actionable: false,
        recommendations: [
          'Maintain this high level of productivity',
          'Focus on quality alongside quantity',
          'Share your efficiency techniques with the team'
        ]
      })
    } else if (totalBookings < 50 && metrics.length >= 6) {
      insights.push({
        id: 'low_volume',
        type: 'opportunity',
        title: 'Opportunity for Growth',
        description: `With ${totalBookings} bookings over ${metrics.length} periods, there's room for growth.`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Set higher booking targets',
          'Improve conversion rates',
          'Focus on customer follow-ups',
          'Expand your customer network'
        ]
      })
    }

    // Consistency insights
    if (metrics.length >= 6) {
      const ratingVariance = recentMetrics.reduce((sum, m) => {
        const diff = m.customerRating - avgRecentRating
        return sum + (diff * diff)
      }, 0) / recentMetrics.length

      if (ratingVariance < 0.1) {
        insights.push({
          id: 'consistent_performance',
          type: 'strength',
          title: 'Consistent Performance',
          description: 'Your performance metrics show great consistency.',
          impact: 'medium',
          actionable: false,
          recommendations: [
            'Maintain this consistency',
            'Document your successful processes',
            'Help others achieve similar consistency'
          ]
        })
      } else if (ratingVariance > 0.5) {
        insights.push({
          id: 'inconsistent_performance',
          type: 'weakness',
          title: 'Performance Variability',
          description: 'Your performance shows significant variation between periods.',
          impact: 'medium',
          actionable: true,
          recommendations: [
            'Identify factors causing performance fluctuations',
            'Develop more consistent work habits',
            'Create standard operating procedures',
            'Focus on steady improvement rather than peaks'
          ]
        })
      }
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating performance insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}