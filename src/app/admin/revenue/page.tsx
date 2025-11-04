'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, Car, Users, RefreshCw, Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface RevenueSummary {
  totalRevenue: number
  totalRevenueFromTransactions: number
  totalRevenueFromInvoices: number
  revenueBySource: Array<{
    source: string
    amount: number
    count: number
    trend?: string
  }>
  netProfit: number
  profitMargin: number
  revenueTrend: number
  count: number
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    reference: ''
  })

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/revenue')
      if (response.ok) {
        const data = await response.json()
        setRevenue(data.revenue || [])
        setInvoices(data.invoices || [])
        setSummary(data.summary || null)
      } else {
        toast.error('فشل في تحميل بيانات الإيرادات')
      }
    } catch (error) {
      console.error('Error fetching revenue:', error)
      toast.error('حدث خطأ أثناء تحميل بيانات الإيرادات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingRevenue ? `/api/revenue/${editingRevenue.id}` : '/api/revenue'
      const method = editingRevenue ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingRevenue ? 'تم تحديث الإيراد بنجاح' : 'تم إضافة الإيراد بنجاح')
        setIsDialogOpen(false)
        setEditingRevenue(null)
        setFormData({
          category: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH',
          reference: ''
        })
        fetchRevenue()
      } else {
        const error = await response.json()
        toast.error(error.error || (editingRevenue ? 'فشل في تحديث الإيراد' : 'فشل في إضافة الإيراد'))
      }
    } catch (error) {
      console.error('Error saving revenue:', error)
      toast.error(`حدث خطأ أثناء ${editingRevenue ? 'تحديث' : 'إضافة'} الإيراد`)
    }
  }

  const handleEdit = (revenueItem: any) => {
    setEditingRevenue(revenueItem)
    setFormData({
      category: revenueItem.category,
      amount: revenueItem.amount.toString(),
      description: revenueItem.description || '',
      date: revenueItem.date.split('T')[0],
      paymentMethod: revenueItem.paymentMethod,
      reference: revenueItem.reference || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (revenueId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإيراد؟')) return

    try {
      const response = await fetch(`/api/revenue/${revenueId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('تم حذف الإيراد بنجاح')
        fetchRevenue()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في حذف الإيراد')
      }
    } catch (error) {
      console.error('Error deleting revenue:', error)
      toast.error('حدث خطأ أثناء حذف الإيراد')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Filter revenue by source
  const filteredRevenueBySource = summary && summary.revenueBySource.length > 0 
    ? summary.revenueBySource.filter(source => {
        const matchesSearch = searchTerm === '' || 
          source.source.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || source.source === categoryFilter
        return matchesSearch && matchesCategory
      })
    : []

  // Get unique categories for filter
  const categories = summary ? Array.from(new Set(summary.revenueBySource.map(s => s.source))) : []

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
        <h1 className="text-3xl font-bold">تقارير الإيرادات</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRevenue}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingRevenue(null)
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
                إضافة إيراد
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRevenue ? 'تعديل إيراد' : 'إضافة إيراد جديد'}</DialogTitle>
              <DialogDescription>
                {editingRevenue ? 'قم بتعديل بيانات الإيراد' : 'قم بإدخال بيانات الإيراد الجديد'}
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
                      <SelectItem value="SALES">مبيعات</SelectItem>
                      <SelectItem value="SERVICES">خدمات</SelectItem>
                      <SelectItem value="PARTS">قطع غيار</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
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
                    placeholder="أدخل وصف الإيراد"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingRevenue ? 'تحديث' : 'إضافة'} إيراد
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
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.totalRevenue) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.revenueTrend ? formatPercentage(summary.revenueTrend) : '+0%'} من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات السيارات</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(
                summary.revenueBySource
                  .filter((s: any) => s.source.includes('مبيعات'))
                  .reduce((sum: number, s: any) => sum + s.amount, 0)
              ) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.totalRevenue > 0 
                ? Math.round((summary.revenueBySource
                    .filter((s: any) => s.source.includes('مبيعات'))
                    .reduce((sum: number, s: any) => sum + s.amount, 0) / summary.totalRevenue) * 100)
                : 0}% من إجمالي الإيرادات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخدمات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(
                summary.revenueBySource
                  .filter((s: any) => s.source.includes('خدمات'))
                  .reduce((sum: number, s: any) => sum + s.amount, 0)
              ) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary && summary.totalRevenue > 0 
                ? Math.round((summary.revenueBySource
                    .filter((s: any) => s.source.includes('خدمات'))
                    .reduce((sum: number, s: any) => sum + s.amount, 0) / summary.totalRevenue) * 100)
                : 0}% من إجمالي الإيرادات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary && summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary ? formatCurrency(summary.netProfit) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary ? summary.profitMargin.toFixed(1) : 0}% هامش ربح
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإيرادات الشهرية</CardTitle>
          <CardDescription>
            تحليل الإيرادات حسب المصدر لهذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الإيرادات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="المصدر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المصادر</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredRevenueBySource.length > 0 ? (
              filteredRevenueBySource.map((source, index) => {
                const percentage = summary.totalRevenue > 0 
                  ? Math.round((source.amount / summary.totalRevenue) * 100)
                  : 0
                // Find the revenue item for this source
                const revenueItem = revenue.find(r => r.category === source.source) || invoices.find(i => {
                  const sourceType = i.type === 'SALE' ? 'مبيعات سيارات جديدة' : 
                                   i.type === 'USED_SALE' ? 'مبيعات سيارات مستعملة' :
                                   i.type === 'SERVICE' ? 'خدمات الصيانة' :
                                   i.type === 'PARTS' ? 'قطع غيار' :
                                   'خدمات إضافية'
                  return sourceType === source.source
                })
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-muted-foreground">{percentage}% من إجمالي الإيرادات</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="font-medium">{formatCurrency(source.amount)}</p>
                        {source.trend && (
                          <p className="text-xs text-green-600">{source.trend} من الشهر الماضي</p>
                        )}
                      </div>
                      {revenueItem && revenueItem.id && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(revenueItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(revenueItem.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {summary && summary.revenueBySource.length === 0
                  ? 'لا توجد إيرادات مسجلة هذا الشهر'
                  : 'لا توجد إيرادات مطابقة للفلاتر المحددة'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
