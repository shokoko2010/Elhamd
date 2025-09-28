import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { PermissionService } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // For permissions initialization, we allow SUPER_ADMIN role to proceed
    // even if permissions don't exist yet (chicken-and-egg problem)
    if (user.role !== 'SUPER_ADMIN') {
      // If permissions exist, check for the required permission
      try {
        const hasPermission = await PermissionService.hasPermission(user.id, 'manage_system_settings')
        if (!hasPermission) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } catch (error) {
        // If permissions don't exist yet, only allow SUPER_ADMIN
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Initialize default permissions
    await PermissionService.initializeDefaultPermissions()
    
    // Initialize default role templates
    await PermissionService.initializeRoleTemplates()

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