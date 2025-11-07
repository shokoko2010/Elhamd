'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building,
  MapPin,
  Package,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  PhoneCall
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  currentItems: number
  isActive: boolean
  manager?: string | null
  contact?: string | null
  branch?: {
    id: string
    name: string
    code?: string | null
  } | null
}

interface WarehouseFormState {
  name: string
  location: string
  capacity: number
  manager: string
  contact: string
  branchId: string
  isActive: boolean
}

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formState, setFormState] = useState<WarehouseFormState>({
    name: '',
    location: '',
    capacity: 0,
    manager: '',
    contact: '',
    branchId: '',
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null)
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    loadWarehouses()
    loadBranches()
  }, [])

  const loadWarehouses = async () => {
    try {
      const response = await fetch('/api/inventory/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses((data.warehouses || []).map((warehouse: any) => ({
          ...warehouse,
          manager: warehouse.manager,
          contact: warehouse.contact,
          branch: warehouse.branch || null
        })))
      }
    } catch (error) {
      console.error('Error loading warehouses:', error)
      setError('فشل في تحميل المستودعات')
    } finally {
      setLoading(false)
    }
  }

  const loadBranches = async () => {
    try {
      const response = await fetch('/api/branches?limit=200')
      if (!response.ok) return

      const data = await response.json()
      setBranches((data.branches || []).map((branch: any) => ({ id: branch.id, name: branch.name || branch.code || 'فرع' })))
    } catch (branchError) {
      console.warn('Failed to load branches:', branchError)
      setBranches([])
    }
  }

  const getCapacityColor = (capacity: number, current: number) => {
    const percentage = (current / capacity) * 100
    if (percentage > 80) return 'bg-red-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const resetForm = () => {
    setFormState({
      name: '',
      location: '',
      capacity: 0,
      manager: '',
      contact: '',
      branchId: '',
      isActive: true
    })
    setEditingWarehouse(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setFormState({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      manager: warehouse.manager || '',
      contact: warehouse.contact || '',
      branchId: warehouse.branch?.id || '',
      isActive: warehouse.isActive
    })
    setIsFormOpen(true)
  }

  const handleFormChange = <K extends keyof WarehouseFormState>(key: K, value: WarehouseFormState[K]) => {
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
        name: formState.name,
        location: formState.location,
        capacity: Number(formState.capacity) || 0,
        manager: formState.manager || null,
        contact: formState.contact || null,
        branchId: formState.branchId || null,
        status: formState.isActive ? 'active' : 'inactive'
      }

      const response = await fetch(
        editingWarehouse ? `/api/inventory/warehouses/${editingWarehouse.id}` : '/api/inventory/warehouses',
        {
          method: editingWarehouse ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        toast.error(editingWarehouse ? 'فشل في تحديث المستودع' : 'فشل في إنشاء المستودع')
        return
      }

      toast.success(editingWarehouse ? 'تم تحديث المستودع بنجاح' : 'تم إنشاء المستودع بنجاح')
      setIsFormOpen(false)
      resetForm()
      await loadWarehouses()
    } catch (submitError) {
      console.error('Error saving warehouse:', submitError)
      toast.error('حدث خطأ أثناء حفظ بيانات المستودع')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const response = await fetch(`/api/inventory/warehouses/${deleteTarget.id}`, { method: 'DELETE' })
      if (!response.ok) {
        toast.error('فشل في حذف المستودع')
        return
      }

      toast.success('تم حذف المستودع بنجاح')
      setDeleteTarget(null)
      await loadWarehouses()
    } catch (deleteError) {
      console.error('Error deleting warehouse:', deleteError)
      toast.error('حدث خطأ أثناء حذف المستودع')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">المستودعات</h1>
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
          <h1 className="text-3xl font-bold">المستودعات</h1>
          <Button variant="outline" onClick={loadWarehouses}>
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
          <h1 className="text-3xl font-bold">المستودعات</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadWarehouses}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مستودع
            </Button>
          </div>
        </div>

        {warehouses.length === 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Building className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                لا توجد مستودعات حالياً
              </h2>
              <p className="text-blue-700 mb-6">
                يمكن تهيئة المستودعات من خلال قسم المخزون الرئيسي
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
            {warehouses.map((warehouse) => {
              const capacityPercentage = (warehouse.currentItems / warehouse.capacity) * 100
              return (
                <Card key={warehouse.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                        {warehouse.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {warehouse.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{warehouse.currentItems} / {warehouse.capacity}</span>
                      </div>
                      <div className="text-sm font-medium">{Math.round(capacityPercentage)}%</div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${getCapacityColor(warehouse.capacity, warehouse.currentItems)}`}
                        style={{ width: `${capacityPercentage}%` }}
                      />
                    </div>
                    <div className="grid gap-2 text-sm">
                      {warehouse.branch && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>الفرع:</span>
                          <span>{warehouse.branch.name}</span>
                        </div>
                      )}
                      {warehouse.manager && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>المسؤول:</span>
                          <span>{warehouse.manager}</span>
                        </div>
                      )}
                      {warehouse.contact && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <PhoneCall className="h-4 w-4" />
                          <span>{warehouse.contact}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(warehouse)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeleteTarget(warehouse)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'تعديل المستودع' : 'إضافة مستودع جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="warehouse-name">اسم المستودع</Label>
                <Input
                  id="warehouse-name"
                  required
                  value={formState.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="warehouse-location">الموقع</Label>
                <Input
                  id="warehouse-location"
                  required
                  value={formState.location}
                  onChange={(event) => handleFormChange('location', event.target.value)}
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="warehouse-capacity">السعة</Label>
                  <Input
                    id="warehouse-capacity"
                    type="number"
                    min={0}
                    required
                    value={formState.capacity}
                    onChange={(event) => handleFormChange('capacity', Number(event.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="warehouse-branch">الفرع</Label>
                  <Select value={formState.branchId} onValueChange={(value) => handleFormChange('branchId', value)}>
                    <SelectTrigger id="warehouse-branch">
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون فرع</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="warehouse-manager">مسؤول المستودع</Label>
                  <Input
                    id="warehouse-manager"
                    value={formState.manager}
                    onChange={(event) => handleFormChange('manager', event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="warehouse-contact">بيانات التواصل</Label>
                  <Input
                    id="warehouse-contact"
                    value={formState.contact}
                    onChange={(event) => handleFormChange('contact', event.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label className="font-medium">المستودع نشط؟</Label>
                  <p className="text-sm text-muted-foreground">تفعيل أو إيقاف المستودع من الاستخدام</p>
                </div>
                <Switch checked={formState.isActive} onCheckedChange={(checked) => handleFormChange('isActive', checked)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : editingWarehouse ? 'حفظ التعديلات' : 'إضافة المستودع'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستودع؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستودع {deleteTarget?.name}. لا يمكن التراجع عن هذه العملية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              حذف المستودع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminRoute>
  )
}