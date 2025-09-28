'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ShoppingCart, 
  Settings, 
  CreditCard, 
  Package, 
  Star, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Store,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Gift,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'

interface CommerceSettings {
  ecommerce: {
    enabled: boolean
    allowOnlinePurchase: boolean
    requireApproval: boolean
    autoConfirmOrders: boolean
    minOrderAmount: number
    maxOrderAmount: number
    currency: string
    taxRate: number
    shippingEnabled: boolean
    freeShippingThreshold: number
    shippingFee: number
  }
  payments: {
    enabled: boolean
    methods: {
      creditCard: boolean
      debitCard: boolean
      bankTransfer: boolean
      cashOnDelivery: boolean
      mobileWallet: boolean
    }
    providers: {
      stripe: boolean
      paypal: boolean
      fawry: boolean
      vodafoneCash: boolean
    }
  }
  orders: {
    autoGenerateNumber: boolean
    numberPrefix: string
    statusFlow: string[]
    allowCancellation: boolean
    cancellationPeriod: number
    allowModifications: boolean
    notificationEnabled: boolean
  }
  reviews: {
    enabled: boolean
    requireApproval: boolean
    allowPhotos: boolean
    allowAnonymous: boolean
    minRating: number
    autoPublish: boolean
  }
  promotions: {
    enabled: boolean
    allowCoupons: boolean
    allowDiscounts: boolean
    allowLoyaltyPoints: boolean
    pointsPerPurchase: number
    pointsValue: number
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  inStock: boolean
  quantity: number
  featured: boolean
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
  }[]
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
}

interface Promotion {
  id: string
  title: string
  description: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  code: string
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  active: boolean
}

export default function AdminCommercePage() {
  return <CommerceContent />
}

function CommerceContent() {
  const [settings, setSettings] = useState<CommerceSettings>({
    ecommerce: {
      enabled: true,
      allowOnlinePurchase: true,
      requireApproval: true,
      autoConfirmOrders: false,
      minOrderAmount: 1000,
      maxOrderAmount: 1000000,
      currency: 'EGP',
      taxRate: 14,
      shippingEnabled: true,
      freeShippingThreshold: 50000,
      shippingFee: 100
    },
    payments: {
      enabled: true,
      methods: {
        creditCard: true,
        debitCard: true,
        bankTransfer: true,
        cashOnDelivery: false,
        mobileWallet: true
      },
      providers: {
        stripe: true,
        paypal: false,
        fawry: true,
        vodafoneCash: true
      }
    },
    orders: {
      autoGenerateNumber: true,
      numberPrefix: 'ORD-',
      statusFlow: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      allowCancellation: true,
      cancellationPeriod: 24,
      allowModifications: true,
      notificationEnabled: true
    },
    reviews: {
      enabled: true,
      requireApproval: true,
      allowPhotos: true,
      allowAnonymous: false,
      minRating: 1,
      autoPublish: false
    },
    promotions: {
      enabled: true,
      allowCoupons: true,
      allowDiscounts: true,
      allowLoyaltyPoints: true,
      pointsPerPurchase: 100,
      pointsValue: 0.01
    }
  })

  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    activePromotions: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  })

  useEffect(() => {
    loadCommerceData()
  }, [])

  const loadCommerceData = async () => {
    setLoading(true)
    try {
      // Load settings
      const settingsResponse = await fetch('/api/commerce/settings')
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData)
      }

      // Load products
      const productsResponse = await fetch('/api/commerce/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products || [])
      }

      // Load orders
      const ordersResponse = await fetch('/api/commerce/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }

      // Load promotions
      const promotionsResponse = await fetch('/api/commerce/promotions')
      if (promotionsResponse.ok) {
        const promotionsData = await promotionsResponse.json()
        setPromotions(promotionsData.promotions || [])
      }

      // Calculate stats
      calculateStats()
    } catch (error) {
      console.error('Error loading commerce data:', error)
      toast.error('فشل في تحميل بيانات التجارة الإلكترونية')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalProducts = products.length
    const activePromotions = promotions.filter(p => p.active).length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    setStats({
      totalOrders,
      totalRevenue,
      totalProducts,
      activePromotions,
      pendingOrders,
      averageOrderValue
    })
  }

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/commerce/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('تم حفظ الإعدادات بنجاح')
      } else {
        throw new Error('فشل في حفظ الإعدادات')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('فشل في حفظ الإعدادات')
    }
  }

  const updateSettings = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CommerceSettings],
        [field]: value
      }
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: settings.ecommerce.currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'pending': return 'bg-yellow-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">إدارة التجارة الإلكترونية</h1>
        <p className="text-sm sm:text-base text-gray-600">تحكم في جميع جوانب المتجر الإلكتروني والمبيعات</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button onClick={saveSettings} className="w-full sm:w-auto">
            <Save className="ml-2 h-4 w-4" />
            حفظ الإعدادات
          </Button>
          <Button variant="outline" onClick={() => window.open('/store', '_blank')} className="w-full sm:w-auto">
            <Store className="ml-2 h-4 w-4" />
            معاينة المتجر
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">متوسط قيمة الطلب</p>
                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">المنتجات</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">العروض الترويجية</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.activePromotions}</p>
              </div>
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">الطلبات المعلقة</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">نظرة عامة</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">الإعدادات</TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm">المنتجات</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">الطلبات</TabsTrigger>
          <TabsTrigger value="promotions" className="text-xs sm:text-sm">العروض</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">التحليلات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  الطلبات الأخيرة
                </CardTitle>
                <CardDescription>آخر 5 طلبات في المتجر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-gray-500 py-4">لا توجد طلبات بعد</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Promotions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  العروض الترويجية النشطة
                </CardTitle>
                <CardDescription>العروض المتاحة حالياً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotions.filter(p => p.active).slice(0, 5).map((promotion) => (
                    <div key={promotion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{promotion.title}</p>
                        <p className="text-sm text-gray-600">{promotion.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {promotion.type === 'percentage' ? `${promotion.value}%` : formatCurrency(promotion.value)}
                        </p>
                        <Badge className="text-xs bg-green-500">نشط</Badge>
                      </div>
                    </div>
                  ))}
                  {promotions.filter(p => p.active).length === 0 && (
                    <p className="text-center text-gray-500 py-4">لا توجد عروض ترويجية نشطة</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Tabs defaultValue="ecommerce" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ecommerce">التجارة الإلكترونية</TabsTrigger>
              <TabsTrigger value="payments">المدفوعات</TabsTrigger>
              <TabsTrigger value="orders">الطلبات</TabsTrigger>
              <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              <TabsTrigger value="promotions">العروض الترويجية</TabsTrigger>
            </TabsList>

            {/* E-commerce Settings */}
            <TabsContent value="ecommerce">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات التجارة الإلكترونية</CardTitle>
                  <CardDescription>تكوين إعدادات المتجر الإلكتروني الأساسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ecommerce-enabled">تفعيل التجارة الإلكترونية</Label>
                        <Switch
                          id="ecommerce-enabled"
                          checked={settings.ecommerce.enabled}
                          onCheckedChange={(checked) => updateSettings('ecommerce', 'enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="online-purchase">السماح بالشراء الإلكتروني</Label>
                        <Switch
                          id="online-purchase"
                          checked={settings.ecommerce.allowOnlinePurchase}
                          onCheckedChange={(checked) => updateSettings('ecommerce', 'allowOnlinePurchase', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-approval">يتطلب موافقة الأدمن</Label>
                        <Switch
                          id="require-approval"
                          checked={settings.ecommerce.requireApproval}
                          onCheckedChange={(checked) => updateSettings('ecommerce', 'requireApproval', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-confirm">تأكيد الطلبات تلقائياً</Label>
                        <Switch
                          id="auto-confirm"
                          checked={settings.ecommerce.autoConfirmOrders}
                          onCheckedChange={(checked) => updateSettings('ecommerce', 'autoConfirmOrders', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="shipping-enabled">تفعيل الشحن</Label>
                        <Switch
                          id="shipping-enabled"
                          checked={settings.ecommerce.shippingEnabled}
                          onCheckedChange={(checked) => updateSettings('ecommerce', 'shippingEnabled', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="min-order">الحد الأدنى للطلب</Label>
                        <Input
                          id="min-order"
                          type="number"
                          value={settings.ecommerce.minOrderAmount}
                          onChange={(e) => updateSettings('ecommerce', 'minOrderAmount', Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="max-order">الحد الأقصى للطلب</Label>
                        <Input
                          id="max-order"
                          type="number"
                          value={settings.ecommerce.maxOrderAmount}
                          onChange={(e) => updateSettings('ecommerce', 'maxOrderAmount', Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="tax-rate">نسبة الضريبة (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          value={settings.ecommerce.taxRate}
                          onChange={(e) => updateSettings('ecommerce', 'taxRate', Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="free-shipping">الحد الأدنى للشحن المجاني</Label>
                        <Input
                          id="free-shipping"
                          type="number"
                          value={settings.ecommerce.freeShippingThreshold}
                          onChange={(e) => updateSettings('ecommerce', 'freeShippingThreshold', Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="shipping-fee">رسوم الشحن</Label>
                        <Input
                          id="shipping-fee"
                          type="number"
                          value={settings.ecommerce.shippingFee}
                          onChange={(e) => updateSettings('ecommerce', 'shippingFee', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات المدفوعات</CardTitle>
                  <CardDescription>تكوين طرق الدفع ومزودي الخدمة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">طرق الدفع</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="credit-card">بطاقة ائتمان</Label>
                        <Switch
                          id="credit-card"
                          checked={settings.payments.methods.creditCard}
                          onCheckedChange={(checked) => updateSettings('payments', 'methods', { ...settings.payments.methods, creditCard: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="debit-card">بطاقة خصم</Label>
                        <Switch
                          id="debit-card"
                          checked={settings.payments.methods.debitCard}
                          onCheckedChange={(checked) => updateSettings('payments', 'methods', { ...settings.payments.methods, debitCard: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="bank-transfer">تحويل بنكي</Label>
                        <Switch
                          id="bank-transfer"
                          checked={settings.payments.methods.bankTransfer}
                          onCheckedChange={(checked) => updateSettings('payments', 'methods', { ...settings.payments.methods, bankTransfer: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="cash-on-delivery">الدفع عند الاستلام</Label>
                        <Switch
                          id="cash-on-delivery"
                          checked={settings.payments.methods.cashOnDelivery}
                          onCheckedChange={(checked) => updateSettings('payments', 'methods', { ...settings.payments.methods, cashOnDelivery: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="mobile-wallet">محفظة محمولة</Label>
                        <Switch
                          id="mobile-wallet"
                          checked={settings.payments.methods.mobileWallet}
                          onCheckedChange={(checked) => updateSettings('payments', 'methods', { ...settings.payments.methods, mobileWallet: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">مزودو الخدمة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="stripe">Stripe</Label>
                        <Switch
                          id="stripe"
                          checked={settings.payments.providers.stripe}
                          onCheckedChange={(checked) => updateSettings('payments', 'providers', { ...settings.payments.providers, stripe: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="paypal">PayPal</Label>
                        <Switch
                          id="paypal"
                          checked={settings.payments.providers.paypal}
                          onCheckedChange={(checked) => updateSettings('payments', 'providers', { ...settings.payments.providers, paypal: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="fawry">Fawry</Label>
                        <Switch
                          id="fawry"
                          checked={settings.payments.providers.fawry}
                          onCheckedChange={(checked) => updateSettings('payments', 'providers', { ...settings.payments.providers, fawry: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="vodafone-cash">Vodafone Cash</Label>
                        <Switch
                          id="vodafone-cash"
                          checked={settings.payments.providers.vodafoneCash}
                          onCheckedChange={(checked) => updateSettings('payments', 'providers', { ...settings.payments.providers, vodafoneCash: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Order Settings */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الطلبات</CardTitle>
                  <CardDescription>تكوين إعدادات معالجة الطلبات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-generate">توليد رقم الطلب تلقائياً</Label>
                        <Switch
                          id="auto-generate"
                          checked={settings.orders.autoGenerateNumber}
                          onCheckedChange={(checked) => updateSettings('orders', 'autoGenerateNumber', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-cancellation">السماح بالإلغاء</Label>
                        <Switch
                          id="allow-cancellation"
                          checked={settings.orders.allowCancellation}
                          onCheckedChange={(checked) => updateSettings('orders', 'allowCancellation', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-modifications">السماح بالتعديلات</Label>
                        <Switch
                          id="allow-modifications"
                          checked={settings.orders.allowModifications}
                          onCheckedChange={(checked) => updateSettings('orders', 'allowModifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                        <Switch
                          id="notifications"
                          checked={settings.orders.notificationEnabled}
                          onCheckedChange={(checked) => updateSettings('orders', 'notificationEnabled', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="number-prefix">بادئة رقم الطلب</Label>
                        <Input
                          id="number-prefix"
                          value={settings.orders.numberPrefix}
                          onChange={(e) => updateSettings('orders', 'numberPrefix', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cancellation-period">فترة الإلغاء (ساعات)</Label>
                        <Input
                          id="cancellation-period"
                          type="number"
                          value={settings.orders.cancellationPeriod}
                          onChange={(e) => updateSettings('orders', 'cancellationPeriod', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Settings */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات التقييمات</CardTitle>
                  <CardDescription>تكوين إعدادات تقييمات العملاء</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reviews-enabled">تفعيل التقييمات</Label>
                        <Switch
                          id="reviews-enabled"
                          checked={settings.reviews.enabled}
                          onCheckedChange={(checked) => updateSettings('reviews', 'enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="require-approval">يتطلب موافقة</Label>
                        <Switch
                          id="require-approval"
                          checked={settings.reviews.requireApproval}
                          onCheckedChange={(checked) => updateSettings('reviews', 'requireApproval', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-photos">السماح بالصور</Label>
                        <Switch
                          id="allow-photos"
                          checked={settings.reviews.allowPhotos}
                          onCheckedChange={(checked) => updateSettings('reviews', 'allowPhotos', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-anonymous">السماح بالمجهول</Label>
                        <Switch
                          id="allow-anonymous"
                          checked={settings.reviews.allowAnonymous}
                          onCheckedChange={(checked) => updateSettings('reviews', 'allowAnonymous', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-publish">نشر تلقائي</Label>
                        <Switch
                          id="auto-publish"
                          checked={settings.reviews.autoPublish}
                          onCheckedChange={(checked) => updateSettings('reviews', 'autoPublish', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="min-rating">الحد الأدنى للتقييم</Label>
                        <Select
                          value={settings.reviews.minRating.toString()}
                          onValueChange={(value) => updateSettings('reviews', 'minRating', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 نجمة</SelectItem>
                            <SelectItem value="2">2 نجوم</SelectItem>
                            <SelectItem value="3">3 نجوم</SelectItem>
                            <SelectItem value="4">4 نجوم</SelectItem>
                            <SelectItem value="5">5 نجوم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Promotion Settings */}
            <TabsContent value="promotions">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات العروض الترويجية</CardTitle>
                  <CardDescription>تكوين إعدادات العروض والخصومات</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="promotions-enabled">تفعيل العروض الترويجية</Label>
                        <Switch
                          id="promotions-enabled"
                          checked={settings.promotions.enabled}
                          onCheckedChange={(checked) => updateSettings('promotions', 'enabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-coupons">السماح بقسائم الخصم</Label>
                        <Switch
                          id="allow-coupons"
                          checked={settings.promotions.allowCoupons}
                          onCheckedChange={(checked) => updateSettings('promotions', 'allowCoupons', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-discounts">السماح بالخصومات</Label>
                        <Switch
                          id="allow-discounts"
                          checked={settings.promotions.allowDiscounts}
                          onCheckedChange={(checked) => updateSettings('promotions', 'allowDiscounts', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="loyalty-points">تفعيل نقاط الولاء</Label>
                        <Switch
                          id="loyalty-points"
                          checked={settings.promotions.allowLoyaltyPoints}
                          onCheckedChange={(checked) => updateSettings('promotions', 'allowLoyaltyPoints', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="points-per-purchase">نقاط الولاء لكل عملية شراء</Label>
                        <Input
                          id="points-per-purchase"
                          type="number"
                          value={settings.promotions.pointsPerPurchase}
                          onChange={(e) => updateSettings('promotions', 'pointsPerPurchase', Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="points-value">قيمة النقطة الواحدة</Label>
                        <Input
                          id="points-value"
                          type="number"
                          step="0.01"
                          value={settings.promotions.pointsValue}
                          onChange={(e) => updateSettings('promotions', 'pointsValue', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة المنتجات</CardTitle>
                  <CardDescription>إدارة جميع المنتجات في المتجر الإلكتروني</CardDescription>
                </div>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة منتج
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg">
                        {product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getStatusColor(product.status)}`}>
                          {product.status}
                        </Badge>
                        {product.featured && (
                          <Badge className="text-xs bg-yellow-500">مميز</Badge>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
                    <p className="text-gray-600 mb-4">ابدأ بإضافة منتجاتك الأولى</p>
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة منتج
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة الطلبات</CardTitle>
                  <CardDescription>إدارة جميع طلبات المتجر الإلكتروني</CardDescription>
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">الطلب يحتوي على {order.items.length} منتج</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                    <p className="text-gray-600">لا توجد طلبات في المتجر الإلكتروني بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة العروض الترويجية</CardTitle>
                  <CardDescription>إدارة جميع العروض والخصومات</CardDescription>
                </div>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة عرض
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promotions.map((promotion) => (
                  <div key={promotion.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{promotion.title}</h3>
                      <p className="text-sm text-gray-600">{promotion.description}</p>
                      <p className="text-sm text-gray-500">الكود: {promotion.code}</p>
                      <p className="text-xs text-gray-500">
                        من {new Date(promotion.startDate).toLocaleDateString('ar-EG')} 
                        إلى {new Date(promotion.endDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {promotion.type === 'percentage' ? `${promotion.value}%` : formatCurrency(promotion.value)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${promotion.active ? 'bg-green-500' : 'bg-gray-500'}`}>
                          {promotion.active ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {promotion.usedCount}/{promotion.usageLimit}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {promotions.length === 0 && (
                  <div className="text-center py-8">
                    <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد عروض ترويجية</h3>
                    <p className="text-gray-600 mb-4">ابدأ بإضافة عروضك الترويجية الأولى</p>
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة عرض
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  إحصائيات المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي المبيعات</span>
                    <span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط قيمة الطلب</span>
                    <span className="font-semibold">{formatCurrency(stats.averageOrderValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الطلبات</span>
                    <span className="font-semibold">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الطلبات المعلقة</span>
                    <span className="font-semibold">{stats.pendingOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  إحصائيات العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>العملاء النشطون</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>العملاء الجدد</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>العملاء العائدون</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>معدل الاحتفاظ بالعملاء</span>
                    <span className="font-semibold">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}