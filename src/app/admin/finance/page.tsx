'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface FinanceOverview {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  invoiceStats: {
    total: number
    pending: number
    overdue: number
    paid: number
  }
  recentInvoices: Array<{
    id: string
    invoiceNumber: string
    customer: {
      name: string
    }
    totalAmount: number
    paidAmount: number
    status: string
    issueDate: string
  }>
  recentPayments: Array<{
    id: string
    invoice: {
      invoiceNumber: string
    }
    amount: number
    paymentMethod: string
    createdAt: string
  }>
  monthlySummary: Array<{
    category: string
    revenue: number
    expenses: number
    profit: number
    margin: number
  }>
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      
      // Fetch overview data
      const overviewResponse = await fetch('/api/finance/overview?period=month')
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        
        // Fetch recent invoices
        const invoicesResponse = await fetch('/api/finance/invoices?limit=4')
        const invoicesData = invoicesResponse.ok ? await invoicesResponse.json() : { invoices: [] }
        
        // Fetch recent payments
        const paymentsResponse = await fetch('/api/finance/payments?limit=4')
        const paymentsData = paymentsResponse.ok ? await paymentsResponse.json() : { payments: [] }
        
        // Calculate net profit and margin
        const totalRevenue = overviewData.totalRevenue || 0
        const totalExpenses = overviewData.totalExpenses || 0
        const netProfit = totalRevenue - totalExpenses
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        
        // Calculate invoice stats
        const invoiceStats = {
          total: overviewData.invoiceStats?.total || 0,
          pending: (overviewData.invoiceStats?.sent || 0) + (overviewData.invoiceStats?.partiallyPaid || 0),
          overdue: overviewData.invoiceStats?.overdue || 0,
          paid: overviewData.invoiceStats?.paid || 0
        }
        
        // Format recent invoices
        const recentInvoices = (invoicesData.invoices || []).map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customer: inv.customer || { name: 'غير محدد' },
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount || 0,
          status: inv.status,
          issueDate: inv.issueDate
        }))
        
        // Format recent payments
        const recentPayments = (paymentsData.payments || []).map((p: any) => ({
          id: p.id,
          invoice: p.invoicePayments?.[0]?.invoice || { invoiceNumber: 'غير محدد' },
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          createdAt: p.createdAt
        }))
        
        // Calculate monthly summary by category
        const revenueData = await fetch('/api/revenue').then(r => r.ok ? r.json() : { summary: null })
        const expensesData = await fetch('/api/expenses').then(r => r.ok ? r.json() : { summary: null })
        
        const monthlySummary: any[] = []
        if (revenueData.summary?.revenueBySource) {
          revenueData.summary.revenueBySource.forEach((source: any) => {
            const expenses = expensesData.summary?.expensesByCategory?.find((e: any) => e.category === source.source)
            const revenue = source.amount || 0
            const expensesAmount = expenses?.amount || 0
            const profit = revenue - expensesAmount
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0
            
            monthlySummary.push({
              category: source.source,
              revenue,
              expenses: expensesAmount,
              profit,
              margin
            })
          })
        }
        
        setData({
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          invoiceStats,
          recentInvoices,
          recentPayments,
          monthlySummary
        })
      } else {
        toast.error('فشل في تحميل بيانات المالية')
      }
    } catch (error) {
      console.error('Error fetching finance data:', error)
      toast.error('حدث خطأ أثناء تحميل بيانات المالية')
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

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PAID': 'مدفوعة',
      'SENT': 'معلقة',
      'PARTIALLY_PAID': 'مدفوعة جزئياً',
      'OVERDUE': 'متأخرة',
      'DRAFT': 'مسودة',
      'CANCELLED': 'ملغاة',
      'REFUNDED': 'مستردة'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    if (status === 'PAID') return 'bg-green-100 text-green-800'
    if (status === 'SENT' || status === 'PARTIALLY_PAID') return 'bg-yellow-100 text-yellow-800'
    if (status === 'OVERDUE') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'CASH': 'نقدي',
      'BANK_TRANSFER': 'تحويل بنكي',
      'CARD': 'بطاقة ائتمان',
      'CHECK': 'شيك'
    }
    return methodMap[method] || method
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الإدارة المالية</h1>
        <Button variant="outline" onClick={fetchFinanceData}>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? formatCurrency(data.totalRevenue) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.invoiceStats.pending : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              بانتظار الدفع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? data.invoiceStats.overdue : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              تحتاج للمتابعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data && data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data ? formatCurrency(data.netProfit) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data ? data.profitMargin.toFixed(1) : 0}% هامش ربح
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أحدث الفواتير</CardTitle>
            <CardDescription>
              آخر الفواتير الصادرة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data && data.recentInvoices.length > 0 ? (
                data.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: ar })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير مسجلة
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المدفوعات الأخيرة</CardTitle>
            <CardDescription>
              آخر المدفوعات المسجلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data && data.recentPayments.length > 0 ? (
                data.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{getPaymentMethodText(payment.paymentMethod)}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد مدفوعات مسجلة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ملخص مالي شهري</CardTitle>
          <CardDescription>
            نظرة عامة على الأداء المالي هذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data && data.monthlySummary.length > 0 ? (
              data.monthlySummary.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm text-muted-foreground">
                      إيرادات: {formatCurrency(item.revenue)} | مصروفات: {formatCurrency(item.expenses)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground">هامش: {item.margin.toFixed(1)}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات مالية لهذا الشهر
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
