'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Wrench, Clock, RefreshCw, Plus, Pencil, Power } from 'lucide-react'

interface ServiceType {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  isActive: boolean
}

interface ServiceFormState {
  name: string
  description: string
  duration: string
  price: string
  category: string
  isActive: boolean
}

const categoryOptions: Array<{ value: string; label: string }> = [
  { value: 'MAINTENANCE', label: 'صيانة دورية' },
  { value: 'REPAIR', label: 'إصلاح أعطال' },
  { value: 'INSPECTION', label: 'فحص شامل' },
  { value: 'DETAILING', label: 'تلميع وتفاصيل' },
  { value: 'CUSTOM', label: 'خدمات مخصصة' }
]

const defaultFormState: ServiceFormState = {
  name: '',
  description: '',
  duration: '60',
  price: '0',
  category: categoryOptions[0]?.value ?? 'MAINTENANCE',
  isActive: true
}

export default function ServicePage() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceType | null>(null)
  const [formState, setFormState] = useState<ServiceFormState>(defaultFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/service-types')

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'فشل في تحميل الخدمات' }))
        setError(typeof result.error === 'string' ? result.error : 'فشل في تحميل الخدمات')
        setServices([])
        return
      }

      const data = await response.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (loadError) {
      console.error('Error loading services:', loadError)
      setError('فشل في تحميل الخدمات')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingService(null)
    setFormState(defaultFormState)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (service: ServiceType) => {
    setEditingService(service)
    setFormState({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      isActive: service.isActive
    })
    setIsFormOpen(true)
  }

  const handleFormChange = <K extends keyof ServiceFormState>(field: K, value: ServiceFormState[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const trimmedName = formState.name.trim()
    if (!trimmedName) {
      toast.error('يرجى إدخال اسم الخدمة')
      return
    }

    const parsedDuration = Number(formState.duration)
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      toast.error('مدة الخدمة يجب أن تكون رقمًا أكبر من صفر')
      return
    }

    const parsedPrice = Number(formState.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error('سعر الخدمة يجب أن يكون رقمًا صالحًا')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: trimmedName,
        description: formState.description.trim(),
        duration: parsedDuration,
        price: parsedPrice,
        category: formState.category,
        isActive: formState.isActive
      }

      const endpoint = editingService ? `/api/service-types/${editingService.id}` : '/api/service-types'
      const method = editingService ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json().catch(() => ({} as Record<string, unknown>))

      if (!response.ok) {
        const message = typeof result.error === 'string' ? result.error : 'فشل في حفظ بيانات الخدمة'
        toast.error(message)
        return
      }

      toast.success(editingService ? 'تم تحديث الخدمة بنجاح' : 'تم إضافة الخدمة بنجاح')
      setIsFormOpen(false)
      setEditingService(null)
      setFormState(defaultFormState)
      await loadServices()
    } catch (submitError) {
      console.error('Error saving service:', submitError)
      toast.error('حدث خطأ أثناء حفظ بيانات الخدمة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (service: ServiceType) => {
    try {
      const response = await fetch(`/api/service-types/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !service.isActive })
      })

      const result = await response.json().catch(() => ({} as Record<string, unknown>))

      if (!response.ok) {
        const message = typeof result.error === 'string' ? result.error : 'فشل في تحديث حالة الخدمة'
        toast.error(message)
        return
      }

      setServices(prev =>
        prev.map(item => (item.id === service.id ? { ...item, isActive: !service.isActive } : item))
      )
      toast.success('تم تحديث حالة الخدمة')
    } catch (toggleError) {
      console.error('Error updating service status:', toggleError)
      toast.error('حدث خطأ أثناء تحديث حالة الخدمة')
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)

  const getCategoryLabel = (value: string) =>
    categoryOptions.find(option => option.value === value)?.label || value

  if (loading) {
    return (
      <AdminRoute>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">الخدمات</h1>
            <Button variant="outline" disabled>
              <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              جاري التحميل...
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminRoute>
    )
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">الخدمات</h1>
            <Button variant="outline" onClick={() => void loadServices()}>
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الخدمات</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadServices()}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة خدمة
            </Button>
          </div>
        </div>

        {services.length === 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Wrench className="mx-auto mb-4 h-16 w-16 text-blue-500" />
              <h2 className="mb-2 text-2xl font-semibold text-blue-900">لا توجد خدمات حالياً</h2>
              <p className="mb-6 text-blue-700">يمكن إضافة الخدمات من خلال إعدادات النظام</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة أول خدمة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description || 'لا يوجد وصف لهذه الخدمة'}
                      </CardDescription>
                    </div>
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{service.duration} دقيقة</span>
                      </div>
                      <div className="font-semibold text-blue-600">{formatCurrency(service.price)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{getCategoryLabel(service.category)}</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={service.isActive ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => void handleToggleStatus(service)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingService(null)
            setFormState(defaultFormState)
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="service-name">اسم الخدمة</Label>
                <Input
                  id="service-name"
                  value={formState.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-description">وصف الخدمة</Label>
                <Textarea
                  id="service-description"
                  value={formState.description}
                  onChange={(event) => handleFormChange('description', event.target.value)}
                  placeholder="أدخل تفاصيل الخدمة وما يميزها"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="service-duration">مدة الخدمة (بالدقائق)</Label>
                  <Input
                    id="service-duration"
                    type="number"
                    min={1}
                    value={formState.duration}
                    onChange={(event) => handleFormChange('duration', event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service-price">سعر الخدمة (جنيه مصري)</Label>
                  <Input
                    id="service-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formState.price}
                    onChange={(event) => handleFormChange('price', event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service-category">فئة الخدمة</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => handleFormChange('category', value)}
                >
                  <SelectTrigger id="service-category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="service-status" className="font-medium">
                    حالة الخدمة
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    تحكم في ظهور الخدمة للعملاء ولوحة الحجز
                  </p>
                </div>
                <Switch
                  id="service-status"
                  checked={formState.isActive}
                  onCheckedChange={(checked) => handleFormChange('isActive', checked)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingService(null)
                  setFormState(defaultFormState)
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الحفظ...' : editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminRoute>
  )
}
