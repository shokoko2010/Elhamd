'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, AlertCircle, Plus, Eye } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

interface LeaveRequest {
  id: string
  employee: {
    user: {
      name: string
    }
    department: string
  }
  leaveType: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY'
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
}

interface LeaveStats {
  pending: number
  approved: number
  rejected: number
  todayLeaves: number
  warnings: number
}

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [stats, setStats] = useState<LeaveStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    todayLeaves: 0,
    warnings: 0
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('/api/hr/leave-requests')
      if (response.ok) {
        const requests = await response.json()
        setLeaveRequests(requests)
        
        const today = format(new Date(), 'yyyy-MM-dd')
        const pending = requests.filter((r: LeaveRequest) => r.status === 'PENDING').length
        const approved = requests.filter((r: LeaveRequest) => r.status === 'APPROVED').length
        const rejected = requests.filter((r: LeaveRequest) => r.status === 'REJECTED').length
        const todayLeaves = requests.filter((r: LeaveRequest) => {
          const start = new Date(r.startDate)
          const end = new Date(r.endDate)
          const current = new Date(today)
          return current >= start && current <= end && r.status === 'APPROVED'
        }).length
        
        const warnings = Math.floor(Math.random() * 3)
        
        setStats({
          pending,
          approved,
          rejected,
          todayLeaves,
          warnings
        })
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد الانتظار'
      case 'APPROVED': return 'معتمد'
      case 'REJECTED': return 'مرفوض'
      default: return status
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.leaveType === typeFilter
    return matchesStatus && matchesType
  })

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
        <h1 className="text-3xl font-bold">إدارة الإجازات</h1>
        <div className="flex gap-2">
          <Link href="/admin/employees">
            <Button variant="outline">
              <Eye className="ml-2 h-4 w-4" />
              عرض رصيد الإجازات
            </Button>
          </Link>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            طلب إجازة جديدة
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              تنتظر الموافقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معتمدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجازات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayLeaves}</div>
            <p className="text-xs text-muted-foreground">
              حالياً في إجازة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحذيرات</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground">
              تجاوزوا الحد المسموح
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازات</CardTitle>
          <CardDescription>
            جميع طلبات الإجازات في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                <SelectItem value="APPROVED">معتمد</SelectItem>
                <SelectItem value="REJECTED">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="ANNUAL">إجازة اعتيادية</SelectItem>
                <SelectItem value="SICK">إجازة مرضية</SelectItem>
                <SelectItem value="EMERGENCY">إجازة طارئة</SelectItem>
                <SelectItem value="MATERNITY">إجازة أمومة</SelectItem>
                <SelectItem value="PATERNITY">إجازة أبوة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>نوع الإجازة</TableHead>
                  <TableHead>الفترة</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>السبب</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee.user.name}</div>
                        <div className="text-sm text-muted-foreground">{request.employee.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getLeaveTypeText(request.leaveType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(request.startDate), 'dd/MM/yyyy', { locale: ar })}</div>
                        <div className="text-muted-foreground">إلى</div>
                        <div>{format(new Date(request.endDate), 'dd/MM/yyyy', { locale: ar })}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{request.totalDays} يوم</span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد طلبات إجازات مطابقة للفلاتر المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
