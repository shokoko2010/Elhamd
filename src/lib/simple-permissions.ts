import { db } from '@/lib/db'

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    console.log('🔍 Getting permissions for user:', userId)
    
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
      console.log('❌ User not found')
      return []
    }

    console.log('✅ User found:', user.email, 'Role:', user.role)

    // Get permissions from user permissions
    const userPermissions = user.permissions.map(p => p.permission.name)
    console.log('🔑 User permissions:', userPermissions)

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
        console.log('🔑 Role permissions:', rolePermissions)
      } catch (error) {
        console.error('Error parsing role permissions:', error)
      }
    }

    // If no permissions found, give default permissions based on role
    if (userPermissions.length === 0 && rolePermissions.length === 0) {
      console.log('🔑 Using default permissions for role:', user.role)
      switch (user.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          return ['*'] // All permissions
        case 'BRANCH_MANAGER':
          return ['VIEW_EMPLOYEES', 'MANAGE_EMPLOYEES', 'VIEW_PAYROLL', 'MANAGE_PAYROLL']
        case 'STAFF':
          return ['VIEW_EMPLOYEES']
        default:
          return []
      }
    }

    // Combine and deduplicate permissions
    const allPermissions = [...new Set([...userPermissions, ...rolePermissions])]
    console.log('🔑 Final permissions:', allPermissions)
    
    return allPermissions
  } catch (error) {
    console.error('❌ Error getting user permissions:', error)
    return []
  }
}