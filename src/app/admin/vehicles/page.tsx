'use client'

import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
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
  Calendar, DollarSign, Settings, Package, Loader2, RefreshCw
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

interface VehicleImageFormData {
  id?: string
  imageUrl: string
  altText?: string | null
  isPrimary?: boolean
  order?: number
}

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
  images: { id: string; imageUrl: string; altText?: string | null; isPrimary: boolean; order: number }[]
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

interface VehicleFormState {
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  stockQuantity: number
  vin: string
  description: string
  category: string
  fuelType: string
  transmission: string
  mileage: number
  color: string
  status: string
  featured: boolean
  images: VehicleImageFormData[]
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

const createInitialFormState = (): VehicleFormState => ({
  make: 'Tata Motors',
  model: '',
  year: new Date().getFullYear(),
  price: 0,
  stockNumber: '',
  stockQuantity: 0,
  vin: '',
  description: '',
  category: 'SEDAN',
  fuelType: 'PETROL',
  transmission: 'MANUAL',
  mileage: 0,
  color: '',
  status: 'AVAILABLE',
  featured: false,
  images: []
})

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
  const [formData, setFormData] = useState<VehicleFormState>(() => createInitialFormState())
  const [imageInputs, setImageInputs] = useState({ create: '', edit: '' })
  const [imageUploadLoading, setImageUploadLoading] = useState({ create: false, edit: false })
  const createUploadInputRef = useRef<HTMLInputElement | null>(null)
  const editUploadInputRef = useRef<HTMLInputElement | null>(null)

  const normalizeFormImages = (images: VehicleImageFormData[] = []) => {
    if (!Array.isArray(images) || images.length === 0) {
      return []
    }

    const trimmed = images
      .map((image, index) => ({
        ...image,
        imageUrl: (image.imageUrl || '').trim(),
        order: typeof image.order === 'number' ? image.order : index
      }))
      .filter(image => image.imageUrl.length > 0)

    if (trimmed.length === 0) {
      return []
    }

    trimmed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    let hasPrimary = trimmed.some(image => image.isPrimary)

    return trimmed.map((image, index) => {
      const isPrimary = hasPrimary ? Boolean(image.isPrimary && image.imageUrl) : index === 0
      if (!hasPrimary && index === 0) {
        hasPrimary = true
      }

      return {
        ...image,
        altText: image.altText?.trim() || undefined,
        isPrimary,
        order: index
      }
    })
  }

  const updateImagesState = (mutator: (images: VehicleImageFormData[]) => VehicleImageFormData[]) => {
    setFormData(prev => {
      const nextImages = normalizeFormImages(mutator(prev.images))
      return { ...prev, images: nextImages }
    })
  }

  const handleImageInputChange = (context: 'create' | 'edit', value: string) => {
    setImageInputs(prev => ({ ...prev, [context]: value }))
  }

  const resolveVehicleFilenameHint = (context: 'create' | 'edit') => {
    const base = context === 'edit' && selectedVehicle ? selectedVehicle : formData
    const yearValue = (base as { year?: number | string } | null | undefined)?.year
    const normalizedYear =
      typeof yearValue === 'number'
        ? yearValue.toString()
        : typeof yearValue === 'string'
          ? yearValue
          : ''

    const parts = [base?.make, base?.model, normalizedYear]
    return parts
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(' ')
      .trim()
  }

  const handleAddImage = (context: 'create' | 'edit') => {
    const value = imageInputs[context].trim()
    if (!value) {
      toast.error('يرجى إدخال رابط صورة صالح')
      return
    }

    if (formData.images.some(image => image.imageUrl === value)) {
      toast.info('هذه الصورة موجودة بالفعل في القائمة')
      return
    }

    updateImagesState(images => [...images, { imageUrl: value, isPrimary: images.length === 0 }])
    setImageInputs(prev => ({ ...prev, [context]: '' }))
  }

  const handleRemoveImage = (index: number) => {
    updateImagesState(images => images.filter((_, idx) => idx !== index))
  }

  const handleSetPrimaryImage = (index: number) => {
    updateImagesState(images => images.map((image, idx) => ({
      ...image,
      isPrimary: idx === index
    })))
  }

  const uploadImageFile = async (context: 'create' | 'edit', file: File) => {
    setImageUploadLoading(prev => ({ ...prev, [context]: true }))
    try {
      const payload = new FormData()
      payload.append('file', file)
      payload.append('type', 'vehicle')
      payload.append('entityId', context === 'edit' && selectedVehicle ? selectedVehicle.id : 'new-vehicle')
      const filenameHint = resolveVehicleFilenameHint(context)
      if (filenameHint) {
        payload.append('filenameHint', filenameHint)
      }

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'فشل في رفع الصورة')
      }

      const data = await response.json()
      const uploadedUrl = typeof data?.url === 'string'
        ? data.url
        : typeof data?.originalUrl === 'string'
          ? data.originalUrl
          : ''

      if (!uploadedUrl) {
        throw new Error('لم يتم الحصول على رابط الصورة بعد الرفع')
      }

      updateImagesState(images => [...images, { imageUrl: uploadedUrl, isPrimary: images.length === 0 }])
      toast.success('تم رفع الصورة وإضافتها بنجاح')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في رفع الصورة')
    } finally {
      setImageUploadLoading(prev => ({ ...prev, [context]: false }))
    }
  }

  const handleImageUploadSelection = async (context: 'create' | 'edit', event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return
    }

    const file = event.target.files[0]
    await uploadImageFile(context, file)
    event.target.value = ''
  }

  const buildVehiclePayload = () => {
    const { images, ...rest } = formData
    const normalized = normalizeFormImages(images)

    return {
      ...rest,
      images: normalized.length
        ? normalized.map((image, index) => ({
            imageUrl: image.imageUrl,
            altText: image.altText,
            isPrimary: image.isPrimary ?? index === 0,
            order: index
          }))
        : undefined
    }
  }

  const handleCreateDialogChange = (open: boolean) => {
    if (!open) {
      resetForm()
      setSelectedVehicle(null)
    }
    setIsCreateDialogOpen(open)
  }

  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedVehicle(null)
      resetForm()
    }
    setIsEditDialogOpen(open)
  }

  const renderImageManager = (context: 'create' | 'edit') => (
    <div className="space-y-3">
      <Label>صور المركبة</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="أدخل رابط الصورة (https://...)"
          value={imageInputs[context]}
          onChange={(event) => handleImageInputChange(context, event.target.value)}
          dir="ltr"
        />
        <Button type="button" onClick={() => handleAddImage(context)} className="shrink-0">
          إضافة الرابط
        </Button>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          disabled={imageUploadLoading[context]}
          onClick={() => (context === 'create' ? createUploadInputRef : editUploadInputRef).current?.click()}
        >
          {imageUploadLoading[context] ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الرفع
            </span>
          ) : (
            'رفع صورة'
          )}
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={context === 'create' ? createUploadInputRef : editUploadInputRef}
          className="hidden"
          onChange={(event) => handleImageUploadSelection(context, event)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        يمكنك لصق رابط صورة مباشر أو رفع صورة جديدة لتظهر في واجهة الموقع.
      </p>
      {formData.images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          لم يتم إضافة صور بعد. يرجى إضافة صورة واحدة على الأقل لإظهار المركبة بشكل جذاب.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {formData.images.map((image, index) => (
            <div key={(image.id || image.imageUrl) + index} className="relative overflow-hidden rounded-lg border bg-white">
              <div className="relative h-32 w-full">
                <img
                  src={image.imageUrl}
                  alt={`صورة ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = '/api/placeholder/vehicle'
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {image.isPrimary ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">الصورة الرئيسية</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(index)}
                      className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-gray-700 shadow"
                    >
                      تعيين كصورة أساسية
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="rounded-full bg-white/80 p-1 text-gray-700 shadow transition hover:bg-white"
                    aria-label="حذف الصورة"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                {image.imageUrl}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

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
        images: Array.isArray(vehicle.images)
          ? [...vehicle.images]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((image, index) => ({
                ...image,
                altText: image.altText ?? null,
                order: typeof image.order === 'number' ? image.order : index
              }))
          : [],
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
        totalValue: vehiclesData.reduce((sum: number, v: Vehicle) => {
          const quantity = typeof v.stockQuantity === 'number' ? Math.max(v.stockQuantity, 0) : 0
          const unitValue = v.pricing?.totalPrice || v.price
          return sum + quantity * unitValue
        }, 0)
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

      const payload = buildVehiclePayload()

      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل في إنشاء المركبة')
      }
      
      toast.success('تم إنشاء المركبة بنجاح')
      handleCreateDialogChange(false)
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

      const payload = buildVehiclePayload()

      const response = await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'فشل في تحديث المركبة')
      }
      
      toast.success('تم تحديث المركبة بنجاح')
      handleEditDialogChange(false)
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
    setFormData(createInitialFormState())
    setImageInputs({ create: '', edit: '' })
    setImageUploadLoading({ create: false, edit: false })
  }

  // Open edit dialog
  const openEditDialog = (vehicle: Vehicle) => {
    const sortedImages = Array.isArray(vehicle.images)
      ? [...vehicle.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : []

    const mappedImages = normalizeFormImages(
      sortedImages.map(image => ({
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText ?? undefined,
        isPrimary: image.isPrimary,
        order: image.order
      }))
    )

    setSelectedVehicle({ ...vehicle, images: sortedImages })
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
      featured: vehicle.featured || false,
      images: mappedImages
    })
    setImageInputs(prev => ({ ...prev, edit: '' }))
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
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 p-6 text-white shadow-xl shadow-blue-200/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-blue-50">
              <Car className="h-4 w-4" />
              إدارة المركبات
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">قائمة المركبات والعمليات اللحظية</h1>
            <p className="text-sm text-blue-50/80">إدارة دقيقة للمركبات مع وصول سريع للإجراءات، الفلاتر الذكية، ورؤية واضحة للمخزون والحجوزات.</p>
            <div className="flex flex-wrap gap-3">
              <Badge className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">مزامنة مباشرة مع قاعدة البيانات</Badge>
              <Badge className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">قابلة للتحكم من لوحة الأدمن</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start">
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => fetchVehicles()}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث البيانات
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              إضافة مركبة جديدة
            </Button>
          </div>
        </div>
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[{
              label: 'إجمالي المركبات',
              value: stats.total,
              description: 'جميع المركبات المسجلة',
              accent: 'from-blue-500/80 to-blue-400/70',
              icon: Car
            }, {
              label: 'المتاحة',
              value: stats.available,
              description: `${stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% من الأسطول`,
              accent: 'from-emerald-500/80 to-emerald-400/70',
              icon: Eye
            }, {
              label: 'المباعة',
              value: stats.sold,
              description: 'المبيعات المؤكدة',
              accent: 'from-indigo-500/80 to-indigo-400/70',
              icon: DollarSign
            }, {
              label: 'قيمة المخزون',
              value: formatPrice(stats.totalValue),
              description: 'إجمالي الكميات × السعر',
              accent: 'from-cyan-500/80 to-cyan-400/70',
              icon: Package
            }].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4 shadow-inner shadow-blue-900/30">
                  <div className="flex items-center justify-between text-sm text-blue-50/80">
                    <span>{item.label}</span>
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent}`}> 
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-blue-50/70">{item.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[{
            title: 'إجمالي المركبات',
            value: stats.total,
            helper: 'جميع المركبات في النظام',
            icon: Car,
            badge: 'bg-blue-50 text-blue-700'
          }, {
            title: 'المركبات المتاحة',
            value: stats.available,
            helper: `${stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% من إجمالي المركبات`,
            icon: Eye,
            badge: 'bg-emerald-50 text-emerald-700'
          }, {
            title: 'المركبات المباعة',
            value: stats.sold,
            helper: 'هذا الشهر',
            icon: DollarSign,
            badge: 'bg-indigo-50 text-indigo-700'
          }, {
            title: 'قيمة المخزون',
            value: formatPrice(stats.totalValue),
            helper: 'إجمالي القيمة',
            icon: Package,
            badge: 'bg-cyan-50 text-cyan-700'
          }].map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="border-none bg-white/90 shadow-lg shadow-blue-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">{card.title}</CardTitle>
                    <p className="text-xs text-gray-500">{card.helper}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.badge}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{card.value}</div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: '80%' }} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Search and Filters */}
      <Card className="border-none bg-white/90 shadow-lg shadow-blue-50">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">البحث والتصفية</CardTitle>
            <CardDescription>فلترة سريعة حسب الفئة، الحالة، السعر أو سنة الصنع</CardDescription>
          </div>
          <div className="flex gap-2 text-xs text-blue-600">
            <Badge className="rounded-full bg-blue-50 text-blue-700">عرض 10 مركبات</Badge>
            <Badge className="rounded-full bg-emerald-50 text-emerald-700">تحديث تلقائي</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                <Input
                  placeholder="البحث عن مركبة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full border-blue-100 bg-blue-50/40 pr-10 text-sm focus-visible:ring-blue-200"
                />
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              <Select value={category || 'all'} onValueChange={setCategory}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
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
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
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
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
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
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">الأحدث</SelectItem>
                  <SelectItem value="asc">الأقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <Card className="border-none bg-white/90 shadow-lg shadow-blue-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">قائمة المركبات</CardTitle>
          <CardDescription>عرض جميع المركبات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 h-36 rounded-xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-12 text-center">
              <Car className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">لا توجد مركبات</h3>
              <p className="mb-4 text-gray-600">لم يتم العثور على أي مركبات مطابقة للبحث</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                إضافة مركبة جديدة
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl">
                  <div className="relative h-40 w-full bg-slate-100">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        src={vehicle.images.find(img => img.isPrimary)?.imageUrl || vehicle.images[0]?.imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/vehicle'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <Badge className={`rounded-full bg-white/90 text-slate-900 ${getStatusBadge(vehicle.status)}`}>{getStatusLabel(vehicle.status)}</Badge>
                      {vehicle.featured && (
                        <Badge className="rounded-full bg-amber-50 text-amber-700">مميز</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {vehicle.make} {vehicle.model} {vehicle.year}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getCategoryLabel(vehicle.category)} • {getFuelTypeLabel(vehicle.fuelType)} • {vehicle.color || 'غير محدد'}
                        </p>
                        <p className="text-xs text-gray-500">
                          الرقم: {vehicle.stockNumber} {vehicle.vin && `• VIN: ${vehicle.vin}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{formatPrice(vehicle.pricing?.totalPrice || vehicle.price)}</p>
                        {typeof vehicle.stockQuantity === 'number' && (
                          <Badge
                            variant="outline"
                            className="mt-1 flex items-center justify-center gap-1 rounded-full border-emerald-200 bg-emerald-50 px-2 text-emerald-700"
                          >
                            <Package className="h-3 w-3" />
                            <span>المخزون: {vehicle.stockQuantity.toLocaleString('ar-EG')}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      {vehicle._count?.testDriveBookings > 0 && (
                        <Badge variant="outline" className="rounded-full border-blue-100 bg-blue-50 text-blue-700">
                          {vehicle._count.testDriveBookings} قيادة تجريبية
                        </Badge>
                      )}
                      {vehicle._count?.serviceBookings > 0 && (
                        <Badge variant="outline" className="rounded-full border-cyan-100 bg-cyan-50 text-cyan-700">
                          {vehicle._count.serviceBookings} حجز صيانة
                        </Badge>
                      )}
                      {vehicle.mileage && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">{vehicle.mileage.toLocaleString('ar-EG')} كم</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-50 px-3 py-1">{getStatusLabel(vehicle.status)}</span>
                        <span className="rounded-full bg-slate-50 px-3 py-1">{getCategoryLabel(vehicle.category)}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 rounded-full hover:bg-blue-50" aria-label="خيارات المركبة">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
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
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
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

      {/* Create Vehicle Dialog */}
      {/* Create Vehicle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
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
            <div className="space-y-4 border-t pt-4">
              {renderImageManager('create')}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleCreateDialogChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateVehicle}>
              إنشاء مركبة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
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
            <div className="space-y-4 border-t pt-4">
              {renderImageManager('edit')}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleEditDialogChange(false)}>
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