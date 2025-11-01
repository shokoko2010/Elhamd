'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, FileText, TrendingUp, DollarSign, Plus, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface ChartOfAccount {
  id: string
  code: string
  name: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  isActive: boolean
  normalBalance: 'DEBIT' | 'CREDIT'
  parent?: {
    id: string
    name: string
  }
}

interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  description: string
  reference?: string
  totalDebit: number
  totalCredit: number
  status: 'DRAFT' | 'POSTED' | 'APPROVED' | 'REVERSED' | 'CANCELLED'
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  branch?: {
    id: string
    name: string
  }
  items?: JournalEntryItem[]
}

interface JournalEntryItem {
  id: string
  account: ChartOfAccount
  description?: string
  debit: number
  credit: number
}

export default function AccountingPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('dashboard')

  useEffect(() => {
    fetchAccountingData()
  }, [])

  const fetchAccountingData = async () => {
    try {
      setLoading(true)
      const [accountsRes, entriesRes] = await Promise.all([
        fetch('/api/accounting/accounts'),
        fetch('/api/accounting/journal-entries')
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(Array.isArray(accountsData) ? accountsData : [])
      } else {
        console.error('Failed to fetch accounts:', accountsRes.status)
        setAccounts([])
      }

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json()
        setJournalEntries(Array.isArray(entriesData) ? entriesData : [])
      } else {
        console.error('Failed to fetch journal entries:', entriesRes.status)
        setJournalEntries([])
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error)
      setAccounts([])
      setJournalEntries([])
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
      case 'REVERSED': return 'ملغاة'
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

  // Calculate financial summary
  const financialSummary = {
    totalAssets: accounts
      .filter(a => a.type === 'ASSET' && a.isActive)
      .reduce((sum, account) => {
        // This would normally be calculated from actual balances
        return sum + 0 // Placeholder
      }, 0),
    
    totalLiabilities: accounts
      .filter(a => a.type === 'LIABILITY' && a.isActive)
      .reduce((sum, account) => {
        return sum + 0 // Placeholder
      }, 0),
    
    totalRevenue: accounts
      .filter(a => a.type === 'REVENUE' && a.isActive)
      .reduce((sum, account) => {
        return sum + 0 // Placeholder
      }, 0),
    
    totalExpenses: accounts
      .filter(a => a.type === 'EXPENSE' && a.isActive)
      .reduce((sum, account) => {
        return sum + 0 // Placeholder
      }, 0),
  }

  const netIncome = financialSummary.totalRevenue - financialSummary.totalExpenses
  const equity = financialSummary.totalAssets - financialSummary.totalLiabilities

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
        <div>
          <h1 className="text-3xl font-bold">المحاسبة</h1>
          <p className="text-muted-foreground">إدارة الحسابات المالية والقيود المحاسبية</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Calculator className="ml-2 h-4 w-4" />
            تقرير مالي
          </Button>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            قيد جديد
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
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
            <p className="text-xs text-muted-foreground">
              إجمالي الأصول المتداولة والثابتة
            </p>
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
            <p className="text-xs text-muted-foreground">
              إجمالي الالتزامات الحالية والطويلة الأجل
            </p>
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
              }).format(financialSummary.totalRevenue)} إيرادات - {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(financialSummary.totalExpenses)} مصروفات
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
            <p className="text-xs text-muted-foreground">
              أصول - خصوم
            </p>
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
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                        <Badge className={getStatusColor(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
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
                  {['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map((type) => {
                    const typeAccounts = accounts.filter(a => a.type === type && a.isActive)
                    const totalActiveAccounts = accounts.filter(a => a.isActive).length
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {getAccountTypeText(type)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {typeAccounts.length} حساب
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {totalActiveAccounts > 0 ? Math.round((typeAccounts.length / totalActiveAccounts) * 100) : 0}%
                          </span>
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
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>دليل الحسابات</CardTitle>
                  <CardDescription>عرض وإدارة جميع الحسابات المحاسبية</CardDescription>
                </div>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  حساب جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
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
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  قيد جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg">
                    <div className="flex items-center justify-between p-4 border-b">
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
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm">
                            مدين: {new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(entry.totalDebit)}
                          </p>
                          <p className="text-sm">
                            دائن: {new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(entry.totalCredit)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
                        <Button variant="outline" size="sm">
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
                                <TableCell>{item.account.code} - {item.account.name}</TableCell>
                                <TableCell>{item.description || '-'}</TableCell>
                                <TableCell className="text-right">
                                  {item.debit > 0 ? new Intl.NumberFormat('ar-EG', {
                                    style: 'currency',
                                    currency: 'EGP'
                                  }).format(item.debit) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.credit > 0 ? new Intl.NumberFormat('ar-EG', {
                                    style: 'currency',
                                    currency: 'EGP'
                                  }).format(item.credit) : '-'}
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

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">قائمة الدخل</CardTitle>
                <CardDescription>
                  عرض الإيرادات والمصروفات وصافي الدخل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">الميزانية العمومية</CardTitle>
                <CardDescription>
                  عرض الأصول والخصوم وحقوق الملكية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">قائمة التدفق النقدي</CardTitle>
                <CardDescription>
                  عرض التدفقات النقدية الداخلة والخارجة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">كشف الحسابات</CardTitle>
                <CardDescription>
                  عرض حركات الحسابات المفصلة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">تقرير الضرائب</CardTitle>
                <CardDescription>
                  عرض الالتزامات الضريبية والمدفوعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">تقرير الأداء المالي</CardTitle>
                <CardDescription>
                  عرض مؤشرات الأداء المالي الرئيسية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}