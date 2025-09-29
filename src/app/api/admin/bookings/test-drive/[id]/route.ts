interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params
    const booking = await db.testDriveBooking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            category: true,
            fuelType: true,
            transmission: true,
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'حجز القيادة التجريبية غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching test drive booking:', error)
    return NextResponse.json(
      { error: 'فشل في جلب حجز القيادة التجريبية' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params
    const body = await request.json()
    const { status, notes, date, timeSlot } = body

    // Check if booking exists
    const existingBooking = await db.testDriveBooking.findUnique({
      where: { id },
      include: {
        vehicle: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'حجز القيادة التجريبية غير موجود' },
        { status: 404 }
      )
    }

    // Check for conflicting bookings if changing date/time
    if ((date && date !== existingBooking.date.toISOString().split('T')[0]) || 
        (timeSlot && timeSlot !== existingBooking.timeSlot)) {
      
      const conflictingBooking = await db.testDriveBooking.findFirst({
        where: {
          vehicleId: existingBooking.vehicleId,
          date: new Date(date || existingBooking.date),
          timeSlot: timeSlot || existingBooking.timeSlot,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          id: {
            not: params.id
          }
        }
      })

      if (conflictingBooking) {
        return NextResponse.json(
          { error: 'يوجد حجز آخر في نفس الوقت لهذه المركبة' },
          { status: 400 }
        )
      }
    }

    // Update booking
    const updatedBooking = await db.testDriveBooking.update({
      where: { id },
      data: {
        status: status ? status as BookingStatus : undefined,
        notes: notes !== undefined ? notes : undefined,
        date: date ? new Date(date) : undefined,
        timeSlot: timeSlot || undefined
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

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Error updating test drive booking:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث حجز القيادة التجريبية' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params
    // Check if booking exists
    const existingBooking = await db.testDriveBooking.findUnique({
      where: { id }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'حجز القيادة التجريبية غير موجود' },
        { status: 404 }
      )
    }

    // Delete booking
    await db.testDriveBooking.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف حجز القيادة التجريبية بنجاح' })
  } catch (error) {
    console.error('Error deleting test drive booking:', error)
    return NextResponse.json(
      { error: 'فشل في حذف حجز القيادة التجريبية' },
      { status: 500 }
    )
  }
}