interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PermissionsService } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // For permissions initialization, we allow SUPER_ADMIN role to proceed
    // even if permissions don't exist yet (chicken-and-egg problem)
    if (session.user.role !== 'SUPER_ADMIN') {
      // If permissions exist, check for the required permission
      try {
        const hasPermission = await PermissionsService.hasPermission(session.user.id, 'manage_system_settings')
        if (!hasPermission) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } catch (error) {
        // If permissions don't exist yet, only allow SUPER_ADMIN
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Initialize default permissions
    await PermissionsService.initializeDefaultPermissions()
    
    // Initialize default role templates
    await PermissionsService.initializeRoleTemplates()

    return NextResponse.json({ 
      message: 'Permissions and role templates initialized successfully' 
    })
  } catch (error) {
    console.error('Error initializing permissions:', error)
    return NextResponse.json(
      { error: 'Failed to initialize permissions' },
      { status: 500 }
    )
  }
}