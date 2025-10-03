interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { CalendarService } from '@/lib/calendar-service'

export async function GET(request: NextRequest) {
  try {
    // For development/testing, allow without authentication
    if (process.env.NODE_ENV === 'development') {
      // Skip auth check in development
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
      }
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    if (!dateParam) {
      return NextResponse.json({ error: 'التاريخ مطلوب' }, { status: 400 })
    }

    const date = new Date(dateParam)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 })
    }

    const calendarService = CalendarService.getInstance()
    const availableSlots = await calendarService.getAvailableTimeSlots(date)

    return NextResponse.json(availableSlots)
  } catch (error) {
    console.error('Error fetching available time slots:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المواعيد المتاحة' },
      { status: 500 }
    )
  }
}