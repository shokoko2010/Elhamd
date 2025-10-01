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
  Building, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  UserPlus,
  Key,
  Shield,
  Eye,
  Check,
  X,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { UserRole, PermissionCategory } from '@prisma/client'
import { PERMISSIONS, Permission } from '@/lib/permissions'

interface Branch {
  id: string
  name: string
  code: string
  address: string
  phone: string
  email: string
  isActive: boolean
  manager?: {
    id: string
    name: string
    email: string
  }
  staffCount: number
  createdAt: string
}

interface BranchUser {
  id: string
  name: string
  email: string
  role: UserRole
  branchPermissions: Permission[]
  isActive: boolean
  createdAt: string
}

interface BranchPermissionTemplate {
  id: string
  name: string
  description: string
  role: UserRole
  permissions: Permission[]
  isSystem: boolean
  isActive: boolean
}

export default function BranchPermissionsPage() {
  return (
    <AdminRoute requiredPermissions={['manage_branch_staff']}>
      <BranchPermissionsContent />
    </AdminRoute>
  )
}

function BranchPermissionsContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchUsers, setBranchUsers] = useState<BranchUser[]>([])
  const [permissionTemplates, setPermissionTemplates] = useState<BranchPermissionTemplate[]>([])
  const [activeTab, setActiveTab] = useState('branches')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedUser, setSelectedUser] = useState<BranchUser | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<BranchPermissionTemplate | null>(null)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isInitializing, setIsInitializing] = useState(false)

  // Form state for user permissions
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  
  // Form state for template permissions
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    role: UserRole.BRANCH_MANAGER,
    permissions: [] as Permission[]
  })

  // Branch-specific permission groups
  const branchPermissionGroups = [
    {
      category: 'User Management',
      permissions: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.CREATE_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.MANAGE_USER_ROLES
      ],
      description: 'إدارة المستخدمين في الفرع'
    },
    {
      category: 'Vehicle Management',
      permissions: [
        PERMISSIONS.VIEW_VEHICLES,
        PERMISSIONS.CREATE_VEHICLES,
        PERMISSIONS.EDIT_VEHICLES,
        PERMISSIONS.MANAGE_VEHICLE_INVENTORY
      ],
      description: 'إدارة المركبات في الفرع'
    },
    {
      category: 'Booking Management',
      permissions: [
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.CREATE_BOOKINGS,
        PERMISSIONS.EDIT_BOOKINGS,
        PERMISSIONS.MANAGE_BOOKING_STATUS
      ],
      description: 'إدارة الحجوزات في الفرع'
    },
    {
      category: 'Service Management',
      permissions: [
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.CREATE_SERVICES,
        PERMISSIONS.EDIT_SERVICES,
        PERMISSIONS.MANAGE_SERVICE_SCHEDULE
      ],
      description: 'إدارة الخدمات في الفرع'
    },
    {
      category: 'Inventory Management',
      permissions: [
        PERMISSIONS.VIEW_INVENTORY,
        PERMISSIONS.CREATE_INVENTORY_ITEMS,
        PERMISSIONS.EDIT_INVENTORY_ITEMS,
        PERMISSIONS.MANAGE_WAREHOUSES,
        PERMISSIONS.MANAGE_SUPPLIERS,
        PERMISSIONS.SYNC_VEHICLES_TO_INVENTORY
      ],
      description: 'إدارة المخزون في الفرع'
    },
    {
      category: 'Financial Management',
      permissions: [
        PERMISSIONS.VIEW_FINANCIALS,
        PERMISSIONS.CREATE_INVOICES,
        PERMISSIONS.EDIT_INVOICES,
        PERMISSIONS.MANAGE_PAYMENTS,
        PERMISSIONS.VIEW_REPORTS
      ],
      description: 'إدارة الشؤون المالية في الفرع'
    },
    {
      category: 'Branch Operations',
      permissions: [
        PERMISSIONS.VIEW_BRANCHES,
        PERMISSIONS.EDIT_BRANCHES,
        PERMISSIONS.MANAGE_BRANCH_STAFF,
        PERMISSIONS.MANAGE_BRANCH_BUDGET
      ],
      description: 'عمليات الفرع وإدارتها'
    },
    {
      category: 'Customer Management',
      permissions: [
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.CREATE_CUSTOMERS,
        PERMISSIONS.EDIT_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMER_PROFILES,
        PERMISSIONS.VIEW_CUSTOMER_HISTORY
      ],
      description: 'إدارة العملاء في الفرع'
    },
    {
      category: 'Reporting',
      permissions: [
        PERMISSIONS.GENERATE_REPORTS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXPORT_DATA
      ],
      description: 'التقارير والتحليلات للفرع'
    }
  ]

  useEffect(() => {
    fetchBranchPermissionsData()
  }, [])

  const fetchBranchPermissionsData = async () => {
    try {
      setLoading(true)
      
      // Fetch branches
      const branchesResponse = await fetch('/api/admin/branches')
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json()
        setBranches(branchesData.branches || [])
      }

      // Fetch branch users
      const usersResponse = await fetch('/api/admin/branch-users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setBranchUsers(usersData.users || [])
      }

      // Fetch branch permission templates
      const templatesResponse = await fetch('/api/admin/branch-permission-templates')
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setPermissionTemplates(templatesData.templates || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load branch permissions data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInitializeBranchPermissions = async () => {
    try {
      setIsInitializing(true)
      
      const response = await fetch('/api/admin/branch-permissions/initialize', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Branch permissions initialized successfully'
        })
        fetchBranchPermissionsData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to initialize branch permissions',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize branch permissions',
        variant: 'destructive'
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleEditUser = (branchUser: BranchUser) => {
    setSelectedUser(branchUser)
    setUserPermissions([...branchUser.branchPermissions])
    setIsEditUserModalOpen(true)
  }

  const handleSaveUserPermissions = async () => {
    if (!selectedUser || !selectedBranch) return

    try {
      const response = await fetch(`/api/admin/branches/${selectedBranch.id}/users/${selectedUser.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: userPermissions })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User branch permissions updated successfully'
        })
        setIsEditUserModalOpen(false)
        setSelectedUser(null)
        fetchBranchPermissionsData()
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

  const handleEditTemplate = (template: BranchPermissionTemplate) => {
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
      const response = await fetch(`/api/admin/branch-permission-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateForm)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Branch permission template updated successfully'
        })
        setIsEditTemplateModalOpen(false)
        setSelectedTemplate(null)
        fetchBranchPermissionsData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update branch permission template',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update branch permission template',
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

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const filteredUsers = branchUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = branchFilter === 'all' || user.branchPermissions.some(p => p.includes(branchFilter))
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesBranch && matchesRole
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
          <h1 className="text-3xl font-bold">نظام إدارة صلاحيات الفروع</h1>
          <p className="text-gray-600 mt-2">إدارة صلاحيات مديري الفروع والموظفين</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleInitializeBranchPermissions} 
            disabled={isInitializing}
            variant="outline"
          >
            <RefreshCw className="ml-2 h-4 w-4" />
            {isInitializing ? 'جاري التهيئة...' : 'تهيئة صلاحيات الفروع'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفروع</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground">
              {branches.filter(b => b.isActive).length} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مديري الفروع</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchUsers.filter(u => u.role === UserRole.BRANCH_MANAGER).length}
            </div>
            <p className="text-xs text-muted-foreground">
              مديري الفروع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موظفي الفروع</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchUsers.filter(u => u.role === UserRole.STAFF).length}
            </div>
            <p className="text-xs text-muted-foreground">
              موظفي الفروع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قوالب الصلاحيات</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              قوالب صلاحيات الفروع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branches">الفروع</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="templates">قوالب الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                الفروع وصلاحياتها
              </CardTitle>
              <CardDescription>
                إدارة الفروع وصلاحيات مديريها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="البحث عن فرع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branches List */}
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
                  {filteredBranches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{branch.name}</h3>
                          <p className="text-sm text-gray-600">{branch.code} • {branch.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={branch.isActive ? "default" : "secondary"}>
                              {branch.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                            {branch.manager && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                <Users className="w-3 h-3 ml-1" />
                                {branch.manager.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{branch.staffCount} موظف</div>
                          <div className="text-xs text-gray-500">
                            <Phone className="w-3 h-3 inline ml-1" />
                            {branch.phone}
                          </div>
                          <div className="text-xs text-gray-500">
                            <Mail className="w-3 h-3 inline ml-1" />
                            {branch.email}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBranch(branch)
                            setActiveTab('users')
                          }}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض الموظفين
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                مستخدمي الفروع
              </CardTitle>
              <CardDescription>
                إدارة صلاحيات موظفي الفروع
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
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفروع</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value={UserRole.BRANCH_MANAGER}>مدير فرع</SelectItem>
                    <SelectItem value={UserRole.STAFF}>موظف</SelectItem>
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
                  {filteredUsers.map((branchUser) => (
                    <div key={branchUser.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{branchUser.name || branchUser.email}</h3>
                          <p className="text-sm text-gray-600">{branchUser.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleBadgeColor(branchUser.role)}>
                              {getRoleLabel(branchUser.role)}
                            </Badge>
                            <Badge variant={branchUser.isActive ? "default" : "secondary"}>
                              {branchUser.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{branchUser.branchPermissions.length} صلاحية</div>
                          <div className="text-xs text-gray-500">
                            صلاحيات الفرع
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(branchUser)}
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل الصلاحيات
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
          {/* Branch Permission Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                قوالب صلاحيات الفروع
              </CardTitle>
              <CardDescription>
                إدارة قوالب الصلاحيات الافتراضية للفروع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {permissionTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Key className="w-5 h-5 text-purple-600" />
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
                          قالب صلاحيات الفرع
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
            <DialogTitle>تعديل صلاحيات المستخدم في الفرع</DialogTitle>
            <DialogDescription>
              {selectedUser && `تعديل صلاحيات المستخدم: ${selectedUser.name || selectedUser.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {branchPermissionGroups.map((group) => (
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

      {/* Edit Template Modal */}
      <Dialog open={isEditTemplateModalOpen} onOpenChange={setIsEditTemplateModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل قالب صلاحيات الفرع</DialogTitle>
            <DialogDescription>
              تعديل صلاحيات قالب الفرع
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
                    <SelectItem value={UserRole.BRANCH_MANAGER}>مدير فرع</SelectItem>
                    <SelectItem value={UserRole.STAFF}>موظف</SelectItem>
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
            {branchPermissionGroups.map((group) => (
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