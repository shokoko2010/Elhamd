import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.permissions.includes(PERMISSIONS.VIEW_USERS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100') // Increased default limit to show all employees
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build where clause - show all staff roles
    const where: any = {
      role: {
        in: [UserRole.STAFF, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.SUPER_ADMIN]
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }
    
    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true'
    }

    const [employees, total] = await Promise.all([
      db.user.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ])

    // Calculate additional fields and format data
    const employeesWithStats = employees.map(user => ({
      id: user.id,
      employeeNumber: user.employee?.employeeNumber || `EMP${user.id.slice(-4).toUpperCase()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      department: user.employee?.department || null,
      position: user.employee?.position || null,
      hireDate: user.employee?.hireDate || user.createdAt,
      salary: user.employee?.salary || 0,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      branch: user.employee?.branch || null,
      role: user.role,
      permissions: user.permissions,
      totalBookings: (user._count.testDriveBookings || 0) + (user._count.serviceBookings || 0),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      employees: employeesWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الموظفين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.permissions.includes(PERMISSIONS.CREATE_USERS)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, email, phone, role = UserRole.STAFF, department, position, salary, branchId } = body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل' },
        { status: 400 }
      )
    }

    // Create user with staff role
    const newUser = await db.user.create({
      data: {
        name,
        email,
        phone,
        role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    })

    // If department and position are provided, create employee record
    if (department && position) {
      try {
        // Find or create department
        let deptRecord = await db.department.findFirst({
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

        // Find or create position
        let positionRecord = await db.position.findFirst({
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

        // Create employee record
        const employeeNumber = `EMP${String(newUser.id.slice(-4)).padStart(4, '0').toUpperCase()}`
        
        await db.employee.create({
          data: {
            employeeNumber,
            userId: newUser.id,
            departmentId: deptRecord.id,
            positionId: positionRecord.id,
            salary: salary || 0,
            hireDate: new Date(),
            status: 'ACTIVE',
            branchId: branchId || null
          }
        })
      } catch (error) {
        console.error('Error creating employee record:', error)
        // Continue even if employee record creation fails
      }
    }

    return NextResponse.json({ employee: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الموظف' },
      { status: 500 }
    )
  }
}