'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { LoadingIndicator, ErrorState, EmptyState } from '@/components/ui/LoadingIndicator'
import { AlertOctagon, AlertTriangle, FileText, Info, RefreshCw, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { LogSeverity } from '@prisma/client'

interface LogActor {
  id: string
  name?: string | null
  email?: string | null
}

interface LogRecord {
  id: string
  createdAt: string
  severity: LogSeverity
  source: 'security' | 'activity'
  message: string
  actor?: LogActor | null
  ipAddress?: string | null
  metadata?: unknown
}

interface LogStats {
  total: number
  errors: number
  warnings: number
  critical: number
  info: number
  lastEventAt: string | null
}

type SeverityBreakdown = Record<LogSeverity, number>

interface LogsResponse {
  stats: LogStats
  severityBreakdown: SeverityBreakdown
  logs: LogRecord[]
}

type SeverityFilter = 'all' | LogSeverity

type RangeOption = '24h' | '7d' | '30d' | '90d'

const RANGE_OPTIONS: { label: string; value: RangeOption }[] = [
  { label: 'آخر 24 ساعة', value: '24h' },
  { label: 'آخر 7 أيام', value: '7d' },
  { label: 'آخر 30 يوماً', value: '30d' },
  { label: 'آخر 90 يوماً', value: '90d' }
]

const SEVERITY_OPTIONS: { label: string; value: SeverityFilter }[] = [
  { label: 'جميع المستويات', value: 'all' },
  { label: 'حرج', value: 'CRITICAL' },
  { label: 'أخطاء', value: 'ERROR' },
  { label: 'تحذيرات', value: 'WARNING' },
  { label: 'معلومات', value: 'INFO' }
]

const severityLabels: Record<LogSeverity, string> = {
  CRITICAL: 'حرج',
  ERROR: 'خطأ',
  WARNING: 'تحذير',
  INFO: 'معلومة'
}

const severityColors: Record<LogSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  ERROR: 'bg-rose-100 text-rose-700',
  WARNING: 'bg-amber-100 text-amber-700',
  INFO: 'bg-blue-100 text-blue-700'
}

const sourceLabels: Record<LogRecord['source'], string> = {
  security: 'أمان',
  activity: 'نشاط'
}

function formatTimestamp(value?: string | null) {
  if (!value) return '—'
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ar })
  } catch (error) {
    console.error('Failed to format timestamp', error)
    return new Date(value).toLocaleString('ar-EG')
  }
}

function LogsDashboard() {
  const [range, setRange] = useState<RangeOption>('24h')
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [data, setData] = useState<LogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const response = await fetch(`/api/admin/system/logs?range=${range}&limit=200`, {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('Failed to load system logs')
        }

        const payload = (await response.json()) as LogsResponse
        setData(payload)
      } catch (err) {
        console.error(err)
        setError('تعذر تحميل سجلات النظام. يرجى المحاولة لاحقاً.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [range]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const severityCounts = useMemo<SeverityBreakdown>(() => {
    const fallback: SeverityBreakdown = {
      CRITICAL: 0,
      ERROR: 0,
      WARNING: 0,
      INFO: 0
    }
    if (!data?.severityBreakdown) {
      return fallback
    }
    return {
      ...fallback,
      ...data.severityBreakdown
    }
  }, [data])

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return []
    if (severity === 'all') return data.logs
    return data.logs.filter((log) => log.severity === severity)
  }, [data, severity])

  const stats = data?.stats
  const lastEventLabel = formatTimestamp(stats?.lastEventAt)

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingIndicator size="lg" text="جاري تحميل سجلات النظام" />
      </div>
    )
  }

  if (!data && error) {
    return (
      <ErrorState
        title="تعذر تحميل سجلات النظام"
        message={error}
        onRetry={() => fetchData()}
        className="py-24"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">سجلات النظام</h1>
          <p className="text-muted-foreground">
            مراجعة الأنشطة والأحداث الأمنية خلال الفترة المحددة
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={range} onValueChange={(value) => setRange(value as RangeOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="نطاق الوقت" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={(value) => setSeverity(value as SeverityFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="مستوى الخطورة" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => fetchData({ silent: true })}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {error && data && (
        <ErrorState
          title="حدثت مشكلة أثناء تحديث السجلات"
          message={error}
          onRetry={() => fetchData()}
          className="py-6"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.total.toLocaleString('ar-EG') : '0'}</div>
            <p className="text-xs text-muted-foreground">آخر حدث: {lastEventLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">السجلات الحرجة</CardTitle>
            <AlertOctagon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityCounts.CRITICAL.toLocaleString('ar-EG')}</div>
            <p className="text-xs text-muted-foreground">يستلزم التدخل الفوري</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأخطاء والتحذيرات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(severityCounts.ERROR + severityCounts.WARNING).toLocaleString('ar-EG')}
            </div>
            <p className="text-xs text-muted-foreground">أخطاء: {severityCounts.ERROR.toLocaleString('ar-EG')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سجلات المعلومات</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityCounts.INFO.toLocaleString('ar-EG')}</div>
            <p className="text-xs text-muted-foreground">عمليات النظام العامة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>أحدث السجلات</CardTitle>
            <CardDescription>عرض مفصل لآخر الأنشطة الأمنية والتشغيلية</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-3 w-3" />
            {filteredLogs.length.toLocaleString('ar-EG')} سجل
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {refreshing && (
            <div className="flex items-center justify-center py-4">
              <LoadingIndicator size="sm" text="جاري تحديث السجلات" />
            </div>
          )}

          {filteredLogs.length === 0 ? (
            <EmptyState
              title="لا توجد سجلات مطابقة"
              message="لم يتم العثور على سجلات ضمن المعايير المحددة."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الحدث</TableHead>
                    <TableHead className="text-right">المستوى</TableHead>
                    <TableHead className="text-right">المصدر</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">عنوان IP</TableHead>
                    <TableHead className="text-right">التوقيت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="max-w-md whitespace-pre-wrap text-right">
                        <p className="font-medium text-foreground">{log.message}</p>
                        {log.metadata && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {typeof log.metadata === 'string'
                              ? log.metadata
                              : JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={`${severityColors[log.severity]} border-0`}>{
                          severityLabels[log.severity]
                        }</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                          {sourceLabels[log.source]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.actor?.name || log.actor?.email || 'النظام'}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.ipAddress || '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatTimestamp(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LogsPage() {
  return (
    <AdminRoute>
      <LogsDashboard />
    </AdminRoute>
  )
}
