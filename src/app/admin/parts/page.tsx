'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Save,
  Boxes,
  Warehouse,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface MaintenancePart {
  id: string
  partNumber: string
  name: string
  category: string
  description?: string
  cost: number
  price: number
  quantity: number
  minStock: number
  maxStock?: number
  location?: string
  supplier?: string
  status: string
  barcode?: string
  imageUrl?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

const PART_STATUS_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'AVAILABLE', label: 'متاح' },
  { value: 'LOW_STOCK', label: 'مخزون منخفض' },
  { value: 'OUT_OF_STOCK', label: 'غير متوفر' },
  { value: 'ORDERED', label: 'تم الطلب' },
  { value: 'RESERVED', label: 'محجوز' }
]

const PART_CATEGORY_OPTIONS = [
  { value: 'all', label: 'كل الفئات' },
  { value: 'ENGINE', label: 'المحرك' },
  { value: 'TRANSMISSION', label: 'نظام النقل' },
  { value: 'BRAKE', label: 'الفرامل' },
  { value: 'SUSPENSION', label: 'التعليق' },
  { value: 'ELECTRICAL', label: 'الكهرباء' },
  { value: 'BODY', label: 'الهيكل' },
  { value: 'INTERIOR', label: 'الداخلية' },
  { value: 'EXTERIOR', label: 'الخارجية' },
  { value: 'TIRE', label: 'الإطارات' },
  { value: 'BATTERY', label: 'البطاريات' },
  { value: 'OIL', label: 'الزيوت' },
  { value: 'FILTER', label: 'الفلاتر' },
  { value: 'OTHER', label: 'أخرى' }
]

const DEFAULT_FORM: Partial<MaintenancePart> = {
  partNumber: '',
  name: '',
  category: 'ENGINE',
  description: '',
  cost: 0,
  price: 0,
  quantity: 0,
  minStock: 0,
  maxStock: undefined,
  location: '',
  supplier: '',
  status: 'AVAILABLE',
  barcode: '',
  imageUrl: ''
}

export default function PartsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parts, setParts] = useState<MaintenancePart[]>([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<Partial<MaintenancePart>>(DEFAULT_FORM)
  const [editingPart, setEditingPart] = useState<MaintenancePart | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (search.trim()) params.set('search', search.trim())
      if (status !== 'all') params.set('status', status)
      if (category !== 'all') params.set('category', category)

      const response = await fetch(`/api/maintenance/parts?${params.toString()}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في جلب قطع الغيار')
      }

      const data = await response.json()
      setParts(Array.isArray(data.parts) ? data.parts : [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error loading parts:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [category, currentPage, search, status])

  useEffect(() => {
    fetchParts()
  }, [fetchParts])

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setEditingPart(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (part: MaintenancePart) => {
    setEditingPart(part)
    setForm({
      ...part,
      maxStock: part.maxStock ?? undefined
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (part: MaintenancePart) => {
    if (!confirm(`هل أنت متأكد من حذف القطعة ${part.name}؟`)) return

    try {
      const response = await fetch(`/api/maintenance/parts/${part.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في حذف القطعة')
      }

      toast.success('تم حذف القطعة بنجاح')
      fetchParts()
    } catch (err) {
      console.error('Error deleting part:', err)
      toast.error(err instanceof Error ? err.message : 'فشل في حذف القطعة')
    }
  }

  const handleSave = async () => {
    if (!form.partNumber?.trim() || !form.name?.trim()) {
      toast.error('رقم القطعة واسمها مطلوبان')
      return
    }

    if (!form.category) {
      toast.error('الرجاء اختيار الفئة')
      return
    }

    setSaving(true)
    try {
      const payload = {
        partNumber: form.partNumber.trim(),
        name: form.name.trim(),
        category: form.category,
        description: form.description?.trim() || '',
        cost: Number(form.cost) || 0,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 0,
        minStock: Number(form.minStock) || 0,
        maxStock: form.maxStock !== undefined && form.maxStock !== null ? Number(form.maxStock) : null,
        location: form.location?.trim() || '',
        supplier: form.supplier?.trim() || '',
        status: form.status || 'AVAILABLE',
        barcode: form.barcode?.trim() || '',
        imageUrl: form.imageUrl?.trim() || ''
      }

      const response = await fetch(
        editingPart ? `/api/maintenance/parts/${editingPart.id}` : '/api/maintenance/parts',
        {
          method: editingPart ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في حفظ القطعة')
      }

      toast.success(editingPart ? 'تم تحديث القطعة بنجاح' : 'تم إضافة قطعة جديدة بنجاح')
      setIsDialogOpen(false)
      resetForm()
      fetchParts()
    } catch (err) {
      console.error('Error saving part:', err)
      toast.error(err instanceof Error ? err.message : 'فشل في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const lowStockParts = useMemo(
    () => parts.filter((part) => part.quantity <= part.minStock),
    [parts]
  )

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة قطع الغيار</h1>
            <p className="text-gray-600 mt-2">تحكم كامل في مخزون قطع الغيار والحدود الدنيا للمخزون</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchParts} disabled={loading}>
              <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة قطعة جديدة
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded border p-4">
                <Boxes className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي القطع</p>
                  <p className="text-xl font-semibold">{parts.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded border p-4">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                  <p className="text-xl font-semibold">{lowStockParts.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded border p-4">
                <Warehouse className="h-10 w-10 text-emerald-500" />
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الكمية</p>
                  <p className="text-xl font-semibold">{parts.reduce((sum, part) => sum + (part.quantity || 0), 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded border p-4">
                <DollarSign className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">قيمة المخزون (تكلفة)</p>
                  <p className="text-xl font-semibold">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(
                      parts.reduce((sum, part) => sum + part.cost * part.quantity, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>البحث والتصفية</CardTitle>
            <CardDescription>ابحث عن القطع حسب الاسم أو رقم القطعة واستخدم المرشحات المتقدمة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث عن طريق الاسم أو رقم القطعة"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1)
                      setSearch(searchInput.trim())
                    }
                  }}
                />
              </div>
              <Select value={status} onValueChange={(value) => { setStatus(value); setCurrentPage(1) }}>
                <SelectTrigger>
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                  {PART_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={(value) => { setCategory(value); setCurrentPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {PART_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setStatus('all')
                  setCategory('all')
                  setCurrentPage(1)
                }}
              >
                إعادة تعيين المرشحات
              </Button>
              <Button onClick={() => { setCurrentPage(1); setSearch(searchInput.trim()) }}>تطبيق</Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
              جاري تحميل البيانات...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center text-red-700">
              <AlertTriangle className="mx-auto mb-4 h-8 w-8" />
              {error}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>قائمة قطع الغيار</CardTitle>
              <CardDescription>عرض مفصل لكل قطع الغيار مع الكميات وحدود المخزون</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parts.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  لا توجد قطع غيار مطابقة للبحث الحالي.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {parts.map((part) => (
                    <Card key={part.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">{part.name}</CardTitle>
                            <CardDescription>رقم القطعة: {part.partNumber}</CardDescription>
                          </div>
                          <Badge variant={part.status === 'AVAILABLE' ? 'default' : part.status === 'LOW_STOCK' ? 'secondary' : 'outline'}>
                            {PART_STATUS_OPTIONS.find((option) => option.value === part.status)?.label || part.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-gray-600">
                        <p>{part.description || 'لا يوجد وصف متاح'}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-muted-foreground">الكمية الحالية</span>
                            <p className="font-medium">{part.quantity}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">الحد الأدنى</span>
                            <p className="font-medium">{part.minStock}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">التكلفة</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(part.cost)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">سعر البيع</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(part.price)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span>الموقع: {part.location || 'غير محدد'}</span>
                          <span>المورد: {part.supplier || 'غير محدد'}</span>
                          <span>الفئة: {PART_CATEGORY_OPTIONS.find((option) => option.value === part.category)?.label || part.category}</span>
                          <span>الباركود: {part.barcode || 'غير متوفر'}</span>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(part)}>
                            <Edit className="ml-1 h-4 w-4" />
                            تعديل
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(part)}>
                            <Trash2 className="ml-1 h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    الصفحة {currentPage} من {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPart ? 'تعديل قطعة غيار' : 'إضافة قطعة غيار جديدة'}</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل قطعة الغيار بما في ذلك الأسعار وكميات المخزون والحدود الدنيا
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="partNumber">رقم القطعة *</Label>
                  <Input
                    id="partNumber"
                    value={form.partNumber || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, partNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="partName">اسم القطعة *</Label>
                  <Input
                    id="partName"
                    value={form.name || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Select
                    value={form.category || 'ENGINE'}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PART_CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">حالة المخزون</Label>
                  <Select
                    value={form.status || 'AVAILABLE'}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PART_STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={form.description || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cost">تكلفة الشراء</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={form.cost ?? 0}
                    onChange={(e) => setForm((prev) => ({ ...prev, cost: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="price">سعر البيع</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price ?? 0}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">الكمية الحالية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={form.quantity ?? 0}
                    onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">حد إعادة الطلب</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={form.minStock ?? 0}
                    onChange={(e) => setForm((prev) => ({ ...prev, minStock: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStock">الحد الأعلى (اختياري)</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={form.maxStock ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxStock: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="location">موقع التخزين</Label>
                  <Input
                    id="location"
                    value={form.location || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">المورد</Label>
                  <Input
                    id="supplier"
                    value={form.supplier || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, supplier: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">الباركود</Label>
                  <Input
                    id="barcode"
                    value={form.barcode || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">رابط الصورة</Label>
                  <Input
                    id="imageUrl"
                    value={form.imageUrl || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="available-switch"
                  checked={(form.status || 'AVAILABLE') !== 'OUT_OF_STOCK'}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked ? 'AVAILABLE' : 'OUT_OF_STOCK' }))}
                />
                <Label htmlFor="available-switch">القطعة متاحة للتسليم</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }} disabled={saving}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'جارٍ الحفظ...' : 'حفظ القطعة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  )
}
