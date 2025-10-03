'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Save,
  X,
  Image as ImageIcon,
  Settings,
  Copy,
  Download,
  Upload,
  Star,
  DollarSign,
  Package,
  List,
  Zap,
  Shield,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { VehicleImage } from '@/components/ui/VehicleImage'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  vin?: string
  description: string
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color: string
  status: string
  featured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  images: VehicleImage[]
  specifications: VehicleSpecification[]
  pricing: VehiclePricing
  location?: VehicleLocation
  contactInfo?: VehicleContact
}

interface VehicleImage {
  id: string
  imageUrl: string
  thumbnailUrl: string
  altText?: string
  isPrimary: boolean
  order: number
}

interface VehicleSpecification {
  key: string
  label: string
  value: string
  category: 'engine' | 'exterior' | 'interior' | 'safety' | 'technology'
}

interface VehiclePricing {
  basePrice: number
  discountPrice?: number
  discountPercentage?: number
  taxes: number
  fees: number
  totalPrice: number
  currency: string
  hasDiscount: boolean
  discountExpires?: string
}

interface VehicleLocation {
  branch: string
  address: string
  city: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface VehicleContact {
  salesPerson: string
  phone: string
  email: string
  department: string
}

interface VehicleFormData {
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  vin?: string
  description: string
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color: string
  status: string
  featured: boolean
  isActive: boolean
}

export default function AdminVehiclesPage() {
  return (
    <AdminRoute>
      <VehiclesContent />
    </AdminRoute>
  )
}

function VehiclesContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: 'all',
    fuelType: 'all',
    status: 'all',
    featured: 'all',
    priceRange: 'all',
    year: 'all'
  })
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Dialog states
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showImagesDialog, setShowImagesDialog] = useState(false)
  const [showSpecsDialog, setShowSpecsDialog] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    stockNumber: '',
    vin: '',
    description: '',
    category: '',
    fuelType: '',
    transmission: '',
    mileage: 0,
    color: '',
    status: 'AVAILABLE',
    featured: false,
    isActive: true
  })

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filters.category !== 'all') params.append('category', filters.category)
        if (filters.status !== 'all') params.append('status', filters.status)
        if (filters.featured !== 'all') params.append('featured', filters.featured)
        params.append('sortBy', sortBy)
        params.append('sortOrder', sortOrder)
        
        const response = await fetch(`/api/admin/vehicles?${params.toString()}`)
        if (!response.ok) {
          throw new Error('فشل في جلب المركبات')
        }
        
        const data = await response.json()
        setVehicles(data.vehicles)
        setFilteredVehicles(data.vehicles)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        // Fallback to empty array on error
        setVehicles([])
        setFilteredVehicles([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [searchTerm, filters, sortBy, sortOrder])

  useEffect(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = filters.category === 'all' || vehicle.category === filters.category
      const matchesFuelType = filters.fuelType === 'all' || vehicle.fuelType === filters.fuelType
      const matchesStatus = filters.status === 'all' || vehicle.status === filters.status
      const matchesFeatured = filters.featured === 'all' || 
                             (filters.featured === 'yes' && vehicle.featured) ||
                             (filters.featured === 'no' && !vehicle.featured)
      
      const matchesPriceRange = filters.priceRange === 'all' || 
                              (filters.priceRange === '0-500k' && vehicle.price <= 500000) ||
                              (filters.priceRange === '500k-1m' && vehicle.price > 500000 && vehicle.price <= 1000000) ||
                              (filters.priceRange === '1m+' && vehicle.price > 1000000)
      
      const matchesYear = filters.year === 'all' || vehicle.year.toString() === filters.year

      return matchesSearch && matchesCategory && matchesFuelType && matchesStatus && 
             matchesFeatured && matchesPriceRange && matchesYear
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Vehicle]
      let bValue: any = b[sortBy as keyof Vehicle]
      
      if (sortBy === 'price') {
        aValue = a.pricing?.totalPrice ?? a.price
        bValue = b.pricing?.totalPrice ?? b.price
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue
      }
    })

    setFilteredVehicles(filtered)
  }, [vehicles, searchTerm, filters, sortBy, sortOrder])

  const handleAddVehicle = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      stockNumber: '',
      vin: '',
      description: '',
      category: '',
      fuelType: '',
      transmission: '',
      mileage: 0,
      color: '',
      status: 'AVAILABLE',
      featured: false,
      isActive: true
    })
    setEditingVehicle(null)
    setShowAddDialog(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      stockNumber: vehicle.stockNumber,
      vin: vehicle.vin,
      description: vehicle.description,
      category: vehicle.category,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      mileage: vehicle.mileage,
      color: vehicle.color,
      status: vehicle.status,
      featured: vehicle.featured,
      isActive: vehicle.isActive
    })
    setShowEditDialog(true)
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowDeleteDialog(true)
  }

  const handleManageImages = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowImagesDialog(true)
  }

  const handleManageSpecs = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowSpecsDialog(true)
  }

  const handleManagePricing = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowPricingDialog(true)
  }

  const handleBulkAction = (action: string) => {
    if (selectedVehicles.length === 0) return
    
    switch (action) {
      case 'delete':
        if (confirm(`هل أنت متأكد من حذف ${selectedVehicles.length} مركبة؟`)) {
          setVehicles(prev => prev.filter(v => !selectedVehicles.includes(v.id)))
          setSelectedVehicles([])
        }
        break
      case 'featured':
        setVehicles(prev => prev.map(v => 
          selectedVehicles.includes(v.id) ? { ...v, featured: true } : v
        ))
        break
      case 'unfeatured':
        setVehicles(prev => prev.map(v => 
          selectedVehicles.includes(v.id) ? { ...v, featured: false } : v
        ))
        break
      case 'activate':
        setVehicles(prev => prev.map(v => 
          selectedVehicles.includes(v.id) ? { ...v, isActive: true } : v
        ))
        break
      case 'deactivate':
        setVehicles(prev => prev.map(v => 
          selectedVehicles.includes(v.id) ? { ...v, isActive: false } : v
        ))
        break
    }
  }

  const handleSelectAll = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(filteredVehicles.map(v => v.id))
    }
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    )
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إضافة المركبة')
      }

      const newVehicle = await response.json()
      setVehicles(prev => [...prev, newVehicle])
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding vehicle:', error)
      alert(error instanceof Error ? error.message : 'فشل في إضافة المركبة')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في تحديث المركبة')
      }

      const updatedVehicle = await response.json()
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updatedVehicle : v))
      setShowEditDialog(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert(error instanceof Error ? error.message : 'فشل في تحديث المركبة')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingVehicle) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/vehicles/${editingVehicle.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حذف المركبة')
      }

      setVehicles(prev => prev.filter(v => v.id !== editingVehicle.id))
      setShowDeleteDialog(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert(error instanceof Error ? error.message : 'فشل في حذف المركبة')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: 'default' as const, label: 'متاح' },
      sold: { variant: 'secondary' as const, label: 'مباع' },
      reserved: { variant: 'outline' as const, label: 'محجوز' },
      maintenance: { variant: 'destructive' as const, label: 'صيانة' }
    }
    
    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.available
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const categoryOptions = [
    { value: 'SEDAN', label: 'سيدان' },
    { value: 'SUV', label: 'SUV' },
    { value: 'HATCHBACK', label: 'هاتشباك' },
    { value: 'TRUCK', label: 'شاحنة' },
    { value: 'VAN', label: 'فان' },
    { value: 'COMMERCIAL', label: 'تجاري' }
  ]

  const fuelTypeOptions = [
    { value: 'PETROL', label: 'بنزين' },
    { value: 'DIESEL', label: 'ديزل' },
    { value: 'ELECTRIC', label: 'كهربائي' },
    { value: 'HYBRID', label: 'هجين' },
    { value: 'CNG', label: 'غاز طبيعي' }
  ]

  const transmissionOptions = [
    { value: 'MANUAL', label: 'يدوي' },
    { value: 'AUTOMATIC', label: 'أوتوماتيك' },
    { value: 'CVT', label: 'CVT' }
  ]

  const statusOptions = [
    { value: 'AVAILABLE', label: 'متاح' },
    { value: 'SOLD', label: 'مباع' },
    { value: 'RESERVED', label: 'محجوز' },
    { value: 'MAINTENANCE', label: 'صيانة' }
  ]

  const priceRangeOptions = [
    { value: 'all', label: 'جميع الأسعار' },
    { value: '0-500k', label: 'حتى 500,000 ج.م' },
    { value: '500k-1m', label: '500,000 - 1,000,000 ج.م' },
    { value: '1m+', label: 'أكثر من 1,000,000 ج.م' }
  ]

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return { value: year.toString(), label: year.toString() }
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المركبات</h1>
        <p className="text-gray-600">إضافة وتعديل وحذف المركبات في النظام مع إدارة متقدمة</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleAddVehicle}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة مركبة جديدة
          </Button>
          {selectedVehicles.length > 0 && (
            <>
              <Select onValueChange={handleBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="إجراء جماعي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">حذف المحدد</SelectItem>
                  <SelectItem value="featured">تمييز المحدد</SelectItem>
                  <SelectItem value="unfeatured">إلغاء تمييز المحدد</SelectItem>
                  <SelectItem value="activate">تفعيل المحدد</SelectItem>
                  <SelectItem value="deactivate">تعطيل المحدد</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary">
                {selectedVehicles.length} مركبة محددة
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.fuelType} onValueChange={(value) => setFilters({...filters, fuelType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الوقود" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {fuelTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.featured} onValueChange={(value) => setFilters({...filters, featured: value})}>
              <SelectTrigger>
                <SelectValue placeholder="مميزة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">مميزة فقط</SelectItem>
                <SelectItem value="no">غير مميزة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="نطاق السعر" />
              </SelectTrigger>
              <SelectContent>
                {priceRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.year} onValueChange={(value) => setFilters({...filters, year: value})}>
              <SelectTrigger>
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع السنوات</SelectItem>
                {yearOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Package className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-')
            setSortBy(field)
            setSortOrder(order as 'asc' | 'desc')
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">الأحدث أولاً</SelectItem>
              <SelectItem value="createdAt-asc">الأقدم أولاً</SelectItem>
              <SelectItem value="make-asc">الماركة أ-ي</SelectItem>
              <SelectItem value="price-asc">السعر الأقل</SelectItem>
              <SelectItem value="price-desc">السعر الأعلى</SelectItem>
              <SelectItem value="year-desc">السنة الأحدث</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-600">
          إجمالي {filteredVehicles.length} مركبة
        </div>
      </div>

      {/* Vehicles Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المركبات...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مركبات</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(f => f !== 'all') 
                ? 'لم يتم العثور على مركبات تطابق معايير البحث'
                : 'ابدأ بإضافة بعض المركبات إلى النظام'
              }
            </p>
            <Button onClick={handleAddVehicle}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مركبة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleSelectVehicle(vehicle.id)}
                      className="absolute top-2 right-2 z-10 rounded border-gray-300"
                    />
                    
                    {vehicle.images.length > 0 ? (
                      <VehicleImage
                        vehicle={vehicle}
                        className="w-full h-48 object-cover"
                        width={300}
                        height={200}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Car className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 flex gap-1">
                      {vehicle.featured && (
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          مميزة
                        </Badge>
                      )}
                      {!vehicle.isActive && (
                        <Badge variant="secondary">معطلة</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.stockNumber}</p>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {vehicle.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <span className="text-gray-600">الفئة:</span>
                        <span className="mr-1">{vehicle.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الوقود:</span>
                        <span className="mr-1">{vehicle.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ناقل الحركة:</span>
                        <span className="mr-1">{vehicle.transmission}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">اللون:</span>
                        <span className="mr-1">{vehicle.color}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(vehicle.pricing?.totalPrice ?? vehicle.price)}
                        </div>
                        {vehicle.pricing?.hasDiscount && (
                          <div className="text-xs text-red-600 line-through">
                            {formatPrice(vehicle.pricing?.basePrice ?? vehicle.price)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vehicle.images.length} صور
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleManageImages(vehicle)}>
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleManageSpecs(vehicle)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleManagePricing(vehicle)}>
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(vehicle.id)}
                        onChange={() => handleSelectVehicle(vehicle.id)}
                        className="mt-2 rounded border-gray-300"
                      />
                      
                      {vehicle.images.length > 0 ? (
                        <VehicleImage
                          vehicle={vehicle}
                          className="w-24 h-24 object-cover rounded-lg"
                          width={96}
                          height={96}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Car className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-gray-600">
                              {vehicle.year} • {vehicle.stockNumber} • {vehicle.color}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {vehicle.featured && (
                              <Badge className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                مميزة
                              </Badge>
                            )}
                            {getStatusBadge(vehicle.status)}
                            {!vehicle.isActive && (
                              <Badge variant="secondary">معطلة</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{vehicle.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-600">الفئة:</span>
                            <span className="mr-1 font-medium">{vehicle.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">الوقود:</span>
                            <span className="mr-1 font-medium">{vehicle.fuelType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ناقل الحركة:</span>
                            <span className="mr-1 font-medium">{vehicle.transmission}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">المسافة:</span>
                            <span className="mr-1 font-medium">{vehicle.mileage || 0} كم</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {formatPrice(vehicle.pricing?.totalPrice ?? vehicle.price)}
                            </div>
                            {vehicle.pricing?.hasDiscount && (
                              <div className="text-xs text-red-600 line-through">
                                {formatPrice(vehicle.pricing?.basePrice ?? vehicle.price)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleManageImages(vehicle)}>
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => window.open(`/vehicles/${vehicle.id}`, '_blank')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-right">
                          <input
                            type="checkbox"
                            checked={selectedVehicles.length === filteredVehicles.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">المركبة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الفئة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">المواصفات</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">السعر</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الحالة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedVehicles.includes(vehicle.id)}
                              onChange={() => handleSelectVehicle(vehicle.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {vehicle.images.length > 0 ? (
                                <img
                                  src={vehicle.images[0].thumbnailUrl}
                                  alt=""
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Car className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                                <div className="text-sm text-gray-600">{vehicle.year} • {vehicle.stockNumber}</div>
                                {vehicle.featured && (
                                  <Badge className="bg-yellow-500 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    مميزة
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{vehicle.category}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-1">
                              <div>{vehicle.fuelType} • {vehicle.transmission}</div>
                              <div className="text-gray-600">{vehicle.color}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-green-600">
                              {formatPrice(vehicle.pricing?.totalPrice ?? vehicle.price)}
                            </div>
                            {vehicle.pricing?.hasDiscount && (
                              <div className="text-xs text-red-600 line-through">
                                {formatPrice(vehicle.pricing?.basePrice ?? vehicle.price)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(vehicle.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مركبة جديدة</DialogTitle>
            <DialogDescription>أدخل بيانات المركبة الجديدة</DialogDescription>
          </DialogHeader>
          <VehicleForm 
            formData={formData} 
            setFormData={setFormData}
            onSubmit={handleSubmitAdd}
            loading={loading}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل مركبة</DialogTitle>
            <DialogDescription>تعديل بيانات المركبة</DialogDescription>
          </DialogHeader>
          <VehicleForm 
            formData={formData} 
            setFormData={setFormData}
            onSubmit={handleSubmitEdit}
            loading={loading}
            onCancel={() => {
              setShowEditDialog(false)
              setEditingVehicle(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Vehicle Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف مركبة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المركبة {editingVehicle?.make} {editingVehicle?.model}؟
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
      
      {/* Images Management Dialog */}
      <ImagesManagementDialog
        vehicle={editingVehicle}
        open={showImagesDialog}
        onOpenChange={setShowImagesDialog}
      />
      
      {/* Specifications Management Dialog */}
      <SpecsManagementDialog
        vehicle={editingVehicle}
        open={showSpecsDialog}
        onOpenChange={setShowSpecsDialog}
      />
      
      {/* Pricing Management Dialog */}
      <PricingManagementDialog
        vehicle={editingVehicle}
        open={showPricingDialog}
        onOpenChange={setShowPricingDialog}
      />
    </div>
  )
}

function VehicleForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading, 
  onCancel 
}: {
  formData: VehicleFormData
  setFormData: (data: VehicleFormData) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  onCancel: () => void
}) {
  const categoryOptions = [
    { value: 'SEDAN', label: 'سيدان' },
    { value: 'SUV', label: 'SUV' },
    { value: 'HATCHBACK', label: 'هاتشباك' },
    { value: 'TRUCK', label: 'شاحنة' }
  ]

  const fuelTypeOptions = [
    { value: 'PETROL', label: 'بنزين' },
    { value: 'DIESEL', label: 'ديزل' },
    { value: 'ELECTRIC', label: 'كهربائي' },
    { value: 'HYBRID', label: 'هجين' }
  ]

  const transmissionOptions = [
    { value: 'MANUAL', label: 'يدوي' },
    { value: 'AUTOMATIC', label: 'أوتوماتيك' }
  ]

  const statusOptions = [
    { value: 'AVAILABLE', label: 'متاح' },
    { value: 'SOLD', label: 'مباع' },
    { value: 'RESERVED', label: 'محجوز' },
    { value: 'MAINTENANCE', label: 'صيانة' }
  ]

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">الماركة *</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({...formData, make: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="model">الموديل *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="year">السنة *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">السعر *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="stockNumber">رقم المخزون *</Label>
          <Input
            id="stockNumber"
            value={formData.stockNumber}
            onChange={(e) => setFormData({...formData, stockNumber: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="color">اللون *</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">الفئة *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="fuelType">نوع الوقود *</Label>
          <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الوقود" />
            </SelectTrigger>
            <SelectContent>
              {fuelTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="transmission">ناقل الحركة *</Label>
          <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر ناقل الحركة" />
            </SelectTrigger>
            <SelectContent>
              {transmissionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">الحالة *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
        />
        <Label htmlFor="featured">مركبة مميزة</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="ml-2 h-4 w-4" />
          إلغاء
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="ml-2 h-4 w-4" />
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </form>
  )
}

// Images Management Dialog
const ImagesManagementDialog = ({ 
  vehicle, 
  open, 
  onOpenChange 
}: { 
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void 
}) => {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<VehicleImage[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open && vehicle?.id) {
      fetchImages()
    }
  }, [open, vehicle?.id])

  const fetchImages = async () => {
    if (!vehicle?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/images`)
      if (response.ok) {
        const imagesData = await response.json()
        setImages(imagesData)
      } else {
        console.error('Failed to fetch images')
        setImages([])
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle?.id}/images/${imageId}/primary`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        setImages(prev => prev.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        })))
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تعيين الصورة كأساسية')
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
      alert('فشل في تعيين الصورة كأساسية')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle?.id}/images/${imageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId))
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف الصورة')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('فشل في حذف الصورة')
    } finally {
      setLoading(false)
    }
  }

  const handleAddImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // In a real app, you would upload the file to a storage service
      // For now, we'll create a placeholder URL
      const imageUrl = URL.createObjectURL(file)
      
      const response = await fetch(`/api/admin/vehicles/${vehicle?.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          altText: `${vehicle?.make} ${vehicle?.model}`,
          isPrimary: images.length === 0
        })
      })
      
      if (response.ok) {
        const newImage = await response.json()
        setImages(prev => [...prev, newImage])
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إضافة الصورة')
      }
    } catch (error) {
      console.error('Error adding image:', error)
      alert('فشل في إضافة الصورة')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إدارة الصور - {vehicle.make} {vehicle.model}</DialogTitle>
          <DialogDescription>
            إدارة صور المركبة وتحديثها
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload Section */}
          <div>
            <Label htmlFor="imageUpload">رفع صور جديدة</Label>
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              disabled={uploading}
            />
          </div>

          {/* Images Grid */}
          {images.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد صور لهذه المركبة</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="relative">
                  <CardContent className="p-0">
                    <img
                      src={image.imageUrl}
                      alt={image.altText || `${vehicle.make} ${vehicle.model}`}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        {image.isPrimary && (
                          <Badge className="bg-yellow-500">أساسية</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      {!image.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(image.id)}
                          disabled={loading}
                          className="w-full"
                        >
                          تعيين كصورة أساسية
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Specifications Management Dialog
const SpecsManagementDialog = ({ 
  vehicle, 
  open, 
  onOpenChange 
}: { 
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void 
}) => {
  const [loading, setLoading] = useState(false)
  const [specs, setSpecs] = useState<VehicleSpecification[]>([])

  useEffect(() => {
    if (open && vehicle?.id) {
      fetchSpecs()
    }
  }, [open, vehicle?.id])

  const fetchSpecs = async () => {
    if (!vehicle?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/specs`)
      if (response.ok) {
        const specsData = await response.json()
        setSpecs(specsData)
      } else {
        console.error('Failed to fetch specifications')
        setSpecs([])
      }
    } catch (error) {
      console.error('Error fetching specifications:', error)
      setSpecs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSpecs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle?.id}/specs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ specifications: specs })
      })
      
      if (response.ok) {
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حفظ المواصفات')
      }
    } catch (error) {
      console.error('Error saving specs:', error)
      alert('فشل في حفظ المواصفات')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSpec = () => {
    setSpecs(prev => [
      ...prev,
      {
        key: '',
        label: '',
        value: '',
        category: 'engine' as const
      }
    ])
  }

  const handleRemoveSpec = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateSpec = (index: number, field: keyof VehicleSpecification, value: any) => {
    setSpecs(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ))
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إدارة المواصفات - {vehicle.make} {vehicle.model}</DialogTitle>
          <DialogDescription>
            تحديث مواصفات المركبة الفنية
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {specs.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد مواصفات لهذه المركبة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specs.map((spec, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">المواصفة #{index + 1}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSpec(index)}
                          disabled={specs.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label>المفتاح</Label>
                        <Input
                          value={spec.key}
                          onChange={(e) => handleUpdateSpec(index, 'key', e.target.value)}
                          placeholder="مثال: engine_power"
                        />
                      </div>
                      
                      <div>
                        <Label>العلامة</Label>
                        <Input
                          value={spec.label}
                          onChange={(e) => handleUpdateSpec(index, 'label', e.target.value)}
                          placeholder="مثال: قوة المحرك"
                        />
                      </div>
                      
                      <div>
                        <Label>القيمة</Label>
                        <Input
                          value={spec.value}
                          onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                          placeholder="مثال: 200 حصان"
                        />
                      </div>
                      
                      <div>
                        <Label>الفئة</Label>
                        <Select
                          value={spec.category}
                          onValueChange={(value) => handleUpdateSpec(index, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engine">المحرك</SelectItem>
                            <SelectItem value="exterior">الخارج</SelectItem>
                            <SelectItem value="interior">الداخل</SelectItem>
                            <SelectItem value="safety">السلامة</SelectItem>
                            <SelectItem value="technology">التكنولوجيا</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={handleAddSpec}
            className="w-full"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة مواصفة جديدة
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSaveSpecs} disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ المواصفات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Pricing Management Dialog
const PricingManagementDialog = ({ 
  vehicle, 
  open, 
  onOpenChange 
}: { 
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void 
}) => {
  const [loading, setLoading] = useState(false)
  const [pricing, setPricing] = useState<VehiclePricing>({
    basePrice: vehicle?.price || 0,
    discountPrice: undefined,
    discountPercentage: undefined,
    taxes: 0,
    fees: 0,
    totalPrice: vehicle?.price || 0,
    currency: 'EGP',
    hasDiscount: false,
    discountExpires: undefined
  })

  useEffect(() => {
    if (open && vehicle?.id) {
      fetchPricing()
    }
  }, [open, vehicle?.id])

  const fetchPricing = async () => {
    if (!vehicle?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle.id}/pricing`)
      if (response.ok) {
        const pricingData = await response.json()
        setPricing(pricingData)
      } else {
        console.error('Failed to fetch pricing')
        // Keep default pricing
      }
    } catch (error) {
      console.error('Error fetching pricing:', error)
      // Keep default pricing
    } finally {
      setLoading(false)
    }
  }

  const handleSavePricing = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle?.id}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricing)
      })
      
      if (response.ok) {
        const updatedPricing = await response.json()
        setPricing(updatedPricing)
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حفظ التسعير')
      }
    } catch (error) {
      console.error('Error saving pricing:', error)
      alert('فشل في حفظ التسعير')
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscountPrice = () => {
    if (!pricing.hasDiscount) return null
    if (pricing.discountPrice) return pricing.discountPrice
    if (pricing.discountPercentage) {
      return pricing.basePrice - (pricing.basePrice * pricing.discountPercentage / 100)
    }
    return null
  }

  const discountPrice = calculateDiscountPrice()
  const finalPrice = discountPrice ? discountPrice + pricing.taxes + pricing.fees : pricing.basePrice + pricing.taxes + pricing.fees

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إدارة التسعير - {vehicle.make} {vehicle.model}</DialogTitle>
          <DialogDescription>
            تحديث أسعار المركبة وخيارات التمويل
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">السعر الأساسي *</Label>
              <Input
                id="basePrice"
                type="number"
                value={pricing.basePrice}
                onChange={(e) => setPricing({...pricing, basePrice: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="currency">العملة</Label>
              <Select
                value={pricing.currency}
                onValueChange={(value) => setPricing({...pricing, currency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxes">الضرائب</Label>
              <Input
                id="taxes"
                type="number"
                value={pricing.taxes}
                onChange={(e) => setPricing({...pricing, taxes: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="fees">الرسوم</Label>
              <Input
                id="fees"
                type="number"
                value={pricing.fees}
                onChange={(e) => setPricing({...pricing, fees: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasDiscount"
              checked={pricing.hasDiscount}
              onChange={(e) => setPricing({...pricing, hasDiscount: e.target.checked})}
            />
            <Label htmlFor="hasDiscount">تطبيق خصم</Label>
          </div>
          
          {pricing.hasDiscount && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountPrice">السعر بعد الخصم</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={pricing.discountPrice || ''}
                    onChange={(e) => setPricing({
                      ...pricing, 
                      discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      discountPercentage: undefined
                    })}
                    placeholder="اختياري"
                  />
                </div>
                <div>
                  <Label htmlFor="discountPercentage">نسبة الخصم (%)</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={pricing.discountPercentage || ''}
                    onChange={(e) => setPricing({
                      ...pricing, 
                      discountPercentage: e.target.value ? Number(e.target.value) : undefined,
                      discountPrice: undefined
                    })}
                    placeholder="اختياري"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="discountExpires">تاريخ انتهاء الخصم</Label>
                <Input
                  id="discountExpires"
                  type="date"
                  value={pricing.discountExpires || ''}
                  onChange={(e) => setPricing({...pricing, discountExpires: e.target.value || undefined})}
                />
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                السعر الإجمالي: {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: pricing.currency,
                  minimumFractionDigits: 0
                }).format(finalPrice)}
              </div>
              {pricing.hasDiscount && discountPrice && (
                <div className="text-sm text-green-600">
                  وفرت: {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: pricing.currency,
                    minimumFractionDigits: 0
                  }).format(pricing.basePrice - discountPrice + pricing.taxes + pricing.fees)}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSavePricing} disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ التسعير'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
