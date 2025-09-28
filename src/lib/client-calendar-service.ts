import { CalendarEvent, TimeSlot, CalendarDay, Holiday, CalendarViewOptions } from './calendar-service'

export class ClientCalendarService {
  private static instance: ClientCalendarService

  static getInstance(): ClientCalendarService {
    if (!ClientCalendarService.instance) {
      ClientCalendarService.instance = new ClientCalendarService()
    }
    return ClientCalendarService.instance
  }

  async getCalendarData(options: CalendarViewOptions): Promise<{
    days: CalendarDay[]
    events: CalendarEvent[]
    holidays: Holiday[]
    timeSlots: TimeSlot[]
  }> {
    const params = new URLSearchParams({
      view: options.view,
      currentDate: options.currentDate.toISOString(),
      showHolidays: options.showHolidays.toString(),
      showBookings: options.showBookings.toString(),
      showEvents: options.showEvents.toString(),
      filterTypes: options.filterTypes?.join(',') || 'booking,holiday'
    })

    const response = await fetch(`/api/calendar/data?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getAvailableTimeSlots(date: Date): Promise<TimeSlot[]> {
    const params = new URLSearchParams({
      date: date.toISOString()
    })

    const response = await fetch(`/api/calendar/available-slots?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  formatEventTime(event: CalendarEvent): string {
    return `${event.start.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
  }

  formatEventDate(event: CalendarEvent): string {
    return event.start.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  getEventDuration(event: CalendarEvent): number {
    return Math.round((event.end.getTime() - event.start.getTime()) / 60000) // minutes
  }
}