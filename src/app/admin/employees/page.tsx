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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building,
  Award,
  AlertCircle
} from 'lucide-react'
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
  skills?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: string
}

interface Department {
  id: string
  name: string
  description?: string
}

interface Position {
  id: string
  title: string
  department: string
  level: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    branchId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  })

  useEffect(() => {
    fetchEmployeesData()
  }, [])

  const fetchEmployeesData = async () => {
    try {
      const [employeesRes, departmentsRes, positionsRes] = await Promise.all([
        fetch('/api/admin/employees'),
        fetch('/api/departments'),
        fetch('/api/positions')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData.employees)
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        setDepartments(departmentsData)
      }

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json()
        setPositions(positionsData)
      }
    } catch (error) {
      console.error('Error fetching employees data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'ON_LEAVE':
        return 'bg-blue-100 text-blue-800'
      case 'TERMINATED':
        return 'bg-red-100 text-red-800'
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800'
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
      default: return status
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || employee.department?.name === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
    onLeaveEmployees: employees.filter(e => e.status === 'ON_LEAVE').length,
    totalPayroll: employees.reduce((sum, e) => e.salary, 0)
  }

  const handleCreateEmployee = async () => {
    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchEmployeesData()
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          salary: '',
          branchId: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelationship: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error creating employee:', error)
    }
  }

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return

    try {
      const response = await fetch(`/api/admin/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchEmployeesData()
        setIsEditDialogOpen(false)
        setSelectedEmployee(null)
      }
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return

    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEmployeesData()
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.user.name,
      email: employee.user.email,
      phone: employee.user.phone || '',
      department: employee.department?.name || '',
      position: employee.position?.title || '',
      salary: employee.salary.toString(),
      branchId: employee.branch?.id || '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      notes: ''
    })
    setIsEditDialogOpen(true)
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
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع الموظفين في النظام</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الموظف الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
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
                <Label htmlFor="department">القسم</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">المنصب</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="أدخل المنصب"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">الراتب</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="أدخل الراتب"
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
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateEmployee}>
                إضافة موظف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            <CardTitle className="text-sm font-medium">في إجازة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onLeaveEmployees}</div>
            <p className="text-xs text-muted-foreground">
              حالياً في إجازة
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
              شهرياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النشاط</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEmployees > 0 
                ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              نسبة الموظفين النشطين
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو الرقم الوظيفي..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="ACTIVE">نشط</SelectItem>
                <SelectItem value="INACTIVE">غير نشط</SelectItem>
                <SelectItem value="ON_LEAVE">في إجازة</SelectItem>
                <SelectItem value="TERMINATED">منتهي الخدمة</SelectItem>
                <SelectItem value="SUSPENDED">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
          <CardDescription>
            عرض {filteredEmployees.length} من {employees.length} موظف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>الرقم الوظيفي</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>المنصب</TableHead>
                <TableHead>الراتب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التعيين</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={employee.user.avatar} />
                        <AvatarFallback>
                          {employee.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 ml-1" />
                          {employee.user.email}
                        </div>
                        {employee.user.phone && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 ml-1" />
                            {employee.user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{employee.employeeNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.department?.name || 'غير محدد'}</Badge>
                  </TableCell>
                  <TableCell>{employee.position?.title || 'غير محدد'}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('ar-EG', {
                      style: 'currency',
                      currency: 'EGP'
                    }).format(employee.salary)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(employee.status)}>
                      {getStatusText(employee.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(employee.hireDate), 'dd/MM/yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات الموظف
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">الاسم الكامل</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">البريد الإلكتروني</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">القسم</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">المنصب</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="أدخل المنصب"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salary">الراتب</Label>
              <Input
                id="edit-salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="أدخل الراتب"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContactName">اسم الطوارئ</Label>
              <Input
                id="edit-emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="اسم جهة الاتصال للطوارئ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContactPhone">هاتف الطوارئ</Label>
              <Input
                id="edit-emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="رقم هاتف الطوارئ"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">ملاحظات</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateEmployee}>
              تحديث البيانات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}