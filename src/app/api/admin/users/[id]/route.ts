interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'
import { PermissionService, Permission } from '@/lib/permissions'
import { Prisma } from '@prisma/client'
import { getRoleLabelAr, getRoleTemplateNameAr } from '@/lib/permission-translations'

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
        roleTemplate: {
          select: {
            id: true,
            name: true,
            role: true,
            isSystem: true,
            isActive: true
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

    return NextResponse.json({
      user: {
        ...user,
        roleLabel: getRoleLabelAr(user.role),
        roleTemplateNameAr: user.roleTemplate
          ? getRoleTemplateNameAr(user.roleTemplate.name, user.roleTemplate.role)
          : null,
        roleTemplateRoleLabel: user.roleTemplate?.role
          ? getRoleLabelAr(user.roleTemplate.role)
          : null,
      },
    })
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
    const {
      email,
      name,
      role,
      phone,
      isActive,
      permissions,
      roleTemplateId,
      applyRoleTemplate,
      preserveManualPermissions,
      additionalPermissions
    } = body as {
      email?: string
      name?: string
      role?: UserRole
      phone?: string
      isActive?: boolean
      permissions?: Permission[]
      roleTemplateId?: string | null
      applyRoleTemplate?: boolean
      preserveManualPermissions?: boolean
      additionalPermissions?: Permission[]
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

    // Check if email is already taken by another user when explicitly provided
    if (typeof email === 'string' && email !== existingUser.email) {
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
    const templateToApply = roleTemplateId
      ? await db.roleTemplate.findUnique({
          where: { id: roleTemplateId },
          select: { id: true, role: true, isActive: true }
        })
      : null

    if (roleTemplateId && !templateToApply) {
      return NextResponse.json(
        { error: 'قالب الدور غير موجود' },
        { status: 404 }
      )
    }

    const data: Prisma.UserUpdateInput = {
      email: email ?? existingUser.email,
      name: name ?? existingUser.name,
      role: role ?? existingUser.role,
      phone: phone ?? existingUser.phone,
      isActive: typeof isActive === 'boolean' ? isActive : existingUser.isActive
    }

    if (roleTemplateId !== undefined) {
      if (roleTemplateId === null) {
        data.roleTemplate = { disconnect: true }
      } else {
        data.roleTemplate = { connect: { id: roleTemplateId } }
        if (!role && templateToApply) {
          data.role = templateToApply.role
        }
      }
    }

    await db.user.update({
      where: { id },
      data
    })

    if (applyRoleTemplate && templateToApply) {
      await PermissionService.applyTemplateToUser(id, templateToApply.id, {
        grantedBy: auth.user?.id,
        additionalPermissions: Array.isArray(additionalPermissions)
          ? additionalPermissions
          : Array.isArray(permissions)
            ? permissions
            : [],
        preserveManualPermissions: Boolean(preserveManualPermissions)
      })
    } else if (permissions !== undefined) {
      await PermissionService.setUserPermissions(id, permissions ?? [], auth.user?.id)
    }

    if (!applyRoleTemplate && templateToApply && !role) {
      await db.user.update({
        where: { id },
        data: { role: templateToApply.role }
      })
    }

    const refreshed = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true,
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

    return NextResponse.json({ user: refreshed })
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