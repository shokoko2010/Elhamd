import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { PermissionService } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Creating default admin user ===')
    
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        }
      }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        admin: {
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const admin = await db.user.create({
      data: {
        email: 'admin@elhamd.com',
        name: 'Default Admin',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        emailVerified: true
      }
    })

    console.log('Admin user created:', admin.email)

    // Initialize permissions and role templates
    try {
      await PermissionService.initializeDefaultPermissions()
      await PermissionService.initializeRoleTemplates()
      console.log('Permissions and role templates initialized')
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
      },
      loginCredentials: {
        email: 'admin@elhamd.com',
        password: 'admin123'
      }
    })
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