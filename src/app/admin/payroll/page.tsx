'use client'

import { useState, useEffect } from 'react'
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
  Loader2
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
  employeeId: string
  employee: {
    user: {
      name: string
    }
    department: string
    position: string
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
}

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [stats, setStats] = useState<PayrollStats>({
    totalPayroll: 0,
    employeeCount: 0,
    averageSalary: 0,
    pendingCount: 0
  })
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
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false)
  const [advanceSubmitting, setAdvanceSubmitting] = useState(false)
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    amount: '',
    reason: 'صرف سلفة على الراتب',
    notes: ''
  })
  const [selectedAdvanceEmployee, setSelectedAdvanceEmployee] = useState<{ id: string; name: string; period: string } | null>(null)

  useEffect(() => {
    fetchPayrollData()
  }, [selectedPeriod])

  const fetchPayrollData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hr/payroll?period=${selectedPeriod}`)
      if (response.ok) {
        const records = await response.json()
        setPayrollRecords(records)
        
        const totalPayroll = records.reduce((sum: number, record: PayrollRecord) => sum + record.netSalary, 0)
        const employeeCount = records.length
        const averageSalary = employeeCount > 0 ? totalPayroll / employeeCount : 0
        const pendingCount = records.filter((r: PayrollRecord) => r.status === 'PENDING').length
        
        setStats({
          totalPayroll,
          employeeCount,
          averageSalary,
          pendingCount
        })
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
      toast.error('فشل في تحميل بيانات الرواتب')
    } finally {
      setLoading(false)
    }
  }

  const generatePayroll = async () => {
    try {
      setIsGenerating(true)
      
      // Fetch all employees
      const employeesResponse = await fetch('/api/employees')
      if (!employeesResponse.ok) {
        throw new Error('فشل في جلب بيانات الموظفين')
      }
      
      const employees = await employeesResponse.json()

      const existingResponse = await fetch(`/api/hr/payroll?period=${selectedPeriod}`)
      const existingRecords = existingResponse.ok ? await existingResponse.json() : payrollRecords

      const existingEmployeeIds = new Set((existingRecords || []).map((record: any) => record.employeeId))

      const employeesToCreate = employees.filter((employee: any) => !existingEmployeeIds.has(employee.id))

      if (employeesToCreate.length === 0) {
        toast.info('لا توجد سجلات جديدة لإنشائها لهذه الفترة. جميع الموظفين لديهم رواتب مسجلة بالفعل.')
        setIsGenerating(false)
        return
      }

      // Generate payroll records for each employee
      const payrollPromises = employeesToCreate.map(async (employee: any) => {
        const basicSalary = employee.salary || 0
        const allowances = basicSalary * 0.2 // 20% allowances
        const deductions = basicSalary * 0.1 // 10% deductions
        const overtime = Math.random() > 0.5 ? basicSalary * 0.05 : 0 // Random overtime
        const bonus = Math.random() > 0.7 ? basicSalary * 0.1 : 0 // Random bonus
        const netSalary = basicSalary + allowances + overtime + bonus - deductions
        
        return fetch('/api/hr/payroll', {
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
      })
      
      const results = await Promise.allSettled(payrollPromises)
      const successful = results.filter((result) => result.status === 'fulfilled' && result.value?.ok).length
      const failed = results.filter((result) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value?.ok)).length

      const skipped = employees.length - employeesToCreate.length

      if (successful > 0) {
        toast.success(`تم إنشاء ${successful} سجل راتب بنجاح`)
        if (skipped > 0) {
          toast.info(`تم تجاهل ${skipped} موظف لديهم سجل راتب مسجل مسبقاً لهذه الفترة`)
        }
        if (failed > 0) {
          toast.warning(`فشل في إنشاء ${failed} سجل راتب`)
        }
        fetchPayrollData()
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
        fetchPayrollData()
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
        fetchPayrollData()
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
      case 'PENDING':
        return 'قيد الانتظار'
      case 'APPROVED':
        return 'معتمد'
      case 'PAID':
        return 'مدفوع'
      default:
        return status
    }
  }

  const openAdvanceModal = (record: PayrollRecord) => {
    const defaultAmount = record.netSalary ? record.netSalary.toString() : ''
    setSelectedAdvanceEmployee({ id: record.employeeId, name: record.employee.user.name, period: record.period })
    setAdvanceForm({
      employeeId: record.employeeId,
      amount: defaultAmount,
      reason: `صرف سلفة على راتب فترة ${record.period}`,
      notes: ''
    })
    setAdvanceModalOpen(true)
  }

  const handleAdvanceSubmit = async () => {
    if (!advanceForm.employeeId) {
      toast.error('تعذر تحديد الموظف للسلفة')
      return
    }

    const amountValue = parseFloat(advanceForm.amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error('الرجاء إدخال مبلغ صالح للسلفة')
      return
    }

    try {
      setAdvanceSubmitting(true)
      const response = await fetch('/api/hr/salary-advances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: advanceForm.employeeId,
          amount: amountValue,
          reason: advanceForm.reason,
          repaymentMonths: null,
          repaymentStart: null,
          notes: advanceForm.notes
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'فشل في تسجيل السلفة')
      }

      toast.success('تم تسجيل السلفة بنجاح')
      setAdvanceModalOpen(false)
      setSelectedAdvanceEmployee(null)
      setAdvanceForm({ employeeId: '', amount: '', reason: 'صرف سلفة على الراتب', notes: '' })
    } catch (error) {
      console.error('Error creating salary advance from payroll:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في تسجيل السلفة')
    } finally {
      setAdvanceSubmitting(false)
    }
  }

  const closeAdvanceModal = () => {
    setAdvanceModalOpen(false)
    setSelectedAdvanceEmployee(null)
    setAdvanceForm({ employeeId: '', amount: '', reason: 'صرف سلفة على الراتب', notes: '' })
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

  const handleEditChange = (field: keyof typeof editForm, value: number) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الرواتب</h1>
        <div className="flex items-center gap-4">
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
          <Button onClick={fetchPayrollData}>
            <Calendar className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
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
                  fetchPayrollData()
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
              في قائمة الرواتب
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

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الرواتب</CardTitle>
          <CardDescription>
            ملخص رواتب الموظفين لشهر {format(new Date(selectedPeriod + '-01'), 'MMMM yyyy', { locale: ar })}
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
                  <TableHead>الراتب الصافي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => (
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
                    <TableCell className="font-medium">{formatCurrency(record.netSalary)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusText(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdvanceModal(record)}
                        >
                          تسجيل سلفة
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
                ))}
              </TableBody>
            </Table>
          </div>
          
          {payrollRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سجلات رواتب لهذه الفترة
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
      <Dialog open={advanceModalOpen} onOpenChange={(open) => {
        if (!open) {
          closeAdvanceModal()
        } else {
          setAdvanceModalOpen(true)
        }
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>تسجيل سلفة للراتب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">
                الموظف: {selectedAdvanceEmployee?.name || 'غير معروف'}
              </p>
              <p className="text-muted-foreground">الفترة: {selectedAdvanceEmployee?.period || selectedPeriod}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advanceAmount">المبلغ</Label>
              <Input
                id="advanceAmount"
                type="number"
                min={0}
                step="0.01"
                value={advanceForm.amount}
                onChange={(event) => setAdvanceForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advanceReason">السبب</Label>
              <Input
                id="advanceReason"
                value={advanceForm.reason}
                onChange={(event) => setAdvanceForm((prev) => ({ ...prev, reason: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advanceNotes">ملاحظات إضافية</Label>
              <Textarea
                id="advanceNotes"
                rows={3}
                placeholder="تفاصيل إضافية حول السلفة"
                value={advanceForm.notes}
                onChange={(event) => setAdvanceForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAdvanceModal}>
              إلغاء
            </Button>
            <Button onClick={handleAdvanceSubmit} disabled={advanceSubmitting}>
              {advanceSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ السلفة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
