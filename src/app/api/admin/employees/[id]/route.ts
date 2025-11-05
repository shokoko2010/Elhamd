import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

interface RouteParams {
  params: { id: string }
}

async function resolveDepartmentAndPosition(departmentName?: string, positionTitle?: string) {
  let departmentId: string | undefined
  let positionId: string | undefined

  const trimmedDepartment = departmentName?.trim() || ''
  const trimmedPosition = positionTitle?.trim() || ''

  if (!trimmedDepartment && !trimmedPosition) {
    return { departmentId, positionId }
  }

  let departmentRecord = null

  if (trimmedDepartment) {
    departmentRecord = await db.department.findFirst({
      where: { name: trimmedDepartment }
    })

    if (!departmentRecord) {
      departmentRecord = await db.department.create({
        data: {
          name: trimmedDepartment,
          description: `قسم ${trimmedDepartment}`,
          isActive: true
        }
      })
    }

    departmentId = departmentRecord.id
  }

  if (trimmedPosition && departmentRecord) {
    let positionRecord = await db.position.findFirst({
      where: {
        title: trimmedPosition,
        departmentId: departmentRecord.id
      }
    })

    if (!positionRecord) {
      positionRecord = await db.position.create({
        data: {
          title: trimmedPosition,
          departmentId: departmentRecord.id,
          level: 'JUNIOR',
          description: `منصب ${trimmedPosition}`,
          isActive: true
        }
      })
    }

    positionId = positionRecord.id
  }

  return { departmentId, positionId }
}

function normalizeSalary(rawSalary: unknown) {
  if (rawSalary === undefined || rawSalary === null || rawSalary === '') {
    return undefined
  }

  const salaryNumber = typeof rawSalary === 'number' ? rawSalary : parseFloat(String(rawSalary))

  if (Number.isNaN(salaryNumber) || !Number.isFinite(salaryNumber)) {
    throw new Error('قيمة الراتب غير صالحة')
  }

  return salaryNumber
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.permissions.includes(PERMISSIONS.EDIT_USERS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, email, phone, isActive, role, department, position, salary, branchId, emergencyContactName, emergencyContactPhone, emergencyContactRelationship, notes } = body

    if (!name || !name.trim() || !email || !email.trim()) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 })
    }

    // Check if employee exists
    const existingEmployee = await db.user.findUnique({
      where: { id },
      include: {
        employee: true
      }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingEmployee.email) {
      const emailTaken = await db.user.findUnique({
        where: { email }
      })
      
      if (emailTaken) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      }
    }

    let salaryValue: number | undefined
    try {
      salaryValue = normalizeSalary(salary)
    } catch (validationError) {
      const message = validationError instanceof Error ? validationError.message : 'قيمة الراتب غير صالحة'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const notesValue = typeof notes === 'string' ? notes.trim() : notes
    const branchValue = branchId === undefined ? undefined : branchId === '' ? null : branchId

    const emergencyContactPayload =
      emergencyContactName !== undefined ||
      emergencyContactPhone !== undefined ||
      emergencyContactRelationship !== undefined
        ? {
            name: emergencyContactName?.trim() || existingEmployee.employee?.emergencyContact?.name || '',
            phone: emergencyContactPhone?.trim() || existingEmployee.employee?.emergencyContact?.phone || '',
            relationship: emergencyContactRelationship?.trim() || existingEmployee.employee?.emergencyContact?.relationship || ''
          }
        : undefined

    const { departmentId, positionId } = await resolveDepartmentAndPosition(department, position)

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          isActive: isActive !== undefined ? isActive : existingEmployee.isActive,
          role: role || existingEmployee.role
        }
      })

      if (!existingEmployee.employee) {
        if (departmentId || positionId || salaryValue !== undefined || branchValue || emergencyContactPayload || notesValue) {
          const employeeNumber = `EMP${String(id.slice(-4)).padStart(4, '0').toUpperCase()}`

          await tx.employee.create({
            data: {
              employeeNumber,
              userId: id,
              hireDate: new Date(),
              status: 'ACTIVE',
              departmentId: departmentId || null,
              positionId: positionId || null,
              salary: salaryValue !== undefined ? salaryValue : existingEmployee.employee?.salary || 0,
              branchId: branchValue,
              emergencyContact: emergencyContactPayload,
              notes: notesValue || existingEmployee.employee?.notes || null
            }
          })
        }

        return
      }

      const employeeUpdateData: any = {}

      if (salaryValue !== undefined) {
        employeeUpdateData.salary = salaryValue
      }

      if (branchValue !== undefined) {
        employeeUpdateData.branchId = branchValue
      }

      if (notesValue !== undefined) {
        employeeUpdateData.notes = notesValue || null
      }

      if (emergencyContactPayload) {
        const emptyContact =
          !emergencyContactPayload.name &&
          !emergencyContactPayload.phone &&
          !emergencyContactPayload.relationship

        employeeUpdateData.emergencyContact = emptyContact ? null : emergencyContactPayload
      }

      if (departmentId !== undefined) {
        employeeUpdateData.departmentId = departmentId || null
      }

      if (positionId !== undefined) {
        employeeUpdateData.positionId = positionId || null
      }

      if (Object.keys(employeeUpdateData).length > 0) {
        await tx.employee.update({
          where: { userId: id },
          data: employeeUpdateData
        })
      }
    })

    const updatedRecord = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            testDriveBookings: true,
            serviceBookings: true,
            permissions: true
          }
        },
        permissions: {
          include: {
            permission: true
          }
        },
        employee: {
          include: {
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
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!updatedRecord) {
      return NextResponse.json({ error: 'تعذر تحميل بيانات الموظف بعد التحديث' }, { status: 500 })
    }

    const updatedEmployee = {
      id: updatedRecord.id,
      employeeNumber: updatedRecord.employee?.employeeNumber || `EMP${updatedRecord.id.slice(-4).toUpperCase()}`,
      user: {
        id: updatedRecord.id,
        name: updatedRecord.name,
        email: updatedRecord.email,
        phone: updatedRecord.phone
      },
      department: updatedRecord.employee?.department || null,
      position: updatedRecord.employee?.position || null,
      hireDate: updatedRecord.employee?.hireDate || updatedRecord.createdAt,
      salary: updatedRecord.employee?.salary || 0,
      status: updatedRecord.isActive ? 'ACTIVE' : 'INACTIVE',
      branch: updatedRecord.employee?.branch || null,
      role: updatedRecord.role,
      permissions: updatedRecord.permissions,
      totalBookings: (updatedRecord._count.testDriveBookings || 0) + (updatedRecord._count.serviceBookings || 0),
      lastLoginAt: updatedRecord.lastLoginAt,
      createdAt: updatedRecord.createdAt,
      emergencyContact: updatedRecord.employee?.emergencyContact || null,
      notes: updatedRecord.employee?.notes || null
    }

    return NextResponse.json({
      message: 'تم تحديث بيانات الموظف بنجاح',
      employee: updatedEmployee
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الموظف' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.permissions.includes(PERMISSIONS.DELETE_USERS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    // Check if employee exists
    const existingEmployee = await db.user.findUnique({
      where: { id }
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })
    }

    // Delete employee record if exists
    await db.employee.deleteMany({
      where: { userId: id }
    })

    // Delete user
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف الموظف بنجاح' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الموظف' },
      { status: 500 }
    )
  }
}