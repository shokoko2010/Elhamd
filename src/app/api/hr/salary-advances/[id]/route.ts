interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { SalaryAdvanceStatus } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { sanitizeNumber } from '@/lib/invoice-normalizer'
import { updateRepaymentStatuses } from '@/lib/salary-advance-utils'

const baseInclude = {
  employee: {
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      department: {
        select: { id: true, name: true }
      },
      position: {
        select: { id: true, title: true }
      }
    }
  },
  requester: {
    select: { id: true, name: true, email: true }
  },
  approver: {
    select: { id: true, name: true, email: true }
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const existing = await db.salaryAdvance.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Salary advance not found' }, { status: 404 })
    }

    const {
      status,
      paymentAmount,
      notes,
      reason,
      repaymentStart
    }: {
      status?: SalaryAdvanceStatus
      paymentAmount?: number | string
      notes?: string
      reason?: string
      repaymentStart?: string
    } = body ?? {}

    const updates: Record<string, unknown> = {}
    let computedStatus: SalaryAdvanceStatus | undefined

    if (typeof notes === 'string') {
      updates.notes = notes
    }

    if (typeof reason === 'string') {
      updates.reason = reason
    }

    if (repaymentStart) {
      const parsedStart = new Date(repaymentStart)
      if (!Number.isNaN(parsedStart.getTime())) {
        updates.repaymentStart = parsedStart
      }
    }

    if (paymentAmount) {
      const paymentValue = sanitizeNumber(paymentAmount)
      if (paymentValue > 0) {
        const newRepaid = sanitizeNumber(existing.repaidAmount) + paymentValue
        const schedule = Array.isArray(existing.repaymentSchedule)
          ? existing.repaymentSchedule
          : []

        const { schedule: updatedSchedule, nextDueDate } = updateRepaymentStatuses(
          schedule,
          newRepaid
        )

        updates.repaidAmount = newRepaid
        updates.repaymentSchedule = updatedSchedule
        updates.nextDueDate = nextDueDate ? new Date(nextDueDate) : null

        if (newRepaid >= existing.amount - 0.01) {
          computedStatus = SalaryAdvanceStatus.REPAID
        } else if (
          existing.status === SalaryAdvanceStatus.DISBURSED ||
          existing.status === SalaryAdvanceStatus.IN_REPAYMENT ||
          existing.status === SalaryAdvanceStatus.APPROVED
        ) {
          computedStatus = SalaryAdvanceStatus.IN_REPAYMENT
        }
      }
    }

    if (status && status !== existing.status) {
      if (status === SalaryAdvanceStatus.APPROVED) {
        updates.status = SalaryAdvanceStatus.APPROVED
        updates.approvedBy = user.id
        updates.approvedAt = new Date()
      } else if (status === SalaryAdvanceStatus.REJECTED) {
        updates.status = SalaryAdvanceStatus.REJECTED
        updates.approvedBy = user.id
        updates.approvedAt = new Date()
      } else if (status === SalaryAdvanceStatus.DISBURSED) {
        updates.status = SalaryAdvanceStatus.DISBURSED
        updates.disbursedAt = new Date()
        if (!updates.repaymentStart && !existing.repaymentStart) {
          updates.repaymentStart = new Date()
        }
      } else if (status === SalaryAdvanceStatus.IN_REPAYMENT) {
        updates.status = SalaryAdvanceStatus.IN_REPAYMENT
      } else if (status === SalaryAdvanceStatus.REPAID) {
        updates.status = SalaryAdvanceStatus.REPAID
        updates.nextDueDate = null
      } else {
        updates.status = status
      }
    } else if (computedStatus && computedStatus !== existing.status) {
      updates.status = computedStatus
      if (computedStatus === SalaryAdvanceStatus.REPAID) {
        updates.nextDueDate = null
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        await db.salaryAdvance.findUnique({ where: { id }, include: baseInclude })
      )
    }

    const updated = await db.salaryAdvance.update({
      where: { id },
      data: updates,
      include: baseInclude
    })

    return NextResponse.json({
      ...updated,
      repaymentSchedule: Array.isArray(updated.repaymentSchedule)
        ? updated.repaymentSchedule
        : []
    })
  } catch (error) {
    console.error('Error updating salary advance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
