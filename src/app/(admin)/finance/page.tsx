'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Building2,
  ArrowRightLeft,
  BarChart3,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface FinancialOverview {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingInvoices: number
  overdueInvoices: number
  paidInvoices: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  type: string
  status: string
  issueDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  currency: string
  branchId?: string
  branchName?: string
}

interface PayrollPayment {
  id: string
  amount: number
  paymentMethod: string
  transactionId?: string | null
  createdAt: string
  branch?: Branch | null
  payrollRecord?: {
    id: string
    period: string
    status: string
    payDate?: string | null
    employee?: {
      id: string
      user?: {
        id: string
        name: string | null
        email: string | null
      } | null
      branch?: Branch | null
    } | null
  } | null
}

export default function FinancePage() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [payrollPayments, setPayrollPayments] = useState<PayrollPayment[]>([])
  const [payrollLoading, setPayrollLoading] = useState(true)
  const [payrollPeriods, setPayrollPeriods] = useState<string[]>([])
  const [selectedPayrollPeriod, setSelectedPayrollPeriod] = useState<string>('')

  useEffect(() => {
    fetchFinancialData()
    fetchBranches()
  }, [selectedBranch])

  useEffect(() => {
    fetchPayrollPayments()
  }, [selectedBranch, selectedPayrollPeriod])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches)
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchFinancialData = async () => {
    try {
      // Fetch overview data
      const overviewParams = selectedBranch ? `?branchId=${selectedBranch}` : ''
      const overviewResponse = await fetch(`/api/finance/overview${overviewParams}`)
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        setOverview(overviewData)
      }

      // Fetch invoices
      const invoicesParams = selectedBranch ? `?branchId=${selectedBranch}` : ''
      const invoicesResponse = await fetch(`/api/finance/invoices${invoicesParams}`)
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayrollPayments = async () => {
    setPayrollLoading(true)

    try {
      const baseParams = new URLSearchParams()
      baseParams.set('type', 'PAYROLL')
      if (selectedBranch) {
        baseParams.set('branchId', selectedBranch)
      }

      const baseResponse = await fetch(`/api/finance/payments?${baseParams.toString()}`)
      let baseData: PayrollPayment[] = []

      if (baseResponse.ok) {
        const baseJson = await baseResponse.json()
        baseData = (baseJson.payments || []) as PayrollPayment[]

        const periods = Array.from(
          new Set(
            baseData
              .map((payment) => payment.payrollRecord?.period)
              .filter((period): period is string => Boolean(period))
          )
        ).sort((a, b) => b.localeCompare(a))

        setPayrollPeriods(periods)
      } else {
        setPayrollPeriods([])
      }

      let paymentsToDisplay = baseData

      if (selectedPayrollPeriod) {
        const filteredParams = new URLSearchParams(baseParams)
        filteredParams.set('payrollPeriod', selectedPayrollPeriod)

        const filteredResponse = await fetch(`/api/finance/payments?${filteredParams.toString()}`)
        if (filteredResponse.ok) {
          const filteredJson = await filteredResponse.json()
          paymentsToDisplay = (filteredJson.payments || []) as PayrollPayment[]
        } else {
          paymentsToDisplay = []
        }
      }

      setPayrollPayments(paymentsToDisplay)
    } catch (error) {
      console.error('Error fetching payroll payments:', error)
      setPayrollPayments([])
    } finally {
      setPayrollLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'غير محدد'
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', variant: 'secondary' as const },
      SENT: { label: 'مرسلة', variant: 'default' as const },
      PAID: { label: 'مدفوعة', variant: 'default' as const },
      PARTIALLY_PAID: { label: 'مدفوعة جزئياً', variant: 'outline' as const },
      OVERDUE: { label: 'متأخرة', variant: 'destructive' as const },
      CANCELLED: { label: 'ملغاة', variant: 'secondary' as const },
      REFUNDED: { label: 'مستردة', variant: 'outline' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPayrollStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'قيد الانتظار', variant: 'secondary' as const },
      PROCESSED: { label: 'قيد المعالجة', variant: 'outline' as const },
      APPROVED: { label: 'معتمدة', variant: 'default' as const },
      PAID: { label: 'مدفوعة', variant: 'default' as const },
      CANCELLED: { label: 'ملغاة', variant: 'destructive' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const totalPayrollAmount = payrollPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الإدارة المالية</h1>
          <p className="text-gray-600">إدارة الفواتير والمدفوعات والتقارير المالية</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="payroll-payments">مدفوعات الرواتب</TabsTrigger>
          <TabsTrigger value="consolidated">تقارير موحدة</TabsTrigger>
          <TabsTrigger value="transfers">التحويلات</TabsTrigger>
        </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Branch Filter */}
            <Card>
              <CardHeader>
                <CardTitle>فلتر الفرع</CardTitle>
                <CardDescription>اختر الفرع لعرض البيانات المالية الخاصة به</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الفروع</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedBranch('')}>
                    إعادة تعيين
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {overview ? formatCurrency(overview.totalRevenue) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">الشهر الحالي</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {overview ? formatCurrency(overview.totalExpenses) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">الشهر الحالي</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {overview ? formatCurrency(overview.netProfit) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">الشهر الحالي</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">فواتير معلقة</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {overview?.pendingInvoices || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">بانتظار الدفع</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
                <CardDescription>الوصول السريع إلى الوظائف المالية الشائعة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/finance/invoices/create">
                    <Button className="w-full" variant="default">
                      <Plus className="ml-2 h-4 w-4" />
                      إنشاء فاتورة جديدة
                    </Button>
                  </Link>
                  <Link href="/admin/finance/consolidated">
                    <Button className="w-full" variant="outline">
                      <BarChart3 className="ml-2 h-4 w-4" />
                      تقارير موحدة
                    </Button>
                  </Link>
                  <Link href="/admin/finance/transfers">
                    <Button className="w-full" variant="outline">
                      <ArrowRightLeft className="ml-2 h-4 w-4" />
                      التحويلات بين الفروع
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>الفواتير</CardTitle>
                    <CardDescription>إدارة فواتير العملاء والموردين</CardDescription>
                  </div>
                  <Link href="/finance/invoices/create">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      فاتورة جديدة
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="بحث في الفواتير..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="ml-2 h-4 w-4" />
                    تصفية
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">رقم الفاتورة</th>
                        <th className="text-right py-3 px-4">العميل</th>
                        <th className="text-right py-3 px-4">التاريخ</th>
                        <th className="text-right py-3 px-4">تاريخ الاستحقاق</th>
                        <th className="text-right py-3 px-4">المبلغ</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                          <td className="text-right py-3 px-4">{invoice.customerName}</td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center">
                              <Calendar className="ml-2 h-4 w-4 text-gray-400" />
                              {new Date(invoice.issueDate).toLocaleDateString('ar-EG')}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center">
                              <Calendar className="ml-2 h-4 w-4 text-gray-400" />
                              {new Date(invoice.dueDate).toLocaleDateString('ar-EG')}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(invoice.totalAmount)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
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

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المدفوعات</CardTitle>
                <CardDescription>تتبع جميع المدفوعات الواردة والصادرة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                  <p className="text-gray-500 mb-4">نحن نعمل على تطوير نظام إدارة المدفوعات</p>
                  <Button variant="outline">تعلم المزيد</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Payments Tab */}
          <TabsContent value="payroll-payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>مدفوعات الرواتب</CardTitle>
                <CardDescription>متابعة المدفوعات المرتبطة بسجلات الرواتب المعتمدة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اختر الفرع</label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الفروع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الفروع</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">دفعة الرواتب</label>
                    <Select value={selectedPayrollPeriod} onValueChange={setSelectedPayrollPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الدفعات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الدفعات</SelectItem>
                        {payrollPeriods.map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedBranch('')
                        setSelectedPayrollPeriod('')
                      }}
                    >
                      إعادة تعيين المرشحات
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>ملخص المدفوعات</CardTitle>
                    <CardDescription>إجمالي مدفوعات الرواتب خلال الفترة المحددة</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse text-right">
                    <div>
                      <div className="text-sm text-gray-500">إجمالي المدفوع</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPayrollAmount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">عدد السجلات</div>
                      <div className="text-2xl font-bold">{payrollPayments.length}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payrollLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : payrollPayments.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مدفوعات رواتب مسجلة</h3>
                    <p className="text-gray-500">قم بتحديد فترة أو فرع آخر لعرض بيانات مختلفة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payrollPayments.map((payment) => {
                      const employeeName = payment.payrollRecord?.employee?.user?.name || 'موظف غير معروف'
                      const employeeBranch = payment.payrollRecord?.employee?.branch?.name
                      const period = payment.payrollRecord?.period || 'غير محدد'
                      const paymentDate = payment.payrollRecord?.payDate || payment.createdAt

                      return (
                        <div key={payment.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{employeeName}</h3>
                              <p className="text-sm text-gray-500">
                                {employeeBranch ? `فرع ${employeeBranch}` : 'فرع غير محدد'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">صافي الدفعة</div>
                              <div className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>الفترة: {period}</span>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>تاريخ الدفع: {formatDate(paymentDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span>طريقة الدفع: {payment.paymentMethod}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {getPayrollStatusBadge(payment.payrollRecord?.status || 'PENDING')}
                            <Badge variant="outline">
                              رقم المعاملة: {payment.transactionId || 'غير متوفر'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consolidated Reports Tab */}
          <TabsContent value="consolidated" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التقارير المالية الموحدة</CardTitle>
                <CardDescription>تحليل شامل للأداء المالي لجميع الفروع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/admin/finance/consolidated">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                        <CardTitle className="text-lg">تقرير موحد</CardTitle>
                        <CardDescription>تقرير شامل لجميع الفروع</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Building2 className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle className="text-lg">مقارنة الفروع</CardTitle>
                      <CardDescription>مقارنة أداء الفروع المختلفة</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle className="text-lg">اتجاهات الأداء</CardTitle>
                      <CardDescription>تحليل الاتجاهات المالية</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التحويلات بين الفروع</CardTitle>
                <CardDescription>إدارة التحويلات المالية بين فروع الشركة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/admin/finance/transfers">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <ArrowRightLeft className="h-8 w-8 text-orange-600 mb-2" />
                        <CardTitle className="text-lg">إدارة التحويلات</CardTitle>
                        <CardDescription>إنشاء ومتابعة التحويلات</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                      <CardTitle className="text-lg">التحويلات المعلقة</CardTitle>
                      <CardDescription>التحويلات التي تنتظر الموافقة</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle className="text-lg">التحويلات المكتملة</CardTitle>
                      <CardDescription>التحويلات التي تم تنفيذها</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}