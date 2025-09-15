import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceType = await db.serviceType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            serviceBookings: true
          }
        },
        serviceBookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ serviceType })
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, duration, price, category, isActive } = body

    // Check if service type exists
    const existingServiceType = await db.serviceType.findUnique({
      where: { id: params.id }
    })

    if (!existingServiceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Update service type
    const updatedServiceType = await db.serviceType.update({
      where: { id: params.id },
      data: {
        name,
        description,
        duration: duration ? parseInt(duration) : undefined,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
        category,
        isActive
      },
      include: {
        _count: {
          select: {
            serviceBookings: true
          }
        }
      }
    })

    return NextResponse.json({ serviceType: updatedServiceType })
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if service type exists
    const existingServiceType = await db.serviceType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            serviceBookings: true
          }
        }
      }
    })

    if (!existingServiceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Check if service type has bookings
    if (existingServiceType._count.serviceBookings > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف نوع الخدمة لوجود حجوزات مرتبطة به' },
        { status: 400 }
      )
    }

    // Delete service type
    await db.serviceType.delete({
      where: { id: params.id }
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