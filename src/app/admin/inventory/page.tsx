'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { StaffPermissions, InventoryPermissions } from '@/components/auth/StaffPermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  Filter,
  Warehouse,
  Truck,
  Settings,
  BarChart3,
  Car,
  Wrench,
  Database,
  Building,
  User,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ShoppingCart
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@prisma/client'
import { api } from '@/lib/api-client'

interface InventoryItem {
  id: string
  partNumber: string
  name: string
  description: string
  category: string
  quantity: number
  minStockLevel: number
  maxStockLevel: number
  unitPrice: number
  supplier: string
  location: string
  warehouse: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
  lastRestockDate: string
  nextRestockDate?: string
  leadTime: number // in days
  notes?: string
}

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  currentStock: number
  manager: string
  contact: string
  status: 'active' | 'inactive' | 'maintenance'
}

interface Branch {
  id: string
  name: string
  code: string
  address: string
  phone: string
  email: string
  isActive: boolean
  manager?: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  rating: number
  status: 'active' | 'inactive'
  leadTime: number // in days
  minOrderAmount: number
}

interface StockAlert {
  id: string
  itemId: string
  itemName: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'damaged'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

export default function InventoryPage() {
  return (
    <AdminRoute requiredPermissions={['view_inventory']}>
      <InventoryContent />
    </AdminRoute>
  )
}

function InventoryContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('items')
  const [loading, setLoading] = useState(true)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isSyncingVehicles, setIsSyncingVehicles] = useState(false)
  const [isInitializingData, setIsInitializingData] = useState(false)
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false)
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false)
  const { toast } = useToast()

  // Check user permissions
  const canViewInventory = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BRANCH_MANAGER || user?.role === UserRole.STAFF
  const canAddItems = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BRANCH_MANAGER || user?.role === UserRole.STAFF
  const canManageWarehouses = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BRANCH_MANAGER
  const canManageSuppliers = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BRANCH_MANAGER
  const canInitializeData = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN
  const canSyncVehicles = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BRANCH_MANAGER
  const canDeleteItems = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BRANCH_MANAGER

  // Form state for new item
  const [newItem, setNewItem] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: 'spare_parts',
    quantity: 0,
    minStockLevel: 0,
    maxStockLevel: 100,
    unitPrice: 0,
    supplier: '',
    location: '',
    warehouse: '',
    leadTime: 7,
    notes: '',
    itemType: 'spare_part' // 'spare_part' or 'vehicle'
  })

  // Form state for new warehouse
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    capacity: 100,
    manager: '',
    contact: ''
  })

  // Form state for new supplier
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    rating: 0,
    leadTime: 7,
    minOrderAmount: 0
  })

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      
      // Fetch inventory items
      const itemsData = await api.get('/api/inventory/items')
      setInventoryItems(itemsData.items || [])

      // Fetch warehouses
      const warehousesData = await api.get('/api/inventory/warehouses')
      setWarehouses(warehousesData)

      // Fetch branches
      const branchesData = await api.get('/api/branches')
      setBranches(branchesData.branches || [])

      // Fetch suppliers
      const suppliersData = await api.get('/api/inventory/suppliers')
      setSuppliers(suppliersData)

      // Fetch alerts
      const alertsData = await api.get('/api/inventory/alerts')
      setAlerts(alertsData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      await api.post('/api/inventory/items', newItem)
      
      toast({
        title: 'Success',
        description: 'Item added successfully'
      })
      setIsAddItemModalOpen(false)
      setNewItem({
        partNumber: '',
        name: '',
        description: '',
        category: 'spare_parts',
        quantity: 0,
        minStockLevel: 0,
        maxStockLevel: 100,
        unitPrice: 0,
        supplier: '',
        location: '',
        warehouse: '',
        leadTime: 7,
        notes: '',
        itemType: 'spare_part'
      })
      fetchInventoryData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add item',
        variant: 'destructive'
      })
    }
  }

  const handleSyncVehicles = async () => {
    try {
      setIsSyncingVehicles(true)
      
      const result = await api.post('/api/inventory/sync-vehicles')
      
      toast({
        title: 'Success',
        description: `Synced ${result.syncedCount} vehicles to inventory (${result.skippedCount} already synced)`
      })
      fetchInventoryData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync vehicles',
        variant: 'destructive'
      })
    } finally {
      setIsSyncingVehicles(false)
    }
  }

  const handleInitializeData = async () => {
    try {
      setIsInitializingData(true)
      
      const result = await api.post('/api/inventory/initialize')
      
      toast({
        title: 'Success',
        description: `Initialized ${result.warehousesCreated} warehouses and ${result.suppliersCreated} suppliers`
      })
      fetchInventoryData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initialize data',
        variant: 'destructive'
      })
    } finally {
      setIsInitializingData(false)
    }
  }

  const handleAddWarehouse = async () => {
    try {
      await api.post('/api/inventory/warehouses', newWarehouse)
      
      toast({
        title: 'Success',
        description: 'Warehouse added successfully'
      })
      setIsAddWarehouseModalOpen(false)
      setNewWarehouse({
        name: '',
        location: '',
        capacity: 100,
        manager: '',
        contact: ''
      })
      fetchInventoryData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add warehouse',
        variant: 'destructive'
      })
    }
  }

  const handleAddSupplier = async () => {
    try {
      await api.post('/api/inventory/suppliers', newSupplier)
      
      toast({
        title: 'Success',
        description: 'Supplier added successfully'
      })
      setIsAddSupplierModalOpen(false)
      setNewSupplier({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        rating: 0,
        leadTime: 7,
        minOrderAmount: 0
      })
      fetchInventoryData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add supplier',
        variant: 'destructive'
      })
    }
  }

  const filteredItems = (inventoryItems || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesWarehouse = warehouseFilter === 'all' || item.warehouse === warehouseFilter
    const matchesBranch = branchFilter === 'all' || item.location?.includes(branchFilter) || item.warehouse?.includes(branchFilter)
    
    return matchesSearch && matchesCategory && matchesStatus && matchesWarehouse && matchesBranch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { variant: 'default' as const, label: 'متوفر', color: 'bg-green-100 text-green-800' },
      low_stock: { variant: 'secondary' as const, label: 'مخزون منخفض', color: 'bg-yellow-100 text-yellow-800' },
      out_of_stock: { variant: 'destructive' as const, label: 'نفذ من المخزون', color: 'bg-red-100 text-red-800' },
      discontinued: { variant: 'outline' as const, label: 'موقف', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getAlertSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { variant: 'secondary' as const, label: 'منخفض', color: 'bg-blue-100 text-blue-800' },
      medium: { variant: 'outline' as const, label: 'متوسط', color: 'bg-yellow-100 text-yellow-800' },
      high: { variant: 'default' as const, label: 'عالي', color: 'bg-orange-100 text-orange-800' },
      critical: { variant: 'destructive' as const, label: 'حرج', color: 'bg-red-100 text-red-800' }
    }
    
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const inventoryStats = {
    totalItems: inventoryItems.length,
    inStock: inventoryItems.filter(i => i.status === 'in_stock').length,
    lowStock: inventoryItems.filter(i => i.status === 'low_stock').length,
    outOfStock: inventoryItems.filter(i => i.status === 'out_of_stock').length,
    totalValue: inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    activeAlerts: alerts.filter(a => !a.resolved).length,
    criticalAlerts: alerts.filter(a => !a.resolved && a.severity === 'critical').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام إدارة المخزون</h1>
          <p className="text-gray-600 mt-2">إدارة قطع الغيار والمركبات والمستودعات والموردين</p>
          {user && (
            <div className="mt-2">
              <Badge variant="outline" className="text-sm">
                {user.role === UserRole.ADMIN && 'مسؤول نظام'}
                {user.role === UserRole.SUPER_ADMIN && 'مسؤول رئيسي'}
                {user.role === UserRole.BRANCH_MANAGER && 'مدير فرع'}
                {user.role === UserRole.STAFF && 'موظف'}
                {user.role === UserRole.CUSTOMER && 'عميل'}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {/* Initialize Data Button - Admin Only */}
          {canInitializeData && warehouses.length === 0 && suppliers.length === 0 && (
            <Button 
              onClick={handleInitializeData} 
              disabled={isInitializingData}
              variant="outline"
            >
              <Database className="ml-2 h-4 w-4" />
              {isInitializingData ? 'جاري التهيئة...' : 'تهيئة البيانات الأساسية'}
            </Button>
          )}
          
          {/* Sync Vehicles Button - Admin and Manager Only */}
          {canSyncVehicles && (
            <Button 
              onClick={handleSyncVehicles} 
              disabled={isSyncingVehicles}
              variant="outline"
            >
              <Car className="ml-2 h-4 w-4" />
              {isSyncingVehicles ? 'جاري المزامنة...' : 'مزامنة المركبات'}
            </Button>
          )}
          
          {/* Add Item Button - Staff, Manager, and Admin */}
          {canAddItems && (
            <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة صنف جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة صنف جديد</DialogTitle>
                  <DialogDescription>
                    إضافة صنف جديد إلى المخزون. يمكنك إضافة قطع غيار أو مركبات.
                  </DialogDescription>
                </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemType">نوع الصنف</Label>
                    <Select 
                      value={newItem.itemType} 
                      onValueChange={(value) => setNewItem({...newItem, itemType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الصنف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spare_part">قطعة غيار</SelectItem>
                        <SelectItem value="vehicle">مركبة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value) => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spare_parts">قطع غيار</SelectItem>
                        <SelectItem value="vehicles">مركبات</SelectItem>
                        <SelectItem value="engine">محرك</SelectItem>
                        <SelectItem value="brakes">فرامل</SelectItem>
                        <SelectItem value="suspension">تعليق</SelectItem>
                        <SelectItem value="electrical">كهرباء</SelectItem>
                        <SelectItem value="body">هيكل</SelectItem>
                        <SelectItem value="interior">داخلي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partNumber">الرقم التسلسلي</Label>
                    <Input
                      id="partNumber"
                      value={newItem.partNumber}
                      onChange={(e) => setNewItem({...newItem, partNumber: e.target.value})}
                      placeholder="أدخل الرقم التسلسلي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الصنف</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="أدخل اسم الصنف"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="أدخل وصف الصنف"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">الحد الأدنى</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={newItem.minStockLevel}
                      onChange={(e) => setNewItem({...newItem, minStockLevel: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">السعر</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">المورد</Label>
                    <Input
                      id="supplier"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      placeholder="أدخل اسم المورد"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouse">المستودع</Label>
                    <Select 
                      value={newItem.warehouse} 
                      onValueChange={(value) => setNewItem({...newItem, warehouse: value})}
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
                        <SelectItem value="Main Showroom">المعرض الرئيسي</SelectItem>
                        <SelectItem value="Branch - Cairo">فرع - القاهرة</SelectItem>
                        <SelectItem value="Branch - Alexandria">فرع - الإسكندرية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">الموقع/الفرع</Label>
                    <Select 
                      value={newItem.location} 
                      onValueChange={(value) => setNewItem({...newItem, location: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Showroom">المعرض الرئيسي</SelectItem>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.name}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadTime">وقت التوريد (أيام)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      value={newItem.leadTime}
                      onChange={(e) => setNewItem({...newItem, leadTime: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    placeholder="أدخل أي ملاحظات إضافية"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem}>إضافة الصنف</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              في جميع المستودعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوفر</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.inStock}</div>
            <p className="text-xs text-muted-foreground">
              أصناف متوفرة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              يحتاج إعادة طلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نفذ من المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              يحتاج طلب عاجل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي القيمة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التنبيهات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryStats.criticalAlerts} حرج
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${canManageWarehouses && canManageSuppliers ? 'grid-cols-5' : 'grid-cols-3'}`}>
          <TabsTrigger value="items">الأصناف</TabsTrigger>
          {canManageWarehouses && (
            <TabsTrigger value="warehouses">المستودعات</TabsTrigger>
          )}
          {canManageSuppliers && (
            <TabsTrigger value="suppliers">الموردون</TabsTrigger>
          )}
          <TabsTrigger value="purchase-orders">طلبات الشراء</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث بالاسم، الرمز، أو الوصف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفروع</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    <SelectItem value="vehicles">مركبات</SelectItem>
                    <SelectItem value="spare_parts">قطع غيار</SelectItem>
                    <SelectItem value="engine">محرك</SelectItem>
                    <SelectItem value="brakes">فرامل</SelectItem>
                    <SelectItem value="suspension">تعليق</SelectItem>
                    <SelectItem value="electrical">كهرباء</SelectItem>
                    <SelectItem value="body">هيكل</SelectItem>
                    <SelectItem value="interior">داخلي</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="in_stock">متوفر</SelectItem>
                    <SelectItem value="low_stock">مخزون منخفض</SelectItem>
                    <SelectItem value="out_of_stock">نفذ من المخزون</SelectItem>
                    <SelectItem value="discontinued">موقف</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
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
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الأصناف</CardTitle>
              <CardDescription>
                {filteredItems.length} صنف
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.category === 'vehicles' 
                            ? 'bg-blue-100' 
                            : 'bg-green-100'
                        }`}>
                          {item.category === 'vehicles' ? (
                            <Car className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Wrench className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.partNumber} • {item.category}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(item.status)}
                            <span className="text-xs text-gray-500">
                              المستودع: {item.warehouse}
                            </span>
                            {item.category === 'vehicles' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                مركبة
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-semibold">{item.quantity} {item.category === 'vehicles' ? 'وحدة' : 'قطعة'}</div>
                            <div className="text-sm text-gray-600">
                              الحد الأدنى: {item.minStockLevel}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{formatCurrency(item.unitPrice)}</div>
                            <div className="text-sm text-gray-600">
                              الإجمالي: {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          المورد: {item.supplier}
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
                          {canAddItems && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 ml-1" />
                              تعديل
                            </Button>
                          )}
                          {canDeleteItems && (
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageWarehouses && (
          <TabsContent value="warehouses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">المستودعات</h2>
              <Dialog open={isAddWarehouseModalOpen} onOpenChange={setIsAddWarehouseModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Building className="ml-2 h-4 w-4" />
                    إضافة مستودع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>إضافة مستودع جديد</DialogTitle>
                    <DialogDescription>
                      إضافة مستودع جديد إلى نظام المخزون.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="warehouseName">اسم المستودع</Label>
                      <Input
                        id="warehouseName"
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                        placeholder="أدخل اسم المستودع"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warehouseLocation">الموقع</Label>
                      <Input
                        id="warehouseLocation"
                        value={newWarehouse.location}
                        onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                        placeholder="أدخل الموقع"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouseCapacity">السعة</Label>
                      <Input
                        id="warehouseCapacity"
                        type="number"
                        value={newWarehouse.capacity}
                        onChange={(e) => setNewWarehouse({...newWarehouse, capacity: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warehouseManager">المدير</Label>
                      <Input
                        id="warehouseManager"
                        value={newWarehouse.manager}
                        onChange={(e) => setNewWarehouse({...newWarehouse, manager: e.target.value})}
                        placeholder="أدخل اسم المدير"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouseContact">رقم الاتصال</Label>
                    <Input
                      id="warehouseContact"
                      value={newWarehouse.contact}
                      onChange={(e) => setNewWarehouse({...newWarehouse, contact: e.target.value})}
                      placeholder="أدخل رقم الاتصال"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddWarehouse}>إضافة المستودع</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {warehouses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Warehouse className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستودعات</h3>
                <p className="text-gray-500 text-center mb-4">
                  قم بإضافة مستودعات جديدة أو اضغط على "تهيئة البيانات الأساسية" لإضافة مستودعات افتراضية
                </p>
                <Button onClick={handleInitializeData} disabled={isInitializingData}>
                  <Database className="ml-2 h-4 w-4" />
                  {isInitializingData ? 'جاري التهيئة...' : 'تهيئة البيانات الأساسية'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouses.map((warehouse) => (
                <Card key={warehouse.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5" />
                      {warehouse.name}
                    </CardTitle>
                    <CardDescription>{warehouse.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">السعة:</span>
                        <span className="font-medium">{warehouse.capacity} صنف</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">المخزون الحالي:</span>
                        <span className="font-medium">{warehouse.currentStock} صنف</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">نسبة الامتلاء:</span>
                        <span className="font-medium">
                          {Math.round((warehouse.currentStock / warehouse.capacity) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">المدير:</span>
                        <span className="font-medium">{warehouse.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">الحالة:</span>
                        <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                          {warehouse.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        )}

        {canManageSuppliers && (
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">الموردون</h2>
              <Dialog open={isAddSupplierModalOpen} onOpenChange={setIsAddSupplierModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                  <User className="ml-2 h-4 w-4" />
                  إضافة مورد جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>إضافة مورد جديد</DialogTitle>
                  <DialogDescription>
                    إضافة مورد جديد إلى نظام المخزون.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierName">اسم المورد</Label>
                      <Input
                        id="supplierName"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                        placeholder="أدخل اسم المورد"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierContact">جهة الاتصال</Label>
                      <Input
                        id="supplierContact"
                        value={newSupplier.contact}
                        onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                        placeholder="أدخل جهة الاتصال"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierEmail">البريد الإلكتروني</Label>
                      <Input
                        id="supplierEmail"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                        placeholder="أدخل البريد الإلكتروني"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierPhone">الهاتف</Label>
                      <Input
                        id="supplierPhone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierAddress">العنوان</Label>
                    <Input
                      id="supplierAddress"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                      placeholder="أدخل العنوان"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierRating">التقييم</Label>
                      <Input
                        id="supplierRating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={newSupplier.rating}
                        onChange={(e) => setNewSupplier({...newSupplier, rating: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierLeadTime">وقت التوريد (أيام)</Label>
                      <Input
                        id="supplierLeadTime"
                        type="number"
                        value={newSupplier.leadTime}
                        onChange={(e) => setNewSupplier({...newSupplier, leadTime: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierMinOrder">الحد الأدنى للطلب</Label>
                      <Input
                        id="supplierMinOrder"
                        type="number"
                        value={newSupplier.minOrderAmount}
                        onChange={(e) => setNewSupplier({...newSupplier, minOrderAmount: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSupplier}>إضافة المورد</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {suppliers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد موردين</h3>
                <p className="text-gray-500 text-center mb-4">
                  قم بإضافة موردين جدد أو اضغط على "تهيئة البيانات الأساسية" لإضافة موردين افتراضيين
                </p>
                <Button onClick={handleInitializeData} disabled={isInitializingData}>
                  <Database className="ml-2 h-4 w-4" />
                  {isInitializingData ? 'جاري التهيئة...' : 'تهيئة البيانات الأساسية'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {supplier.name}
                    </CardTitle>
                    <CardDescription>{supplier.contact}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">البريد الإلكتروني:</span>
                        <span className="font-medium text-sm">{supplier.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">الهاتف:</span>
                        <span className="font-medium text-sm">{supplier.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">التقييم:</span>
                        <span className="font-medium">{supplier.rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">وقت التوريد:</span>
                        <span className="font-medium">{supplier.leadTime} يوم</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">الحد الأدنى للطلب:</span>
                        <span className="font-medium">{formatCurrency(supplier.minOrderAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">الحالة:</span>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        )}

        <TabsContent value="purchase-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>طلبات الشراء</CardTitle>
                  <CardDescription>إدارة طلبات شراء قطع الغيار والمستلزمات</CardDescription>
                </div>
                <Link href="/admin/inventory/purchase-orders">
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    طلب شراء جديد
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  إدارة طلبات الشراء
                </h3>
                <p className="text-gray-500 mb-4">
                  قم بإنشاء وإدارة طلبات الشراء للموردين وتتبع حالة التسليم
                </p>
                <Link href="/admin/inventory/purchase-orders">
                  <Button>
                    الذهاب إلى طلبات الشراء
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تنبيهات المخزون</CardTitle>
              <CardDescription>
                {alerts.filter(a => !a.resolved).length} تنبيه نشط
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.filter(a => !a.resolved).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{alert.itemName}</h3>
                        <div className="flex items-center gap-2">
                          {getAlertSeverityBadge(alert.severity)}
                          <Badge variant="outline">
                            {alert.type === 'low_stock' && 'مخزون منخفض'}
                            {alert.type === 'out_of_stock' && 'نفذ من المخزون'}
                            {alert.type === 'expiring' && 'ينتهي قريباً'}
                            {alert.type === 'damaged' && 'تالف'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}