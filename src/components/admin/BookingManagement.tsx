'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Car, 
  Wrench, 
  User,
  Mail,
  Phone,
  MapPin,
  Download,
  RefreshCw,
  AlertTriangle,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Booking {
  id: string
  type: 'test-drive' | 'service'
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  vehicle?: {
    id: string
    make: string
    model: string
    year: number
    stockNumber: string
  }
  date: string
  timeSlot: string
  services?: Array<{
    id: string
    name: string
    duration: number
    price?: number
  }>
  totalPrice?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface BookingFilters {
  status?: string
  type?: string
  dateRange?: {
    start: Date | undefined
    end: Date | undefined
  }
  searchQuery?: string
}

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  completed: number
  noShow: number
  today: number
  thisWeek: number
  thisMonth: number
  revenue: number
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    noShow: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    revenue: 0
  })
  const [filters, setFilters] = useState<BookingFilters>({})
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [statusNote, setStatusNote] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchBookings()
    fetchStats()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bookings, filters])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/bookings/test-drive')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.bookings || {
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          noShow: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          revenue: 0
        })
      } else {
        setStats({
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          noShow: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          revenue: 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
        noShow: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        revenue: 0
      })
    }
  }

  const applyFilters = () => {
    let filtered = [...bookings]

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status)
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(booking => booking.type === filters.type)
    }

    // Apply date range filter
    if (filters.dateRange?.start && filters.dateRange?.end) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date)
        return bookingDate >= filters.dateRange!.start! && bookingDate <= filters.dateRange!.end!
      })
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(booking =>
        booking.customer.name.toLowerCase().includes(query) ||
        booking.customer.email.toLowerCase().includes(query) ||
        booking.customer.phone.includes(query) ||
        booking.vehicle?.make.toLowerCase().includes(query) ||
        booking.vehicle?.model.toLowerCase().includes(query) ||
        booking.id.includes(query)
      )
    }

    setFilteredBookings(filtered)
  }

  const handleStatusChange = async (bookingId: string, status: string, note?: string) => {
    try {
      // In real implementation, call API to update status
      console.log(`Updating booking ${bookingId} status to ${status}`, note)
      
      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId 
          ? { ...booking, status: status as any, notes: note || booking.notes }
          : booking
      ))
      
      setShowStatusDialog(false)
      setSelectedBooking(null)
      setNewStatus('')
      setStatusNote('')
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setStatusNote(booking.notes || '')
    setShowStatusDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'قيد الانتظار', variant: 'secondary' as const, icon: Clock },
      'CONFIRMED': { label: 'مؤكد', variant: 'default' as const, icon: CheckCircle },
      'CANCELLED': { label: 'ملغي', variant: 'destructive' as const, icon: XCircle },
      'COMPLETED': { label: 'مكتمل', variant: 'outline' as const, icon: CheckCircle },
      'NO_SHOW': { label: 'لم يحضر', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'test-drive': { label: 'تجربة قيادة', icon: Car, color: 'text-blue-600' },
      'service': { label: 'خدمة', icon: Wrench, color: 'text-blue-600' }
    }

    const config = typeConfig[type as keyof typeof typeConfig]
    const Icon = config.icon

    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    )
  }

  const exportBookings = () => {
    // In real implementation, generate and download CSV/Excel
    console.log('Exporting bookings...')
  }

  const getBookingsByTab = (tab: string) => {
    switch (tab) {
      case 'today':
        const today = new Date().toISOString().split('T')[0]
        return filteredBookings.filter(b => b.date === today)
      case 'pending':
        return filteredBookings.filter(b => b.status === 'PENDING')
      case 'confirmed':
        return filteredBookings.filter(b => b.status === 'CONFIRMED')
      case 'cancelled':
        return filteredBookings.filter(b => b.status === 'CANCELLED')
      default:
        return filteredBookings
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الحجوزات</h1>
              <p className="text-gray-600 mt-1">إدارة جميع حجوزات تجارب القيادة والخدمات</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportBookings}>
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
              <Button onClick={() => { fetchBookings(); fetchStats(); }}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">حجوزات اليوم</p>
                    <p className="text-2xl font-bold">{stats.today}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">في انتظار التأكيد</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">الإيرادات</p>
                    <p className="text-2xl font-bold">EGP {stats.revenue.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">ج</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search">بحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                    value={filters.searchQuery || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pr-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                    <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    <SelectItem value="NO_SHOW">لم يحضر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">النوع</Label>
                <Select value={filters.type || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="test-drive">تجربة قيادة</SelectItem>
                    <SelectItem value="service">خدمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={() => setFilters({})}>
                <Filter className="ml-2 h-4 w-4" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الحجوزات</CardTitle>
            <CardDescription>
              إدارة وتعديل حالات الحجوزات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">الكل ({filteredBookings.length})</TabsTrigger>
                <TabsTrigger value="today">اليوم ({getBookingsByTab('today').length})</TabsTrigger>
                <TabsTrigger value="pending">قيد الانتظار ({getBookingsByTab('pending').length})</TabsTrigger>
                <TabsTrigger value="confirmed">مؤكد ({getBookingsByTab('confirmed').length})</TabsTrigger>
                <TabsTrigger value="cancelled">ملغي ({getBookingsByTab('cancelled').length})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>جاري التحميل...</p>
                  </div>
                ) : getBookingsByTab(activeTab).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">لا توجد حجوزات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getBookingsByTab(activeTab).map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                {getTypeBadge(booking.type)}
                                {getStatusBadge(booking.status)}
                                <span className="text-sm text-gray-500">#{booking.id}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">{booking.customer.name}</p>
                                  <p className="text-gray-600">{booking.customer.email}</p>
                                  <p className="text-gray-600">{booking.customer.phone}</p>
                                </div>
                                
                                <div>
                                  {booking.vehicle && (
                                    <>
                                      <p className="font-medium text-gray-900">
                                        {booking.vehicle.make} {booking.vehicle.model}
                                      </p>
                                      <p className="text-gray-600">{booking.vehicle.year} • {booking.vehicle.stockNumber}</p>
                                    </>
                                  )}
                                  <p className="text-gray-600">
                                    {format(new Date(booking.date), 'PPP', { locale: ar })} • {booking.timeSlot}
                                  </p>
                                </div>
                                
                                <div>
                                  {booking.services && (
                                    <div className="mb-2">
                                      <p className="font-medium text-gray-900">الخدمات:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {booking.services.map((service, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {service.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {booking.totalPrice && (
                                    <p className="font-medium text-green-600">
                                      EGP {booking.totalPrice.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowDetailsDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openStatusDialog(booking)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الحجز</DialogTitle>
            <DialogDescription>
              معلومات مفصلة عن الحجز #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">العميل</Label>
                  <p className="text-sm text-gray-900">{selectedBooking.customer.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.customer.email}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.customer.phone}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">المركبة</Label>
                  {selectedBooking.vehicle ? (
                    <>
                      <p className="text-sm text-gray-900">
                        {selectedBooking.vehicle.make} {selectedBooking.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.vehicle.year} • {selectedBooking.vehicle.stockNumber}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">غير محدد</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">التاريخ والوقت</Label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedBooking.date), 'PPP', { locale: ar })}
                  </p>
                  <p className="text-sm text-gray-600">{selectedBooking.timeSlot}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">الحالة</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
              </div>
              
              {selectedBooking.services && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">الخدمات</Label>
                  <div className="mt-1 space-y-1">
                    {selectedBooking.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{service.duration} دقيقة</span>
                          {service.price && (
                            <span className="font-medium">EGP {service.price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedBooking.totalPrice && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">الإجمالي</Label>
                  <p className="text-lg font-bold text-green-600">
                    EGP {selectedBooking.totalPrice.toLocaleString()}
                  </p>
                </div>
              )}
              
              {selectedBooking.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">ملاحظات</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedBooking.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => {
                  setShowDetailsDialog(false)
                  openStatusDialog(selectedBooking)
                }}>
                  تعديل الحالة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير حالة الحجز</DialogTitle>
            <DialogDescription>
              تغيير حالة الحجز #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">الحالة الجديدة</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                    <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    <SelectItem value="NO_SHOW">لم يحضر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <textarea
                  id="notes"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="أضف ملاحظات حول تغيير الحالة..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => handleStatusChange(selectedBooking.id, newStatus, statusNote)}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}