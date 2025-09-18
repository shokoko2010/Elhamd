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

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all bookings (test drive and service)
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

    // Calculate customer satisfaction (mock data for now)
    const customerSatisfaction = 95 // This would be calculated from actual ratings

    // Calculate average response time (mock data for now)
    const averageResponseTime = 15 // minutes

    const stats = {
      totalBookings,
      todayBookings,
      completedBookings,
      pendingBookings,
      customerSatisfaction,
      averageResponseTime
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching employee stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}