'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Plus, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Budget {
  id: string
  branchId: string
  year: number
  quarter?: number
  month?: number
  category: string
  allocated: number
  spent: number
  remaining: number
  currency: string
  description?: string
  status: string
  branch?: {
    id: string
    name: string
    code: string
  }
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formData, setFormData] = useState({
    branchId: '',
    year: new Date().getFullYear(),
    quarter: '',
    month: '',
    category: '',
    allocated: '',
    description: ''
  })

  useEffect(() => {
    fetchBudgets()
  }, [selectedYear])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/branches/budgets?year=${selectedYear}`)
      if (response.ok) {
        const data = await response.json()
        setBudgets(data || [])
      } else {
        toast.error('فشل في تحميل بيانات الميزانية')
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('حدث خطأ أثناء تحميل بيانات الميزانية')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/branches/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          allocated: parseFloat(formData.allocated),
          year: parseInt(formData.year.toString()),
          quarter: formData.quarter ? parseInt(formData.quarter) : undefined,
          month: formData.month ? parseInt(formData.month) : undefined
        }),
      })

      if (response.ok) {
        toast.success('تم إضافة الميزانية بنجاح')
        setIsDialogOpen(false)
        setFormData({
          branchId: '',
          year: new Date().getFullYear(),
          quarter: '',
          month: '',
          category: '',
          allocated: '',
          description: ''
        })
        fetchBudgets()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في إضافة الميزانية')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error('حدث خطأ أثناء إضافة الميزانية')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Calculate summary statistics
  const totalBudget = budgets.reduce((sum, b) => sum + b.allocated, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const warnings = budgets.filter(b => b.spent > b.allocated).length

  // Group budgets by category/department
  const budgetsByCategory = budgets.reduce((acc: any, budget) => {
    const category = budget.category || 'غير محدد'
    if (!acc[category]) {
      acc[category] = {
        category,
        budget: 0,
        spent: 0,
        remaining: 0
      }
    }
    acc[category].budget += budget.allocated
    acc[category].spent += budget.spent
    acc[category].remaining += budget.remaining
    return acc
  }, {})

  const getStatusColor = (spent: number, allocated: number) => {
    if (spent > allocated) return 'bg-red-100 text-red-800'
    if (spent > allocated * 0.9) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (spent: number, allocated: number) => {
    if (spent > allocated) return 'تجاوز'
    if (spent > allocated * 0.9) return 'تحذير'
    return 'آمن'
  }

  // Filter budgets by category
  const filteredBudgetsByCategory = Object.values(budgetsByCategory).filter((dept: any) => {
    const matchesSearch = searchTerm === '' || 
      dept.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || dept.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(Object.values(budgetsByCategory).map((d: any) => d.category)))

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
        <h1 className="text-3xl font-bold">إدارة الميزانية</h1>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() + 1].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchBudgets}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة ميزانية
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة ميزانية جديدة</DialogTitle>
                <DialogDescription>
                  قم بإدخال بيانات الميزانية الجديدة
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة/القسم</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="مثال: المبيعات، التسويق، الصيانة"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocated">المبلغ المخصص</Label>
                  <Input
                    id="allocated"
                    type="number"
                    value={formData.allocated}
                    onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                    placeholder="أدخل المبلغ المخصص"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">السنة</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quarter">الربع (اختياري)</Label>
                    <Select value={formData.quarter} onValueChange={(value) => setFormData({ ...formData, quarter: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الربع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">الربع الأول</SelectItem>
                        <SelectItem value="2">الربع الثاني</SelectItem>
                        <SelectItem value="3">الربع الثالث</SelectItem>
                        <SelectItem value="4">الربع الرابع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">الشهر (اختياري)</Label>
                    <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشهر" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                          <SelectItem key={m} value={m.toString()}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف الميزانية (اختياري)"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    إضافة ميزانية
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الميزانية الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              للسنة المالية {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% من الميزانية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? Math.round((totalRemaining / totalBudget) * 100) : 0}% من الميزانية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحذيرات</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warnings}</div>
            <p className="text-xs text-muted-foreground">
              أقسام تجاوزت الميزانية
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الميزانية حسب الأقسام</CardTitle>
          <CardDescription>
            نظرة عامة على الميزانية المخصصة لكل قسم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الميزانيات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredBudgetsByCategory.length > 0 ? (
              filteredBudgetsByCategory.map((dept: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{dept.category}</p>
                    <p className="text-sm text-muted-foreground">الميزانية: {formatCurrency(dept.budget)}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">المصروف: {formatCurrency(dept.spent)}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(dept.spent, dept.budget)}>
                        {getStatusText(dept.spent, dept.budget)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">متبقي: {formatCurrency(dept.remaining)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {Object.values(budgetsByCategory).length === 0
                  ? 'لا توجد ميزانيات مسجلة لهذه السنة'
                  : 'لا توجد ميزانيات مطابقة للفلاتر المحددة'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
