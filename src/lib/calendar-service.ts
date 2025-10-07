import { db } from '@/lib/db'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isWithinInterval, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'holiday' | 'maintenance' | 'event'
  status?: string
  description?: string
  color?: string
  resource?: any
}

export interface TimeSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  maxBookings: number
  isActive: boolean
  breakTime?: number
  createdAt: Date
  updatedAt: Date
}

export interface Holiday {
  id: string
  name: string
  date: Date
  isRecurring: boolean
  description?: string
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  isHoliday: boolean
  isPast: boolean
  events: CalendarEvent[]
  availableTimeSlots: TimeSlot[]
  bookingsCount: number
}

export interface CalendarViewOptions {
  view: 'month' | 'week' | 'day'
  currentDate: Date
  showHolidays: boolean
  showBookings: boolean
  showEvents: boolean
  filterTypes?: string[]
  filterStatus?: string[]
}

export class CalendarService {
  private static instance: CalendarService

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService()
    }
    return CalendarService.instance
  }

  async getCalendarData(options: CalendarViewOptions): Promise<{
    days: CalendarDay[]
    events: CalendarEvent[]
    holidays: Holiday[]
    timeSlots: TimeSlot[]
  }> {
    const { view, currentDate, showHolidays, showBookings, showEvents } = options
    
    // Calculate date range based on view
    let startDate: Date
    let endDate: Date

    if (view === 'month') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
      endDate = endOfWeek(currentDate, { weekStartsOn: 6 }) // Saturday
      // Extend to show full month
      startDate = addDays(startDate, -7)
      endDate = addDays(endDate, 7)
    } else if (view === 'week') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
      endDate = endOfWeek(currentDate, { weekStartsOn: 6 })
    } else {
      startDate = new Date(currentDate)
      endDate = new Date(currentDate)
    }

    // Fetch data in parallel
    const [timeSlots, holidays, serviceBookings, testDriveBookings] = await Promise.all([
      this.getTimeSlots(),
      showHolidays ? this.getHolidays(startDate, endDate) : [],
      showBookings ? this.getServiceBookings(startDate, endDate) : [],
      showBookings ? this.getTestDriveBookings(startDate, endDate) : []
    ])

    // Combine all events
    const events: CalendarEvent[] = []

    // Add holiday events
    if (showHolidays) {
      holidays.forEach(holiday => {
        events.push({
          id: `holiday-${holiday.id}`,
          title: holiday.name,
          start: new Date(holiday.date),
          end: new Date(holiday.date),
          type: 'holiday',
          description: holiday.description,
          color: '#ef4444'
        })
      })
    }

    // Add service booking events
    if (showBookings) {
      serviceBookings.forEach(booking => {
        const startTime = this.parseDateTime(booking.date, booking.timeSlot)
        const endTime = new Date(startTime.getTime() + booking.serviceType.duration * 60000)

        events.push({
          id: `service-booking-${booking.id}`,
          title: `${booking.serviceType.name} - ${booking.customer.name}`,
          start: startTime,
          end: endTime,
          type: 'booking',
          status: booking.status,
          description: `خدمة صيانة للسيارة ${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`,
          color: this.getStatusColor(booking.status),
          resource: booking
        })
      })
    }

    // Add test drive booking events
    if (showBookings) {
      testDriveBookings.forEach(booking => {
        const startTime = this.parseDateTime(booking.date, booking.timeSlot)
        const endTime = new Date(startTime.getTime() + 60 * 60000) // 1 hour for test drives

        events.push({
          id: `test-drive-booking-${booking.id}`,
          title: `تجربة قيادة - ${booking.customer.name}`,
          start: startTime,
          end: endTime,
          type: 'booking',
          status: booking.status,
          description: `تجربة قيادة ${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`,
          color: this.getStatusColor(booking.status),
          resource: booking
        })
      })
    }

    // Generate calendar days
    const days = this.generateCalendarDays(startDate, endDate, events, timeSlots)

    return {
      days,
      events,
      holidays,
      timeSlots
    }
  }

  private async getTimeSlots(): Promise<TimeSlot[]> {
    return await db.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { dayOfWeek: 'asc' }
    })
  }

  private async getHolidays(startDate: Date, endDate: Date): Promise<Holiday[]> {
    return await db.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })
  }

  private async getServiceBookings(startDate: Date, endDate: Date) {
    return await db.serviceBooking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        serviceType: true,
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
      }
    })
  }

  private async getTestDriveBookings(startDate: Date, endDate: Date) {
    return await db.testDriveBooking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })
  }

  private generateCalendarDays(
    startDate: Date, 
    endDate: Date, 
    events: CalendarEvent[], 
    timeSlots: TimeSlot[]
  ): CalendarDay[] {
    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let date = new Date(startDate); date <= endDate; date = addDays(date, 1)) {
      const dayEvents = events.filter(event => isSameDay(event.start, date))
      const dayOfWeek = date.getDay()
      const dayTimeSlots = timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek)
      
      // Check if it's a holiday
      const isHoliday = events.some(event => 
        event.type === 'holiday' && isSameDay(event.start, date)
      )

      // Count bookings for this day
      const bookingsCount = dayEvents.filter(event => event.type === 'booking').length

      days.push({
        date: new Date(date),
        isCurrentMonth: true, // This should be calculated based on the current month view
        isToday: isSameDay(date, today),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday,
        isPast: date < today,
        events: dayEvents,
        availableTimeSlots: dayTimeSlots,
        bookingsCount
      })
    }

    return days
  }

  private parseDateTime(dateString: string, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date(dateString)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  private getStatusColor(status: string): string {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#10b981',
      CANCELLED: '#ef4444',
      COMPLETED: '#3b82f6',
      NO_SHOW: '#6b7280'
    }
    return colors[status as keyof typeof colors] || '#6b7280'
  }

  async checkTimeSlotAvailability(
    date: Date, 
    timeSlot: TimeSlot, 
    excludeBookingId?: string
  ): Promise<{
    available: boolean
    currentBookings: number
    maxBookings: number
    conflictingBookings: any[]
  }> {
    // Check if it's a holiday
    const holidays = await this.getHolidays(date, date)
    const isHoliday = holidays.some(holiday => isSameDay(new Date(holiday.date), date))
    
    if (isHoliday) {
      return {
        available: false,
        currentBookings: 0,
        maxBookings: timeSlot.maxBookings,
        conflictingBookings: []
      }
    }

    // Check if it's in the past
    if (date < new Date().setHours(0, 0, 0, 0)) {
      return {
        available: false,
        currentBookings: 0,
        maxBookings: timeSlot.maxBookings,
        conflictingBookings: []
      }
    }

    // Parse time slot times
    const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number)
    const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number)

    const slotStart = new Date(date)
    slotStart.setHours(startHour, startMinute, 0, 0)

    const slotEnd = new Date(date)
    slotEnd.setHours(endHour, endMinute, 0, 0)

    // Get conflicting bookings
    const [serviceBookings, testDriveBookings] = await Promise.all([
      this.getServiceBookings(date, date),
      this.getTestDriveBookings(date, date)
    ])

    const allBookings = [...serviceBookings, ...testDriveBookings]
    
    const conflictingBookings = allBookings.filter(booking => {
      if (excludeBookingId && booking.id === excludeBookingId) {
        return false
      }

      const bookingStartTime = this.parseDateTime(booking.date, booking.timeSlot)
      const bookingDuration = booking.serviceType?.duration || 60 // Default to 60 minutes
      const bookingEndTime = new Date(bookingStartTime.getTime() + bookingDuration * 60000)

      return (
        isWithinInterval(slotStart, { start: bookingStartTime, end: bookingEndTime }) ||
        isWithinInterval(slotEnd, { start: bookingStartTime, end: bookingEndTime }) ||
        isWithinInterval(bookingStartTime, { start: slotStart, end: slotEnd })
      )
    })

    const currentBookings = conflictingBookings.length
    const available = currentBookings < timeSlot.maxBookings

    return {
      available,
      currentBookings,
      maxBookings: timeSlot.maxBookings,
      conflictingBookings
    }
  }

  async getAvailableTimeSlots(date: Date): Promise<TimeSlot[]> {
    const timeSlots = await this.getTimeSlots()
    const dayOfWeek = date.getDay()
    const dayTimeSlots = timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek)

    // Check availability for each time slot
    const availableSlots: TimeSlot[] = []
    
    for (const slot of dayTimeSlots) {
      const availability = await this.checkTimeSlotAvailability(date, slot)
      if (availability.available) {
        availableSlots.push(slot)
      }
    }

    return availableSlots
  }

  formatEventTime(event: CalendarEvent): string {
    return `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
  }

  formatEventDate(event: CalendarEvent): string {
    return format(event.start, 'PPP', { locale: ar })
  }

  getEventDuration(event: CalendarEvent): number {
    return Math.round((event.end.getTime() - event.start.getTime()) / 60000) // minutes
  }
}