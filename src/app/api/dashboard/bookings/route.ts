interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Get test drive bookings
    const testDriveBookings = await db.testDriveBooking.findMany({
      where: { customerId: userId },
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get service bookings
    const serviceBookings = await db.serviceBooking.findMany({
      where: { customerId: userId },
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true
          }
        },
        serviceType: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Combine and format bookings
    const bookings = [
      ...testDriveBookings.map(booking => ({
        id: booking.id,
        type: 'test_drive' as const,
        status: booking.status,
        date: booking.date.toISOString(),
        timeSlot: booking.timeSlot,
        vehicle: booking.vehicle,
        totalPrice: 0,
        createdAt: booking.createdAt.toISOString()
      })),
      ...serviceBookings.map(booking => ({
        id: booking.id,
        type: 'service' as const,
        status: booking.status,
        date: booking.date.toISOString(),
        timeSlot: booking.timeSlot,
        vehicle: booking.vehicle,
        serviceType: booking.serviceType,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt.toISOString()
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching dashboard bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}