import { NextRequest, NextResponse } from 'next/server'
import { TimeSlot } from '@/lib/calendar-service'
import { format, isToday, isPast, addDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    
    if (!dateStr) {
      return NextResponse.json(
        { error: 'التاريخ مطلوب' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(dateStr)
    
    // Check if the date is in the past
    if (isPast(selectedDate) && !isToday(selectedDate)) {
      return NextResponse.json([])
    }

    // Generate time slots for the selected date
    const timeSlots: TimeSlot[] = []
    const startHour = 9 // 9 AM
    const endHour = 17 // 5 PM
    const slotDuration = 1 // 1 hour per slot

    for (let hour = startHour; hour < endHour; hour += slotDuration) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + slotDuration).toString().padStart(2, '0')}:00`
      
      timeSlots.push({
        id: `slot-${format(selectedDate, 'yyyy-MM-dd')}-${startTime}`,
        dayOfWeek: selectedDate.getDay(),
        startTime,
        endTime,
        maxBookings: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    return NextResponse.json(timeSlots)

  } catch (error) {
    console.error('Error fetching available time slots:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المواعيد المتاحة' },
      { status: 500 }
    )
  }
}