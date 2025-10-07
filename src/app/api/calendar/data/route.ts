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
    const bookingEvents: CalendarEvent[] = []
    const holidays: Holiday[] = []
    const timeSlots: TimeSlot[] = []

    try {
      // Fetch calendar events if requested
      if (showEvents) {
        const calendarEvents = await db.calendarEvent.findMany({
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

        // Convert calendar events to CalendarEvent format
        calendarEvents.forEach(event => {
          bookingEvents.push({
            id: `event-${event.id}`,
            title: event.title,
            description: event.description,
            start: new Date(event.startTime),
            end: new Date(event.endTime),
            type: 'event',
            status: event.status,
            organizerId: event.organizerId,
            organizerName: event.organizer?.name,
            location: event.location,
            allDay: event.isRecurring,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
          })
        })
      }
    } catch (error) {
      console.warn('Error fetching calendar events:', error)
    }

    try {
      // Fetch test drive bookings if requested
      if (showBookings) {
        const testDriveBookings = await db.testDriveBooking.findMany({
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
        })

        // Convert test drive bookings to calendar events
        testDriveBookings.forEach(booking => {
          const eventDate = new Date(booking.date)
          const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
          
          bookingEvents.push({
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
          })
        })
      }
    } catch (error) {
      console.warn('Error fetching test drive bookings:', error)
    }

    try {
      // Fetch service bookings if requested
      if (showBookings) {
        const serviceBookings = await db.serviceBooking.findMany({
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
        })

        // Convert service bookings to calendar events
        serviceBookings.forEach(booking => {
          const eventDate = new Date(booking.date)
          const [startTime, endTime] = getTimeRangeFromTimeSlot(booking.timeSlot)
          
          bookingEvents.push({
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
          })
        })
      }
    } catch (error) {
      console.warn('Error fetching service bookings:', error)
    }

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
        isHoliday: false,
        availableTimeSlots: []
      }
    })

    // Create some sample holidays if requested
    if (showHolidays) {
      holidays.push(
        {
          id: 'holiday-1',
          name: 'عيد الفطر',
          date: addDays(new Date(), 30),
          type: 'religious',
          description: 'عيد الفطر المبارك'
        },
        {
          id: 'holiday-2',
          name: 'عيد الأضحى',
          date: addDays(new Date(), 60),
          type: 'religious',
          description: 'عيد الأضحى المبارك'
        }
      )
    }

    // Create some sample time slots
    if (showBookings) {
      const startHour = 9 // 9 AM
      const endHour = 17 // 5 PM
      const slotDuration = 1 // 1 hour per slot

      for (let hour = startHour; hour < endHour; hour += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`
        const endTime = `${(hour + slotDuration).toString().padStart(2, '0')}:00`
        
        timeSlots.push({
          id: `slot-${startTime}`,
          dayOfWeek: 1, // Monday
          startTime,
          endTime,
          maxBookings: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
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