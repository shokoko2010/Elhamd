'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Banknote, 
  Calendar, 
  Download, 
  Filter, 
  Plus, 
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  transactionId?: string
  notes?: string
  paymentDate: string
  invoice: {
    id: string
    invoiceNumber: string
    customer: {
      id: string
      name: string
      email: string
    }
    totalAmount: number
    paidAmount: number
    status: string
  }
  payment: {
    id: string
    metadata?: any
  }
}

interface PaymentStats {
  total: number
  totalAmount: number
  byMethod: Record<string, { count: number; amount: number }>
  byStatus: Record<string, { count: number; amount: number }>
  recent: Payment[]
}

export default function PaymentManagementPage() {
  return (
    <AdminRoute>
      <PaymentManagementContent />
    </AdminRoute>
  )
}

function PaymentManagementContent() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [searchTerm, filterMethod, filterStatus, dateRange])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterMethod) params.append('paymentMethod', filterMethod)
      if (filterStatus) params.append('status', filterStatus)
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)

      const response = await fetch(`/api/finance/payments/offline?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        
        // Calculate stats
        const paymentStats: PaymentStats = {
          total: data.total || 0,
          totalAmount: data.totalAmount || 0,
          byMethod: {},
          byStatus: {},
          recent: data.payments?.slice(0, 5) || []
        }

        data.payments?.forEach((payment: Payment) => {
          // By method
          if (!paymentStats.byMethod[payment.paymentMethod]) {
            paymentStats.byMethod[payment.paymentMethod] = { count: 0, amount: 0 }
          }
          paymentStats.byMethod[payment.paymentMethod].count++
          paymentStats.byMethod[payment.paymentMethod].amount += payment.amount

          // By status
          if (!paymentStats.byStatus[payment.status]) {
            paymentStats.byStatus[payment.status] = { count: 0, amount: 0 }
          }
          paymentStats.byStatus[payment.status].count++
          paymentStats.byStatus[payment.status].amount += payment.amount
        })

        setStats(paymentStats)
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الدفعات',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      CASH: { color: 'bg-green-100 text-green-800', label: 'نقدي', icon: Banknote },
      BANK_TRANSFER: { color: 'bg-blue-100 text-blue-800', label: 'تحويل بنكي', icon: CreditCard },
      CHECK: { color: 'bg-purple-100 text-purple-800', label: 'شيك', icon: CreditCard },
      CREDIT_CARD: { color: 'bg-orange-100 text-orange-800', label: 'بطاقة ائتمان', icon: CreditCard },
      DEBIT_CARD: { color: 'bg-yellow-100 text-yellow-800', label: 'بطاقة خصم', icon: CreditCard }
    }

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.CASH
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'مكتمل', icon: CheckCircle },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'معلق', icon: Clock },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'فشل', icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const exportPayments = () => {
    // Create CSV content
    const headers = ['تاريخ الدفع', 'رقم الفاتورة', 'العميل', 'المبلغ', 'طريقة الدفع', 'الحالة', 'ملاحظات']
    const rows = payments.map(payment => [
      new Date(payment.paymentDate).toLocaleDateString('ar-EG'),
      payment.invoice.invoiceNumber,
      payment.invoice.customer.name,
      payment.amount.toString(),
      payment.paymentMethod,
      payment.status,
      payment.notes || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'نجاح',
      description: 'تم تصدير بيانات الدفعات بنجاح'
    })
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
          <h1 className="text-3xl font-bold">إدارة الدفعات</h1>
          <p className="text-gray-600 mt-2">إدارة وتتبع جميع الدفعات المسجلة في النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPayments}>
            <Download className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدفعات</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAmount.toFixed(2)} ج.م إجمالي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الدفعات النقدية</CardTitle>
              <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byMethod.CASH?.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(stats.byMethod.CASH?.amount || 0).toFixed(2)} ج.م
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التحويلات البنكية</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byMethod.BANK_TRANSFER?.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(stats.byMethod.BANK_TRANSFER?.amount || 0).toFixed(2)} ج.م
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الدفعات المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.COMPLETED?.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {(stats.byStatus.COMPLETED?.amount || 0).toFixed(2)} ج.م
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              البحث والتصفية
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'إخفاء' : 'عرض'} الفلاتر
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">بحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="ابحث عن فاتورة أو عميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="method">طريقة الدفع</Label>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الطرق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الطرق</SelectItem>
                    <SelectItem value="CASH">نقدي</SelectItem>
                    <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                    <SelectItem value="CHECK">شيك</SelectItem>
                    <SelectItem value="CREDIT_CARD">بطاقة ائتمان</SelectItem>
                    <SelectItem value="DEBIT_CARD">بطاقة خصم مباشر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    <SelectItem value="PENDING">معلق</SelectItem>
                    <SelectItem value="FAILED">فشل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">نطاق التاريخ</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="من"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="إلى"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الدفعات</CardTitle>
          <CardDescription>
            جميع الدفعات المسجلة في النظام ({payments.length} دفعة)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <Banknote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد دفعات</h3>
              <p className="text-gray-500">لم يتم العثور على دفعات تطابق معايير البحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">التاريخ</th>
                    <th className="text-right p-2">رقم الفاتورة</th>
                    <th className="text-right p-2">العميل</th>
                    <th className="text-right p-2">المبلغ</th>
                    <th className="text-right p-2">طريقة الدفع</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">ملاحظات</th>
                    <th className="text-right p-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(payment.paymentDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{payment.invoice.invoiceNumber}</span>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{payment.invoice.customer.name}</p>
                          <p className="text-xs text-gray-500">{payment.invoice.customer.email}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{payment.amount.toFixed(2)} ج.م</span>
                      </td>
                      <td className="p-2">
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {payment.notes || '-'}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/admin/finance/invoices/${payment.invoice.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}