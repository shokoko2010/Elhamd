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
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'

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
  images: { imageUrl: string; isPrimary: boolean; altText?: string }[]
  createdAt: string
  updatedAt: string
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
    category: '',
    fuelType: '',
    transmission: '',
    status: ''
  })
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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
    featured: false
  })

  useEffect(() => {
    // Mock data - will be replaced with API call
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 850000,
        stockNumber: 'TN2024001',
        vin: 'MAT625487K1L5B4321',
        description: 'سيارة SUV مدمجة بمحرك توربو وميزات أمان متقدمة',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true, altText: 'Tata Nexon' }],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 650000,
        stockNumber: 'TP2024002',
        vin: 'MAT625487K1L5B4322',
        description: 'سيارة SUV مدمجة مثالية للقيادة في المدينة',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: true,
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true, altText: 'Tata Punch' }],
        createdAt: '2024-01-09T10:00:00Z',
        updatedAt: '2024-01-09T10:00:00Z'
      },
      {
        id: '3',
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 550000,
        stockNumber: 'TT2024003',
        vin: 'MAT625487K1L5B4323',
        description: 'سيارة هاتشباك اقتصادية باستهلاك وقود منخفض',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أزرق',
        status: 'AVAILABLE',
        featured: false,
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true, altText: 'Tata Tiago' }],
        createdAt: '2024-01-08T10:00:00Z',
        updatedAt: '2024-01-08T10:00:00Z'
      },
      {
        id: '4',
        make: 'Tata',
        model: 'Harrier',
        year: 2024,
        price: 1200000,
        stockNumber: 'TH2024004',
        vin: 'MAT625487K1L5B4324',
        description: 'سيارة SUV فاخرة بأداء قوي وتصميم عصري',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أسود',
        status: 'SOLD',
        featured: true,
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true, altText: 'Tata Harrier' }],
        createdAt: '2024-01-07T10:00:00Z',
        updatedAt: '2024-01-07T10:00:00Z'
      },
      {
        id: '5',
        make: 'Tata',
        model: 'Nexon EV',
        year: 2024,
        price: 1400000,
        stockNumber: 'TNE2024005',
        vin: 'MAT625487K1L5B4325',
        description: 'سيارة SUV كهربائية بانبعاثات صفرية',
        category: 'SUV',
        fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true, altText: 'Tata Nexon EV' }],
        createdAt: '2024-01-06T10:00:00Z',
        updatedAt: '2024-01-06T10:00:00Z'
      }
    ]
    
    setVehicles(mockVehicles)
    setFilteredVehicles(mockVehicles)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.stockNumber.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !filters.category || vehicle.category === filters.category
      const matchesFuelType = !filters.fuelType || vehicle.fuelType === filters.fuelType
      const matchesTransmission = !filters.transmission || vehicle.transmission === filters.transmission
      const matchesStatus = !filters.status || vehicle.status === filters.status

      return matchesSearch && matchesCategory && matchesFuelType && matchesTransmission && matchesStatus
    })

    setFilteredVehicles(filtered)
  }, [vehicles, searchTerm, filters])

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
      featured: false
    })
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
      featured: vehicle.featured
    })
    setShowEditDialog(true)
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowDeleteDialog(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...formData,
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setVehicles(prev => [...prev, newVehicle])
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedVehicle: Vehicle = {
        ...editingVehicle,
        ...formData,
        updatedAt: new Date().toISOString()
      }
      
      setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updatedVehicle : v))
      setShowEditDialog(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error updating vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingVehicle) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setVehicles(prev => prev.filter(v => v.id !== editingVehicle.id))
      setShowDeleteDialog(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error deleting vehicle:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المركبات</h1>
              <p className="text-gray-600">إضافة وتعديل وحذف المركبات في النظام</p>
            </div>
            <Button onClick={handleAddVehicle}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مركبة جديدة
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <SelectItem value="">جميع الفئات</SelectItem>
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
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  {fuelTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.transmission} onValueChange={(value) => setFilters({...filters, transmission: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="ناقل الحركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  {transmissionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المركبة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المواصفات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
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
                  ) : filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد مركبات مطابقة للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4">
                              <img
                                src={vehicle.images[0]?.imageUrl || '/api/placeholder/400/300'}
                                alt={vehicle.make}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.make} {vehicle.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.stockNumber}
                              </div>
                              {vehicle.featured && (
                                <Badge variant="secondary" className="mt-1">مميز</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vehicle.year}</div>
                          <div className="text-sm text-gray-500">{vehicle.category}</div>
                          <div className="text-sm text-gray-500">{vehicle.color}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(vehicle.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(vehicle.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(vehicle.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link href={`/vehicles/${vehicle.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle)}>
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
              هل أنت متأكد من حذف مركبة {editingVehicle?.make} {editingVehicle?.model}؟
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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
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
          <Label htmlFor="vin">رقم الهيكل (VIN)</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => setFormData({...formData, vin: e.target.value})}
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
          <Label htmlFor="mileage">المسافة (كم)</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value)})}
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
        <Label htmlFor="description">الوصف *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
          className="rounded border-gray-300"
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