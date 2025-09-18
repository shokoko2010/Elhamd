'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, isSameDay, isWithinInterval } from 'date-fns'
import { ar } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ClockIcon, UsersIcon } from 'lucide-react'
import { TimeSlot, ServiceBooking, Holiday } from '@prisma/client'

const locales = {
  'ar': ar,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface BookingCalendarProps {
  bookings: (ServiceBooking & {
    serviceType: { name: string; duration: number }
    customer: { name: string; email: string }
    vehicle?: { make: string; model: string }
  })[]
  timeSlots: TimeSlot[]
  holidays: Holiday[]
  onDateSelect: (date: Date, timeSlot: TimeSlot) => void
  selectedDate?: Date
  selectedTimeSlot?: TimeSlot
}

interface CustomEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    booking: ServiceBooking & {
      serviceType: { name: string; duration: number }
      customer: { name: string; email: string }
      vehicle?: { make: string; model: string }
    }
    status: string
    type: 'booking' | 'holiday'
  }
}

export default function BookingCalendar({
  bookings,
  timeSlots,
  holidays,
  onDateSelect,
  selectedDate,
  selectedTimeSlot,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState(Views.WEEK)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    if (selectedDate) {
      const dayOfWeek = selectedDate.getDay()
      const daySlots = timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek && slot.isActive)
      setAvailableTimeSlots(daySlots)
    }
  }, [selectedDate, timeSlots])

  // Check if a date is a holiday
  const isHoliday = (date: Date) => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date)
      return isSameDay(date, holidayDate)
    })
  }

  // Check if a time slot is available
  const isTimeSlotAvailable = (date: Date, timeSlot: TimeSlot) => {
    // Check if it's a holiday
    if (isHoliday(date)) return false

    // Check if it's in the past
    if (date < new Date()) return false

    // Parse time slot times
    const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number)
    const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number)

    const slotStart = new Date(date)
    slotStart.setHours(startHour, startMinute, 0, 0)

    const slotEnd = new Date(date)
    slotEnd.setHours(endHour, endMinute, 0, 0)

    // Check for conflicting bookings
    const conflictingBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      if (!isSameDay(bookingDate, date)) return false

      const [bookingHour, bookingMinute] = booking.timeSlot.split(':').map(Number)
      const bookingStart = new Date(bookingDate)
      bookingStart.setHours(bookingHour, bookingMinute, 0, 0)

      const bookingDuration = booking.serviceType.duration
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60000)

      return isWithinInterval(slotStart, { start: bookingStart, end: bookingEnd }) ||
             isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd }) ||
             isWithinInterval(bookingStart, { start: slotStart, end: slotEnd })
    })

    // Check max bookings limit
    const slotBookingsCount = conflictingBookings.length
    return slotBookingsCount < timeSlot.maxBookings
  }

  // Get bookings count for a time slot
  const getBookingsCount = (date: Date, timeSlot: TimeSlot) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      return isSameDay(bookingDate, date) && booking.timeSlot === timeSlot.startTime
    }).length
  }

  // Create calendar events
  const events: CustomEvent[] = [
    // Holiday events
    ...holidays.map(holiday => ({
      id: `holiday-${holiday.id}`,
      title: holiday.name,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      resource: {
        booking: null,
        status: 'holiday',
        type: 'holiday' as const,
      },
    })),
    // Booking events
    ...bookings.map(booking => {
      const bookingDate = new Date(booking.date)
      const [hour, minute] = booking.timeSlot.split(':').map(Number)
      const startTime = new Date(bookingDate)
      startTime.setHours(hour, minute, 0, 0)
      
      const endTime = new Date(startTime.getTime() + booking.serviceType.duration * 60000)

      return {
        id: `booking-${booking.id}`,
        title: `${booking.serviceType.name} - ${booking.customer.name}`,
        start: startTime,
        end: endTime,
        resource: {
          booking,
          status: booking.status,
          type: 'booking' as const,
        },
      }
    }),
  ]

  // Custom event component
  const EventComponent = ({ event }: { event: CustomEvent }) => {
    const { resource } = event
    
    if (resource.type === 'holiday') {
      return (
        <div className="bg-red-100 text-red-800 p-1 rounded text-xs">
          <div className="font-semibold">{event.title}</div>
          <div className="text-xs">عطلة رسمية</div>
        </div>
      )
    }

    const { booking } = resource
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
    }

    return (
      <div className={`p-1 rounded text-xs ${statusColors[resource.status as keyof typeof statusColors]}`}>
        <div className="font-semibold truncate">{booking.serviceType.name}</div>
        <div className="text-xs truncate">{booking.customer.name}</div>
        <div className="text-xs">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</div>
      </div>
    )
  }

  // Custom day cell component
  const DayCell = ({ date }: { date: Date }) => {
    const isHolidayDate = isHoliday(date)
    const isPast = date < new Date().setHours(0, 0, 0, 0)
    
    return (
      <div className={`h-full w-full ${isHolidayDate ? 'bg-red-50' : isPast ? 'bg-gray-50' : ''}`}>
        <div className="text-right p-1">
          {format(date, 'd')}
          {isHolidayDate && (
            <div className="text-xs text-red-600">عطلة</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            التقويم والحجوزات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="ar"
              view={view}
              views={[Views.WEEK, Views.DAY, Views.MONTH]}
              onView={setView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectSlot={(slotInfo) => {
                if (slotInfo.start) {
                  onDateSelect(slotInfo.start, null)
                }
              }}
              selectable
              components={{
                event: EventComponent,
                dayWrapper: ({ children, value }) => (
                  <div className="relative">
                    {children}
                    <DayCell date={value} />
                  </div>
                ),
              }}
              messages={{
                week: 'أسبوع',
                work_week: 'أسبوع العمل',
                day: 'يوم',
                month: 'شهر',
                previous: 'السابق',
                next: 'التالي',
                today: 'اليوم',
                agenda: 'جدول',
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              المواعيد المتاحة - {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: ar })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isHoliday(selectedDate) ? (
              <div className="text-center py-8">
                <Badge variant="destructive" className="mb-2">
                  عطلة رسمية
                </Badge>
                <p className="text-gray-600">
                  هذا اليوم عطلة رسمية ({holidays.find(h => isSameDay(new Date(h.date), selectedDate))?.name})
                </p>
              </div>
            ) : selectedDate < new Date().setHours(0, 0, 0, 0) ? (
              <div className="text-center py-8">
                <Badge variant="secondary" className="mb-2">
                  تاريخ منتهي
                </Badge>
                <p className="text-gray-600">
                  هذا التاريخ قد انتهى، يرجى اختيار تاريخ مستقبلي
                </p>
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div className="text-center py-8">
                <Badge variant="secondary" className="mb-2">
                  لا توجد مواعيد متاحة
                </Badge>
                <p className="text-gray-600">
                  لا توجد مواعيد متاحة في هذا اليوم
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTimeSlots.map((timeSlot) => {
                  const isAvailable = isTimeSlotAvailable(selectedDate, timeSlot)
                  const bookingsCount = getBookingsCount(selectedDate, timeSlot)
                  const isSelected = selectedTimeSlot?.id === timeSlot.id

                  return (
                    <Card
                      key={timeSlot.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : isAvailable
                          ? 'hover:shadow-md'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => isAvailable && onDateSelect(selectedDate, timeSlot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </div>
                          <Badge variant={isAvailable ? 'default' : 'secondary'}>
                            {isAvailable ? 'متاح' : 'محجوز'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UsersIcon className="h-4 w-4" />
                          <span>
                            {bookingsCount} / {timeSlot.maxBookings} حجوزات
                          </span>
                        </div>
                        {!isAvailable && bookingsCount >= timeSlot.maxBookings && (
                          <p className="text-xs text-red-600 mt-2">
                            تم الوصول للحد الأقصى من الحجوزات
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}