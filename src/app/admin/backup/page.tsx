'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { LoadingIndicator, ErrorState, EmptyState } from '@/components/ui/LoadingIndicator'
import { Database, Download, Upload, Clock, RefreshCw, Play, CalendarClock, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface BackupRecord {
  id: string
  createdAt: string
  type: string | null
  action: string
  status: string
  sizeBytes: number
  triggeredBy?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
  metadata?: unknown
}

interface BackupStats {
  totalBackups: number
  totalSizeBytes: number
  lastBackupAt: string | null
  lastBackupStatus?: string | null
  lastBackupError?: string | null
  autoBackupEnabled: boolean
  autoBackupSchedule: string
  autoBackupRetentionDays: number
  nextAutoBackupAt: string | null
}

interface BackupStorage {
  usedBytes: number
  capacityBytes: number
}

interface BackupResponse {
  stats: BackupStats
  storage: BackupStorage
  backups: BackupRecord[]
}

const RANGE_OPTIONS = [
  { label: 'آخر 24 ساعة', value: '24h' },
  { label: 'آخر 7 أيام', value: '7d' },
  { label: 'آخر 30 يوماً', value: '30d' },
  { label: 'آخر 90 يوماً', value: '90d' },
]

const AUTO_SCHEDULE_OPTIONS = [
  { label: '02:00 فجراً', value: '02:00' },
  { label: '04:00 فجراً', value: '04:00' },
  { label: '06:00 صباحاً', value: '06:00' },
  { label: '12:00 ظهراً', value: '12:00' },
  { label: '18:00 مساءً', value: '18:00' },
  { label: '23:00 مساءً', value: '23:00' },
]

const RETENTION_OPTIONS = [
  { label: '7 أيام', value: '7' },
  { label: '14 يوماً', value: '14' },
  { label: '30 يوماً', value: '30' },
  { label: '60 يوماً', value: '60' },
  { label: '90 يوماً', value: '90' },
]

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 بايت'
  }

  const units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب']
  let index = 0
  let value = bytes

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }

  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ar })
  } catch (error) {
    return new Date(value).toLocaleString('ar-EG')
  }
}

function resolveStatusBadge(status?: string | null) {
  if (!status) return null
  const normalized = status.toUpperCase()
  if (normalized === 'FAILED') {
    return { label: 'فشل', variant: 'destructive' as const, className: undefined }
  }
  if (normalized === 'SUCCESS') {
    return { label: 'ناجح', variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600' }
  }
  return { label: normalized, variant: 'secondary' as const, className: undefined }
}

function BackupDashboard() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState<BackupResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updatingAuto, setUpdatingAuto] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/system/backups?range=${range}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('فشل تحميل بيانات النسخ الاحتياطي')
      }
      const payload = (await response.json()) as BackupResponse
      setData(payload)
    } catch (err) {
      console.error(err)
      setError('تعذر تحميل معلومات النسخ الاحتياطي. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const handleCreateBackup = useCallback(async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/admin/system/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Triggered from admin dashboard' }),
      })

      if (!response.ok) {
        throw new Error('فشل تسجيل النسخة الاحتياطية')
      }

      await fetchData()
    } catch (err) {
      console.error(err)
      setError('تعذر إنشاء سجل النسخة الاحتياطية. يرجى مراجعة السجلات.')
    } finally {
      setCreating(false)
    }
  }, [fetchData])

  const updateAutoSettings = useCallback(
    async (payload: Partial<{ enabled: boolean; schedule: string; retentionDays: number }>) => {
      setUpdatingAuto(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/system/backups', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('فشل تحديث الإعدادات')
        }

        await fetchData()
      } catch (err) {
        console.error(err)
        setError('تعذر تحديث إعدادات النسخ التلقائي. يرجى المحاولة مرة أخرى.')
      } finally {
        setUpdatingAuto(false)
      }
    },
    [fetchData]
  )

  const handleToggleAutoBackup = useCallback(
    (checked: boolean) => {
      updateAutoSettings({ enabled: checked })
    },
    [updateAutoSettings]
  )

  const handleScheduleChange = useCallback(
    (value: string) => {
      updateAutoSettings({ schedule: value })
    },
    [updateAutoSettings]
  )

  const handleRetentionChange = useCallback(
    (value: string) => {
      const numeric = Number(value)
      updateAutoSettings({ retentionDays: Number.isNaN(numeric) ? undefined : numeric })
    },
    [updateAutoSettings]
  )

  const stats = data?.stats
  const storage = data?.storage
  const backups = data?.backups ?? []

  const storageUsage = useMemo(() => {
    if (!storage) {
      return { percent: 0, usedLabel: '0', capacityLabel: '0' }
    }
    const percent = storage.capacityBytes > 0 ? Math.min(100, (storage.usedBytes / storage.capacityBytes) * 100) : 0
    return {
      percent,
      usedLabel: formatBytes(storage.usedBytes),
      capacityLabel: formatBytes(storage.capacityBytes),
    }
  }, [storage])

  const scheduleOptions = useMemo(() => {
    if (!stats?.autoBackupSchedule) {
      return AUTO_SCHEDULE_OPTIONS
    }
    if (AUTO_SCHEDULE_OPTIONS.some((option) => option.value === stats.autoBackupSchedule)) {
      return AUTO_SCHEDULE_OPTIONS
    }
    return [...AUTO_SCHEDULE_OPTIONS, { label: stats.autoBackupSchedule, value: stats.autoBackupSchedule }]
  }, [stats?.autoBackupSchedule])

  const retentionOptions = useMemo(() => {
    if (!stats?.autoBackupRetentionDays) {
      return RETENTION_OPTIONS
    }
    if (RETENTION_OPTIONS.some((option) => Number(option.value) === stats.autoBackupRetentionDays)) {
      return RETENTION_OPTIONS
    }
    return [...RETENTION_OPTIONS, { label: `${stats.autoBackupRetentionDays} يوم`, value: String(stats.autoBackupRetentionDays) }]
  }, [stats?.autoBackupRetentionDays])

  const nextRunLabel = useMemo(() => {
    if (!stats?.nextAutoBackupAt) return 'غير مجدول'
    return formatDate(stats.nextAutoBackupAt)
  }, [stats?.nextAutoBackupAt])

  const lastStatusBadge = useMemo(() => resolveStatusBadge(stats?.lastBackupStatus ?? null), [stats?.lastBackupStatus])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator size="lg" text="جاري تحميل بيانات النسخ الاحتياطي" />
      </div>
    )
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">النسخ الاحتياطي</h1>
          <p className="text-muted-foreground">متابعة النسخ الاحتياطية وإدارتها لضمان سلامة البيانات</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={range} onValueChange={(value) => setRange(value)}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="النطاق الزمني" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button onClick={handleCreateBackup} disabled={creating}>
              <Play className={`ml-2 h-4 w-4 ${creating ? 'animate-spin' : ''}`} />
              إنشاء نسخة يدوية
            </Button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">آخر نسخة احتياطية</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-2xl font-bold">{stats.lastBackupAt ? formatDate(stats.lastBackupAt) : 'لا توجد نسخ حديثة'}</div>
                  {lastStatusBadge && (
                    <Badge variant={lastStatusBadge.variant} className={lastStatusBadge.className}>
                      {lastStatusBadge.label}
                    </Badge>
                  )}
                </div>
                <CardDescription>حالة النظام</CardDescription>
                {stats.lastBackupStatus?.toUpperCase() === 'FAILED' && stats.lastBackupError && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{stats.lastBackupError}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عدد النسخ</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Intl.NumberFormat('ar-EG').format(stats.totalBackups)}</div>
                <CardDescription>خلال الفترة المحددة</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الحجم</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(stats.totalSizeBytes)}</div>
                <CardDescription>البيانات المؤرشفة في الفترة المختارة</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">النسخ التلقائي</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.autoBackupEnabled ? 'مفعل' : 'متوقف'}</div>
                <CardDescription>
                  {stats.autoBackupEnabled
                    ? `التالي: ${nextRunLabel}`
                    : 'النسخ التلقائي غير مفعل'}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات النسخ التلقائي</CardTitle>
              <CardDescription>تخصيص الجدول الزمني ومدة الاحتفاظ بالنسخ الاحتياطية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    id="auto-backup-toggle"
                    checked={stats.autoBackupEnabled}
                    onCheckedChange={handleToggleAutoBackup}
                    disabled={updatingAuto}
                  />
                  <Label htmlFor="auto-backup-toggle" className="text-base font-medium">
                    تشغيل النسخ التلقائي اليومي
                  </Label>
                  {updatingAuto && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <Badge variant={stats.autoBackupEnabled ? 'default' : 'secondary'} className={stats.autoBackupEnabled ? 'bg-green-500 hover:bg-green-600' : undefined}>
                  {stats.autoBackupEnabled ? 'مفعل' : 'متوقف'}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="auto-backup-time">موعد التنفيذ</Label>
                  <Select
                    value={stats.autoBackupSchedule}
                    onValueChange={handleScheduleChange}
                    disabled={!stats.autoBackupEnabled || updatingAuto}
                  >
                    <SelectTrigger id="auto-backup-time">
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-backup-retention">مدة الاحتفاظ</Label>
                  <Select
                    value={String(stats.autoBackupRetentionDays)}
                    onValueChange={handleRetentionChange}
                    disabled={!stats.autoBackupEnabled || updatingAuto}
                  >
                    <SelectTrigger id="auto-backup-retention">
                      <SelectValue placeholder="اختر المدة" />
                    </SelectTrigger>
                    <SelectContent>
                      {retentionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>النسخة القادمة</Label>
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span>{stats.autoBackupEnabled ? nextRunLabel : 'لن يتم إنشاء نسخة تلقائية'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                سيتم الاحتفاظ بالنسخ الاحتياطية لمدة {stats.autoBackupRetentionDays} يوم قبل حذفها تلقائياً للحفاظ على المساحة المتاحة.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {storage && (
        <Card>
          <CardHeader>
            <CardTitle>استخدام التخزين</CardTitle>
            <CardDescription>متابعة المساحة المستخدمة للنسخ الاحتياطية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>المساحة المستخدمة</span>
              <span>
                {storageUsage.usedLabel} من {storageUsage.capacityLabel}
              </span>
            </div>
            <Progress value={storageUsage.percent} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>سجل النسخ الاحتياطي</CardTitle>
          <CardDescription>أحدث السجلات المسجلة للنسخ الاحتياطية</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingIndicator text="جاري تحديث السجل..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : backups.length === 0 ? (
            <EmptyState title="لا توجد سجلات" message="لم يتم العثور على نسخ احتياطية ضمن النطاق المحدد." />
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{backup.action || 'عملية نسخة احتياطية'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(backup.createdAt).toLocaleString('ar-EG')} • {backup.triggeredBy?.name || backup.triggeredBy?.email || 'النظام'}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
                    <Badge
                      variant={backup.status === 'SUCCESS' ? 'default' : backup.status === 'FAILED' ? 'destructive' : 'secondary'}
                      className={backup.status === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600' : undefined}
                    >
                      {backup.status === 'SUCCESS' ? 'ناجح' : backup.status === 'FAILED' ? 'فشل' : backup.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatBytes(backup.sizeBytes)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function BackupPage() {
  return (
    <AdminRoute>
      <BackupDashboard />
    </AdminRoute>
  )
}
