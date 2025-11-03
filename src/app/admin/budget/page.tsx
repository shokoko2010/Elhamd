'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface BranchOption {
  id: string
  name: string
  code: string
}

interface BranchBudget {
  id: string
  branch: {
    id: string
    name: string
    code: string
  }
  year: number
  quarter?: number | null
  month?: number | null
  category: string
  allocated: number
  spent: number
  remaining: number
  currency: string
  status: string
  description?: string | null
  updatedAt: string
}

interface BudgetAlert {
  id: string
  branchName: string
  branchCode: string
  category: string
  usagePercentage: number
  alertType: 'WARNING' | 'CRITICAL' | 'EXCEEDED'
  allocated: number
  spent: number
  remaining: number
  year: number
  quarter?: number | null
  month?: number | null
  alertMessage: string
  currency: string
}

interface AlertSummary {
  totalAlerts: number
  warningAlerts: number
  criticalAlerts: number
  exceededAlerts: number
  branchesWithAlerts: number
  totalOverBudget: number
}

interface AlertsResponse {
  alerts: BudgetAlert[]
  summary: AlertSummary
  thresholds: {
    warning: number
    critical: number
  }
}

interface BudgetFilters {
  year: string
  branchId: string
  period: 'all' | 'annual' | 'quarter' | 'month'
}

interface BudgetFormState {
  branchId: string
  year: string
  quarter: string
  month: string
  category: string
  allocated: string
  description: string
}

const CATEGORIES = [
  'المبيعات',
  'التسويق',
  'الصيانة',
  'الموارد البشرية',
  'العمليات',
  'الخدمات',
  'تقنية المعلومات',
  'أخرى'
]

const currentYear = new Date().getFullYear()

const defaultFilters: BudgetFilters = {
  year: currentYear.toString(),
  branchId: '',
  period: 'all'
}

const defaultFormState: BudgetFormState = {
  branchId: '',
  year: currentYear.toString(),
  quarter: '',
  month: '',
  category: '',
  allocated: '',
  description: ''
}

const formatCurrency = (amount: number, currency = 'EGP') => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency
  }).format(amount || 0)
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BranchBudget[]>([])
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState<BudgetFilters>(defaultFilters)
  const [formState, setFormState] = useState<BudgetFormState>(defaultFormState)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    fetchBudgets()
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

  const buildBudgetParams = () => {
    const params = new URLSearchParams()
    if (filters.year) params.set('year', filters.year)
    if (filters.branchId) params.set('branchId', filters.branchId)
    const now = new Date()
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3)
    if (filters.period === 'quarter') params.set('quarter', currentQuarter.toString())
    if (filters.period === 'month') params.set('month', (now.getMonth() + 1).toString())
    return params.toString()
  }

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const params = buildBudgetParams()
      const [budgetsRes, alertsRes] = await Promise.all([
        fetch(`/api/branches/budgets${params ? `?${params}` : ''}`),
        fetch(`/api/branches/budgets/alerts${filters.branchId ? `?branchId=${filters.branchId}` : ''}`)
      ])

      if (!budgetsRes.ok) {
        throw new Error('فشل في تحميل بيانات الميزانية')
      }

      const budgetsData: BranchBudget[] = await budgetsRes.json()
      setBudgets(budgetsData)

      if (alertsRes.ok) {
        const alertsData: AlertsResponse = await alertsRes.json()
        setAlerts(alertsData)
      } else {
        setAlerts(null)
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل بيانات الميزانية')
      setBudgets([])
      setAlerts(null)
    } finally {
      setLoading(false)
    }
  }

  const totals = useMemo(() => {
    return budgets.reduce(
      (acc, budget) => {
        return {
          allocated: acc.allocated + budget.allocated,
          spent: acc.spent + budget.spent,
          remaining: acc.remaining + budget.remaining
        }
      },
      { allocated: 0, spent: 0, remaining: 0 }
    )
  }, [budgets])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.branchId || !formState.category || !formState.allocated) {
      toast.error('يرجى تعبئة جميع الحقول الإلزامية')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/branches/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: formState.branchId,
          year: parseInt(formState.year, 10),
          quarter: formState.quarter ? parseInt(formState.quarter, 10) : undefined,
          month: formState.month ? parseInt(formState.month, 10) : undefined,
          category: formState.category,
          allocated: parseFloat(formState.allocated),
          description: formState.description || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'فشل في إنشاء الميزانية' }))
        throw new Error(error.error || 'فشل في إنشاء الميزانية')
      }

      toast.success('تم إنشاء الميزانية بنجاح')
      setDialogOpen(false)
      setFormState(defaultFormState)
      fetchBudgets()
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء الميزانية')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormState(defaultFormState)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الميزانية</h1>
          <p className="text-muted-foreground">تتبع الميزانيات المعتمدة، المصروفات، والتنبيهات لكل قسم.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchBudgets}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث البيانات
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                إضافة ميزانية
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء ميزانية جديدة</DialogTitle>
                <DialogDescription>
                  قم بتخصيص ميزانية لقسم أو فترة معينة مع تحديد المبلغ والفرع.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget-branch">الفرع</Label>
                    <Select
                      value={formState.branchId}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, branchId: value }))}
                    >
                      <SelectTrigger id="budget-branch">
                        <SelectValue placeholder="اختر الفرع" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-year">السنة</Label>
                    <Input
                      id="budget-year"
                      type="number"
                      min="2000"
                      value={formState.year}
                      onChange={(event) => setFormState((prev) => ({ ...prev, year: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-quarter">الربع</Label>
                    <Select
                      value={formState.quarter}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, quarter: value, month: '' }))}
                    >
                      <SelectTrigger id="budget-quarter">
                        <SelectValue placeholder="اختياري" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون</SelectItem>
                        {[1, 2, 3, 4].map((quarter) => (
                          <SelectItem key={quarter} value={quarter.toString()}>
                            الربع {quarter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-month">الشهر</Label>
                    <Select
                      value={formState.month}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, month: value, quarter: '' }))}
                    >
                      <SelectTrigger id="budget-month">
                        <SelectValue placeholder="اختياري" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون</SelectItem>
                        {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            شهر {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="budget-category">الفئة</Label>
                    <Select
                      value={formState.category}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="budget-category">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-allocated">المبلغ المخصص</Label>
                    <Input
                      id="budget-allocated"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.allocated}
                      onChange={(event) => setFormState((prev) => ({ ...prev, allocated: event.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="budget-description">الوصف</Label>
                    <Textarea
                      id="budget-description"
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="تفاصيل إضافية حول الميزانية"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'جاري الحفظ...' : 'حفظ الميزانية'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تصفية الميزانيات</CardTitle>
          <CardDescription>اختر السنة والفرع ونطاق الفترة لعرض البيانات.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>السنة</Label>
              <Input
                type="number"
                min="2000"
                value={filters.year}
                onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>الفرع</Label>
              <Select value={filters.branchId} onValueChange={(value) => setFilters((prev) => ({ ...prev, branchId: value }))}>
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
            <div className="space-y-2">
              <Label>النطاق الزمني</Label>
              <Select value={filters.period} onValueChange={(value: BudgetFilters['period']) => setFilters((prev) => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كامل السنة</SelectItem>
                  <SelectItem value="annual">سنة كاملة</SelectItem>
                  <SelectItem value="quarter">ربع سنوي حالي</SelectItem>
                  <SelectItem value="month">شهر حالي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                إعادة التعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الميزانية الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.allocated)}</div>
            <p className="text-xs text-muted-foreground">إجمالي المبالغ المعتمدة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.spent)}</div>
            <p className="text-xs text-muted-foreground">إجمالي ما تم صرفه حتى الآن</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.remaining)}</div>
            <p className="text-xs text-muted-foreground">المبلغ المتاح للإنفاق</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تنبيهات</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.summary.totalAlerts ?? 0}</div>
            <p className="text-xs text-muted-foreground">الميزانيات التي تحتاج المتابعة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الميزانيات التفصيلية</CardTitle>
          <CardDescription>عرض الميزانيات المعتمدة بحسب الفرع والفترة.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الفرع</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المخصص</TableHead>
                <TableHead>المصروف</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.branch.name} ({budget.branch.code})</TableCell>
                  <TableCell>
                    {budget.month ? `شهر ${budget.month}` : budget.quarter ? `ربع ${budget.quarter}` : `سنة ${budget.year}`}
                  </TableCell>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>{formatCurrency(budget.allocated, budget.currency)}</TableCell>
                  <TableCell>{formatCurrency(budget.spent, budget.currency)}</TableCell>
                  <TableCell>{formatCurrency(budget.remaining, budget.currency)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${budget.remaining <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {budget.remaining <= 0 ? 'تم استهلاكها' : 'نشطة'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {budgets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    لا توجد ميزانيات مطابقة للمعايير الحالية
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تنبيهات الميزانية</CardTitle>
          <CardDescription>الفئات والفروع التي اقتربت من تجاوز الحدود أو تجاوزتها.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الفرع</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الاستعمال</TableHead>
                <TableHead>المخصص</TableHead>
                <TableHead>المصروف</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>التنبيه</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts?.alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.branchName} ({alert.branchCode})</TableCell>
                  <TableCell>{alert.category}</TableCell>
                  <TableCell>{alert.usagePercentage.toFixed(1)}%</TableCell>
                  <TableCell>{formatCurrency(alert.allocated, alert.currency)}</TableCell>
                  <TableCell>{formatCurrency(alert.spent, alert.currency)}</TableCell>
                  <TableCell>{formatCurrency(alert.remaining, alert.currency)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${alert.alertType === 'EXCEEDED' ? 'bg-red-100 text-red-800' : alert.alertType === 'CRITICAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}`}>
                      {alert.alertMessage}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {(alerts?.alerts.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    لا توجد تنبيهات ميزانية حالياً
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
