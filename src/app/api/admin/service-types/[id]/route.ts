interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const serviceType = await db.serviceType.findUnique({
      where: { id }
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Get booking count separately
    const bookingCount = await db.serviceBooking.count({
      where: { serviceTypeId: id }
    })

    return NextResponse.json({ 
      serviceType: {
        ...serviceType,
        _count: {
          serviceBookings: bookingCount
        }
      }
    })
  } catch (error) {
    console.error('Error fetching service type:', error)
    return NextResponse.json(
      { error: 'فشل في جلب نوع الخدمة' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, description, duration, price, category, isActive } = body

    // Check if service type exists
    const existingServiceType = await db.serviceType.findUnique({
      where: { id }
    })

    if (!existingServiceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Update service type
    const updatedServiceType = await db.serviceType.update({
      where: { id },
      data: {
        name,
        description,
        duration: duration ? parseInt(duration) : undefined,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
        category,
        isActive
      }
    })

    // Get booking count separately
    const bookingCount = await db.serviceBooking.count({
      where: { serviceTypeId: id }
    })

    return NextResponse.json({ 
      serviceType: {
        ...updatedServiceType,
        _count: {
          serviceBookings: bookingCount
        }
      }
    })
  } catch (error) {
    console.error('Error updating service type:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث نوع الخدمة' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    // Check if service type exists
    const existingServiceType = await db.serviceType.findUnique({
      where: { id }
    })

    if (!existingServiceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Check if service type has bookings
    const bookingCount = await db.serviceBooking.count({
      where: { serviceTypeId: id }
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف نوع الخدمة لوجود حجوزات مرتبطة به' },
        { status: 400 }
      )
    }

    // Delete service type
    await db.serviceType.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف نوع الخدمة بنجاح' })
  } catch (error) {
    console.error('Error deleting service type:', error)
    return NextResponse.json(
      { error: 'فشل في حذف نوع الخدمة' },
      { status: 500 }
    )
  }
}