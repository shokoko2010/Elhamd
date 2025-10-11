interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status as BookingStatus
    }
    
    if (dateFrom && dateTo) {
      where.date = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    }

    const [bookings, total] = await Promise.all([
      db.serviceBooking.findMany({
        where,
        orderBy: [
          { date: 'desc' },
          { timeSlot: 'asc' }
        ],
        skip,
        take: limit
      }),
      db.serviceBooking.count({ where })
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching service bookings:', error)
    return NextResponse.json(
      { error: 'فشل في جلب حجوزات الخدمات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, vehicleId, serviceTypeId, date, timeSlot, notes } = body

    // Validate required fields
    if (!customerId || !serviceTypeId || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await db.user.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'العميل غير موجود' },
        { status: 404 }
      )
    }

    // Check if service type exists
    const serviceType = await db.serviceType.findUnique({
      where: { id: serviceTypeId }
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'نوع الخدمة غير موجود' },
        { status: 404 }
      )
    }

    // Check if vehicle exists (if provided)
    if (vehicleId) {
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId }
      })

      if (!vehicle) {
        return NextResponse.json(
          { error: 'المركبة غير موجودة' },
          { status: 404 }
        )
      }
    }

    // Check for conflicting bookings for the same service type
    const conflictingBookings = await db.serviceBooking.count({
      where: {
        serviceTypeId,
        date: new Date(date),
        timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    // Allow up to 3 concurrent bookings for the same service type
    if (conflictingBookings >= 3) {
      return NextResponse.json(
        { error: 'تم الوصول إلى الحد الأقصى للحجوزات في هذا الوقت' },
        { status: 400 }
      )
    }

    // Calculate total price
    const totalPrice = serviceType.price || null

    // Create booking
    const booking = await db.serviceBooking.create({
      data: {
        customerId,
        vehicleId,
        serviceTypeId,
        date: new Date(date),
        timeSlot,
        notes,
        totalPrice
      }
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Error creating service booking:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء حجز الخدمة' },
      { status: 500 }
    )
  }
}