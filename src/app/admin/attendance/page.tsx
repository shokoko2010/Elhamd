'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, CheckCircle, AlertTriangle, Calendar, Plus, Edit, Save, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface AttendanceRecord {
  id: string
  employeeId: string
  employee: {
    user: {
      name: string
    }
    department: string
  }
  checkIn?: string
  checkOut?: string
  date: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE'
  notes?: string
}

interface AttendanceStats {
  present: number
  late: number
  onLeave: number
  absent: number
  total: number
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

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    late: 0,
    onLeave: 0,
    absent: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    checkIn: '',
    checkOut: '',
    status: 'PRESENT' as 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE',
    notes: ''
  })

  useEffect(() => {
    fetchAttendanceData()
    fetchEmployees()
  }, [selectedDate])

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

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      const attendanceRes = await fetch(`/api/attendance?date=${selectedDate}`)
      if (!attendanceRes.ok) return
      
      const records = await attendanceRes.json()
      
      setAttendanceRecords(records)
      
      // Calculate stats
      const newStats = records.reduce((acc, record) => {
        acc.total++
        switch (record.status) {
          case 'PRESENT':
            acc.present++
            break
          case 'LATE':
            acc.late++
            break
          case 'ON_LEAVE':
            acc.onLeave++
            break
          case 'ABSENT':
            acc.absent++
            break
        }
        return acc
      }, { present: 0, late: 0, onLeave: 0, absent: 0, total: 0 })
      
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      toast.error('فشل في تحميل بيانات الحضور')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDate
        })
      })

      if (response.ok) {
        toast.success('تم حفظ سجل الحضور بنجاح')
        setIsDialogOpen(false)
        setEditingRecord(null)
        setFormData({
          employeeId: '',
          checkIn: '',
          checkOut: '',
          status: 'PRESENT',
          notes: ''
        })
        fetchAttendanceData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في حفظ سجل الحضور')
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast.error('حدث خطأ أثناء حفظ سجل الحضور')
    }
  }

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setFormData({
      employeeId: record.employeeId,
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      status: record.status,
      notes: record.notes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (recordId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return
    
    try {
      const response = await fetch(`/api/attendance/${recordId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('تم حذف السجل بنجاح')
        fetchAttendanceData()
      } else {
        toast.error('فشل في حذف السجل')
      }
    } catch (error) {
      console.error('Error deleting attendance:', error)
      toast.error('حدث خطأ أثناء حذف السجل')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ON_LEAVE':
        return 'bg-blue-100 text-blue-800'
      case 'ABSENT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'حاضر'
      case 'LATE': return 'متأخر'
      case 'ON_LEAVE': return 'في إجازة'
      case 'ABSENT': return 'غائب'
      default: return status
    }
  }

  const getAttendanceRate = () => {
    if (stats.total === 0) return 0
    return Math.round(((stats.present + stats.late) / stats.total) * 100)
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
        <h1 className="text-3xl font-bold">نظام الحضور والانصراف</h1>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={fetchAttendanceData}>
            <Calendar className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingRecord(null)
                setFormData({
                  employeeId: '',
                  checkIn: '',
                  checkOut: '',
                  status: 'PRESENT',
                  notes: ''
                })
              }}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة سجل حضور
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? 'تعديل سجل الحضور' : 'إضافة سجل حضور جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingRecord ? 'قم بتعديل بيانات سجل الحضور' : 'قم بإدخال بيانات سجل الحضور الجديد'}
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
                    disabled={!!editingRecord}
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
                  <Label htmlFor="checkIn" className="text-right">
                    وقت الدخول
                  </Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="checkOut" className="text-right">
                    وقت الخروج
                  </Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    الحالة
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">حاضر</SelectItem>
                      <SelectItem value="LATE">متأخر</SelectItem>
                      <SelectItem value="ABSENT">غائب</SelectItem>
                      <SelectItem value="ON_LEAVE">في إجازة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    ملاحظات
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                    {editingRecord ? 'تحديث' : 'حفظ'}
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
            <CardTitle className="text-sm font-medium">الحاضرين اليوم</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.present}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.present / stats.total) * 100)}% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتأخرين</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.late}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.late / stats.total) * 100)}% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في إجازة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onLeave}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.onLeave / stats.total) * 100)}% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الغياب</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.absent / stats.total) * 100)}% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الحضور والانصراف</CardTitle>
          <CardDescription>
            سجل حضور وانصراف الموظفين ليوم {format(new Date(selectedDate), 'EEEE، d MMMM yyyy', { locale: ar })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>وقت الدخول</TableHead>
                  <TableHead>وقت الخروج</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>ملاحظات</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee.user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.employee.department}</Badge>
                    </TableCell>
                    <TableCell>{record.checkIn || '-'}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusText(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {attendanceRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سجلات حضور لهذا اليوم
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ملخص اليوم</CardTitle>
          <CardDescription>
            نظرة عامة على إحصائيات الحضور والانصراف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{getAttendanceRate()}%</div>
              <div className="text-sm text-green-600">نسبة الحضور</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.present + stats.late}</div>
              <div className="text-sm text-blue-600">إجمالي الحاضرين</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-yellow-600">عدد المتأخرين</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-red-600">عدد الغياب</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}