'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, CreditCard, Building, TrendingUp, RefreshCw, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BankAccount {
  id: string
  account: string
  balance: number
  status: string
  transactionCount: number
}

interface BankingSummary {
  totalBalance: number
  cashFlow: number
  transactionCount: number
  monthlyTransactionCount: number
}

export default function BankingPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [summary, setSummary] = useState<BankingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    accountType: 'current',
    amount: '',
    type: 'INCOME',
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    category: 'BANKING'
  })

  useEffect(() => {
    fetchBankingData()
  }, [])

  const fetchBankingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/banking')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
        setSummary(data.summary || null)
      } else {
        toast.error('فشل في تحميل بيانات الحسابات البنكية')
      }
    } catch (error) {
      console.error('Error fetching banking data:', error)
      toast.error('حدث خطأ أثناء تحميل بيانات الحسابات البنكية')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/banking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })

      if (response.ok) {
        toast.success('تم إضافة المعاملة البنكية بنجاح')
        setIsDialogOpen(false)
        setFormData({
          accountType: 'current',
          amount: '',
          type: 'INCOME',
          description: '',
          date: new Date().toISOString().split('T')[0],
          reference: '',
          category: 'BANKING'
        })
        fetchBankingData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في إضافة المعاملة البنكية')
      }
    } catch (error) {
      console.error('Error creating bank transaction:', error)
      toast.error('حدث خطأ أثناء إضافة المعاملة البنكية')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    return searchTerm === '' || 
      account.account.toLowerCase().includes(searchTerm.toLowerCase())
  })

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
        <h1 className="text-3xl font-bold">إدارة الحسابات البنكية</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBankingData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة معاملة بنكية
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة معاملة بنكية جديدة</DialogTitle>
                <DialogDescription>
                  قم بإدخال بيانات المعاملة البنكية الجديدة
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountType">نوع الحساب</Label>
                  <Select value={formData.accountType} onValueChange={(value) => setFormData({ ...formData, accountType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">الحساب الجاري</SelectItem>
                      <SelectItem value="savings">حساب التوفير</SelectItem>
                      <SelectItem value="payroll">حساب الرواتب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">نوع المعاملة</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">دخل</SelectItem>
                      <SelectItem value="EXPENSE">مصروف</SelectItem>
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
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف المعاملة"
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
                    إضافة معاملة
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
            <CardTitle className="text-sm font-medium">الرصيد الإجمالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.totalBalance) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              جميع الحسابات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحساب الجاري</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                accounts.find(a => a.id === 'current')?.balance || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              الحساب الرئيسي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حساب التوفير</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                accounts.find(a => a.id === 'savings')?.balance || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              احتياطي نقدي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التدفقات النقدية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary && summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary ? `${summary.cashFlow >= 0 ? '+' : ''}${formatCurrency(summary.cashFlow)}` : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الحسابات البنكية</CardTitle>
          <CardDescription>
            نظرة عامة على جميع الحسابات البنكية للشركة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الحسابات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{account.account}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.transactionCount} معاملة
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{formatCurrency(account.balance)}</p>
                    <Badge className="bg-green-100 text-green-800">
                      {account.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {accounts.length === 0
                  ? 'لا توجد حسابات بنكية مسجلة'
                  : 'لا توجد حسابات مطابقة للبحث'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
