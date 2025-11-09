interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole, Prisma } from '@prisma/client'
import { PERMISSIONS, Permission, PermissionService } from '@/lib/permissions'

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
          roleTemplateId: true,
          roleTemplate: {
            select: {
              id: true,
              name: true,
              role: true,
              isActive: true,
              isSystem: true
            }
          },
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
    const {
      email,
      name,
      role,
      phone,
      password,
      permissions = [],
      roleTemplateId,
      applyRoleTemplate = false,
      preserveManualPermissions = false
    } = body as {
      email?: string
      name?: string
      role?: UserRole
      phone?: string
      password?: string
      permissions?: Permission[]
      roleTemplateId?: string | null
      applyRoleTemplate?: boolean
      preserveManualPermissions?: boolean
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
    }

    let resolvedRole: UserRole = UserRole.CUSTOMER

    if (role) {
      if (!(Object.values(UserRole) as string[]).includes(role)) {
        return NextResponse.json({ error: 'دور غير صالح' }, { status: 400 })
      }
      resolvedRole = role
    }

    let templateRole: UserRole | null = null

    if (roleTemplateId) {
      const template = await db.roleTemplate.findUnique({
        where: { id: roleTemplateId },
        select: { id: true, role: true, isActive: true }
      })

      if (!template) {
        return NextResponse.json({ error: 'قالب الدور غير موجود' }, { status: 404 })
      }

      if (!template.isActive && user.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.json({ error: 'القالب غير مفعل' }, { status: 400 })
      }

      templateRole = template.role
      if (!role) {
        resolvedRole = template.role
      }
    }

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

    const hashedPassword = await bcrypt.hash(password, 12)
    const manualPermissions = Array.isArray(permissions)
      ? Array.from(new Set(permissions))
      : []

    const createdUser = await db.user.create({
      data: {
        email,
        name,
        role: resolvedRole,
        phone,
        password: hashedPassword,
        roleTemplateId: roleTemplateId ?? undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        roleTemplateId: true,
        createdAt: true
      }
    })

    if (applyRoleTemplate && roleTemplateId) {
      await PermissionService.applyTemplateToUser(createdUser.id, roleTemplateId, {
        grantedBy: user.id,
        additionalPermissions: manualPermissions,
        preserveManualPermissions
      })
    } else if (manualPermissions.length > 0) {
      await PermissionService.setUserPermissions(createdUser.id, manualPermissions, user.id)
    }

    if (!applyRoleTemplate && roleTemplateId && templateRole && resolvedRole !== templateRole) {
      await db.user.update({
        where: { id: createdUser.id },
        data: { role: templateRole }
      })
    }

    const userWithRelations = await db.user.findUnique({
      where: { id: createdUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        roleTemplateId: true,
        roleTemplate: {
          select: {
            id: true,
            name: true,
            role: true,
            isSystem: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({ user: userWithRelations }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء المستخدم' },
      { status: 500 }
    )
  }
}