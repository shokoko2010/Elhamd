import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { PermissionService } from '@/lib/permissions'

// This endpoint should only be accessible during initial setup
// or by existing super admins with additional security
export async function POST(request: NextRequest) {
  try {
    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
        }
      }
    })

    if (existingAdmin) {
      // If admin exists, require authentication and super admin role
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'غير مصرح بالوصول' },
          { status: 401 }
        )
      }

      // Check if current user is super admin
      const currentUser = await db.user.findUnique({
        where: { id: session.user.id }
      })

      if (!currentUser || currentUser.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.json(
          { error: 'فقط المشرفين الرئيسيين يمكنهم إنشاء مشرفين جدد' },
          { status: 403 }
        )
      }

      // Additional security: Check if user has manage_permissions
      const hasPermission = await PermissionService.hasPermission(
        session.user.id,
        'manage_permissions'
      )

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'ليس لديك الصلاحيات المطلوبة' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { email, name, password, role = UserRole.ADMIN, setupToken } = body

    // Additional security for initial setup
    if (!existingAdmin && !setupToken) {
      return NextResponse.json(
        { error: 'مفتاح الإعداد مطلوب لإنشاء أول مشرف' },
        { status: 400 }
      )
    }

    // Validate setup token for initial setup
    if (!existingAdmin && setupToken !== process.env.SETUP_TOKEN) {
      return NextResponse.json(
        { error: 'مفتاح الإعداد غير صحيح' },
        { status: 401 }
      )
    }

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Strong password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        isActive: true,
        emailVerified: true
      }
    })

    // Initialize permissions and role templates if not already done
    try {
      await PermissionService.initializeDefaultPermissions()
      await PermissionService.initializeRoleTemplates()
    } catch (error) {
      // Silently handle initialization errors
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المستخدم الإداري بنجاح',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المستخدم الإداري'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    // Check if user is admin or super admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 403 }
      )
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
    return NextResponse.json({
      error: 'فشل في جلب قائمة المشرفين'
    }, { status: 500 })
  }
}