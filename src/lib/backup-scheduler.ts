import { performBackup, loadBackupSettings, computeNextRunDate, saveBackupSettings } from './backup-service'

interface SchedulerState {
  initialized: boolean
  timer: NodeJS.Timeout | null
  scheduling: boolean
}

type GlobalWithScheduler = typeof globalThis & { __elhamdBackupScheduler?: SchedulerState }

const schedulerGlobal = globalThis as GlobalWithScheduler

const state: SchedulerState = schedulerGlobal.__elhamdBackupScheduler ?? {
  initialized: false,
  timer: null,
  scheduling: false
}

if (!schedulerGlobal.__elhamdBackupScheduler) {
  schedulerGlobal.__elhamdBackupScheduler = state
}

async function scheduleNextRun() {
  if (state.timer) {
    clearTimeout(state.timer)
    state.timer = null
  }

  const settings = await loadBackupSettings()

  if (!settings.backup.enabled) {
    await saveBackupSettings({ nextRunAt: null })
    return
  }

  const nextRun = computeNextRunDate(settings.backup.schedule)
  const delay = Math.max(0, nextRun.getTime() - Date.now())

  await saveBackupSettings({ nextRunAt: nextRun.toISOString() })

  state.timer = setTimeout(async () => {
    state.timer = null
    if (state.scheduling) return

    state.scheduling = true
    try {
      await performBackup({ source: 'automatic', note: 'Scheduled automatic backup' })
    } catch (error) {
      console.error('Automatic backup failed:', error)
    } finally {
      state.scheduling = false
      await scheduleNextRun()
    }
  }, delay)

  if (typeof state.timer.unref === 'function') {
    state.timer.unref()
  }
}

export async function initializeBackupScheduler() {
  if (state.initialized) {
    return
  }
  state.initialized = true
  try {
    await scheduleNextRun()
  } catch (error) {
    console.error('Failed to initialize backup scheduler:', error)
  }
}

export async function refreshBackupScheduler() {
  try {
    await scheduleNextRun()
  } catch (error) {
    console.error('Failed to refresh backup scheduler:', error)
  }
}
