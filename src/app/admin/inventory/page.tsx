'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Truck,
  RefreshCw,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Car,
  Sync
} from 'lucide-react'
import Link from 'next/link'

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

interface InventoryItem {
  id: string
  name: string
  sku: string
  description?: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  category: string
  supplier?: {
    name: string
    email: string
  }
  warehouse?: {
    name: string
    location: string
  }
  lastRestocked: Date
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
}

interface Warehouse {
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
    sku: string
  }
  type: 'IN' | 'OUT'
  quantity: number
  reference?: string
  reason: string
  createdAt: Date
  createdBy: {
    name: string
  }
}

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadInventoryData()
  }, [])

  const loadInventoryData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load inventory stats
      const statsResponse = await fetch('/api/inventory/items?stats=true')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load low stock items
      const lowStockResponse = await fetch('/api/inventory/items?lowStock=true&limit=10')
      if (lowStockResponse.ok) {
        const lowStockData = await lowStockResponse.json()
        setLowStockItems(lowStockData.items || [])
      }

      // Load warehouses
      const warehousesResponse = await fetch('/api/inventory/warehouses')
      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json()
        setWarehouses(warehousesData.warehouses || [])
      }

      // Load recent movements
      const movementsResponse = await fetch('/api/inventory/movements?limit=10')
      if (movementsResponse.ok) {
        const movementsData = await movementsResponse.json()
        setRecentMovements(movementsData.movements || [])
      }
    } catch (error) {
      console.error('Error loading inventory data:', error)
      setError('فشل في تحميل بيانات المخزون')
    } finally {
      setLoading(false)
    }
  }

  const syncVehiclesToInventory = async () => {
    setSyncing(true)
    try {
      // Get sync stats first
      const statsResponse = await fetch('/api/inventory/sync-stats')
      const stats = statsResponse.ok ? await statsResponse.json() : null
      
      if (stats && stats.vehiclesToSync === 0) {
        alert('لا توجد سيارات جديدة للمزامنة')
        return
      }

      const response = await fetch('/api/inventory/sync-vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        let message = `✅ ${result.message}\n\n📊 الإحصائيات:\n• السيارات المزامنة: ${result.syncedCount}\n• السيارات المحدثة: ${result.skippedCount}\n• الإجمالي: ${result.totalVehicles}`
        
        if (result.errorCount > 0) {
          message += `\n⚠️ تحذير: حدثت ${result.errorCount} أخطاء أثناء المزامنة`
        }
        
        alert(message)
        loadInventoryData()
      } else {
        const error = await response.json()
        alert('❌ خطأ في مزامنة السيارات: ' + (error.error || 'خطأ غير معروف'))
      }
    } catch (error) {
      console.error('Error syncing vehicles:', error)
      alert('❌ حدث خطأ أثناء مزامنة السيارات')
    } finally {
      setSyncing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return <Badge variant="destructive">نفد المخزون</Badge>
    }
    if (item.currentStock <= item.minStock) {
      return <Badge variant="outline">مخزون منخفض</Badge>
    }
    return <Badge variant="default">متوفر</Badge>
  }

  const getWarehouseCapacityColor = (capacity: number, current: number) => {
    const percentage = (current / capacity) * 100
    if (percentage > 80) return 'bg-red-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getGrowthIcon = (growth: number | undefined) => {
    if (!growth) return <div className="h-4 w-4" />
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number | undefined) => {
    if (!growth) return 'text-muted-foreground'
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <Button variant="outline" disabled>
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            جاري التحميل...
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <Button variant="outline" onClick={loadInventoryData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              إذا كانت هذه هي المرة الأولى التي تستخدم فيها النظام، جرب زر "تهيئة البيانات" لإضافة بيانات افتراضية.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if data is empty
  if (!loading && (!stats || stats.totalItems === 0)) {
    return (
      <AdminRoute>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">إدارة المخزون</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    // Initialize warehouses and suppliers first
                    const initResponse = await fetch('/api/inventory/initialize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })
                    
                    if (initResponse.ok) {
                      // Then seed inventory items
                      const seedResponse = await fetch('/api/inventory/seed-items', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      })
                      
                      if (seedResponse.ok) {
                        alert('تم تهيئة بيانات المخزون بنجاح')
                        loadInventoryData()
                      } else {
                        const error = await seedResponse.json()
                        alert('خطأ في تهيئة أصناف المخزون: ' + (error.error || 'خطأ غير معروف'))
                      }
                    } else {
                      const error = await initResponse.json()
                      alert('خطأ في تهيئة المستودعات والموردين: ' + (error.error || 'خطأ غير معروف'))
                    }
                  } catch (error) {
                    alert('حدث خطأ أثناء تهيئة البيانات')
                  }
                }}
              >
                <Plus className="ml-2 h-4 w-4" />
                تهيئة البيانات
              </Button>
              <Button variant="outline" onClick={loadInventoryData}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </div>
          </div>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-blue-900 mb-2">
                مرحباً بك في نظام إدارة المخزون
              </h2>
              <p className="text-blue-700 mb-6 max-w-md mx-auto">
                لا توجد بيانات مخزون حالياً. يمكنك تهيئة البيانات الافتراضية أو مزامنة السيارات الموجودة في النظام.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={syncVehiclesToInventory}
                  disabled={syncing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
                  onClick={async () => {
                    try {
                      // Initialize warehouses and suppliers first
                      const initResponse = await fetch('/api/inventory/initialize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      })
                      
                      if (initResponse.ok) {
                        // Then seed inventory items
                        const seedResponse = await fetch('/api/inventory/seed-items', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' }
                        })
                        
                        if (seedResponse.ok) {
                          alert('تم تهيئة بيانات المخزون بنجاح')
                          loadInventoryData()
                        } else {
                          const error = await seedResponse.json()
                          alert('خطأ في تهيئة أصناف المخزون: ' + (error.error || 'خطأ غير معروف'))
                        }
                      } else {
                        const error = await initResponse.json()
                        alert('خطأ في تهيئة المستودعات والموردين: ' + (error.error || 'خطأ غير معروف'))
                      }
                    } catch (error) {
                      alert('حدث خطأ أثناء تهيئة البيانات')
                    }
                  }}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  تهيئة بيانات افتراضية
                </Button>
              </div>
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
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <div className="flex gap-2">
            <Link href="/admin/inventory/purchase-orders">
              <Button variant="outline">
                <Truck className="ml-2 h-4 w-4" />
                طلبات الشراء
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={syncVehiclesToInventory}
              disabled={syncing}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
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
                  // Initialize warehouses and suppliers first
                  const initResponse = await fetch('/api/inventory/initialize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  
                  if (initResponse.ok) {
                    // Then seed inventory items
                    const seedResponse = await fetch('/api/inventory/seed-items', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })
                    
                    if (seedResponse.ok) {
                      alert('تم تهيئة بيانات المخزون بنجاح')
                      loadInventoryData()
                    } else {
                      const error = await seedResponse.json()
                      alert('خطأ في تهيئة أصناف المخزون: ' + (error.error || 'خطأ غير معروف'))
                    }
                  } else {
                    const error = await initResponse.json()
                    alert('خطأ في تهيئة المستودعات والموردين: ' + (error.error || 'خطأ غير معروف'))
                  }
                } catch (error) {
                  alert('حدث خطأ أثناء تهيئة البيانات')
                }
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              تهيئة البيانات
            </Button>
            <Button variant="outline" onClick={loadInventoryData}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
              <p className={`text-xs flex items-center gap-1 ${getGrowthColor(stats?.monthlyGrowth?.items)}`}>
                {getGrowthIcon(stats?.monthlyGrowth?.items)}
                {stats?.monthlyGrowth?.items ? Math.abs(stats.monthlyGrowth.items) : 0}% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? formatCurrency(stats.totalValue) : formatCurrency(0)}</div>
              <p className={`text-xs flex items-center gap-1 ${getGrowthColor(stats?.monthlyGrowth?.value)}`}>
                {getGrowthIcon(stats?.monthlyGrowth?.value)}
                {stats?.monthlyGrowth?.value ? Math.abs(stats.monthlyGrowth.value) : 0}% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تنبيهات المخزون</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.lowStockItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                أصناف تحتاج للطلب
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الموردون</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSuppliers || 0}</div>
              <p className="text-xs text-muted-foreground">
                مورد نشط
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Low Stock Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الأصناف الأكثر طلباً</CardTitle>
                  <CardDescription>
                    الأصناف التي تحتاج لإعادة طلب قريباً
                  </CardDescription>
                </div>
                <Link href="/admin/inventory/items">
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد أصناف تحتاج للطلب</p>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          المخزون: {item.currentStock} / الحد الأدنى: {item.minStock}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStockStatusBadge(item)}
                        <p className="text-sm font-medium">{formatCurrency(item.totalValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warehouses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المستودعات</CardTitle>
                  <CardDescription>
                    حالة المستودعات والمخزون المتاح
                  </CardDescription>
                </div>
                <Link href="/admin/inventory/warehouses">
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    إدارة
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {warehouses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد مستودعات</p>
              ) : (
                <div className="space-y-4">
                  {warehouses.slice(0, 5).map((warehouse) => {
                    const capacityPercentage = (warehouse.currentItems / warehouse.capacity) * 100
                    return (
                      <div key={warehouse.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{warehouse.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {warehouse.location} - {warehouse.currentItems} صنف
                          </p>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{Math.round(capacityPercentage)}%</div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getWarehouseCapacityColor(warehouse.capacity, warehouse.currentItems)}`}
                              style={{ width: `${capacityPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>أحدث الحركات</CardTitle>
                <CardDescription>
                  آخر حركات المخزون المسجلة
                </CardDescription>
              </div>
              <Link href="/admin/inventory/movements">
                <Button variant="outline" size="sm">
                  <Eye className="ml-2 h-4 w-4" />
                  عرض الكل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">لا توجد حركات مسجلة</p>
            ) : (
              <div className="space-y-4">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{movement.item.name}</p>
                      <p className="text-sm text-muted-foreground">{movement.reason}</p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <Badge variant={movement.type === 'IN' ? 'default' : 'secondary'}>
                          {movement.type === 'IN' ? 'وارد' : 'صادر'}
                        </Badge>
                        <span className="font-medium">{movement.quantity} قطعة</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(movement.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  )
}