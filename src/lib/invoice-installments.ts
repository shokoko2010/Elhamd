import { InstallmentStatus } from '@prisma/client'
import { sanitizeNumber } from './invoice-normalizer'

type AnyRecord = Record<string, unknown>

export interface InstallmentInput {
  id?: string
  sequence?: number
  amount?: number | string
  dueDate?: string | Date | null
  status?: InstallmentStatus | string | null
  paidAmount?: number | string
  notes?: string | null
  metadata?: AnyRecord | null
}

export interface NormalizedInstallmentInput {
  id?: string
  sequence: number
  amount: number
  dueDate: Date
  status: InstallmentStatus
  paidAmount: number
  notes?: string
  metadata: AnyRecord | null
  hasManualStatus: boolean
}

const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

const coerceDate = (value: unknown): Date | null => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isValidDate(parsed) ? parsed : null
  }

  return null
}

const coerceStatus = (value: unknown): InstallmentStatus | null => {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    const normalized = value.toUpperCase().trim()
    if (normalized in InstallmentStatus) {
      return InstallmentStatus[normalized as keyof typeof InstallmentStatus]
    }
  }

  if (Object.values(InstallmentStatus).includes(value as InstallmentStatus)) {
    return value as InstallmentStatus
  }

  return null
}

export const normalizeInstallmentInputs = (
  installments: InstallmentInput[] | undefined | null
): NormalizedInstallmentInput[] => {
  const safeInstallments = Array.isArray(installments) ? installments : []

  return safeInstallments
    .map((installment, index) => {
      const amount = sanitizeNumber(installment.amount)
      const dueDate = coerceDate(installment.dueDate)

      if (!dueDate || amount <= 0) {
        return null
      }

      const status = coerceStatus(installment.status)

      return {
        id: installment.id,
        sequence:
          typeof installment.sequence === 'number' && Number.isFinite(installment.sequence)
            ? installment.sequence
            : index + 1,
        amount,
        dueDate,
        status: status ?? InstallmentStatus.SCHEDULED,
        paidAmount: Math.max(0, sanitizeNumber(installment.paidAmount)),
        notes: installment.notes ?? undefined,
        metadata:
          installment.metadata && typeof installment.metadata === 'object'
            ? (installment.metadata as AnyRecord)
            : null,
        hasManualStatus: Boolean(status)
      }
    })
    .filter((installment): installment is NormalizedInstallmentInput => Boolean(installment))
    .sort((a, b) => a.sequence - b.sequence)
}

const AMOUNT_TOLERANCE = 0.01

export interface InstallmentLike {
  amount: number
  paidAmount?: number | null
  dueDate: Date
  status: InstallmentStatus
}

export const deriveInstallmentStatus = (
  installment: InstallmentLike,
  referenceDate: Date = new Date()
): InstallmentStatus => {
  const paidAmount = sanitizeNumber(installment.paidAmount)

  if (installment.status === InstallmentStatus.CANCELLED) {
    return InstallmentStatus.CANCELLED
  }

  if (paidAmount >= installment.amount - AMOUNT_TOLERANCE) {
    return InstallmentStatus.PAID
  }

  if (paidAmount > 0) {
    return InstallmentStatus.PARTIALLY_PAID
  }

  if (referenceDate.getTime() > installment.dueDate.getTime()) {
    return InstallmentStatus.OVERDUE
  }

  if (
    installment.status === InstallmentStatus.SCHEDULED ||
    installment.status === InstallmentStatus.PENDING
  ) {
    return installment.status
  }

  return InstallmentStatus.SCHEDULED
}

export const clampInstallmentStatus = (
  installment: InstallmentLike,
  referenceDate: Date = new Date()
): InstallmentStatus => {
  const derived = deriveInstallmentStatus(installment, referenceDate)

  if (installment.status === InstallmentStatus.CANCELLED) {
    return InstallmentStatus.CANCELLED
  }

  if (installment.status === InstallmentStatus.PARTIALLY_PAID && derived === InstallmentStatus.PAID) {
    return InstallmentStatus.PAID
  }

  if (
    installment.status === InstallmentStatus.PAID &&
    derived !== InstallmentStatus.PAID &&
    sanitizeNumber(installment.paidAmount) >= installment.amount - AMOUNT_TOLERANCE
  ) {
    return InstallmentStatus.PAID
  }

  if (
    installment.status === InstallmentStatus.PARTIALLY_PAID &&
    sanitizeNumber(installment.paidAmount) <= 0
  ) {
    return derived
  }

  if (installment.status === InstallmentStatus.PENDING && derived === InstallmentStatus.SCHEDULED) {
    return InstallmentStatus.PENDING
  }

  return derived
}

export const calculateInstallmentTotals = (
  installments: { amount: number; paidAmount?: number | null }[]
) => {
  return installments.reduce(
    (acc, installment) => {
      const amount = sanitizeNumber(installment.amount)
      const paid = sanitizeNumber(installment.paidAmount)

      return {
        scheduled: acc.scheduled + amount,
        paid: acc.paid + Math.min(amount, paid)
      }
    },
    { scheduled: 0, paid: 0 }
  )
}
