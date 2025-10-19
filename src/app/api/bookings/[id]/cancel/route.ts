interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!user?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = id
    const userId = user.id

    // Try to cancel test drive booking first
    let booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return NextResponse.json({ 
          error: 'Booking cannot be cancelled in current status' 
        }, { status: 400 })
      }

      const updatedBooking = await db.testDriveBooking.update({
        where: { id: bookingId },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: userId,
          type: 'BOOKING_CANCELLATION',
          title: 'Booking Cancelled',
          message: `Your test drive booking for ${new Date(booking.date).toLocaleDateString()} has been cancelled.`,
          status: 'PENDING',
          channel: 'EMAIL',
          recipient: session.user.email!
        }
      })

      return NextResponse.json({ success: true, booking: updatedBooking })
    }

    // If not test drive, try service booking
    booking = await db.serviceBooking.findUnique({
      where: { id: bookingId }
    })

    if (booking && booking.customerId === userId) {
      if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return NextResponse.json({ 
          error: 'Booking cannot be cancelled in current status' 
        }, { status: 400 })
      }

      const updatedBooking = await db.serviceBooking.update({
        where: { id: bookingId },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: userId,
          type: 'BOOKING_CANCELLATION',
          title: 'Booking Cancelled',
          message: `Your service booking for ${new Date(booking.date).toLocaleDateString()} has been cancelled.`,
          status: 'PENDING',
          channel: 'EMAIL',
          recipient: session.user.email!
        }
      })

      return NextResponse.json({ success: true, booking: updatedBooking })
    }

    // If no booking found or doesn't belong to user
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}