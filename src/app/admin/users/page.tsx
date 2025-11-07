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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingIndicator, ErrorState, EmptyState } from '@/components/ui/LoadingIndicator'
import { Users, UserCheck, UserX, Shield, RefreshCw, Search } from 'lucide-react'
import { UserRole } from '@prisma/client'
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

  const metrics = useMemo(() => data?.metrics, [data])

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
