import { NextRequest, NextResponse } from 'next/server'
import { PayrollStatus } from '@prisma/client'

import { payrollProcessor } from '@/lib/payroll-processor'
import { resolveAuthUser } from '@/lib/resolve-auth-user'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await resolveAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Payroll batch id is required' }, { status: 400 })
    }

    const body = await request.json()
    const { status, notes } = body

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const normalizedStatus = status.toUpperCase()
    if (!Object.values(PayrollStatus).includes(normalizedStatus as PayrollStatus)) {
      return NextResponse.json({ error: 'Unsupported payroll status transition' }, { status: 400 })
    }

    const batch = await payrollProcessor.updateBatchStatus({
      batchId: id,
      status: normalizedStatus as PayrollStatus,
      actorId: user.id,
      notes: typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : undefined
    })

    return NextResponse.json(batch)
  } catch (error) {
    console.error('Error updating payroll batch status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
