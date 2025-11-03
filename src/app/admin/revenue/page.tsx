'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Car, Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface BranchOption {
  id: string
  name: string
  code: string
}

interface RevenueOverview {
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    totalOutstanding: number
  }
}

interface RevenueReport {
  byServiceType: Array<{
    name: string
    amount: number
    count: number
    percentage: number
  }>
  byPaymentMethod: Array<{
    method: string
    amount: number
    count: number
    percentage: number
  }>
  byMonth: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

const TIME_RANGES = [
  { value: 'week', label: 'أسبوع' },
  { value: 'month', label: 'شهر' },
  { value: 'quarter', label: 'ربع سنوي' },
  { value: 'year', label: 'سنة' }
]

const formatCurrency = (amount: number, currency = 'EGP') => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency
  }).format(amount || 0)
}

export default function RevenuePage() {
  const [overview, setOverview] = useState<RevenueOverview | null>(null)
  const [report, setReport] = useState<RevenueReport | null>(null)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ timeRange: 'month', branchId: '' })

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    fetchRevenueData()
  }, [filters])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const branchParam = filters.branchId ? `?branchId=${filters.branchId}` : ''
      const [overviewRes, reportRes] = await Promise.all([
        fetch(`/api/finance/overview${branchParam}`),
        fetch(`/api/reports/revenue?timeRange=${filters.timeRange}`)
      ])

      if (!overviewRes.ok) {
        throw new Error('فشل في تحميل نظرة الإيرادات')
      }
      if (!reportRes.ok) {
        throw new Error('فشل في تحميل تقرير الإيرادات')
      }

      const overviewData = await overviewRes.json()
      const reportData = await reportRes.json()
      setOverview(overviewData)
      setReport(reportData)
    } catch (error) {
      console.error('Error loading revenue data:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل بيانات الإيرادات')
      setOverview(null)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const serviceHighlights = useMemo(() => {
    return report?.byServiceType?.slice(0, 5) ?? []
  }, [report])

  const monthlyTrend = report?.byMonth ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totals = overview?.summary ?? {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOutstanding: 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقارير الإيرادات</h1>
          <p className="text-muted-foreground">تحليل مصادر الإيرادات والربحية وفق الفترات الزمنية.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchRevenueData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث البيانات
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تصفية البيانات</CardTitle>
          <CardDescription>اختر الفترة الزمنية والفرع لتحليل أدق.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>الفترة الزمنية</Label>
              <Select
                value={filters.timeRange}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, timeRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الفرع</Label>
              <Select
                value={filters.branchId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, branchId: value }))}
              >
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
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ timeRange: 'month', branchId: '' })}>
                إعادة التعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">إجمالي الإيرادات للفترة المحددة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.netProfit)}</div>
            <p className="text-xs text-muted-foreground">بعد خصم المصروفات المرتبطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مصادر الخدمات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceHighlights.length}</div>
            <p className="text-xs text-muted-foreground">أكثر الخدمات مساهمة في الإيراد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات السيارات</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                serviceHighlights
                  .filter((service) => service.name.includes('سيارات'))
                  .reduce((sum, service) => sum + service.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي إيرادات من فئات السيارات</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الإيرادات حسب نوع الخدمة</CardTitle>
            <CardDescription>أهم مصادر الإيرادات خلال الفترة المحددة.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceHighlights.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.count} عملية</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{formatCurrency(service.amount)}</p>
                    <p className="text-xs text-muted-foreground">{service.percentage.toFixed(1)}% من الإجمالي</p>
                  </div>
                </div>
              ))}
              {serviceHighlights.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  لا توجد بيانات خدمة للفترة المحددة
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الإيرادات حسب طريقة الدفع</CardTitle>
            <CardDescription>تحليل طرق الدفع الأكثر استخداماً.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>المعاملات</TableHead>
                  <TableHead className="text-right">الإيراد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report?.byPaymentMethod?.map((method) => (
                  <TableRow key={method.method}>
                    <TableCell>{method.method}</TableCell>
                    <TableCell>{method.count}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(method.amount)} ({method.percentage.toFixed(1)}%)
                    </TableCell>
                  </TableRow>
                ))}
                {(report?.byPaymentMethod?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      لا توجد بيانات طرق دفع متاحة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الاتجاه الشهري للإيرادات</CardTitle>
          <CardDescription>مقارنة الإيرادات بالمصروفات والأرباح خلال آخر أشهر.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الشهر</TableHead>
                <TableHead>الإيرادات</TableHead>
                <TableHead>المصروفات</TableHead>
                <TableHead>الربح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyTrend.map((month) => (
                <TableRow key={month.month}>
                  <TableCell>{month.month}</TableCell>
                  <TableCell>{formatCurrency(month.revenue)}</TableCell>
                  <TableCell>{formatCurrency(month.expenses)}</TableCell>
                  <TableCell className={month.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(month.profit)}
                  </TableCell>
                </TableRow>
              ))}
              {monthlyTrend.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لا توجد بيانات اتجاه شهري متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
