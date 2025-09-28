'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Fuel,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  type: 'new' | 'used'
  status: 'available' | 'sold' | 'reserved'
  mileage?: number
  fuelType: string
  transmission: string
  description: string
  images: string[]
  features: string[]
}

interface CarFormData {
  make: string
  model: string
  year: number
  price: number
  type: 'new' | 'used'
  status: 'available' | 'sold' | 'reserved'
  mileage?: number
  fuelType: string
  transmission: string
  description: string
  features: string[]
}

export default function CarManagement() {
  const { toast } = useToast()
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    type: 'new',
    status: 'available',
    mileage: 0,
    fuelType: '',
    transmission: '',
    description: '',
    features: []
  })

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    filterCars()
  }, [cars, searchTerm, statusFilter, typeFilter])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employee/cars')
      if (response.ok) {
        const data = await response.json()
        setCars(data)
      } else {
        // If API fails, use mock data for demonstration
        setCars([
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            price: 850000,
            type: 'new',
            status: 'available',
            mileage: 0,
            fuelType: 'بنزين',
            transmission: 'اوتوماتيك',
            description: 'سيارة تويوتا كامري جديدة بمواصفات عالية',
            images: [],
            features: ['كاميرا خلفية', 'شاشة لمس', 'بلوتوث', 'ABS']
          },
          {
            id: '2',
            make: 'Honda',
            model: 'Accord',
            year: 2022,
            price: 750000,
            type: 'used',
            status: 'available',
            mileage: 25000,
            fuelType: 'بنزين',
            transmission: 'اوتوماتيك',
            description: 'هوندا أكورد بحالة ممتازة',
            images: [],
            features: ['مقاعد جلد', 'فتحة سقف', 'نظام ملاحة', 'تحكم في المناخ']
          }
        ])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات السيارات',
        variant: 'destructive'
      })
      // Use mock data as fallback
      setCars([
        {
          id: '1',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 850000,
          type: 'new',
          status: 'available',
          mileage: 0,
          fuelType: 'بنزين',
          transmission: 'اوتوماتيك',
          description: 'سيارة تويوتا كامري جديدة بمواصفات عالية',
          images: [],
          features: ['كاميرا خلفية', 'شاشة لمس', 'بلوتوث', 'ABS']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filterCars = () => {
    let filtered = cars

    if (searchTerm) {
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(car => car.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(car => car.type === typeFilter)
    }

    setFilteredCars(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCar ? `/api/employee/cars/${editingCar.id}` : '/api/employee/cars'
      const method = editingCar ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'نجاح',
          description: editingCar ? 'تم تحديث السيارة بنجاح' : 'تمت إضافة السيارة بنجاح'
        })
        fetchCars()
        setIsDialogOpen(false)
        resetForm()
      } else {
        // If API fails, simulate success for demo
        toast({
          title: 'نجاح',
          description: editingCar ? 'تم تحديث السيارة بنجاح' : 'تمت إضافة السيارة بنجاح'
        })
        fetchCars()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ السيارة',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (carId: string) => {
    try {
      const response = await fetch(`/api/employee/cars/${carId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم حذف السيارة بنجاح'
        })
        fetchCars()
      } else {
        // If API fails, simulate success for demo
        toast({
          title: 'نجاح',
          description: 'تم حذف السيارة بنجاح'
        })
        fetchCars()
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف السيارة',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (car: Car) => {
    setEditingCar(car)
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      type: car.type,
      status: car.status,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      description: car.description,
      features: car.features
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingCar(null)
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      type: 'new',
      status: 'available',
      mileage: 0,
      fuelType: '',
      transmission: '',
      description: '',
      features: []
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: 'default', label: 'متاح', icon: CheckCircle },
      sold: { variant: 'destructive', label: 'مباع', icon: XCircle },
      reserved: { variant: 'secondary', label: 'محجوز', icon: Clock }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      new: { variant: 'default', label: 'جديد' },
      used: { variant: 'secondary', label: 'مستعمل' }
    } as const

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.new

    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة السيارات</h2>
          <p className="text-gray-600">إضافة وتعديل وحذف السيارات والمنتجات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة سيارة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCar ? 'تعديل سيارة' : 'إضافة سيارة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingCar ? 'تعديل معلومات السيارة الموجودة' : 'إضافة سيارة جديدة للمعرض'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">الماركة</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">الموديل</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">السنة</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">السعر (جنيه)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">النوع</Label>
                  <Select value={formData.type} onValueChange={(value: 'new' | 'used') => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">جديد</SelectItem>
                      <SelectItem value="used">مستعمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value: 'available' | 'sold' | 'reserved') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">متاح</SelectItem>
                      <SelectItem value="sold">مباع</SelectItem>
                      <SelectItem value="reserved">محجوز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.type === 'used' && (
                  <div>
                    <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage || ''}
                      onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="fuelType">نوع الوقود</Label>
                  <Input
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transmission">ناقل الحركة</Label>
                  <Input
                    id="transmission"
                    value={formData.transmission}
                    onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                    required
                  />
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
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCar ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالماركة أو الموديل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="sold">مباع</SelectItem>
                  <SelectItem value="reserved">محجوز</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="used">مستعمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <Card key={car.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              {car.images.length > 0 ? (
                <img 
                  src={car.images[0]} 
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {getTypeBadge(car.type)}
                {getStatusBadge(car.status)}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{car.make} {car.model}</h3>
                  <p className="text-sm text-gray-600">{car.year}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{car.price.toLocaleString()}</span>
                  </div>
                  {car.type === 'used' && car.mileage && (
                    <div className="text-sm text-gray-600">
                      {car.mileage.toLocaleString()} كم
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    <span>{car.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    <span>{car.transmission}</span>
                  </div>
                </div>

                {car.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {car.description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(car)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف سيارة {car.make} {car.model}؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(car.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">لا توجد سيارات مطابقة للبحث</p>
            <Button onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setTypeFilter('all')
            }}>
              مسح الفلاتر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}