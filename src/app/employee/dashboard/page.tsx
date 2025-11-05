'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  User, 
  Calendar, 
  DollarSign, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  Clock,
  FileText,
  Settings,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'

interface EmployeeProfile {
  id: string
  employeeNumber: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
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
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: string
}

interface LeaveRequest {
  id: string
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

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  })
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    if (user) {
      fetchEmployeeData()
    }
  }, [user])

  const fetchEmployeeData = async () => {
    try {
      const [profileRes, leavesRes, payrollRes] = await Promise.all([
        fetch('/api/employee/profile'),
        fetch('/api/employee/leave-requests'),
        fetch('/api/employee/payroll')
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setEmployeeProfile(profileData)
        setFormData({
          phone: profileData.user.phone || '',
          emergencyContactName: profileData.emergencyContact?.name || '',
          emergencyContactPhone: profileData.emergencyContact?.phone || '',
          emergencyContactRelationship: profileData.emergencyContact?.relationship || '',
          notes: profileData.notes || ''
        })
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
      console.error('Error fetching employee data:', error)
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

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchEmployeeData()
        setIsEditProfileOpen(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleLeaveRequest = async () => {
    try {
      const response = await fetch('/api/employee/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveFormData),
      })

      if (response.ok) {
        fetchEmployeeData()
        setIsLeaveRequestOpen(false)
        setLeaveFormData({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: ''
        })
      }
    } catch (error) {
      console.error('Error creating leave request:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!employeeProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">بيانات الموظف غير متاحة</h3>
          <p className="text-gray-600">لا يمكن العثور على بيانات الموظف</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الموظف</h1>
          <p className="text-muted-foreground">مرحباً {employeeProfile.user.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 ml-2" />
            الإشعارات
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 ml-2" />
            الإعدادات
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الراتب الأساسي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(employeeProfile.salary)}
            </div>
            <p className="text-xs text-muted-foreground">
              شهرياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحالة الوظيفية</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(employeeProfile.status)}>
              {getStatusText(employeeProfile.status)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              منذ {format(new Date(employeeProfile.hireDate), 'dd/MM/yyyy', { locale: ar })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات المعلقة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(l => l.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              تحتاج موافقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الراتب الصافي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(payrollRecords[0]?.netSalary || employeeProfile.salary)}
            </div>
            <p className="text-xs text-muted-foreground">
              للشهر الحالي
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="leaves">الإجازات</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الملف الشخصي</CardTitle>
                  <CardDescription>معلوماتك الشخصية والوظيفية</CardDescription>
                </div>
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 ml-2" />
                      تعديل الملف
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                      <DialogDescription>
                        قم بتحديث بياناتك الشخصية
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="أدخل رقم الهاتف"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">اسم الطوارئ</Label>
                        <Input
                          id="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                          placeholder="اسم جهة الاتصال للطوارئ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">هاتف الطوارئ</Label>
                        <Input
                          id="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                          placeholder="رقم هاتف الطوارئ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactRelationship">صلة القرابة</Label>
                        <Input
                          id="emergencyContactRelationship"
                          value={formData.emergencyContactRelationship}
                          onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                          placeholder="صلة القرابة"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="أي ملاحظات إضافية"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleUpdateProfile}>
                        حفظ التغييرات
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={employeeProfile.user.avatar} />
                  <AvatarFallback className="text-lg">
                    {employeeProfile.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{employeeProfile.user.name}</h3>
                  <p className="text-muted-foreground">{employeeProfile.position}</p>
                  <Badge variant="outline" className="mt-1">{employeeProfile.department}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">الرقم الوظيفي</p>
                      <p className="text-sm text-muted-foreground">{employeeProfile.employeeNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">{employeeProfile.user.email}</p>
                    </div>
                  </div>
                  {employeeProfile.user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">رقم الهاتف</p>
                        <p className="text-sm text-muted-foreground">{employeeProfile.user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">الفرع</p>
                      <p className="text-sm text-muted-foreground">{employeeProfile.branch?.name || 'الرئيسي'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">تاريخ التعيين</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(employeeProfile.hireDate), 'dd/MM/yyyy', { locale: ar })}
                      </p>
                    </div>
                  </div>
                  {employeeProfile.emergencyContact && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">اتصال الطوارئ</p>
                        <p className="text-sm text-muted-foreground">
                          {employeeProfile.emergencyContact.name} - {employeeProfile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>طلبات الإجازات</CardTitle>
                  <CardDescription>إدارة طلبات الإجازات والموافقات</CardDescription>
                </div>
                <Dialog open={isLeaveRequestOpen} onOpenChange={setIsLeaveRequestOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Calendar className="h-4 w-4 ml-2" />
                      طلب إجازة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>طلب إجازة جديدة</DialogTitle>
                      <DialogDescription>
                        أدخل تفاصيل طلب الإجازة
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="leaveType">نوع الإجازة</Label>
                        <select
                          id="leaveType"
                          value={leaveFormData.leaveType}
                          onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">اختر نوع الإجازة</option>
                          <option value="ANNUAL">إجازة سنوية</option>
                          <option value="SICK">إجازة مرضية</option>
                          <option value="MATERNITY">إجازة ولادة</option>
                          <option value="PATERNITY">إجازة أبوة</option>
                          <option value="UNPAID">إجازة بدون راتب</option>
                          <option value="EMERGENCY">إجازة طارئة</option>
                          <option value="STUDY">إجازة دراسية</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">تاريخ البدء</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={leaveFormData.startDate}
                            onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={leaveFormData.endDate}
                            onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">السبب</Label>
                        <Textarea
                          id="reason"
                          value={leaveFormData.reason}
                          onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                          placeholder="أدخل سبب الإجازة"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsLeaveRequestOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleLeaveRequest}>
                        إرسال الطلب
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات إجازات</p>
                ) : (
                  leaveRequests.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{getLeaveTypeText(leave.leaveType)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {leave.totalDays} أيام • {format(new Date(leave.startDate), 'dd/MM/yyyy', { locale: ar })} - {format(new Date(leave.endDate), 'dd/MM/yyyy', { locale: ar })}
                          </p>
                          {leave.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              السبب: {leave.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(leave.status)}>
                        {getStatusText(leave.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجلات الرواتب</CardTitle>
              <CardDescription>عرض سجلات الرواتب والدفعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollRecords.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد سجلات رواتب</p>
                ) : (
                  payrollRecords.map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">الفترة: {payroll.period}</h4>
                          <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
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
                      <div className="text-right">
                        <p className="text-lg font-medium">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(payroll.netSalary)}
                        </p>
                        <Badge className={getStatusColor(payroll.status)}>
                          {getStatusText(payroll.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المستندات</CardTitle>
              <CardDescription>المستندات والشهادات الرسمية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">المستندات</h3>
                <p className="text-gray-600 mb-4">
                  سيتم إضافة المستندات والشهادات قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}