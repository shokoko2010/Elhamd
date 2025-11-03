'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, FileText, TrendingUp, DollarSign, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface ChartOfAccount {
  id: string
  code: string
  name: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  isActive: boolean
  normalBalance: 'DEBIT' | 'CREDIT'
  parentId?: string | null
  parent?: {
    id: string
    name: string
  } | null
  currentBalance?: number
}

interface JournalEntryItem {
  id: string
  accountId: string
  description?: string | null
  debit: number
  credit: number
  account: {
    id: string
    code: string
    name: string
    type: string
    normalBalance: string
  } | null
}

interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  description: string
  reference?: string | null
  totalDebit: number
  totalCredit: number
  status: 'DRAFT' | 'POSTED' | 'APPROVED' | 'REVERSED' | 'CANCELLED'
  createdBy: string
  approvedBy?: string | null
  approvedAt?: string | null
  branchId?: string | null
  items?: JournalEntryItem[]
}

interface AccountingSummary {
  totals: {
    totalAssets: number
    totalLiabilities: number
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    equity: number
  }
  accounts: {
    total: number
    active: number
  }
  entryStatus: Record<string, number>
}

interface AccountFormState {
  code: string
  name: string
  type: ChartOfAccount['type']
  normalBalance: ChartOfAccount['normalBalance']
  parentId: string
}

interface JournalEntryFormItem {
  accountId: string
  description: string
  debit: string
  credit: string
}

interface JournalEntryFormState {
  date: string
  description: string
  reference: string
  branchId: string
  status: JournalEntry['status']
  items: JournalEntryFormItem[]
}

const ACCOUNT_TYPES: ChartOfAccount['type'][] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']
const BALANCE_TYPES: ChartOfAccount['normalBalance'][] = ['DEBIT', 'CREDIT']
const ENTRY_STATUSES: JournalEntry['status'][] = ['DRAFT', 'POSTED', 'APPROVED', 'REVERSED', 'CANCELLED']

const defaultAccountForm: AccountFormState = {
  code: '',
  name: '',
  type: 'ASSET',
  normalBalance: 'DEBIT',
  parentId: ''
}

const defaultEntryItem: JournalEntryFormItem = {
  accountId: '',
  description: '',
  debit: '',
  credit: ''
}

const defaultEntryForm: JournalEntryFormState = {
  date: new Date().toISOString().split('T')[0],
  description: '',
  reference: '',
  branchId: '',
  status: 'DRAFT',
  items: [{ ...defaultEntryItem }, { ...defaultEntryItem }]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount || 0)
}

export default function AccountingPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [summary, setSummary] = useState<AccountingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [accountForm, setAccountForm] = useState<AccountFormState>(defaultAccountForm)
  const [entryForm, setEntryForm] = useState<JournalEntryFormState>(defaultEntryForm)
  const [submittingAccount, setSubmittingAccount] = useState(false)
  const [submittingEntry, setSubmittingEntry] = useState(false)

  useEffect(() => {
    fetchAccountingData()
  }, [])

  const fetchAccountingData = async () => {
    try {
      setLoading(true)
      const [accountsRes, entriesRes, summaryRes] = await Promise.all([
        fetch('/api/accounting/accounts'),
        fetch('/api/accounting/journal-entries'),
        fetch('/api/accounting/summary')
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(Array.isArray(accountsData) ? accountsData : [])
      } else {
        setAccounts([])
      }

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json()
        setJournalEntries(Array.isArray(entriesData) ? entriesData : [])
      } else {
        setJournalEntries([])
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      } else {
        setSummary(null)
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error)
      setAccounts([])
      setJournalEntries([])
      setSummary(null)
      toast.error('فشل في تحميل بيانات المحاسبة')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'REVERSED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'مسودة'
      case 'POSTED': return 'مرحلة'
      case 'APPROVED': return 'موافق عليه'
      case 'REVERSED': return 'معكوس'
      case 'CANCELLED': return 'ملغاة'
      default: return status
    }
  }

  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'ASSET': return 'أصول'
      case 'LIABILITY': return 'خصوم'
      case 'EQUITY': return 'حقوق ملكية'
      case 'REVENUE': return 'إيرادات'
      case 'EXPENSE': return 'مصروفات'
      default: return type
    }
  }

  const getBalanceTypeText = (type: string) => {
    switch (type) {
      case 'DEBIT': return 'مدين'
      case 'CREDIT': return 'دائن'
      default: return type
    }
  }

  const accountTypeSummary = useMemo(() => {
    const totals: Record<string, number> = {}
    const activeCounts: Record<string, number> = {}

    accounts.forEach((account) => {
      totals[account.type] = (totals[account.type] || 0) + (account.currentBalance || 0)
      if (account.isActive) {
        activeCounts[account.type] = (activeCounts[account.type] || 0) + 1
      }
    })

    return { totals, activeCounts }
  }, [accounts])

  const totals = summary?.totals ?? {
    totalAssets: 0,
    totalLiabilities: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    equity: 0
  }

  const entryTotals = useMemo(() => {
    return entryForm.items.reduce(
      (acc, item) => {
        const debit = parseFloat(item.debit || '0')
        const credit = parseFloat(item.credit || '0')
        return {
          debit: acc.debit + (isNaN(debit) ? 0 : debit),
          credit: acc.credit + (isNaN(credit) ? 0 : credit)
        }
      },
      { debit: 0, credit: 0 }
    )
  }, [entryForm.items])

  const resetAccountForm = () => {
    setAccountForm(defaultAccountForm)
  }

  const resetEntryForm = () => {
    setEntryForm(defaultEntryForm)
  }

  const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accountForm.code.trim() || !accountForm.name.trim()) {
      toast.error('يرجى إدخال كود واسم الحساب')
      return
    }

    setSubmittingAccount(true)
    try {
      const response = await fetch('/api/accounting/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: accountForm.code.trim(),
          name: accountForm.name.trim(),
          type: accountForm.type,
          normalBalance: accountForm.normalBalance,
          parentId: accountForm.parentId || null
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'فشل في إنشاء الحساب' }))
        throw new Error(error.error || 'فشل في إنشاء الحساب')
      }

      toast.success('تم إنشاء الحساب بنجاح')
      setAccountDialogOpen(false)
      resetAccountForm()
      fetchAccountingData()
    } catch (error) {
      console.error('Error creating account:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء الحساب')
    } finally {
      setSubmittingAccount(false)
    }
  }

  const handleEntrySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!entryForm.description.trim()) {
      toast.error('يرجى إدخال وصف القيد')
      return
    }

    if (entryForm.items.some((item) => !item.accountId)) {
      toast.error('يرجى اختيار حساب لكل بند')
      return
    }

    if (Math.abs(entryTotals.debit - entryTotals.credit) > 0.01) {
      toast.error('يجب أن يتساوى إجمالي المدين مع إجمالي الدائن')
      return
    }

    setSubmittingEntry(true)
    try {
      const response = await fetch('/api/accounting/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: entryForm.date,
          description: entryForm.description.trim(),
          reference: entryForm.reference || undefined,
          branchId: entryForm.branchId || undefined,
          status: entryForm.status,
          items: entryForm.items.map((item) => ({
            accountId: item.accountId,
            description: item.description || undefined,
            debit: parseFloat(item.debit || '0') || 0,
            credit: parseFloat(item.credit || '0') || 0
          }))
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'فشل في إنشاء القيد' }))
        throw new Error(error.error || 'فشل في إنشاء القيد')
      }

      toast.success('تم تسجيل القيد بنجاح')
      setEntryDialogOpen(false)
      resetEntryForm()
      fetchAccountingData()
    } catch (error) {
      console.error('Error creating journal entry:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء القيد المحاسبي')
    } finally {
      setSubmittingEntry(false)
    }
  }

  const updateEntryItem = (index: number, field: keyof JournalEntryFormItem, value: string) => {
    setEntryForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  const addEntryItem = () => {
    setEntryForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultEntryItem }]
    }))
  }

  const removeEntryItem = (index: number) => {
    setEntryForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index)
    }))
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المحاسبة</h1>
          <p className="text-muted-foreground">إدارة الحسابات المالية والقيود المحاسبية</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchAccountingData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث البيانات
          </Button>
          <Dialog open={entryDialogOpen} onOpenChange={(open) => {
            setEntryDialogOpen(open)
            if (!open) {
              resetEntryForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                قيد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>إضافة قيد محاسبي</DialogTitle>
                <DialogDescription>
                  سجل قيوداً محاسبية جديدة مع البنود التفصيلية.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEntrySubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="entry-date">التاريخ</Label>
                    <Input
                      id="entry-date"
                      type="date"
                      value={entryForm.date}
                      onChange={(event) => setEntryForm((prev) => ({ ...prev, date: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-status">الحالة</Label>
                    <Select
                      value={entryForm.status}
                      onValueChange={(value: JournalEntry['status']) =>
                        setEntryForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger id="entry-status">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTRY_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getStatusText(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="entry-description">الوصف</Label>
                    <Textarea
                      id="entry-description"
                      value={entryForm.description}
                      onChange={(event) => setEntryForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="وصف القيد"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-reference">المرجع</Label>
                    <Input
                      id="entry-reference"
                      value={entryForm.reference}
                      onChange={(event) => setEntryForm((prev) => ({ ...prev, reference: event.target.value }))}
                      placeholder="رقم المرجع أو المستند"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-branch">الفرع</Label>
                    <Input
                      id="entry-branch"
                      value={entryForm.branchId}
                      onChange={(event) => setEntryForm((prev) => ({ ...prev, branchId: event.target.value }))}
                      placeholder="معرّف الفرع (اختياري)"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">بنود القيد</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addEntryItem}>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة بند
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {entryForm.items.map((item, index) => (
                      <div key={index} className="grid gap-3 md:grid-cols-12 p-4 border rounded-lg">
                        <div className="md:col-span-3 space-y-2">
                          <Label>الحساب</Label>
                          <Select
                            value={item.accountId}
                            onValueChange={(value) => updateEntryItem(index, 'accountId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحساب" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.code} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <Label>الوصف</Label>
                          <Input
                            value={item.description}
                            onChange={(event) => updateEntryItem(index, 'description', event.target.value)}
                            placeholder="وصف البند"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>مدين</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.debit}
                            onChange={(event) => updateEntryItem(index, 'debit', event.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>دائن</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.credit}
                            onChange={(event) => updateEntryItem(index, 'credit', event.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 flex items-end">
                          {entryForm.items.length > 1 && (
                            <Button type="button" variant="ghost" onClick={() => removeEntryItem(index)}>
                              <Trash2 className="ml-2 h-4 w-4" />
                              إزالة
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                    <div>
                      <p className="text-sm font-medium">إجمالي المدين</p>
                      <p>{formatCurrency(entryTotals.debit)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">إجمالي الدائن</p>
                      <p>{formatCurrency(entryTotals.credit)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">الفرق</p>
                      <p className={Math.abs(entryTotals.debit - entryTotals.credit) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(entryTotals.debit - entryTotals.credit)}
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={submittingEntry}>
                    {submittingEntry ? 'جاري الحفظ...' : 'حفظ القيد'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={accountDialogOpen} onOpenChange={(open) => {
            setAccountDialogOpen(open)
            if (!open) {
              resetAccountForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="ml-2 h-4 w-4" />
                حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء حساب جديد</DialogTitle>
                <DialogDescription>
                  أضف حساباً إلى دليل الحسابات مع تحديد النوع ورصيد الميزان.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="account-code">كود الحساب</Label>
                    <Input
                      id="account-code"
                      value={accountForm.code}
                      onChange={(event) => setAccountForm((prev) => ({ ...prev, code: event.target.value }))}
                      placeholder="مثال: 1000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-name">اسم الحساب</Label>
                    <Input
                      id="account-name"
                      value={accountForm.name}
                      onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="اسم الحساب"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-type">نوع الحساب</Label>
                    <Select
                      value={accountForm.type}
                      onValueChange={(value: ChartOfAccount['type']) =>
                        setAccountForm((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger id="account-type">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getAccountTypeText(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-balance">طبيعة الرصيد</Label>
                    <Select
                      value={accountForm.normalBalance}
                      onValueChange={(value: ChartOfAccount['normalBalance']) =>
                        setAccountForm((prev) => ({ ...prev, normalBalance: value }))
                      }
                    >
                      <SelectTrigger id="account-balance">
                        <SelectValue placeholder="اختر طبيعة الرصيد" />
                      </SelectTrigger>
                      <SelectContent>
                        {BALANCE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getBalanceTypeText(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="account-parent">الحساب الرئيسي (اختياري)</Label>
                    <Select
                      value={accountForm.parentId}
                      onValueChange={(value) => setAccountForm((prev) => ({ ...prev, parentId: value }))}
                    >
                      <SelectTrigger id="account-parent">
                        <SelectValue placeholder="اختر الحساب الرئيسي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">بدون</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submittingAccount}>
                    {submittingAccount ? 'جاري الحفظ...' : 'حفظ الحساب'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalAssets)}</div>
            <p className="text-xs text-muted-foreground">إجمالي الأصول المتداولة والثابتة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخصوم</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalLiabilities)}</div>
            <p className="text-xs text-muted-foreground">إجمالي الالتزامات الحالية والطويلة الأجل</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الدخل</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totals.totalRevenue)} إيرادات - {formatCurrency(totals.totalExpenses)} مصروفات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حقوق الملكية</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.equity)}</div>
            <p className="text-xs text-muted-foreground">أصول - خصوم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">الرئيسية</TabsTrigger>
          <TabsTrigger value="accounts">دليل الحسابات</TabsTrigger>
          <TabsTrigger value="journal">القيود اليومية</TabsTrigger>
          <TabsTrigger value="reports">المؤشرات</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>آخر القيود المحاسبية</CardTitle>
                <CardDescription>أحدث القيود المحاسبية في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journalEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ar })} • {entry.entryNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(entry.totalDebit)}</p>
                        <Badge className={getStatusColor(entry.status)}>{getStatusText(entry.status)}</Badge>
                      </div>
                    </div>
                  ))}
                  {journalEntries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد قيود محاسبية حالياً
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ملخص الحسابات</CardTitle>
                <CardDescription>توزيع الحسابات حسب النوع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ACCOUNT_TYPES.map((type) => {
                    const activeCount = accountTypeSummary.activeCounts[type] || 0
                    const totalBalance = accountTypeSummary.totals[type] || 0
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{getAccountTypeText(type)}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(totalBalance)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activeCount} حساب</Badge>
                        </div>
                      </div>
                    )
                  })}
                  {accounts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد حسابات حالياً
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>حالات القيود</CardTitle>
              <CardDescription>توزيع القيود المحاسبية بحسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {ENTRY_STATUSES.map((status) => (
                  <div key={status} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{getStatusText(status)}</p>
                      <Badge className={getStatusColor(status)}>
                        {summary?.entryStatus?.[status] || 0}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>دليل الحسابات</CardTitle>
                  <CardDescription>عرض وإدارة جميع الحسابات المحاسبية</CardDescription>
                </div>
                <Button onClick={() => setAccountDialogOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  حساب جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium">{account.code} - {account.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getAccountTypeText(account.type)} • {getBalanceTypeText(account.normalBalance)}
                      </p>
                      {account.parent && (
                        <p className="text-xs text-muted-foreground">
                          تابع لحساب: {account.parent.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <p className="text-sm font-medium">الرصيد الحالي: {formatCurrency(account.currentBalance || 0)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد حسابات حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>القيود اليومية</CardTitle>
                  <CardDescription>عرض وإدارة القيود المحاسبية</CardDescription>
                </div>
                <Button onClick={() => setEntryDialogOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  قيد جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b">
                      <div>
                        <h3 className="font-medium">{entry.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.entryNumber} • {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                        {entry.reference && (
                          <p className="text-xs text-muted-foreground">
                            المرجع: {entry.reference}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <div className="text-sm">
                          <p>مدين: {formatCurrency(entry.totalDebit)}</p>
                          <p>دائن: {formatCurrency(entry.totalCredit)}</p>
                        </div>
                        <Badge className={getStatusColor(entry.status)}>{getStatusText(entry.status)}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الحساب</TableHead>
                            <TableHead>الوصف</TableHead>
                            <TableHead className="text-right">مدين</TableHead>
                            <TableHead className="text-right">دائن</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.items && entry.items.length > 0 ? (
                            entry.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  {item.account
                                    ? `${item.account.code} - ${item.account.name}`
                                    : 'حساب غير متاح'}
                                </TableCell>
                                <TableCell>{item.description || '-'}</TableCell>
                                <TableCell className="text-right">
                                  {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                لا توجد بنود لهذا القيد
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
                {journalEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد قيود محاسبية حالياً
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>ملخص تحليلي</CardTitle>
              <CardDescription>
                نظرة سريعة على أداء الحسابات والقيود داخل النظام المحاسبي.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">عدد الحسابات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{summary?.accounts.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {summary?.accounts.active ?? 0} حساب نشط
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">إجمالي الإيرادات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totals.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">المبالغ المرحلة إلى حسابات الإيرادات</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">إجمالي المصروفات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totals.totalExpenses)}</p>
                    <p className="text-xs text-muted-foreground">المبالغ المرحلة إلى حسابات المصروفات</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">عدد القيود</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{journalEntries.length}</p>
                    <p className="text-xs text-muted-foreground">جميع القيود المسجلة في النظام</p>
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
