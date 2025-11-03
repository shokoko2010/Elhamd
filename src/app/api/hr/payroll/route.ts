import { NextRequest, NextResponse } from 'next/server'
import { PayrollBatchFrequency } from '@prisma/client'

import { db } from '@/lib/db'
import { payrollProcessor } from '@/lib/payroll-processor'
import { resolveAuthUser } from '@/lib/resolve-auth-user'

const batchInclude = {
  records: {
    include: {
      employee: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } },
          position: { select: { id: true, title: true } }
        }
      },
      adjustments: true
    }
  },
  creator: { select: { id: true, name: true } },
  approver: { select: { id: true, name: true } }
} as const

const recordInclude = {
  employee: {
    include: {
      user: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
      position: { select: { id: true, title: true } }
    }
  },
  creator: { select: { id: true, name: true } },
  approver: { select: { id: true, name: true } },
  batch: { select: { id: true, period: true, status: true } },
  adjustments: true
} as const

export async function GET(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7)
    const view = searchParams.get('view') || 'records'

    if (view === 'batch') {
      const batches = await db.payrollBatch.findMany({
        where: { period },
        include: batchInclude,
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(batches)
    }

    const payrollRecords = await db.payrollRecord.findMany({
      where: { period },
      include: recordInclude,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payrollRecords)
  } catch (error) {
    console.error('Error fetching payroll records:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      period,
      startDate,
      endDate,
      frequency,
      employeeIds,
      includePerformanceBonus,
      forceRecalculate,
      scheduleNext,
      metadata
    } = body

    if (!period || !startDate || !endDate) {
      return NextResponse.json({ error: 'period, startDate and endDate are required' }, { status: 400 })
    }

    const parsedStart = new Date(startDate)
    const parsedEnd = new Date(endDate)

    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: 'Invalid date range supplied' }, { status: 400 })
    }

    let batchFrequency: PayrollBatchFrequency = PayrollBatchFrequency.MONTHLY
    if (typeof frequency === 'string') {
      const normalizedFrequency = frequency.toUpperCase()
      if (Object.values(PayrollBatchFrequency).includes(normalizedFrequency as PayrollBatchFrequency)) {
        batchFrequency = normalizedFrequency as PayrollBatchFrequency
      }
    }

    const batch = await payrollProcessor.processPayrollBatch({
      period,
      startDate: parsedStart,
      endDate: parsedEnd,
      frequency: batchFrequency,
      employeeIds: Array.isArray(employeeIds) ? employeeIds : undefined,
      includePerformanceBonus: typeof includePerformanceBonus === 'boolean' ? includePerformanceBonus : true,
      forceRecalculate: typeof forceRecalculate === 'boolean' ? forceRecalculate : false,
      scheduleNext: typeof scheduleNext === 'boolean' ? scheduleNext : false,
      createdBy: user.id,
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined
    })

    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    console.error('Error creating payroll batch:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    const status = message.includes('exists') ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
