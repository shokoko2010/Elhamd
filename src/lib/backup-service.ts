import { promises as fs } from 'fs'
import { createReadStream, createWriteStream } from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'
import { randomUUID } from 'crypto'
import { addDays, isBefore, setHours, setMinutes, setSeconds } from 'date-fns'
import { Prisma } from '@prisma/client'
import { db } from './db'

const BACKUP_DIR = path.join(process.cwd(), 'db', 'backups')
const DEFAULT_CAPACITY_BYTES = 100 * 1024 * 1024 * 1024 // 100 GB
const DEFAULT_RETENTION_DAYS = 30
const DEFAULT_SCHEDULE = '02:00'

export type BackupSource = 'manual' | 'automatic'

export interface BackupSettings {
  enabled: boolean
  schedule: string
  retentionDays: number
  capacityBytes: number
  nextRunAt: string | null
  lastRunAt: string | null
  lastRunSource?: BackupSource
  lastStatus?: 'SUCCESS' | 'FAILED' | null
  lastFilePath?: string | null
  lastFileSize?: number
  lastError?: string | null
}

export interface LoadedBackupSettings {
  settingsId: string
  performanceSettings: Record<string, unknown>
  backup: BackupSettings
}

export interface BackupFileInfo {
  fileName: string
  filePath: string
  sizeBytes: number
  createdAt: Date
}

export interface BackupResult {
  backupId: string
  fileName: string
  filePath: string
  sizeBytes: number
  createdAt: Date
  usedBytes: number
  triggeredBy: { id: string; name?: string | null; email?: string | null } | null
}

type BackupActor = { id: string; name?: string | null; email?: string | null }

async function resolveBackupActor(triggeredBy?: BackupActor | null): Promise<BackupActor | null> {
  if (triggeredBy?.id) {
    return {
      id: triggeredBy.id,
      name: triggeredBy.name ?? null,
      email: triggeredBy.email ?? null
    }
  }

  const privilegedUser = await db.user.findFirst({
    where: {
      role: { in: ['SUPER_ADMIN', 'ADMIN'] },
      isActive: true
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true }
  })

  if (privilegedUser) {
    return privilegedUser
  }

  const anyUser = await db.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true }
  })

  if (anyUser) {
    return anyUser
  }

  console.warn('No users found to attribute backup activity logs to; proceeding without logging the activity record.')
  return null
}

function ensureScheduleValue(schedule: string | null | undefined): string {
  if (typeof schedule !== 'string') {
    return DEFAULT_SCHEDULE
  }
  const match = schedule.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return DEFAULT_SCHEDULE
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return DEFAULT_SCHEDULE
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }
  return fallback
}

function toJsonSafe(value: unknown): unknown {
  if (value instanceof Prisma.Decimal) {
    return value.toString()
  }
  if (typeof value === 'bigint') {
    return value.toString()
  }
  if (Buffer.isBuffer(value)) {
    return value.toString('base64')
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item))
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toJsonSafe(val)
    }
    return result
  }
  return value
}

async function ensureBackupDirectory(): Promise<void> {
  await fs.mkdir(BACKUP_DIR, { recursive: true })
}

export async function listBackupFiles(): Promise<BackupFileInfo[]> {
  await ensureBackupDirectory()
  const entries = await fs.readdir(BACKUP_DIR)
  const files: BackupFileInfo[] = []

  for (const entry of entries) {
    if (!entry.endsWith('.json.gz')) continue
    const filePath = path.join(BACKUP_DIR, entry)
    try {
      const stats = await fs.stat(filePath)
      files.push({
        fileName: entry,
        filePath,
        sizeBytes: stats.size,
        createdAt: stats.birthtime ?? stats.mtime
      })
    } catch (error) {
      console.error('Failed to read backup file stats:', error)
    }
  }

  files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return files
}

export async function getBackupStorageUsage(
  context?: LoadedBackupSettings
): Promise<{ usedBytes: number; capacityBytes: number; files: BackupFileInfo[] }> {
  const files = await listBackupFiles()
  const usedBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0)
  const settings = context ?? (await loadBackupSettings())
  return {
    usedBytes,
    capacityBytes: settings.backup.capacityBytes,
    files
  }
}

export async function loadBackupSettings(): Promise<LoadedBackupSettings> {
  await ensureBackupDirectory()

  let settings = await db.siteSettings.findFirst({
    where: { isActive: true },
    select: { id: true, performanceSettings: true }
  })

  if (!settings) {
    settings = await db.siteSettings.create({
      data: {
        siteTitle: 'الحمد للسيارات',
        siteDescription: 'الإعدادات الافتراضية للنظام',
        contactEmail: 'info@example.com',
        performanceSettings: {},
        socialLinks: {},
        isActive: true
      },
      select: { id: true, performanceSettings: true }
    })
  }

  const performanceSettings = (settings.performanceSettings as Record<string, unknown> | null) ?? {}
  const existing = (performanceSettings.backup as Record<string, unknown> | null) ?? {}

  const backup: BackupSettings = {
    enabled: Boolean(existing.enabled),
    schedule: ensureScheduleValue((existing.schedule as string) ?? (existing.autoBackupSchedule as string)),
    retentionDays: normalizeNumber(existing.retentionDays, DEFAULT_RETENTION_DAYS),
    capacityBytes: normalizeNumber(existing.capacityBytes, DEFAULT_CAPACITY_BYTES),
    nextRunAt: typeof existing.nextRunAt === 'string' ? existing.nextRunAt : null,
    lastRunAt: typeof existing.lastRunAt === 'string' ? existing.lastRunAt : null,
    lastRunSource: existing.lastRunSource === 'automatic' ? 'automatic' : existing.lastRunSource === 'manual' ? 'manual' : undefined,
    lastStatus:
      typeof existing.lastStatus === 'string'
        ? (existing.lastStatus.toUpperCase() === 'FAILED' ? 'FAILED' : existing.lastStatus.toUpperCase() === 'SUCCESS' ? 'SUCCESS' : null)
        : null,
    lastFilePath: typeof existing.lastFilePath === 'string' ? existing.lastFilePath : null,
    lastFileSize: typeof existing.lastFileSize === 'number' ? existing.lastFileSize : undefined,
    lastError: typeof existing.lastError === 'string' ? existing.lastError : null
  }

  return {
    settingsId: settings.id,
    performanceSettings,
    backup
  }
}

export function computeNextRunDate(schedule: string, reference: Date = new Date()): Date {
  const safeSchedule = ensureScheduleValue(schedule)
  const [hours, minutes] = safeSchedule.split(':').map((value) => Number(value))
  const base = setSeconds(setMinutes(setHours(new Date(reference), hours), minutes), 0)
  if (!isBefore(reference, base)) {
    return setSeconds(setMinutes(setHours(addDays(base, 1), hours), minutes), 0)
  }
  return base
}

interface SaveSettingsContext {
  context?: LoadedBackupSettings
}

export async function saveBackupSettings(
  update: Partial<BackupSettings & { nextRunAt?: string | null; lastRunSource?: BackupSource }>,
  options: SaveSettingsContext = {}
): Promise<BackupSettings> {
  const existing = options.context ?? (await loadBackupSettings())
  const performanceData = { ...(existing.performanceSettings ?? {}) }
  const previousBackup = (performanceData['backup'] as Record<string, unknown> | undefined) ?? {}
  const currentBackup = existing.backup
  const hasLastStatus = Object.prototype.hasOwnProperty.call(update, 'lastStatus')
  const hasNextRun = Object.prototype.hasOwnProperty.call(update, 'nextRunAt')
  const hasLastRun = Object.prototype.hasOwnProperty.call(update, 'lastRunAt')
  const hasLastFilePath = Object.prototype.hasOwnProperty.call(update, 'lastFilePath')
  const hasLastFileSize = Object.prototype.hasOwnProperty.call(update, 'lastFileSize')
  const hasLastError = Object.prototype.hasOwnProperty.call(update, 'lastError')

  const merged: BackupSettings = {
    enabled: update.enabled ?? currentBackup.enabled,
    schedule: ensureScheduleValue(update.schedule ?? currentBackup.schedule),
    retentionDays: normalizeNumber(update.retentionDays ?? currentBackup.retentionDays, DEFAULT_RETENTION_DAYS),
    capacityBytes: normalizeNumber(update.capacityBytes ?? currentBackup.capacityBytes, DEFAULT_CAPACITY_BYTES),
    nextRunAt: hasNextRun ? (update.nextRunAt ?? null) : currentBackup.nextRunAt,
    lastRunAt: hasLastRun ? (update.lastRunAt ?? null) : currentBackup.lastRunAt,
    lastRunSource: update.lastRunSource ?? currentBackup.lastRunSource,
    lastStatus: hasLastStatus ? (update.lastStatus ?? null) : currentBackup.lastStatus ?? null,
    lastFilePath: hasLastFilePath ? (update.lastFilePath ?? null) : currentBackup.lastFilePath,
    lastFileSize: hasLastFileSize ? update.lastFileSize : currentBackup.lastFileSize,
    lastError: hasLastError ? (update.lastError ?? null) : currentBackup.lastError ?? null
  }

  const updatedPerformance: Record<string, unknown> = {
    ...performanceData,
    backup: {
      ...previousBackup,
      ...merged,
      updatedAt: new Date().toISOString()
    }
  }

  await db.siteSettings.update({
    where: { id: existing.settingsId },
    data: {
      performanceSettings: updatedPerformance,
      updatedAt: new Date()
    }
  })

  return merged
}

async function exportDatabaseSnapshot(): Promise<{ tempFile: string; finalFile: string; fileName: string; sizeBytes: number }> {
  await ensureBackupDirectory()

  const tables: Array<{ table_name: string }> = await db.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  const excludedTables = new Set(['_prisma_migrations'])
  const payload: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    tables: {}
  }

  for (const table of tables) {
    if (excludedTables.has(table.table_name)) continue
    try {
      const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(`SELECT * FROM "${table.table_name}"`)
      ;(payload.tables as Record<string, unknown>)[table.table_name] = rows.map((row) => toJsonSafe(row))
    } catch (error) {
      console.error(`Failed to export table ${table.table_name}:`, error)
    }
  }

  const backupId = randomUUID()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `backup-${timestamp}-${backupId}.json`
  const tempFile = path.join(BACKUP_DIR, `${fileName}.tmp`)
  const finalFile = path.join(BACKUP_DIR, `${fileName}.gz`)

  await fs.writeFile(tempFile, JSON.stringify(payload, null, 2), 'utf-8')

  await pipeline(createReadStream(tempFile), createGzip(), createWriteStream(finalFile))
  await fs.unlink(tempFile)

  const stats = await fs.stat(finalFile)

  return {
    tempFile,
    finalFile,
    fileName: `${fileName}.gz`,
    sizeBytes: stats.size
  }
}

async function applyRetention(retentionDays: number): Promise<void> {
  if (retentionDays <= 0) return
  const now = new Date()
  const cutoff = addDays(now, -retentionDays)
  const files = await listBackupFiles()

  for (const file of files) {
    if (isBefore(file.createdAt, cutoff)) {
      try {
        await fs.unlink(file.filePath)
      } catch (error) {
        console.error('Failed to remove expired backup file:', error)
      }
    }
  }
}

export async function performBackup(options: { source: BackupSource; triggeredBy?: BackupActor | null; note?: string | null })
  : Promise<BackupResult> {
  const startedAt = new Date()
  const context = await loadBackupSettings()
  const retentionDays = context.backup.retentionDays

  try {
    const actor = await resolveBackupActor(options.triggeredBy)
    const snapshot = await exportDatabaseSnapshot()
    await applyRetention(retentionDays)
    const storage = await getBackupStorageUsage(context)

    const logId = randomUUID()
    const logDetails = {
      status: 'SUCCESS',
      source: options.source,
      note: options.note ?? null,
      fileName: snapshot.fileName,
      filePath: path.relative(process.cwd(), snapshot.finalFile),
      sizeBytes: snapshot.sizeBytes,
      retentionDays,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString()
    }

    let activityCreatedAt = new Date()

    if (actor) {
      const activity = await db.activityLog.create({
        data: {
          id: logId,
          action: options.source === 'automatic' ? 'AUTO_BACKUP_COMPLETED' : 'MANUAL_BACKUP_COMPLETED',
          entityType: 'BACKUP',
          entityId: randomUUID(),
          userId: actor.id,
          details: logDetails
        }
      })
      activityCreatedAt = activity.createdAt
    }

    const nextRun = context.backup.enabled
      ? computeNextRunDate(context.backup.schedule)
      : null

    await saveBackupSettings(
      {
        lastRunAt: activityCreatedAt.toISOString(),
        lastRunSource: options.source,
        lastStatus: 'SUCCESS',
        lastFilePath: path.relative(process.cwd(), snapshot.finalFile),
        lastFileSize: snapshot.sizeBytes,
        nextRunAt: nextRun ? nextRun.toISOString() : null,
        lastError: null
      },
      { context }
    )

    return {
      backupId: logId,
      fileName: snapshot.fileName,
      filePath: snapshot.finalFile,
      sizeBytes: snapshot.sizeBytes,
      createdAt: activityCreatedAt,
      usedBytes: storage.usedBytes,
      triggeredBy: actor
    }
  } catch (error) {
    console.error('Backup process failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    const actor = await resolveBackupActor(options.triggeredBy)
    const logId = randomUUID()
    const logDetails = {
      status: 'FAILED',
      source: options.source,
      note: options.note ?? null,
      error: message,
      startedAt: startedAt.toISOString()
    }

    let activityCreatedAt = new Date()

    if (actor) {
      const activity = await db.activityLog.create({
        data: {
          id: logId,
          action: options.source === 'automatic' ? 'AUTO_BACKUP_FAILED' : 'MANUAL_BACKUP_FAILED',
          entityType: 'BACKUP',
          entityId: randomUUID(),
          userId: actor.id,
          details: logDetails
        }
      })
      activityCreatedAt = activity.createdAt
    }

    await saveBackupSettings(
      {
        lastRunAt: activityCreatedAt.toISOString(),
        lastRunSource: options.source,
        lastStatus: 'FAILED',
        lastError: message
      },
      { context }
    )

    throw error
  }
}

export async function updateAutomaticBackupSettings(payload: {
  enabled: boolean
  schedule: string
  retentionDays: number
  capacityBytes?: number
}): Promise<BackupSettings> {
  const schedule = ensureScheduleValue(payload.schedule)
  const retention = Math.min(Math.max(Math.floor(payload.retentionDays), 1), 365)
  const capacity = payload.capacityBytes && payload.capacityBytes > 0 ? payload.capacityBytes : DEFAULT_CAPACITY_BYTES

  const updated = await saveBackupSettings({
    enabled: payload.enabled,
    schedule,
    retentionDays: retention,
    capacityBytes: capacity,
    nextRunAt: payload.enabled ? computeNextRunDate(schedule).toISOString() : null
  })

  return updated
}
