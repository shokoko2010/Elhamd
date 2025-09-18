import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus, PaymentStatus } from '@prisma/client'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      vehicleId,
      serviceTypeId,
      date,
      timeSlot,
      notes,
      totalPrice,
      customerInfo // Added customer info for email
    } = body

    // Validate required fields
    if (!customerId || !serviceTypeId || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if the time slot is available
    const bookingDate = new Date(date)
    const [hour, minute] = timeSlot.split(':').map(Number)
    const bookingStartTime = new Date(bookingDate)
    bookingStartTime.setHours(hour, minute, 0, 0)

    // Get service type to check duration
    const serviceType = await db.serviceType.findUnique({
      where: { id: serviceTypeId }
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      )
    }

    const bookingEndTime = new Date(bookingStartTime.getTime() + serviceType.duration * 60000)

    // Check for conflicting bookings
    const conflictingBookings = await db.serviceBooking.findMany({
      where: {
        date: bookingDate,
        timeSlot: timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 400 }
      )
    }

    // Check if it's a holiday
    const holiday = await db.holiday.findFirst({
      where: {
        date: {
          gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          lt: new Date(bookingDate.setHours(23, 59, 59, 999))
        }
      }
    })

    if (holiday) {
      return NextResponse.json(
        { error: 'Selected date is a holiday' },
        { status: 400 }
      )
    }

    // Check if date is in the past
    if (bookingDate < new Date().setHours(0, 0, 0, 0)) {
      return NextResponse.json(
        { error: 'Cannot book for past dates' },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await db.serviceBooking.create({
      data: {
        customerId,
        vehicleId: vehicleId || null,
        serviceTypeId,
        timeSlotId: null, // Will be set if we have time slot management
        date: bookingDate,
        timeSlot,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        notes: notes || null,
        totalPrice: totalPrice || serviceType.price
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        serviceType: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            category: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            stockNumber: true
          }
        }
      }
    })

    // Send confirmation email
    let emailSent = false
    try {
      if (customerInfo && customerInfo.email) {
        emailSent = await emailService.sendBookingConfirmation(
          booking.id,
          customerInfo.email,
          customerInfo.name || 'عميل'
        )
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the booking if email fails
    }

    // TODO: Create payment record if needed

    return NextResponse.json({
      success: true,
      booking,
      emailSent,
      message: 'Booking created successfully'
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}