'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, TrendingUp, UserPlus, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  department: string
  employees: number
  percentage: number
}

export default function HRPage() {
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

  useEffect(() => {
    fetchHRData()
  }, [])

  const fetchHRData = async () => {
    try {
      // Fetch employees data
      const employeesRes = await fetch('/api/employees')
      if (employeesRes.ok) {
        const employees = await employeesRes.json()
        
        // Calculate stats
        const activeEmployees = employees.filter((e: any) => e.status === 'ACTIVE').length
        const totalPayroll = employees.reduce((sum: number, e: any) => sum + e.salary, 0)
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
          .filter((e: any) => new Date(e.hireDate) >= thirtyDaysAgo)
          .slice(0, 4)
          .map((e: any) => ({
            id: e.id,
            name: e.user.name,
            position: e.position,
            department: e.department,
            hireDate: new Date(e.hireDate).toISOString().split('T')[0]
          }))
        setNewEmployees(newEmps)

        // Calculate department stats
        const deptMap = new Map<string, number>()
        employees.forEach((e: any) => {
          const dept = e.department || 'غير محدد'
          deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
        })
        
        const deptStats = Array.from(deptMap.entries()).map(([dept, count]) => ({
          department: dept,
          employees: count,
          percentage: Math.round((count / employees.length) * 100)
        }))
        setDepartmentStats(deptStats)
      }

      // Fetch leave requests
      const leavesRes = await fetch('/api/hr/leave-requests')
      if (leavesRes.ok) {
        const leaves = await leavesRes.json()
        const pendingLeaves = leaves.filter((l: any) => l.status === 'PENDING').length
        
        setStats(prev => ({ ...prev, pendingLeaves }))
        
        // Get recent leave requests
        const recentLeaves = leaves.slice(0, 4).map((l: any) => ({
          id: l.id,
          employee: l.employee,
          leaveType: l.leaveType,
          startDate: new Date(l.startDate).toISOString().split('T')[0],
          endDate: new Date(l.endDate).toISOString().split('T')[0],
          totalDays: l.totalDays,
          status: l.status
        }))
        setLeaveRequests(recentLeaves)
      }
    } catch (error) {
      console.error('Error fetching HR data:', error)
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
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">{employee.hireDate}</p>
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
                  <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{leave.employee.user.name}</p>
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
        <CardHeader>
          <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
          <CardDescription>
            نظرة عامة على توزيع الموظفين في الأقسام المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.length > 0 ? (
              departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">{dept.employees} موظف</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{dept.percentage}%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${dept.percentage}%` }}
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
    </div>
  )
}