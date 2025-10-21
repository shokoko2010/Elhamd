'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { PaymentMethod, PaymentStatus } from '@prisma/client'

interface PaymentGateway {
  id: string
  name: string
  status: 'active' | 'inactive' | 'maintenance'
  supportedMethods: PaymentMethod[]
  fees: {
    credit_card: number
    debit_card: number
    mobile_wallet: number
    bank_transfer: number
  }
  features: string[]
}

interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  gateway: string
  customerEmail: string
  customerName: string
  transactionId: string
  createdAt: string
  bookingId?: string
  bookingType?: string
}

interface PaymentStats {
  totalRevenue: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  refundedPayments: number
  gatewayStats: Record<string, {
    count: number
    amount: number
    successRate: number
  }>
}

export default function EgyptianPaymentManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      // Fetch transactions
      const transactionsResponse = await fetch('/api/payments/transactions')
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }

      // Fetch stats
      const statsResponse = await fetch('/api/payments/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch gateways
      const gatewaysResponse = await fetch('/api/payments/gateways')
      if (gatewaysResponse.ok) {
        const gatewaysData = await gatewaysResponse.json()
        setGateways(gatewaysData.gateways || [])
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const iconMap = {
      [PaymentMethod.CREDIT_CARD]: CreditCard,
      [PaymentMethod.DEBIT_CARD]: CreditCard,
      [PaymentMethod.MOBILE_WALLET]: Smartphone,
      [PaymentMethod.BANK_TRANSFER]: Building2,
      [PaymentMethod.CASH]: Banknote
    }
    
    const Icon = iconMap[method] || CreditCard
    return <Icon className="h-4 w-4" />
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
      [PaymentMethod.DEBIT_CARD]: 'بطاقة مدينة',
      [PaymentMethod.MOBILE_WALLET]: 'محفظة إلكترونية',
      [PaymentMethod.BANK_TRANSFER]: 'تحويل بنكي',
      [PaymentMethod.CASH]: 'نقداً'
    }
    
    return labels[method] || method
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      [PaymentStatus.PENDING]: { label: 'قيد الانتظار', variant: 'secondary' as const, icon: Clock },
      [PaymentStatus.COMPLETED]: { label: 'مكتمل', variant: 'default' as const, icon: CheckCircle },
      [PaymentStatus.FAILED]: { label: 'فشل', variant: 'destructive' as const, icon: XCircle },
      [PaymentStatus.REFUNDED]: { label: 'مسترد', variant: 'outline' as const, icon: RefreshCw },
      [PaymentStatus.CANCELLED]: { label: 'ملغي', variant: 'secondary' as const, icon: XCircle }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const, icon: AlertCircle }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getGatewayStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'default' as const, color: 'bg-green-500' },
      inactive: { label: 'غير نشط', variant: 'secondary' as const, color: 'bg-gray-500' },
      maintenance: { label: 'صيانة', variant: 'outline' as const, color: 'bg-yellow-500' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, color: 'bg-gray-500' }
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الدفعات المصرية</h1>
          <p className="text-gray-600">إدارة بوابات الدفع والمعاملات المالية</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="gateways">بوابات الدفع</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Payment Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">هذا الشهر</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">مدفوعات ناجحة</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.successfulPayments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">معاملات</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">مدفوعات معلقة</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.pendingPayments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">بانتظار التأكيد</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">مدفوعات فاشلة</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.failedPayments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">فشلت في المعالجة</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">مدفوعات مستردة</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.refundedPayments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">مستردة للعملاء</p>
                </CardContent>
              </Card>
            </div>

            {/* Gateway Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء بوابات الدفع</CardTitle>
                  <CardDescription>إحصائيات أداء كل بوابة دفع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.gatewayStats && Object.entries(stats.gatewayStats).map(([gateway, data]) => (
                      data && (
                        <div key={gateway} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{gateway}</p>
                            <p className="text-sm text-gray-500">{data.count || 0} معاملة</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">{formatCurrency(data.amount || 0)}</p>
                            <p className="text-sm text-gray-500">{data.successRate || 0}% نجاح</p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طرق الدفع الأكثر استخداماً</CardTitle>
                  <CardDescription>تحليل طرق الدفع المفضلة للعملاء</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.values(PaymentMethod).map((method) => {
                      const methodTransactions = transactions.filter(t => t.method === method)
                      const count = methodTransactions.length
                      const amount = methodTransactions.reduce((sum, t) => sum + t.amount, 0)
                      
                      if (count === 0) return null
                      
                      return (
                        <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getPaymentMethodIcon(method)}
                            <div>
                              <p className="font-medium">{getPaymentMethodLabel(method)}</p>
                              <p className="text-sm text-gray-500">{count} معاملة</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">{formatCurrency(amount)}</p>
                            <p className="text-sm text-gray-500">{transactions.length > 0 ? ((count / transactions.length) * 100).toFixed(1) : '0.0'}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>آخر المعاملات</CardTitle>
                    <CardDescription>أحدث عمليات الدفع في النظام</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">المعاملة</th>
                        <th className="text-right py-3 px-4">العميل</th>
                        <th className="text-right py-3 px-4">الطريقة</th>
                        <th className="text-right py-3 px-4">المبلغ</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4 font-medium">
                            {transaction.transactionId}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div>
                              <p className="font-medium">{transaction.customerName}</p>
                              <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {getPaymentMethodIcon(transaction.method)}
                              <span>{getPaymentMethodLabel(transaction.method)}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {new Date(transaction.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gateways Tab */}
          <TabsContent value="gateways" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gateways.map((gateway) => (
                <Card key={gateway.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{gateway.name}</CardTitle>
                      {getGatewayStatusBadge(gateway.status)}
                    </div>
                    <CardDescription>
                      {gateway.name === 'Fawry' && 'بوابة الدفع الأكثر شيوعاً في مصر'}
                      {gateway.name === 'PayMob' && 'بوابة دفع متكاملة مع دعم متعدد'}
                      {gateway.name === 'Vodafone Cash' && 'محفظة فودافون الإلكترونية'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">طرق الدفع المدعومة:</h4>
                        <div className="flex flex-wrap gap-2">
                          {gateway.supportedMethods.map((method) => (
                            <Badge key={method} variant="outline" className="flex items-center gap-1">
                              {getPaymentMethodIcon(method)}
                              {getPaymentMethodLabel(method)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">الرسوم:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>بطاقة ائتمان:</span>
                            <span>{(gateway.fees.credit_card * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>بطاقة مدينة:</span>
                            <span>{(gateway.fees.debit_card * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>محفظة إلكترونية:</span>
                            <span>{(gateway.fees.mobile_wallet * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>تحويل بنكي:</span>
                            <span>{(gateway.fees.bank_transfer * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">المميزات:</h4>
                        <div className="space-y-1">
                          {gateway.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>جميع المعاملات</CardTitle>
                    <CardDescription>عرض وإدارة جميع عمليات الدفع</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="ml-2 h-4 w-4" />
                    تصدير الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">رقم المعاملة</th>
                        <th className="text-right py-3 px-4">العميل</th>
                        <th className="text-right py-3 px-4">البوابة</th>
                        <th className="text-right py-3 px-4">الطريقة</th>
                        <th className="text-right py-3 px-4">المبلغ</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">التاريخ</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4 font-medium">
                            {transaction.transactionId}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div>
                              <p className="font-medium">{transaction.customerName}</p>
                              <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <Badge variant="outline">{transaction.gateway}</Badge>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {getPaymentMethodIcon(transaction.method)}
                              <span>{getPaymentMethodLabel(transaction.method)}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {new Date(transaction.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات بوابات الدفع</CardTitle>
                  <CardDescription>تكوين بوابات الدفع المتاحة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Fawry</p>
                        <p className="text-sm text-gray-500">بوابة الدفع الأكثر شيوعاً</p>
                      </div>
                      <Button variant="outline" size="sm">
                        تكوين
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">PayMob</p>
                        <p className="text-sm text-gray-500">بوابة دفع متكاملة</p>
                      </div>
                      <Button variant="outline" size="sm">
                        تكوين
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Vodafone Cash</p>
                        <p className="text-sm text-gray-500">محفظة إلكترونية</p>
                      </div>
                      <Button variant="outline" size="sm">
                        تكوين
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الرسوم</CardTitle>
                  <CardDescription>تكوين رسوم المعاملات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>رسوم بطاقة الائتمان</span>
                      <span className="font-medium">2.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رسوم بطاقة المدينة</span>
                      <span className="font-medium">1.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رسوم المحفظة الإلكترونية</span>
                      <span className="font-medium">1.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رسوم التحويل البنكي</span>
                      <span className="font-medium">0.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>رسوم الدفع النقدي</span>
                      <span className="font-medium">0%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}