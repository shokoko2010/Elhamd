'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface AttendanceRecord {
  id: string
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

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    late: 0,
    onLeave: 0,
    absent: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchAttendanceData()
  }, [selectedDate])

  const fetchAttendanceData = async () => {
    try {
      // Fetch employees data first
      const employeesRes = await fetch('/api/employees')
      if (!employeesRes.ok) return
      
      const employees = await employeesRes.json()
      
      // Create mock attendance records based on employees
      // In a real implementation, this would come from an attendance API
      const todayRecords = employees.map((emp: any) => {
        const random = Math.random()
        let status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE'
        let checkIn: string | undefined
        let checkOut: string | undefined
        
        if (random < 0.85) {
          status = 'PRESENT'
          checkIn = '07:' + String(Math.floor(Math.random() * 30) + 30).padStart(2, '0')
          checkOut = '16:' + String(Math.floor(Math.random() * 30)).padStart(2, '0')
        } else if (random < 0.92) {
          status = 'LATE'
          checkIn = '08:' + String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')
          checkOut = '16:' + String(Math.floor(Math.random() * 30)).padStart(2, '0')
        } else if (random < 0.96) {
          status = 'ON_LEAVE'
        } else {
          status = 'ABSENT'
        }
        
        return {
          id: emp.id,
          employee: {
            user: {
              name: emp.user.name
            },
            department: emp.department
          },
          checkIn,
          checkOut,
          date: selectedDate,
          status,
          notes: status === 'LATE' ? 'تأخير بسبب الازدحام' : undefined
        }
      })
      
      setAttendanceRecords(todayRecords)
      
      // Calculate stats
      const newStats = todayRecords.reduce((acc, record) => {
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
    } finally {
      setLoading(false)
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