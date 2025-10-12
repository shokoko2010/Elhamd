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
    
    const userId = session.user.id

    // Get all bookings for the user
    const [testDriveBookings, serviceBookings] = await Promise.all([
      db.testDriveBooking.findMany({
        where: { customerId: userId },
        include: {
          vehicle: true
        }
      }),
      db.serviceBooking.findMany({
        where: { customerId: userId },
        include: {
          vehicle: true,
          serviceType: true
        }
      })
    ])

    const allBookings = [
      ...testDriveBookings.map(booking => ({
        ...booking,
        type: 'test_drive' as const,
        totalPrice: 0
      })),
      ...serviceBookings.map(booking => ({
        ...booking,
        type: 'service' as const
      }))
    ]

    // Calculate stats
    const totalBookings = allBookings.length
    const activeBookings = allBookings.filter(booking => 
      ['PENDING', 'CONFIRMED'].includes(booking.status)
    ).length
    const completedBookings = allBookings.filter(booking => 
      booking.status === 'COMPLETED'
    ).length
    const cancelledBookings = allBookings.filter(booking => 
      ['CANCELLED', 'NO_SHOW'].includes(booking.status)
    ).length

    // Calculate total spent (from completed service bookings)
    const totalSpent = serviceBookings
      .filter(booking => booking.status === 'COMPLETED' && booking.totalPrice)
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)

    const stats = {
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalSpent: Math.round(totalSpent * 100) / 100
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}