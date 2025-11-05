'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  Download,
  Calendar,
  Target,
  Activity,
  FileText,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react'

interface ReportData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalCustomers: number
  newCustomers: number
  totalLeads: number
  convertedLeads: number
  conversionRate: number
  totalTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  totalCampaigns: number
  activeCampaigns: number
  campaignROI: number
  inventoryValue: number
  lowStockItems: number
  topSellingProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
  topPerformers: Array<{
    id: string
    name: string
    role: string
    revenue: number
    customers: number
    satisfaction: number
  }>
}

interface FinancialMetric {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface CustomerMetric {
  month: string
  newCustomers: number
  totalCustomers: number
  retention: number
}

const TAB_KEYS = ['overview', 'financial', 'customers', 'operations', 'marketing'] as const
type TabKey = (typeof TAB_KEYS)[number]

const DEFAULT_TAB: TabKey = 'overview'

const isValidTab = (value: string | null): value is TabKey => {
  return typeof value === 'string' && TAB_KEYS.includes(value as TabKey)
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    isValidTab(tabParam) ? tabParam : DEFAULT_TAB
  )
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([])
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [branchFilter, setBranchFilter] = useState('all')

  useEffect(() => {
    const nextTab = isValidTab(tabParam) ? tabParam : DEFAULT_TAB
    if (nextTab !== activeTab) {
      setActiveTab(nextTab)
    }
  }, [tabParam, activeTab])

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
    
    if (status === 'authenticated') {
      fetchReportData()
    }
  }, [status, dateRange, branchFilter])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch overview data
      const overviewRes = await fetch(`/api/reports/overview?period=${dateRange}&branchId=${branchFilter}`)
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        setReportData(overviewData)
      }

      // Fetch financial metrics
      const financialRes = await fetch(`/api/reports/financial?period=${dateRange}&branchId=${branchFilter}`)
      if (financialRes.ok) {
        const financialData = await financialRes.json()
        setFinancialMetrics(financialData)
      }

      // Fetch customer metrics
      const customerRes = await fetch(`/api/reports/customers?period=${dateRange}&branchId=${branchFilter}`)
      if (customerRes.ok) {
        const customerData = await customerRes.json()
        setCustomerMetrics(customerData)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    const nextTab = isValidTab(value) ? value : DEFAULT_TAB
    setActiveTab(nextTab)

    const params = new URLSearchParams(searchParams.toString())
    if (nextTab === DEFAULT_TAB) {
      params.delete('tab')
    } else {
      params.set('tab', nextTab)
    }

    const queryString = params.toString()
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام التقارير المتقدمة</h1>
          <p className="text-muted-foreground">تحليلات شاملة وتقارير مفصلة عن أداء النظام</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذه السنة</SelectItem>
            </SelectContent>
          </Select>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفروع</SelectItem>
              <SelectItem value="branch1">الفرع الرئيسي</SelectItem>
              <SelectItem value="branch2">فرع القاهرة</SelectItem>
              <SelectItem value="branch3">فرع الإسكندرية</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchReportData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button>
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.totalRevenue.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-xs text-muted-foreground">
                +12.5% عن الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء الجدد</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.newCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% عن الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {reportData.convertedLeads} من {reportData.totalLeads} عميل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.netProfit.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-xs text-muted-foreground">
                +15.3% عن الشهر الماضي
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="financial">مالية</TabsTrigger>
          <TabsTrigger value="customers">عملاء</TabsTrigger>
          <TabsTrigger value="operations">عمليات</TabsTrigger>
          <TabsTrigger value="marketing">تسويق</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  نظرة مالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                      <p className="text-2xl font-bold">
                        {reportData?.totalRevenue.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                      <p className="text-2xl font-bold">
                        {reportData?.totalExpenses.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">صافي الربح</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData?.netProfit.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">هامش الربح</p>
                      <p className="text-2xl font-bold">
                        {reportData ? ((reportData.netProfit / reportData.totalRevenue) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  نظرة العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                      <p className="text-2xl font-bold">{reportData?.totalCustomers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">عملاء جدد</p>
                      <p className="text-2xl font-bold">{reportData?.newCustomers}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">العملاء المحتملون</p>
                      <p className="text-2xl font-bold">{reportData?.totalLeads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">معدل التحويل</p>
                      <p className="text-2xl font-bold">{reportData?.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operations Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  نظرة العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">تذاكر الدعم</p>
                      <p className="text-2xl font-bold">{reportData?.totalTickets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تم حلها</p>
                      <p className="text-2xl font-bold">{reportData?.resolvedTickets}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">متوسط وقت الحل</p>
                      <p className="text-2xl font-bold">{reportData?.avgResolutionTime}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">عناصر منخفضة المخزون</p>
                      <p className="text-2xl font-bold">{reportData?.lowStockItems}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  نظرة التسويق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">الحملات التسويقية</p>
                      <p className="text-2xl font-bold">{reportData?.totalCampaigns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حملات نشطة</p>
                      <p className="text-2xl font-bold">{reportData?.activeCampaigns}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">العائد على الاستثمار</p>
                      <p className="text-2xl font-bold">{reportData?.campaignROI.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                      <p className="text-2xl font-bold">
                        {reportData?.inventoryValue.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل الموظفين أداءً</CardTitle>
              <CardDescription>الموظفين الأكثر تحقيقاً للنتائج</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>المنصب</TableHead>
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>العملاء</TableHead>
                    <TableHead>رضا العملاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.topPerformers.map((performer) => (
                    <TableRow key={performer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {performer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {performer.name}
                        </div>
                      </TableCell>
                      <TableCell>{performer.role}</TableCell>
                      <TableCell>
                        {performer.revenue.toLocaleString('ar-EG')} ج.م
                      </TableCell>
                      <TableCell>{performer.customers}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{performer.satisfaction.toFixed(1)}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
              <CardDescription>المنتجات الأكثر طلباً من قبل العملاء</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية المباعة</TableHead>
                    <TableHead>الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.topSellingProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        {product.revenue.toLocaleString('ar-EG')} ج.م
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التقارير المالية</CardTitle>
              <CardDescription>تحليل مفصل للأداء المالي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Financial Metrics Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">إجمالي الإيرادات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reportData?.totalRevenue.toLocaleString('ar-EG')} ج.م
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">إجمالي المصروفات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reportData?.totalExpenses.toLocaleString('ar-EG')} ج.م
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">صافي الربح</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {reportData?.netProfit.toLocaleString('ar-EG')} ج.م
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>الاتجاهات المالية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financialMetrics.map((metric) => (
                        <div key={metric.month} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{metric.month}</p>
                            <p className="text-sm text-muted-foreground">
                              الإيرادات: {metric.revenue.toLocaleString('ar-EG')} ج.م
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              المصروفات: {metric.expenses.toLocaleString('ar-EG')} ج.م
                            </p>
                            <p className="font-medium text-green-600">
                              الربح: {metric.profit.toLocaleString('ar-EG')} ج.م
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير العملاء</CardTitle>
              <CardDescription>تحليل شامل لبيانات العملاء وسلوكهم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Customer Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">إجمالي العملاء</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData?.totalCustomers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">عملاء جدد</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData?.newCustomers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">العملاء المحتملون</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData?.totalLeads}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">معدل التحويل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData?.conversionRate.toFixed(1)}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>اتجاهات العملاء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerMetrics.map((metric) => (
                        <div key={metric.month} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{metric.month}</p>
                            <p className="text-sm text-muted-foreground">
                              عملاء جدد: {metric.newCustomers}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              إجمالي العملاء: {metric.totalCustomers}
                            </p>
                            <p className="font-medium text-blue-600">
                              معدل الاحتفاظ: {metric.retention.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير العمليات</CardTitle>
              <CardDescription>تحليل أداء العمليات اليومية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">خدمة العملاء</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">تذاكر الدعم</p>
                      <p className="text-2xl font-bold">{reportData?.totalTickets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تم حلها</p>
                      <p className="text-2xl font-bold">{reportData?.resolvedTickets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">متوسط وقت الحل</p>
                      <p className="text-2xl font-bold">{reportData?.avgResolutionTime}h</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">المخزون</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                      <p className="text-2xl font-bold">
                        {reportData?.inventoryValue.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">عناصر منخفضة</p>
                      <p className="text-2xl font-bold text-red-600">{reportData?.lowStockItems}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">الكفاءة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">معدل الإنجاز</p>
                      <p className="text-2xl font-bold">87.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">وقت الاستجابة</p>
                      <p className="text-2xl font-bold">2.3h</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير التسويق</CardTitle>
              <CardDescription>تحليل أداء الحملات التسويقية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">الحملات التسويقية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الحملات</p>
                      <p className="text-2xl font-bold">{reportData?.totalCampaigns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حملات نشطة</p>
                      <p className="text-2xl font-bold">{reportData?.activeCampaigns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">العائد على الاستثمار</p>
                      <p className="text-2xl font-bold">{reportData?.campaignROI.toFixed(1)}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">العملاء المحتملون</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي العملاء المحتملين</p>
                      <p className="text-2xl font-bold">{reportData?.totalLeads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تم تحويلهم</p>
                      <p className="text-2xl font-bold">{reportData?.convertedLeads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">معدل التحويل</p>
                      <p className="text-2xl font-bold">{reportData?.conversionRate.toFixed(1)}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">الأداء</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">تكلفة العميل المحتمل</p>
                      <p className="text-2xl font-bold">45 ج.م</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تكلفة الاكتساب</p>
                      <p className="text-2xl font-bold">125 ج.م</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">قيمة العميل</p>
                      <p className="text-2xl font-bold">2,450 ج.م</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}