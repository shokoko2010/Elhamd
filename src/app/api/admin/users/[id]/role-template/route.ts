interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { PermissionService, PERMISSIONS, Permission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const actor = await getAuthUser()

    if (!actor) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const canManageRoles =
      actor.role === UserRole.SUPER_ADMIN ||
      actor.role === UserRole.ADMIN ||
      actor.permissions.includes(PERMISSIONS.MANAGE_USER_ROLES)

    if (!canManageRoles) {
      return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 })
    }

    const body = await request.json()
    const {
      roleTemplateId,
      additionalPermissions = [],
      preserveManualPermissions = false
    } = body as {
      roleTemplateId?: string
      additionalPermissions?: Permission[]
      preserveManualPermissions?: boolean
    }

    if (!roleTemplateId || typeof roleTemplateId !== 'string') {
      return NextResponse.json({ error: 'يجب تحديد قالب الدور' }, { status: 400 })
    }

    await PermissionService.applyTemplateToUser(id, roleTemplateId, {
      grantedBy: actor.id,
      additionalPermissions: Array.isArray(additionalPermissions)
        ? additionalPermissions
        : [],
      preserveManualPermissions: Boolean(preserveManualPermissions)
    })

    const refreshed = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
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
    console.error('Error applying role template', error)
    return NextResponse.json(
      { error: 'تعذر تطبيق قالب الدور' },
      { status: 500 }
    )
  }
}
