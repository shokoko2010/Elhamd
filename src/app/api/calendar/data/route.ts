import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CalendarEvent, TimeSlot, CalendarDay, Holiday } from '@/lib/calendar-service'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isWeekend, isPast, addDays } from 'date-fns'
import { ar } from 'date-fns/locale'

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

    // Initialize empty arrays for data
    let testDriveBookings = []
    let serviceBookings = []
    let calendarEvents = []

    // Try to fetch calendar data with error handling
    try {
      [testDriveBookings, serviceBookings, calendarEvents] = await Promise.all([
        // Test drive bookings
        db.testDriveBooking.findMany({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd
            }
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
                year: true
              }
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
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            serviceType: {
              select: {
                id: true,
                name: true,
                duration: true,
                price: true
              }
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true
              }
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
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: [
            { startTime: 'asc' }
          ]
        })
      ])
    } catch (dbError) {
      console.error('Database query failed, returning empty data:', dbError)
      // Continue with empty arrays if database queries fail
    }

    // Convert bookings to calendar events
    const bookingEvents: CalendarEvent[] = []

    // Add test drive bookings
    testDriveBookings.forEach(booking => {
      const eventDate = new Date(booking.date)
      const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
      
      const event: CalendarEvent = {
        id: `test-drive-${booking.id}`,
        title: `اختبار قيادة - ${booking.vehicle?.make || 'غير محدد'} ${booking.vehicle?.model || ''}`,
        description: `عميل: ${booking.customer.name}`,
        start: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${startTime}`),
        end: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${endTime}`),
        type: 'booking',
        status: booking.status as any,
        customerId: booking.customerId,
        vehicleId: booking.vehicleId,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        vehicleName: `${booking.vehicle?.make || 'غير محدد'} ${booking.vehicle?.model || ''}`,
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
        title: `صيانة - ${booking.serviceType.name}`,
        description: `عميل: ${booking.customer.name}`,
        start: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${startTime}`),
        end: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${endTime}`),
        type: 'booking',
        status: booking.status as any,
        customerId: booking.customerId,
        vehicleId: booking.vehicleId,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        vehicleName: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : undefined,
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
        status: event.status as any,
        organizerId: event.organizerId,
        organizerName: event.organizer?.name,
        location: event.location,
        allDay: false, // Default to false since schema doesn't have this field
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }
      bookingEvents.push(calendarEvent)
    })

    // Create holidays from database or empty array
    let holidays: Holiday[] = []
    if (showHolidays) {
      try {
        holidays = await db.holiday.findMany({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      } catch (holidayError) {
        console.error('Failed to fetch holidays:', holidayError)
        holidays = []
      }
    }

    // Create calendar days
    const calendarDays: CalendarDay[] = daysInMonth.map(day => {
      const dayEvents = bookingEvents.filter(event => isSameDay(event.start, day))
      const isTodayDate = isToday(day)
      const isWeekendDate = isWeekend(day)
      const isPastDate = isPast(day) && !isTodayDate
      
      // Check if this day is a holiday
      const isHolidayDate = holidays.some(holiday => isSameDay(new Date(holiday.date), day))
      
      return {
        date: day,
        events: dayEvents,
        bookingsCount: dayEvents.filter(e => e.type === 'booking').length,
        isToday: isTodayDate,
        isWeekend: isWeekendDate,
        isPast: isPastDate,
        isHoliday: isHolidayDate,
        availableTimeSlots: [] // Will be populated in frontend based on day of week
      }
    })

    // Create time slots from database or sample data
    let timeSlots: TimeSlot[] = []
    try {
      const dbTimeSlots = await db.timeSlot.findMany({
        where: { isActive: true }
      })
      
      // Convert database TimeSlot to calendar-service TimeSlot format
      timeSlots = dbTimeSlots.map(slot => ({
        id: slot.id,
        date: new Date(), // Will be filtered by day of week in frontend
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxBookings: slot.maxBookings,
        currentBookings: 0, // Will be calculated dynamically
        isAvailable: true
      }))
    } catch (timeSlotError) {
      console.error('Failed to fetch time slots, using sample data:', timeSlotError)
      // Use sample time slots as fallback
      timeSlots = [
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
    }

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