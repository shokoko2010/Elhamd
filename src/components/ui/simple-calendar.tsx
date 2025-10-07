'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SimpleCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
  className?: string
  height?: string
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'holiday' | 'event'
  status?: string
}

export default function SimpleCalendar({
  onDateSelect,
  selectedDate,
  className = '',
  height = '600px'
}: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadEvents = async () => {
    setLoading(true)
    setError('')
    
    try {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      
      const response = await fetch(`/api/calendar/data?view=month&currentDate=${currentDate.toISOString()}&showHolidays=true&showBookings=true&showEvents=true`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error loading calendar events:', err)
      setError('فشل في تحميل أحداث التقويم')
      // Add some sample events for demonstration
      setEvents([
        {
          id: '1',
          title: 'حجز صيانة',
          start: new Date(),
          end: new Date(Date.now() + 60 * 60 * 1000),
          type: 'booking',
          status: 'CONFIRMED'
        },
        {
          id: '2',
          title: 'اختبار قيادة',
          start: new Date(Date.now() + 2 * 60 * 60 * 1000),
          end: new Date(Date.now() + 3 * 60 * 60 * 1000),
          type: 'booking',
          status: 'PENDING'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date)
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
    const startDay = getDay(firstDayOfMonth) // 0 = Sunday, 1 = Monday, etc.
    
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
              
              const dayEvents = events.filter(event => isSameDay(event.start, day))
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    'min-h-[80px] p-1 border border-gray-200 rounded-lg cursor-pointer transition-all',
                    'hover:bg-gray-50',
                    isSelected && 'ring-2 ring-blue-500 bg-blue-50',
                    isTodayDate && 'bg-blue-100',
                    getDay(day) === 0 || getDay(day) === 6 ? 'bg-gray-50' : '',
                    'hover:shadow-sm'
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      'text-sm font-medium text-center mb-1',
                      isTodayDate && 'text-blue-600 font-bold',
                      getDay(day) === 0 || getDay(day) === 6 ? 'text-red-600' : ''
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs p-1 rounded border cursor-pointer truncate',
                            getEventTypeColor(event.type, event.status)
                          )}
                          title={event.title}
                        >
                          {format(event.start, 'HH:mm')} {event.title.split(' - ')[0]}
                        </div>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
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
              <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading}>
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
              <div className="text-center">
                <div className="text-lg font-medium mb-2">خطأ</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : (
            <div style={{ height }} className="overflow-auto">
              {renderMonthView()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}