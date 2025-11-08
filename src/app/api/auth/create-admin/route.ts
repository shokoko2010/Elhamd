import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { PermissionService } from '@/lib/permissions'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const setupToken = process.env.INITIAL_ADMIN_TOKEN

    if (!setupToken) {
      console.error('INITIAL_ADMIN_TOKEN is not configured')
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 })
    }

    const providedToken = request.headers.get('x-setup-token') || null

    if (!providedToken || providedToken !== setupToken) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 })
    }

    const existingAdmin = await db.user.count({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        }
      }
    })

    if (existingAdmin > 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin user already exists'
      }, { status: 409 })
    }

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.toLowerCase() : null
    const password = typeof body.password === 'string' ? body.password : null
    const name = typeof body.name === 'string' ? body.name : 'Default Admin'

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    if (password.length < 12) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 12 characters long'
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        emailVerified: true
      }
    })

    try {
      await PermissionService.initializeDefaultPermissions()
      await PermissionService.initializeRoleTemplates()
    } catch (error) {
      console.error('Error initializing permissions:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Default admin user created successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      const hasPermission = await PermissionService.hasPermission(user.id, 'view_users')
      if (!hasPermission) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const admins = await db.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      admins,
      count: admins.length
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}