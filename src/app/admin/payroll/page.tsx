'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Plus,
  CheckCircle,
  Pencil,
  HandCoins,
  Filter,
  Search,
  RefreshCcw,
  PieChart
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PayrollRecord {
  id: string
  employee: {
    id: string
    user: {
      name: string
    }
    department?: {
      name: string
    } | null
    position?: {
      title: string
    } | null
  }
  period: string
  basicSalary: number
  allowances: number
  deductions: number
  overtime: number
  bonus: number
  netSalary: number
  payDate?: string
  status: 'PENDING' | 'APPROVED' | 'PAID'
  creator: {
    name: string
  }
  approver?: {
    name: string
  }
}

interface PayrollStats {
  totalPayroll: number
  employeeCount: number
  averageSalary: number
  pendingCount: number
  totalAllowances: number
  totalDeductions: number
  totalOvertime: number
  totalBonus: number
  statusBreakdown: Record<'PENDING' | 'APPROVED' | 'PAID', number>
}

interface AdvanceSummary {
  totalAmount: number
  totalCount: number
  pendingCount: number
  byEmployee: Record<string, { total: number; pending: number; approved: number }>
  recent: Array<{
    id: string
    employeeName: string
    amount: number
    status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REJECTED' | 'CANCELLED'
    requestedAt: string
  }>
}

interface PayrollApiResponse {
  records: PayrollRecord[]
  stats?: Partial<PayrollStats>
  advances?: Partial<AdvanceSummary>
}

const createEmptyStats = (): PayrollStats => ({
  totalPayroll: 0,
  employeeCount: 0,
  averageSalary: 0,
  pendingCount: 0,
  totalAllowances: 0,
  totalDeductions: 0,
  totalOvertime: 0,
  totalBonus: 0,
  statusBreakdown: {
    PENDING: 0,
    APPROVED: 0,
    PAID: 0
  }
})

const createEmptyAdvanceSummary = (): AdvanceSummary => ({
  totalAmount: 0,
  totalCount: 0,
  pendingCount: 0,
  byEmployee: {},
  recent: []
})

const computeStatsFromRecords = (records: PayrollRecord[]): PayrollStats => {
  const next = createEmptyStats()

  for (const record of records) {
    const allowancesTotal = record.allowances + record.overtime + record.bonus

    next.totalPayroll += record.netSalary
    next.totalAllowances += allowancesTotal
    next.totalDeductions += record.deductions
    next.totalOvertime += record.overtime
    next.totalBonus += record.bonus

    if (record.status === 'PENDING' || record.status === 'APPROVED' || record.status === 'PAID') {
      next.statusBreakdown[record.status] += 1
    }
  }

  next.employeeCount = records.length
  next.averageSalary = records.length ? next.totalPayroll / records.length : 0
  next.pendingCount = next.statusBreakdown.PENDING

  return next
}

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [stats, setStats] = useState<PayrollStats>(() => createEmptyStats())
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null)
  const [editForm, setEditForm] = useState({
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    overtime: 0,
    bonus: 0
  })
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
  const [isAdvanceSubmitting, setIsAdvanceSubmitting] = useState(false)
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    employeeName: '',
    amount: '',
    reason: ''
  })
  const [advanceInsights, setAdvanceInsights] = useState<AdvanceSummary>(() => createEmptyAdvanceSummary())
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID'>('ALL')
  const [departmentFilter, setDepartmentFilter] = useState<'ALL' | string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const departmentOptions = useMemo(() => {
    const unique = new Set<string>()
    for (const record of payrollRecords) {
      const departmentName = record.employee.department?.name
      if (departmentName) {
        unique.add(departmentName)
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'ar'))
  }, [payrollRecords])

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return payrollRecords.filter((record) => {
      const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter
      if (!matchesStatus) {
        return false
      }

      const departmentName = record.employee.department?.name || ''
      const matchesDepartment = departmentFilter === 'ALL' || departmentName === departmentFilter
      if (!matchesDepartment) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const positionTitle = record.employee.position?.title || ''
      return (
        record.employee.user.name.toLowerCase().includes(normalizedSearch) ||
        departmentName.toLowerCase().includes(normalizedSearch) ||
        positionTitle.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [departmentFilter, payrollRecords, searchTerm, statusFilter])

  const filteredTotals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        acc.basicSalary += record.basicSalary
        acc.allowances += record.allowances + record.overtime + record.bonus
        acc.deductions += record.deductions
        acc.netSalary += record.netSalary
        return acc
      },
      { basicSalary: 0, allowances: 0, deductions: 0, netSalary: 0 }
    )
  }, [filteredRecords])

  const filteredAdvanceTotal = useMemo(() => {
    return filteredRecords.reduce((sum, record) => {
      const info = advanceInsights.byEmployee[record.employee.id]
      return sum + (info?.total ?? 0)
    }, 0)
  }, [advanceInsights, filteredRecords])

  const statusPercentages = useMemo(() => {
    if (stats.employeeCount === 0) {
      return { PENDING: 0, APPROVED: 0, PAID: 0 }
    }

    return {
      PENDING: Math.round((stats.statusBreakdown.PENDING / stats.employeeCount) * 100),
      APPROVED: Math.round((stats.statusBreakdown.APPROVED / stats.employeeCount) * 100),
      PAID: Math.round((stats.statusBreakdown.PAID / stats.employeeCount) * 100)
    }
  }, [stats])

  const handleExport = useCallback(() => {
    if (!filteredRecords.length) {
      toast.warning('لا توجد سجلات لتصديرها')
      return
    }

    const header = ['الموظف', 'القسم', 'الراتب الأساسي', 'البدلات', 'الخصومات', 'الراتب الصافي', 'الحالة']
    const rows = filteredRecords.map((record) => [
      record.employee.user.name,
      record.employee.department?.name || 'غير محدد',
      record.basicSalary,
      record.allowances + record.overtime + record.bonus,
      record.deductions,
      record.netSalary,
      getStatusText(record.status)
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payroll-${selectedPeriod}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('تم تصدير ملف CSV بنجاح')
  }, [filteredRecords, selectedPeriod])

  const handleResetFilters = useCallback(() => {
    setStatusFilter('ALL')
    setDepartmentFilter('ALL')
    setSearchTerm('')
  }, [])

  const filtersActive = useMemo(
    () => statusFilter !== 'ALL' || departmentFilter !== 'ALL' || searchTerm.trim() !== '',
    [departmentFilter, searchTerm, statusFilter]
  )

  const visibleCount = filteredRecords.length

  const fetchPayrollData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hr/payroll?period=${selectedPeriod}`)
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'فشل في تحميل بيانات الرواتب')
      }

      if (Array.isArray(payload)) {
        setPayrollRecords(payload)
        setStats(computeStatsFromRecords(payload))
        setAdvanceInsights(createEmptyAdvanceSummary())
        return
      }

      const data = payload as PayrollApiResponse
      const records = Array.isArray(data.records) ? data.records : []
      setPayrollRecords(records)

      const calculatedStats = computeStatsFromRecords(records)
      if (data.stats) {
        setStats({
          ...calculatedStats,
          ...data.stats,
          statusBreakdown: {
            ...calculatedStats.statusBreakdown,
            ...(data.stats.statusBreakdown ?? {})
          }
        })
      } else {
        setStats(calculatedStats)
      }

      if (data.advances) {
        setAdvanceInsights({
          ...createEmptyAdvanceSummary(),
          ...data.advances,
          byEmployee: data.advances.byEmployee ?? {},
          recent: data.advances.recent ?? []
        })
      } else {
        setAdvanceInsights(createEmptyAdvanceSummary())
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل بيانات الرواتب')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchPayrollData()
  }, [fetchPayrollData])

  const generatePayroll = async () => {
    try {
      setIsGenerating(true)
      
      // Fetch all employees
      const employeesResponse = await fetch('/api/employees')
      if (!employeesResponse.ok) {
        throw new Error('فشل في جلب بيانات الموظفين')
      }
      
      const employees = await employeesResponse.json()
      
      // Generate payroll records for each employee
      const payrollPromises = employees.map(async (employee: any) => {
        const basicSalary = employee.salary || 0
        const allowances = basicSalary * 0.2 // 20% allowances
        const deductions = basicSalary * 0.1 // 10% deductions
        const overtime = Math.random() > 0.5 ? basicSalary * 0.05 : 0 // Random overtime
        const bonus = Math.random() > 0.7 ? basicSalary * 0.1 : 0 // Random bonus
        const response = await fetch('/api/hr/payroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId: employee.id,
            period: selectedPeriod,
            basicSalary,
            allowances,
            deductions,
            overtime,
            bonus
          })
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'فشل في إنشاء سجل الراتب')
        }

        return response.json().catch(() => null)
      })

      const results = await Promise.allSettled(payrollPromises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (successful > 0) {
        toast.success(`تم إنشاء ${successful} سجل راتب بنجاح`)
        if (failed > 0) {
          toast.warning(`فشل في إنشاء ${failed} سجل راتب`)
        }
        await fetchPayrollData()
      } else {
        toast.error('فشل في إنشاء سجلات الرواتب')
      }
    } catch (error) {
      console.error('Error generating payroll:', error)
      toast.error('حدث خطأ أثناء إنشاء كشف الرواتب')
    } finally {
      setIsGenerating(false)
    }
  }

  const approvePayroll = async (recordId: string) => {
    try {
      const response = await fetch(`/api/hr/payroll/${recordId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('تم اعتماد سجل الراتب')
        await fetchPayrollData()
      } else {
        toast.error('فشل في اعتماد سجل الراتب')
      }
    } catch (error) {
      console.error('Error approving payroll:', error)
      toast.error('حدث خطأ أثناء اعتماد سجل الراتب')
    }
  }

  const markAsPaid = async (recordId: string) => {
    try {
      const response = await fetch(`/api/hr/payroll/${recordId}/pay`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('تم تحديد سجل الراتب كمدفوع')
        await fetchPayrollData()
      } else {
        toast.error('فشل في تحديد سجل الراتب كمدفوع')
      }
    } catch (error) {
      console.error('Error marking payroll as paid:', error)
      toast.error('حدث خطأ أثناء تحديد سجل الراتب كمدفوع')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد الانتظار'
      case 'APPROVED': return 'معتمد'
      case 'PAID': return 'مدفوع'
      default: return status
    }
  }

  const getAdvanceStatusText = (status: AdvanceSummary['recent'][number]['status']) => {
    switch (status) {
      case 'PENDING':
        return 'قيد المراجعة'
      case 'APPROVED':
        return 'معتمدة'
      case 'DISBURSED':
        return 'مصروفة'
      case 'REJECTED':
        return 'مرفوضة'
      case 'CANCELLED':
        return 'ملغاة'
      default:
        return status
    }
  }

  const getAdvanceStatusColor = (status: AdvanceSummary['recent'][number]['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700'
      case 'DISBURSED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const openEditModal = (record: PayrollRecord) => {
    setEditingRecord(record)
    setEditForm({
      basicSalary: record.basicSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      overtime: record.overtime,
      bonus: record.bonus
    })
    setIsEditModalOpen(true)
  }

  const openAdvanceModal = (record: PayrollRecord) => {
    setAdvanceForm({
      employeeId: record.employee.id,
      employeeName: record.employee.user.name,
      amount: '',
      reason: ''
    })
    setIsAdvanceModalOpen(true)
  }

  const handleEditChange = (field: keyof typeof editForm, value: number) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAdvanceChange = (field: keyof typeof advanceForm, value: string) => {
    setAdvanceForm(prev => ({ ...prev, [field]: value }))
  }

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingRecord) return

    try {
      const response = await fetch(`/api/hr/payroll/${editingRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        toast.error('فشل في تحديث سجل الراتب')
        return
      }

      toast.success('تم تحديث سجل الراتب بنجاح')
      setIsEditModalOpen(false)
      setEditingRecord(null)
      await fetchPayrollData()
    } catch (error) {
      console.error('Error updating payroll record:', error)
      toast.error('حدث خطأ أثناء تحديث سجل الراتب')
    }
  }

  const submitAdvance = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!advanceForm.employeeId) {
      toast.error('تعذر تحديد الموظف للسلفة')
      return
    }

    const amountValue = parseFloat(advanceForm.amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error('الرجاء إدخال مبلغ صالح للسلفة')
      return
    }

    setIsAdvanceSubmitting(true)
    try {
      const response = await fetch('/api/hr/salary-advances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: advanceForm.employeeId,
          amount: amountValue,
          reason: advanceForm.reason || undefined
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'فشل في تسجيل السلفة')
      }

      toast.success('تم تسجيل السلفة بنجاح')
      setIsAdvanceModalOpen(false)
      setAdvanceForm({ employeeId: '', employeeName: '', amount: '', reason: '' })
    } catch (error) {
      console.error('Error creating salary advance:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تسجيل السلفة')
    } finally {
      setIsAdvanceSubmitting(false)
    }
  }

  const getPeriodEndDate = () => {
    const [year, month] = selectedPeriod.split('-').map(Number)
    const endOfMonth = new Date(year, month, 0)
    endOfMonth.setHours(23, 59, 59, 999)
    return endOfMonth
  }

  const getNextPayDate = () => {
    const payDate = getPeriodEndDate()
    return format(payDate, 'd MMMM', { locale: ar })
  }

  const getDaysUntilPayday = () => {
    const now = new Date()
    const payDate = getPeriodEndDate()
    const diffTime = payDate.getTime() - now.getTime()
    if (diffTime <= 0) {
      return 0
    }
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الرواتب</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة عمليات الرواتب للفترة المختارة مع مراقبة السلف والحالات المختلفة.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={format(new Date(), 'yyyy-MM')}>هذا الشهر</SelectItem>
              <SelectItem value={format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM')}>
                الشهر الماضي
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchPayrollData()} disabled={loading}>
            <RefreshCcw className="ml-2 h-4 w-4" />
            تحديث البيانات
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            تصدير CSV
          </Button>
          <Button
            onClick={generatePayroll}
            disabled={isGenerating}
          >
            <Plus className="ml-2 h-4 w-4" />
            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء كشف رواتب'}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/test-data', {
                  method: 'POST'
                })
                const result = await response.json()
                if (response.ok) {
                  toast.success(result.message || 'تم إنشاء بيانات تجريبية')
                  await fetchPayrollData()
                } else {
                  toast.error(result.error || 'فشل في إنشاء البيانات التجريبية')
                }
              } catch (error) {
                toast.error('حدث خطأ أثناء إنشاء البيانات التجريبية')
              }
            }}
          >
            <Users className="ml-2 h-4 w-4" />
            إنشاء بيانات تجريبية
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث باسم الموظف أو القسم أو المسمى"
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="حالة السجل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الحالات</SelectItem>
              <SelectItem value="PENDING">قيد الانتظار</SelectItem>
              <SelectItem value="APPROVED">معتمد</SelectItem>
              <SelectItem value="PAID">مدفوع</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value as typeof departmentFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="كل الأقسام" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الأقسام</SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Badge variant={filtersActive ? 'default' : 'secondary'} className="whitespace-nowrap">
              {visibleCount} سجل
            </Badge>
            <Button variant="outline" onClick={handleResetFilters} disabled={!filtersActive}>
              <Filter className="ml-2 h-4 w-4" />
              إعادة الضبط
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              لشهر {format(new Date(selectedPeriod + '-01'), 'MMMM', { locale: ar })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employeeCount}</div>
            <p className="text-xs text-muted-foreground">
              في قائمة الرواتب ({stats.pendingCount} قيد الاعتماد)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الراتب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageSalary)}</div>
            <p className="text-xs text-muted-foreground">
              لكل موظف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تاريخ الدفع</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getNextPayDate()}</div>
            <p className="text-xs text-muted-foreground">
              بعد {getDaysUntilPayday()} أيام
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكونات الرواتب</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">إجمالي البدلات</span>
              <span className="font-medium text-emerald-600">{formatCurrency(stats.totalAllowances)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الساعات الإضافية</span>
              <span className="font-medium">{formatCurrency(stats.totalOvertime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">المكافآت</span>
              <span className="font-medium">{formatCurrency(stats.totalBonus)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">إجمالي الخصومات</span>
              <span className="font-medium text-red-600">{formatCurrency(stats.totalDeductions)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة السجلات</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>قيد الانتظار</span>
              <span className="font-medium">
                {stats.statusBreakdown.PENDING} ({statusPercentages.PENDING}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>معتمد</span>
              <span className="font-medium">
                {stats.statusBreakdown.APPROVED} ({statusPercentages.APPROVED}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>مدفوع</span>
              <span className="font-medium">
                {stats.statusBreakdown.PAID} ({statusPercentages.PAID}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">السلف</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">إجمالي السلف</span>
              <span className="font-medium">{formatCurrency(advanceInsights.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">عدد السلف</span>
              <span className="font-medium">{advanceInsights.totalCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">سلف قيد الموافقة</span>
              <span className="font-medium text-amber-600">{advanceInsights.pendingCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الرواتب</CardTitle>
          <CardDescription>
            ملخص رواتب الموظفين لشهر {format(new Date(selectedPeriod + '-01'), 'MMMM yyyy', { locale: ar })}
            {filtersActive ? ' (بعد تطبيق عوامل التصفية)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>الراتب الأساسي</TableHead>
                  <TableHead>البدلات</TableHead>
                  <TableHead>الخصومات</TableHead>
                  <TableHead>السلف</TableHead>
                  <TableHead>الراتب الصافي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const advanceInfo = advanceInsights.byEmployee[record.employee.id]

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employee.user.name}</div>
                          <div className="text-sm text-muted-foreground">{record.employee.position?.title || 'غير محدد'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.employee.department?.name || 'غير محدد'}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                      <TableCell>{formatCurrency(record.allowances + record.overtime + record.bonus)}</TableCell>
                      <TableCell>{formatCurrency(record.deductions)}</TableCell>
                      <TableCell>
                        {advanceInfo ? (
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">{formatCurrency(advanceInfo.total)}</div>
                            {advanceInfo.pending > 0 && (
                              <div className="text-xs text-amber-600">قيد الموافقة: {formatCurrency(advanceInfo.pending)}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(record.netSalary)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAdvanceModal(record)}
                            title="تسجيل سلفة"
                          >
                            <HandCoins className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {record.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approvePayroll(record.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {record.status === 'APPROVED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsPaid(record.id)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          {record.status === 'PAID' && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-4 w-4 ml-1" />
                              مدفوع
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredRecords.length > 0 && (
                  <TableRow className="bg-muted/40 font-medium">
                    <TableCell>الإجمالي</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{formatCurrency(filteredTotals.basicSalary)}</TableCell>
                    <TableCell>{formatCurrency(filteredTotals.allowances)}</TableCell>
                    <TableCell>{formatCurrency(filteredTotals.deductions)}</TableCell>
                    <TableCell>
                      {filteredAdvanceTotal > 0 ? formatCurrency(filteredAdvanceTotal) : '—'}
                    </TableCell>
                    <TableCell>{formatCurrency(filteredTotals.netSalary)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {payrollRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سجلات رواتب لهذه الفترة
            </div>
          )}
          {payrollRecords.length > 0 && filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سجلات مطابقة لعوامل التصفية الحالية
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أحدث السلف</CardTitle>
          <CardDescription>
            آخر السلف المسجلة للموظفين ضمن هذه الفترة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {advanceInsights.recent.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advanceInsights.recent.map((advance) => (
                    <TableRow key={advance.id}>
                      <TableCell>{advance.employeeName}</TableCell>
                      <TableCell>{formatCurrency(advance.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getAdvanceStatusColor(advance.status)}>
                          {getAdvanceStatusText(advance.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(advance.requestedAt), 'dd MMM yyyy', { locale: ar })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سلف حديثة مرتبطة بهذه الفترة بعد
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open)
        if (!open) {
          setEditingRecord(null)
        }
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>تعديل مكونات الراتب</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="basicSalary">الراتب الأساسي</Label>
                <Input
                  id="basicSalary"
                  type="number"
                  min={0}
                  value={editForm.basicSalary}
                  onChange={(event) => handleEditChange('basicSalary', Number(event.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowances">البدلات</Label>
                <Input
                  id="allowances"
                  type="number"
                  min={0}
                  value={editForm.allowances}
                  onChange={(event) => handleEditChange('allowances', Number(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deductions">الخصومات</Label>
                <Input
                  id="deductions"
                  type="number"
                  min={0}
                  value={editForm.deductions}
                  onChange={(event) => handleEditChange('deductions', Number(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="overtime">الساعات الإضافية</Label>
                <Input
                  id="overtime"
                  type="number"
                  min={0}
                  value={editForm.overtime}
                  onChange={(event) => handleEditChange('overtime', Number(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bonus">المكافآت</Label>
                <Input
                  id="bonus"
                  type="number"
                  min={0}
                  value={editForm.bonus}
                  onChange={(event) => handleEditChange('bonus', Number(event.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">حفظ التعديلات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isAdvanceModalOpen} onOpenChange={(open) => {
        setIsAdvanceModalOpen(open)
        if (!open) {
          setAdvanceForm({ employeeId: '', employeeName: '', amount: '', reason: '' })
        }
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>تسجيل سلفة راتب</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitAdvance} className="space-y-4">
            <div className="space-y-2">
              <Label>الموظف</Label>
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                {advanceForm.employeeName || 'غير محدد'}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="advanceAmount">مبلغ السلفة</Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={advanceForm.amount}
                  onChange={(event) => handleAdvanceChange('amount', event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="advanceReason">سبب السلفة (اختياري)</Label>
                <Textarea
                  id="advanceReason"
                  value={advanceForm.reason}
                  onChange={(event) => handleAdvanceChange('reason', event.target.value)}
                  placeholder="أدخل سبب السلفة"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdvanceModalOpen(false)
                  setAdvanceForm({ employeeId: '', employeeName: '', amount: '', reason: '' })
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isAdvanceSubmitting}>
                {isAdvanceSubmitting ? 'جاري الحفظ...' : 'تسجيل السلفة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
