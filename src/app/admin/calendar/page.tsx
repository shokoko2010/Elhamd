'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import InteractiveCalendar from '@/components/ui/interactive-calendar'
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
  XCircle
} from 'lucide-react'
import { CalendarEvent, TimeSlot } from '@/lib/calendar-service'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface CalendarPageState {
  selectedDate: Date | undefined
  selectedEvent: CalendarEvent | undefined
  selectedTimeSlot: TimeSlot | undefined
  showEventDialog: boolean
  showTimeSlotDialog: boolean
  editingEvent: CalendarEvent | null
  filterType: string
  filterStatus: string
  viewMode: 'month' | 'week' | 'day'
}

export default function AdminCalendarPage() {
  const [state, setState] = useState<CalendarPageState>({
    selectedDate: undefined,
    selectedEvent: undefined,
    selectedTimeSlot: undefined,
    showEventDialog: false,
    showTimeSlotDialog: false,
    editingEvent: null,
    filterType: 'all',
    filterStatus: 'all',
    viewMode: 'month'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateState = (updates: Partial<CalendarPageState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleDateSelect = (date: Date) => {
    updateState({ selectedDate: date, selectedEvent: undefined })
  }

  const handleEventSelect = (event: CalendarEvent) => {
    updateState({ selectedEvent: event, selectedTimeSlot: undefined })
  }

  const handleTimeSlotSelect = (date: Date, timeSlot: TimeSlot) => {
    updateState({ selectedDate: date, selectedTimeSlot: timeSlot, selectedEvent: undefined })
  }

  const handleCreateEvent = () => {
    updateState({ editingEvent: null, showEventDialog: true })
  }

  const handleEditEvent = (event: CalendarEvent) => {
    updateState({ editingEvent: event, showEventDialog: true })
  }

  const handleCreateTimeSlot = () => {
    if (!state.selectedDate) return
    updateState({ showTimeSlotDialog: true })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarIcon className="h-4 w-4" />
      case 'holiday': return <AlertCircle className="h-4 w-4" />
      case 'maintenance': return <RefreshCw className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
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

  const getFilterTypes = () => {
    const types = ['all', 'booking', 'holiday', 'maintenance', 'event']
    return types.map(type => ({
      value: type,
      label: type === 'all' ? 'الكل' : 
             type === 'booking' ? 'الحجوزات' :
             type === 'holiday' ? 'العطلات' :
             type === 'maintenance' ? 'الصيانة' : 'الأحداث'
    }))
  }

  const getStatusOptions = () => {
    const statuses = ['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
    return statuses.map(status => ({
      value: status,
      label: status === 'all' ? 'الكل' :
             status === 'PENDING' ? 'قيد الانتظار' :
             status === 'CONFIRMED' ? 'مؤكد' :
             status === 'CANCELLED' ? 'ملغي' : 'مكتمل'
    }))
  }

  // Memoize filter types to prevent unnecessary re-renders
  const memoizedFilterTypes = useMemo(() => {
    return state.filterType === 'all' ? undefined : [state.filterType]
  }, [state.filterType])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التقويم والمواعيد</h1>
        <p className="text-gray-600">إدارة الحجوزات والمواعيد والأحداث</p>
        
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleCreateEvent}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة حدث
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateTimeSlot}
            disabled={!state.selectedDate}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة موعد
          </Button>
          
          <div className="flex gap-2">
            <Select value={state.filterType} onValueChange={(value) => updateState({ filterType: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getFilterTypes().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={state.filterStatus} onValueChange={(value) => updateState({ filterStatus: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
      <InteractiveCalendar
        onDateSelect={handleDateSelect}
        onEventSelect={handleEventSelect}
        onTimeSlotSelect={handleTimeSlotSelect}
        selectedDate={state.selectedDate}
        selectedEvent={state.selectedEvent}
        selectedTimeSlot={state.selectedTimeSlot}
        showTimeSlots={true}
        showEvents={true}
        showHolidays={true}
        filterTypes={memoizedFilterTypes}
        height="700px"
      />

      {/* Selected Event Details */}
      {state.selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getEventIcon(state.selectedEvent.type)}
                تفاصيل الحدث
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditEvent(state.selectedEvent)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">معلومات الحدث</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-600">العنوان</Label>
                    <p className="font-medium">{state.selectedEvent.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">النوع</Label>
                    <Badge variant="outline" className="mt-1">
                      {state.selectedEvent.type === 'booking' ? 'حجز' :
                       state.selectedEvent.type === 'holiday' ? 'عطلة' :
                       state.selectedEvent.type === 'maintenance' ? 'صيانة' : 'حدث'}
                    </Badge>
                  </div>
                  {state.selectedEvent.status && (
                    <div>
                      <Label className="text-sm text-gray-600">الحالة</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(state.selectedEvent.status)}
                        <span className="font-medium">
                          {state.selectedEvent.status === 'PENDING' ? 'قيد الانتظار' :
                           state.selectedEvent.status === 'CONFIRMED' ? 'مؤكد' :
                           state.selectedEvent.status === 'CANCELLED' ? 'ملغي' :
                           state.selectedEvent.status === 'COMPLETED' ? 'مكتمل' : state.selectedEvent.status}
                        </span>
                      </div>
                    </div>
                  )}
                  {state.selectedEvent.description && (
                    <div>
                      <Label className="text-sm text-gray-600">الوصف</Label>
                      <p className="mt-1">{state.selectedEvent.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">التوقيت</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-600">التاريخ</Label>
                    <p className="font-medium">
                      {format(state.selectedEvent.start, 'EEEE, MMMM d, yyyy', { locale: ar })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">الوقت</Label>
                    <p className="font-medium">
                      {format(state.selectedEvent.start, 'HH:mm')} - {format(state.selectedEvent.end, 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">المدة</Label>
                    <p className="font-medium">
                      {Math.round((state.selectedEvent.end.getTime() - state.selectedEvent.start.getTime()) / 60000)} دقيقة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <Dialog open={state.showEventDialog} onOpenChange={(open) => updateState({ showEventDialog: open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {state.editingEvent ? 'تعديل حدث' : 'إضافة حدث جديد'}
            </DialogTitle>
            <DialogDescription>
              {state.editingEvent ? 'تعديل معلومات الحدث المحدد' : 'إضافة حدث جديد إلى التقويم'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">عنوان الحدث</Label>
              <Input
                id="event-title"
                placeholder="أدخل عنوان الحدث"
                defaultValue={state.editingEvent?.title}
              />
            </div>
            
            <div>
              <Label htmlFor="event-type">نوع الحدث</Label>
              <Select defaultValue={state.editingEvent?.type}>
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
                defaultValue={state.editingEvent?.description}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => updateState({ showEventDialog: false })}>
                إلغاء
              </Button>
              <Button>
                {state.editingEvent ? 'حفظ التغييرات' : 'إضافة الحدث'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Slot Dialog */}
      <Dialog open={state.showTimeSlotDialog} onOpenChange={(open) => updateState({ showTimeSlotDialog: open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة موعد جديد</DialogTitle>
            <DialogDescription>
              إضافة موعد متاح لـ {state.selectedDate && format(state.selectedDate, 'EEEE, MMMM d, yyyy', { locale: ar })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">وقت البدء</Label>
                <Input
                  id="start-time"
                  type="time"
                  placeholder="09:00"
                />
              </div>
              
              <div>
                <Label htmlFor="end-time">وقت الانتهاء</Label>
                <Input
                  id="end-time"
                  type="time"
                  placeholder="10:00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="max-bookings">الحد الأقصى للحجوزات</Label>
              <Input
                id="max-bookings"
                type="number"
                placeholder="1"
                min="1"
                max="10"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => updateState({ showTimeSlotDialog: false })}>
                إلغاء
              </Button>
              <Button>
                إضافة الموعد
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}