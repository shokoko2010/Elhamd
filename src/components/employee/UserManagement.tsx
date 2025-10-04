'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Key
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastLogin?: string
}

interface UserFormData {
  name: string
  email: string
  phone: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'inactive' | 'suspended'
}

export default function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    status: 'active'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employee/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        // If API fails, show empty state
        setUsers([])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات المستخدمين',
        variant: 'destructive'
      })
      // Use empty state as fallback
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingUser ? `/api/employee/users/${editingUser.id}` : '/api/employee/users'
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: editingUser ? 'تم تحديث المستخدم بنجاح' : 'تمت إضافة المستخدم بنجاح'
        })
        fetchUsers()
        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error('فشل في حفظ المستخدم')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المستخدم',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/employee/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم حذف المستخدم بنجاح'
        })
        fetchUsers()
      } else {
        throw new Error('فشل في حذف المستخدم')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المستخدم',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    })
    setIsDialogOpen(true)
  }

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/employee/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم تحديث حالة المستخدم بنجاح'
        })
        fetchUsers()
      } else {
        throw new Error('فشل في تحديث حالة المستخدم')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المستخدم',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      status: 'active'
    })
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      CUSTOMER: { variant: 'outline', label: 'عميل', icon: Users },
      STAFF: { variant: 'default', label: 'موظف', icon: Shield },
      ADMIN: { variant: 'secondary', label: 'مدير', icon: Shield },
      SUPER_ADMIN: { variant: 'destructive', label: 'مدير عام', icon: Shield }
    } as const

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CUSTOMER
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', label: 'نشط', icon: CheckCircle },
      inactive: { variant: 'secondary', label: 'غير نشط', icon: XCircle },
      suspended: { variant: 'destructive', label: 'موقوف', icon: Clock }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      CUSTOMER: 'عميل',
      STAFF: 'موظف',
      ADMIN: 'مدير',
      SUPER_ADMIN: 'مدير عام'
    }
    return labels[role as keyof typeof labels] || role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-gray-600">إضافة وتعديل وإدارة حسابات المستخدمين</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'تعديل معلومات المستخدم الموجود' : 'إضافة مستخدم جديد للنظام'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">الدور</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">عميل</SelectItem>
                      <SelectItem value="STAFF">موظف</SelectItem>
                      <SelectItem value="ADMIN">مدير</SelectItem>
                      <SelectItem value="SUPER_ADMIN">مدير عام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="suspended">موقوف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUser ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالاسم أو البريد أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="CUSTOMER">عميل</SelectItem>
                  <SelectItem value="STAFF">موظف</SelectItem>
                  <SelectItem value="ADMIN">مدير</SelectItem>
                  <SelectItem value="SUPER_ADMIN">مدير عام</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف المستخدم {user.name}؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>إنشاء: {formatDate(user.createdAt)}</span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>آخر دخول: {formatDate(user.lastLogin)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {user.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleStatusUpdate(user.id, 'inactive')}
                      className="flex-1"
                    >
                      تعطيل
                    </Button>
                  )}
                  {user.status === 'inactive' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(user.id, 'active')}
                      className="flex-1"
                    >
                      تفعيل
                    </Button>
                  )}
                  {user.status === 'suspended' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(user.id, 'active')}
                      className="flex-1"
                    >
                      إلغاء الإيقاف
                    </Button>
                  )}
                  {user.status !== 'suspended' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleStatusUpdate(user.id, 'suspended')}
                    >
                      إيقاف
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">لا توجد مستخدمين مطابقين للبحث</p>
            <Button onClick={() => {
              setSearchTerm('')
              setRoleFilter('all')
              setStatusFilter('all')
            }}>
              مسح الفلاتر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}