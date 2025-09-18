import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/booking-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceTypeIds, date } = body

    if (!serviceTypeIds || !Array.isArray(serviceTypeIds) || !date) {
      return NextResponse.json(
        { error: 'أنواع الخدمات والتاريخ مطلوبان' },
        { status: 400 }
      )
    }

    const bookingService = BookingService.getInstance()
    const availability = await bookingService.getServiceAvailability(serviceTypeIds, new Date(date))

    return NextResponse.json({ availableTimeSlots: availability })
  } catch (error) {
    console.error('Error fetching service availability:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في جلب الأوقات المتاحة' },
      { status: 500 }
    )
  }
}