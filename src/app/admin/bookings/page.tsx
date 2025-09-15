'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Search, 
  Filter, 
  Car, 
  Wrench, 
  Clock, 
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Bell
} from 'lucide-react'

interface Booking {
  id: string
  type: 'test-drive' | 'service'
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleName?: string
  serviceName?: string
  date: string
  timeSlot: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  totalPrice?: number
  createdAt: string
  updatedAt: string
}

interface BookingFormData {
  status: string
  notes?: string
}

export default function AdminBookingsPage() {
  return (
    <AdminRoute>
      <BookingsContent />
    </AdminRoute>
  )
}

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: ''
  })
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    status: '',
    notes: ''
  })
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadBookings()
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, filters])

  const loadBookings = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockBookings: Booking[] = [
        {
          id: '1',
          type: 'test-drive',
          customerName: 'أحمد محمد',
          customerEmail: 'ahmed@email.com',
          customerPhone: '+20 100 123 4567',
          vehicleName: 'Tata Nexon',
          date: '2024-01-15',
          timeSlot: '10:00',
          status: 'confirmed',
          notes: 'يريد تجربة السيارة في الطريق السريع',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          type: 'service',
          customerName: 'فاطمة علي',
          customerEmail: 'fatima@email.com',
          customerPhone: '+20 102 987 6543',
          serviceName: 'صيانة دورية',
          vehicleName: 'Tata Punch',
          date: '2024-01-15',
          timeSlot: '14:00',
          status: 'pending',
          totalPrice: 350,
          notes: 'السيارة تصدر صوت غريب من المحرك',
          createdAt: '2024-01-09T10:00:00Z',
          updatedAt: '2024-01-09T10:00:00Z'
        },
        {
          id: '3',
          type: 'test-drive',
          customerName: 'محمد خالد',
          customerEmail: 'mohamed@email.com',
          customerPhone: '+20 111 555 1234',
          vehicleName: 'Tata Tiago',
          date: '2024-01-14',
          timeSlot: '11:00',
          status: 'completed',
          notes: 'جرب السيارة وأعجبته كثيراً',
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-14T12:00:00Z'
        },
        {
          id: '4',
          type: 'service',
          customerName: 'سارة أحمد',
          customerEmail: 'sara@email.com',
          customerPhone: '+20 112 333 4444',
          serviceName: 'تغيير زيت',
          vehicleName: 'Tata Harrier',
          date: '2024-01-14',
          timeSlot: '16:00',
          status: 'cancelled',
          totalPrice: 300,
          notes: 'ألغت العميل الحجز في آخر لحظة',
          createdAt: '2024-01-07T10:00:00Z',
          updatedAt: '2024-01-14T15:00:00Z'
        },
        {
          id: '5',
          type: 'test-drive',
          customerName: 'عمر حسن',
          customerEmail: 'omar@email.com',
          customerPhone: '+20 106 777 8888',
          vehicleName: 'Tata Safari',
          date: '2024-01-13',
          timeSlot: '09:00',
          status: 'confirmed',
          notes: 'مهتم بشراء السيارة للعائلة',
          createdAt: '2024-01-06T10:00:00Z',
          updatedAt: '2024-01-06T10:00:00Z'
        },
        {
          id: '6',
          type: 'service',
          customerName: 'نورا محمود',
          customerEmail: 'nora@email.com',
          customerPhone: '+20 109 999 0000',
          serviceName: 'فحص شامل',
          vehicleName: 'Tata Nexon EV',
          date: '2024-01-16',
          timeSlot: '10:00',
          status: 'pending',
          totalPrice: 450,
          notes: 'يريد فحص البطارية والنظام الكهربائي',
          createdAt: '2024-01-11T10:00:00Z',
          updatedAt: '2024-01-11T10:00:00Z'
        },
        {
          id: '7',
          type: 'test-drive',
          customerName: 'خالد سامي',
          customerEmail: 'khaled@email.com',
          customerPhone: '+20 105 444 3333',
          vehicleName: 'Tata Punch',
          date: '2024-01-12',
          timeSlot: '15:00',
          status: 'no-show',
          notes: 'لم يحضر العميل للحجز',
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-12T16:00:00Z'
        },
        {
          id: '8',
          type: 'service',
          customerName: 'منى عبد الله',
          customerEmail: 'mona@email.com',
          customerPhone: '+20 108 666 5555',
          serviceName: 'تلميع وتنظيف',
          vehicleName: 'Tata Tiago',
          date: '2024-01-16',
          timeSlot: '13:00',
          status: 'confirmed',
          totalPrice: 200,
          notes: 'تريد تنظيف السيارة بالكامل',
          createdAt: '2024-01-12T10:00:00Z',
          updatedAt: '2024-01-12T10:00:00Z'
        }
      ]
      
      setBookings(mockBookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customerPhone.includes(searchTerm) ||
                           booking.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = !filters.type || booking.type === filters.type
      const matchesStatus = !filters.status || booking.status === filters.status
      
      let matchesDateRange = true
      if (filters.dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0]
        matchesDateRange = booking.date === today
      } else if (filters.dateRange === 'week') {
        const bookingDate = new Date(booking.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesDateRange = bookingDate >= weekAgo
      } else if (filters.dateRange === 'month') {
        const bookingDate = new Date(booking.date)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        matchesDateRange = bookingDate >= monthAgo
      }

      return matchesSearch && matchesType && matchesStatus && matchesDateRange
    })

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timeSlot}`)
      const dateB = new Date(`${b.date} ${b.timeSlot}`)
      return dateB.getTime() - dateA.getTime()
    })

    setFilteredBookings(filtered)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setFormData({
      status: booking.status,
      notes: booking.notes
    })
    setShowEditDialog(true)
  }

  const handleDeleteBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setShowDeleteDialog(true)
  }

  const handleViewBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setShowViewDialog(true)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBooking) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedBooking: Booking = {
        ...editingBooking,
        status: formData.status as any,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      }
      
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? updatedBooking : b))
      setShowEditDialog(false)
      setEditingBooking(null)
    } catch (error) {
      console.error('Error updating booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingBooking) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBookings(prev => prev.filter(b => b.id !== editingBooking.id))
      setShowDeleteDialog(false)
      setEditingBooking(null)
    } catch (error) {
      console.error('Error deleting booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار', icon: Clock },
      confirmed: { variant: 'default' as const, label: 'مؤكد', icon: CheckCircle },
      completed: { variant: 'outline' as const, label: 'مكتمل', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'ملغي', icon: XCircle },
      'no-show': { variant: 'destructive' as const, label: 'لم يحضر', icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
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
      'test-drive': { variant: 'default' as const, label: 'قيادة تجريبية', icon: Car },
      'service': { variant: 'secondary' as const, label: 'خدمة', icon: Wrench }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const isBookingToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  }

  const isBookingUpcoming = (date: string) => {
    const bookingDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate >= today
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    today: bookings.filter(b => isBookingToday(b.date)).length,
    upcoming: bookings.filter(b => isBookingUpcoming(b.date)).length,
    testDrives: bookings.filter(b => b.type === 'test-drive').length,
    services: bookings.filter(b => b.type === 'service').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة الحجوزات</h1>
              <p className="text-gray-600">إدارة حجوزات القيادة التجريبية والخدمات</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RefreshCw className="h-4 w-4" />
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
              </div>
              <Button variant="outline" onClick={loadBookings}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.today} اليوم • {stats.upcoming} قادمة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                تحتاج إلى تأكيد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القيادة التجريبية</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.testDrives}</div>
              <p className="text-xs text-muted-foreground">
                {stats.confirmed} مؤكدة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الخدمات</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.services}</div>
              <p className="text-xs text-muted-foreground">
                الإيرادات: {formatPrice(stats.totalRevenue)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="بحث بالاسم، السيارة، أو الخدمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  <SelectItem value="test-drive">قيادة تجريبية</SelectItem>
                  <SelectItem value="service">خدمة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="no-show">لم يحضر</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفترات</SelectItem>
                  <SelectItem value="today">اليوم فقط</SelectItem>
                  <SelectItem value="week">آخر 7 أيام</SelectItem>
                  <SelectItem value="month">آخر 30 يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحجز</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ والوقت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">جاري التحميل...</p>
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد حجوزات مطابقة للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className={`hover:bg-gray-50 ${isBookingToday(booking.date) ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {getTypeBadge(booking.type)}
                            <div className="text-sm font-medium text-gray-900">
                              {booking.vehicleName || booking.serviceName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {booking.customerPhone}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.customerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.date).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.timeSlot}
                          </div>
                          {isBookingToday(booking.date) && (
                            <Badge variant="outline" className="mt-1">اليوم</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(booking.totalPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewBooking(booking)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditBooking(booking)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBooking(booking)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الحجز</DialogTitle>
            <DialogDescription>تعديل حالة وملاحظات الحجز</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <Label htmlFor="status">الحالة *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="no-show">لم يحضر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="أدخل أي ملاحظات إضافية..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الحجز</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الحجز؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الحجز</DialogTitle>
            <DialogDescription>معلومات كاملة عن الحجز</DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <BookingDetails booking={editingBooking} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BookingDetails({ booking }: { booking: Booking }) {
  const formatPrice = (price?: number) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار' },
      confirmed: { variant: 'default' as const, label: 'مؤكد' },
      completed: { variant: 'outline' as const, label: 'مكتمل' },
      cancelled: { variant: 'destructive' as const, label: 'ملغي' },
      'no-show': { variant: 'destructive' as const, label: 'لم يحضر' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'test-drive': { variant: 'default' as const, label: 'قيادة تجريبية' },
      'service': { variant: 'secondary' as const, label: 'خدمة' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">نوع الحجز</Label>
          <p className="font-medium">{getTypeBadge(booking.type)}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">الحالة</Label>
          <p className="font-medium">{getStatusBadge(booking.status)}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">الخدمة/السيارة</Label>
          <p className="font-medium">{booking.vehicleName || booking.serviceName}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">السعر</Label>
          <p className="font-medium">{formatPrice(booking.totalPrice)}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">معلومات العميل</Label>
        <div className="mt-2 space-y-1">
          <p className="font-medium">{booking.customerName}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {booking.customerPhone}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {booking.customerEmail}
          </p>
        </div>
      </div>

      <div>
        <Label className="text-sm text-gray-600">الموعد</Label>
        <div className="mt-2 space-y-1">
          <p className="font-medium">
            {new Date(booking.date).toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-600">الوقت: {booking.timeSlot}</p>
        </div>
      </div>

      {booking.notes && (
        <div>
          <Label className="text-sm text-gray-600">ملاحظات</Label>
          <p className="mt-2 text-sm bg-gray-50 p-3 rounded-lg">
            {booking.notes}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-sm text-gray-600">تاريخ الإنشاء</Label>
          <p className="font-medium">
            {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">آخر تحديث</Label>
          <p className="font-medium">
            {new Date(booking.updatedAt).toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>
    </div>
  )
}