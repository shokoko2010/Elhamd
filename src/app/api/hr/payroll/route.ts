interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

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

    if (!employeeId || !period) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const numericBasic = Number(basicSalary) || 0
    const numericAllowances = Number(allowances) || 0
    const numericDeductions = Number(deductions) || 0
    const numericOvertime = Number(overtime) || 0
    const numericBonus = Number(bonus) || 0

    const netSalary = numericBasic + numericAllowances + numericOvertime + numericBonus - numericDeductions

    const includeConfig = {
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
      }

    const existingRecord = await db.payrollRecord.findUnique({
      where: {
        employeeId_period: {
          employeeId,
          period
        }
      },
      include: includeConfig
    })

    if (existingRecord) {
      return NextResponse.json({ ...existingRecord, existing: true })
    }

    const payrollRecord = await db.payrollRecord.create({
      data: {
        employeeId,
        period,
        basicSalary: numericBasic,
        allowances: numericAllowances,
        deductions: numericDeductions,
        overtime: numericOvertime,
        bonus: numericBonus,
        netSalary,
        createdBy: user.id
      },
      include: includeConfig
    })

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

    const payrollRecord = await db.payrollRecord.update({
      where: { id },
      data: {
        status,
        approvedBy: status === 'APPROVED' ? user.id : undefined,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        payDate: status === 'PAID' ? new Date() : undefined
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
        }
      }
    })

    return NextResponse.json(payrollRecord)
  } catch (error) {
    console.error('Error updating payroll record:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}