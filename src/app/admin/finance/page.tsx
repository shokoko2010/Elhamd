'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { useAuth } from '@/hooks/use-auth'
import { PERMISSIONS } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
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
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Printer,
  Mail,
  MoreHorizontal,
  X,
  Smartphone,
  Banknote,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface FinancialOverview {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingInvoices: number
  overdueInvoices: number
  paidInvoices: number
  draftInvoices: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  type: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  currency: string
  items: InvoiceItem[]
  taxes: InvoiceTax[]
  payments: InvoicePayment[]
  notes?: string
  terms?: string
  createdAt: string
  updatedAt: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  metadata?: Record<string, any>
}

interface InvoiceTax {
  id: string
  taxType: string
  rate: number
  taxAmount: number
  description: string
}

interface InvoicePayment {
  id: string
  payment: {
    id: string
    amount: number
    paymentDate: string
    paymentMethod: string
    status: string
  }
}

interface Payment {
  id: string
  invoiceId?: string
  customerId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: string
  reference?: string
  notes?: string
  createdAt: string
}

export default function FinancePage() {
  return (
    <AdminRoute>
      <FinanceContent />
    </AdminRoute>
  )
}

function FinanceContent() {
  const { user, hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const { toast } = useToast()

  // Check permissions
  const canViewInvoices = hasPermission(PERMISSIONS.VIEW_INVOICES) || hasPermission(PERMISSIONS.VIEW_FINANCIALS)
  const canCreateInvoices = hasPermission(PERMISSIONS.CREATE_INVOICES)
  const canEditInvoices = hasPermission(PERMISSIONS.EDIT_INVOICES)
  const canDeleteInvoices = hasPermission(PERMISSIONS.DELETE_INVOICES)
  const canSendInvoices = hasPermission(PERMISSIONS.SEND_INVOICES)
  const canDownloadInvoices = hasPermission(PERMISSIONS.DOWNLOAD_INVOICES)
  const canManageQuotations = hasPermission(PERMISSIONS.MANAGE_QUOTATIONS)
  const canManagePayments = hasPermission(PERMISSIONS.MANAGE_PAYMENTS)
  const canViewPaymentHistory = hasPermission(PERMISSIONS.VIEW_PAYMENT_HISTORY)
  const canProcessOfflinePayments = hasPermission(PERMISSIONS.PROCESS_OFFLINE_PAYMENTS)
  const canViewFinancialOverview = hasPermission(PERMISSIONS.VIEW_FINANCIAL_OVERVIEW)
  const canAccessFinanceDashboard = hasPermission(PERMISSIONS.ACCESS_FINANCE_DASHBOARD)

  // Redirect if user doesn't have any finance permissions
  useEffect(() => {
    if (!canViewInvoices && !canManageQuotations && !canManagePayments && !canViewFinancialOverview) {
      toast({
        title: 'صلاحية غير كافية',
        description: 'ليس لديك صلاحية للوصول إلى القسم المالي',
        variant: 'destructive'
      })
      // Optionally redirect to dashboard
      window.location.href = '/admin'
    }
  }, [user, canViewInvoices, canManageQuotations, canManagePayments, canViewFinancialOverview, toast])

  // Handle tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['overview', 'invoices', 'quotations', 'payments', 'reports'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    fetchFinanceData()
  }, [dateRange])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      
      // Fetch overview data
      const overviewResponse = await fetch('/api/finance/overview')
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        setOverview(overviewData)
      }

      // Fetch invoices
      const invoicesResponse = await fetch('/api/finance/invoices')
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices || [])
      }

      // Fetch payments
      const paymentsResponse = await fetch('/api/payments/transactions')
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData.transactions || [])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات المالية',
        variant: 'destructive'
      })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      SENT: { label: 'مرسلة', variant: 'default' as const, icon: Mail },
      PAID: { label: 'مدفوعة', variant: 'default' as const, icon: CheckCircle },
      PARTIALLY_PAID: { label: 'مدفوعة جزئياً', variant: 'outline' as const, icon: Clock },
      OVERDUE: { label: 'متأخرة', variant: 'destructive' as const, icon: AlertCircle },
      CANCELLED: { label: 'ملغاة', variant: 'secondary' as const, icon: X },
      REFUNDED: { label: 'مستردة', variant: 'outline' as const, icon: CreditCard }
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

  const getPaymentMethodIcon = (method: string) => {
    const methodIcons = {
      CASH: CreditCard,
      BANK_TRANSFER: CreditCard,
      CREDIT_CARD: CreditCard,
      DEBIT_CARD: CreditCard,
      MOBILE_WALLET: CreditCard,
      FAWRY: CreditCard,
      PAYMOB: CreditCard
    }
    // @ts-ignore
    const Icon = methodIcons[method] || CreditCard
    return <Icon className="w-4 h-4" />
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const sendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إرسال الفاتورة بنجاح'
        })
        fetchFinanceData()
      } else {
        throw new Error('Failed to send invoice')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الفاتورة',
        variant: 'destructive'
      })
    }
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
          <h1 className="text-3xl font-bold">الإدارة المالية</h1>
          <p className="text-gray-600 mt-2">إدارة الفواتير والمدفوعات والتقارير المالية</p>
        </div>
        <div className="flex gap-2">
          {canCreateInvoices && (
            <Link href="/admin/finance/invoices/create">
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                فاتورة جديدة
              </Button>
            </Link>
          )}
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
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
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overview?.pendingInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">بانتظار الدفع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overview?.overdueInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">تحتاج للمتابعة</p>
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
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {canViewInvoices && <TabsTrigger value="invoices">الفواتير</TabsTrigger>}
          {canManageQuotations && <TabsTrigger value="quotations">عروض الأسعار</TabsTrigger>}
          {(canManagePayments || canViewPaymentHistory) && <TabsTrigger value="payments">المدفوعات</TabsTrigger>}
          {canViewFinancialOverview && <TabsTrigger value="reports">التقارير</TabsTrigger>}
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
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
                    placeholder="بحث في الفواتير..."
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
                    <SelectItem value="PAID">مدفوعة</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">مدفوعة جزئياً</SelectItem>
                    <SelectItem value="OVERDUE">متأخرة</SelectItem>
                    <SelectItem value="CANCELLED">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="SERVICE">خدمة</SelectItem>
                    <SelectItem value="PRODUCT">منتج</SelectItem>
                    <SelectItem value="SUBSCRIPTION">اشتراك</SelectItem>
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

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الفواتير</CardTitle>
                  <CardDescription>إدارة فواتير العملاء والموردين</CardDescription>
                </div>
                <Link href="/admin/finance/invoices/create">
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    فاتورة جديدة
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم الفاتورة</th>
                      <th className="text-right py-3 px-4">العميل</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">تاريخ الاستحقاق</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">المدفوع</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="text-right py-3 px-4 font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div>
                            <p className="font-medium">{invoice.customer.name}</p>
                            <p className="text-sm text-gray-500">{invoice.customer.email}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end">
                            <Calendar className="ml-2 h-4 w-4 text-gray-400" />
                            {formatDate(invoice.issueDate)}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end">
                            <Calendar className="ml-2 h-4 w-4 text-gray-400" />
                            {formatDate(invoice.dueDate)}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatCurrency(invoice.totalAmount)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(invoice.paidAmount)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => downloadInvoice(invoice.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/finance/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/finance/invoices/${invoice.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            {invoice.status === 'DRAFT' && (
                              <Button variant="ghost" size="sm" onClick={() => sendInvoice(invoice.id)}>
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
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

        {/* Quotations Tab */}
        <TabsContent value="quotations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>عروض الأسعار</CardTitle>
                  <CardDescription>إدارة عروض الأسعار والمبيعات والتحويل إلى فواتير</CardDescription>
                </div>
                <Link href="/admin/finance/quotations">
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    عرض سعر جديد
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  إدارة عروض الأسعار
                </h3>
                <p className="text-gray-500 mb-4">
                  قم بإنشاء وإدارة عروض الأسعار للعملاء وتتبع التحويلات إلى المبيعات
                </p>
                <Link href="/admin/finance/quotations">
                  <Button>
                    الذهاب إلى عروض الأسعار
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المدفوعات</CardTitle>
                  <CardDescription>تتبع جميع المدفوعات الواردة والصادرة</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href="/admin/finance/payments">
                    <Button variant="outline">
                      <Banknote className="ml-2 h-4 w-4" />
                      إدارة الدفعات
                    </Button>
                  </Link>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    تسجيل دفعة جديدة
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث في المدفوعات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">المرجع</th>
                      <th className="text-right py-3 px-4">العميل</th>
                      <th className="text-right py-3 px-4">طريقة الدفع</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="text-right py-3 px-4">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {payment.reference || '-'}
                        </td>
                        <td className="text-right py-3 px-4">
                          {/* Customer name would need to be fetched */}
                          عميل #{payment.customerId}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="ml-2">{payment.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">تقرير الإيرادات</CardTitle>
                <CardDescription>تحليل الإيرادات الشهرية والسنوية</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle className="text-lg">تقرير المصروفات</CardTitle>
                <CardDescription>تتبع المصروفات والتحكم في التكاليف</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">تقرير العملاء</CardTitle>
                <CardDescription>تحليل أداء العملاء والقيمة المضافة</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle className="text-lg">تقرير الضرائب</CardTitle>
                <CardDescription>حسابات الضرائب والإقرارات الضريبية</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle className="text-lg">تقرير الفواتير المتأخرة</CardTitle>
                <CardDescription>متابعة الفواتير غير المدفوعة</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Receipt className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle className="text-lg">تقرير المدفوعات</CardTitle>
                <CardDescription>تحليل أنماط الدفع والطرق المستخدمة</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}