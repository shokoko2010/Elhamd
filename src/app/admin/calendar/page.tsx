'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { ar } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'holiday' | 'maintenance' | 'event'
  status?: string
  description?: string
  customerName?: string
  vehicleName?: string
}

interface SimpleCalendarDay {
  date: Date
  events: CalendarEvent[]
  isToday: boolean
  isCurrentMonth: boolean
}

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Load calendar data
  useEffect(() => {
    loadCalendarData()
  }, [currentDate, filterType])

  const loadCalendarData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        view: 'month',
        currentDate: currentDate.toISOString(),
        showHolidays: 'true',
        showBookings: 'true',
        showEvents: 'true',
        filterTypes: filterType === 'all' ? 'booking,holiday,event' : filterType
      })

      const response = await fetch(`/api/calendar/data?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error loading calendar data:', err)
      setError('فشل في تحميل بيانات التقويم')
    } finally {
      setLoading(false)
    }
  }

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
    setSelectedDate(date)
    setSelectedEvent(undefined)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.start, date))
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

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-600" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return null
    }
  }

  const renderCalendar = () => {
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
              
              const dayEvents = getEventsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              const isCurrentMonthDate = isSameMonth(day, currentDate)
              
              return (
                <div
                  key={day.toString()}
                  className={`min-h-[80px] p-1 border border-gray-200 rounded-lg cursor-pointer transition-all
                    hover:bg-gray-50
                    ${isSelected && 'ring-2 ring-blue-500 bg-blue-50'}
                    ${isTodayDate && 'bg-blue-100'}
                    ${!isCurrentMonthDate && 'opacity-50'}
                    hover:shadow-sm
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <div className={`text-sm font-medium text-center mb-1
                      ${isTodayDate && 'text-blue-600 font-bold'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border cursor-pointer truncate
                            ${getEventTypeColor(event.type, event.status)}
                          `}
                          onClick={(e) => handleEventClick(event, e)}
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
                    
                    {dayEvents.length > 0 && (
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {dayEvents.length}
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
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقويم والمواعيد</h1>
        <p className="text-gray-600">إدارة الحجوزات والمواعيد والأحداث</p>
        
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => setShowEventDialog(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة حدث
          </Button>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="booking">الحجوزات</SelectItem>
                <SelectItem value="holiday">العطلات</SelectItem>
                <SelectItem value="event">الأحداث</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-red-800">خطأ</h3>
                <div className="mt-1 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy', { locale: ar })}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadCalendarData} disabled={loading}>
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
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-auto">
              {renderCalendar()}
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
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  الأحداث اليوم
                </h3>
                {getEventsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all
                          hover:shadow-md
                          ${selectedEvent?.id === event.id && 'ring-2 ring-blue-500'}
                          ${getEventTypeColor(event.type, event.status)}
                        `}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm opacity-75">
                              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(event.status)}
                            <Badge variant="outline" className="text-xs">
                              {event.type === 'booking' ? 'حجز' : 
                               event.type === 'holiday' ? 'عطلة' : 'حدث'}
                            </Badge>
                          </div>
                        </div>
                        {event.description && (
                          <div className="text-sm mt-2 opacity-75">
                            {event.description}
                          </div>
                        )}
                        {event.customerName && (
                          <div className="text-sm mt-1 opacity-75">
                            عميل: {event.customerName}
                          </div>
                        )}
                        {event.vehicleName && (
                          <div className="text-sm mt-1 opacity-75">
                            سيارة: {event.vehicleName}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة حدث جديد</DialogTitle>
            <DialogDescription>
              إضافة حدث جديد إلى التقويم
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">عنوان الحدث</Label>
              <Input
                id="event-title"
                placeholder="أدخل عنوان الحدث"
              />
            </div>
            
            <div>
              <Label htmlFor="event-type">نوع الحدث</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحدث" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">حجز</SelectItem>
                  <SelectItem value="holiday">عطلة</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                  <SelectItem value="event">حدث عام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="event-description">الوصف</Label>
              <Textarea
                id="event-description"
                placeholder="أدخل وصف الحدث"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                إلغاء
              </Button>
              <Button>
                إضافة الحدث
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}