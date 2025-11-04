import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { EmployeeFinanceService } from '@/lib/employee-finance-service'
import { fetchEmployeeWithDetails } from '@/lib/employee-response'
import { EmployeeStatus } from '@prisma/client'
import { z } from 'zod'

const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  email: z.string().trim().email('البريد الإلكتروني غير صالح').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z
    .union([
      z.string(),
      z.number()
    ])
    .optional()
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => val === undefined || (typeof val === 'number' && !isNaN(val) && val > 0), 'الراتب يجب أن يكون أكبر من صفر'),
  branchId: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  notes: z.string().optional(),
  bankAccount: z.string().optional(),
  taxNumber: z.string().optional(),
  insuranceNumber: z.string().optional(),
  status: z.nativeEnum(EmployeeStatus).optional()
})

type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

const cleanOptionalString = (value?: string | null) => {
  if (value === undefined || value === null) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

async function resolveEmployeeId(paramId: string) {
  if (paramId === 'me') {
    const authUser = await getAuthUser()

    if (!authUser) {
      return { error: 'Unauthorized', status: 401 as const }
    }

    const employee = await db.employee.findUnique({
      where: { userId: authUser.id }
    })

    if (!employee) {
      return { error: 'الموظف غير موجود', status: 404 as const }
    }

    return { id: employee.id }
  }

  return { id: paramId }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolved = await resolveEmployeeId(params.id)

    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const employee = await fetchEmployeeWithDetails(resolved.id)

    if (!employee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الموظف' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsedData = updateEmployeeSchema.parse(body) as UpdateEmployeeInput
    const validatedData = {
      ...parsedData,
      name: cleanOptionalString(parsedData.name),
      email: cleanOptionalString(parsedData.email),
      phone: cleanOptionalString(parsedData.phone),
      department: cleanOptionalString(parsedData.department),
      position: cleanOptionalString(parsedData.position),
      branchId: cleanOptionalString(parsedData.branchId),
      emergencyContactName: cleanOptionalString(parsedData.emergencyContactName),
      emergencyContactPhone: cleanOptionalString(parsedData.emergencyContactPhone),
      emergencyContactRelationship: cleanOptionalString(parsedData.emergencyContactRelationship),
      notes: cleanOptionalString(parsedData.notes),
      bankAccount: cleanOptionalString(parsedData.bankAccount),
      taxNumber: cleanOptionalString(parsedData.taxNumber),
      insuranceNumber: cleanOptionalString(parsedData.insuranceNumber)
    }

    const resolved = await resolveEmployeeId(params.id)

    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { id: resolved.id },
      include: { user: true }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already used
    if (validatedData.email && validatedData.email !== existingEmployee.user.email) {
      const emailExists = await db.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // Update user data if provided
    if (validatedData.name || validatedData.email || validatedData.phone) {
      await db.user.update({
        where: { id: existingEmployee.userId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.email && { email: validatedData.email }),
          ...(validatedData.phone !== undefined && { phone: validatedData.phone })
        }
      })
    }

    // Update employee data
    const updateData: any = {}

    if (validatedData.department) {
      let department = await db.department.findFirst({
        where: { name: validatedData.department }
      })

      if (!department) {
        department = await db.department.create({
          data: {
            name: validatedData.department,
            description: `قسم ${validatedData.department}`,
            isActive: true
          }
        })
      }

      updateData.departmentId = department.id
    }

    if (validatedData.position) {
      const departmentId = updateData.departmentId || existingEmployee.departmentId

      if (departmentId) {
        let position = await db.position.findFirst({
          where: {
            title: validatedData.position,
            departmentId
          }
        })

        if (!position) {
          position = await db.position.create({
            data: {
              title: validatedData.position,
              departmentId,
              level: 'JUNIOR',
              description: `منصب ${validatedData.position}`,
              isActive: true
            }
          })
        }

        updateData.positionId = position.id
      }
    }

    if (validatedData.salary !== undefined) updateData.salary = validatedData.salary
    if (validatedData.branchId !== undefined) updateData.branchId = validatedData.branchId || null
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.bankAccount !== undefined) updateData.bankAccount = validatedData.bankAccount
    if (validatedData.taxNumber !== undefined) updateData.taxNumber = validatedData.taxNumber
    if (validatedData.insuranceNumber !== undefined) updateData.insuranceNumber = validatedData.insuranceNumber
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    if (
      validatedData.emergencyContactName !== undefined ||
      validatedData.emergencyContactPhone !== undefined ||
      validatedData.emergencyContactRelationship !== undefined
    ) {
      updateData.emergencyContact = validatedData.emergencyContactName
        ? {
            name: validatedData.emergencyContactName,
            phone: validatedData.emergencyContactPhone || '',
            relationship: validatedData.emergencyContactRelationship || ''
          }
        : null
    }

    const updatedEmployee = await db.employee.update({
      where: { id: resolved.id },
      data: updateData
    })

    const employeeName = validatedData.name || existingEmployee.user.name || existingEmployee.employeeNumber

    await EmployeeFinanceService.syncEmployeeAccounts({
      employeeId: updatedEmployee.id,
      employeeNumber: existingEmployee.employeeNumber,
      employeeName,
      branchId: updatedEmployee.branchId,
      payrollExpenseAccountId: updatedEmployee.payrollExpenseAccountId,
      payrollLiabilityAccountId: updatedEmployee.payrollLiabilityAccountId
    })

    const detailedEmployee = await fetchEmployeeWithDetails(updatedEmployee.id)

    return NextResponse.json(detailedEmployee)
  } catch (error) {
    console.error('Error updating employee:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث بيانات الموظف' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if employee exists
    const existingEmployee = await db.employee.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    // Update employee status to TERMINATED instead of deleting
    await db.employee.update({
      where: { id: params.id },
      data: { status: EmployeeStatus.TERMINATED }
    })

    // Deactivate user account
    await db.user.update({
      where: { id: existingEmployee.userId },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'تم إنهاء خدمة الموظف بنجاح' })
  } catch (error) {
    console.error('Error terminating employee:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنهاء خدمة الموظف' },
      { status: 500 }
    )
  }
}