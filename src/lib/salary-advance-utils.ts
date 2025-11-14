import { addMonths } from 'date-fns'
import { sanitizeNumber } from './invoice-normalizer'

export interface RepaymentScheduleEntry {
  dueDate: string
  amount: number
  status: 'PENDING' | 'PAID'
}

const toISODate = (value: Date) => {
  return value.toISOString()
}

export const generateRepaymentSchedule = (
  amount: number,
  months: number,
  startDate: Date
): RepaymentScheduleEntry[] => {
  if (!months || months <= 0 || amount <= 0) {
    return []
  }

  const baseAmount = Math.round((amount / months) * 100) / 100
  const schedule: RepaymentScheduleEntry[] = []
  let accumulated = 0

  for (let index = 0; index < months; index++) {
    const dueDate = addMonths(startDate, index)
    let installmentAmount = baseAmount

    if (index === months - 1) {
      // Adjust last installment to ensure totals align with original amount
      installmentAmount = Math.round((amount - accumulated) * 100) / 100
    }

    accumulated = Math.round((accumulated + installmentAmount) * 100) / 100

    schedule.push({
      dueDate: toISODate(dueDate),
      amount: installmentAmount,
      status: 'PENDING'
    })
  }

  return schedule
}

export const updateRepaymentStatuses = (
  schedule: RepaymentScheduleEntry[] | null | undefined,
  repaidAmountInput: number | string | null | undefined
): { schedule: RepaymentScheduleEntry[]; nextDueDate: string | null } => {
  const safeSchedule = Array.isArray(schedule) ? schedule : []
  const repaidAmount = sanitizeNumber(repaidAmountInput)

  let remaining = repaidAmount
  let nextDue: string | null = null

  const updatedSchedule = safeSchedule.map(entry => {
    const installmentAmount = sanitizeNumber(entry.amount)

    if (remaining >= installmentAmount - 0.01) {
      remaining -= installmentAmount
      return {
        ...entry,
        status: 'PAID'
      }
    }

    if (!nextDue) {
      nextDue = entry.dueDate
    }

    return {
      ...entry,
      status: 'PENDING'
    }
  })

  return {
    schedule: updatedSchedule,
    nextDueDate: nextDue
  }
}
