'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Users, UserCheck, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Employee {
  id: string
  employeeNumber: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  department: string
  position: string
  hireDate: string
  salary: number
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED'
  branch?: {
    id: string
    name: string
  }
}

interface LeaveRequest {
  id: string
  employee: Employee
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'EMERGENCY' | 'STUDY'
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
}

interface PayrollRecord {
  id: string
  employee: Employee
  period: string
  basicSalary: number
  allowances: number
  deductions: number
  overtime: number
  bonus: number
  netSalary: number
  payDate?: string
  status: 'PENDING' | 'PROCESSED' | 'APPROVED' | 'PAID' | 'CANCELLED'
}

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('employees')

  useEffect(() => {
    fetchHRData()
  }, [])

  const fetchHRData = async () => {
    try {
      const [employeesRes, leavesRes, payrollRes] = await Promise.all([
        fetch('/api/hr/employees'),
        fetch('/api/hr/leave-requests'),
        fetch('/api/hr/payroll')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData)
      }

      if (leavesRes.ok) {
        const leavesData = await leavesRes.json()
        setLeaveRequests(leavesData)
      }

      if (payrollRes.ok) {
        const payrollData = await payrollRes.json()
        setPayrollRecords(payrollData)
      }
    } catch (error) {
      console.error('Error fetching HR data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
      case 'PROCESSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE':
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'ON_LEAVE':
      case 'SUSPENDED':
        return 'bg-blue-100 text-blue-800'
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط'
      case 'INACTIVE': return 'غير نشط'
      case 'ON_LEAVE': return 'في إجازة'
      case 'TERMINATED': return 'منتهي الخدمة'
      case 'SUSPENDED': return 'موقوف'
      case 'PENDING': return 'قيد الانتظار'
      case 'APPROVED': return 'موافق عليه'
      case 'REJECTED': return 'مرفوض'
      case 'CANCELLED': return 'ملغي'
      case 'COMPLETED': return 'مكتمل'
      case 'PROCESSED': return 'تمت معالجته'
      case 'PAID': return 'مدفوع'
      default: return status
    }
  }

  const getLeaveTypeText = (type: string) => {
    switch (type) {
      case 'ANNUAL': return 'سنوية'
      case 'SICK': return 'مرضية'
      case 'MATERNITY': return 'ولادة'
      case 'PATERNITY': return 'أبوة'
      case 'UNPAID': return 'بدون راتب'
      case 'EMERGENCY': return 'طارئة'
      case 'STUDY': return 'دراسية'
      default: return type
    }
  }

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
    pendingLeaves: leaveRequests.filter(l => l.status === 'PENDING').length,
    totalPayroll: payrollRecords.reduce((sum, p) => p.netSalary, 0)
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
        <div>
          <h1 className="text-3xl font-bold">الموارد البشرية</h1>
          <p className="text-muted-foreground">إدارة الموظفين والرواتب والإجازات</p>
        </div>
        <Button>
          <Users className="ml-2 h-4 w-4" />
          إضافة موظف جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEmployees} نشطين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">
              تحتاج موافقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(stats.totalPayroll)}
            </div>
            <p className="text-xs text-muted-foreground">
              للشهر الحالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة النشاط</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEmployees > 0 
                ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              موظفين نشطين
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="leaves">الإجازات</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الموظفين</CardTitle>
              <CardDescription>عرض وإدارة جميع الموظفين في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/avatar/${employee.user.id}`} />
                        <AvatarFallback>
                          {employee.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{employee.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p>
                        <p className="text-xs text-muted-foreground">
                          {employee.employeeNumber} • {employee.branch?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(employee.salary)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(employee.hireDate), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusText(employee.status)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        تفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>طلبات الإجازات</CardTitle>
              <CardDescription>إدارة طلبات الإجازات والموافقات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/avatar/${leave.employee.user.id}`} />
                        <AvatarFallback>
                          {leave.employee.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{leave.employee.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getLeaveTypeText(leave.leaveType)} • {leave.totalDays} أيام
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(leave.startDate), 'dd/MM/yyyy', { locale: ar })} - {' '}
                          {format(new Date(leave.endDate), 'dd/MM/yyyy', { locale: ar })}
                        </p>
                        {leave.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            السبب: {leave.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(leave.status)}>
                        {getStatusText(leave.status)}
                      </Badge>
                      {leave.status === 'PENDING' && (
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">
                            موافقة
                          </Button>
                          <Button size="sm" variant="destructive">
                            رفض
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجلات الرواتب</CardTitle>
              <CardDescription>عرض وإدارة سجلات الرواتب والدفعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRecords.map((payroll) => (
                  <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/avatar/${payroll.employee.user.id}`} />
                        <AvatarFallback>
                          {payroll.employee.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{payroll.employee.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          الفترة: {payroll.period}
                        </p>
                        <div className="flex space-x-4 text-xs text-muted-foreground mt-1">
                          <span>أساسي: {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(payroll.basicSalary)}</span>
                          <span>بدلات: {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(payroll.allowances)}</span>
                          <span>خصومات: {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(payroll.deductions)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-medium">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(payroll.netSalary)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          صافي الراتب
                        </p>
                      </div>
                      <Badge className={getStatusColor(payroll.status)}>
                        {getStatusText(payroll.status)}
                      </Badge>
                      {payroll.status === 'PENDING' && (
                        <Button size="sm">
                          معالجة
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}