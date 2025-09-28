import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User already available from requireUnifiedAuth

    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update invoice status to PAID and set paid date
    const invoice = await db.invoice.update({
      where: { id: params.id },
      data: {
        status: 'PAID',
        paidDate: new Date()
      }
    })

    return NextResponse.json({
      id: invoice.id,
      status: invoice.status.toLowerCase(),
      paidDate: invoice.paidDate?.toISOString()
    })
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return NextResponse.json(
      { error: 'Failed to mark invoice as paid' },
      { status: 500 }
    )
  }
}