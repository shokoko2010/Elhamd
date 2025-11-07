'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingIndicator, ErrorState, EmptyState } from '@/components/ui/LoadingIndicator'
import { Shield, Users, Settings, Key, RefreshCw } from 'lucide-react'
import { UserRole, PermissionCategory } from '@prisma/client'

interface RoleTemplate {
  id: string
  name: string
  description?: string | null
  role: UserRole
  permissions: string[]
  isActive: boolean
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface PermissionItem {
  id: string
  name: string
  description?: string | null
  category: PermissionCategory
}

interface RoleTemplateResponse {
  templates: RoleTemplate[]
}

interface PermissionsResponse {
  permissions: PermissionItem[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ar-EG').format(value)
}

function RolesDashboard() {
  const [templates, setTemplates] = useState<RoleTemplate[]>([])
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [templatesRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/role-templates', { cache: 'no-store' }),
        fetch('/api/admin/permissions?category=all', { cache: 'no-store' }),
      ])

      if (!templatesRes.ok) {
        throw new Error('فشل تحميل قوالب الأدوار')
      }

      if (!permissionsRes.ok) {
        throw new Error('فشل تحميل الصلاحيات المتاحة')
      }

      const templatesData = (await templatesRes.json()) as RoleTemplateResponse
      const permissionsData = (await permissionsRes.json()) as PermissionsResponse

      setTemplates(templatesData.templates ?? [])
      setPermissions(permissionsData.permissions ?? [])
    } catch (err) {
      console.error(err)
      setError('تعذر تحميل بيانات الأدوار والصلاحيات. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const metrics = useMemo(() => {
    const totalRoles = templates.length
    const activeRoles = templates.filter((template) => template.isActive).length
    const systemRoles = templates.filter((template) => template.isSystem).length

    return {
      totalRoles,
      activeRoles,
      systemRoles,
      totalPermissions: permissions.length,
    }
  }, [templates, permissions])

  const permissionsByCategory = useMemo(() => {
    return permissions.reduce<Record<PermissionCategory, PermissionItem[]>>((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category]!.push(permission)
      return acc
    }, {} as Record<PermissionCategory, PermissionItem[]>)
  }, [permissions])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator size="lg" text="جاري تحميل الأدوار" />
      </div>
    )
  }

  if (error && templates.length === 0) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأدوار والصلاحيات</h1>
          <p className="text-muted-foreground">تعريف الأدوار المؤسسية وتوزيع الصلاحيات على الفرق المختلفة</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأدوار</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalRoles)}</div>
            <CardDescription>جميع الأدوار المعرفة في النظام</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأدوار النشطة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.activeRoles)}</div>
            <CardDescription>الأدوار المتاحة للتعيين حالياً</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أدوار النظام</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.systemRoles)}</div>
            <CardDescription>الأدوار الأساسية المضمنة في النظام</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الصلاحيات</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalPermissions)}</div>
            <CardDescription>الصلاحيات المتاحة للتوزيع على الأدوار</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قوالب الأدوار</CardTitle>
          <CardDescription>جميع الأدوار مع حالة التنشيط والصلاحيات المرتبطة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <LoadingIndicator text="جاري تحميل قوالب الأدوار..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : templates.length === 0 ? (
            <EmptyState title="لا توجد أدوار" message="لم يتم تعريف أي أدوار بعد." />
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.role}</Badge>
                        <Badge variant={template.isActive ? 'default' : 'secondary'} className={template.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {template.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                        {template.isSystem && <Badge variant="secondary">دور نظامي</Badge>}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        آخر تحديث: {new Date(template.updatedAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <div className="w-full md:w-1/2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">الصلاحيات الممنوحة ({template.permissions.length})</p>
                      <div className="flex flex-wrap gap-2 justify-start">
                        {template.permissions.slice(0, 8).map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))}
                        {template.permissions.length > 8 && (
                          <Badge variant="secondary">+{template.permissions.length - 8}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مجموعات الصلاحيات</CardTitle>
          <CardDescription>تجميع الصلاحيات حسب فئة الإدارة للتخطيط الاستراتيجي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissions.length === 0 ? (
            loading ? (
              <LoadingIndicator text="جاري تحميل الصلاحيات..." />
            ) : (
              <EmptyState title="لا توجد صلاحيات" message="لم يتم تسجيل أي صلاحيات في النظام." />
            )
          ) : (
            Object.entries(permissionsByCategory).map(([category, items]) => (
              <div key={category} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <Badge variant="secondary">{items.length} صلاحية</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((permission) => (
                    <Badge key={permission.id} variant="outline">
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RolesPage() {
  return (
    <AdminRoute>
      <RolesDashboard />
    </AdminRoute>
  )
}
