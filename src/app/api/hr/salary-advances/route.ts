import { NextRequest, NextResponse } from 'next/server'
import { SalaryAdvanceStatus } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { sanitizeNumber } from '@/lib/invoice-normalizer'
import { generateRepaymentSchedule } from '@/lib/salary-advance-utils'

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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as SalaryAdvanceStatus | null
    const employeeId = searchParams.get('employeeId')

    const advances = await db.salaryAdvance.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(employeeId ? { employeeId } : {})
      },
      include: baseInclude,
      orderBy: { requestedAt: 'desc' }
    })

    const payload = advances.map((advance) => ({
      ...advance,
      repaymentSchedule: Array.isArray(advance.repaymentSchedule)
        ? advance.repaymentSchedule
        : []
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching salary advances:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      employeeId,
      amount,
      reason,
      repaymentMonths,
      repaymentStart,
      notes
    } = body ?? {}

    const numericAmount = sanitizeNumber(amount)

    if (!employeeId || numericAmount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid salary advance payload',
          code: 'INVALID_PAYLOAD'
        },
        { status: 400 }
      )
    }

    const months = Number.isFinite(Number(repaymentMonths))
      ? Number(repaymentMonths)
      : null

    const startDate = repaymentStart ? new Date(repaymentStart) : new Date()
    const isValidStartDate = !Number.isNaN(startDate.getTime())

    const schedule =
      months && months > 0
        ? generateRepaymentSchedule(numericAmount, months, isValidStartDate ? startDate : new Date())
        : []

    const nextDueDate = schedule.find((entry) => entry.status === 'PENDING')?.dueDate ?? null

    const createdAdvance = await db.salaryAdvance.create({
      data: {
        employeeId,
        requestedBy: user.id,
        amount: numericAmount,
        reason: reason || null,
        repaymentMonths: months && months > 0 ? months : null,
        repaymentStart: schedule.length ? (isValidStartDate ? startDate : new Date()) : null,
        repaymentSchedule: schedule.length ? schedule : null,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        notes: notes || null
      },
      include: baseInclude
    })

    return NextResponse.json({
      ...createdAdvance,
      repaymentSchedule: schedule
    })
  } catch (error) {
    console.error('Error creating salary advance:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
