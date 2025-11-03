import { db } from '@/lib/db'

export async function fetchEmployeeWithDetails(employeeId: string) {
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true
        }
      },
      branch: {
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
      },
      position: {
        select: {
          id: true,
          title: true
        }
      },
      payrollExpenseAccount: {
        select: {
          id: true,
          code: true,
          name: true
        }
      },
      payrollLiabilityAccount: {
        select: {
          id: true,
          code: true,
          name: true
        }
      }
    }
  })

  if (!employee) {
    return null
  }

  const [leaveRequests, payrollRecords] = await Promise.all([
    db.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' }
    }),
    db.payrollRecord.findMany({
      where: { employeeId },
      orderBy: { period: 'desc' }
    })
  ])

  return {
    ...employee,
    leaveRequests,
    payrollRecords
  }
}
