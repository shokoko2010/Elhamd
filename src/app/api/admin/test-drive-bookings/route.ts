import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const bookings = await db.testDriveBooking.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            make: true,
            model: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.customer.name || 'Unknown',
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone || '',
      vehicleName: `${booking.vehicle.make} ${booking.vehicle.model}`,
      vehicleMake: booking.vehicle.make,
      vehicleModel: booking.vehicle.model,
      date: booking.date.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString()
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error('Error fetching test drive bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test drive bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { bookingId, status } = await request.json()

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    const updatedBooking = await db.testDriveBooking.update({
      where: {
        id: bookingId
      },
      data: {
        status: status as BookingStatus,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            make: true,
            model: true
          }
        }
      }
    })

    const formattedBooking = {
      id: updatedBooking.id,
      customerName: updatedBooking.customer.name || 'Unknown',
      customerEmail: updatedBooking.customer.email,
      customerPhone: updatedBooking.customer.phone || '',
      vehicleName: `${updatedBooking.vehicle.make} ${updatedBooking.vehicle.model}`,
      vehicleMake: updatedBooking.vehicle.make,
      vehicleModel: updatedBooking.vehicle.model,
      date: updatedBooking.date.toISOString(),
      timeSlot: updatedBooking.timeSlot,
      status: updatedBooking.status,
      notes: updatedBooking.notes,
      createdAt: updatedBooking.createdAt.toISOString()
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error('Error updating test drive booking:', error)
    return NextResponse.json(
      { error: 'Failed to update test drive booking' },
      { status: 500 }
    )
  }
}