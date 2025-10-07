'use client'

import { useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import SimpleCalendar from '@/components/ui/simple-calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'booking' | 'holiday' | 'maintenance' | 'event'
  status?: string
  description?: string
}

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>()
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(undefined)
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventDialog(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventDialog(true)
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
      <SimpleCalendar
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        height="700px"
      />

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
            <div className="text-center text-gray-500 py-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>تم اختيار التاريخ: {format(selectedDate, 'dd/MM/yyyy', { locale: ar })}</p>
              <p className="text-sm mt-2">يمكنك إضافة أحداث أو حجوزات لهذا التاريخ</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={(open) => setShowEventDialog(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'تعديل حدث' : 'إضافة حدث جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? 'تعديل معلومات الحدث المحدد' : 'إضافة حدث جديد إلى التقويم'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">عنوان الحدث</Label>
              <Input
                id="event-title"
                placeholder="أدخل عنوان الحدث"
                defaultValue={editingEvent?.title}
              />
            </div>
            
            <div>
              <Label htmlFor="event-type">نوع الحدث</Label>
              <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                <option value="booking">حجز</option>
                <option value="holiday">عطلة</option>
                <option value="maintenance">صيانة</option>
                <option value="event">حدث عام</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="event-description">الوصف</Label>
              <Textarea
                id="event-description"
                placeholder="أدخل وصف الحدث"
                rows={3}
                defaultValue={editingEvent?.description}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                إلغاء
              </Button>
              <Button>
                {editingEvent ? 'حفظ التغييرات' : 'إضافة الحدث'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}