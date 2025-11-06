'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  TrendingUp, 
  DollarSign, 
  Car, 
  Users, 
  Calendar,
  RefreshCw,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface MarketingMetrics {
  campaignsSent: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  leadsGenerated: number
  leadsConverted: number
  conversionRate: number
  costPerLead: number
  costPerAcquisition: number
  roi: number
}

interface SalesData {
  totalSales: number
  totalRevenue: number
  newCustomers: number
  conversionRate: number
  monthlyGrowth: {
    sales: number
    revenue: number
    customers: number
    conversion: number
  }
  totalCampaigns: number
  activeCampaigns: number
  totalLeads: number
  qualifiedLeads: number
  convertedLeads: number
  totalTargets: number
  achievedTargets: number
  revenueGenerated: number
  marketingMetrics?: MarketingMetrics | null
  period?: string
  startDate?: string
  endDate?: string
}

interface RecentSale {
  id: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  vehicle: {
    make: string
    model: string
    year: number
    price: number
  }
  invoice: {
    totalAmount: number
    issueDate: Date
    status: string
  }
  createdAt: Date
}

interface TopPerformer {
  employee: {
    name: string
    email: string
    role: string
  }
  salesCount: number
  totalRevenue: number
  conversionRate: number
  targetAchievement: number
}

interface SalesTarget {
  id: string
  employee: {
    name: string
  }
  target: number
  achieved: number
  period: string
  metric: string
}

export default function SalesPage() {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultMarketingMetrics: MarketingMetrics = {
    campaignsSent: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    leadsGenerated: 0,
    leadsConverted: 0,
    conversionRate: 0,
    costPerLead: 0,
    costPerAcquisition: 0,
    roi: 0
  }

  const buildDefaultSalesData = (): SalesData => ({
    totalSales: 0,
    totalRevenue: 0,
    newCustomers: 0,
    conversionRate: 0,
    monthlyGrowth: {
      sales: 0,
      revenue: 0,
      customers: 0,
      conversion: 0
    },
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    totalTargets: 0,
    achievedTargets: 0,
    revenueGenerated: 0,
    marketingMetrics: { ...defaultMarketingMetrics },
    period: 'month',
    startDate: undefined,
    endDate: undefined
  })

  const normalizeSalesData = (data: Partial<SalesData> | null | undefined): SalesData => {
    const base = buildDefaultSalesData()
    if (!data) {
      return base
    }

    return {
      ...base,
      ...data,
      monthlyGrowth: {
        ...base.monthlyGrowth,
        ...(data.monthlyGrowth || {})
      },
      marketingMetrics: {
        ...defaultMarketingMetrics,
        ...(data.marketingMetrics || {})
      }
    }
  }

  useEffect(() => {
    loadSalesData()
  }, [])

  const loadSalesData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load sales overview
      try {
        const overviewResponse = await fetch('/api/marketing-sales/stats')
        if (overviewResponse.ok) {
          const overviewData = await overviewResponse.json()
          setSalesData(normalizeSalesData(overviewData))
        } else {
          console.warn('Sales overview API returned error:', overviewResponse.status)
          setSalesData(buildDefaultSalesData())
        }
      } catch (error) {
        console.warn('Error loading sales overview:', error)
        setSalesData(buildDefaultSalesData())
      }

      // Load recent sales (from invoices)
      try {
        const invoicesResponse = await fetch('/api/finance/invoices?limit=10&sortBy=createdAt&order=desc')
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json()
          setRecentSales(invoicesData.invoices || [])
        } else {
          console.warn('Invoices API returned error:', invoicesResponse.status)
          setRecentSales([])
        }
      } catch (error) {
        console.warn('Error loading recent sales:', error)
        setRecentSales([])
      }

      // Load top performers (from marketing sales leads)
      try {
        const performersResponse = await fetch('/api/marketing-sales/leads?stats=true')
        if (performersResponse.ok) {
          const performersData = await performersResponse.json()
          setTopPerformers(performersData.topPerformers || [])
        } else {
          console.warn('Top performers API returned error:', performersResponse.status)
          setTopPerformers([])
        }
      } catch (error) {
        console.warn('Error loading top performers:', error)
        setTopPerformers([])
      }

      // Load sales targets
      try {
        const targetsResponse = await fetch('/api/marketing-sales/targets')
        if (targetsResponse.ok) {
          const targetsData = await targetsResponse.json()
          setSalesTargets(targetsData.targets || [])
        } else {
          console.warn('Sales targets API returned error:', targetsResponse.status)
          setSalesTargets([])
        }
      } catch (error) {
        console.warn('Error loading sales targets:', error)
        setSalesTargets([])
      }
    } catch (error) {
      console.error('Error loading sales data:', error)
      setError('فشل في تحميل بيانات المبيعات')
      // Set default values on error
      setSalesData(buildDefaultSalesData())
      setRecentSales([])
      setTopPerformers([])
      setSalesTargets([])
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ar-EG').format(value || 0)
  }

  const formatPercentage = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0
    return `${Math.round(safeValue * 10) / 10}%`
  }

  const formatDate = (date?: Date | string) => {
    if (!date) {
      return 'غير متوفر'
    }

    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) {
      return 'غير متوفر'
    }

    return parsed.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PAID': { variant: 'default' as const, label: 'مدفوع' },
      'PENDING': { variant: 'secondary' as const, label: 'قيد الانتظار' },
      'OVERDUE': { variant: 'destructive' as const, label: 'متأخر' },
      'CANCELLED': { variant: 'outline' as const, label: 'ملغي' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة المبيعات</h1>
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
          <h1 className="text-3xl font-bold">إدارة المبيعات</h1>
          <Button variant="outline" onClick={loadSalesData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة المبيعات</h1>
          <div className="flex gap-2">
            <Link href="/admin/marketing-sales">
              <Button variant="outline">
                <Target className="ml-2 h-4 w-4" />
                التسويق والمبيعات
              </Button>
            </Link>
            <Link href="/admin/finance/invoices">
              <Button variant="outline">
                <DollarSign className="ml-2 h-4 w-4" />
                الفواتير
              </Button>
            </Link>
            <Button variant="outline" onClick={loadSalesData}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {(() => {
          const resolved = salesData || buildDefaultSalesData()
          const marketing = resolved.marketingMetrics || defaultMarketingMetrics
          const periodRange = resolved.startDate && resolved.endDate
            ? `${formatDate(resolved.startDate)} - ${formatDate(resolved.endDate)}`
            : 'غير متوفر'
          const targetSummary = resolved.totalTargets > 0
            ? Math.round((resolved.achievedTargets / resolved.totalTargets) * 100)
            : 0

          return (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>ملخص الأداء التسويقي</CardTitle>
                      <CardDescription>
                        بيانات المبيعات والتسويق خلال الفترة {periodRange}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">الفترة: {resolved.period === 'today' ? 'اليوم' : resolved.period === 'week' ? 'الأسبوع' : resolved.period === 'month' ? 'الشهر' : resolved.period === 'quarter' ? 'الربع' : resolved.period === 'year' ? 'السنة' : resolved.period || 'غير محدد'}</Badge>
                      <Badge variant="outline">الإيراد من الحملات: {formatCurrency(resolved.revenueGenerated)}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[{
                      label: 'إجمالي الحملات',
                      value: formatNumber(resolved.totalCampaigns)
                    }, {
                      label: 'الحملات النشطة',
                      value: formatNumber(resolved.activeCampaigns)
                    }, {
                      label: 'إجمالي العملاء المحتملين',
                      value: formatNumber(resolved.totalLeads)
                    }, {
                      label: 'العملاء المؤهلون',
                      value: formatNumber(resolved.qualifiedLeads)
                    }, {
                      label: 'العملاء المحولون',
                      value: formatNumber(resolved.convertedLeads)
                    }, {
                      label: 'تحقيق الأهداف',
                      value: resolved.totalTargets > 0 ? `${targetSummary}% (${formatNumber(resolved.achievedTargets)}/${formatNumber(resolved.totalTargets)})` : 'لا توجد أهداف'
                    }].map((metric) => (
                      <div key={metric.label} className="rounded-lg border bg-muted/40 p-4 text-right">
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="mt-1 text-lg font-semibold">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>مؤشرات التسويق</CardTitle>
                  <CardDescription>
                    قياس تفاعل العملاء مع الحملات الرقمية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[{
                    label: 'البريد الإلكتروني المرسل',
                    value: formatNumber(marketing.emailsSent)
                  }, {
                    label: 'معدل الفتح',
                    value: formatPercentage(marketing.emailsSent ? (marketing.emailsOpened / marketing.emailsSent) * 100 : 0)
                  }, {
                    label: 'معدل النقر',
                    value: formatPercentage(marketing.emailsSent ? (marketing.emailsClicked / marketing.emailsSent) * 100 : 0)
                  }, {
                    label: 'التكلفة لكل عميل محتمل',
                    value: formatCurrency(marketing.costPerLead)
                  }, {
                    label: 'التكلفة لكل اكتساب',
                    value: formatCurrency(marketing.costPerAcquisition)
                  }, {
                    label: 'العائد على الاستثمار',
                    value: formatPercentage(marketing.roi)
                  }].map((metric) => (
                    <div key={metric.label} className="rounded-lg border p-3 text-right">
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="mt-1 text-lg font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )
        })()}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesData?.totalRevenue ? formatCurrency(salesData.totalRevenue) : formatCurrency(0)}
              </div>
              <p className={`text-xs flex items-center gap-1 ${getGrowthColor(salesData?.monthlyGrowth?.revenue || 0)}`}>
                {getGrowthIcon(salesData?.monthlyGrowth?.revenue || 0)}
                {formatPercentage(salesData?.monthlyGrowth?.revenue || 0)} من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">السيارات المباعة</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(salesData || buildDefaultSalesData()).totalSales}</div>
              <p className={`text-xs flex items-center gap-1 ${getGrowthColor(salesData?.monthlyGrowth?.sales || 0)}`}>
                {getGrowthIcon(salesData?.monthlyGrowth?.sales || 0)}
                {formatPercentage(salesData?.monthlyGrowth?.sales || 0)} من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء الجدد</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(salesData || buildDefaultSalesData()).newCustomers}</div>
              <p className={`text-xs flex items-center gap-1 ${getGrowthColor(salesData?.monthlyGrowth?.customers || 0)}`}>
                {getGrowthIcon(salesData?.monthlyGrowth?.customers || 0)}
                {formatPercentage(salesData?.monthlyGrowth?.customers || 0)} من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(salesData?.conversionRate || 0)}</div>
              <p className={`text-xs flex items-center gap-1 ${getGrowthColor(salesData?.monthlyGrowth?.conversion || 0)}`}>
                {getGrowthIcon(salesData?.monthlyGrowth?.conversion || 0)}
                {formatPercentage(salesData?.monthlyGrowth?.conversion || 0)} من الشهر الماضي
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أحدث المبيعات</CardTitle>
                  <CardDescription>
                    آخر عمليات البيع المكتملة
                  </CardDescription>
                </div>
                <Link href="/admin/finance/invoices">
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد مبيعات حديثة</p>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sale.customer?.name || 'عميل غير معروف'}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.vehicle?.make || ''} {sale.vehicle?.model || ''} {sale.vehicle?.year || ''}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{formatCurrency(sale.invoice?.totalAmount || 0)}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-xs text-muted-foreground">{formatDate(sale.invoice?.issueDate || new Date())}</p>
                          {getStatusBadge(sale.invoice?.status || 'PENDING')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أفضل المندوبين</CardTitle>
                  <CardDescription>
                    ترتيب مندوبي المبيعات هذا الشهر
                  </CardDescription>
                </div>
                <Link href="/admin/marketing-sales">
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض التفاصيل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {topPerformers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد بيانات أداء متاحة</p>
              ) : (
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.employee?.email || index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.employee?.name || 'مندوب غير معروف'}</p>
                          <p className="text-sm text-muted-foreground">
                            {performer.salesCount || 0} سيارات • {performer.conversionRate || 0}% تحويل
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{formatCurrency(performer.totalRevenue || 0)}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(performer.targetAchievement || 0)}% من الهدف
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales Targets */}
        {salesTargets.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أهداف المبيعات</CardTitle>
                  <CardDescription>
                    تقدم تحقيق أهداف المبيعات الحالية
                  </CardDescription>
                </div>
                <Link href="/admin/marketing-sales/targets">
                  <Button variant="outline" size="sm">
                    <Target className="ml-2 h-4 w-4" />
                    إدارة الأهداف
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesTargets.map((target) => {
                  const achievement = (target.achieved || 0) / (target.target || 1) * 100
                  return (
                    <div key={target.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{target.employee?.name || 'موظف غير معروف'}</p>
                          <p className="text-sm text-muted-foreground">
                            {target.achieved || 0} / {target.target || 1} {target.metric || ''}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              achievement >= 100 ? 'bg-green-600' : 
                              achievement >= 75 ? 'bg-blue-600' : 
                              achievement >= 50 ? 'bg-yellow-600' : 
                              'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(achievement, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-left">
                        <p className="font-medium">{Math.round(achievement)}%</p>
                        <p className="text-xs text-muted-foreground">{target?.period || 'غير محدد'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminRoute>
  )
}