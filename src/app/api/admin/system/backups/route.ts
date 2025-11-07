import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PERMISSIONS, PermissionService } from '@/lib/permissions'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { subDays, subHours } from 'date-fns'

type RangeOption = '7d' | '30d' | '90d' | '24h'

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
      return subDays(new Date(), 30)
  }
}

const extractSizeBytes = (details: unknown): number => {
  if (!details || typeof details !== 'object') {
    return 0
  }

  const data = details as Record<string, unknown>

  if (typeof data.sizeBytes === 'number') {
    return Math.max(0, data.sizeBytes)
  }

  if (typeof data.sizeMb === 'number') {
    return Math.max(0, data.sizeMb * 1024 * 1024)
  }

  if (typeof data.size === 'string') {
    const numeric = parseFloat(data.size)
    if (!Number.isNaN(numeric)) {
      return Math.max(0, numeric * 1024 * 1024)
    }
  }

  return 0
}

const extractStatus = (details: unknown): string => {
  if (!details || typeof details !== 'object') {
    return 'SUCCESS'
  }

  const data = details as Record<string, unknown>
  if (typeof data.status === 'string' && data.status.length > 0) {
    return data.status.toUpperCase()
  }

  return 'SUCCESS'
}

const normalizeSchedule = (settings: unknown): { enabled: boolean; schedule: string } => {
  if (!settings || typeof settings !== 'object') {
    return { enabled: false, schedule: '02:00' }
  }

  const data = settings as Record<string, unknown>

  if (typeof data.autoBackup === 'object' && data.autoBackup !== null) {
    const nested = data.autoBackup as Record<string, unknown>
    return {
      enabled: Boolean(nested.enabled ?? nested.isEnabled),
      schedule: typeof nested.schedule === 'string' && nested.schedule.length > 0 ? nested.schedule : '02:00'
    }
  }

  return {
    enabled: Boolean(data.autoBackupEnabled),
    schedule: typeof data.autoBackupSchedule === 'string' && data.autoBackupSchedule.length > 0
      ? data.autoBackupSchedule
      : '02:00'
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await PermissionService.hasAnyPermission(user.id, [
        PERMISSIONS.MANAGE_BACKUPS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
        PERMISSIONS.VIEW_SYSTEM_LOGS
      ])

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const url = new URL(request.url)
    const range = (url.searchParams.get('range') as RangeOption) || '30d'
    const limitParam = parseInt(url.searchParams.get('limit') || '20', 10)
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 5), 100)

    const since = determineSince(range)

    const where: Prisma.ActivityLogWhereInput = {
      OR: [
        { entityType: 'BACKUP' },
        { action: { contains: 'backup', mode: 'insensitive' } }
      ],
      createdAt: { gte: since }
    }

    const [backups, totalBackups, siteSettings] = await Promise.all([
      db.activityLog.findMany({
        where,
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
      db.activityLog.count({ where }),
      db.siteSettings.findFirst({
        where: { isActive: true },
        select: {
          performanceSettings: true
        }
      })
    ])

    const recentBackups = backups.slice(0, limit)
    const totalSizeBytes = backups.reduce((sum, log) => sum + extractSizeBytes(log.details), 0)

    const performanceSettings = siteSettings?.performanceSettings as Record<string, unknown> | undefined
    const schedule = normalizeSchedule(performanceSettings)
    const storageUsage = (performanceSettings?.backup as Record<string, unknown> | undefined) ?? {}

    const usedBytes = typeof storageUsage.usedBytes === 'number' ? storageUsage.usedBytes : totalSizeBytes
    const capacityBytes = typeof storageUsage.capacityBytes === 'number'
      ? storageUsage.capacityBytes
      : 100 * 1024 * 1024 * 1024 // 100 GB default

    const lastBackup = recentBackups[0]

    return NextResponse.json({
      stats: {
        totalBackups,
        totalSizeBytes,
        lastBackupAt: lastBackup ? lastBackup.createdAt.toISOString() : null,
        autoBackupEnabled: schedule.enabled,
        autoBackupSchedule: schedule.schedule
      },
      storage: {
        usedBytes,
        capacityBytes
      },
      backups: recentBackups.map((log) => ({
        id: log.id,
        createdAt: log.createdAt.toISOString(),
        type: log.entityType || 'SYSTEM',
        action: log.action,
        status: extractStatus(log.details),
        sizeBytes: extractSizeBytes(log.details),
        triggeredBy: log.user
          ? {
              id: log.user.id,
              name: log.user.name,
              email: log.user.email
            }
          : null,
        metadata: log.details
      }))
    })
  } catch (error) {
    console.error('Error fetching backup data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backup information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'SUPER_ADMIN') {
      const hasAccess = await PermissionService.hasAnyPermission(user.id, [
        PERMISSIONS.MANAGE_BACKUPS,
        PERMISSIONS.MANAGE_SYSTEM_SETTINGS
      ])

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    let body: Record<string, unknown> = {}

    try {
      body = await request.json()
    } catch (error) {
      body = {}
    }
    const note = typeof body.note === 'string' ? body.note : undefined
    const sizeBytes = typeof body.sizeBytes === 'number' ? Math.max(0, body.sizeBytes) : 0

    const ipAddress = request.headers.get('x-forwarded-for') || request.ip || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    const record = await db.activityLog.create({
      data: {
        id: randomUUID(),
        action: 'MANUAL_BACKUP_TRIGGERED',
        entityType: 'BACKUP',
        entityId: randomUUID(),
        userId: user.id,
        ipAddress,
        userAgent,
        details: {
          status: 'SUCCESS',
          initiatedBy: 'admin_portal',
          note,
          sizeBytes
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(
      {
        backup: {
          id: record.id,
          createdAt: record.createdAt.toISOString(),
          status: extractStatus(record.details),
          sizeBytes: extractSizeBytes(record.details),
          triggeredBy: record.user
            ? {
                id: record.user.id,
                name: record.user.name,
                email: record.user.email
              }
            : null,
          metadata: record.details
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating backup record:', error)
    return NextResponse.json(
      { error: 'Failed to create backup record' },
      { status: 500 }
    )
  }
}
