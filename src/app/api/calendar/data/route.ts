import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isWeekend, isPast, addDays } from 'date-fns'
import { ar } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  start: Date
  end: Date
  type: 'booking' | 'holiday' | 'event'
  status?: string | null
  customerId?: string | null
  vehicleId?: string | null
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  vehicleName?: string
  organizerId?: string | null
  organizerName?: string
  location?: string | null
  allDay?: boolean
  createdAt: Date
  updatedAt: Date
}

interface CalendarDay {
  date: Date
  events: CalendarEvent[]
  bookingsCount: number
  isToday: boolean
  isWeekend: boolean
  isPast: boolean
  isHoliday: boolean
  availableTimeSlots: any[]
}

interface Holiday {
  id: string
  name: string
  date: Date
  type: string
  description?: string
}

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  maxBookings: number
  currentBookings: number
  isAvailable: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'month'
    const currentDate = new Date(searchParams.get('currentDate') || new Date().toISOString())
    const showHolidays = searchParams.get('showHolidays') === 'true'
    const showBookings = searchParams.get('showBookings') === 'true'
    const showEvents = searchParams.get('showEvents') === 'true'
    const filterTypes = searchParams.get('filterTypes')?.split(',') || ['booking', 'holiday']

    // Get the month start and end dates
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Fetch calendar data without customer references for now
    const [testDriveBookings, serviceBookings, calendarEvents] = await Promise.all([
      // Test drive bookings
      db.testDriveBooking.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        orderBy: [
          { date: 'asc' },
          { timeSlot: 'asc' }
        ]
      }),

      // Service bookings
      db.serviceBooking.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        orderBy: [
          { date: 'asc' },
          { timeSlot: 'asc' }
        ]
      }),

      // Calendar events
      db.calendarEvent.findMany({
        where: {
          startTime: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        orderBy: [
          { startTime: 'asc' }
        ]
      })
    ])

    // Convert bookings to calendar events
    const bookingEvents: CalendarEvent[] = []

    // Add test drive bookings
    testDriveBookings.forEach(booking => {
      const eventDate = new Date(booking.date)
      const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
      
      const event: CalendarEvent = {
        id: `test-drive-${booking.id}`,
        title: `اختبار قيادة - حجز ${booking.id}`,
        description: `حجز اختبار قيادة`,
        start: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${startTime}`),
        end: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${endTime}`),
        type: 'booking',
        status: booking.status as any,
        customerId: booking.customerId,
        vehicleId: booking.vehicleId,
        allDay: false,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
      bookingEvents.push(event)
    })

    // Add service bookings
    serviceBookings.forEach(booking => {
      const eventDate = new Date(booking.date)
      const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
      
      const event: CalendarEvent = {
        id: `service-${booking.id}`,
        title: `صيانة - حجز ${booking.id}`,
        description: `حجز صيانة`,
        start: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${startTime}`),
        end: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${endTime}`),
        type: 'booking',
        status: booking.status as any,
        customerId: booking.customerId,
        vehicleId: booking.vehicleId,
        allDay: false,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
      bookingEvents.push(event)
    })

    // Add calendar events
    calendarEvents.forEach(event => {
      const calendarEvent: CalendarEvent = {
        id: `event-${event.id}`,
        title: event.title,
        description: event.description,
        start: event.startTime,
        end: event.endTime,
        type: 'event',
        status: event.status,
        organizerId: event.organizerId,
        location: event.location,
        allDay: event.isRecurring,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }
      bookingEvents.push(calendarEvent)
    })

    // Create calendar days
    const calendarDays: CalendarDay[] = daysInMonth.map(day => {
      const dayEvents = bookingEvents.filter(event => isSameDay(event.start, day))
      const isTodayDate = isToday(day)
      const isWeekendDate = isWeekend(day)
      const isPastDate = isPast(day) && !isTodayDate
      
      return {
        date: day,
        events: dayEvents,
        bookingsCount: dayEvents.filter(e => e.type === 'booking').length,
        isToday: isTodayDate,
        isWeekend: isWeekendDate,
        isPast: isPastDate,
        isHoliday: false, // TODO: Add holiday logic
        availableTimeSlots: [] // TODO: Add time slots logic
      }
    })

    // Create some sample holidays
    const holidays: Holiday[] = [
      {
        id: 'holiday-1',
        name: 'عيد الفطر',
        date: addDays(new Date(), 30), // Sample date
        type: 'religious',
        description: 'عيد الفطر المبارك'
      },
      {
        id: 'holiday-2',
        name: 'عيد الأضحى',
        date: addDays(new Date(), 60), // Sample date
        type: 'religious',
        description: 'عيد الأضحى المبارك'
      }
    ]

    // Create some sample time slots
    const timeSlots: TimeSlot[] = [
      {
        id: 'slot-1',
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        maxBookings: 1,
        currentBookings: 0,
        isAvailable: true
      },
      {
        id: 'slot-2',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        maxBookings: 1,
        currentBookings: 0,
        isAvailable: true
      },
      {
        id: 'slot-3',
        date: new Date(),
        startTime: '11:00',
        endTime: '12:00',
        maxBookings: 1,
        currentBookings: 0,
        isAvailable: true
      }
    ]

    return NextResponse.json({
      days: calendarDays,
      events: bookingEvents,
      holidays: showHolidays ? holidays : [],
      timeSlots: timeSlots
    })

  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات التقويم' },
      { status: 500 }
    )
  }
}

// Helper function to convert time slot to time range
function getTimeRangeFromTimeSlot(timeSlot: string): [string, string] {
  // Parse time slot like "09:00-10:00" or return default
  if (timeSlot.includes('-')) {
    const [start, end] = timeSlot.split('-')
    return [start.trim(), end.trim()]
  }
  
  // Default 1-hour slot
  return [timeSlot, addHoursToTime(timeSlot, 1)]
}

function addHoursToTime(time: string, hours: number): string {
  const [hoursStr, minutesStr] = time.split(':')
  const hoursNum = parseInt(hoursStr) + hours
  return `${hoursNum.toString().padStart(2, '0')}:${minutesStr}`
}