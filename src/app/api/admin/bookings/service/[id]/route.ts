import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await db.serviceBooking.findUnique({
      where: { id: params.id },
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
        },
        serviceType: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
            category: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'حجز الخدمة غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching service booking:', error)
    return NextResponse.json(
      { error: 'فشل في جلب حجز الخدمة' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes, date, timeSlot, totalPrice } = body

    // Check if booking exists
    const existingBooking = await db.serviceBooking.findUnique({
      where: { id: params.id },
      include: {
        serviceType: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'حجز الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Check for conflicting bookings if changing date/time
    if ((date && date !== existingBooking.date.toISOString().split('T')[0]) || 
        (timeSlot && timeSlot !== existingBooking.timeSlot)) {
      
      const conflictingBookings = await db.serviceBooking.count({
        where: {
          serviceTypeId: existingBooking.serviceTypeId,
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

      if (conflictingBookings >= 3) {
        return NextResponse.json(
          { error: 'تم الوصول إلى الحد الأقصى للحجوزات في هذا الوقت' },
          { status: 400 }
        )
      }
    }

    // Update booking
    const updatedBooking = await db.serviceBooking.update({
      where: { id: params.id },
      data: {
        status: status ? status as BookingStatus : undefined,
        notes: notes !== undefined ? notes : undefined,
        date: date ? new Date(date) : undefined,
        timeSlot: timeSlot || undefined,
        totalPrice: totalPrice !== undefined ? (totalPrice ? parseFloat(totalPrice) : null) : undefined
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
        },
        serviceType: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Error updating service booking:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث حجز الخدمة' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if booking exists
    const existingBooking = await db.serviceBooking.findUnique({
      where: { id: params.id }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'حجز الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Delete booking
    await db.serviceBooking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'تم حذف حجز الخدمة بنجاح' })
  } catch (error) {
    console.error('Error deleting service booking:', error)
    return NextResponse.json(
      { error: 'فشل في حذف حجز الخدمة' },
      { status: 500 }
    )
  }
}