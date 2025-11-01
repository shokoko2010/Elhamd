'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  RefreshCw,
  Eye,
  Edit,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  branch?: {
    name: string
    code: string
  }
  employee?: {
    position?: string
    department?: string
    hireDate?: Date
    salary?: number
    status?: string
  }
  createdAt: Date
  lastLoginAt?: Date
}

interface LeaveRequest {
  id: string
  employee: {
    name: string
    position?: string
  }
  type: string
  status: string
  startDate: Date
  endDate: Date
  reason?: string
}

interface PerformanceMetric {
  id: string
  employee: {
    name: string
    position?: string
  }
  metric: string
  value: number
  target: number
  period: string
  createdAt: Date
}

export default function PersonnelPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPersonnelData()
  }, [])

  const loadPersonnelData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load employees
      const employeesResponse = await fetch('/api/admin/users')
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData.users || [])
      }

      // Load leave requests
      const leaveResponse = await fetch('/api/hr/leave-requests')
      if (leaveResponse.ok) {
        const leaveData = await leaveResponse.json()
        setLeaveRequests(leaveData.leaveRequests || [])
      }

      // Load performance metrics
      const performanceResponse = await fetch('/api/performance')
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json()
        setPerformanceMetrics(performanceData.metrics || [])
      }
    } catch (error) {
      console.error('Error loading personnel data:', error)
      setError('فشل في تحميل بيانات الموظفين')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    onLeave: leaveRequests.filter(lr => 
      lr.status === 'APPROVED' && 
      new Date() >= new Date(lr.startDate) && 
      new Date() <= new Date(lr.endDate)
    ).length,
    avgPerformance: performanceMetrics.length > 0 
      ? Math.round(performanceMetrics.reduce((sum, m) => sum + (m.value / m.target * 100), 0) / performanceMetrics.length)
      : 0
  }

  // Get recent hires (last 30 days)
  const recentHires = employees
    .filter(e => e.employee?.hireDate && 
      new Date(e.employee.hireDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .slice(0, 5)

  // Get upcoming leave
  const upcomingLeave = leaveRequests
    .filter(lr => lr.status === 'APPROVED' && new Date(lr.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)

  // Get top performers
  const topPerformers = performanceMetrics
    .filter(m => m.value >= m.target)
    .sort((a, b) => (b.value / b.target) - (a.value / a.target))
    .slice(0, 5)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'SUPER_ADMIN': 'destructive',
      'ADMIN': 'default',
      'BRANCH_MANAGER': 'secondary',
      'STAFF': 'outline',
      'CUSTOMER': 'outline'
    } as const

    const roleLabels = {
      'SUPER_ADMIN': 'مدير النظام',
      'ADMIN': 'مدير',
      'BRANCH_MANAGER': 'مدير فرع',
      'STAFF': 'موظف',
      'CUSTOMER': 'عميل'
    }

    return (
      <Badge variant={roleColors[role as keyof typeof roleColors] || 'outline'}>
        {roleLabels[role as keyof typeof roleLabels] || role}
      </Badge>
    )
  }

  const getLeaveTypeLabel = (type: string) => {
    const labels = {
      'SICK': 'إجازة مرضية',
      'ANNUAL': 'إجازة اعتيادية',
      'EMERGENCY': 'إجازة طارئة',
      'MATERNITY': 'إجازة أمومة',
      'PATERNITY': 'إجازة أبوة'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <Button variant="outline" disabled>
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            جاري التحميل...
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <Button variant="outline" onClick={loadPersonnelData}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <div className="flex gap-2">
            <Link href="/admin/employees">
              <Button variant="outline">
                <Users className="ml-2 h-4 w-4" />
                إدارة الموظفين
              </Button>
            </Link>
            <Link href="/admin/hr">
              <Button variant="outline">
                <Settings className="ml-2 h-4 w-4" />
                الموارد البشرية
              </Button>
            </Link>
            <Button variant="outline" onClick={loadPersonnelData}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} نشطين ({Math.round((stats.active / stats.total) * 100)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">موظفين نشطين</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.active / stats.total) * 100)}% من إجمالي الموظفين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في إجازة اليوم</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.onLeave}</div>
              <p className="text-xs text-muted-foreground">
                إجازات معتمدة حالياً
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الأداء</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.avgPerformance}%</div>
              <p className="text-xs text-muted-foreground">
                متوسط أداء الموظفين
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Hires */}
          <Card>
            <CardHeader>
              <CardTitle>الموظفون الجدد</CardTitle>
              <CardDescription>
                آخر الموظفين الذين انضموا للشركة (آخر 30 يوم)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentHires.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا يوجد موظفون جدد خلال 30 يوم الماضية</p>
              ) : (
                <div className="space-y-4">
                  {recentHires.map((employee, index) => (
                    <div key={employee.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={undefined} />
                          <AvatarFallback>
                            {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.employee?.position || getRoleBadge(employee.role)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(employee.employee?.hireDate || employee.createdAt)}
                        </p>
                        {employee.branch && (
                          <p className="text-xs text-muted-foreground">{employee.branch.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Leave */}
          <Card>
            <CardHeader>
              <CardTitle>جدول الإجازات القادم</CardTitle>
              <CardDescription>
                الإجازات المعتمدة القادمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingLeave.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد إجازات قادمة معتمدة</p>
              ) : (
                <div className="space-y-4">
                  {upcomingLeave.map((leave, index) => (
                    <div key={leave.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{leave.employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getLeaveTypeLabel(leave.type)}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} أيام
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>أفضل الموظفين أداءً</CardTitle>
              <CardDescription>
                الموظفون الذين حققوا أو تجاوزوا أهدافهم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((metric, index) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{metric.employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {metric.employee.position || metric.metric}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-green-600">
                        {Math.round((metric.value / metric.target) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.value} / {metric.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminRoute>
  )
}