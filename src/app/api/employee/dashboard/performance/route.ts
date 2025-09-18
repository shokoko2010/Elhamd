import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user is staff or admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || !['STAFF', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get current month's start and end dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get bookings handled this month
    const [testDriveCount, serviceCount] = await Promise.all([
      db.testDriveBooking.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      db.serviceBooking.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
    ])

    const bookingsHandled = testDriveCount + serviceCount

    // Get completed service bookings with payments for revenue calculation
    const serviceBookingsWithRevenue = await db.serviceBooking.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        totalPrice: true
      }
    })

    const revenueGenerated = serviceBookingsWithRevenue.reduce(
      (sum, booking) => sum + (booking.totalPrice || 0), 
      0
    )

    // Mock performance metrics (in real implementation, these would be calculated from actual data)
    const performanceMetrics = {
      bookingsHandled,
      averageHandlingTime: 25, // minutes
      customerRating: 92, // percentage
      conversionRate: 78, // percentage
      revenueGenerated: Math.round(revenueGenerated * 100) / 100,
      tasksCompleted: 15 // mock data
    }

    return NextResponse.json(performanceMetrics)
  } catch (error) {
    console.error('Error fetching employee performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}