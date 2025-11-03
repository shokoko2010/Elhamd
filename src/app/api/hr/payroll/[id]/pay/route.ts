import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { PayrollProcessor } from '@/lib/payroll-processor'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Payroll record ID is required' }, { status: 400 })
    }

    const processor = new PayrollProcessor()

    const payrollRecord = await processor.markPayrollRecordPaid(id, user.id)

    return NextResponse.json(payrollRecord)
  } catch (error) {
    console.error('Error marking payroll as paid:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}