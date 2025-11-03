import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
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

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        isActive: isActive !== undefined ? isActive : existingEmployee.isActive,
        role: role || existingEmployee.role
      }
    })

    // Update employee record if it exists
    if (existingEmployee.employee) {
      const employeeUpdateData: any = {}
      
      if (salary !== undefined) employeeUpdateData.salary = parseFloat(salary)
      if (branchId !== undefined) employeeUpdateData.branchId = branchId || null
      if (notes !== undefined) employeeUpdateData.notes = notes
      
      if (emergencyContactName !== undefined || emergencyContactPhone !== undefined || emergencyContactRelationship !== undefined) {
        employeeUpdateData.emergencyContact = {
          name: emergencyContactName || existingEmployee.employee.emergencyContact?.name || '',
          phone: emergencyContactPhone || existingEmployee.employee.emergencyContact?.phone || '',
          relationship: emergencyContactRelationship || existingEmployee.employee.emergencyContact?.relationship || ''
        }
      }

      // Handle department and position updates
      if (department !== undefined || position !== undefined) {
        let deptRecord = null
        let positionRecord = null

        if (department) {
          deptRecord = await db.department.findFirst({
            where: { name: department }
          })
          
          if (!deptRecord) {
            deptRecord = await db.department.create({
              data: {
                name: department,
                description: `قسم ${department}`,
                isActive: true
              }
            })
          }

          employeeUpdateData.departmentId = deptRecord.id
        }

        if (position && deptRecord) {
          positionRecord = await db.position.findFirst({
            where: { 
              title: position,
              departmentId: deptRecord.id 
            }
          })
          
          if (!positionRecord) {
            positionRecord = await db.position.create({
              data: {
                title: position,
                departmentId: deptRecord.id,
                level: 'JUNIOR',
                description: `منصب ${position}`,
                isActive: true
              }
            })
          }

          employeeUpdateData.positionId = positionRecord.id
        }
      }

      if (Object.keys(employeeUpdateData).length > 0) {
        await db.employee.update({
          where: { userId: id },
          data: employeeUpdateData
        })
      }
    }

    return NextResponse.json({ employee: updatedUser })
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
    const { id } = await params
    
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