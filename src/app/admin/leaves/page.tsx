'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, AlertCircle, Plus, Eye, Edit, Save, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Link } from 'next/link'
import { toast } from 'sonner'

interface LeaveRequest {
  id: string
  employeeId: string
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

interface Employee {
  id: string
  user: {
    name: string
  }
  department: {
    name: string
  }
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
  const [employees, setEmployees] = useState<Employee[]>([])
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'ANNUAL' as 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    fetchLeaveRequests()
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
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
        
        const warnings = requests.filter((r: LeaveRequest) => {
          // Calculate warnings based on leave balance or excessive leave usage
          // For now, this is a placeholder
          return r.status === 'APPROVED' && r.totalDays > 5
        }).length
        
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
      toast.error('فشل في تحميل بيانات الإجازات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/hr/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('تم تقديم طلب الإجازة بنجاح')
        setIsDialogOpen(false)
        setEditingRequest(null)
        setFormData({
          employeeId: '',
          leaveType: 'ANNUAL',
          startDate: '',
          endDate: '',
          reason: ''
        })
        fetchLeaveRequests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في تقديم طلب الإجازة')
      }
    } catch (error) {
      console.error('Error submitting leave request:', error)
      toast.error('حدث خطأ أثناء تقديم طلب الإجازة')
    }
  }

  const handleEdit = (request: LeaveRequest) => {
    setEditingRequest(request)
    setFormData({
      employeeId: request.employeeId,
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason || ''
    })
    setIsDialogOpen(true)
  }

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/hr/leave-requests/${requestId}/approve`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('تم اعتماد طلب الإجازة')
        fetchLeaveRequests()
      } else {
        toast.error('فشل في اعتماد طلب الإجازة')
      }
    } catch (error) {
      console.error('Error approving leave request:', error)
      toast.error('حدث خطأ أثناء اعتماد طلب الإجازة')
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const response = await fetch(`/api/hr/leave-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        toast.success('تم رفض طلب الإجازة')
        fetchLeaveRequests()
      } else {
        toast.error('فشل في رفض طلب الإجازة')
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error)
      toast.error('حدث خطأ أثناء رفض طلب الإجازة')
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingRequest(null)
                setFormData({
                  employeeId: '',
                  leaveType: 'ANNUAL',
                  startDate: '',
                  endDate: '',
                  reason: ''
                })
              }}>
                <Plus className="ml-2 h-4 w-4" />
                طلب إجازة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRequest ? 'تعديل طلب الإجازة' : 'طلب إجازة جديدة'}
                </DialogTitle>
                <DialogDescription>
                  {editingRequest ? 'قم بتعديل بيانات طلب الإجازة' : 'قم بإدخال بيانات طلب الإجازة الجديدة'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    الموظف
                  </Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                    disabled={!!editingRequest}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.user.name} - {employee.department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaveType" className="text-right">
                    نوع الإجازة
                  </Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, leaveType: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANNUAL">إجازة اعتيادية</SelectItem>
                      <SelectItem value="SICK">إجازة مرضية</SelectItem>
                      <SelectItem value="EMERGENCY">إجازة طارئة</SelectItem>
                      <SelectItem value="MATERNITY">إجازة أمومة</SelectItem>
                      <SelectItem value="PATERNITY">إجازة أبوة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    تاريخ البدء
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    تاريخ النهاية
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    السبب
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    <Save className="ml-2 h-4 w-4" />
                    {editingRequest ? 'تحديث' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employee.user.name}</div>
                        <div className="text-sm text-muted-foreground">{request.employee.department?.name || 'غير محدد'}</div>
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
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id, 'سبب إداري')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {request.status === 'APPROVED' && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-4 w-4 ml-1" />
                            معتمد
                          </Badge>
                        )}
                        {request.status === 'REJECTED' && (
                          <Badge variant="outline" className="text-red-600">
                            <X className="h-4 w-4 ml-1" />
                            مرفوض
                          </Badge>
                        )}
                      </div>
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
