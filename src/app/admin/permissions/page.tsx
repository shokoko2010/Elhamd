'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingIndicator, ErrorState, EmptyState } from '@/components/ui/LoadingIndicator'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { PermissionCategory, UserRole } from '@prisma/client'
import {
  getPermissionCategoryLabelAr,
  getPermissionDescriptionAr,
  getPermissionLabelAr,
  getRoleLabelAr,
  getRoleTemplateDescriptionAr,
  getRoleTemplateNameAr,
} from '@/lib/permission-translations'
import {
  Building,
  Edit,
  Key,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Users,
  UserPlus,
  Trash2,
  Copy,
  PlusCircle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface PermissionRecord {
  id: string
  name: string
  description?: string | null
  category: PermissionCategory
}

interface ApiPermissionEdge {
  permission: PermissionRecord | null
}

interface ApiUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  roleLabel?: string | null
  phone?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  branchId?: string | null
  branchName?: string | null
  permissions?: ApiPermissionEdge[]
  roleTemplateId?: string | null
  roleTemplate?: {
    id: string
    name: string
    nameAr?: string | null
    role: UserRole
    roleLabel?: string | null
    isSystem: boolean
    isActive: boolean
  } | null
  roleTemplateNameAr?: string | null
  roleTemplateRoleLabel?: string | null
}

interface Metrics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  adminUsers: number
  branchManagers: number
}

interface UsersResponse {
  users?: ApiUser[]
  metrics?: Metrics
}

interface RoleTemplate {
  id: string
  name: string
  nameAr?: string | null
  description?: string | null
  descriptionAr?: string | null
  role: UserRole
  roleLabel?: string | null
  permissions: string[]
  isActive: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
  userCount?: number
  permissionsMeta?: { name: string; label: string; description?: string | null }[]
}

interface RoleTemplatesResponse {
  templates?: RoleTemplate[]
}

interface PermissionsResponse {
  permissions?: PermissionRecord[]
}

interface UserWithPermissions {
  id: string
  email: string
  name?: string | null
  role: UserRole
  roleLabel?: string | null
  branchId?: string | null
  branchName?: string | null
  isActive: boolean
  createdAt: string
  permissions: string[]
  permissionDetails: PermissionRecord[]
  roleTemplateId?: string | null
  roleTemplateName?: string | null
  roleTemplateNameAr?: string | null
  roleTemplateRole?: UserRole | null
  roleTemplateRoleLabel?: string | null
}

interface PermissionGroup {
  category: PermissionCategory
  title: string
  description: string
  permissions: PermissionRecord[]
}

const CATEGORY_META: Record<PermissionCategory, { title: string; description: string }> = {
  [PermissionCategory.USER_MANAGEMENT]: {
    title: 'إدارة المستخدمين',
    description: 'التحكم في حسابات المستخدمين، الأدوار، والصلاحيات الفردية',
  },
  [PermissionCategory.VEHICLE_MANAGEMENT]: {
    title: 'إدارة المركبات',
    description: 'تنظيم المركبات، مواصفاتها، وتتبع توفرها في المخزون',
  },
  [PermissionCategory.BOOKING_MANAGEMENT]: {
    title: 'إدارة الحجوزات',
    description: 'متابعة الحجوزات، الجداول الزمنية، وحالة الطلبات',
  },
  [PermissionCategory.SERVICE_MANAGEMENT]: {
    title: 'الخدمات والصيانة',
    description: 'إدارة الخدمات، أوامر الصيانة، وجدولة الفنيين',
  },
  [PermissionCategory.INVENTORY_MANAGEMENT]: {
    title: 'إدارة المخزون',
    description: 'إدارة المستودعات، الموردين، وقطع الغيار',
  },
  [PermissionCategory.FINANCIAL_MANAGEMENT]: {
    title: 'الشؤون المالية',
    description: 'الفواتير، المدفوعات، التقارير المالية، وإدارة الضرائب',
  },
  [PermissionCategory.REPORTING]: {
    title: 'التقارير والتحليلات',
    description: 'إنشاء التقارير، تصدير البيانات، وتحليلات الأداء',
  },
  [PermissionCategory.SYSTEM_SETTINGS]: {
    title: 'إعدادات النظام',
    description: 'إدارة إعدادات المنصة، النسخ الاحتياطي، وسجلات النظام',
  },
  [PermissionCategory.BRANCH_MANAGEMENT]: {
    title: 'إدارة الفروع',
    description: 'الإشراف على الفروع، الميزانيات، وفرق العمل المحلية',
  },
  [PermissionCategory.CUSTOMER_MANAGEMENT]: {
    title: 'إدارة العملاء',
    description: 'ملفات العملاء، التواصل، وتتبع التفاعل مع الشركة',
  },
  [PermissionCategory.MARKETING_MANAGEMENT]: {
    title: 'التسويق والحملات',
    description: 'إدارة الحملات التسويقية، قنوات التواصل، والنماذج',
  },
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: getRoleLabelAr(UserRole.SUPER_ADMIN),
  [UserRole.ADMIN]: getRoleLabelAr(UserRole.ADMIN),
  [UserRole.BRANCH_MANAGER]: getRoleLabelAr(UserRole.BRANCH_MANAGER),
  [UserRole.STAFF]: getRoleLabelAr(UserRole.STAFF),
  [UserRole.ACCOUNTANT]: getRoleLabelAr(UserRole.ACCOUNTANT),
  [UserRole.CUSTOMER]: getRoleLabelAr(UserRole.CUSTOMER),
}

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800',
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.ACCOUNTANT]: 'bg-amber-100 text-amber-800',
  [UserRole.BRANCH_MANAGER]: 'bg-blue-100 text-blue-800',
  [UserRole.STAFF]: 'bg-green-100 text-green-800',
  [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-800',
}

const formatNumber = (value: number | undefined) =>
  new Intl.NumberFormat('ar-EG').format(value ?? 0)

const formatPermissionLabel = (permission: PermissionRecord) =>
  permission.description ?? permission.name.replace(/_/g, ' ')

export default function PermissionsPage() {
  return (
    <AdminRoute>
      <PermissionsDashboard />
    </AdminRoute>
  )
}

function PermissionsDashboard() {
  const { toast } = useToast()
  const { user, canManageRoleTemplates } = useAuth()

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN
  const allowSystemTemplateEditing = isSuperAdmin
  const allowRoleTemplateManagement = isSuperAdmin || canManageRoleTemplates()

  const [users, setUsers] = useState<UserWithPermissions[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([])
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionRecord[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'templates'>('users')

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  const [isInitializing, setIsInitializing] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    role: UserRole.STAFF,
    permissions: [] as string[],
    isActive: true,
  })
  const isSystemTemplateLocked = Boolean(selectedTemplate?.isSystem && !allowSystemTemplateEditing)

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.STAFF,
    roleTemplateId: '',
    password: '',
    confirmPassword: '',
    applyRoleTemplate: true,
    preserveManualPermissions: false,
    permissions: [] as string[],
  })
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false)
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    description: '',
    role: UserRole.STAFF,
    permissions: [] as string[],
    isActive: true,
  })
  const [templatePendingDelete, setTemplatePendingDelete] = useState<RoleTemplate | null>(null)

  const [userEditForm, setUserEditForm] = useState({
    role: UserRole.STAFF,
    roleTemplateId: '',
    applyRoleTemplate: false,
    preserveManualPermissions: false,
  })
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  const fetchData = useCallback(
    async (options?: { initial?: boolean }) => {
      const initial = options?.initial ?? false
      if (initial) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          scope: 'all',
          page: '1',
          limit: '100',
        })

        const [usersRes, templatesRes, permissionsRes] = await Promise.all([
          fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' }),
          fetch('/api/admin/role-templates', { cache: 'no-store' }),
          fetch('/api/admin/permissions?category=all', { cache: 'no-store' }),
        ])

        if (!usersRes.ok) {
          throw new Error('Failed to load users')
        }
        if (!templatesRes.ok) {
          throw new Error('Failed to load role templates')
        }
        if (!permissionsRes.ok) {
          throw new Error('Failed to load permissions catalog')
        }

        const usersPayload = (await usersRes.json()) as UsersResponse
        const templatesPayload = (await templatesRes.json()) as RoleTemplatesResponse
        const permissionsPayload = (await permissionsRes.json()) as PermissionsResponse

        const transformedUsers = (usersPayload.users ?? []).map<UserWithPermissions>((user) => {
          const permissionDetails = (user.permissions ?? [])
            .map((edge) => edge.permission)
            .filter((permission): permission is PermissionRecord => Boolean(permission))

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            roleLabel: user.roleLabel ?? getRoleLabelAr(user.role),
            branchId: user.branchId ?? undefined,
            branchName: user.branchName ?? undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            permissions: permissionDetails.map((permission) => permission.name),
            permissionDetails,
            roleTemplateId: user.roleTemplateId ?? undefined,
            roleTemplateName: user.roleTemplate?.name ?? undefined,
            roleTemplateNameAr:
              user.roleTemplateNameAr ??
              (user.roleTemplate ? getRoleTemplateNameAr(user.roleTemplate.name, user.roleTemplate.role) : undefined),
            roleTemplateRole: user.roleTemplate?.role ?? undefined,
            roleTemplateRoleLabel:
              user.roleTemplateRoleLabel ??
              (user.roleTemplate?.role ? getRoleLabelAr(user.roleTemplate.role) : undefined),
          }
        })

        const transformedTemplates = (templatesPayload.templates ?? []).map<RoleTemplate>((template) => ({
          ...template,
          nameAr: template.nameAr ?? getRoleTemplateNameAr(template.name, template.role),
          descriptionAr:
            template.descriptionAr ?? getRoleTemplateDescriptionAr(template.description, template.role),
          roleLabel: template.roleLabel ?? getRoleLabelAr(template.role),
          userCount: template.userCount ?? 0,
        }))

        setUsers(transformedUsers)
        setMetrics(usersPayload.metrics ?? null)
        setRoleTemplates(transformedTemplates)
        setPermissionsCatalog(permissionsPayload.permissions ?? [])
      } catch (err) {
        console.error(err)
        setError('تعذر تحميل بيانات إدارة الصلاحيات. يرجى المحاولة لاحقاً.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchData({ initial: true })
  }, [fetchData])

  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    const groupsMap = new Map<PermissionCategory, PermissionRecord[]>()

    permissionsCatalog.forEach((permission) => {
      const existing = groupsMap.get(permission.category) ?? []
      groupsMap.set(permission.category, [...existing, permission])
    })

    return (Object.values(PermissionCategory) as PermissionCategory[]).map((category) => {
      const meta = CATEGORY_META[category]
      const permissions = (groupsMap.get(category) ?? []).sort((a, b) => a.name.localeCompare(b.name))

      return {
        category,
        title: meta?.title ?? category,
        description: meta?.description ?? '',
        permissions,
      }
    })
  }, [permissionsCatalog])

  const templateMap = useMemo(() => new Map(roleTemplates.map((template) => [template.id, template])), [roleTemplates])

  const templatesByRole = useMemo(() => {
    const groups = new Map<UserRole, RoleTemplate[]>()
    roleTemplates.forEach((template) => {
      const existing = groups.get(template.role) ?? []
      groups.set(template.role, [...existing, template])
    })
    return groups
  }, [roleTemplates])

  const activeTemplateOptions = useMemo(
    () =>
      roleTemplates
        .filter((template) => template.isActive || user?.role === UserRole.SUPER_ADMIN)
        .sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [roleTemplates, user?.role]
  )

  const aggregatedMetrics = useMemo(() => {
    return {
      totalUsers: metrics?.totalUsers ?? users.length,
      activeUsers: metrics?.activeUsers ?? users.filter((user) => user.isActive).length,
      admins:
        metrics?.adminUsers ?? users.filter((user) => user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN).length,
      branchManagers:
        metrics?.branchManagers ?? users.filter((user) => user.role === UserRole.BRANCH_MANAGER).length,
      roleTemplateCount: roleTemplates.length,
      activeTemplates: roleTemplates.filter((template) => template.isActive).length,
    }
  }, [metrics, roleTemplates, users])

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      if (!query) {
        return matchesRole
      }

      const haystacks = [user.email, user.name ?? '', user.branchName ?? '']
      const matchesSearch = haystacks.some((value) => value.toLowerCase().includes(query))

      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, searchTerm])

  const handleRefresh = () => fetchData()

  const handleInitializePermissions = async () => {
    try {
      setIsInitializing(true)
      const response = await fetch('/api/admin/permissions/initialize', { method: 'POST' })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to initialize permissions' }))
        throw new Error(payload.error ?? 'Failed to initialize permissions')
      }

      toast({ title: 'تمت التهيئة', description: 'تمت تهيئة صلاحيات النظام بنجاح.' })
      fetchData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'خطأ في التهيئة',
        description: 'تعذر تهيئة الصلاحيات. يرجى المحاولة لاحقاً.',
        variant: 'destructive',
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleEditUser = (user: UserWithPermissions) => {
    setSelectedUser(user)
    setUserPermissions([...user.permissions])
    setUserEditForm({
      role: user.role,
      roleTemplateId: user.roleTemplateId ?? '',
      applyRoleTemplate: false,
      preserveManualPermissions: user.permissions.length > 0,
    })
    setIsEditUserModalOpen(true)
  }

  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return

    try {
      setIsSavingUser(true)
      const payload: Record<string, unknown> = {
        role: userEditForm.role,
        roleTemplateId: userEditForm.roleTemplateId ? userEditForm.roleTemplateId : null,
        applyRoleTemplate: userEditForm.applyRoleTemplate,
        preserveManualPermissions: userEditForm.preserveManualPermissions,
      }

      if (userEditForm.applyRoleTemplate) {
        payload.additionalPermissions = Array.from(new Set(userPermissions))
      } else {
        payload.permissions = Array.from(new Set(userPermissions))
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'Failed to update user permissions' }))
        throw new Error(result.error ?? 'Failed to update user permissions')
      }

      toast({ title: 'تم التحديث', description: 'تم تحديث بيانات المستخدم وصلاحياته بنجاح.' })
      setIsEditUserModalOpen(false)
      setSelectedUser(null)
      fetchData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'خطأ',
        description: 'تعذر تحديث صلاحيات المستخدم.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleEditTemplate = (template: RoleTemplate) => {
    setSelectedTemplate(template)
    setTemplateForm({
      name: template.name,
      description: template.description ?? '',
      role: template.role,
      permissions: [...template.permissions],
      isActive: template.isActive,
    })
    setIsEditTemplateModalOpen(true)
  }

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return

    try {
      setIsSavingTemplate(true)
      const response = await fetch(`/api/admin/role-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...templateForm,
          permissions: Array.from(new Set(templateForm.permissions)),
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to update role template' }))
        throw new Error(payload.error ?? 'Failed to update role template')
      }

      toast({ title: 'تم التحديث', description: 'تم تحديث قالب الدور بنجاح.' })
      setIsEditTemplateModalOpen(false)
      setSelectedTemplate(null)
      fetchData()
    } catch (err) {
      console.error(err)
      toast({
        title: 'خطأ',
        description: 'تعذر تحديث قالب الدور.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const toggleUserPermission = (permission: string, enabled: boolean) => {
    setUserPermissions((prev) => {
      if (enabled) {
        if (prev.includes(permission)) return prev
        return [...prev, permission]
      }
      return prev.filter((value) => value !== permission)
    })
  }

  const toggleTemplatePermission = (permission: string, enabled: boolean) => {
    setTemplateForm((prev) => {
      const permissions = enabled
        ? prev.permissions.includes(permission)
          ? prev.permissions
          : [...prev.permissions, permission]
        : prev.permissions.filter((value) => value !== permission)

      return { ...prev, permissions }
    })
  }

  const toggleNewTemplatePermission = (permission: string, enabled: boolean) => {
    setNewTemplateForm((prev) => {
      const permissions = enabled
        ? prev.permissions.includes(permission)
          ? prev.permissions
          : [...prev.permissions, permission]
        : prev.permissions.filter((value) => value !== permission)

      return { ...prev, permissions }
    })
  }

  const resetCreateUserForm = () => {
    setCreateUserForm({
      name: '',
      email: '',
      phone: '',
      role: UserRole.STAFF,
      roleTemplateId: '',
      password: '',
      confirmPassword: '',
      applyRoleTemplate: true,
      preserveManualPermissions: false,
      permissions: [],
    })
  }

  const handleCreateTemplate = async () => {
    try {
      setIsCreatingTemplate(true)
      const response = await fetch('/api/admin/role-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTemplateForm,
          permissions: Array.from(new Set(newTemplateForm.permissions)),
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to create role template' }))
        throw new Error(payload.error ?? 'Failed to create role template')
      }

      toast({ title: 'تم الإنشاء', description: 'تم إنشاء قالب الدور بنجاح.' })
      setIsCreateTemplateModalOpen(false)
      setNewTemplateForm({
        name: '',
        description: '',
        role: UserRole.STAFF,
        permissions: [],
        isActive: true,
      })
      fetchData()
    } catch (error) {
      console.error(error)
      toast({ title: 'خطأ', description: 'تعذر إنشاء قالب الدور.', variant: 'destructive' })
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!templatePendingDelete) return

    try {
      setIsSavingTemplate(true)
      const response = await fetch(`/api/admin/role-templates/${templatePendingDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to delete template' }))
        throw new Error(payload.error ?? 'Failed to delete template')
      }

      toast({ title: 'تم الحذف', description: 'تم حذف قالب الدور بنجاح.' })
      setTemplatePendingDelete(null)
      fetchData()
    } catch (error) {
      console.error(error)
      toast({ title: 'خطأ', description: 'تعذر حذف قالب الدور.', variant: 'destructive' })
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createUserForm.email || !createUserForm.password) {
      toast({ title: 'خطأ', description: 'البريد الإلكتروني وكلمة المرور مطلوبان.', variant: 'destructive' })
      return
    }

    if (createUserForm.password !== createUserForm.confirmPassword) {
      toast({ title: 'خطأ', description: 'كلمتا المرور غير متطابقتين.', variant: 'destructive' })
      return
    }

    try {
      setIsCreatingUser(true)
      const payload = {
        email: createUserForm.email,
        name: createUserForm.name,
        phone: createUserForm.phone,
        role: createUserForm.role,
        password: createUserForm.password,
        roleTemplateId: createUserForm.roleTemplateId || undefined,
        applyRoleTemplate: createUserForm.applyRoleTemplate,
        preserveManualPermissions: createUserForm.preserveManualPermissions,
        permissions: createUserForm.permissions,
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: 'Failed to create user' }))
        throw new Error(result.error ?? 'Failed to create user')
      }

      toast({ title: 'تم الإنشاء', description: 'تم إنشاء المستخدم وتحديد دوره بنجاح.' })
      setIsCreateUserModalOpen(false)
      resetCreateUserForm()
      fetchData()
    } catch (error) {
      console.error(error)
      toast({ title: 'خطأ', description: 'تعذر إنشاء المستخدم الجديد.', variant: 'destructive' })
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleSelectTemplateForNewUser = (templateId: string) => {
    const template = templateMap.get(templateId)
    setCreateUserForm((prev) => ({
      ...prev,
      roleTemplateId: templateId,
      role: template?.role ?? prev.role,
      permissions: prev.permissions,
    }))
  }

  const handleSelectTemplateForEditUser = (templateId: string) => {
    const template = templateMap.get(templateId)
    setUserEditForm((prev) => ({
      ...prev,
      roleTemplateId: templateId,
      role: template?.role ?? prev.role,
    }))
    if (template && userEditForm.applyRoleTemplate) {
      setUserPermissions(template.permissions)
    }
  }

  const handleDuplicateTemplate = (template: RoleTemplate) => {
    setNewTemplateForm({
      name: `${template.name}-نسخة`,
      description: template.description ?? '',
      role: template.role,
      permissions: [...template.permissions],
      isActive: template.isActive,
    })
    setIsCreateTemplateModalOpen(true)
  }

  const handleToggleTemplateActive = async (template: RoleTemplate, active: boolean) => {
    if (template.isSystem && !allowSystemTemplateEditing) {
      return
    }

    try {
      setIsSavingTemplate(true)
      const response = await fetch(`/api/admin/role-templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          role: template.role,
          permissions: template.permissions,
          isActive: active,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Failed to update template state' }))
        throw new Error(payload.error ?? 'Failed to update template state')
      }

      toast({ title: 'تم التحديث', description: 'تم تحديث حالة القالب بنجاح.' })
      fetchData()
    } catch (error) {
      console.error(error)
      toast({ title: 'خطأ', description: 'تعذر تحديث حالة القالب.', variant: 'destructive' })
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const formatRoleBadge = (role: UserRole) => ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES[UserRole.CUSTOMER]

  if (loading && users.length === 0 && roleTemplates.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator size="lg" text="جاري تحميل بيانات الصلاحيات" />
      </div>
    )
  }

  if (error && users.length === 0 && roleTemplates.length === 0) {
    return <ErrorState message={error} onRetry={() => fetchData({ initial: true })} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام إدارة الصلاحيات</h1>
          <p className="text-muted-foreground">
            الإشراف على صلاحيات المستخدمين، قوالب الأدوار، والوصول إلى إعدادات النظام
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsCreateUserModalOpen(true)}>
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة مستخدم
          </Button>
          {allowRoleTemplateManagement && (
            <Button variant="outline" onClick={() => setIsCreateTemplateModalOpen(true)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              قالب جديد
            </Button>
          )}
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
          <Button variant="secondary" onClick={handleInitializePermissions} disabled={isInitializing}>
            <Key className="ml-2 h-4 w-4" />
            {isInitializing ? 'جاري التهيئة...' : 'تهيئة الصلاحيات'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(aggregatedMetrics.totalUsers)}</div>
            <CardDescription>{formatNumber(aggregatedMetrics.activeUsers)} مستخدم نشط</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قوالب الأدوار</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(aggregatedMetrics.roleTemplateCount)}</div>
            <CardDescription>{formatNumber(aggregatedMetrics.activeTemplates)} قالب نشط</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسؤولون</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(aggregatedMetrics.admins)}</div>
            <CardDescription>المسؤولون الإداريون في النظام</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مديرو الفروع</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(aggregatedMetrics.branchManagers)}</div>
            <CardDescription>إجمالي مديري الفروع المسجلين</CardDescription>
          </CardContent>
        </Card>
      </div>

      {error && (
        <ErrorState
          className="border"
          message={error}
          onRetry={() => fetchData({ initial: true })}
          title="تعذر تحديث البيانات"
        />
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="templates">قوالب الأدوار</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                المستخدمون والصلاحيات
              </CardTitle>
              <CardDescription>إدارة الصلاحيات الممنوحة لكل مستخدم في النظام</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 md:flex-row">
              <Input
                className="md:flex-1"
                placeholder="البحث عن مستخدم حسب الاسم أو البريد أو الفرع"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | UserRole)}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="فلترة حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value={UserRole.SUPER_ADMIN}>{ROLE_LABELS[UserRole.SUPER_ADMIN]}</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>{ROLE_LABELS[UserRole.ADMIN]}</SelectItem>
                  <SelectItem value={UserRole.ACCOUNTANT}>{ROLE_LABELS[UserRole.ACCOUNTANT]}</SelectItem>
                  <SelectItem value={UserRole.BRANCH_MANAGER}>{ROLE_LABELS[UserRole.BRANCH_MANAGER]}</SelectItem>
                  <SelectItem value={UserRole.STAFF}>{ROLE_LABELS[UserRole.STAFF]}</SelectItem>
                  <SelectItem value={UserRole.CUSTOMER}>{ROLE_LABELS[UserRole.CUSTOMER]}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              {refreshing && users.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <LoadingIndicator text="جاري تحديث قائمة المستخدمين" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState
                  title="لا يوجد مستخدمون مطابقون"
                  message="لم يتم العثور على مستخدمين ضمن معايير البحث المحددة."
                />
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 transition hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name || user.email}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className={formatRoleBadge(user.role)}>
                            {user.roleLabel || ROLE_LABELS[user.role] || getRoleLabelAr(user.role)}
                          </Badge>
                          {user.branchName && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Building className="ml-1 h-3 w-3" />
                              {user.branchName}
                            </Badge>
                          )}
                          {(user.roleTemplateNameAr || user.roleTemplateName) && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {user.roleTemplateNameAr || user.roleTemplateName}
                            </Badge>
                          )}
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatNumber(user.permissions.length)} صلاحية مخصصة
                        </div>
                        <div className="text-xs text-muted-foreground">
                          آخر تحديث: {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="ml-1 h-4 w-4" />
                          تعديل الصلاحيات
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/admin/users/${user.id}/finance-permissions`, '_blank')}
                        >
                          <Settings className="ml-1 h-4 w-4" />
                          الصلاحيات المالية
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                قوالب الأدوار
              </CardTitle>
              <CardDescription>إدارة الأدوار القياسية وتوزيع الصلاحيات الافتراضية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {refreshing && roleTemplates.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <LoadingIndicator text="جاري تحميل قوالب الأدوار" />
                </div>
              ) : roleTemplates.length === 0 ? (
                <EmptyState title="لا توجد قوالب أدوار" message="لم يتم إنشاء أي قالب دور حتى الآن." />
              ) : (
                Array.from(templatesByRole.entries()).map(([role, templates]) => (
                  <div key={role} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={formatRoleBadge(role)}>{ROLE_LABELS[role]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatNumber(templates.filter((template) => template.isActive).length)} قالب نشط
                      </span>
                    </div>
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex flex-col gap-4 rounded-lg border p-4 transition hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                            <Shield className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{template.nameAr || template.name}</h3>
                            {(template.descriptionAr || template.description) && (
                              <p className="text-sm text-muted-foreground">
                                {template.descriptionAr || template.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge className={formatRoleBadge(template.role)}>
                                {template.roleLabel || ROLE_LABELS[template.role]}
                              </Badge>
                              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                {template.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                              {template.isSystem && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  نظام
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                {formatNumber(template.userCount ?? 0)} مستخدم
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatNumber(template.permissions.length)} صلاحية مدمجة
                            </div>
                            <div className="text-xs text-muted-foreground">
                              آخر تحديث: {new Date(template.updatedAt).toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                          {allowRoleTemplateManagement && (
                            <div className="flex flex-wrap gap-2">
                              <Switch
                                checked={template.isActive}
                                disabled={template.isSystem && !allowSystemTemplateEditing}
                                onCheckedChange={(checked) => handleToggleTemplateActive(template, checked)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                                disabled={template.isSystem && !allowSystemTemplateEditing}
                              >
                                <Edit className="ml-1 h-4 w-4" />
                                تعديل
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicateTemplate(template)}
                              >
                                <Copy className="ml-1 h-4 w-4" />
                                نسخ
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={template.isSystem && !allowSystemTemplateEditing}
                                title={
                                  template.isSystem
                                    ? 'لا يمكن حذف قالب نظامي'
                                    : 'حذف القالب المحدد'
                                }
                                onClick={() =>
                                  !template.isSystem || allowSystemTemplateEditing
                                    ? setTemplatePendingDelete(template)
                                    : undefined
                                }
                              >
                                <Trash2 className="ml-1 h-4 w-4" />
                                حذف
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل صلاحيات المستخدم</DialogTitle>
            <DialogDescription>
              {selectedUser ? `تحديث صلاحيات المستخدم: ${selectedUser.name || selectedUser.email}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الدور الرئيسي</Label>
                <Select
                  value={userEditForm.role}
                  onValueChange={(value) =>
                    setUserEditForm((prev) => ({ ...prev, role: value as UserRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.values(UserRole) as UserRole[]).map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>قالب الدور</Label>
                <Select
                  value={userEditForm.roleTemplateId}
                  onValueChange={(value) => handleSelectTemplateForEditUser(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="بدون قالب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون قالب</SelectItem>
                    {activeTemplateOptions.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                        {template.nameAr || template.name} ({template.roleLabel || ROLE_LABELS[template.role]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">تطبيق صلاحيات القالب</p>
                    <p className="text-xs text-muted-foreground">
                      في حال التفعيل سيتم استبدال الصلاحيات اليدوية بالقالب المحدد مع إمكانية إضافة صلاحيات مخصصة.
                    </p>
                  </div>
                <Switch
                  checked={userEditForm.applyRoleTemplate}
                  onCheckedChange={(checked) => {
                    setUserEditForm((prev) => ({ ...prev, applyRoleTemplate: checked }))
                    if (checked && !userEditForm.preserveManualPermissions) {
                      setUserPermissions([])
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">الاحتفاظ بالصلاحيات اليدوية</p>
                    <p className="text-xs text-muted-foreground">
                      عند التفعيل سيتم إضافة الصلاحيات اليدوية الحالية فوق صلاحيات القالب المختار.
                    </p>
                  </div>
                  <Switch
                    disabled={!userEditForm.applyRoleTemplate}
                    checked={userEditForm.preserveManualPermissions}
                    onCheckedChange={(checked) =>
                      setUserEditForm((prev) => {
                        if (!checked && prev.applyRoleTemplate) {
                          setUserPermissions([])
                        }
                        return { ...prev, preserveManualPermissions: checked }
                      })
                    }
                  />
                </div>
              </div>
              {(selectedUser.roleTemplateNameAr || selectedUser.roleTemplateName) && (
                <Card className="sm:col-span-2">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">القالب الحالي</CardTitle>
                    <CardDescription>
                      {selectedUser.roleTemplateNameAr || selectedUser.roleTemplateName} (
                      {selectedUser.roleTemplateRole
                        ? selectedUser.roleTemplateRoleLabel || ROLE_LABELS[selectedUser.roleTemplateRole]
                        : 'غير محدد'})
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}

          {permissionGroups.map((group) => (
            <Card key={group.category} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {group.permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد صلاحيات معرفة لهذه الفئة حالياً.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((permission) => (
                      <label key={permission.id} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={userPermissions.includes(permission.name)}
                          onChange={(event) => toggleUserPermission(permission.name, event.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                          disabled={userEditForm.applyRoleTemplate && !userEditForm.preserveManualPermissions}
                        />
                        <span>{formatPermissionLabel(permission)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveUserPermissions} disabled={isSavingUser}>
              <Save className="ml-2 h-4 w-4" />
              {isSavingUser ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTemplateModalOpen} onOpenChange={setIsEditTemplateModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل قالب الدور</DialogTitle>
            <DialogDescription>تحديث بيانات القالب والصلاحيات المرتبطة به</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="templateName">اسم القالب</Label>
              <Input
                id="templateName"
                value={templateForm.name}
                onChange={(event) => setTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
                disabled={isSystemTemplateLocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateRole">الدور</Label>
              <Select
                value={templateForm.role}
                onValueChange={(value) => setTemplateForm((prev) => ({ ...prev, role: value as UserRole }))}
                disabled={isSystemTemplateLocked}
              >
                <SelectTrigger id="templateRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.SUPER_ADMIN}>{ROLE_LABELS[UserRole.SUPER_ADMIN]}</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>{ROLE_LABELS[UserRole.ADMIN]}</SelectItem>
                  <SelectItem value={UserRole.BRANCH_MANAGER}>{ROLE_LABELS[UserRole.BRANCH_MANAGER]}</SelectItem>
                  <SelectItem value={UserRole.STAFF}>{ROLE_LABELS[UserRole.STAFF]}</SelectItem>
                  <SelectItem value={UserRole.CUSTOMER}>{ROLE_LABELS[UserRole.CUSTOMER]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>حالة القالب</Label>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">القالب {templateForm.isActive ? 'مفعل' : 'غير مفعل'}</p>
                  <p className="text-xs text-muted-foreground">يمكن تعطيل القالب مؤقتاً دون حذفه.</p>
                </div>
                <Switch
                  checked={templateForm.isActive}
                  disabled={isSystemTemplateLocked}
                  onCheckedChange={(checked) =>
                    setTemplateForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>عدد الصلاحيات</Label>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                {formatNumber(templateForm.permissions.length)} صلاحية مختارة
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateDescription">الوصف</Label>
            <Textarea
              id="templateDescription"
              value={templateForm.description}
              onChange={(event) => setTemplateForm((prev) => ({ ...prev, description: event.target.value }))}
              disabled={isSystemTemplateLocked}
            />
          </div>

          {permissionGroups.map((group) => (
            <Card key={group.category} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {group.permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد صلاحيات معرفة لهذه الفئة حالياً.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((permission) => (
                      <label key={permission.id} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={templateForm.permissions.includes(permission.name)}
                          onChange={(event) => toggleTemplatePermission(permission.name, event.target.checked)}
                          disabled={isSystemTemplateLocked}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span>{formatPermissionLabel(permission)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <DialogFooter className="flex flex-wrap justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setIsEditTemplateModalOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={isSystemTemplateLocked || isSavingTemplate}
              >
                <Save className="ml-2 h-4 w-4" />
                {isSavingTemplate ? 'جاري الحفظ...' : 'حفظ القالب'}
              </Button>
            </div>
            {allowRoleTemplateManagement && selectedTemplate && !selectedTemplate.isSystem && (
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isSavingTemplate}
                onClick={() => {
                  setIsEditTemplateModalOpen(false)
                  setTemplatePendingDelete(selectedTemplate)
                }}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف القالب
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateTemplateModalOpen}
        onOpenChange={(open) => {
          setIsCreateTemplateModalOpen(open)
          if (!open) {
            setNewTemplateForm({
              name: '',
              description: '',
              role: UserRole.STAFF,
              permissions: [],
              isActive: true,
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء قالب دور جديد</DialogTitle>
            <DialogDescription>حدد الدور والصلاحيات الافتراضية للقالب الجديد</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newTemplateName">اسم القالب</Label>
              <Input
                id="newTemplateName"
                value={newTemplateForm.name}
                onChange={(event) => setNewTemplateForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTemplateRole">الدور</Label>
              <Select
                value={newTemplateForm.role}
                onValueChange={(value) => setNewTemplateForm((prev) => ({ ...prev, role: value as UserRole }))}
              >
                <SelectTrigger id="newTemplateRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.SUPER_ADMIN}>{ROLE_LABELS[UserRole.SUPER_ADMIN]}</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>{ROLE_LABELS[UserRole.ADMIN]}</SelectItem>
                  <SelectItem value={UserRole.BRANCH_MANAGER}>{ROLE_LABELS[UserRole.BRANCH_MANAGER]}</SelectItem>
                  <SelectItem value={UserRole.STAFF}>{ROLE_LABELS[UserRole.STAFF]}</SelectItem>
                  <SelectItem value={UserRole.CUSTOMER}>{ROLE_LABELS[UserRole.CUSTOMER]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>حالة القالب</Label>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">القالب {newTemplateForm.isActive ? 'مفعل' : 'غير مفعل'}</p>
                  <p className="text-xs text-muted-foreground">يمكن تعديل الحالة بعد الإنشاء.</p>
                </div>
                <Switch
                  checked={newTemplateForm.isActive}
                  onCheckedChange={(checked) => setNewTemplateForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>عدد الصلاحيات</Label>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                {formatNumber(newTemplateForm.permissions.length)} صلاحية محددة
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newTemplateDescription">الوصف</Label>
            <Textarea
              id="newTemplateDescription"
              value={newTemplateForm.description}
              onChange={(event) => setNewTemplateForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>

          {permissionGroups.map((group) => (
            <Card key={group.category} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {group.permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد صلاحيات معرفة لهذه الفئة حالياً.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((permission) => (
                      <label key={permission.id} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newTemplateForm.permissions.includes(permission.name)}
                          onChange={(event) => toggleNewTemplatePermission(permission.name, event.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span>{formatPermissionLabel(permission)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTemplateModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isCreatingTemplate}>
              <Save className="ml-2 h-4 w-4" />
              {isCreatingTemplate ? 'جاري الإنشاء...' : 'حفظ القالب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(templatePendingDelete)} onOpenChange={(open) => !open && setTemplatePendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف قالب الدور</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف القالب {templatePendingDelete?.name}؟ لن يتم حذف الصلاحيات الخاصة بالمستخدمين الحاليين
              لكن لن يكون القالب متاحاً للتعيين مستقبلاً.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplatePendingDelete(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} disabled={isSavingTemplate}>
              <Trash2 className="ml-2 h-4 w-4" />
              {isSavingTemplate ? 'جاري الحذف...' : 'حذف القالب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateUserModalOpen}
        onOpenChange={(open) => {
          setIsCreateUserModalOpen(open)
          if (!open) {
            resetCreateUserForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>قم بإضافة مستخدم جديد وتحديد دوره وصلاحياته المبدئية</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userName">الاسم</Label>
              <Input
                id="userName"
                value={createUserForm.name}
                onChange={(event) => setCreateUserForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">البريد الإلكتروني</Label>
              <Input
                id="userEmail"
                type="email"
                value={createUserForm.email}
                onChange={(event) => setCreateUserForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPhone">رقم الهاتف</Label>
              <Input
                id="userPhone"
                value={createUserForm.phone}
                onChange={(event) => setCreateUserForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">الدور الأساسي</Label>
              <Select
                value={createUserForm.role}
                onValueChange={(value) => setCreateUserForm((prev) => ({ ...prev, role: value as UserRole }))}
              >
                <SelectTrigger id="userRole">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.values(UserRole) as UserRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">كلمة المرور</Label>
              <Input
                id="userPassword"
                type="password"
                value={createUserForm.password}
                onChange={(event) => setCreateUserForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userConfirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="userConfirmPassword"
                type="password"
                value={createUserForm.confirmPassword}
                onChange={(event) => setCreateUserForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>قالب الدور</Label>
              <Select
                value={createUserForm.roleTemplateId}
                onValueChange={(value) => handleSelectTemplateForNewUser(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="بدون قالب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون قالب</SelectItem>
                  {activeTemplateOptions.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.nameAr || template.name} ({template.roleLabel || ROLE_LABELS[template.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>عدد الصلاحيات اليدوية</Label>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                {formatNumber(createUserForm.permissions.length)} صلاحية إضافية
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">تطبيق صلاحيات القالب</p>
                <p className="text-xs text-muted-foreground">
                  عند التفعيل سيتم تعيين الصلاحيات الأساسية من القالب المختار.
                </p>
              </div>
              <Switch
                checked={createUserForm.applyRoleTemplate}
                onCheckedChange={(checked) =>
                  setCreateUserForm((prev) => ({
                    ...prev,
                    applyRoleTemplate: checked,
                    permissions: checked
                      ? prev.preserveManualPermissions
                        ? prev.permissions
                        : []
                      : prev.permissions,
                  }))
                }
              />
            </div>
            <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">الاحتفاظ بالصلاحيات اليدوية</p>
                <p className="text-xs text-muted-foreground">
                  إذا كان القالب مفعلاً يمكنك إضافة صلاحيات إضافية لهذا المستخدم.
                </p>
              </div>
              <Switch
                disabled={!createUserForm.applyRoleTemplate}
                checked={createUserForm.preserveManualPermissions}
                onCheckedChange={(checked) =>
                  setCreateUserForm((prev) => ({
                    ...prev,
                    preserveManualPermissions: checked,
                    permissions:
                      !checked && prev.applyRoleTemplate ? [] : prev.permissions,
                  }))
                }
              />
            </div>
          </div>

          {permissionGroups.map((group) => (
            <Card key={group.category} className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {group.permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد صلاحيات معرفة لهذه الفئة حالياً.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.permissions.map((permission) => (
                      <label key={permission.id} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={createUserForm.permissions.includes(permission.name)}
                          onChange={(event) => toggleCreateUserPermission(permission.name, event.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                          disabled={
                            createUserForm.applyRoleTemplate && !createUserForm.preserveManualPermissions
                          }
                        />
                        <span>{formatPermissionLabel(permission)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreatingUser}>
              <Save className="ml-2 h-4 w-4" />
              {isCreatingUser ? 'جاري الإنشاء...' : 'إضافة المستخدم'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
  const toggleCreateUserPermission = (permission: string, enabled: boolean) => {
    setCreateUserForm((prev) => {
      const permissions = enabled
        ? prev.permissions.includes(permission)
          ? prev.permissions
          : [...prev.permissions, permission]
        : prev.permissions.filter((value) => value !== permission)

      return { ...prev, permissions }
    })
  }

