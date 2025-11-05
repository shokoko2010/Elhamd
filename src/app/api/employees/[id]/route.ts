import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { EmployeeStatus } from '@prisma/client'
import { z } from 'zod'

const updateEmployeeSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  phone: z.string().optional(),
  department: z.string().min(1, 'القسم مطلوب').optional(),
  position: z.string().min(1, 'المنصب مطلوب').optional(),
  salary: z.string().transform((val) => parseFloat(val)).refine((val) => val > 0, 'الراتب يجب أن يكون أكبر من صفر').optional(),
  branchId: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await db.employee.findUnique({
      where: { id: params.id },
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
        }
      }
    })

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
    const validatedData = updateEmployeeSchema.parse(body)

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
    
    if (validatedData.department) updateData.department = validatedData.department
    if (validatedData.position) updateData.position = validatedData.position
    if (validatedData.salary !== undefined) updateData.salary = validatedData.salary
    if (validatedData.branchId !== undefined) updateData.branchId = validatedData.branchId || null
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    
    if (validatedData.emergencyContactName) {
      updateData.emergencyContact = {
        name: validatedData.emergencyContactName,
        phone: validatedData.emergencyContactPhone || '',
        relationship: validatedData.emergencyContactRelationship || ''
      }
    }

    const employee = await db.employee.update({
      where: { id: params.id },
      data: updateData,
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
        }
      }
    })

    return NextResponse.json(employee)
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