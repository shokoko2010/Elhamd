'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
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
  ShoppingCart, 
  Search, 
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Truck,
  DollarSign,
  FileText,
  Send,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Warehouse
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-safe'
import { UserRole } from '@prisma/client'

interface PurchaseOrderItem {
  id: string
  itemId: string
  itemName: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  metadata?: Record<string, any>
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplier: {
    id: string
    name: string
    contact: string
    email: string
    phone: string
  }
  warehouseId: string
  warehouse: {
    id: string
    name: string
    location: string
  }
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PARTIALLY_DELIVERED'
  orderDate: string
  expectedDeliveryDate: string
  actualDeliveryDate?: string
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  currency: string
  items: PurchaseOrderItem[]
  notes?: string
  terms?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  rating: number
  status: 'active' | 'inactive'
  leadTime: number
}

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  currentStock: number
  status: 'active' | 'inactive' | 'maintenance'
}

interface InventoryItem {
  id: string
  partNumber: string
  name: string
  description: string
  category: string
  quantity: number
  minStockLevel: number
  unitPrice: number
  supplier: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
}

export default function PurchaseOrdersPage() {
  return (
    <AdminRoute>
      <PurchaseOrdersContent />
    </AdminRoute>
  )
}

function PurchaseOrdersContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast } = useToast()

  // Form state for new purchase order
  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    warehouseId: '',
    expectedDeliveryDate: '',
    shippingCost: 0,
    notes: '',
    terms: '',
    items: [] as PurchaseOrderItem[]
  })

  useEffect(() => {
    fetchPurchaseOrdersData()
  }, [dateRange])

  const fetchPurchaseOrdersData = async () => {
    try {
      setLoading(true)
      
      // Fetch purchase orders
      const ordersResponse = await fetch('/api/inventory/purchase-orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setPurchaseOrders(ordersData.orders || [])
      }

      // Fetch suppliers
      const suppliersResponse = await fetch('/api/inventory/suppliers')
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json()
        setSuppliers(suppliersData)
      }

      // Fetch warehouses
      const warehousesResponse = await fetch('/api/inventory/warehouses')
      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json()
        setWarehouses(warehousesData)
      }

      // Fetch inventory items
      const itemsResponse = await fetch('/api/inventory/items')
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setInventoryItems(itemsData.items || [])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات طلبات الشراء',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    try {
      const response = await fetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrder)
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إنشاء طلب الشراء بنجاح'
        })
        setIsCreateModalOpen(false)
        setNewOrder({
          supplierId: '',
          warehouseId: '',
          expectedDeliveryDate: '',
          shippingCost: 0,
          notes: '',
          terms: '',
          items: []
        })
        fetchPurchaseOrdersData()
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في إنشاء طلب الشراء',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء طلب الشراء',
        variant: 'destructive'
      })
    }
  }

  const handleSendOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/inventory/purchase-orders/${orderId}/send`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إرسال طلب الشراء بنجاح'
        })
        fetchPurchaseOrdersData()
      } else {
        throw new Error('Failed to send purchase order')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال طلب الشراء',
        variant: 'destructive'
      })
    }
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/inventory/purchase-orders/${orderId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم اعتماد طلب الشراء بنجاح'
        })
        fetchPurchaseOrdersData()
      } else {
        throw new Error('Failed to approve purchase order')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في اعتماد طلب الشراء',
        variant: 'destructive'
      })
    }
  }

  const handleReceiveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/inventory/purchase-orders/${orderId}/receive`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم استلام طلب الشراء بنجاح'
        })
        fetchPurchaseOrdersData()
      } else {
        throw new Error('Failed to receive purchase order')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في استلام طلب الشراء',
        variant: 'destructive'
      })
    }
  }

  const downloadOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/inventory/purchase-orders/${orderId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `purchase-order-${orderId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل طلب الشراء',
        variant: 'destructive'
      })
    }
  }

  const addItemToOrder = (item: InventoryItem) => {
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      description: item.description,
      quantity: 1,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice,
      taxRate: 14, // VAT rate
      taxAmount: item.unitPrice * 0.14,
      metadata: {
        partNumber: item.partNumber,
        category: item.category
      }
    }
    
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItemFromOrder = (itemId: string) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSupplier = supplierFilter === 'all' || order.supplierId === supplierFilter
    
    return matchesSearch && matchesStatus && matchesSupplier
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      SENT: { label: 'مرسلة', variant: 'default' as const, icon: Send },
      CONFIRMED: { label: 'معتمدة', variant: 'default' as const, icon: CheckCircle },
      SHIPPED: { label: 'مشحونة', variant: 'outline' as const, icon: Truck },
      DELIVERED: { label: 'مستلمة', variant: 'default' as const, icon: Package },
      PARTIALLY_DELIVERED: { label: 'مستلمة جزئياً', variant: 'outline' as const, icon: Package },
      CANCELLED: { label: 'ملغاة', variant: 'destructive' as const, icon: X }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
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

  const orderStats = {
    totalOrders: purchaseOrders.length,
    draftOrders: purchaseOrders.filter(o => o.status === 'DRAFT').length,
    pendingOrders: purchaseOrders.filter(o => ['SENT', 'CONFIRMED'].includes(o.status)).length,
    deliveredOrders: purchaseOrders.filter(o => o.status === 'DELIVERED').length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    avgDeliveryTime: purchaseOrders.length > 0 
      ? purchaseOrders.filter(o => o.actualDeliveryDate).reduce((sum, o) => {
          const days = Math.ceil((new Date(o.actualDeliveryDate!).getTime() - new Date(o.orderDate).getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / purchaseOrders.filter(o => o.actualDeliveryDate).length
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلبات الشراء</h1>
          <p className="text-gray-600 mt-2">إدارة طلبات شراء قطع الغيار والمستلزمات</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            طلب شراء جديد
          </Button>
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">جميع الطلبات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{orderStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">بانتظار الموافقة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات مستلمة</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">تم التسليم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت التوصيل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{(orderStats.avgDeliveryTime || 0).toFixed(1)} يوم</div>
            <p className="text-xs text-muted-foreground">متوسط أيام التوصيل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(orderStats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">قيمة جميع الطلبات</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">طلبات الشراء</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث في طلبات الشراء..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="DRAFT">مسودة</SelectItem>
                    <SelectItem value="SENT">مرسلة</SelectItem>
                    <SelectItem value="CONFIRMED">معتمدة</SelectItem>
                    <SelectItem value="SHIPPED">مشحونة</SelectItem>
                    <SelectItem value="DELIVERED">مستلمة</SelectItem>
                    <SelectItem value="PARTIALLY_DELIVERED">مستلمة جزئياً</SelectItem>
                    <SelectItem value="CANCELLED">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الموردين</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                    <SelectItem value="quarter">هذا الربع</SelectItem>
                    <SelectItem value="year">هذه السنة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>طلبات الشراء</CardTitle>
                  <CardDescription>إدارة طلبات الشراء والمتابعة والاستلام</CardDescription>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  طلب شراء جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم الطلب</th>
                      <th className="text-right py-3 px-4">المورد</th>
                      <th className="text-right py-3 px-4">المستودع</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="text-right py-3 px-4 font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div>
                            <div className="font-medium">{order.supplier.name}</div>
                            <div className="text-sm text-gray-500">{order.supplier.contact}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="font-medium">{order.warehouse.name}</div>
                          <div className="text-sm text-gray-500">{order.warehouse.location}</div>
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadOrder(order.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {order.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendOrder(order.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === 'SENT' && user?.role !== UserRole.STAFF && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveOrder(order.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReceiveOrder(order.id)}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل أداء المشتريات</CardTitle>
                <CardDescription>نظرة عامة على أداء طلبات الشراء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>متوسط قيمة الطلب</span>
                    <span className="font-bold">
                      {orderStats.totalOrders > 0 
                        ? formatCurrency(orderStats.totalValue / orderStats.totalOrders)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>معدل التسليم في الوقت</span>
                    <span className="font-bold text-green-600">
                      {orderStats.deliveredOrders > 0 ? '95%' : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>إجمالي قيمة المشتريات</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(orderStats.totalValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
                <CardDescription>توزيع طلبات الشراء حسب حالتها الحالية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>المسودات</span>
                    <Badge variant="secondary">{orderStats.draftOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>المعلقة</span>
                    <Badge variant="outline">{orderStats.pendingOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>المستلمة</span>
                    <Badge variant="default" className="bg-green-600">{orderStats.deliveredOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الملغاة</span>
                    <Badge variant="destructive">{purchaseOrders.filter(o => o.status === 'CANCELLED').length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Purchase Order Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء طلب شراء جديد</DialogTitle>
            <DialogDescription>إنشاء طلب شراء جديد للمستودع والمورد</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="supplier">المورد</Label>
                <Select value={newOrder.supplierId} onValueChange={(value) => setNewOrder(prev => ({ ...prev, supplierId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warehouse">المستودع</Label>
                <Select value={newOrder.warehouseId} onValueChange={(value) => setNewOrder(prev => ({ ...prev, warehouseId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستودع" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expectedDeliveryDate">تاريخ التسليم المتوقع</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={newOrder.expectedDeliveryDate}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Items Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">إضافة بنود الطلب</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {inventoryItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.partNumber}</p>
                          <p className="text-sm text-gray-500">المتوفر: {item.quantity} | الحد الأدنى: {item.minStockLevel}</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addItemToOrder(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Items */}
            {newOrder.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">البند المحددة</h3>
                <div className="space-y-2">
                  {newOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.itemName}</span>
                        <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatCurrency(item.totalPrice)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromOrder(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span>
                      {formatCurrency(newOrder.items.reduce((sum, item) => sum + item.totalPrice, 0) + newOrder.shippingCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shippingCost">تكلفة الشحن</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  value={newOrder.shippingCost}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateOrder}>
              إنشاء طلب الشراء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}