interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStaffRole()

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all bookings (test drive and service) for today
    const [testDriveBookings, serviceBookings] = await Promise.all([
      db.testDriveBooking.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      db.serviceBooking.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ])

    const todayBookings = testDriveBookings.length + serviceBookings.length

    // Get total bookings (all time)
    const [totalTestDrive, totalService] = await Promise.all([
      db.testDriveBooking.count(),
      db.serviceBooking.count()
    ])

    const totalBookings = totalTestDrive + totalService

    // Get completed bookings
    const [completedTestDrive, completedService] = await Promise.all([
      db.testDriveBooking.count({
        where: { status: 'COMPLETED' }
      }),
      db.serviceBooking.count({
        where: { status: 'COMPLETED' }
      })
    ])

    const completedBookings = completedTestDrive + completedService

    // Get pending bookings
    const [pendingTestDrive, pendingService] = await Promise.all([
      db.testDriveBooking.count({
        where: { status: 'PENDING' }
      }),
      db.serviceBooking.count({
        where: { status: 'PENDING' }
      })
    ])

    const pendingBookings = pendingTestDrive + pendingService

    // Get customer feedback ratings for satisfaction calculation
    const feedbackRatings = await db.customerFeedback.findMany({
      where: {
        rating: {
          not: null
        }
      },
      select: {
        rating: true
      }
    })

    const customerSatisfaction = feedbackRatings.length > 0 
      ? Math.round(feedbackRatings.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackRatings.length)
      : 0

    // Calculate average response time from bookings data
    const recentBookings = await db.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        },
        status: 'COMPLETED'
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    const averageResponseTime = recentBookings.length > 0
      ? Math.round(recentBookings.reduce((sum, booking) => {
          const responseTime = booking.updatedAt.getTime() - booking.createdAt.getTime()
          return sum + responseTime
        }, 0) / recentBookings.length / (1000 * 60)) // Convert to minutes
      : 0

    // Get vehicles stats
    const [totalVehicles, availableVehicles] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({
        where: { status: 'AVAILABLE' }
      })
    ])

    // Get orders stats
    const [totalOrders, pendingOrders] = await Promise.all([
      db.order.count(),
      db.order.count({
        where: { status: 'PENDING' }
      })
    ])

    // Get invoices stats
    const [totalInvoices, paidInvoices] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({
        where: { status: 'PAID' }
      })
    ])

    // Get users stats
    const [totalUsers, activeUsers] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: { 
          status: 'active',
          isActive: true
        }
      })
    ])

    const stats = {
      totalBookings,
      todayBookings,
      completedBookings,
      pendingBookings,
      customerSatisfaction,
      averageResponseTime,
      totalCars: totalVehicles,
      availableCars: availableVehicles,
      totalOrders,
      pendingOrders,
      totalInvoices,
      paidInvoices,
      totalUsers,
      activeUsers
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching employee stats:', error)
    
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