import { NextRequest, NextResponse } from 'next/server'
import { requireStaffRole } from '@/lib/server-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaffRole()

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

    // Calculate average handling time from completed bookings
    const completedBookings = await db.booking.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    const averageHandlingTime = completedBookings.length > 0
      ? Math.round(completedBookings.reduce((sum, booking) => {
          const handlingTime = booking.updatedAt.getTime() - booking.createdAt.getTime()
          return sum + handlingTime
        }, 0) / completedBookings.length / (1000 * 60)) // Convert to minutes
      : 0

    // Get customer ratings for satisfaction calculation
    const customerFeedback = await db.customerFeedback.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        rating: {
          not: null
        }
      },
      select: {
        rating: true
      }
    })

    const customerRating = customerFeedback.length > 0
      ? Math.round(customerFeedback.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / customerFeedback.length)
      : 0

    // Calculate conversion rate (bookings completed vs bookings created)
    const totalBookingsCreated = await db.booking.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const completedBookingsCount = await db.booking.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const conversionRate = totalBookingsCreated > 0
      ? Math.round((completedBookingsCount / totalBookingsCreated) * 100)
      : 0

    // Get completed tasks count
    const tasksCompleted = await db.task.count({
      where: {
        status: 'completed',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const performanceMetrics = {
      bookingsHandled,
      averageHandlingTime,
      customerRating,
      conversionRate,
      revenueGenerated: Math.round(revenueGenerated * 100) / 100,
      tasksCompleted
    }

    return NextResponse.json(performanceMetrics)
  } catch (error) {
    console.error('Error fetching employee performance:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}