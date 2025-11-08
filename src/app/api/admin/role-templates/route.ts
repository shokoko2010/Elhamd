interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { PermissionService } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
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

    const templates = await db.roleTemplate.findMany({
      include: {
        roleTemplatePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const templatesWithPermissions = templates.map(template => ({
      ...template,
      permissions: template.roleTemplatePermissions.map(rtp => rtp.permission.name)
    }))

    return NextResponse.json({ templates: templatesWithPermissions })
  } catch (error) {
    console.error('Error fetching role templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { name, description, role, permissions } = await request.json()

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

    // Validate input
    if (!name || !role || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    // Create role template
    const template = await db.roleTemplate.create({
      data: {
        name,
        description,
        role,
        permissions,
        isSystem: false
      }
    })

    // Add permissions to template
    for (const permissionName of permissions) {
      const permission = await db.permission.findUnique({
        where: { name: permissionName }
      })

      if (permission) {
        await db.roleTemplatePermission.create({
          data: {
            templateId: template.id,
            permissionId: permission.id
          }
        })
      }
    }

    return NextResponse.json({ 
      message: 'Role template created successfully',
      template: {
        ...template,
        permissions
      }
    })
  } catch (error) {
    console.error('Error creating role template:', error)
    return NextResponse.json(
      { error: 'Failed to create role template' },
      { status: 500 }
    )
  }
}