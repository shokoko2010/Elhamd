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
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } }
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
      db.testDriveBooking.findMany({
        where,
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
        },
        orderBy: [
          { date: 'desc' },
          { timeSlot: 'asc' }
        ],
        skip,
        take: limit
      }),
      db.testDriveBooking.count({ where })
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
    console.error('Error fetching test drive bookings:', error)
    return NextResponse.json(
      { error: 'فشل في جلب حجوزات القيادة التجريبية' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, vehicleId, date, timeSlot, notes } = body

    // Validate required fields
    if (!customerId || !vehicleId || !date || !timeSlot) {
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

    // Check if vehicle exists and is available
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    if (vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'المركبة غير متاحة للقيادة التجريبية' },
        { status: 400 }
      )
    }

    // Check for conflicting bookings
    const conflictingBooking = await db.testDriveBooking.findFirst({
      where: {
        vehicleId,
        date: new Date(date),
        timeSlot,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'يوجد حجز آخر في نفس الوقت لهذه المركبة' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await db.testDriveBooking.create({
      data: {
        customerId,
        vehicleId,
        date: new Date(date),
        timeSlot,
        notes
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

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Error creating test drive booking:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء حجز القيادة التجريبية' },
      { status: 500 }
    )
  }
}