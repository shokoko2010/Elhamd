'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Shield, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  UserPlus,
  Key,
  Building,
  Eye,
  Check,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-safe'
import { UserRole, PermissionCategory } from '@prisma/client'
import { PERMISSIONS, Permission } from '@/lib/permissions'

interface UserWithPermissions {
  id: string
  email: string
  name?: string
  role: UserRole
  branchId?: string
  branchName?: string
  permissions: Permission[]
  isActive: boolean
  createdAt: string
}

interface RoleTemplate {
  id: string
  name: string
  description?: string
  role: UserRole
  permissions: Permission[]
  isSystem: boolean
  isActive: boolean
}

interface PermissionGroup {
  category: PermissionCategory
  permissions: Permission[]
  description: string
}

export default function PermissionsPage() {
  return (
    <AdminRoute>
      <PermissionsContent />
    </AdminRoute>
  )
}

function PermissionsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithPermissions[]>([])
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([])
  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isInitializing, setIsInitializing] = useState(false)

  // Form state for user permissions
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  
  // Form state for template permissions
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    role: UserRole.STAFF,
    permissions: [] as Permission[]
  })

  // Permission groups for better organization
  const permissionGroups: PermissionGroup[] = [
    {
      category: PermissionCategory.USER_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.CREATE_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.DELETE_USERS,
        PERMISSIONS.MANAGE_USER_ROLES,
        PERMISSIONS.MANAGE_USER_PERMISSIONS
      ],
      description: 'إدارة المستخدمين وصلاحياتهم'
    },
    {
      category: PermissionCategory.VEHICLE_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_VEHICLES,
        PERMISSIONS.CREATE_VEHICLES,
        PERMISSIONS.EDIT_VEHICLES,
        PERMISSIONS.DELETE_VEHICLES,
        PERMISSIONS.MANAGE_VEHICLE_INVENTORY
      ],
      description: 'إدارة المركبات والمخزون'
    },
    {
      category: PermissionCategory.BOOKING_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.CREATE_BOOKINGS,
        PERMISSIONS.EDIT_BOOKINGS,
        PERMISSIONS.DELETE_BOOKINGS,
        PERMISSIONS.MANAGE_BOOKING_STATUS
      ],
      description: 'إدارة الحجوزات والمواعيد'
    },
    {
      category: PermissionCategory.SERVICE_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.CREATE_SERVICES,
        PERMISSIONS.EDIT_SERVICES,
        PERMISSIONS.DELETE_SERVICES,
        PERMISSIONS.MANAGE_SERVICE_SCHEDULE
      ],
      description: 'إدارة الخدمات والصيانة'
    },
    {
      category: PermissionCategory.INVENTORY_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_INVENTORY,
        PERMISSIONS.CREATE_INVENTORY_ITEMS,
        PERMISSIONS.EDIT_INVENTORY_ITEMS,
        PERMISSIONS.DELETE_INVENTORY_ITEMS,
        PERMISSIONS.MANAGE_WAREHOUSES,
        PERMISSIONS.MANAGE_SUPPLIERS,
        PERMISSIONS.SYNC_VEHICLES_TO_INVENTORY,
        PERMISSIONS.INITIALIZE_INVENTORY_DATA
      ],
      description: 'إدارة المخزون والمستودعات'
    },
    {
      category: PermissionCategory.FINANCIAL_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_FINANCIALS,
        PERMISSIONS.CREATE_INVOICES,
        PERMISSIONS.EDIT_INVOICES,
        PERMISSIONS.DELETE_INVOICES,
        PERMISSIONS.MANAGE_PAYMENTS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.EXPORT_FINANCIAL_DATA
      ],
      description: 'إدارة الشؤون المالية'
    },
    {
      category: PermissionCategory.BRANCH_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_BRANCHES,
        PERMISSIONS.CREATE_BRANCHES,
        PERMISSIONS.EDIT_BRANCHES,
        PERMISSIONS.DELETE_BRANCHES,
        PERMISSIONS.MANAGE_BRANCH_STAFF,
        PERMISSIONS.MANAGE_BRANCH_BUDGET,
        PERMISSIONS.APPROVE_BRANCH_TRANSFERS
      ],
      description: 'إدارة الفروع والعاملين'
    },
    {
      category: PermissionCategory.CUSTOMER_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.CREATE_CUSTOMERS,
        PERMISSIONS.EDIT_CUSTOMERS,
        PERMISSIONS.DELETE_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMER_PROFILES,
        PERMISSIONS.VIEW_CUSTOMER_HISTORY
      ],
      description: 'إدارة العملاء والخدمات'
    },
    {
      category: PermissionCategory.MARKETING_MANAGEMENT,
      permissions: [
        PERMISSIONS.VIEW_CAMPAIGNS,
        PERMISSIONS.CREATE_CAMPAIGNS,
        PERMISSIONS.EDIT_CAMPAIGNS,
        PERMISSIONS.DELETE_CAMPAIGNS,
        PERMISSIONS.MANAGE_EMAIL_TEMPLATES
      ],
      description: 'إدارة التسويق والحملات'
    },
    {
      category: PermissionCategory.SYSTEM_SETTINGS,
      permissions: [
        PERMISSIONS.VIEW_SYSTEM_SETTINGS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
        PERMISSIONS.MANAGE_ROLES_TEMPLATES,
        PERMISSIONS.VIEW_SYSTEM_LOGS,
        PERMISSIONS.MANAGE_BACKUPS
      ],
      description: 'إعدادات النظام والصيانة'
    },
    {
      category: PermissionCategory.REPORTING,
      permissions: [
        PERMISSIONS.GENERATE_REPORTS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXPORT_DATA,
        PERMISSIONS.MANAGE_DASHBOARDS
      ],
      description: 'التقارير والتحليلات'
    }
  ]

  useEffect(() => {
    fetchPermissionsData()
  }, [])

  const fetchPermissionsData = async () => {
    try {
      setLoading(true)
      
      // Fetch users with permissions
      const usersResponse = await fetch('/api/admin/users/permissions')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }

      // Fetch role templates
      const templatesResponse = await fetch('/api/admin/role-templates')
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setRoleTemplates(templatesData.templates || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load permissions data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInitializePermissions = async () => {
    try {
      setIsInitializing(true)
      
      const response = await fetch('/api/admin/permissions/initialize', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permissions initialized successfully'
        })
        fetchPermissionsData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to initialize permissions',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize permissions',
        variant: 'destructive'
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleEditUser = (user: UserWithPermissions) => {
    setSelectedUser(user)
    setUserPermissions([...user.permissions])
    setIsEditUserModalOpen(true)
  }

  const handleManageFinancePermissions = (user: UserWithPermissions) => {
    // Open finance permissions manager in a new tab or modal
    window.open(`/admin/users/${user.id}/finance-permissions`, '_blank')
  }

  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: userPermissions })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User permissions updated successfully'
        })
        setIsEditUserModalOpen(false)
        setSelectedUser(null)
        fetchPermissionsData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update user permissions',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user permissions',
        variant: 'destructive'
      })
    }
  }

  const handleEditTemplate = (template: RoleTemplate) => {
    setSelectedTemplate(template)
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      role: template.role,
      permissions: [...template.permissions]
    })
    setIsEditTemplateModalOpen(true)
  }

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch(`/api/admin/role-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateForm)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role template updated successfully'
        })
        setIsEditTemplateModalOpen(false)
        setSelectedTemplate(null)
        fetchPermissionsData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update role template',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role template',
        variant: 'destructive'
      })
    }
  }

  const handlePermissionToggle = (permission: Permission, isChecked: boolean) => {
    if (isChecked) {
      setUserPermissions(prev => [...prev, permission])
    } else {
      setUserPermissions(prev => prev.filter(p => p !== permission))
    }
  }

  const handleTemplatePermissionToggle = (permission: Permission, isChecked: boolean) => {
    if (isChecked) {
      setTemplateForm(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }))
    } else {
      setTemplateForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }))
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800',
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.BRANCH_MANAGER]: 'bg-blue-100 text-blue-800',
      [UserRole.STAFF]: 'bg-green-100 text-green-800',
      [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || colors[UserRole.CUSTOMER]
  }

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      [UserRole.SUPER_ADMIN]: 'مسؤول رئيسي',
      [UserRole.ADMIN]: 'مسؤول نظام',
      [UserRole.BRANCH_MANAGER]: 'مدير فرع',
      [UserRole.STAFF]: 'موظف',
      [UserRole.CUSTOMER]: 'عميل'
    }
    return labels[role] || role
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام إدارة الصلاحيات</h1>
          <p className="text-gray-600 mt-2">إدارة صلاحيات المستخدمين وقوالب الأدوار</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleInitializePermissions} 
            disabled={isInitializing}
            variant="outline"
          >
            <RefreshCw className="ml-2 h-4 w-4" />
            {isInitializing ? 'جاري التهيئة...' : 'تهيئة الصلاحيات'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isActive).length} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قوالب الأدوار</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              {roleTemplates.filter(t => t.isActive).length} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسؤولين</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN).length}
            </div>
            <p className="text-xs text-muted-foreground">
              مسؤولي النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مديري الفروع</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === UserRole.BRANCH_MANAGER).length}
            </div>
            <p className="text-xs text-muted-foreground">
              مديري الفروع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="templates">قوالب الأدوار</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                المستخدمين والصلاحيات
              </CardTitle>
              <CardDescription>
                إدارة صلاحيات المستخدمين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="البحث عن مستخدم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value={UserRole.SUPER_ADMIN}>مسؤول رئيسي</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>مسؤول نظام</SelectItem>
                    <SelectItem value={UserRole.BRANCH_MANAGER}>مدير فرع</SelectItem>
                    <SelectItem value={UserRole.STAFF}>موظف</SelectItem>
                    <SelectItem value={UserRole.CUSTOMER}>عميل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name || user.email}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            {user.branchName && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Building className="w-3 h-3 ml-1" />
                                {user.branchName}
                              </Badge>
                            )}
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{user.permissions.length} صلاحية</div>
                          <div className="text-xs text-gray-500">
                            آخر تحديث: {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل الصلاحيات
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageFinancePermissions(user)}
                        >
                          <Settings className="w-4 h-4 ml-1" />
                          الصلاحيات المالية
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Role Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                قوالب الأدوار
              </CardTitle>
              <CardDescription>
                إدارة قوالب الأدوار والصلاحيات الافتراضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roleTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(template.role)}>
                            {getRoleLabel(template.role)}
                          </Badge>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                          {template.isSystem && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              نظام
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{template.permissions.length} صلاحية</div>
                        <div className="text-xs text-gray-500">
                          قالب دور
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        disabled={template.isSystem}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل القالب
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Permissions Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل صلاحيات المستخدم</DialogTitle>
            <DialogDescription>
              {selectedUser && `تعديل صلاحيات المستخدم: ${selectedUser.name || selectedUser.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {permissionGroups.map((group) => (
              <Card key={group.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {group.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={userPermissions.includes(permission)}
                          onChange={(e) => handlePermissionToggle(permission, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={permission} className="text-sm">
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveUserPermissions}>
              <Save className="w-4 h-4 ml-2" />
              حفظ الصلاحيات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Template Modal */}
      <Dialog open={isEditTemplateModalOpen} onOpenChange={setIsEditTemplateModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل قالب الدور</DialogTitle>
            <DialogDescription>
              تعديل صلاحيات قالب الدور
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">اسم القالب</Label>
                <Input
                  id="templateName"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={selectedTemplate?.isSystem}
                />
              </div>
              <div>
                <Label htmlFor="templateRole">الدور</Label>
                <Select 
                  value={templateForm.role} 
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, role: value as UserRole }))}
                  disabled={selectedTemplate?.isSystem}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.SUPER_ADMIN}>مسؤول رئيسي</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>مسؤول نظام</SelectItem>
                    <SelectItem value={UserRole.BRANCH_MANAGER}>مدير فرع</SelectItem>
                    <SelectItem value={UserRole.STAFF}>موظف</SelectItem>
                    <SelectItem value={UserRole.CUSTOMER}>عميل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="templateDescription">الوصف</Label>
              <Textarea
                id="templateDescription"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                disabled={selectedTemplate?.isSystem}
              />
            </div>
            {permissionGroups.map((group) => (
              <Card key={group.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {group.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`template-${permission}`}
                          checked={templateForm.permissions.includes(permission)}
                          onChange={(e) => handleTemplatePermissionToggle(permission, e.target.checked)}
                          disabled={selectedTemplate?.isSystem}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`template-${permission}`} className="text-sm">
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTemplateModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveTemplate} disabled={selectedTemplate?.isSystem}>
              <Save className="w-4 h-4 ml-2" />
              حفظ القالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}