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
        }
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
        console.error('Error parsing role permissions:', error)
      }
    }

    // Combine and deduplicate permissions
    const allPermissions = [...new Set([...userPermissions, ...rolePermissions])]
    
    return allPermissions
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}