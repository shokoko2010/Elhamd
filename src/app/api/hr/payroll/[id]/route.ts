import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

const payrollIncludes = {
  employee: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      },
      position: {
        select: {
          id: true,
          title: true
        }
      }
    }
  },
  creator: {
    select: {
      id: true,
      name: true
    }
  },
  approver: {
    select: {
      id: true,
      name: true
    }
  }
} as const

const asNumber = (value: unknown, fallback: number): number => {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Payroll record ID is required' }, { status: 400 })
    }

    const existing = await db.payrollRecord.findUnique({
      where: { id },
      select: {
        basicSalary: true,
        allowances: true,
        deductions: true,
        overtime: true,
        bonus: true
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    const body = await request.json()

    const nextValues = {
      basicSalary: asNumber(body.basicSalary, existing.basicSalary),
      allowances: asNumber(body.allowances, existing.allowances),
      deductions: asNumber(body.deductions, existing.deductions),
      overtime: asNumber(body.overtime, existing.overtime),
      bonus: asNumber(body.bonus, existing.bonus)
    }

    const netSalary =
      nextValues.basicSalary +
      nextValues.allowances +
      nextValues.overtime +
      nextValues.bonus -
      nextValues.deductions

    const updated = await db.payrollRecord.update({
      where: { id },
      data: {
        ...nextValues,
        netSalary
      },
      include: payrollIncludes
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating payroll record:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
