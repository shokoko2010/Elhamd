'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
  RefreshCw,
  Plus,
  Package,
  Pencil,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address?: string
  rating: number
  status: string
  leadTime: number
  minOrderAmount: number
}

interface SupplierFormState {
  name: string
  contact: string
  email: string
  phone: string
  address: string
  rating: number
  leadTime: number
  minOrderAmount: number
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formState, setFormState] = useState<SupplierFormState>({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    rating: 3,
    leadTime: 7,
    minOrderAmount: 0
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/inventory/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(Array.isArray(data) ? data : [])
      } else {
        setError('فشل في تحميل الموردين')
        setSuppliers([])
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setError('فشل في تحميل الموردين')
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormState({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      rating: 3,
      leadTime: 7,
      minOrderAmount: 0
    })
    setEditingSupplier(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormState({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || '',
      rating: supplier.rating || 0,
      leadTime: supplier.leadTime || 0,
      minOrderAmount: supplier.minOrderAmount || 0
    })
    setIsFormOpen(true)
  }

  const handleFormChange = <K extends keyof SupplierFormState>(key: K, value: SupplierFormState[K]) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        ...formState,
        rating: Number(formState.rating) || 0,
        leadTime: Number(formState.leadTime) || 0,
        minOrderAmount: Number(formState.minOrderAmount) || 0
      }

      const response = await fetch(
        editingSupplier ? `/api/inventory/suppliers/${editingSupplier.id}` : '/api/inventory/suppliers',
        {
          method: editingSupplier ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const message = editingSupplier ? 'فشل في تحديث بيانات المورد' : 'فشل في إضافة المورد'
        toast.error(message)
        return
      }

      toast.success(editingSupplier ? 'تم تحديث المورد بنجاح' : 'تم إضافة المورد بنجاح')
      setIsFormOpen(false)
      resetForm()
      await loadSuppliers()
    } catch (submitError) {
      console.error('Error saving supplier:', submitError)
      toast.error('حدث خطأ أثناء حفظ بيانات المورد')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const response = await fetch(`/api/inventory/suppliers/${deleteTarget.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        toast.error('فشل في حذف المورد')
        return
      }

      toast.success('تم حذف المورد بنجاح')
      setDeleteTarget(null)
      await loadSuppliers()
    } catch (deleteError) {
      console.error('Error deleting supplier:', deleteError)
      toast.error('حدث خطأ أثناء حذف المورد')
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الموردون</h1>
          <Button variant="outline" disabled>
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            جاري التحميل...
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الموردون</h1>
          <Button variant="outline" onClick={loadSuppliers}>
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
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">الموردون</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadSuppliers}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مورد
            </Button>
            <Link href="/admin/inventory">
              <Button variant="outline">
                <Package className="ml-2 h-4 w-4" />
                الذهاب إلى المخزون
              </Button>
            </Link>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Truck className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                لا يوجد موردون
              </h2>
              <p className="text-blue-700 mb-6">
                لا توجد موردون في النظام حالياً. يمكن إضافة موردين من خلال قسم المخزون.
              </p>
              <Link href="/admin/inventory">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Package className="ml-2 h-4 w-4" />
                  الذهاب إلى المخزون
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {supplier.contact}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(supplier)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeleteTarget(supplier)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      {getRatingStars(supplier.rating)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {supplier.leadTime} يوم
                    </div>
                  </div>
                  {supplier.minOrderAmount > 0 && (
                    <div className="text-sm text-gray-600">
                      الحد الأدنى للطلب: {supplier.minOrderAmount.toLocaleString()} ريال
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم المورد</Label>
                <Input
                  id="name"
                  required
                  value={formState.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">اسم جهة الاتصال</Label>
                <Input
                  id="contact"
                  required
                  value={formState.contact}
                  onChange={(event) => handleFormChange('contact', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) => handleFormChange('email', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  required
                  value={formState.phone}
                  onChange={(event) => handleFormChange('phone', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={formState.address}
                  onChange={(event) => handleFormChange('address', event.target.value)}
                  placeholder="العنوان التفصيلي للمورد"
                />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="rating">التقييم</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={0}
                    max={5}
                    step={0.5}
                    value={formState.rating}
                    onChange={(event) => handleFormChange('rating', Number(event.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="leadTime">مدة التوريد (أيام)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    min={0}
                    value={formState.leadTime}
                    onChange={(event) => handleFormChange('leadTime', Number(event.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minOrderAmount">الحد الأدنى للطلب</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    min={0}
                    value={formState.minOrderAmount}
                    onChange={(event) => handleFormChange('minOrderAmount', Number(event.target.value))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المورد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المورد {deleteTarget?.name} وجميع البيانات المتعلقة به. لا يمكن التراجع عن هذه العملية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              حذف المورد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminRoute>
  )
}