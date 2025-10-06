import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

    // Fetch calendar data with error handling
    let testDriveBookings = []
    let serviceBookings = []
    let calendarEvents = []
    let holidays = []
    let timeSlots = []

    try {
      [testDriveBookings, serviceBookings, calendarEvents, holidays, timeSlots] = await Promise.all([
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
        }).catch(() => []),

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
        }).catch(() => []),

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
        }).catch(() => []),

        // Holidays
        ...(showHolidays ? [db.holiday.findMany({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          orderBy: { date: 'asc' }
        }).catch(() => [])] : [Promise.resolve([])]),

        // Time slots
        db.timeSlot.findMany({
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' }
        }).catch(() => [])
      ])
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      // Continue with empty arrays if database queries fail
    }

    // Convert bookings to calendar events
    const bookingEvents: any[] = []

    // Add test drive bookings
    testDriveBookings.forEach(booking => {
      try {
        const eventDate = new Date(booking.date)
        const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
        
        const event = {
          id: `test-drive-${booking.id}`,
          title: `اختبار قيادة - ${booking.vehicle?.make || 'غير محدد'} ${booking.vehicle?.model || ''}`,
          description: `عميل: ${booking.customer.name}`,
          start: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${startTime}`),
          end: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${endTime}`),
          type: 'booking',
          status: booking.status,
          resource: booking
        }
        bookingEvents.push(event)
      } catch (error) {
        console.error('Error processing test drive booking:', error)
      }
    })

    // Add service bookings
    serviceBookings.forEach(booking => {
      try {
        const eventDate = new Date(booking.date)
        const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
        
        const event = {
          id: `service-${booking.id}`,
          title: `صيانة - ${booking.serviceType.name}`,
          description: `عميل: ${booking.customer.name}`,
          start: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${startTime}`),
          end: new Date(`${format(eventDate, 'yyyy-MM-dd')}T${endTime}`),
          type: 'booking',
          status: booking.status,
          resource: booking
        }
        bookingEvents.push(event)
      } catch (error) {
        console.error('Error processing service booking:', error)
      }
    })

    // Add calendar events
    calendarEvents.forEach(event => {
      try {
        const calendarEvent = {
          id: `event-${event.id}`,
          title: event.title,
          description: event.description,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          type: 'event',
          status: event.status,
          resource: event
        }
        bookingEvents.push(calendarEvent)
      } catch (error) {
        console.error('Error processing calendar event:', error)
      }
    })

    // Create calendar days
    const calendarDays: any[] = daysInMonth.map(day => {
      try {
        const dayEvents = bookingEvents.filter(event => isSameDay(event.start, day))
        const isTodayDate = isToday(day)
        const isWeekendDate = isWeekend(day)
        const isPastDate = isPast(day) && !isTodayDate
        
        // Check if it's a holiday
        const isHolidayDate = holidays.some(holiday => isSameDay(new Date(holiday.date), day))
        
        return {
          date: day,
          events: dayEvents,
          bookingsCount: dayEvents.filter(e => e.type === 'booking').length,
          isToday: isTodayDate,
          isWeekend: isWeekendDate,
          isPast: isPastDate,
          isHoliday: isHolidayDate,
          availableTimeSlots: [] // TODO: Add time slots logic
        }
      } catch (error) {
        console.error('Error creating calendar day:', error)
        return {
          date: day,
          events: [],
          bookingsCount: 0,
          isToday: isToday(day),
          isWeekend: isWeekend(day),
          isPast: isPast(day) && !isToday(day),
          isHoliday: false,
          availableTimeSlots: []
        }
      }
    })

    // Transform holidays to match expected format
    const transformedHolidays = holidays.map(holiday => ({
      id: holiday.id,
      name: holiday.name,
      date: new Date(holiday.date),
      type: 'religious',
      description: holiday.description,
      isRecurring: holiday.isRecurring
    }))

    // Transform time slots to match expected format
    const transformedTimeSlots = timeSlots.map(slot => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings,
      isActive: slot.isActive,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt
    }))

    return NextResponse.json({
      days: calendarDays,
      events: bookingEvents,
      holidays: showHolidays ? transformedHolidays : [],
      timeSlots: transformedTimeSlots
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