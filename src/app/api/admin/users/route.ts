interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole, Prisma } from '@prisma/client'
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const isActive = searchParams.get('isActive')
    const scope = searchParams.get('scope') || ''

    const includeAllRoles = scope === 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.UserWhereInput = {}

    if (!includeAllRoles) {
      // For customers page, only show customers by default
      if (!role || role === 'all') {
        where.role = UserRole.CUSTOMER
      } else if (role !== 'all') {
        where.role = role as UserRole
      }
    } else if (role && role !== 'all') {
      where.role = role as UserRole
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

    const [users, total, metrics] = await Promise.all([
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({ where })
      ,
      (async () => {
        const [
          totalUsers,
          activeUsers,
          inactiveUsers,
          adminUsers,
          branchManagers
        ] = await Promise.all([
          db.user.count(),
          db.user.count({ where: { isActive: true } }),
          db.user.count({ where: { isActive: false } }),
          db.user.count({
            where: {
              role: {
                in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
              }
            }
          }),
          db.user.count({ where: { role: UserRole.BRANCH_MANAGER } })
        ])

        return {
          totalUsers,
          activeUsers,
          inactiveUsers,
          adminUsers,
          branchManagers
        }
      })()
    ])

    // Calculate additional fields for the frontend
    const usersWithStats = users.map(user => ({
      ...user,
      totalBookings: (user._count.testDriveBookings || 0) + (user._count.serviceBookings || 0),
      totalSpent: 0 // Calculate from bookings/invoices when implemented
    }))

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      metrics
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المستخدمين' },
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
    const { email, name, role, phone, permissions } = body

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

    // Create user
    const newUser = await db.user.create({
      data: {
        email,
        name,
        role: role || UserRole.CUSTOMER,
        phone
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

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      await db.userPermission.createMany({
        data: permissions.map((permissionId: string) => ({
          userId: newUser.id,
          permissionId
        }))
      })
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء المستخدم' },
      { status: 500 }
    )
  }
}