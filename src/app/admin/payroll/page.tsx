'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, TrendingUp, Calendar, Download, Plus } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

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

  useEffect(() => {
    fetchPayrollData()
  }, [selectedPeriod])

  const fetchPayrollData = async () => {
    try {
      const response = await fetch(`/api/hr/payroll?period=${selectedPeriod}`)
      if (response.ok) {
        const records = await response.json()
        setPayrollRecords(records)
        
        // Calculate stats
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
    } finally {
      setLoading(false)
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
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء كشف رواتب
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
                  <TableHead>الراتب الأساسي</TableHeader>
                  <TableHead>البدلات</TableHead>
                  <TableHead>الخصومات</TableHead>
                  <TableHead>الراتب الصافي</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employee.user.name}</div>
                        <div className="text-sm text-muted-foreground">{record.employee.position}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.employee.department}</Badge>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ملخص الرواتب</CardTitle>
            <CardDescription>
              تفصيل مكونات الرواتب للشهر الحالي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">إجمالي الرواتب الأساسية:</span>
                <span className="font-medium">
                  {formatCurrency(payrollRecords.reduce((sum, r) => sum + r.basicSalary, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">إجمالي البدلات:</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(payrollRecords.reduce((sum, r) => sum + r.allowances + r.overtime + r.bonus, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">إجمالي الخصومات:</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(payrollRecords.reduce((sum, r) => sum + r.deductions, 0))}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">صافي الرواتب:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(stats.totalPayroll)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حالة الرواتب</CardTitle>
            <CardDescription>
              توزيع الرواتب حسب الحالة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['PENDING', 'APPROVED', 'PAID'].map((status) => {
                const count = payrollRecords.filter(r => r.status === status).length
                const percentage = payrollRecords.length > 0 ? Math.round((count / payrollRecords.length) * 100) : 0
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(status)}>
                        {getStatusText(status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{count} موظف</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'PENDING' ? 'bg-yellow-500' :
                            status === 'APPROVED' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-left">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}