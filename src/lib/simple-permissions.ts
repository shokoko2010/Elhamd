import { db } from '@/lib/db'

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        roleTemplate: true
      }
    })

    if (!user) {
      return []
    }

    // Get permissions from user permissions
    const userPermissions = user.permissions.map(p => p.permission.name)

    // Get permissions from role template if exists
    let rolePermissions: string[] = []
    if (user.roleTemplate?.permissions) {
      try {
        const parsedPermissions = typeof user.roleTemplate.permissions === 'string' 
          ? JSON.parse(user.roleTemplate.permissions) 
          : user.roleTemplate.permissions
        
        const permissionRecords = await db.permission.findMany({
          where: { id: { in: parsedPermissions } },
          select: { name: true }
        })
        
        rolePermissions = permissionRecords.map(p => p.name)
      } catch (error) {
        // Silently handle parsing errors
      }
    }

    // If no permissions found, give default permissions based on role
    if (userPermissions.length === 0 && rolePermissions.length === 0) {
      switch (user.role) {
        case 'SUPER_ADMIN':
          return ['*'] // All permissions for super admin only
        case 'ADMIN':
          return [
            'view_dashboard', 'manage_users', 'view_permissions', 
            'manage_permissions', 'view_vehicles', 'manage_vehicles'
          ]
        case 'BRANCH_MANAGER':
          return ['view_employees', 'manage_employees', 'view_payroll', 'manage_branch']
        case 'STAFF':
          return ['view_vehicles', 'view_customers']
        default:
          return []
      }
    }

    // Combine and deduplicate permissions
    const allPermissions = [...new Set([...userPermissions, ...rolePermissions])]
    
    return allPermissions
  } catch (error) {
    // Return empty permissions on error instead of logging sensitive data
    return []
  }
}