'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Car,
  Edit,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'

interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  activeSuppliers: number
  monthlyGrowth: {
    items: number
    value: number
  }
}

interface InventoryListItem {
  id: string
  partNumber: string
  name: string
  description?: string
  category: string
  quantity: number
  minStockLevel: number
  maxStockLevel?: number
  unitPrice: number
  supplier: string
  location: string
  warehouse: string
  status: string
  statusOverride: boolean
  lastRestockDate?: string
  nextRestockDate?: string | null
  leadTime?: number
  notes?: string
}

interface WarehouseSummary {
  id: string
  name: string
  location: string
  capacity: number
  currentItems: number
  isActive: boolean
}

interface StockMovement {
  id: string
  item: {
    name: string
    sku?: string
  }
  type: 'IN' | 'OUT'
  quantity: number
  reference?: string
  reason: string
  createdAt: string
  createdBy: {
    name: string
  }
}

interface SupplierOption {
  id: string
  name: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'IN_STOCK', label: 'متوفر' },
  { value: 'LOW_STOCK', label: 'مخزون منخفض' },
  { value: 'OUT_OF_STOCK', label: 'غير متوفر' },
  { value: 'DISCONTINUED', label: 'متوقف' }
]

const computeInventoryStatus = (quantity: number, minStockLevel: number) => {
  if (quantity <= 0) {
    return 'OUT_OF_STOCK'
  }

  if (quantity <= Math.max(minStockLevel, 0)) {
    return 'LOW_STOCK'
  }

  return 'IN_STOCK'
}

const DEFAULT_FORM: InventoryListItem = {
  id: '',
  partNumber: '',
  name: '',
  description: '',
  category: '',
  quantity: 0,
  minStockLevel: 0,
  maxStockLevel: undefined,
  unitPrice: 0,
  supplier: '',
  location: '',
  warehouse: '',
  status: 'IN_STOCK',
  statusOverride: false,
  lastRestockDate: '',
  nextRestockDate: '',
  leadTime: 7,
  notes: ''
}

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([])
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryListItem[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])

  const [items, setItems] = useState<InventoryListItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formState, setFormState] = useState(DEFAULT_FORM)
  const [statusManuallySet, setStatusManuallySet] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryListItem | null>(null)
  const [saving, setSaving] = useState(false)

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }, [])

  const formatDate = useCallback((date?: string | Date | null) => {
    if (!date) return 'غير متوفر'
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const loadInventoryStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [statsResponse, lowStockResponse, warehousesResponse, movementsResponse, suppliersResponse] = await Promise.all([
        fetch('/api/inventory/items?stats=true'),
        fetch('/api/inventory/items?lowStock=true&limit=20'),
        fetch('/api/inventory/warehouses'),
        fetch('/api/inventory/movements?limit=10'),
        fetch('/api/inventory/suppliers')
      ])

      if (!statsResponse.ok) {
        const data = await statsResponse.json().catch(() => ({}))
        throw new Error(data.error || 'فشل في تحميل مؤشرات المخزون')
      }

      setStats(await statsResponse.json())

      if (lowStockResponse.ok) {
        const lowStockData = await lowStockResponse.json()
        const normalizedLowStock: InventoryListItem[] = Array.isArray(lowStockData.items)
          ? lowStockData.items.map((item: InventoryListItem) => ({
              ...item,
              statusOverride: Boolean(item.statusOverride)
            }))
          : []
        setLowStockItems(normalizedLowStock)
      } else {
        setLowStockItems([])
      }

      if (warehousesResponse.ok) {
        const warehouseData = await warehousesResponse.json()
        setWarehouses(Array.isArray(warehouseData.warehouses) ? warehouseData.warehouses : [])
      } else {
        setWarehouses([])
      }

      if (movementsResponse.ok) {
        const movementsData = await movementsResponse.json()
        setRecentMovements(Array.isArray(movementsData.movements) ? movementsData.movements : [])
      } else {
        setRecentMovements([])
      }

      if (suppliersResponse.ok) {
        const supplierData = await suppliersResponse.json()
        setSuppliers(Array.isArray(supplierData) ? supplierData : [])
      } else {
        setSuppliers([])
      }
    } catch (err) {
      console.error('Error loading inventory stats:', err)
      setError('فشل في تحميل بيانات المخزون')
      setStats(null)
      setLowStockItems([])
      setWarehouses([])
      setRecentMovements([])
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadInventoryItems = useCallback(async () => {
    setItemsLoading(true)
    setItemsError(null)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })

      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (warehouseFilter !== 'all') params.set('warehouse', warehouseFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const response = await fetch(`/api/inventory/items?${params.toString()}`)
      if (!response.ok) {
        throw new Error('فشل في تحميل قائمة الأصناف')
      }

      const data = await response.json()
      const normalizedItems: InventoryListItem[] = Array.isArray(data.items)
        ? data.items.map((item: InventoryListItem) => ({
            ...item,
            statusOverride: Boolean(item.statusOverride)
          }))
        : []
      setItems(normalizedItems)
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error loading inventory items:', err)
      setItems([])
      setItemsError(err instanceof Error ? err.message : 'تعذر تحميل الأصناف')
    } finally {
      setItemsLoading(false)
    }
  }, [categoryFilter, currentPage, search, statusFilter, warehouseFilter])

  useEffect(() => {
    loadInventoryStats()
  }, [loadInventoryStats])

  useEffect(() => {
    loadInventoryItems()
  }, [loadInventoryItems])

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    items.forEach(item => {
      if (item.category) {
        categories.add(item.category)
      }
    })
    lowStockItems.forEach(item => {
      if (item.category) {
        categories.add(item.category)
      }
    })
    return Array.from(categories)
  }, [items, lowStockItems])

  const getStatusBadge = (status: string, quantity: number, minStock: number) => {
    if (status === 'OUT_OF_STOCK' || quantity <= 0) {
      return <Badge variant="destructive">نفد المخزون</Badge>
    }
    if (status === 'LOW_STOCK' || quantity <= minStock) {
      return <Badge variant="outline">مخزون منخفض</Badge>
    }
    if (status === 'DISCONTINUED') {
      return <Badge variant="secondary">متوقف</Badge>
    }
    return <Badge variant="default">متوفر</Badge>
  }

  const getGrowthIcon = (growth?: number) => {
    if (growth === undefined || growth === 0) return null
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return null
  }

  const getGrowthColor = (growth?: number) => {
    if (!growth) return 'text-muted-foreground'
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  const getWarehouseCapacityColor = (capacity: number, current: number) => {
    const percentage = capacity > 0 ? (current / capacity) * 100 : 0
    if (percentage > 80) return 'bg-red-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setEditingItem(null)
    setStatusManuallySet(false)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: InventoryListItem) => {
    const autoStatus = computeInventoryStatus(Number(item.quantity) || 0, Number(item.minStockLevel) || 0)
    const manualOverride = item.statusOverride && item.status === 'DISCONTINUED'
    setStatusManuallySet(manualOverride)
    setEditingItem(item)
    setFormState({
      ...item,
      status: manualOverride ? item.status : autoStatus,
      statusOverride: manualOverride,
      nextRestockDate: item.nextRestockDate ? item.nextRestockDate.substring(0, 10) : '',
      lastRestockDate: item.lastRestockDate ? item.lastRestockDate.substring(0, 10) : ''
    })
    setIsDialogOpen(true)
  }

  useEffect(() => {
    if (statusManuallySet) {
      return
    }

    setFormState(prev => {
      const autoStatus = computeInventoryStatus(Number(prev.quantity) || 0, Number(prev.minStockLevel) || 0)

      if (prev.status === autoStatus && !prev.statusOverride) {
        return prev
      }

      return { ...prev, status: autoStatus, statusOverride: false }
    })
  }, [formState.quantity, formState.minStockLevel, statusManuallySet])

  const handleDelete = async (item: InventoryListItem) => {
    if (!confirm(`هل أنت متأكد من حذف الصنف ${item.name}؟`)) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/items/${item.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'تعذر حذف الصنف')
      }

      toast.success('تم حذف الصنف بنجاح')
      loadInventoryItems()
      loadInventoryStats()
    } catch (err) {
      console.error('Error deleting inventory item:', err)
      toast.error(err instanceof Error ? err.message : 'فشل في حذف الصنف')
    }
  }

  const handleSave = async () => {
    if (!formState.partNumber.trim() || !formState.name.trim()) {
      toast.error('رقم الصنف والاسم مطلوبان')
      return
    }

    if (!formState.category.trim()) {
      toast.error('يرجى تحديد فئة الصنف')
      return
    }

    if (!formState.supplier.trim()) {
      toast.error('اسم المورد مطلوب')
      return
    }

    if (!formState.warehouse.trim()) {
      toast.error('يجب تحديد المستودع')
      return
    }

    setSaving(true)

    const payload = {
      partNumber: formState.partNumber.trim(),
      name: formState.name.trim(),
      description: formState.description?.trim() || '',
      category: formState.category.trim(),
      quantity: Number(formState.quantity) || 0,
      minStockLevel: Number(formState.minStockLevel) || 0,
      maxStockLevel:
        formState.maxStockLevel !== undefined && formState.maxStockLevel !== null && formState.maxStockLevel !== ''
          ? Number(formState.maxStockLevel)
          : null,
      unitPrice: Number(formState.unitPrice) || 0,
      supplier: formState.supplier.trim(),
      location: formState.location?.trim() || '',
      warehouse: formState.warehouse.trim(),
      status: statusManuallySet ? formState.status : undefined,
      statusOverride: statusManuallySet,
      leadTime: Number(formState.leadTime) || 0,
      notes: formState.notes?.trim() || '',
      nextRestockDate: formState.nextRestockDate ? new Date(formState.nextRestockDate).toISOString() : null,
      lastRestockDate: formState.lastRestockDate ? new Date(formState.lastRestockDate).toISOString() : undefined
    }

    try {
      const response = await fetch(editingItem ? `/api/inventory/items/${editingItem.id}` : '/api/inventory/items', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في حفظ الصنف')
      }

      toast.success(editingItem ? 'تم تحديث بيانات الصنف بنجاح' : 'تم إضافة صنف جديد بنجاح')
      setIsDialogOpen(false)
      resetForm()
      loadInventoryItems()
      loadInventoryStats()
    } catch (err) {
      console.error('Error saving inventory item:', err)
      toast.error(err instanceof Error ? err.message : 'فشل في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const syncVehiclesToInventory = async () => {
    setSyncing(true)
    try {
      const statsResponse = await fetch('/api/inventory/sync-stats')
      const statsData = statsResponse.ok ? await statsResponse.json() : null

      if (statsData && statsData.vehiclesToSync === 0) {
        toast.info('لا توجد سيارات جديدة للمزامنة')
        setSyncing(false)
        return
      }

      const response = await fetch('/api/inventory/sync-vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'خطأ غير معروف أثناء المزامنة')
      }

      const result = await response.json()
      toast.success(result.message || 'تمت المزامنة بنجاح')
      loadInventoryItems()
      loadInventoryStats()
    } catch (err) {
      console.error('Error syncing vehicles:', err)
      toast.error(err instanceof Error ? err.message : 'فشل في مزامنة السيارات')
    } finally {
      setSyncing(false)
    }
  }

  const renderLoadingState = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المخزون</h1>
        <Button variant="outline" disabled>
          <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
          جاري التحميل...
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted"></div>
              <div className="h-3 w-24 animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المخزون</h1>
        <Button variant="outline" onClick={loadInventoryStats}>
          <RefreshCw className="ml-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-red-700">
          {error}
        </CardContent>
      </Card>
    </div>
  )

  const renderEmptyState = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المخزون</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/parts">
            <Button variant="outline">
              <Boxes className="ml-2 h-4 w-4" />
              إدارة قطع الغيار
            </Button>
          </Link>
          <Link href="/admin/vehicles">
            <Button variant="outline">
              <Car className="ml-2 h-4 w-4" />
              إدارة السيارات
            </Button>
          </Link>
          <Button variant="outline" onClick={syncVehiclesToInventory} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                جاري المزامنة...
              </>
            ) : (
              <>
                <Car className="ml-2 h-4 w-4" />
                مزامنة السيارات
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const initResponse = await fetch('/api/inventory/initialize', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })

                if (!initResponse.ok) {
                  const data = await initResponse.json()
                  throw new Error(data.error || 'خطأ في تهيئة المستودعات')
                }

                const seedResponse = await fetch('/api/inventory/seed-items', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                })

                if (!seedResponse.ok) {
                  const data = await seedResponse.json()
                  throw new Error(data.error || 'خطأ في تهيئة الأصناف')
                }

                toast.success('تم تهيئة بيانات المخزون بنجاح')
                loadInventoryStats()
                loadInventoryItems()
              } catch (err) {
                console.error('Error initialising inventory data:', err)
                toast.error(err instanceof Error ? err.message : 'فشل في تهيئة البيانات')
              }
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            تهيئة البيانات
          </Button>
        </div>
      </div>
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-8 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-blue-500" />
          <h2 className="mb-2 text-2xl font-semibold text-blue-900">مرحبا بك في نظام إدارة المخزون</h2>
          <p className="mx-auto mb-6 max-w-md text-blue-700">
            لا توجد بيانات مخزون حاليا. يمكنك البدء بمزامنة السيارات أو إضافة أصناف جديدة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={openCreateDialog}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة صنف جديد
            </Button>
            <Button variant="outline" onClick={syncVehiclesToInventory} disabled={syncing}>
              {syncing ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري المزامنة...
                </>
              ) : (
                <>
                  <Car className="ml-2 h-4 w-4" />
                  مزامنة السيارات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInventoryTable = () => (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>قائمة الأصناف</CardTitle>
          <CardDescription>عرض وإدارة جميع أصناف المخزون</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadInventoryItems} disabled={itemsLoading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${itemsLoading ? 'animate-spin' : ''}`} />
            تحديث القائمة
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة صنف
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث باسم أو رقم الصنف"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setCurrentPage(1)
                    setSearch(searchInput.trim())
                  }
                }}
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="حالة المخزون" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={warehouseFilter}
            onValueChange={(value) => {
              setWarehouseFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="المستودع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستودعات</SelectItem>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.id} value={warehouse.name}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categoryOptions.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setSearchInput('')
              setStatusFilter('all')
              setWarehouseFilter('all')
              setCategoryFilter('all')
              setCurrentPage(1)
            }}
          >
            إعادة تعيين
          </Button>
          <Button
            onClick={() => {
              setCurrentPage(1)
              setSearch(searchInput.trim())
            }}
          >
            تطبيق المرشحات
          </Button>
        </div>

        {itemsLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <RefreshCw className="ml-2 h-5 w-5 animate-spin" />
            جاري تحميل الأصناف...
          </div>
        ) : itemsError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-red-700">
            {itemsError}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            لا توجد أصناف مطابقة للمرشحات الحالية.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <Badge variant="secondary">رقم: {item.partNumber}</Badge>
                    {getStatusBadge(item.status, item.quantity, item.minStockLevel)}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description || 'لا يوجد وصف متاح'}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>الفئة: {item.category || 'غير محدد'}</span>
                    <span>المورد: {item.supplier || 'غير محدد'}</span>
                    <span>المستودع: {item.warehouse || 'غير محدد'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>الكمية: {item.quantity}</span>
                    <span>حد إعادة الطلب: {item.minStockLevel}</span>
                    <span>السعر: {formatCurrency(item.unitPrice)}</span>
                    <span>تاريخ التوريد الأخير: {formatDate(item.lastRestockDate)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                    <Edit className="ml-1 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>
                    <Trash2 className="ml-1 h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <AdminRoute>
      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : !stats || stats.totalItems === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">إدارة المخزون</h1>
              <p className="mt-1 text-muted-foreground">
                متابعة مستويات المخزون وربطها مع المخزون الفعلي للسيارات وقطع الغيار
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/parts">
                <Button variant="outline">
                  <Boxes className="ml-2 h-4 w-4" />
                  قطع الغيار
                </Button>
              </Link>
              <Link href="/admin/vehicles">
                <Button variant="outline">
                  <Car className="ml-2 h-4 w-4" />
                  إدارة السيارات
                </Button>
              </Link>
              <Link href="/admin/inventory/purchase-orders">
                <Button variant="outline">
                  <Truck className="ml-2 h-4 w-4" />
                  طلبات الشراء
                </Button>
              </Link>
              <Button variant="outline" onClick={syncVehiclesToInventory} disabled={syncing}>
                {syncing ? (
                  <>
                    <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                    جاري المزامنة...
                  </>
                ) : (
                  <>
                    <Car className="ml-2 h-4 w-4" />
                    مزامنة السيارات
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const initResponse = await fetch('/api/inventory/initialize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })

                    if (!initResponse.ok) {
                      const data = await initResponse.json()
                      throw new Error(data.error || 'خطأ في تهيئة المستودعات')
                    }

                    const seedResponse = await fetch('/api/inventory/seed-items', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })

                    if (!seedResponse.ok) {
                      const data = await seedResponse.json()
                      throw new Error(data.error || 'خطأ في تهيئة الأصناف')
                    }

                    toast.success('تم تهيئة بيانات المخزون بنجاح')
                    loadInventoryStats()
                    loadInventoryItems()
                  } catch (err) {
                    console.error('Error initialising inventory data:', err)
                    toast.error(err instanceof Error ? err.message : 'فشل في تهيئة البيانات')
                  }
                }}
              >
                <Plus className="ml-2 h-4 w-4" />
                تهيئة البيانات
              </Button>
              <Button variant="outline" onClick={() => {
                loadInventoryStats()
                loadInventoryItems()
              }}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث شامل
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className={`text-xs ${getGrowthColor(stats.monthlyGrowth?.items)}`}>
                  <span className="inline-flex items-center gap-1">
                    {getGrowthIcon(stats.monthlyGrowth?.items)}
                    {Math.abs(stats.monthlyGrowth?.items || 0)}%
                  </span>{' '}
                  من الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <p className={`text-xs ${getGrowthColor(stats.monthlyGrowth?.value)}`}>
                  <span className="inline-flex items-center gap-1">
                    {getGrowthIcon(stats.monthlyGrowth?.value)}
                    {Math.abs(stats.monthlyGrowth?.value || 0)}%
                  </span>{' '}
                  من الشهر الماضي
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تنبيهات المخزون</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">أصناف بحاجة للمتابعة</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الموردون النشطون</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
                <p className="text-xs text-muted-foreground">مورد يقدم أصنافاً حالياً</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>أصناف بحاجة للمتابعة</CardTitle>
                  <CardDescription>أصناف انخفض مخزونها عن الحد الأدنى</CardDescription>
                </div>
                <Badge variant="secondary">{lowStockItems.length}</Badge>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">لا توجد أصناف بحاجة للطلب حاليا</p>
                ) : (
                  <div className="space-y-4">
                    {lowStockItems.slice(0, 6).map(item => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            المخزون: {item.quantity} / الحد الأدنى: {item.minStockLevel}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(item.status, item.quantity, item.minStockLevel)}
                          <span className="text-sm font-medium">{formatCurrency(item.unitPrice * (item.quantity || 0))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>المستودعات</CardTitle>
                  <CardDescription>حالة التخزين الحالية</CardDescription>
                </div>
                <Link href="/admin/inventory/warehouses">
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    إدارة
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {warehouses.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">لا توجد مستودعات مسجلة</p>
                ) : (
                  <div className="space-y-4">
                    {warehouses.slice(0, 5).map(warehouse => {
                      const percentage = warehouse.capacity > 0 ? (warehouse.currentItems / warehouse.capacity) * 100 : 0
                      return (
                        <div key={warehouse.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{warehouse.name}</span>
                            <span>{Math.round(percentage)}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full ${getWarehouseCapacityColor(warehouse.capacity, warehouse.currentItems)}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {warehouse.location} • {warehouse.currentItems} صنف مخزن
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>أحدث الحركات</CardTitle>
                <CardDescription>آخر تحديثات المخزون المسجلة</CardDescription>
              </div>
              <Link href="/admin/inventory/movements">
                <Button variant="outline" size="sm">
                  <Eye className="ml-2 h-4 w-4" />
                  عرض الكل
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentMovements.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">لا توجد حركات مسجلة</p>
              ) : (
                <div className="space-y-4">
                  {recentMovements.map(movement => (
                    <div key={movement.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{movement.item?.name}</p>
                        <p className="text-sm text-muted-foreground">{movement.reason}</p>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <Badge variant={movement.type === 'IN' ? 'default' : 'secondary'}>
                            {movement.type === 'IN' ? 'وارد' : 'صادر'}
                          </Badge>
                          <span className="text-sm font-semibold">{movement.quantity} قطعة</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(movement.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {renderInventoryTable()}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات المخزون بما في ذلك الكميات وحدود إعادة الطلب والمستودع المرتبط.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="partNumber">رقم الصنف *</Label>
                <Input
                  id="partNumber"
                  value={formState.partNumber}
                  onChange={(event) => setFormState(prev => ({ ...prev, partNumber: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="itemName">اسم الصنف *</Label>
                <Input
                  id="itemName"
                  value={formState.name}
                  onChange={(event) => setFormState(prev => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">الفئة *</Label>
                <Input
                  id="category"
                  value={formState.category}
                  onChange={(event) => setFormState(prev => ({ ...prev, category: event.target.value }))}
                  placeholder="مثال: محرك، كهرباء..."
                />
              </div>
              <div>
                <Label htmlFor="supplier">المورد *</Label>
                <Input
                  id="supplier"
                  list="supplier-options"
                  value={formState.supplier}
                  onChange={(event) => setFormState(prev => ({ ...prev, supplier: event.target.value }))}
                />
                <datalist id="supplier-options">
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                rows={3}
                value={formState.description || ''}
                onChange={(event) => setFormState(prev => ({ ...prev, description: event.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="quantity">الكمية الحالية *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formState.quantity}
                  onChange={(event) => setFormState(prev => ({ ...prev, quantity: Number(event.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="minStock">حد إعادة الطلب *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formState.minStockLevel}
                  onChange={(event) => setFormState(prev => ({ ...prev, minStockLevel: Number(event.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="maxStock">الحد الأعلى</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formState.maxStockLevel ?? ''}
                  onChange={(event) =>
                    setFormState(prev => ({
                      ...prev,
                      maxStockLevel: event.target.value ? Number(event.target.value) : undefined
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="unitPrice">سعر الوحدة *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={formState.unitPrice}
                  onChange={(event) => setFormState(prev => ({ ...prev, unitPrice: Number(event.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="warehouse">المستودع *</Label>
                <Select
                  value={formState.warehouse}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, warehouse: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستودع" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.name}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">مكان التخزين</Label>
                <Input
                  id="location"
                  value={formState.location || ''}
                  onChange={(event) => setFormState(prev => ({ ...prev, location: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="status">حالة المخزون</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => {
                    setStatusManuallySet(true)
                    setFormState(prev => ({ ...prev, status: value, statusOverride: true }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter(option => option.value !== 'all').map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leadTime">مدة التوريد (أيام)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formState.leadTime ?? 0}
                  onChange={(event) => setFormState(prev => ({ ...prev, leadTime: Number(event.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="nextRestock">موعد التوريد القادم</Label>
                <Input
                  id="nextRestock"
                  type="date"
                  value={formState.nextRestockDate || ''}
                  onChange={(event) => setFormState(prev => ({ ...prev, nextRestockDate: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="lastRestock">آخر توريد</Label>
                <Input
                  id="lastRestock"
                  type="date"
                  value={formState.lastRestockDate || ''}
                  onChange={(event) => setFormState(prev => ({ ...prev, lastRestockDate: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={formState.notes || ''}
                  onChange={(event) => setFormState(prev => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false)
              resetForm()
            }} disabled={saving}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'جاري الحفظ...' : editingItem ? 'تحديث الصنف' : 'إضافة الصنف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminRoute>
  )
}

