import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const bookings = await db.serviceBooking.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        serviceType: {
          select: {
            name: true,
            category: true
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
      serviceName: booking.serviceType.name,
      serviceCategory: booking.serviceType.category,
      vehicleName: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : undefined,
      vehicleMake: booking.vehicle?.make,
      vehicleModel: booking.vehicle?.model,
      date: booking.date.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      notes: booking.notes,
      totalPrice: booking.totalPrice,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt.toISOString()
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error('Error fetching service bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service bookings' },
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

    const updatedBooking = await db.serviceBooking.update({
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
        serviceType: {
          select: {
            name: true,
            category: true
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
      serviceName: updatedBooking.serviceType.name,
      serviceCategory: updatedBooking.serviceType.category,
      vehicleName: updatedBooking.vehicle ? `${updatedBooking.vehicle.make} ${updatedBooking.vehicle.model}` : undefined,
      vehicleMake: updatedBooking.vehicle?.make,
      vehicleModel: updatedBooking.vehicle?.model,
      date: updatedBooking.date.toISOString(),
      timeSlot: updatedBooking.timeSlot,
      status: updatedBooking.status,
      notes: updatedBooking.notes,
      totalPrice: updatedBooking.totalPrice,
      paymentStatus: updatedBooking.paymentStatus,
      createdAt: updatedBooking.createdAt.toISOString()
    }

    return NextResponse.json(formattedBooking)
  } catch (error) {
    console.error('Error updating service booking:', error)
    return NextResponse.json(
      { error: 'Failed to update service booking' },
      { status: 500 }
    )
  }
}