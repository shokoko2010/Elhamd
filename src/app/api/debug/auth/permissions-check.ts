import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check permissions count
    const permissionsCount = await db.permission.count()
    const roleTemplatesCount = await db.roleTemplate.count()
    const userPermissionsCount = await db.userPermission.count()
    
    // Get admin user
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    // Get all permissions
    const allPermissions = await db.permission.findMany()
    
    return NextResponse.json({
      stats: {
        permissionsCount,
        roleTemplatesCount,
        userPermissionsCount,
        adminUserFound: !!adminUser,
        adminUserPermissions: adminUser?.permissions.length || 0
      },
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions.map(up => up.permission.name)
      } : null,
      allPermissions: allPermissions.map(p => p.name)
    })
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}