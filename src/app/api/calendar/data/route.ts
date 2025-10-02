interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { CalendarService } from '@/lib/calendar-service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') as 'month' | 'week' | 'day' || 'month'
    const currentDate = searchParams.get('currentDate') ? new Date(searchParams.get('currentDate')!) : new Date()
    const showHolidays = searchParams.get('showHolidays') !== 'false'
    const showBookings = searchParams.get('showBookings') !== 'false'
    const showEvents = searchParams.get('showEvents') !== 'false'
    const filterTypes = searchParams.get('filterTypes')?.split(',') || ['booking', 'holiday']

    const calendarService = CalendarService.getInstance()
    const data = await calendarService.getCalendarData({
      view,
      currentDate,
      showHolidays,
      showBookings,
      showEvents,
      filterTypes
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات التقويم' },
      { status: 500 }
    )
  }
}