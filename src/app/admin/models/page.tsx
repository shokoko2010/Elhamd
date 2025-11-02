'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Car,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Mock data types
interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  vin?: string
  description?: string
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color?: string
  status: string
  featured: boolean
  createdAt?: string
  updatedAt?: string
}

export default function AdminModelsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      } else {
        setError('فشل في تحميل المركبات')
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
      setError('فشل في تحميل المركبات')
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      // Mock save operation
      if (editingVehicle?.id) {
        // Update existing vehicle
        setVehicles(prev => prev.map(v => 
          v.id === editingVehicle.id ? { ...v, ...vehicleData } : v
        ))
      } else {
        // Create new vehicle
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          make: vehicleData.make || '',
          model: vehicleData.model || '',
          year: vehicleData.year || new Date().getFullYear(),
          price: vehicleData.price || 0,
          stockNumber: vehicleData.stockNumber || '',
          vin: vehicleData.vin || '',
          description: vehicleData.description || '',
          category: vehicleData.category || 'SUV',
          fuelType: vehicleData.fuelType || 'PETROL',
          transmission: vehicleData.transmission || 'MANUAL',
          mileage: vehicleData.mileage || 0,
          color: vehicleData.color || '',
          status: vehicleData.status || 'AVAILABLE',
          featured: vehicleData.featured || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setVehicles(prev => [newVehicle, ...prev])
      }
      
      setIsDialogOpen(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error saving vehicle:', error)
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      try {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId))
      } catch (error) {
        console.error('Error deleting vehicle:', error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />متاح</Badge>
      case 'SOLD':
        return <Badge variant="destructive">مباع</Badge>
      case 'RESERVED':
        return <Badge className="bg-yellow-500">محجوز</Badge>
      case 'MAINTENANCE':
        return <Badge className="bg-blue-500">صيانة</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">موديلات السيارات</h1>
          <p className="text-gray-600">إدارة مخزون السيارات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVehicle(null)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة سيارة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'تعديل سيارة' : 'إضافة سيارة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'تحديث معلومات السيارة' : 'إضافة سيارة جديدة إلى المخزون'}
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              vehicle={editingVehicle}
              onSave={handleSaveVehicle}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingVehicle(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث في السيارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="sold">مباع</SelectItem>
                <SelectItem value="reserved">محجوز</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>مخزون السيارات</CardTitle>
          <CardDescription>
            {filteredVehicles.length} سيارة تم العثور عليها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>السيارة</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>مميزة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Car className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-500">{vehicle.year}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(vehicle.price)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(vehicle.status)}
                    </TableCell>
                    <TableCell>
                      {vehicle.featured ? (
                        <Badge className="bg-yellow-500">مميزة</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle)
                            // View vehicle details
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface VehicleFormProps {
  vehicle?: Partial<Vehicle> | null
  onSave: (vehicle: Partial<Vehicle>) => Promise<void>
  onCancel: () => void
}

function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    price: vehicle?.price || 0,
    stockNumber: vehicle?.stockNumber || '',
    vin: vehicle?.vin || '',
    description: vehicle?.description || '',
    category: vehicle?.category || 'SUV',
    fuelType: vehicle?.fuelType || 'PETROL',
    transmission: vehicle?.transmission || 'MANUAL',
    mileage: vehicle?.mileage || 0,
    color: vehicle?.color || '',
    status: vehicle?.status || 'AVAILABLE',
    featured: vehicle?.featured || false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="price">السعر (ج.م) *</Label>
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
          <Label htmlFor="vin">رقم الشاسيه (VIN)</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => setFormData({...formData, vin: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="category">الفئة *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEDAN">سيدان</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="HATCHBACK">هايتبك</SelectItem>
              <SelectItem value="TRUCK">شاحنة</SelectItem>
              <SelectItem value="VAN">فان</SelectItem>
              <SelectItem value="COMMERCIAL">تجاري</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fuelType">نوع الوقود *</Label>
          <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PETROL">بنزين</SelectItem>
              <SelectItem value="DIESEL">ديزل</SelectItem>
              <SelectItem value="ELECTRIC">كهربائي</SelectItem>
              <SelectItem value="HYBRID">هايبرد</SelectItem>
              <SelectItem value="CNG">غاز طبيعي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="transmission">ناقل الحركة *</Label>
          <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">عادي</SelectItem>
              <SelectItem value="AUTOMATIC">أوتوماتيك</SelectItem>
              <SelectItem value="CVT">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">اللون</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <Label htmlFor="status">الحالة *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">متاح</SelectItem>
              <SelectItem value="SOLD">مباع</SelectItem>
              <SelectItem value="RESERVED">محجوز</SelectItem>
              <SelectItem value="MAINTENANCE">صيانة</SelectItem>
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
          className="rounded border-gray-300"
        />
        <Label htmlFor="featured">سيارة مميزة</Label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </form>
  )
}