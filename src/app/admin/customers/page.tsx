'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Car,
  Wrench,
  Eye,
  MapPin,
  Save,
  X,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  address?: string
  licenseNumber?: string
  lastLoginAt?: string
  createdAt: string
  totalBookings: number
  totalSpent: number
  permissions: {
    id: string
    permission: {
      id: string
      name: string
      description: string
      category: string
    }
  }[]
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface CustomerFormData {
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  address?: string
  licenseNumber?: string
  permissions: string[]
}

export default function AdminCustomersPage() {
  return <CustomersContent />
}

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    isActive: true,
    address: '',
    licenseNumber: '',
    permissions: []
  })

  useEffect(() => {
    loadCustomers()
    loadPermissions()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, roleFilter, statusFilter])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.users)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  const filterCustomers = () => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm)
      
      const matchesRole = roleFilter === 'all' || customer.role === roleFilter
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && customer.isActive) ||
                           (statusFilter === 'inactive' && !customer.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })

    setFilteredCustomers(filtered)
  }

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      isActive: true,
      address: '',
      licenseNumber: '',
      permissions: []
    })
    setShowAddDialog(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
      isActive: customer.isActive,
      address: customer.address,
      licenseNumber: customer.licenseNumber,
      permissions: customer.permissions.map(p => p.permission.id)
    })
    setShowEditDialog(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowDeleteDialog(true)
  }

  const handleViewCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowViewDialog(true)
  }

  const handleManagePermissions = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData(prev => ({
      ...prev,
      permissions: customer.permissions.map(p => p.permission.id)
    }))
    setShowPermissionsDialog(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadCustomers()
        setShowAddDialog(false)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في إنشاء المستخدم')
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('فشل في إنشاء المستخدم')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/users/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadCustomers()
        setShowEditDialog(false)
        setEditingCustomer(null)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث المستخدم')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('فشل في تحديث المستخدم')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editingCustomer) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/users/${editingCustomer.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadCustomers()
        setShowDeleteDialog(false)
        setEditingCustomer(null)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في حذف المستخدم')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('فشل في حذف المستخدم')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePermissions = async () => {
    if (!editingCustomer) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/admin/users/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: formData.permissions })
      })

      if (response.ok) {
        await loadCustomers()
        setShowPermissionsDialog(false)
        setEditingCustomer(null)
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث الصلاحيات')
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      alert('فشل في تحديث الصلاحيات')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG')
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      CUSTOMER: { variant: 'default' as const, label: 'عميل' },
      ADMIN: { variant: 'secondary' as const, label: 'مشرف' },
      STAFF: { variant: 'outline' as const, label: 'موظف' },
      BRANCH_MANAGER: { variant: 'default' as const, label: 'مدير فرع' },
      SUPER_ADMIN: { variant: 'destructive' as const, label: 'سوبر مشرف' }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CUSTOMER
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPermissionsByCategory = () => {
    const categories = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)

    return categories
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      USER_MANAGEMENT: 'إدارة المستخدمين',
      VEHICLE_MANAGEMENT: 'إدارة المركبات',
      BOOKING_MANAGEMENT: 'إدارة الحجوزات',
      SERVICE_MANAGEMENT: 'إدارة الخدمات',
      REPORTING: 'التقارير',
      SYSTEM_SETTINGS: 'إعدادات النظام',
      FINANCIAL: 'المالية'
    }
    return labels[category as keyof typeof labels] || category
  }

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    inactive: customers.filter(c => !c.isActive).length,
    totalBookings: customers.reduce((sum, c) => sum + c.totalBookings, 0),
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
        <p className="text-gray-600">إدارة مستخدمي النظام وصلاحياتهم</p>
        <div className="mt-4">
          <Button onClick={handleAddCustomer}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة مستخدم جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              جميع المستخدمين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين النشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              مستخدمين نشطين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين غير النشطين</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              مستخدمين غير نشطين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              جميع الحجوزات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الإنفاق</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length > 0 ? formatPrice(stats.totalRevenue / customers.length) : formatPrice(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              للمستخدم الواحد
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="بحث بالاسم، البريد، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="CUSTOMER">عميل</SelectItem>
                <SelectItem value="STAFF">موظف</SelectItem>
                <SelectItem value="ADMIN">مشرف</SelectItem>
                <SelectItem value="BRANCH_MANAGER">مدير فرع</SelectItem>
                <SelectItem value="SUPER_ADMIN">سوبر مشرف</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadCustomers}>
              <Filter className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    {getRoleBadge(customer.role)}
                    <div className="flex items-center gap-1">
                      {customer.isActive ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-gray-500">
                        {customer.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">الحجوزات:</span> {customer.totalBookings}
                      </div>
                      <div className="text-sm font-medium text-green-600 mb-1">
                        <span className="font-medium">الإنفاق:</span> {formatPrice(customer.totalSpent)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">الصلاحيات:</span> {customer.permissions.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">آخر تسجيل دخول:</span> {
                      customer.lastLogin ? formatDate(customer.lastLogin) : 'لم يسجل دخوله بعد'
                    }
                  </div>
                </div>
                
                <div className="flex gap-2 mr-4">
                  <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleManagePermissions(customer)}>
                    <Shield className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>أدخل بيانات المستخدم الجديد</DialogDescription>
          </DialogHeader>
          <CustomerForm 
            formData={formData} 
            setFormData={setFormData}
            permissions={permissions}
            onSubmit={handleSubmitAdd}
            loading={loading}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل مستخدم</DialogTitle>
            <DialogDescription>تعديل بيانات المستخدم</DialogDescription>
          </DialogHeader>
          <CustomerForm 
            formData={formData} 
            setFormData={setFormData}
            permissions={permissions}
            onSubmit={handleSubmitEdit}
            loading={loading}
            onCancel={() => {
              setShowEditDialog(false)
              setEditingCustomer(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف مستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المستخدم {editingCustomer?.name}؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
            <DialogDescription>معلومات كاملة عن المستخدم</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">الاسم</Label>
                    <p className="font-medium">{editingCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">البريد الإلكتروني</Label>
                    <p className="font-medium">{editingCustomer.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">الهاتف</Label>
                    <p className="font-medium">{editingCustomer.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">الدور</Label>
                    <p className="font-medium">{getRoleBadge(editingCustomer.role)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">الحالة</Label>
                    <p className="font-medium">
                      {editingCustomer.isActive ? (
                        <Badge variant="default">نشط</Badge>
                      ) : (
                        <Badge variant="secondary">غير نشط</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">تاريخ الإنشاء</Label>
                    <p className="font-medium">{formatDate(editingCustomer.createdAt)}</p>
                  </div>
                </div>
              </div>

              {editingCustomer.address && (
                <div>
                  <h3 className="font-semibold mb-2">العنوان</h3>
                  <p className="text-gray-700">{editingCustomer.address}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">الإحصائيات</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">إجمالي الحجوزات</Label>
                    <p className="font-medium">{editingCustomer.totalBookings}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">إجمالي الإنفاق</Label>
                    <p className="font-medium">{formatPrice(editingCustomer.totalSpent)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">الصلاحيات</h3>
                <div className="space-y-2">
                  {editingCustomer.permissions.length > 0 ? (
                    editingCustomer.permissions.map((permission) => (
                      <Badge key={permission.id} variant="outline" className="mr-2">
                        {permission.permission.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">لا توجد صلاحيات مخصصة</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إدارة الصلاحيات</DialogTitle>
            <DialogDescription>
              إدارة صلاحيات المستخدم: {editingCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h4 className="font-semibold mb-3 text-lg">{getCategoryLabel(category)}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, checked as boolean)
                        }
                      />
                      <label htmlFor={permission.id} className="text-sm cursor-pointer">
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSavePermissions} disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CustomerForm({ 
  formData, 
  setFormData, 
  permissions,
  onSubmit, 
  loading, 
  onCancel 
}: {
  formData: CustomerFormData
  setFormData: (data: CustomerFormData) => void
  permissions: Permission[]
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  onCancel: () => void
}) {
  const roleOptions = [
    { value: 'CUSTOMER', label: 'عميل' },
    { value: 'STAFF', label: 'موظف' },
    { value: 'ADMIN', label: 'مشرف' },
    { value: 'BRANCH_MANAGER', label: 'مدير فرع' },
    { value: 'SUPER_ADMIN', label: 'سوبر مشرف' }
  ]

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">الاسم الكامل *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">البريد الإلكتروني *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">رقم الهاتف *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">الدور</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label htmlFor="isActive">حساب نشط</Label>
      </div>
      
      <div>
        <Label htmlFor="address">العنوان</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="العنوان الكامل..."
        />
      </div>
      
      <div>
        <Label htmlFor="licenseNumber">رقم الرخصة</Label>
        <Input
          id="licenseNumber"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </form>
  )
}