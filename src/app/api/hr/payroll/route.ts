interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { PayrollStatus } from '@prisma/client'

import { db } from '@/lib/db'
import { PayrollProcessor } from '@/lib/payroll-processor'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7) // YYYY-MM

    const payrollRecords = await db.payrollRecord.findMany({
      where: {
        period
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
        batch: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(payrollRecords)
  } catch (error) {
    console.error('Error fetching payroll records:', error)
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
      period,
      basicSalary,
      allowances,
      deductions,
      overtime,
      bonus
    } = body

    const parsedBasicSalary = Number.parseFloat(basicSalary)

    if (!Number.isFinite(parsedBasicSalary)) {
      return NextResponse.json({ error: 'Invalid salary values provided' }, { status: 400 })
    }
    const parsedAllowances = Number.isFinite(Number.parseFloat(allowances)) ? Number.parseFloat(allowances) : 0
    const parsedDeductions = Number.isFinite(Number.parseFloat(deductions)) ? Number.parseFloat(deductions) : 0
    const parsedOvertime = Number.isFinite(Number.parseFloat(overtime)) ? Number.parseFloat(overtime) : 0
    const parsedBonus = Number.isFinite(Number.parseFloat(bonus)) ? Number.parseFloat(bonus) : 0

    const netSalary = parsedBasicSalary + parsedAllowances + parsedOvertime + parsedBonus - parsedDeductions

    const processor = new PayrollProcessor()

    const payrollRecord = await processor.createPayrollRecord(
      {
        employeeId,
        period,
        basicSalary: parsedBasicSalary,
        allowances: parsedAllowances,
        deductions: parsedDeductions,
        overtime: parsedOvertime,
        bonus: parsedBonus,
        netSalary
      },
      user.id
    )

    return NextResponse.json(payrollRecord)
  } catch (error) {
    console.error('Error creating payroll record:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!Object.values(PayrollStatus).includes(status as PayrollStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const processor = new PayrollProcessor()

    const payrollRecord = await processor.updatePayrollRecordStatus(id, status as PayrollStatus, user.id)

    return NextResponse.json(payrollRecord)
  } catch (error) {
    console.error('Error updating payroll record:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}