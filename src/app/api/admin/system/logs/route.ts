import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PERMISSIONS, PermissionService } from '@/lib/permissions'
import { LogSeverity, Prisma } from '@prisma/client'
import { subDays, subHours } from 'date-fns'

type RangeOption = '24h' | '7d' | '30d' | '90d'

type NormalizedLog = {
  id: string
  createdAt: string
  severity: LogSeverity
  source: 'security' | 'activity'
  message: string
  actor?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
  ipAddress?: string | null
  metadata?: unknown
}

const severityFallback: Record<string, LogSeverity> = {
  critical: LogSeverity.CRITICAL,
  error: LogSeverity.ERROR,
  warning: LogSeverity.WARNING,
  warn: LogSeverity.WARNING,
  info: LogSeverity.INFO,
  notice: LogSeverity.INFO
}

const determineSince = (range: RangeOption) => {
  switch (range) {
    case '24h':
      return subHours(new Date(), 24)
    case '7d':
      return subDays(new Date(), 7)
    case '30d':
      return subDays(new Date(), 30)
    case '90d':
      return subDays(new Date(), 90)
    default:
      return subHours(new Date(), 24)
  }
}

const parseSeverity = (value: unknown): LogSeverity => {
  if (typeof value === 'string' && value.length > 0) {
    const normalized = value.toLowerCase()
    return severityFallback[normalized] ?? LogSeverity.INFO
  }

  if (typeof value === 'object' && value !== null && 'severity' in (value as Record<string, unknown>)) {
    return parseSeverity((value as Record<string, unknown>).severity)
  }

  return LogSeverity.INFO
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await PermissionService.hasAnyPermission(user.id, [
        PERMISSIONS.VIEW_SYSTEM_LOGS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS
      ])

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const url = new URL(request.url)
    const range = (url.searchParams.get('range') as RangeOption) || '24h'
    const limitParam = parseInt(url.searchParams.get('limit') || '100', 10)
    const limit = Number.isNaN(limitParam) ? 100 : Math.min(Math.max(limitParam, 10), 500)

    const since = determineSince(range)

    const securityWhere: Prisma.SecurityLogWhereInput = {
      createdAt: { gte: since }
    }

    const activityWhere: Prisma.ActivityLogWhereInput = {
      createdAt: { gte: since }
    }

    const [securityLogs, activityLogs, securityCounts, securityTotal, activityTotal] = await Promise.all([
      db.securityLog.findMany({
        where: securityWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit * 2
      }),
      db.activityLog.findMany({
        where: activityWhere,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit * 2
      }),
      db.securityLog.groupBy({
        by: ['severity'],
        _count: { _all: true },
        where: securityWhere
      }),
      db.securityLog.count({ where: securityWhere }),
      db.activityLog.count({ where: activityWhere })
    ])

    const severityBreakdown: Record<LogSeverity, number> = {
      [LogSeverity.INFO]: 0,
      [LogSeverity.WARNING]: 0,
      [LogSeverity.ERROR]: 0,
      [LogSeverity.CRITICAL]: 0
    }

    for (const item of securityCounts) {
      severityBreakdown[item.severity] += item._count._all
    }

    const normalizedSecurityLogs: NormalizedLog[] = securityLogs.map((log) => ({
      id: log.id,
      createdAt: log.createdAt.toISOString(),
      severity: log.severity,
      source: 'security',
      message: log.action,
      actor: log.user
        ? {
            id: log.user.id,
            name: log.user.name,
            email: log.user.email
          }
        : null,
      ipAddress: log.ipAddress,
      metadata: log.details
    }))

    const normalizedActivityLogs: NormalizedLog[] = activityLogs.map((log) => {
      const severity = parseSeverity(log.details)
      severityBreakdown[severity] += 1

      return {
        id: log.id,
        createdAt: log.createdAt.toISOString(),
        severity,
        source: 'activity',
        message: log.action,
        actor: log.user
          ? {
              id: log.user.id,
              name: log.user.name,
              email: log.user.email
            }
          : null,
        ipAddress: log.ipAddress,
        metadata: {
          entityType: log.entityType,
          entityId: log.entityId,
          details: log.details
        }
      }
    })

    const combinedLogs = [...normalizedSecurityLogs, ...normalizedActivityLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const logs = combinedLogs.slice(0, limit)

    const stats = {
      total: securityTotal + activityTotal,
      errors: severityBreakdown[LogSeverity.ERROR] + severityBreakdown[LogSeverity.CRITICAL],
      warnings: severityBreakdown[LogSeverity.WARNING],
      critical: severityBreakdown[LogSeverity.CRITICAL],
      info: severityBreakdown[LogSeverity.INFO],
      lastEventAt: logs.length > 0 ? logs[0].createdAt : null
    }

    return NextResponse.json({
      stats,
      severityBreakdown,
      logs
    })
  } catch (error) {
    console.error('Error fetching system logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system logs' },
      { status: 500 }
    )
  }
}
