'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Car, 
  Wrench, 
  Clock, 
  User,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Users,
  DollarSign
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

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  stockNumber: string
  status: string
}

interface ServiceType {
  id: string
  name: string
  duration: number
  price?: number
  category: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

export default function AdminBookingsPage() {
  return <BookingsContent />
}

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined }
  })
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createType, setCreateType] = useState<'test-drive' | 'service'>('test-drive')
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    customerId: '',
    vehicleId: '',
    serviceTypeId: '',
    date: '',
    timeSlot: ''
  })

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00'
  ]

  useEffect(() => {
    loadBookings()
    loadVehicles()
    loadServiceTypes()
    loadCustomers()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, filters])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const [testDriveResponse, serviceResponse] = await Promise.all([
        fetch('/api/admin/bookings/test-drive'),
        fetch('/api/admin/bookings/service')
      ])

      if (testDriveResponse.ok && serviceResponse.ok) {
        const testData = await testDriveResponse.json()
        const serviceData = await serviceResponse.json()
        
        const allBookings = [
          ...testData.bookings.map((b: any) => ({
            ...b,
            type: 'test-drive' as const,
            customerName: b.customer.name,
            customerEmail: b.customer.email,
            customerPhone: b.customer.phone,
            vehicleName: `${b.vehicle.make} ${b.vehicle.model}`
          })),
          ...serviceData.bookings.map((b: any) => ({
            ...b,
            type: 'service' as const,
            customerName: b.customer.name,
            customerEmail: b.customer.email,
            customerPhone: b.customer.phone,
            vehicleName: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : undefined,
            serviceName: b.serviceType.name
          }))
        ]
        
        setBookings(allBookings.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ))
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/admin/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
    }
  }

  const loadServiceTypes = async () => {
    try {
      const response = await fetch('/api/admin/service-types')
      if (response.ok) {
        const data = await response.json()
        setServiceTypes(data.serviceTypes || [])
      }
    } catch (error) {
      console.error('Error loading service types:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const filterBookings = () => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customerPhone.includes(searchTerm) ||
                           booking.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filters.type === 'all' || booking.type === filters.type
      const matchesStatus = filters.status === 'all' || booking.status === filters.status

      let matchesDate = true
      if (filters.dateRange.from && filters.dateRange.to) {
        const bookingDate = new Date(booking.date)
        matchesDate = bookingDate >= filters.dateRange.from && bookingDate <= filters.dateRange.to
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate
    })

    setFilteredBookings(filtered)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setFormData({
      status: booking.status,
      notes: booking.notes || '',
      customerId: '',
      vehicleId: '',
      serviceTypeId: '',
      date: booking.date.split('T')[0],
      timeSlot: booking.timeSlot
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

  const handleCreateBooking = (type: 'test-drive' | 'service') => {
    setCreateType(type)
    setFormData({
      status: '',
      notes: '',
      customerId: '',
      vehicleId: '',
      serviceTypeId: '',
      date: '',
      timeSlot: ''
    })
    setShowCreateDialog(true)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBooking) return
    
    setLoading(true)
    
    try {
      const url = editingBooking.type === 'test-drive' 
        ? `/api/admin/bookings/test-drive/${editingBooking.id}`
        : `/api/admin/bookings/service/${editingBooking.id}`
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadBookings()
        setShowEditDialog(false)
        setEditingBooking(null)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث الحجز')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('فشل في تحديث الحجز')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingBooking) return
    
    setLoading(true)
    
    try {
      const url = editingBooking.type === 'test-drive' 
        ? `/api/admin/bookings/test-drive/${editingBooking.id}`
        : `/api/admin/bookings/service/${editingBooking.id}`
      
      const response = await fetch(url, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBookings()
        setShowDeleteDialog(false)
        setEditingCustomer(null)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف الحجز')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('فشل في حذف الحجز')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    
    try {
      const url = createType === 'test-drive' 
        ? '/api/admin/bookings/test-drive'
        : '/api/admin/bookings/service'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadBookings()
        setShowCreateDialog(false)
        setFormData({
          status: '',
          notes: '',
          customerId: '',
          vehicleId: '',
          serviceTypeId: '',
          date: '',
          timeSlot: ''
        })
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إنشاء الحجز')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('فشل في إنشاء الحجز')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار', icon: Clock },
      confirmed: { variant: 'default' as const, label: 'مؤكد', icon: CheckCircle },
      completed: { variant: 'outline' as const, label: 'مكتمل', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'ملغي', icon: XCircle },
      'no-show': { variant: 'destructive' as const, label: 'لم يحضر', icon: AlertCircle }
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

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    testDrives: bookings.filter(b => b.type === 'test-drive').length,
    services: bookings.filter(b => b.type === 'service').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  }

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الحجوزات</h1>
        <p className="text-gray-600">إدارة حجوزات القيادة التجريبية والخدمات</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => handleCreateBooking('test-drive')}>
            <Plus className="ml-2 h-4 w-4" />
            حجز قيادة تجريبية
          </Button>
          <Button onClick={() => handleCreateBooking('service')} variant="outline">
            <Plus className="ml-2 h-4 w-4" />
            حجز خدمة
          </Button>
          <Button variant="outline" onClick={loadBookings}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              جميع الحجوزات
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
                placeholder="بحث بالاسم أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الحجز" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="test-drive">قيادة تجريبية</SelectItem>
                <SelectItem value="service">خدمة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="تاريخ من - إلى"
                value={filters.dateRange.from && filters.dateRange.to 
                  ? `${format(filters.dateRange.from, 'dd/MM/yyyy')} - ${format(filters.dateRange.to, 'dd/MM/yyyy')}`
                  : ''}
                readOnly
                className="pr-10 cursor-pointer"
                onClick={() => {
                  // This would open a date picker dialog
                  // For simplicity, we'll keep it as is
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getTypeBadge(booking.type)}
                    {getStatusBadge(booking.status)}
                    <span className="text-sm text-gray-500">
                      {formatDate(booking.date)} {booking.timeSlot}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {booking.customerEmail}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {booking.customerPhone}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        {booking.type === 'test-drive' ? 'السيارة:' : 'الخدمة:'}
                      </div>
                      <p className="font-medium">
                        {booking.type === 'test-drive' ? booking.vehicleName : booking.serviceName}
                      </p>
                      {booking.totalPrice && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          {formatPrice(booking.totalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mr-4">
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
              </div>
            </CardContent>
          </Card>
        ))}
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
              <Label htmlFor="status">الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="timeSlot">الوقت</Label>
              <Select value={formData.timeSlot} onValueChange={(value) => setFormData({...formData, timeSlot: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف حجز</DialogTitle>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الحجز</DialogTitle>
            <DialogDescription>معلومات كاملة عن الحجز</DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">نوع الحجز</Label>
                  <p className="font-medium">{getTypeBadge(editingBooking.type)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">الحالة</Label>
                  <p className="font-medium">{getStatusBadge(editingBooking.status)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">التاريخ والوقت</Label>
                  <p className="font-medium">
                    {formatDate(editingBooking.date)} {editingBooking.timeSlot}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">السعر</Label>
                  <p className="font-medium">{formatPrice(editingBooking.totalPrice)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">العميل</Label>
                <p className="font-medium">{editingBooking.customerName}</p>
                <p className="text-sm text-gray-600">{editingBooking.customerEmail}</p>
                <p className="text-sm text-gray-600">{editingBooking.customerPhone}</p>
              </div>
              
              {editingBooking.vehicleName && (
                <div>
                  <Label className="text-sm text-gray-600">المركبة</Label>
                  <p className="font-medium">{editingBooking.vehicleName}</p>
                </div>
              )}
              
              {editingBooking.serviceName && (
                <div>
                  <Label className="text-sm text-gray-600">الخدمة</Label>
                  <p className="font-medium">{editingBooking.serviceName}</p>
                </div>
              )}
              
              {editingBooking.notes && (
                <div>
                  <Label className="text-sm text-gray-600">ملاحظات</Label>
                  <p className="text-gray-700">{editingBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Booking Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              إنشاء حجز {createType === 'test-drive' ? 'قيادة تجريبية' : 'خدمة'}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الحجز الجديد
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div>
              <Label htmlFor="customerId">العميل</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData({...formData, customerId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createType === 'test-drive' && (
              <div>
                <Label htmlFor="vehicleId">المركبة</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المركبة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {createType === 'service' && (
              <>
                <div>
                  <Label htmlFor="vehicleId">المركبة (اختياري)</Label>
                  <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المركبة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون مركبة</SelectItem>
                      {availableVehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="serviceTypeId">نوع الخدمة</Label>
                  <Select value={formData.serviceTypeId} onValueChange={(value) => setFormData({...formData, serviceTypeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الخدمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(serviceType => (
                        <SelectItem key={serviceType.id} value={serviceType.id}>
                          {serviceType.name} - {formatPrice(serviceType.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="timeSlot">الوقت</Label>
              <Select value={formData.timeSlot} onValueChange={(value) => setFormData({...formData, timeSlot: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الإنشاء...' : 'إنشاء الحجز'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}