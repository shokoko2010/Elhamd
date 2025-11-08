import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, type AuthUser } from '@/lib/auth-server'
import { PERMISSIONS, PermissionService } from '@/lib/permissions'
import { Prisma } from '@prisma/client'
import { subDays, subHours } from 'date-fns'
import {
  getBackupStorageUsage,
  loadBackupSettings,
  performBackup,
  updateAutomaticBackupSettings
} from '@/lib/backup-service'
import { refreshBackupScheduler } from '@/lib/backup-scheduler'

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

type AccessResult = { error: NextResponse } | { user: AuthUser }

async function requireBackupAccess(): Promise<AccessResult> {
  const user = await getAuthUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }

  if (user.role !== 'SUPER_ADMIN') {
    const hasAccess = await PermissionService.hasAnyPermission(user.id, [
      PERMISSIONS.MANAGE_BACKUPS,
      PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
      PERMISSIONS.VIEW_SYSTEM_LOGS
    ])

    if (!hasAccess) {
      return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) }
    }
  }

  return { user }
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireBackupAccess()
    if ('error' in access) return access.error

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

    const [activityLogs, totalBackups] = await Promise.all([
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
      db.activityLog.count({ where })
    ])

    const context = await loadBackupSettings()
    const storage = await getBackupStorageUsage(context)

    const recentBackups = activityLogs.slice(0, limit)
    const totalSizeBytes = activityLogs.reduce((sum, log) => sum + extractSizeBytes(log.details), 0)
    const lastLog = recentBackups[0]

    return NextResponse.json({
      stats: {
        totalBackups,
        totalSizeBytes,
        lastBackupAt: context.backup.lastRunAt || (lastLog ? lastLog.createdAt.toISOString() : null),
        lastBackupStatus: context.backup.lastStatus ?? extractStatus(lastLog?.details),
        lastBackupError: context.backup.lastError ?? null,
        autoBackupEnabled: context.backup.enabled,
        autoBackupSchedule: context.backup.schedule,
        autoBackupRetentionDays: context.backup.retentionDays,
        nextAutoBackupAt: context.backup.nextRunAt
      },
      storage: {
        usedBytes: storage.usedBytes,
        capacityBytes: storage.capacityBytes
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
    const access = await requireBackupAccess()
    if ('error' in access) return access.error

    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const note = typeof body.note === 'string' ? body.note : undefined

    const backup = await performBackup({
      source: 'manual',
      triggeredBy: { id: access.user.id, name: access.user.name ?? null, email: access.user.email ?? null },
      note
    })

    await refreshBackupScheduler()

    return NextResponse.json(
      {
        backup: {
          id: backup.backupId,
          createdAt: backup.createdAt.toISOString(),
          status: 'SUCCESS',
          sizeBytes: backup.sizeBytes,
          fileName: backup.fileName,
          filePath: path.relative(process.cwd(), backup.filePath),
          triggeredBy: backup.triggeredBy
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Failed to create backup record' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireBackupAccess()
    if ('error' in access) return access.error

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const context = await loadBackupSettings()

    const enabled = typeof body.enabled === 'boolean' ? body.enabled : context.backup.enabled
    const schedule = typeof body.schedule === 'string' ? body.schedule : context.backup.schedule
    const retentionInput = Number(body.retentionDays)
    const retentionDays = Number.isFinite(retentionInput) ? retentionInput : context.backup.retentionDays
    const capacityInput = Number(body.capacityBytes)
    const capacityBytes = Number.isFinite(capacityInput) && capacityInput > 0 ? capacityInput : context.backup.capacityBytes

    const updated = await updateAutomaticBackupSettings({
      enabled,
      schedule,
      retentionDays,
      capacityBytes
    })

    await refreshBackupScheduler()

    return NextResponse.json({
      settings: {
        enabled: updated.enabled,
        schedule: updated.schedule,
        retentionDays: updated.retentionDays,
        capacityBytes: updated.capacityBytes,
        nextRunAt: updated.nextRunAt,
        lastRunAt: updated.lastRunAt,
        lastStatus: updated.lastStatus,
        lastError: updated.lastError ?? null
      }
    })
  } catch (error) {
    console.error('Error updating automatic backup settings:', error)
    return NextResponse.json(
      { error: 'Failed to update backup settings' },
      { status: 500 }
    )
  }
}
