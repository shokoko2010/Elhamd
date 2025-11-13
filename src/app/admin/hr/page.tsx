'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Eye,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface HRStats {
  totalEmployees: number
  pendingLeaves: number
  totalPayroll: number
  activeRate: number
}

interface NewEmployee {
  id: string
  name: string
  position: string
  department: string
  hireDate: string
}

interface LeaveRequest {
  id: string
  employee: {
    user: {
      name: string
    }
  }
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  status: string
}

interface DepartmentStats {
  id: string
  department: string
  employees: number
  percentage: number
}

type SalaryAdvanceStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DISBURSED'
  | 'IN_REPAYMENT'
  | 'REPAID'
  | 'REJECTED'

interface RepaymentScheduleEntry {
  dueDate: string
  amount: number
  status: 'PENDING' | 'PAID'
}

interface SalaryAdvance {
  id: string
  employeeId: string
  amount: number
  status: SalaryAdvanceStatus
  requestedAt: string
  approvedAt?: string | null
  disbursedAt?: string | null
  repaymentStart?: string | null
  repaymentMonths?: number | null
  repaymentSchedule?: RepaymentScheduleEntry[] | null
  repaidAmount: number
  nextDueDate?: string | null
  reason?: string | null
  notes?: string | null
  employee?: {
    user?: {
      name?: string | null
      email?: string | null
    } | null
    department?: {
      name?: string | null
    } | null
    position?: {
      title?: string | null
    } | null
  } | null
  requester?: {
    name?: string | null
    email?: string | null
  } | null
  approver?: {
    name?: string | null
    email?: string | null
  } | null
}

export default function HRPage() {
  const createInitialAdvanceForm = () => ({
    employeeId: '',
    amount: '',
    reason: '',
    repaymentMonths: '3',
    repaymentStart: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
    activeRate: 0
  })
  const [newEmployees, setNewEmployees] = useState<NewEmployee[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [employeesList, setEmployeesList] = useState<any[]>([])
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([])
  const [advancesLoading, setAdvancesLoading] = useState(true)
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false)
  const [advanceSubmitting, setAdvanceSubmitting] = useState(false)
  const [advanceForm, setAdvanceForm] = useState(createInitialAdvanceForm)
  const [repaymentModalOpen, setRepaymentModalOpen] = useState(false)
  const [repaymentForm, setRepaymentForm] = useState({ amount: '', notes: '' })
  const [activeAdvance, setActiveAdvance] = useState<SalaryAdvance | null>(null)
  const [updatingAdvanceId, setUpdatingAdvanceId] = useState<string | null>(null)

  useEffect(() => {
    fetchHRData()
    fetchSalaryAdvances()
  }, [])

  const fetchHRData = async () => {
    try {
      // Fetch employees data
      const employeesRes = await fetch('/api/admin/employees')
      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        const employees = employeesData.employees || []

        // Ensure employees is an array
        if (Array.isArray(employees)) {
          setEmployeesList(employees)
          // Calculate stats
          const activeEmployees = employees.filter((e: any) => e.status === 'ACTIVE').length
          const totalPayroll = employees.reduce((sum: number, e: any) => sum + (e.salary || 0), 0)
          const activeRate = employees.length > 0 ? Math.round((activeEmployees / employees.length) * 100) : 0
          
          setStats({
            totalEmployees: employees.length,
            pendingLeaves: 0, // Will be updated below
            totalPayroll,
            activeRate
          })

          // Get new employees (last 30 days)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const newEmps = employees
            .filter((e: any) => e.hireDate && new Date(e.hireDate) >= thirtyDaysAgo)
            .slice(0, 4)
            .map((e: any) => ({
              id: e.id || `emp-${Math.random()}`,
              name: e.user?.name || 'غير معروف',
              position: e.position?.title || 'غير محدد',
              department: e.department?.name || 'غير محدد',
              hireDate: e.hireDate ? new Date(e.hireDate).toISOString().split('T')[0] : 'غير محدد'
            }))
          setNewEmployees(newEmps)

          // Calculate department stats
          const deptMap = new Map<string, number>()
          employees.forEach((e: any) => {
            const dept = e.department?.name || 'غير محدد'
            deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
          })
          
          const deptStats = Array.from(deptMap.entries()).map(([dept, count]) => ({
            id: `dept-${dept}-${count}`,
            department: dept,
            employees: count,
            percentage: employees.length > 0 ? Math.round((count / employees.length) * 100) : 0
          }))
          setDepartmentStats(deptStats)
        }
      }

      // Fetch leave requests
      const leavesRes = await fetch('/api/hr/leave-requests')
      if (leavesRes.ok) {
        const leaves = await leavesRes.json()
        
        // Ensure leaves is an array
        if (Array.isArray(leaves)) {
          const pendingLeaves = leaves.filter((l: any) => l.status === 'PENDING').length
          
          setStats(prev => ({ ...prev, pendingLeaves }))
          
          // Get recent leave requests
          const recentLeaves = leaves.slice(0, 4).map((l: any) => ({
            id: l.id || `leave-${Math.random()}`,
            employee: l.employee || { user: { name: 'غير معروف' } },
            leaveType: l.leaveType || 'غير محدد',
            startDate: l.startDate ? new Date(l.startDate).toISOString().split('T')[0] : 'غير محدد',
            endDate: l.endDate ? new Date(l.endDate).toISOString().split('T')[0] : 'غير محدد',
            totalDays: l.totalDays || 0,
            status: l.status || 'PENDING'
          }))
          setLeaveRequests(recentLeaves)
        }
      }
    } catch (error) {
      console.error('Error fetching HR data:', error)
      // Set empty data on error to prevent crashes
      setNewEmployees([])
      setLeaveRequests([])
      setDepartmentStats([])
      setEmployeesList([])
      setStats({
        totalEmployees: 0,
        pendingLeaves: 0,
        totalPayroll: 0,
        activeRate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSalaryAdvances = async () => {
    try {
      setAdvancesLoading(true)
      const response = await fetch('/api/hr/salary-advances')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setSalaryAdvances(data)
        } else {
          setSalaryAdvances([])
        }
      } else {
        throw new Error('Failed to load salary advances')
      }
    } catch (error) {
      console.error('Error fetching salary advances:', error)
      setSalaryAdvances([])
      toast.error('فشل في تحميل طلبات السلف')
    } finally {
      setAdvancesLoading(false)
    }
  }

  const resetAdvanceForm = () => {
    setAdvanceForm(createInitialAdvanceForm())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getLeaveTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'ANNUAL': 'إجازة اعتيادية',
      'SICK': 'إجازة مرضية',
      'EMERGENCY': 'إجازة طارئة',
      'MATERNITY': 'إجازة أمومة',
      'PATERNITY': 'إجازة أبوة'
    }
    return types[type] || type
  }

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      'PENDING': 'قيد الانتظار',
      'APPROVED': 'معتمد',
      'REJECTED': 'مرفوض'
    }
    return statuses[status] || status
  }

  const formatDateValue = (value?: string | null) => {
    if (!value) {
      return 'غير محدد'
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return 'غير محدد'
    }

    return parsed.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const advanceStatusConfig: Record<SalaryAdvanceStatus, { label: string; className: string; variant: 'outline' | 'destructive' }> = {
    PENDING: {
      label: 'قيد المراجعة',
      className: 'border-yellow-200 bg-yellow-100 text-yellow-800',
      variant: 'outline'
    },
    APPROVED: {
      label: 'معتمد',
      className: 'border-blue-200 bg-blue-100 text-blue-800',
      variant: 'outline'
    },
    DISBURSED: {
      label: 'مصروفة',
      className: 'border-indigo-200 bg-indigo-100 text-indigo-800',
      variant: 'outline'
    },
    IN_REPAYMENT: {
      label: 'جاري السداد',
      className: 'border-purple-200 bg-purple-100 text-purple-800',
      variant: 'outline'
    },
    REPAID: {
      label: 'مسددة بالكامل',
      className: 'border-emerald-200 bg-emerald-100 text-emerald-700',
      variant: 'outline'
    },
    REJECTED: {
      label: 'مرفوضة',
      className: 'border-red-200 bg-red-100 text-red-800',
      variant: 'destructive'
    }
  }

  const renderAdvanceStatus = (status: SalaryAdvanceStatus) => {
    const config = advanceStatusConfig[status]
    return (
      <Badge variant={config.variant} className={`border ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  const getAdvanceStatusMessage = (status: SalaryAdvanceStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'تم اعتماد السلفة بنجاح'
      case 'REJECTED':
        return 'تم رفض السلفة'
      case 'DISBURSED':
        return 'تم تسجيل صرف السلفة'
      case 'REPAID':
        return 'تم إغلاق السلفة بعد السداد الكامل'
      case 'IN_REPAYMENT':
        return 'تم تحديث حالة السلفة'
      default:
        return 'تم تحديث حالة السلفة'
    }
  }

  const handleCreateAdvance = async () => {
    if (!advanceForm.employeeId) {
      toast.error('الرجاء اختيار الموظف')
      return
    }

    const amountValue = parseFloat(advanceForm.amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error('الرجاء إدخال مبلغ صالح للسلفة')
      return
    }

    setAdvanceSubmitting(true)
    try {
      const response = await fetch('/api/hr/salary-advances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: advanceForm.employeeId,
          amount: amountValue,
          reason: advanceForm.reason,
          repaymentMonths: advanceForm.repaymentMonths ? Number(advanceForm.repaymentMonths) : null,
          repaymentStart: advanceForm.repaymentMonths && Number(advanceForm.repaymentMonths) > 0 ? advanceForm.repaymentStart : null,
          notes: advanceForm.notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'فشل في إنشاء السلفة')
      }

      toast.success('تم إنشاء طلب السلفة بنجاح')
      setSalaryAdvances((prev) => {
        const filtered = prev.filter((item) => item.id !== data.id)
        return [data as SalaryAdvance, ...filtered]
      })
      setAdvanceModalOpen(false)
      resetAdvanceForm()
    } catch (error) {
      console.error('Error creating salary advance:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء السلفة')
    } finally {
      setAdvanceSubmitting(false)
    }
  }

  const handleAdvanceStatusChange = async (advance: SalaryAdvance, nextStatus: SalaryAdvanceStatus) => {
    if (nextStatus === 'REJECTED') {
      const confirmed = window.confirm('هل أنت متأكد من رفض طلب السلفة؟')
      if (!confirmed) {
        return
      }
    }

    setUpdatingAdvanceId(advance.id)
    try {
      const response = await fetch(`/api/hr/salary-advances/${advance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'فشل في تحديث حالة السلفة')
      }

      setSalaryAdvances((prev) => prev.map((item) => (item.id === data.id ? (data as SalaryAdvance) : item)))
      toast.success(getAdvanceStatusMessage(nextStatus))
    } catch (error) {
      console.error('Error updating salary advance:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تحديث حالة السلفة')
    } finally {
      setUpdatingAdvanceId(null)
    }
  }

  const openRepaymentModal = (advance: SalaryAdvance) => {
    setActiveAdvance(advance)
    const outstanding = Math.max(0, (advance.amount || 0) - (advance.repaidAmount || 0))
    setRepaymentForm({
      amount: outstanding > 0 ? outstanding.toFixed(2) : '',
      notes: ''
    })
    setRepaymentModalOpen(true)
  }

  const handleRecordRepayment = async () => {
    if (!activeAdvance) {
      return
    }

    const paymentValue = parseFloat(repaymentForm.amount)
    if (Number.isNaN(paymentValue) || paymentValue <= 0) {
      toast.error('الرجاء إدخال مبلغ سداد صالح')
      return
    }

    setUpdatingAdvanceId(activeAdvance.id)
    try {
      const response = await fetch(`/api/hr/salary-advances/${activeAdvance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentAmount: paymentValue, notes: repaymentForm.notes })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'فشل في تسجيل السداد')
      }

      setSalaryAdvances((prev) => prev.map((item) => (item.id === data.id ? (data as SalaryAdvance) : item)))
      toast.success('تم تسجيل السداد بنجاح')
      setRepaymentModalOpen(false)
      setActiveAdvance(null)
      setRepaymentForm({ amount: '', notes: '' })
    } catch (error) {
      console.error('Error recording repayment:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تسجيل السداد')
    } finally {
      setUpdatingAdvanceId(null)
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الموارد البشرية</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch('/api/init-data', {
                  method: 'POST'
                })
                const result = await response.json()
                if (response.ok) {
                  toast.success(result.message || 'تم تهيئة البيانات بنجاح')
                  fetchHRData()
                } else {
                  toast.error(result.error || 'فشل في تهيئة البيانات')
                }
              } catch (error) {
                toast.error('حدث خطأ أثناء تهيئة البيانات')
              }
            }}
          >
            <Users className="ml-2 h-4 w-4" />
            تهيئة البيانات
          </Button>
          <Link href="/admin/employees">
            <Button variant="outline">
              <Eye className="ml-2 h-4 w-4" />
              عرض الموظفين
            </Button>
          </Link>
          <Link href="/admin/employees">
            <Button>
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة موظف
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.activeRate)}% نشطين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات المعلقة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">
              تنتظر الموافقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              شهرياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة النشاط</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRate}%</div>
            <p className="text-xs text-muted-foreground">
              موظفين نشطين
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الموظفون الجدد</CardTitle>
            <CardDescription>
              آخر الموظفين الذين انضموا للشركة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newEmployees.length > 0 ? (
                newEmployees.map((employee) => (
                  <div key={String(employee.id)} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{employee.name || 'غير معروف'}</p>
                      <p className="text-sm text-muted-foreground">{employee.position || 'غير محدد'} - {employee.department || 'غير محدد'}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">{employee.hireDate || 'غير محدد'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">لا يوجد موظفون جدد خلال الـ 30 يوم الماضية</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>طلبات الإجازات</CardTitle>
            <CardDescription>
              الطلبات التي تحتاج لموافقتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <div key={String(leave.id)} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{leave.employee?.user?.name || 'غير معروف'}</p>
                      <p className="text-sm text-muted-foreground">{getLeaveTypeText(leave.leaveType)} - {leave.startDate} إلى {leave.endDate}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">{leave.totalDays} أيام</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(leave.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">لا توجد طلبات إجازات معلقة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>طلبات السلف</CardTitle>
            <CardDescription>
              إدارة طلبات السلف وجدولة خطة السداد للموظفين
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSalaryAdvances}
              disabled={advancesLoading}
            >
              {advancesLoading ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="ml-2 h-4 w-4" />
              )}
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetAdvanceForm()
                setAdvanceModalOpen(true)
              }}
              disabled={employeesList.length === 0}
            >
              <Plus className="ml-2 h-4 w-4" />
              طلب سلفة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {advancesLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : salaryAdvances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-right">الموظف</th>
                    <th className="py-3 px-4 text-right">المبلغ</th>
                    <th className="py-3 px-4 text-right">المدفوع</th>
                    <th className="py-3 px-4 text-right">المتبقي</th>
                    <th className="py-3 px-4 text-right">الحالة</th>
                    <th className="py-3 px-4 text-right">أقرب استحقاق</th>
                    <th className="py-3 px-4 text-right">تاريخ الطلب</th>
                    <th className="py-3 px-4 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryAdvances.map((advance) => {
                    const paidAmount = advance.repaidAmount || 0
                    const outstanding = Math.max(0, (advance.amount || 0) - paidAmount)

                    return (
                      <tr key={advance.id} className="border-b">
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium">
                            {advance.employee?.user?.name || 'غير معروف'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {advance.employee?.department?.name || 'غير محدد'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-blue-600">
                          {formatCurrency(advance.amount)}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600">
                          {formatCurrency(paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600">
                          {formatCurrency(outstanding)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {renderAdvanceStatus(advance.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatDateValue(advance.nextDueDate)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatDateValue(advance.requestedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {advance.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAdvanceStatusChange(advance, 'APPROVED')}
                                  disabled={updatingAdvanceId === advance.id}
                                >
                                  {updatingAdvanceId === advance.id ? (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  اعتماد
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAdvanceStatusChange(advance, 'REJECTED')}
                                  disabled={updatingAdvanceId === advance.id}
                                >
                                  رفض
                                </Button>
                              </>
                            )}

                            {advance.status === 'APPROVED' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAdvanceStatusChange(advance, 'DISBURSED')}
                                  disabled={updatingAdvanceId === advance.id}
                                >
                                  {updatingAdvanceId === advance.id ? (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  صرف السلفة
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAdvanceStatusChange(advance, 'REJECTED')}
                                  disabled={updatingAdvanceId === advance.id}
                                >
                                  رفض
                                </Button>
                              </>
                            )}

                            {(advance.status === 'DISBURSED' || advance.status === 'IN_REPAYMENT') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRepaymentModal(advance)}
                                disabled={updatingAdvanceId === advance.id}
                              >
                                تسجيل سداد
                              </Button>
                            )}

                            {advance.status === 'REPAID' && (
                              <span className="text-xs text-muted-foreground">تم السداد بالكامل</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p className="font-medium">لا توجد طلبات سلف مسجلة حالياً</p>
              <p className="text-sm">يمكنك إضافة طلب جديد من خلال زر "طلب سلفة جديدة"</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
          <CardDescription>
            نظرة عامة على توزيع الموظفين في الأقسام المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.length > 0 ? (
              departmentStats.map((dept) => (
                <div key={String(dept.id)} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{dept.department || 'غير محدد'}</p>
                    <p className="text-sm text-muted-foreground">{dept.employees || 0} موظف</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{dept.percentage || 0}%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, dept.percentage || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">لا توجد بيانات كافية لعرض التوزيع</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={advanceModalOpen}
        onOpenChange={(open) => {
          setAdvanceModalOpen(open)
          if (!open) {
            resetAdvanceForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>طلب سلفة جديدة</DialogTitle>
            <DialogDescription>
              قم بتحديد الموظف، قيمة السلفة، وخطة السداد المناسبة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الموظف</Label>
              <Select
                value={advanceForm.employeeId}
                onValueChange={(value) => setAdvanceForm((prev) => ({ ...prev, employeeId: value }))}
                disabled={employeesList.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={employeesList.length ? 'اختر الموظف' : 'لا يوجد موظفون متاحون'} />
                </SelectTrigger>
                <SelectContent>
                  {employeesList.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee?.user?.name || 'غير معروف'}
                      {employee?.department?.name ? ` - ${employee.department.name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>مبلغ السلفة</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="مثال: 5000"
                  value={advanceForm.amount}
                  onChange={(event) => setAdvanceForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>عدد الأشهر</Label>
                <Select
                  value={advanceForm.repaymentMonths}
                  onValueChange={(value) => setAdvanceForm((prev) => ({ ...prev, repaymentMonths: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="عدد الأشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">بدون تقسيط</SelectItem>
                    <SelectItem value="3">3 أشهر</SelectItem>
                    <SelectItem value="6">6 أشهر</SelectItem>
                    <SelectItem value="9">9 أشهر</SelectItem>
                    <SelectItem value="12">12 شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {advanceForm.repaymentMonths && Number(advanceForm.repaymentMonths) > 0 && (
              <div className="space-y-2">
                <Label>تاريخ أول قسط</Label>
                <Input
                  type="date"
                  value={advanceForm.repaymentStart}
                  onChange={(event) => setAdvanceForm((prev) => ({ ...prev, repaymentStart: event.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>سبب السلفة (اختياري)</Label>
              <Textarea
                rows={3}
                placeholder="مثال: تغطية مصاريف علاجية"
                value={advanceForm.reason}
                onChange={(event) => setAdvanceForm((prev) => ({ ...prev, reason: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات إضافية</Label>
              <Textarea
                rows={3}
                placeholder="معلومات إضافية عن السلفة"
                value={advanceForm.notes}
                onChange={(event) => setAdvanceForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdvanceModalOpen(false)
                resetAdvanceForm()
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleCreateAdvance} disabled={advanceSubmitting}>
              {advanceSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={repaymentModalOpen}
        onOpenChange={(open) => {
          setRepaymentModalOpen(open)
          if (!open) {
            setActiveAdvance(null)
            setRepaymentForm({ amount: '', notes: '' })
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تسجيل سداد السلفة</DialogTitle>
            <DialogDescription>
              قم بإدخال قيمة السداد الحالية وأي ملاحظات إضافية.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium">
                الموظف: {activeAdvance?.employee?.user?.name || 'غير معروف'}
              </p>
              <p>
                المتبقي: {formatCurrency(Math.max(0, (activeAdvance?.amount || 0) - (activeAdvance?.repaidAmount || 0)))}
              </p>
              <p>المدفوع حتى الآن: {formatCurrency(activeAdvance?.repaidAmount || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label>المبلغ المسدد</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={repaymentForm.amount}
                onChange={(event) => setRepaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                rows={3}
                placeholder="تفاصيل إضافية عن السداد"
                value={repaymentForm.notes}
                onChange={(event) => setRepaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRepaymentModalOpen(false)
                setActiveAdvance(null)
                setRepaymentForm({ amount: '', notes: '' })
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleRecordRepayment}
              disabled={activeAdvance ? updatingAdvanceId === activeAdvance.id : false}
            >
              {activeAdvance && updatingAdvanceId === activeAdvance.id && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
              تسجيل السداد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}