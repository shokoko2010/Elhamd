'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  Car,
  Target,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Filter,
  Search,
  Video,
  Phone,
  Mail,
  Bell,
  Repeat,
  Link,
  Paperclip,
  MoreHorizontal,
  Grid,
  List,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  type: 'appointment' | 'meeting' | 'task_deadline' | 'reminder' | 'availability' | 'training' | 'break'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  location?: string
  attendees: string[]
  bookingId?: string
  taskId?: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: string
  meetingLink?: string
  attachments?: string[]
  reminders?: string[]
  createdAt: string
  updatedAt: string
  booking?: {
    id: string
    type: string
    customer: {
      id: string
      name: string
      email: string
      phone: string
    }
    vehicle?: {
      make: string
      model: string
      year: number
    }
    serviceType?: {
      name: string
      category: string
    }
  }
  task?: {
    id: string
    title: string
    assignee: {
      id: string
      name: string
      email: string
    }
    customer?: {
      id: string
      name: string
      email: string
      phone: string
    }
  }
  organizer?: {
    id: string
    name: string
    email: string
  }
}

interface EventFormData {
  title: string
  description?: string
  startTime: string
  endTime: string
  type: 'appointment' | 'meeting' | 'task_deadline' | 'reminder' | 'availability' | 'training' | 'break'
  location?: string
  attendees: string[]
  notes?: string
  isRecurring?: boolean
  recurringPattern?: string
  meetingLink?: string
  reminders?: string[]
}

interface CalendarStats {
  totalEvents: number
  todayEvents: number
  upcomingEvents: number
  completedEvents: number
  meetingsScheduled: number
  appointmentsScheduled: number
  conflicts: number
}

export default function EnhancedCalendar() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState<CalendarStats>({
    totalEvents: 0,
    todayEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    meetingsScheduled: 0,
    appointmentsScheduled: 0,
    conflicts: 0
  })
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'appointment',
    location: '',
    attendees: [],
    notes: '',
    isRecurring: false,
    recurringPattern: '',
    meetingLink: '',
    reminders: []
  })

  useEffect(() => {
    fetchEvents()
    fetchCalendarStats()
  }, [currentDate, view])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      let startDate, endDate
      if (view === 'month') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      } else if (view === 'week') {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        startDate = startOfWeek
        endDate = new Date(startOfWeek)
        endDate.setDate(startOfWeek.getDate() + 6)
      } else if (view === 'day') {
        startDate = new Date(currentDate)
        endDate = new Date(currentDate)
      } else {
        // Agenda view - show next 30 days
        startDate = new Date()
        endDate = new Date()
        endDate.setDate(startDate.getDate() + 30)
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/calendar?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar events',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCalendarStats = async () => {
    try {
      const response = await fetch('/api/calendar/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch calendar stats:', error)
    }
  }

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents(prev => [...prev, newEvent])
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          type: 'appointment',
          location: '',
          attendees: [],
          notes: '',
          isRecurring: false,
          recurringPattern: '',
          meetingLink: '',
          reminders: []
        })
        toast({
          title: 'Success',
          description: 'Event created successfully'
        })
        fetchCalendarStats()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create event',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(prev => prev.map(event => event.id === eventId ? updatedEvent : event))
        setIsEditDialogOpen(false)
        setSelectedEvent(null)
        toast({
          title: 'Success',
          description: 'Event updated successfully'
        })
        fetchCalendarStats()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update event',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId))
        toast({
          title: 'Success',
          description: 'Event deleted successfully'
        })
        fetchCalendarStats()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete event',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      })
    }
  }

  const getEventTypeBadge = (type: string) => {
    const typeConfig = {
      appointment: { variant: 'default', label: 'Appointment', color: 'text-blue-600', icon: Car },
      meeting: { variant: 'secondary', label: 'Meeting', color: 'text-purple-600', icon: Users },
      task_deadline: { variant: 'outline', label: 'Task Deadline', color: 'text-blue-600', icon: Target },
      reminder: { variant: 'outline', label: 'Reminder', color: 'text-green-600', icon: Bell },
      availability: { variant: 'secondary', label: 'Availability', color: 'text-gray-600', icon: CalendarDays },
      training: { variant: 'default', label: 'Training', color: 'text-indigo-600', icon: User },
      break: { variant: 'outline', label: 'Break', color: 'text-teal-600', icon: Clock }
    } as const

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.appointment
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getEventStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary', label: 'Scheduled', icon: CalendarDays },
      in_progress: { variant: 'default', label: 'In Progress', icon: Clock },
      completed: { variant: 'outline', label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: XCircle }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || event.type === typeFilter
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const generateMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getEventColor = (type: string) => {
    const colors = {
      appointment: 'bg-blue-100 border-blue-300',
      meeting: 'bg-purple-100 border-purple-300',
      task_deadline: 'bg-blue-100 border-blue-300',
      reminder: 'bg-green-100 border-green-300',
      availability: 'bg-gray-100 border-gray-300',
      training: 'bg-indigo-100 border-indigo-300',
      break: 'bg-teal-100 border-teal-300'
    }
    return colors[type as keyof typeof colors] || colors.appointment
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Enhanced Calendar</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              <CalendarDays className="w-4 h-4 mr-1" />
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-lg font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(value: any) => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Create a new calendar event with advanced features
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="task_deadline">Task Deadline</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location or virtual meeting link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Link</label>
                  <Input
                    value={formData.meetingLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      />
                      Recurring Event
                    </label>
                  </div>
                  {formData.isRecurring && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Pattern</label>
                      <Select value={formData.recurringPattern} onValueChange={(value) => setFormData(prev => ({ ...prev, recurringPattern: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateEvent} className="flex-1">
                    Create Event
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayEvents} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.meetingsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.conflicts}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task_deadline">Task Deadline</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      {view === 'month' && (
        <div className="bg-white rounded-lg border">
          <div className="grid grid-cols-7 gap-0 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {generateMonthDays().map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)
              
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 border-r border-b ${
                    isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'
                  } ${isTodayDate ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                  } ${isTodayDate ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${getEventColor(event.type)}`}
                        onClick={() => {
                          setSelectedEvent(event)
                          setIsEditDialogOpen(true)
                        }}
                        title={event.title}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-gray-600">{formatTime(event.startTime)}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'agenda' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No events found</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredEvents
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map(event => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          {getEventTypeBadge(event.type)}
                          {getEventStatusBadge(event.status)}
                          {event.isRecurring && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 mb-3">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>{formatDate(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {event.meetingLink && (
                          <div className="flex items-center gap-2 mb-3">
                            <Video className="w-4 h-4 text-blue-600" />
                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Join Meeting
                            </a>
                          </div>
                        )}
                        
                        {event.attendees.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        
                        {event.booking && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm font-medium text-gray-700">Related Booking</p>
                            <p className="text-sm text-gray-600">
                              {event.booking.type} with {event.booking.customer.name}
                            </p>
                          </div>
                        )}
                        
                        {event.task && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm font-medium text-gray-700">Related Task</p>
                            <p className="text-sm text-gray-600">{event.task.title}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {/* Event Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={selectedEvent.description || ''}
                  onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={selectedEvent.startTime.slice(0, 16)}
                    onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <Input
                    type="datetime-local"
                    value={selectedEvent.endTime.slice(0, 16)}
                    onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select 
                  value={selectedEvent.status} 
                  onValueChange={(value) => setSelectedEvent(prev => prev ? { ...prev, status: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={selectedEvent.location || ''}
                  onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, location: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Link</label>
                <Input
                  value={selectedEvent.meetingLink || ''}
                  onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, meetingLink: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={selectedEvent.notes || ''}
                  onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => selectedEvent && handleUpdateEvent(selectedEvent.id, selectedEvent)}
                  className="flex-1"
                >
                  Update Event
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}