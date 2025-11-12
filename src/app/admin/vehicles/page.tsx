'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Car, Plus, Edit, Trash2, Search, Filter, Eye, 
  MoreHorizontal, X, Check, AlertCircle, Image as ImageIcon,
  Calendar, DollarSign, Settings, Package
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  stockQuantity: number
  vin?: string
  description?: string
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color?: string
  status: string
  featured: boolean
  createdAt: string
  updatedAt: string
  images: { id: string; imageUrl: string; isPrimary: boolean; order: number }[]
  specifications: { id: string; key: string; label: string; value: string; category: string }[]
  pricing?: {
    basePrice: number
    discountPrice?: number
    discountPercentage?: number
    taxes: number
    fees: number
    totalPrice: number
    currency: string
    hasDiscount: boolean
  }
  _count?: {
    testDriveBookings?: number
    serviceBookings?: number
  }
}

interface VehicleStats {
  total: number
  available: number
  sold: number
  reserved: number
  maintenance: number
  totalValue: number
}

const VEHICLE_CATEGORIES = [
  { value: 'SEDAN', label: 'سيدان' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'هاتشباك' },
  { value: 'PICKUP', label: 'بيك أب' },
  { value: 'TRUCK', label: 'شاحنة' },
  { value: 'VAN', label: 'فان' },
  { value: 'COMMERCIAL', label: 'تجاري' },
  { value: 'BUS', label: 'حافلة' }
]

const FUEL_TYPES = [
  { value: 'PETROL', label: 'بنزين' },
  { value: 'DIESEL', label: 'ديزل' },
  { value: 'ELECTRIC', label: 'كهربائي' },
  { value: 'HYBRID', label: 'هايبرد' },
  { value: 'CNG', label: 'غاز طبيعي' }
]

const TRANSMISSION_TYPES = [
  { value: 'MANUAL', label: 'يدوي' },
  { value: 'AUTOMATIC', label: 'أوتوماتيك' },
  { value: 'SEMI_AUTOMATIC', label: 'شبه أوتوماتيك' }
]

const VEHICLE_STATUSES = [
  { value: 'AVAILABLE', label: 'متاح', color: 'bg-green-100 text-green-800' },
  { value: 'SOLD', label: 'مباع', color: 'bg-red-100 text-red-800' },
  { value: 'RESERVED', label: 'محجوز', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MAINTENANCE', label: 'صيانة', color: 'bg-blue-100 text-blue-800' },
  { value: 'UNAVAILABLE', label: 'غير متاح', color: 'bg-gray-100 text-gray-800' }
]

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [stats, setStats] = useState<VehicleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    make: 'Tata Motors',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    stockNumber: '',
    stockQuantity: 0,
    vin: '',
    description: '',
    category: 'SEDAN', // Default value instead of empty string
    fuelType: 'PETROL', // Default value instead of empty string
    transmission: 'MANUAL', // Default value instead of empty string
    mileage: 0,
    color: '',
    status: 'AVAILABLE',
    featured: false
  })

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        category: category === 'all' ? '' : category,
        status: status === 'all' ? '' : status,
        sortBy,
        sortOrder
      })
      
      const response = await fetch(`/api/admin/vehicles?${params}`)
      if (!response.ok) throw new Error('فشل في جلب المركبات')
      
      const data = await response.json()
      
      // Ensure vehicles is an array and has proper structure
      const vehiclesData = Array.isArray(data.vehicles) ? data.vehicles.map(vehicle => ({
        ...vehicle,
        stockQuantity: typeof vehicle.stockQuantity === 'number' ? vehicle.stockQuantity : 0,
        images: Array.isArray(vehicle.images) ? vehicle.images : [],
        specifications: Array.isArray(vehicle.specifications) ? vehicle.specifications : [],
        _count: vehicle._count || { testDriveBookings: 0, serviceBookings: 0 }
      })) : []
      
      setVehicles(vehiclesData)
      setTotalPages(data.pagination?.totalPages || 1)
      
      // Calculate stats
      const vehicleStats: VehicleStats = {
        total: vehiclesData.length,
        available: vehiclesData.filter((v: Vehicle) => v.status === 'AVAILABLE').length,
        sold: vehiclesData.filter((v: Vehicle) => v.status === 'SOLD').length,
        reserved: vehiclesData.filter((v: Vehicle) => v.status === 'RESERVED').length,
        maintenance: vehiclesData.filter((v: Vehicle) => v.status === 'MAINTENANCE').length,
        totalValue: vehiclesData.reduce((sum: number, v: Vehicle) => sum + (v.pricing?.totalPrice || v.price), 0)
      }
      setStats(vehicleStats)
      
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في جلب المركبات')
      setVehicles([])
      setStats({
        total: 0,
        available: 0,
        sold: 0,
        reserved: 0,
        maintenance: 0,
        totalValue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Create vehicle
  const handleCreateVehicle = async () => {
    try {
      // Validate required fields
      if (!formData.model.trim()) {
        toast.error('الموديل مطلوب')
        return
      }
      if (!formData.stockNumber.trim()) {
        toast.error('رقم المخزون مطلوب')
        return
      }
      if (formData.price <= 0) {
        toast.error('السعر يجب أن يكون أكبر من صفر')
        return
      }
      if (formData.stockQuantity < 0) {
        toast.error('الكمية يجب أن تكون صفر أو أكثر')
        return
      }

      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل في إنشاء المركبة')
      }
      
      toast.success('تم إنشاء المركبة بنجاح')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchVehicles()
    } catch (error) {
      console.error('Error creating vehicle:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء المركبة')
    }
  }

  // Update vehicle
  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return
    
    try {
      // Validate required fields
      if (!formData.model.trim()) {
        toast.error('الموديل مطلوب')
        return
      }
      if (!formData.stockNumber.trim()) {
        toast.error('رقم المخزون مطلوب')
        return
      }
      if (formData.price <= 0) {
        toast.error('السعر يجب أن يكون أكبر من صفر')
        return
      }
      if (formData.stockQuantity < 0) {
        toast.error('الكمية يجب أن تكون صفر أو أكثر')
        return
      }

      const response = await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل في تحديث المركبة')
      }
      
      toast.success('تم تحديث المركبة بنجاح')
      setIsEditDialogOpen(false)
      setSelectedVehicle(null)
      resetForm()
      fetchVehicles()
    } catch (error) {
      console.error('Error updating vehicle:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تحديث المركبة')
    }
  }

  // Delete vehicle
  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return
    
    try {
      const response = await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل في حذف المركبة')
      }
      
      toast.success('تم حذف المركبة بنجاح')
      setIsDeleteDialogOpen(false)
      setSelectedVehicle(null)
      fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في حذف المركبة')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      make: 'Tata Motors',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      stockNumber: '',
      stockQuantity: 0,
      vin: '',
      description: '',
      category: 'SEDAN', // Default value instead of empty string
      fuelType: 'PETROL', // Default value instead of empty string
      transmission: 'MANUAL', // Default value instead of empty string
      mileage: 0,
      color: '',
      status: 'AVAILABLE',
      featured: false
    })
  }

  // Open edit dialog
  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData({
      make: vehicle.make || 'Tata Motors',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      price: vehicle.price || 0,
      stockNumber: vehicle.stockNumber || '',
      stockQuantity: vehicle.stockQuantity ?? 0,
      vin: vehicle.vin || '',
      description: vehicle.description || '',
      category: vehicle.category || 'SEDAN',
      fuelType: vehicle.fuelType || 'PETROL',
      transmission: vehicle.transmission || 'MANUAL',
      mileage: vehicle.mileage || 0,
      color: vehicle.color || '',
      status: vehicle.status || 'AVAILABLE',
      featured: vehicle.featured || false
    })
    setIsEditDialogOpen(true)
  }

  // Get status badge style
  const getStatusBadge = (status: string) => {
    const statusConfig = VEHICLE_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusConfig = VEHICLE_STATUSES.find(s => s.value === status)
    return statusConfig?.label || status
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categoryConfig = VEHICLE_CATEGORIES.find(c => c.value === category)
    return categoryConfig?.label || category
  }

  // Get fuel type label
  const getFuelTypeLabel = (fuelType: string) => {
    const fuelConfig = FUEL_TYPES.find(f => f.value === fuelType)
    return fuelConfig?.label || fuelType
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  useEffect(() => {
    fetchVehicles()
  }, [currentPage, search, category, status, sortBy, sortOrder])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المركبات</h1>
          <p className="text-gray-600 mt-2">إضافة وتعديل وحذف المركبات في النظام</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة مركبة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                جميع المركبات في النظام
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المركبات المتاحة</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.available}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% من إجمالي المركبات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المركبات المباعة</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sold}</div>
              <p className="text-xs text-muted-foreground">
                هذا الشهر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                إجمالي القيمة
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث عن مركبة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={category || 'all'} onValueChange={setCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {VEHICLE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status || 'all'} onValueChange={setStatus}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {VEHICLE_STATUSES.map((stat) => (
                  <SelectItem key={stat.value} value={stat.value}>
                    {stat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                <SelectItem value="make">الماركة</SelectItem>
                <SelectItem value="model">الموديل</SelectItem>
                <SelectItem value="price">السعر</SelectItem>
                <SelectItem value="year">السنة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">الأحدث</SelectItem>
                <SelectItem value="asc">الأقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المركبات</CardTitle>
          <CardDescription>عرض جميع المركبات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مركبات</h3>
              <p className="text-gray-600 mb-4">لم يتم العثور على أي مركبات مطابقة للبحث</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                إضافة مركبة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img 
                          src={vehicle.images.find(img => img.isPrimary)?.imageUrl || vehicle.images[0]?.imageUrl} 
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/vehicle'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getCategoryLabel(vehicle.category)} • {getFuelTypeLabel(vehicle.fuelType)} • {vehicle.color || 'غير محدد'}
                      </p>
                      <p className="text-xs text-gray-500">
                        الرقم: {vehicle.stockNumber} {vehicle.vin && `• VIN: ${vehicle.vin}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadge(vehicle.status)}>
                          {getStatusLabel(vehicle.status)}
                        </Badge>
                        {vehicle.featured && (
                          <Badge variant="secondary">مميز</Badge>
                        )}
                        {vehicle._count?.testDriveBookings > 0 && (
                          <Badge variant="outline">{vehicle._count.testDriveBookings} قيادة تجريبية</Badge>
                        )}
                        {vehicle._count?.serviceBookings > 0 && (
                          <Badge variant="outline">{vehicle._count.serviceBookings} حجز صيانة</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(vehicle.pricing?.totalPrice || vehicle.price)}
                      </p>
                      {vehicle.mileage && (
                        <p className="text-xs text-gray-500">
                          {vehicle.mileage.toLocaleString('ar-EG')} كم
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => window.open(`/vehicles/${vehicle.id}`, '_blank')}
                        >
                          <Eye className="ml-2 h-4 w-4" />
                          عرض
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(vehicle)}
                        >
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVehicle(vehicle)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Vehicle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مركبة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات المركبة الجديدة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">الماركة</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">الموديل</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">السنة</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockNumber">رقم المخزون</Label>
                <Input
                  id="stockNumber"
                  value={formData.stockNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">الكمية في المخزون</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min={0}
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">رقم الهيكل (VIN)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">نوع الوقود</Label>
                <Select value={formData.fuelType} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الوقود" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel.value} value={fuel.value}>
                        {fuel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">ناقل الحركة</Label>
                <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر ناقل الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSION_TYPES.map((trans) => (
                      <SelectItem key={trans.value} value={trans.value}>
                        {trans.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">اللون</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_STATUSES.map((stat) => (
                      <SelectItem key={stat.value} value={stat.value}>
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">مركبة مميزة</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateVehicle}>
              إنشاء مركبة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المركبة</DialogTitle>
            <DialogDescription>
              تعديل بيانات المركبة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-make">الماركة</Label>
                <Input
                  id="edit-make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">الموديل</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">السنة</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">السعر</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stockNumber">رقم المخزون</Label>
                <Input
                  id="edit-stockNumber"
                  value={formData.stockNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-stockQuantity">الكمية في المخزون</Label>
                <Input
                  id="edit-stockQuantity"
                  type="number"
                  min={0}
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vin">رقم الهيكل (VIN)</Label>
                <Input
                  id="edit-vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">الفئة</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fuelType">نوع الوقود</Label>
                <Select value={formData.fuelType} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الوقود" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel.value} value={fuel.value}>
                        {fuel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-transmission">ناقل الحركة</Label>
                <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر ناقل الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSION_TYPES.map((trans) => (
                      <SelectItem key={trans.value} value={trans.value}>
                        {trans.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-color">اللون</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mileage">المسافة المقطوعة (كم)</Label>
                <Input
                  id="edit-mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_STATUSES.map((stat) => (
                      <SelectItem key={stat.value} value={stat.value}>
                        {stat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="edit-featured">مركبة مميزة</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateVehicle}>
              تحديث المركبة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Vehicle Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المركبة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="py-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                    <img 
                      src={selectedVehicle.images[0].imageUrl} 
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">
                    {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedVehicle.stockNumber} • {formatPrice(selectedVehicle.price)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>
              حذف المركبة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}