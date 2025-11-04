'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Plus, RefreshCw, Edit, Trash2, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Expense {
  id: string
  category: string
  amount: number
  description?: string
  date: string
  paymentMethod: string
  reference?: string
  branch?: {
    id: string
    name: string
  }
  metadata?: {
    status?: string
  }
}

interface ExpenseSummary {
  totalExpenses: number
  operationalExpenses: number
  capitalExpenses: number
  pendingExpenses: number
  expensesByCategory: Array<{
    category: string
    amount: number
    count: number
  }>
  count: number
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    reference: ''
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
        setSummary(data.summary || null)
      } else {
        toast.error('فشل في تحميل بيانات المصروفات')
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('حدث خطأ أثناء تحميل بيانات المصروفات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
      const method = editingExpense ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingExpense ? 'تم تحديث المصروف بنجاح' : 'تم إضافة المصروف بنجاح')
        setIsDialogOpen(false)
        setEditingExpense(null)
        setFormData({
          category: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH',
          reference: ''
        })
        fetchExpenses()
      } else {
        const error = await response.json()
        toast.error(error.error || (editingExpense ? 'فشل في تحديث المصروف' : 'فشل في إضافة المصروف'))
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      toast.error(`حدث خطأ أثناء ${editingExpense ? 'تحديث' : 'إضافة'} المصروف`)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || '',
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (expenseId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('تم حذف المصروف بنجاح')
        fetchExpenses()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في حذف المصروف')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('حدث خطأ أثناء حذف المصروف')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusText = (status?: string) => {
    if (!status) return 'مدفوع'
    return status === 'pending' || status === 'PENDING' ? 'معلق' : 'مدفوع'
  }

  const getStatusColor = (status?: string) => {
    if (!status || status === 'paid' || status === 'PAID') {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === '' || 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && (expense.metadata?.status === 'pending' || expense.metadata?.status === 'PENDING')) ||
      (statusFilter === 'paid' && (!expense.metadata?.status || expense.metadata?.status === 'paid' || expense.metadata?.status === 'PAID'))
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(expenses.map(e => e.category)))

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
        <h1 className="text-3xl font-bold">إدارة المصروفات</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchExpenses}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingExpense(null)
                setFormData({
                  category: '',
                  amount: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  paymentMethod: 'CASH',
                  reference: ''
                })
              }}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}</DialogTitle>
              <DialogDescription>
                {editingExpense ? 'قم بتعديل بيانات المصروف' : 'قم بإدخال بيانات المصروف الجديد'}
              </DialogDescription>
            </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الإيجار">الإيجار</SelectItem>
                      <SelectItem value="الرواتب">الرواتب</SelectItem>
                      <SelectItem value="الكهرباء والمياه">الكهرباء والمياه</SelectItem>
                      <SelectItem value="التسويق">التسويق</SelectItem>
                      <SelectItem value="الصيانة">الصيانة</SelectItem>
                      <SelectItem value="OPERATIONAL">تشغيلية</SelectItem>
                      <SelectItem value="SALARIES">رواتب</SelectItem>
                      <SelectItem value="RENT">إيجار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="أدخل المبلغ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">نقدي</SelectItem>
                      <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                      <SelectItem value="CHECK">شيك</SelectItem>
                      <SelectItem value="CARD">بطاقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="أدخل وصف المصروف"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">المرجع</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="رقم المرجع (اختياري)"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingExpense ? 'تحديث' : 'إضافة'} مصروف
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
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.totalExpenses) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات التشغيلية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.operationalExpenses) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.totalExpenses > 0 
                ? Math.round((summary.operationalExpenses / summary.totalExpenses) * 100)
                : 0}% من إجمالي المصروفات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات الرأسمالية</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.capitalExpenses) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.totalExpenses > 0 
                ? Math.round((summary.capitalExpenses / summary.totalExpenses) * 100)
                : 0}% من إجمالي المصروفات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات غير المعتمدة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.pendingExpenses) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              تنتظر الموافقة
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المصروفات</CardTitle>
          <CardDescription>
            آخر المصروفات المسجلة هذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المصروفات..."
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), 'dd/MM/yyyy', { locale: ar })}
                    </p>
                    {expense.description && (
                      <p className="text-xs text-muted-foreground mt-1">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <p className="font-medium">{formatCurrency(expense.amount)}</p>
                      <Badge className={getStatusColor(expense.metadata?.status)}>
                        {getStatusText(expense.metadata?.status)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {expenses.length === 0 
                  ? 'لا توجد مصروفات مسجلة هذا الشهر'
                  : 'لا توجد مصروفات مطابقة للفلاتر المحددة'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
