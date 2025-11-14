interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { SalaryAdvanceStatus } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

const payrollInclude = {
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

const advanceInclude = {
  employee: {
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      }
    }
  },
  requester: {
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

const buildDefaultStats = () => ({
  totalPayroll: 0,
  employeeCount: 0,
  averageSalary: 0,
  pendingCount: 0,
  totalAllowances: 0,
  totalDeductions: 0,
  totalOvertime: 0,
  totalBonus: 0,
  statusBreakdown: {
    PENDING: 0,
    APPROVED: 0,
    PAID: 0
  }
})

const cleanDuplicatePayrollRecords = async () => {
  const duplicates = await db.payrollRecord.groupBy({
    by: ['employeeId', 'period'],
    _count: {
      _all: true
    },
    having: {
      _count: {
        _all: {
          gt: 1
        }
      }
    }
  })

  if (!duplicates.length) {
    return
  }

  for (const duplicate of duplicates) {
    const records = await db.payrollRecord.findMany({
      where: {
        employeeId: duplicate.employeeId,
        period: duplicate.period
      },
      select: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const [, ...recordsToRemove] = records
    if (recordsToRemove.length) {
      await db.payrollRecord.deleteMany({
        where: {
          id: {
            in: recordsToRemove.map((record) => record.id)
          }
        }
      })
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7) // YYYY-MM

    await cleanDuplicatePayrollRecords()

    const payrollRecords = await db.payrollRecord.findMany({
      where: {
        period
      },
      include: payrollInclude,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const stats = payrollRecords.reduce((acc, record) => {
      const allowancesTotal = record.allowances + record.overtime + record.bonus

      acc.totalPayroll += record.netSalary
      acc.totalAllowances += allowancesTotal
      acc.totalDeductions += record.deductions
      acc.totalOvertime += record.overtime
      acc.totalBonus += record.bonus

      if (record.status === 'PENDING' || record.status === 'APPROVED' || record.status === 'PAID') {
        acc.statusBreakdown[record.status] += 1
      }

      return acc
    }, buildDefaultStats())

    stats.employeeCount = payrollRecords.length
    stats.averageSalary = stats.employeeCount > 0 ? stats.totalPayroll / stats.employeeCount : 0
    stats.pendingCount = stats.statusBreakdown.PENDING

    const employeeIds = payrollRecords.map((record) => record.employeeId)

    let advanceSummary = {
      totalAmount: 0,
      totalCount: 0,
      pendingCount: 0,
      byEmployee: {} as Record<string, { total: number; pending: number; approved: number }>,
      recent: [] as Array<{
        id: string
        employeeName: string
        amount: number
        status: SalaryAdvanceStatus
        requestedAt: string
      }>
    }

    if (employeeIds.length) {
      const [aggregate, pendingCount, totalsByEmployee, recentAdvances] = await Promise.all([
        db.salaryAdvance.aggregate({
          where: {
            employeeId: {
              in: employeeIds
            }
          },
          _sum: {
            amount: true
          },
          _count: {
            _all: true
          }
        }),
        db.salaryAdvance.count({
          where: {
            employeeId: {
              in: employeeIds
            },
            status: 'PENDING'
          }
        }),
        db.salaryAdvance.groupBy({
          by: ['employeeId', 'status'],
          where: {
            employeeId: {
              in: employeeIds
            }
          },
          _sum: {
            amount: true
          }
        }),
        db.salaryAdvance.findMany({
          where: {
            employeeId: {
              in: employeeIds
            }
          },
          include: advanceInclude,
          orderBy: {
            requestedAt: 'desc'
          },
          take: 5
        })
      ])

      const groupedByEmployee = totalsByEmployee.reduce(
        (acc, item) => {
          const existing = acc[item.employeeId] || { total: 0, pending: 0, approved: 0 }
          const amount = item._sum.amount ?? 0

          existing.total += amount
          if (item.status === 'PENDING') {
            existing.pending += amount
          }
          if (item.status === 'APPROVED') {
            existing.approved += amount
          }

          acc[item.employeeId] = existing
          return acc
        },
        {} as Record<string, { total: number; pending: number; approved: number }>
      )

      advanceSummary = {
        totalAmount: aggregate._sum.amount ?? 0,
        totalCount: aggregate._count._all ?? 0,
        pendingCount,
        byEmployee: groupedByEmployee,
        recent: recentAdvances.map((advance) => ({
          id: advance.id,
          employeeName: advance.employee.user?.name ?? '—',
          amount: advance.amount,
          status: advance.status,
          requestedAt: advance.requestedAt.toISOString()
        }))
      }
    }

    return NextResponse.json({
      records: payrollRecords,
      stats,
      advances: advanceSummary
    })
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

    const parsedBasicSalary = parseFloat(basicSalary)
    const parsedAllowances = parseFloat(allowances) || 0
    const parsedDeductions = parseFloat(deductions) || 0
    const parsedOvertime = parseFloat(overtime) || 0
    const parsedBonus = parseFloat(bonus) || 0
    const netSalary = parsedBasicSalary + parsedAllowances + parsedOvertime + parsedBonus - parsedDeductions

    const includeConfig = payrollInclude

    const existingRecord = await db.payrollRecord.findFirst({
      where: {
        employeeId,
        period
      },
      include: includeConfig
    })

    if (existingRecord) {
      return NextResponse.json(existingRecord)
    }

    const payrollRecord = await db.payrollRecord.create({
      data: {
        employeeId,
        period,
        basicSalary: parsedBasicSalary,
        allowances: parsedAllowances,
        deductions: parsedDeductions,
        overtime: parsedOvertime,
        bonus: parsedBonus,
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