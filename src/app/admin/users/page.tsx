'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingIndicator, ErrorState, EmptyState } from '@/components/ui/LoadingIndicator'
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Search,
  Settings,
  Check,
  Ban,
} from 'lucide-react'
import { PermissionCategory, UserRole } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface ApiPermission {
  permission: {
    id: string
    name: string
    description?: string | null
  }
}

interface ApiUser {
  id: string
  name?: string | null
  email: string
  phone?: string | null
  role: UserRole
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
  permissions: ApiPermission[]
  totalBookings?: number
  totalSpent?: number
  roleTemplateId?: string | null
  roleTemplate?: {
    id: string
    name: string
    role: UserRole
    isSystem: boolean
    isActive: boolean
  } | null
}

interface PermissionRecord {
  id: string
  name: string
  description?: string | null
  category: PermissionCategory
}

interface RoleTemplate {
  id: string
  name: string
  description?: string | null
  role: UserRole
  isSystem: boolean
  isActive: boolean
}

interface Metrics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  adminUsers: number
  branchManagers: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UsersResponse {
  users: ApiUser[]
  pagination: Pagination
  metrics: Metrics
}

const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: 'جميع الأدوار', value: 'all' },
  { label: 'العملاء', value: UserRole.CUSTOMER },
  { label: 'موظفو الفروع', value: UserRole.BRANCH_MANAGER },
  { label: 'الموظفون', value: UserRole.STAFF },
  { label: 'المسؤولون', value: UserRole.ADMIN },
  { label: 'المسؤول الأعلى', value: UserRole.SUPER_ADMIN },
]

const STATUS_OPTIONS = [
  { label: 'جميع الحالات', value: 'all' },
  { label: 'نشط', value: 'true' },
  { label: 'غير نشط', value: 'false' },
]

const NO_TEMPLATE_VALUE = 'none'

function formatNumber(value: number) {
  return new Intl.NumberFormat('ar-EG').format(value)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ar })
  } catch (error) {
    return new Date(value).toLocaleDateString('ar-EG')
  }
}

function UsersDashboard() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([])
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionRecord[]>([])
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [userDialogLoading, setUserDialogLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [permissionSearch, setPermissionSearch] = useState('')
  const [editState, setEditState] = useState({
    role: UserRole.STAFF as UserRole,
    roleTemplateId: null as string | null,
    applyRoleTemplate: false,
    preserveManualPermissions: false,
    permissions: [] as string[],
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        scope: 'all',
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (role && role !== 'all') {
        params.set('role', role)
      }

      if (status && status !== 'all') {
        params.set('isActive', status)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('فشل تحميل المستخدمين')
      }

      const payload = (await response.json()) as UsersResponse
      setData(payload)
    } catch (err) {
      console.error(err)
      setError('تعذر تحميل بيانات المستخدمين. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, limit, search, role, status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const hydrateCatalogs = useCallback(async () => {
    if (roleTemplates.length && permissionsCatalog.length && !catalogError) return
    try {
      const [templatesRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/role-templates', { cache: 'no-store' }),
        fetch('/api/admin/permissions?category=all', { cache: 'no-store' }),
      ])

      if (!templatesRes.ok) {
        throw new Error('فشل تحميل قوالب الأدوار')
      }
      if (!permissionsRes.ok) {
        throw new Error('فشل تحميل الصلاحيات')
      }

      const templatesPayload = await templatesRes.json()
      const permissionsPayload = await permissionsRes.json()

      setRoleTemplates(Array.isArray(templatesPayload.templates) ? templatesPayload.templates : [])
      setPermissionsCatalog(Array.isArray(permissionsPayload.permissions) ? permissionsPayload.permissions : [])
      setCatalogError(null)
    } catch (err) {
      console.error(err)
      setCatalogError('تعذر تحميل بيانات القوالب والصلاحيات')
    }
  }, [catalogError, permissionsCatalog.length, roleTemplates.length])

  const metrics = useMemo(() => data?.metrics, [data])
  const permissionGroups = useMemo(() => {
    const groups = new Map<PermissionCategory, PermissionRecord[]>()
    permissionsCatalog.forEach((permission) => {
      const existing = groups.get(permission.category) ?? []
      groups.set(permission.category, [...existing, permission])
    })

    const query = permissionSearch.trim().toLowerCase()

    return (Object.values(PermissionCategory) as PermissionCategory[]).map((category) => {
      const items = (groups.get(category) ?? []).filter((permission) => {
        if (!query) return true
        return (
          permission.name.toLowerCase().includes(query) ||
          (permission.description ?? '').toLowerCase().includes(query)
        )
      })

      return {
        category,
        permissions: items,
      }
    })
  }, [permissionSearch, permissionsCatalog])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setPage(1)
      fetchUsers()
    },
    [fetchUsers],
  )

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchUsers()
  }, [fetchUsers])

  const pagination = data?.pagination

  const openUserDialog = useCallback(
    async (userId: string) => {
      setUserDialogOpen(true)
      setUserDialogLoading(true)
      setSaveError(null)
      setSaveSuccess(null)

      try {
        await hydrateCatalogs()

        const response = await fetch(`/api/admin/users/${userId}`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('تعذر جلب بيانات المستخدم')
        }

        const payload = await response.json()
        const user: ApiUser | null = payload?.user ?? null

        if (user) {
          setSelectedUser(user)
          const grantedPermissions = (user.permissions ?? [])
            .map((edge) => edge.permission?.name)
            .filter((name): name is string => Boolean(name))

          setEditState({
            role: user.role,
            roleTemplateId: user.roleTemplateId ?? user.roleTemplate?.id ?? null,
            applyRoleTemplate: false,
            preserveManualPermissions: false,
            permissions: grantedPermissions,
          })
        }
      } catch (err) {
        console.error(err)
        setSaveError('تعذر تحميل بيانات المستخدم المحدد')
      } finally {
        setUserDialogLoading(false)
      }
    },
    [hydrateCatalogs],
  )

  const closeUserDialog = useCallback(() => {
    setUserDialogOpen(false)
    setSelectedUser(null)
    setEditState({
      role: UserRole.STAFF,
      roleTemplateId: null,
      applyRoleTemplate: false,
      preserveManualPermissions: false,
      permissions: [],
    })
    setSaveError(null)
    setSaveSuccess(null)
    setPermissionSearch('')
  }, [])

  const togglePermission = useCallback((name: string) => {
    setEditState((prev) => {
      const exists = prev.permissions.includes(name)
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((permission) => permission !== name)
          : [...prev.permissions, name],
      }
    })
  }, [])

  const handleSaveUser = useCallback(async () => {
    if (!selectedUser) return
    setSaveLoading(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editState.role,
          roleTemplateId: editState.roleTemplateId || null,
          applyRoleTemplate: editState.applyRoleTemplate,
          preserveManualPermissions: editState.preserveManualPermissions,
          permissions: editState.permissions,
          additionalPermissions: editState.permissions,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'تعذر حفظ التغييرات')
      }

      const payload = await response.json().catch(() => ({ user: null }))
      if (payload?.user) {
        setSelectedUser(payload.user)
      }

      await fetchUsers()
      setSaveSuccess('تم تحديث بيانات المستخدم بنجاح')
    } catch (err) {
      console.error(err)
      setSaveError(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaveLoading(false)
    }
  }, [editState, fetchUsers, selectedUser])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator size="lg" text="جاري تحميل المستخدمين" />
      </div>
    )
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={fetchUsers} />
  }

  const hasUsers = (data?.users.length || 0) > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">متابعة نشاط المستخدمين وأدوارهم داخل النظام</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalUsers)}</div>
              <CardDescription>كل الحسابات المسجلة في النظام</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.activeUsers)}</div>
              <CardDescription>المستخدمون الذين يمكنهم تسجيل الدخول</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمون غير النشطين</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.inactiveUsers)}</div>
              <CardDescription>الحسابات المعلقة أو المحظورة</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">فريق الإدارة</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.adminUsers)}</div>
              <CardDescription>إجمالي المسؤولين ومديري الفروع</CardDescription>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
          <CardDescription>ابحث عن المستخدمين وحدد الأدوار والحالات لعرض أدق</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">البحث</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="search"
                  placeholder="ابحث بالاسم أو البريد الإلكتروني"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button type="submit" variant="secondary">
                  <Search className="ml-2 h-4 w-4" />
                  بحث
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={role} onValueChange={(value) => { setRole(value); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>عرض تفصيلي لأحدث المستخدمين في النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <LoadingIndicator text="جاري تحديث القائمة..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchUsers} />
          ) : !hasUsers ? (
            <EmptyState title="لا توجد نتائج" message="لم يتم العثور على مستخدمين بالمعايير الحالية." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>آخر تسجيل دخول</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead className="text-left">الصلاحيات</TableHead>
                      <TableHead className="text-left">إدارة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.name || '—'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ROLE_OPTIONS.find((option) => option.value === user.role)?.label ?? user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-wrap gap-1 justify-end md:justify-start">
                            {user.permissions.length === 0 ? (
                              <Badge variant="outline">بدون صلاحيات إضافية</Badge>
                            ) : (
                              user.permissions.slice(0, 4).map((permission) => (
                                <Badge key={permission.permission.id} variant="outline">
                                  {permission.permission.name}
                                </Badge>
                              ))
                            )}
                            {user.permissions.length > 4 && (
                              <Badge variant="secondary">+{user.permissions.length - 4}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserDialog(user.id)}
                            className="gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            إدارة المستخدم
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && (
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-muted-foreground">
                    عرض {formatNumber((page - 1) * limit + 1)} - {formatNumber(Math.min(page * limit, pagination.total))} من {formatNumber(pagination.total)} مستخدم
                  </p>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      السابق
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      الصفحة {page} من {formatNumber(pagination.totalPages)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={userDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeUserDialog()
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>إدارة المستخدم</DialogTitle>
            <DialogDescription>تعديل الدور، قالب الدور، والصلاحيات للمستخدم المحدد.</DialogDescription>
          </DialogHeader>

          {saveError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{saveError}</div>
          )}
          {saveSuccess && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">{saveSuccess}</div>
          )}
          {catalogError && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">{catalogError}</div>
          )}

          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{selectedUser?.name || '—'}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.email || '—'}</p>
                  {selectedUser?.phone && (
                    <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedUser?.role ?? '—'}</Badge>
                  <Badge variant={selectedUser?.isActive ? 'default' : 'secondary'}>
                    {selectedUser?.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                  {selectedUser?.roleTemplate && (
                    <Badge variant="outline">قالب: {selectedUser.roleTemplate.name}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={editState.role}
                  onValueChange={(value) => setEditState((prev) => ({ ...prev, role: value as UserRole }))}
                  disabled={userDialogLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>قالب الدور</Label>
                  <Select
                    value={editState.roleTemplateId ?? NO_TEMPLATE_VALUE}
                    onValueChange={(value) =>
                      setEditState((prev) => ({
                        ...prev,
                        roleTemplateId: value === NO_TEMPLATE_VALUE ? null : value,
                      }))
                    }
                    disabled={userDialogLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر قالب الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TEMPLATE_VALUE}>بدون قالب</SelectItem>
                      {roleTemplates
                        .filter((template) => template.isActive || selectedUser?.role === UserRole.SUPER_ADMIN)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    id="apply-template"
                    checked={editState.applyRoleTemplate}
                    onCheckedChange={(checked) =>
                      setEditState((prev) => ({ ...prev, applyRoleTemplate: Boolean(checked) }))
                    }
                    disabled={userDialogLoading || !editState.roleTemplateId}
                  />
                  <Label htmlFor="apply-template" className="text-xs">
                    تطبيق صلاحيات القالب مباشرة مع الحفظ
                  </Label>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    id="preserve-permissions"
                    checked={editState.preserveManualPermissions}
                    onCheckedChange={(checked) =>
                      setEditState((prev) => ({ ...prev, preserveManualPermissions: Boolean(checked) }))
                    }
                    disabled={userDialogLoading}
                  />
                  <Label htmlFor="preserve-permissions" className="text-xs">
                    الاحتفاظ بالصلاحيات اليدوية الحالية
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">الصلاحيات</h3>
                  <p className="text-sm text-muted-foreground">امنح أو احذف صلاحيات محددة لهذا المستخدم.</p>
                </div>
                <Input
                  placeholder="ابحث عن صلاحية..."
                  value={permissionSearch}
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  className="md:w-72"
                  disabled={userDialogLoading}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {permissionGroups.map((group) => (
                  <div key={group.category} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold">{group.category}</p>
                      <Badge variant="secondary">{group.permissions.length}</Badge>
                    </div>
                    {group.permissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">لا توجد صلاحيات مطابقة.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {group.permissions.map((permission) => {
                          const checked = editState.permissions.includes(permission.name)
                          return (
                            <label
                              key={permission.id}
                              className="flex items-start gap-2 rounded-md border px-2 py-2 text-sm hover:bg-muted"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => togglePermission(permission.name)}
                                disabled={userDialogLoading}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{permission.name}</span>
                                  {checked ? (
                                    <Badge variant="outline" className="text-green-600">
                                      <Check className="ml-1 h-3 w-3" /> مفعلة
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      <Ban className="ml-1 h-3 w-3" /> غير مفعلة
                                    </Badge>
                                  )}
                                </div>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeUserDialog} disabled={saveLoading}>
              إلغاء
            </Button>
            <Button onClick={handleSaveUser} disabled={saveLoading || userDialogLoading}>
              {saveLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsersPage() {
  return (
    <AdminRoute>
      <UsersDashboard />
    </AdminRoute>
  )
}
