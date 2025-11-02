'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, TrendingUp, Calendar, Download, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface PayrollRecord {
  id: string
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
      
      // Generate payroll records for each employee
      const payrollPromises = employees.map(async (employee: any) => {
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
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (successful > 0) {
        toast.success(`تم إنشاء ${successful} سجل راتب بنجاح`)
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
      case 'PENDING': return 'قيد الانتظار'
      case 'APPROVED': return 'معتمد'
      case 'PAID': return 'مدفوع'
      default: return status
    }
  }

  const getNextPayDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 25)
    if (nextMonth <= now) {
      nextMonth.setMonth(nextMonth.getMonth() + 1)
    }
    return format(nextMonth, 'd MMMM', { locale: ar })
  }

  const getDaysUntilPayday = () => {
    const now = new Date()
    const nextPayday = new Date(now.getFullYear(), now.getMonth() + 1, 25)
    if (nextPayday <= now) {
      nextPayday.setMonth(nextPayday.getMonth() + 1)
    }
    const diffTime = nextPayday.getTime() - now.getTime()
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
                if (response.ok) {
                  toast.success('تم إنشاء بيانات تجريبية للموظفين')
                  fetchPayrollData()
                } else {
                  toast.error('فشل في إنشاء البيانات التجريبية')
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
                      <div className="flex gap-2">
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
    </div>
  )
}
