'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, AlertCircle, RefreshCw } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClientCalendarService, CalendarEvent, CalendarDay, TimeSlot } from '@/lib/client-calendar-service'
import { cn } from '@/lib/utils'

interface InteractiveCalendarProps {
  onDateSelect?: (date: Date) => void
  onEventSelect?: (event: CalendarEvent) => void
  onTimeSlotSelect?: (date: Date, timeSlot: TimeSlot) => void
  selectedDate?: Date
  selectedEvent?: CalendarEvent
  selectedTimeSlot?: TimeSlot
  className?: string
  showTimeSlots?: boolean
  showEvents?: boolean
  showHolidays?: boolean
  filterTypes?: string[]
  height?: string
}

const InteractiveCalendar = memo(({
  onDateSelect,
  onEventSelect,
  onTimeSlotSelect,
  selectedDate,
  selectedEvent,
  selectedTimeSlot,
  className = '',
  showTimeSlots = true,
  showEvents = true,
  showHolidays = true,
  filterTypes = ['booking', 'holiday'],
  height = '600px'
}: InteractiveCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<{
    days: CalendarDay[]
    events: CalendarEvent[]
    holidays: any[]
    timeSlots: TimeSlot[]
  }>({
    days: [],
    events: [],
    holidays: [],
    timeSlots: []
  })
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')
  const [manualRefresh, setManualRefresh] = useState(0) // For manual refresh trigger

  const calendarService = ClientCalendarService.getInstance()
  
  // Memoize calendar service to prevent recreation
  const memoizedCalendarService = useMemo(() => calendarService, [])

  const loadAvailableTimeSlots = useCallback(async (date: Date) => {
    try {
      const slots = await memoizedCalendarService.getAvailableTimeSlots(date)
      setAvailableTimeSlots(slots)
    } catch (err) {
      console.error('Error loading time slots:', err)
      setAvailableTimeSlots([])
    }
  }, [memoizedCalendarService]) // Use memoized service

  const loadCalendarData = useCallback(async () => {
    setLoading(true)
    setError('')
    
    try {
      const data = await memoizedCalendarService.getCalendarData({
        view,
        currentDate,
        showHolidays,
        showBookings: filterTypes.includes('booking'),
        showEvents: filterTypes.includes('event')
      })
      
      setCalendarData(data)
    } catch (err) {
      console.error('Error loading calendar data:', err)
      setError('فشل في تحميل بيانات التقويم')
    } finally {
      setLoading(false)
    }
  }, [view, currentDate, showHolidays, filterTypes.join(','), memoizedCalendarService]) // Use join(',') to stabilize array dependency

  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData, manualRefresh])

  // Prevent infinite loading by adding a timeout check
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false)
        setError('استغرق التحميل وقتاً طويلاً جداً')
      }, 10000) // 10 second timeout
      
      return () => clearTimeout(timeout)
    }
  }, [loading])

  useEffect(() => {
    if (selectedDate && showTimeSlots) {
      loadAvailableTimeSlots(selectedDate)
    }
  }, [selectedDate, showTimeSlots, loadAvailableTimeSlots])

  // Prevent infinite loading for time slots
  useEffect(() => {
    if (loading && selectedDate && showTimeSlots) {
      const timeout = setTimeout(() => {
        setAvailableTimeSlots([])
      }, 5000) // 5 second timeout for time slots
      
      return () => clearTimeout(timeout)
    }
  }, [loading, selectedDate, showTimeSlots])

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || day.isHoliday) return
    
    const date = new Date(day.date)
    onDateSelect?.(date)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect?.(event)
  }

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!selectedDate) return
    onTimeSlotSelect?.(selectedDate, timeSlot)
  }

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }

  const getEventTypeColor = (type: string, status?: string) => {
    if (type === 'holiday') return 'bg-red-100 text-red-800 border-red-200'
    if (type === 'booking') {
      switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200'
        case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
        case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
    return 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth()
    const firstDayOfMonth = daysInMonth[0]
    const startDay = firstDayOfMonth.getDay()
    
    // Create array for empty cells before the first day
    const emptyCells = Array(startDay).fill(null)
    
    // Create array for all days in the month
    const allDays = [...emptyCells, ...daysInMonth]
    
    // Group into weeks
    const weeks = []
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7))
    }

    const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

    return (
      <div className="space-y-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIndex) => 
            week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="p-2" />
              }
              
              const calendarDay = calendarData.days.find(d => isSameDay(d.date, day))
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasEvents = calendarDay?.events.length > 0
              
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    'min-h-[80px] p-1 border border-gray-200 rounded-lg cursor-pointer transition-all',
                    'hover:bg-gray-50',
                    isSelected && 'ring-2 ring-blue-500 bg-blue-50',
                    calendarDay?.isToday && 'bg-blue-100',
                    calendarDay?.isWeekend && 'bg-gray-50',
                    calendarDay?.isHoliday && 'bg-red-50',
                    calendarDay?.isPast && 'opacity-50 cursor-not-allowed',
                    !calendarDay?.isPast && !calendarDay?.isHoliday && 'hover:shadow-sm'
                  )}
                  onClick={() => calendarDay && handleDateClick(calendarDay)}
                >
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      'text-sm font-medium text-center mb-1',
                      calendarDay?.isToday && 'text-blue-600 font-bold',
                      calendarDay?.isWeekend && 'text-red-600',
                      calendarDay?.isHoliday && 'text-red-600'
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      {hasEvents && calendarDay?.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs p-1 rounded border cursor-pointer truncate',
                            getEventTypeColor(event.type, event.status)
                          )}
                          onClick={(e) => handleEventClick(event, e)}
                          title={event.title}
                        >
                          {format(event.start, 'HH:mm')} {event.title.split(' - ')[0]}
                        </div>
                      ))}
                      
                      {hasEvents && calendarDay.events.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{calendarDay.events.length - 2}
                        </div>
                      )}
                    </div>
                    
                    {calendarDay?.bookingsCount > 0 && (
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {calendarDay.bookingsCount}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy', { locale: ar })}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setManualRefresh(prev => prev + 1)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                اليوم
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center" style={{ height }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center text-red-600" style={{ height }}>
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : (
            <div style={{ height }} className="overflow-auto">
              {renderMonthView()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: ar })}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Events for selected date */}
              {showEvents && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    الأحداث اليوم
                  </h3>
                  {calendarData.days.find(d => isSameDay(d.date, selectedDate))?.events.length ? (
                    <div className="space-y-2">
                      {calendarData.days
                        .find(d => isSameDay(d.date, selectedDate))
                        ?.events.map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              'p-3 rounded-lg border cursor-pointer transition-all',
                              'hover:shadow-md',
                              selectedEvent?.id === event.id && 'ring-2 ring-blue-500',
                              getEventTypeColor(event.type, event.status)
                            )}
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-sm opacity-75">
                                  {calendarService.formatEventTime(event)}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.type === 'booking' ? 'حجز' : event.type === 'holiday' ? 'عطلة' : 'حدث'}
                              </Badge>
                            </div>
                            {event.description && (
                              <div className="text-sm mt-2 opacity-75">
                                {event.description}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      لا توجد أحداث في هذا اليوم
                    </div>
                  )}
                </div>
              )}

              {/* Available Time Slots */}
              {showTimeSlots && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    المواعيد المتاحة
                  </h3>
                  {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {availableTimeSlots.map(slot => (
                        <Button
                          key={slot.id}
                          variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                          size="sm"
                          className="text-sm"
                          onClick={() => handleTimeSlotClick(slot)}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      لا توجد مواعيد متاحة في هذا اليوم
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

InteractiveCalendar.displayName = 'InteractiveCalendar'

export default InteractiveCalendar