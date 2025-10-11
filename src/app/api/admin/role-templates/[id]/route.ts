interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions, getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db'
import { PermissionService } from '@/lib/permissions'

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const user = await getAuthUser()
    const templateId = id
    const { name, description, role, permissions } = await request.json()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has permission to manage role templates
    // For SUPER_ADMIN, allow access even if permissions don't exist yet
    if (user.role !== 'SUPER_ADMIN') {
      try {
        const hasPermission = await PermissionService.hasPermission(user.id, 'manage_roles_templates')
        if (!hasPermission) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } catch (error) {
        // If permissions don't exist yet, only allow SUPER_ADMIN
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Check if template exists and is not a system template
    const template = await db.roleTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (template.isSystem) {
      return NextResponse.json({ error: 'Cannot modify system templates' }, { status: 403 })
    }

    // Validate input
    if (!name || !role || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    // Update template
    const updatedTemplate = await db.roleTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        role,
        permissions: JSON.stringify(permissions)
      }
    })

    return NextResponse.json({ 
      message: 'Role template updated successfully',
      template: {
        ...updatedTemplate,
        permissions
      }
    })
  } catch (error) {
    console.error('Error updating role template:', error)
    return NextResponse.json(
      { error: 'Failed to update role template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const user = await getAuthUser()
    const templateId = id

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has permission to manage role templates
    // For SUPER_ADMIN, allow access even if permissions don't exist yet
    if (user.role !== 'SUPER_ADMIN') {
      try {
        const hasPermission = await PermissionService.hasPermission(user.id, 'manage_roles_templates')
        if (!hasPermission) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } catch (error) {
        // If permissions don't exist yet, only allow SUPER_ADMIN
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Check if template exists and is not a system template
    const template = await db.roleTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (template.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system templates' }, { status: 403 })
    }

    // Delete template
    await db.roleTemplate.delete({
      where: { id: templateId }
    })

    return NextResponse.json({ message: 'Role template deleted successfully' })
  } catch (error) {
    console.error('Error deleting role template:', error)
    return NextResponse.json(
      { error: 'Failed to delete role template' },
      { status: 500 }
    )
  }
}