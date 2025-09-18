import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId') || session.user.id

    // Get employee's performance metrics
    const metrics = await db.performanceMetric.findMany({
      where: {
        employeeId: employeeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate totals
    const totalBookings = metrics.reduce((sum, metric) => sum + metric.bookingsHandled, 0)
    const totalRevenue = metrics.reduce((sum, metric) => sum + metric.revenueGenerated, 0)
    const totalTasks = metrics.reduce((sum, metric) => sum + metric.tasksCompleted, 0)
    const avgRating = metrics.length > 0 ? metrics.reduce((sum, metric) => sum + metric.customerRating, 0) / metrics.length : 0
    const avgSatisfaction = metrics.length > 0 ? metrics.reduce((sum, metric) => sum + metric.customerSatisfaction, 0) / metrics.length : 0

    // Define achievements
    const achievements = [
      {
        id: 'first_booking',
        title: 'First Booking',
        description: 'Complete your first booking',
        icon: '🎯',
        category: 'Milestone',
        unlockedAt: totalBookings >= 1 ? new Date().toISOString() : null,
        progress: Math.min(totalBookings, 1),
        maxProgress: 1
      },
      {
        id: 'booking_master',
        title: 'Booking Master',
        description: 'Complete 100 bookings',
        icon: '🏆',
        category: 'Excellence',
        unlockedAt: totalBookings >= 100 ? new Date().toISOString() : null,
        progress: totalBookings,
        maxProgress: 100
      },
      {
        id: 'revenue_generator',
        title: 'Revenue Generator',
        description: 'Generate EGP 1,000,000 in revenue',
        icon: '💰',
        category: 'Financial',
        unlockedAt: totalRevenue >= 1000000 ? new Date().toISOString() : null,
        progress: totalRevenue,
        maxProgress: 1000000
      },
      {
        id: 'five_star_service',
        title: '5-Star Service',
        description: 'Maintain 5-star customer rating',
        icon: '⭐',
        category: 'Quality',
        unlockedAt: avgRating >= 4.8 ? new Date().toISOString() : null,
        progress: avgRating * 20, // Convert to percentage
        maxProgress: 100
      },
      {
        id: 'customer_champion',
        title: 'Customer Champion',
        description: 'Achieve 95% customer satisfaction',
        icon: '👥',
        category: 'Service',
        unlockedAt: avgSatisfaction >= 95 ? new Date().toISOString() : null,
        progress: avgSatisfaction,
        maxProgress: 100
      },
      {
        id: 'task_completer',
        title: 'Task Completer',
        description: 'Complete 500 tasks',
        icon: '✅',
        category: 'Productivity',
        unlockedAt: totalTasks >= 500 ? new Date().toISOString() : null,
        progress: totalTasks,
        maxProgress: 500
      },
      {
        id: 'consistent_performer',
        title: 'Consistent Performer',
        description: 'Maintain performance for 6 months',
        icon: '📈',
        category: 'Consistency',
        unlockedAt: metrics.length >= 6 ? new Date().toISOString() : null,
        progress: metrics.length,
        maxProgress: 6
      },
      {
        id: 'quick_responder',
        title: 'Quick Responder',
        description: 'Maintain under 30min response time',
        icon: '⚡',
        category: 'Efficiency',
        unlockedAt: metrics.length > 0 && metrics[0].responseTime <= 30 ? new Date().toISOString() : null,
        progress: metrics.length > 0 ? Math.max(0, 100 - (metrics[0].responseTime / 30) * 100) : 0,
        maxProgress: 100
      }
    ]

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}