import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Payroll record ID is required' }, { status: 400 })
    }

    const existing = await db.payrollRecord.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    const payrollRecord = await db.payrollRecord.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date()
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(payrollRecord)
  } catch (error) {
    console.error('Error approving payroll record:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}