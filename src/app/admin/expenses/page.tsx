'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaymentMethod } from '@prisma/client'
import { toast } from 'sonner'

interface BranchOption {
  id: string
  name: string
  code: string
}

interface ExpenseItem {
  id: string
  referenceId: string
  category: string
  amount: number
  date: string
  status: 'PAID' | 'PENDING' | 'DRAFT'
  description?: string | null
  currency: string
  branch?: {
    id: string
    name: string
    code: string
  } | null
}

interface ExpenseCategorySummary {
  category: string
  amount: number
  percentage: number
  count: number
}

interface ExpenseResponse {
  totals: {
    totalExpenses: number
    currentMonth: number
    operationalExpenses: number
    capitalExpenses: number
    pendingExpenses: number
  }
  categories: ExpenseCategorySummary[]
  expenses: ExpenseItem[]
}

interface ExpenseFormState {
  category: string
  amount: string
  date: string
  description: string
  status: ExpenseItem['status']
  branchId: string
  paymentMethod: PaymentMethod
  reference: string
}

const STATUS_OPTIONS: { value: ExpenseItem['status'] | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'PAID', label: 'مدفوعة' },
  { value: 'PENDING', label: 'معلقة' },
  { value: 'DRAFT', label: 'مسودة' }
]

const statusBadgeConfig: Record<ExpenseItem['status'], { label: string; className: string }> = {
  PAID: { label: 'مدفوعة', className: 'bg-green-100 text-green-800' },
  PENDING: { label: 'معلقة', className: 'bg-yellow-100 text-yellow-800' },
  DRAFT: { label: 'مسودة', className: 'bg-gray-100 text-gray-800' }
}

const defaultFormState: ExpenseFormState = {
  category: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  status: 'PAID',
  branchId: '',
  paymentMethod: PaymentMethod.CASH,
  reference: ''
}

const formatCurrency = (amount: number, currency = 'EGP') => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency
  }).format(amount || 0)
}

export default function ExpensesPage() {
  const [data, setData] = useState<ExpenseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formState, setFormState] = useState<ExpenseFormState>(defaultFormState)
  const [submitting, setSubmitting] = useState(false)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [filters, setFilters] = useState({ status: 'ALL' as ExpenseItem['status'] | 'ALL', branchId: '' })

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [filters])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches')
      if (response.ok) {
        const result = await response.json()
        setBranches(result.branches || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const buildQueryParams = () => {
    const params = new URLSearchParams()
    if (filters.status !== 'ALL') {
      params.set('status', filters.status)
    }
    if (filters.branchId) {
      params.set('branchId', filters.branchId)
    }
    return params.toString()
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const params = buildQueryParams()
      const response = await fetch(`/api/finance/expenses${params ? `?${params}` : ''}`)
      if (!response.ok) {
        throw new Error('فشل في تحميل المصروفات')
      }
      const payload: ExpenseResponse = await response.json()
      setData(payload)
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setData(null)
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل المصروفات')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormState(defaultFormState)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.category.trim() || !formState.amount) {
      toast.error('يرجى إدخال فئة المصروف والمبلغ')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formState.category.trim(),
          amount: parseFloat(formState.amount),
          date: formState.date,
          description: formState.description.trim() || undefined,
          status: formState.status,
          paymentMethod: formState.paymentMethod,
          branchId: formState.branchId || undefined,
          reference: formState.reference || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'فشل في تسجيل المصروف' }))
        throw new Error(error.error || 'فشل في تسجيل المصروف')
      }

      toast.success('تم تسجيل المصروف بنجاح')
      setDialogOpen(false)
      resetForm()
      fetchExpenses()
    } catch (error) {
      console.error('Error creating expense:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تسجيل المصروف')
    } finally {
      setSubmitting(false)
    }
  }

  const categoryHighlights = useMemo(() => {
    if (!data) return []
    return [...data.categories].sort((a, b) => b.amount - a.amount).slice(0, 5)
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totals = data?.totals ?? {
    totalExpenses: 0,
    currentMonth: 0,
    operationalExpenses: 0,
    capitalExpenses: 0,
    pendingExpenses: 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المصروفات</h1>
          <p className="text-muted-foreground">تتبع المصروفات التشغيلية والرأسمالية وتحليلها.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchExpenses}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث البيانات
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسجيل مصروف جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المصروف ليتم تسجيله في السجلات المالية.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expense-category">فئة المصروف</Label>
                    <Input
                      id="expense-category"
                      value={formState.category}
                      onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                      placeholder="مثل الرواتب، الإيجار، الصيانة"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">المبلغ</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.amount}
                      onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">التاريخ</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={formState.date}
                      onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-status">الحالة</Label>
                    <Select
                      value={formState.status}
                      onValueChange={(value: ExpenseItem['status']) =>
                        setFormState((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger id="expense-status">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.filter((option) => option.value !== 'ALL').map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-payment">طريقة الدفع</Label>
                    <Select
                      value={formState.paymentMethod}
                      onValueChange={(value: PaymentMethod) =>
                        setFormState((prev) => ({ ...prev, paymentMethod: value }))
                      }
                    >
                      <SelectTrigger id="expense-payment">
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentMethod).map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-branch">الفرع</Label>
                    <Select
                      value={formState.branchId}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, branchId: value }))}
                    >
                      <SelectTrigger id="expense-branch">
                        <SelectValue placeholder="اختر الفرع (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="expense-reference">رقم المرجع (اختياري)</Label>
                    <Input
                      id="expense-reference"
                      value={formState.reference}
                      onChange={(event) => setFormState((prev) => ({ ...prev, reference: event.target.value }))}
                      placeholder="رقم الفاتورة أو المستند"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="expense-description">الوصف</Label>
                    <Textarea
                      id="expense-description"
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="وصف المصروف"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'جاري الحفظ...' : 'حفظ المصروف'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تصفية المصروفات</CardTitle>
          <CardDescription>اختر الفرع أو حالة المصروف لتصفية النتائج.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label>الحالة</Label>
              <Select value={filters.status} onValueChange={(value: ExpenseItem['status'] | 'ALL') => setFilters((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ status: 'ALL', branchId: '' })}>
                إعادة التعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">إجمالي المصروفات المسجلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مصروفات الشهر الحالي</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.currentMonth)}</div>
            <p className="text-xs text-muted-foreground">المصروفات المسجلة خلال الشهر الحالي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مصروفات تشغيلية</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.operationalExpenses)}</div>
            <p className="text-xs text-muted-foreground">رواتب، صيانة، خدمات تشغيلية</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مصروفات معتمدة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.pendingExpenses)}</div>
            <p className="text-xs text-muted-foreground">المصروفات المعلقة بانتظار الموافقة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المصروفات</CardTitle>
            <CardDescription>آخر المصروفات المسجلة مع حالة الدفع.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{expense.category}</span>
                        {expense.referenceId && (
                          <span className="text-xs text-muted-foreground">رقم المرجع: {expense.referenceId}</span>
                        )}
                        {expense.description && (
                          <span className="text-xs text-muted-foreground">{expense.description}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{expense.branch ? `${expense.branch.name} (${expense.branch.code})` : '-'}</TableCell>
                    <TableCell>{formatCurrency(expense.amount, expense.currency)}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeConfig[expense.status].className}`}>
                        {statusBadgeConfig[expense.status].label}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.expenses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      لا توجد مصروفات مطابقة للمعايير الحالية
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أهم الفئات إنفاقاً</CardTitle>
            <CardDescription>الخمسة الكبار حسب إجمالي المبالغ.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryHighlights.map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{category.category}</p>
                    <p className="text-xs text-muted-foreground">{category.count} مصروفات</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% من الإجمالي</p>
                  </div>
                </div>
              ))}
              {categoryHighlights.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  لا توجد بيانات كافية لعرض الفئات الأكثر إنفاقاً
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
