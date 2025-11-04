'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, Download, Edit, FileText, MinusCircle, Plus, RefreshCw, Trash2, TrendingUp, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

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
    code?: string
  } | null
}

interface JournalEntryItem {
  id: string
  accountId: string
  account: ChartOfAccount
  description?: string | null
  debit: number
  credit: number
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
  branch?: {
    id: string
    name: string
    code?: string
  } | null
  items?: JournalEntryItem[]
}

interface BranchOption {
  id: string
  name: string
}

interface FinancialSummary {
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

interface JournalEntryItemForm {
  accountId: string
  description: string
  debit: number
  credit: number
}

const ACCOUNT_TYPES: Array<ChartOfAccount['type']> = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']
const BALANCE_TYPES: Array<ChartOfAccount['normalBalance']> = ['DEBIT', 'CREDIT']

const DEFAULT_FINANCIAL_SUMMARY: FinancialSummary = {
  totalAssets: 0,
  totalLiabilities: 0,
  totalEquity: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  netIncome: 0
}

export default function AccountingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>(DEFAULT_FINANCIAL_SUMMARY)
  const [branches, setBranches] = useState<BranchOption[]>([])

  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('dashboard')

  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [accountSubmitting, setAccountSubmitting] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: 'ASSET' as ChartOfAccount['type'],
    parentId: '' as string | null,
    normalBalance: 'DEBIT' as ChartOfAccount['normalBalance'],
    isActive: true
  })

  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [entrySubmitting, setEntrySubmitting] = useState(false)
  const [entryError, setEntryError] = useState<string | null>(null)
  const [entryForm, setEntryForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    reference: '',
    branchId: ''
  })
  const [entryItems, setEntryItems] = useState<JournalEntryItemForm[]>([
    { accountId: '', description: '', debit: 0, credit: 0 },
    { accountId: '', description: '', debit: 0, credit: 0 }
  ])

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    fetchAccountingData()
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches?limit=100')
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'غير مصرح',
            description: 'يرجى تسجيل الدخول للوصول إلى بيانات الفروع',
            variant: 'destructive'
          })
        }
        return
      }

      const data = await response.json()
      if (data?.branches && Array.isArray(data.branches)) {
        setBranches(
          data.branches.map((branch: any) => ({
            id: branch.id,
            name: branch.name
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchAccountingData = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true)
      }

      const [accountsRes, entriesRes, summaryRes] = await Promise.all([
        fetch('/api/accounting/accounts'),
        fetch('/api/accounting/journal-entries'),
        fetch('/api/accounting/balances')
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(Array.isArray(accountsData) ? accountsData : [])
      } else {
        if (accountsRes.status === 401) {
          toast({
            title: 'انتهت صلاحية الجلسة',
            description: 'يرجى تسجيل الدخول مرة أخرى لعرض الحسابات',
            variant: 'destructive'
          })
        }
        setAccounts([])
      }

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json()
        setJournalEntries(Array.isArray(entriesData) ? entriesData : [])
      } else {
        if (entriesRes.status === 401) {
          toast({
            title: 'انتهت صلاحية الجلسة',
            description: 'يرجى تسجيل الدخول مرة أخرى لعرض القيود المحاسبية',
            variant: 'destructive'
          })
        }
        setJournalEntries([])
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        if (summaryData?.summary) {
          setFinancialSummary({
            totalAssets: summaryData.summary.totalAssets ?? 0,
            totalLiabilities: summaryData.summary.totalLiabilities ?? 0,
            totalEquity: summaryData.summary.equity ?? summaryData.summary.totalEquity ?? 0,
            totalRevenue: summaryData.summary.totalRevenue ?? 0,
            totalExpenses: summaryData.summary.totalExpenses ?? 0,
            netIncome: summaryData.summary.netIncome ?? 0
          })
        } else {
          setFinancialSummary(DEFAULT_FINANCIAL_SUMMARY)
        }
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error)
      if (showSpinner) {
        toast({
          title: 'تعذر تحميل البيانات',
          description: 'حدث خطأ غير متوقع أثناء تحميل بيانات المحاسبة',
          variant: 'destructive'
        })
      }
      setAccounts([])
      setJournalEntries([])
      setFinancialSummary(DEFAULT_FINANCIAL_SUMMARY)
    } finally {
      if (showSpinner) {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-transparent'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-transparent'
      case 'REVERSED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-transparent'
      default:
        return 'bg-gray-100 text-gray-800 border-transparent'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'مسودة'
      case 'POSTED':
        return 'مرحلة'
      case 'APPROVED':
        return 'موافق عليه'
      case 'REVERSED':
        return 'معكوس'
      case 'CANCELLED':
        return 'ملغاة'
      default:
        return status
    }
  }

  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'ASSET':
        return 'أصول'
      case 'LIABILITY':
        return 'خصوم'
      case 'EQUITY':
        return 'حقوق ملكية'
      case 'REVENUE':
        return 'إيرادات'
      case 'EXPENSE':
        return 'مصروفات'
      default:
        return type
    }
  }

  const getBalanceTypeText = (type: string) => {
    switch (type) {
      case 'DEBIT':
        return 'مدين'
      case 'CREDIT':
        return 'دائن'
      default:
        return type
    }
  }

  const totalActiveAccounts = useMemo(
    () => accounts.filter((account) => account.isActive).length,
    [accounts]
  )

  const resetAccountForm = () => {
    setAccountForm({
      code: '',
      name: '',
      type: 'ASSET',
      parentId: '',
      normalBalance: 'DEBIT',
      isActive: true
    })
    setAccountError(null)
  }

  const resetEntryForm = () => {
    setEntryForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      reference: '',
      branchId: ''
    })
    setEntryItems([
      { accountId: '', description: '', debit: 0, credit: 0 },
      { accountId: '', description: '', debit: 0, credit: 0 }
    ])
    setEntryError(null)
  }

  const handleAccountSubmit = async () => {
    try {
      setAccountSubmitting(true)
      setAccountError(null)

      if (!accountForm.code.trim() || !accountForm.name.trim()) {
        setAccountError('الرجاء إدخال كود واسم الحساب')
        return
      }

      const response = await fetch('/api/accounting/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: accountForm.code.trim(),
          name: accountForm.name.trim(),
          type: accountForm.type,
          parentId: accountForm.parentId || null,
          normalBalance: accountForm.normalBalance,
          isActive: accountForm.isActive
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData?.error || 'فشل حفظ الحساب الجديد'
        throw new Error(message)
      }

      toast({
        title: 'تم حفظ الحساب',
        description: 'تم إضافة الحساب الجديد بنجاح'
      })

      setAccountDialogOpen(false)
      resetAccountForm()
      await fetchAccountingData(false)
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'حدث خطأ أثناء حفظ الحساب'
      setAccountError(message)
      toast({
        title: 'فشل حفظ الحساب',
        description: message,
        variant: 'destructive'
      })
    } finally {
      setAccountSubmitting(false)
    }
  }

  const handleAddEntryItem = () => {
    setEntryItems((prev) => [
      ...prev,
      { accountId: '', description: '', debit: 0, credit: 0 }
    ])
  }

  const handleRemoveEntryItem = (index: number) => {
    setEntryItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEntryItemChange = (index: number, key: keyof JournalEntryItemForm, value: string) => {
    setEntryItems((prev) => {
      const updated = [...prev]
      if (key === 'debit' || key === 'credit') {
        const numeric = Number(value) || 0
        updated[index] = { ...updated[index], [key]: numeric }
      } else {
        updated[index] = { ...updated[index], [key]: value }
      }
      return updated
    })
  }

  const totals = useMemo(() => {
    return entryItems.reduce(
      (acc, item) => {
        return {
          debit: acc.debit + (Number(item.debit) || 0),
          credit: acc.credit + (Number(item.credit) || 0)
        }
      },
      { debit: 0, credit: 0 }
    )
  }, [entryItems])

  const handleEntrySubmit = async () => {
    try {
      setEntrySubmitting(true)
      setEntryError(null)

      if (!entryForm.description.trim()) {
        setEntryError('يرجى إدخال وصف للقيد المحاسبي')
        return
      }

      if (entryItems.some((item) => !item.accountId)) {
        setEntryError('يجب اختيار حساب لكل بند في القيد')
        return
      }

      if (entryItems.every((item) => (item.debit || 0) === 0) || entryItems.every((item) => (item.credit || 0) === 0)) {
        setEntryError('يجب أن يحتوي القيد على بنود مدينة وبنود دائنة')
        return
      }

      if (Math.abs(totals.debit - totals.credit) > 0.01) {
        setEntryError('يجب أن تتساوى الإجماليات المدينة والدائنة قبل الحفظ')
        return
      }

      const response = await fetch('/api/accounting/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: entryForm.date,
          description: entryForm.description.trim(),
          reference: entryForm.reference.trim() || null,
          branchId: entryForm.branchId || null,
          items: entryItems.map((item) => ({
            accountId: item.accountId,
            description: item.description.trim() || null,
            debit: Number(item.debit) || 0,
            credit: Number(item.credit) || 0
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData?.error || 'فشل حفظ القيد المحاسبي'
        throw new Error(message)
      }

      toast({
        title: 'تم حفظ القيد',
        description: 'تم إضافة القيد المحاسبي بنجاح'
      })

      setEntryDialogOpen(false)
      resetEntryForm()
      await fetchAccountingData(false)
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'حدث خطأ أثناء حفظ القيد'
      setEntryError(message)
      toast({
        title: 'فشل حفظ القيد',
        description: message,
        variant: 'destructive'
      })
    } finally {
      setEntrySubmitting(false)
    }
  }

  const handleExportSummary = () => {
    const rows = [
      ['البند', 'القيمة'],
      ['إجمالي الأصول', financialSummary.totalAssets.toFixed(2)],
      ['إجمالي الخصوم', financialSummary.totalLiabilities.toFixed(2)],
      ['حقوق الملكية', financialSummary.totalEquity.toFixed(2)],
      ['إجمالي الإيرادات', financialSummary.totalRevenue.toFixed(2)],
      ['إجمالي المصروفات', financialSummary.totalExpenses.toFixed(2)],
      ['صافي الدخل', financialSummary.netIncome.toFixed(2)]
    ]

    const csvContent = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `financial-summary-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'تم تصدير التقرير المالي',
      description: 'تم تنزيل ملف الملخص المالي بصيغة CSV'
    })
  }

  const handleReportNavigation = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  const netIncome = financialSummary.netIncome
  const equity = financialSummary.totalEquity

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">المحاسبة</h1>
          <p className="text-muted-foreground">إدارة الحسابات المالية والقيود المحاسبية</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => fetchAccountingData()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث البيانات
          </Button>
          <Button variant="outline" onClick={handleExportSummary}>
            <Download className="ml-2 h-4 w-4" />
            تقرير مالي
          </Button>
          <Button onClick={() => setEntryDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            قيد جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(financialSummary.totalAssets)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي الأصول المتداولة والثابتة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخصوم</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(financialSummary.totalLiabilities)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي الالتزامات الحالية والطويلة الأجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الدخل</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(financialSummary.totalRevenue)}{' '}
              إيرادات -{' '}
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(financialSummary.totalExpenses)}{' '}
              مصروفات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حقوق الملكية</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(equity)}
            </div>
            <p className="text-xs text-muted-foreground">أصول - خصوم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">الرئيسية</TabsTrigger>
          <TabsTrigger value="accounts">دليل الحسابات</TabsTrigger>
          <TabsTrigger value="journal">القيود اليومية</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
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
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ar })} • {entry.entryNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(entry.totalDebit)}
                        </p>
                        <Badge className={getStatusColor(entry.status)}>{getStatusText(entry.status)}</Badge>
                      </div>
                    </div>
                  ))}
                  {journalEntries.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">لا توجد قيود محاسبية حالياً</div>
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
                    const typeAccounts = accounts.filter((account) => account.type === type && account.isActive)
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getAccountTypeText(type)}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{typeAccounts.length} حساب</Badge>
                          <span className="text-sm text-muted-foreground">
                            {totalActiveAccounts > 0 ? Math.round((typeAccounts.length / totalActiveAccounts) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {accounts.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">لا توجد حسابات حالياً</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                  <div key={account.id} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {account.code} - {account.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getAccountTypeText(account.type)} • {getBalanceTypeText(account.normalBalance)}
                      </p>
                      {account.parent && (
                        <p className="text-xs text-muted-foreground">
                          تابع لحساب: {account.parent.code ? `${account.parent.code} - ` : ''}
                          {account.parent.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">لا توجد حسابات حالياً</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                  <div key={entry.id} className="rounded-lg border">
                    <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{entry.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.entryNumber} • {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                        {entry.reference && (
                          <p className="text-xs text-muted-foreground">المرجع: {entry.reference}</p>
                        )}
                        {entry.branch && (
                          <p className="text-xs text-muted-foreground">الفرع: {entry.branch.name}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                        <div className="text-right">
                          <p className="text-sm">
                            مدين:{' '}
                            {new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(entry.totalDebit)}
                          </p>
                          <p className="text-sm">
                            دائن:{' '}
                            {new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(entry.totalCredit)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(entry.status)}>{getStatusText(entry.status)}</Badge>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                          تفاصيل
                        </Button>
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
                                  {item.account?.code ? `${item.account.code} - ` : ''}
                                  {item.account?.name || 'غير معروف'}
                                </TableCell>
                                <TableCell>{item.description || '-'}</TableCell>
                                <TableCell className="text-right">
                                  {item.debit > 0
                                    ? new Intl.NumberFormat('ar-EG', {
                                        style: 'currency',
                                        currency: 'EGP'
                                      }).format(item.debit)
                                    : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.credit > 0
                                    ? new Intl.NumberFormat('ar-EG', {
                                        style: 'currency',
                                        currency: 'EGP'
                                      }).format(item.credit)
                                    : '-'}
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
                  <div className="py-8 text-center text-muted-foreground">لا توجد قيود محاسبية حالياً</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">قائمة الدخل</CardTitle>
                <CardDescription>عرض الإيرادات والمصروفات وصافي الدخل</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleReportNavigation('/admin/reports?tab=financial')}>
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">الميزانية العمومية</CardTitle>
                <CardDescription>عرض الأصول والخصوم وحقوق الملكية</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleReportNavigation('/admin/reports?tab=financial&view=balance-sheet')}>
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">قائمة التدفق النقدي</CardTitle>
                <CardDescription>عرض التدفقات النقدية الداخلة والخارجة</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleReportNavigation('/admin/reports?tab=financial&view=cash-flow')}>
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">كشف الحسابات</CardTitle>
                <CardDescription>عرض حركات الحسابات المفصلة</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleReportNavigation('/admin/reports?tab=accounting&view=ledger')}>
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">تقرير الضرائب</CardTitle>
                <CardDescription>عرض الالتزامات الضريبية والمدفوعات</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleReportNavigation('/admin/reports?tab=financial&view=tax')}>
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">تقرير الأداء المالي</CardTitle>
                <CardDescription>عرض مؤشرات الأداء المالي الرئيسية</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleReportNavigation('/admin/reports?tab=performance')}>
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={accountDialogOpen} onOpenChange={(open) => {
        setAccountDialogOpen(open)
        if (!open) {
          resetAccountForm()
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>إضافة حساب جديد</DialogTitle>
            <DialogDescription>قم بتعبئة البيانات التالية لإنشاء حساب في دليل الحسابات</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="account-code">كود الحساب</Label>
              <Input
                id="account-code"
                value={accountForm.code}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="مثال: 100-001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-name">اسم الحساب</Label>
              <Input
                id="account-name"
                value={accountForm.name}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="مثال: الصندوق"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <Label>نوع الحساب</Label>
                <Select
                  value={accountForm.type}
                  onValueChange={(value) =>
                    setAccountForm((prev) => ({
                      ...prev,
                      type: value as ChartOfAccount['type'],
                      normalBalance: ['ASSET', 'EXPENSE'].includes(value as ChartOfAccount['type']) ? 'DEBIT' : 'CREDIT'
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحساب" />
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
              <div className="grid gap-2">
                <Label>طبيعة الرصيد</Label>
                <Select
                  value={accountForm.normalBalance}
                  onValueChange={(value) =>
                    setAccountForm((prev) => ({
                      ...prev,
                      normalBalance: value as ChartOfAccount['normalBalance']
                    }))
                  }
                >
                  <SelectTrigger>
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
            </div>
            <div className="grid gap-2">
              <Label>الحساب الرئيسي</Label>
              <Select
                value={accountForm.parentId || ''}
                onValueChange={(value) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    parentId: value || ''
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="بدون حساب رئيسي" />
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">تفعيل الحساب</Label>
                <p className="text-xs text-muted-foreground">تفعيل أو تعطيل الحساب في الدليل</p>
              </div>
              <Switch
                checked={accountForm.isActive}
                onCheckedChange={(checked) => setAccountForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
            {accountError && <p className="text-sm text-destructive">{accountError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)} disabled={accountSubmitting}>
              إلغاء
            </Button>
            <Button onClick={handleAccountSubmit} disabled={accountSubmitting}>
              {accountSubmitting ? 'جاري الحفظ...' : 'حفظ الحساب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={entryDialogOpen} onOpenChange={(open) => {
        setEntryDialogOpen(open)
        if (!open) {
          resetEntryForm()
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>إضافة قيد محاسبي جديد</DialogTitle>
            <DialogDescription>قم بضبط البنود المدينة والدائنة وإجمالي القيد قبل الحفظ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="entry-date">تاريخ القيد</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={entryForm.date}
                  onChange={(event) => setEntryForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry-branch">الفرع</Label>
                <Select
                  value={entryForm.branchId}
                  onValueChange={(value) => setEntryForm((prev) => ({ ...prev, branchId: value }))}
                >
                  <SelectTrigger id="entry-branch">
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entry-description">وصف القيد</Label>
              <Input
                id="entry-description"
                value={entryForm.description}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="مثال: قيد سداد فاتورة مشتريات"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entry-reference">مرجع داخلي</Label>
              <Input
                id="entry-reference"
                value={entryForm.reference}
                onChange={(event) => setEntryForm((prev) => ({ ...prev, reference: event.target.value }))}
                placeholder="مثال: INV-2024-0012"
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="font-medium">بنود القيد</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddEntryItem}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة بند
                </Button>
              </div>

              <div className="space-y-3">
                {entryItems.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-lg border p-3 md:grid-cols-12 md:items-end md:gap-4">
                    <div className="md:col-span-4">
                      <Label>الحساب</Label>
                      <Select
                        value={item.accountId}
                        onValueChange={(value) => handleEntryItemChange(index, 'accountId', value)}
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
                    <div className="md:col-span-3">
                      <Label>الوصف</Label>
                      <Textarea
                        value={item.description}
                        onChange={(event) => handleEntryItemChange(index, 'description', event.target.value)}
                        rows={2}
                        placeholder="وصف اختياري للبند"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>مدين</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.debit ? item.debit.toString() : ''}
                        onChange={(event) => handleEntryItemChange(index, 'debit', event.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>دائن</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.credit ? item.credit.toString() : ''}
                        onChange={(event) => handleEntryItemChange(index, 'credit', event.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-end md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEntryItem(index)}
                        disabled={entryItems.length <= 2}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 rounded-lg bg-muted p-3 text-sm md:flex-row md:items-center md:justify-between">
                <span>الإجمالي المدين: {totals.debit.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>الإجمالي الدائن: {totals.credit.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {entryError && <p className="text-sm text-destructive">{entryError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryDialogOpen(false)} disabled={entrySubmitting}>
              إلغاء
            </Button>
            <Button onClick={handleEntrySubmit} disabled={entrySubmitting}>
              {entrySubmitting ? 'جاري الحفظ...' : 'حفظ القيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل القيد المحاسبي</DialogTitle>
            {selectedEntry && (
              <DialogDescription>
                {selectedEntry.entryNumber} • {format(new Date(selectedEntry.date), 'dd/MM/yyyy', { locale: ar })}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">{selectedEntry.description}</p>
                {selectedEntry.reference && <p className="text-muted-foreground">المرجع: {selectedEntry.reference}</p>}
                {selectedEntry.branch && <p className="text-muted-foreground">الفرع: {selectedEntry.branch.name}</p>}
                <p className="text-muted-foreground">الحالة: {getStatusText(selectedEntry.status)}</p>
              </div>
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
                  {selectedEntry.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.account?.code ? `${item.account.code} - ` : ''}
                        {item.account?.name || 'غير معروف'}
                      </TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        {item.debit > 0
                          ? new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(item.debit)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.credit > 0
                          ? new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(item.credit)
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEntry(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
