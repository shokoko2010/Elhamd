interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    
    // Check authentication
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
    if (auth.error) {
      return auth.error
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            testDriveBookings: true,
            serviceBookings: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المستخدم' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    
    // Check authentication
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
    if (auth.error) {
      return auth.error
    }
    
    const body = await request.json()
    const { email, name, role, phone, isActive, permissions } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailTaken = await db.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        email,
        name,
        role,
        phone,
        isActive
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true
      }
    })

    // Update permissions if provided
    if (permissions !== undefined) {
      // Remove existing permissions
      await db.userPermission.deleteMany({
        where: { userId: id }
      })

      // Add new permissions
      if (permissions.length > 0) {
        await db.userPermission.createMany({
          data: permissions.map((permissionId: string) => ({
            userId: id,
            permissionId
          }))
        })
      }
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث المستخدم' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    
    // Check authentication
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
    if (auth.error) {
      return auth.error
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Delete user permissions first
    await db.userPermission.deleteMany({
      where: { userId: id }
    })

    // Delete user
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف المستخدم بنجاح' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المستخدم' },
      { status: 500 }
    )
  }
}