import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    // Check if user has employee role or higher
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        employee: {
          include: {
            branch: true
          }
        }
      }
    })

    if (!user || !['STAFF', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
    }

    // If no employee record exists, create one for staff/branch managers
    let employeeProfile = user.employee
    if (!employeeProfile && ['STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      employeeProfile = await db.employee.create({
        data: {
          userId: user.id,
          employeeNumber: `EMP${Date.now()}`,
          department: user.role === 'BRANCH_MANAGER' ? 'الإدارة' : 'المبيعات',
          position: user.role === 'BRANCH_MANAGER' ? 'مدير الفرع' : 'موظف',
          hireDate: new Date(),
          salary: 0, // Will be set by admin
          status: 'ACTIVE',
          branchId: user.branchId || null
        },
        include: {
          branch: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          }
        }
      })
    } else if (employeeProfile) {
      // Refresh employee data with user info
      employeeProfile = await db.employee.findUnique({
        where: { userId: user.id },
        include: {
          branch: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true
            }
          }
        }
      })
    }

    if (!employeeProfile) {
      return NextResponse.json(
        { error: 'بيانات الموظف غير متاحة' },
        { status: 404 }
      )
    }

    return NextResponse.json(employeeProfile)
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الموظف' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true }
    })

    if (!user || !user.employee) {
      return NextResponse.json(
        { error: 'بيانات الموظف غير متاحة' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { phone, emergencyContactName, emergencyContactPhone, emergencyContactRelationship, notes } = body

    // Update user phone
    await db.user.update({
      where: { id: user.id },
      data: { phone }
    })

    // Update employee profile
    const updatedEmployee = await db.employee.update({
      where: { id: user.employee.id },
      data: {
        emergencyContact: emergencyContactName ? {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relationship: emergencyContactRelationship
        } : undefined,
        notes
      },
      include: {
        branch: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    return NextResponse.json(
      { error: 'فشل في تحديث بيانات الموظف' },
      { status: 500 }
    )
  }
}