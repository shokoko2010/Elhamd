import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth-server'
import { PayrollProcessor } from '@/lib/payroll-processor'

export async function POST(request: NextRequest) {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any = null

  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const { batchId, mode } = body ?? {}

  if (!batchId || typeof batchId !== 'string') {
    return NextResponse.json({ error: 'batchId is required' }, { status: 400 })
  }

  const processor = new PayrollProcessor()

  try {
    const normalizedMode = typeof mode === 'string' ? mode.toLowerCase() : 'accrual'

    const result =
      normalizedMode === 'payment'
        ? await processor.postBatchPayment(batchId, user.id)
        : await processor.postBatchAccrual(batchId, user.id)

    return NextResponse.json({
      success: true,
      mode: normalizedMode === 'payment' ? 'payment' : 'accrual',
      result
    })
  } catch (error) {
    console.error('Error posting payroll batch:', error)
    return NextResponse.json(
      { error: 'Failed to post payroll batch', details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    )
  }
}
