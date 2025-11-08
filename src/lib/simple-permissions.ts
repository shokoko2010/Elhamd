import { db } from '@/lib/db'
import { PERMISSIONS } from './permissions'

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
        const rawPermissions = typeof user.roleTemplate.permissions === 'string'
          ? JSON.parse(user.roleTemplate.permissions)
          : user.roleTemplate.permissions

        const normalized = Array.isArray(rawPermissions)
          ? rawPermissions.filter((value): value is string => typeof value === 'string')
          : []

        if (normalized.length > 0) {
          const permissionRecords = await db.permission.findMany({
            where: {
              OR: [
                { id: { in: normalized } },
                { name: { in: normalized } },
              ],
            },
            select: { name: true },
          })

          rolePermissions = permissionRecords.map((record) => record.name)
        }
      } catch (error) {
        console.error('Error parsing role permissions:', error)
      }
    }

    const combinedPermissions = new Set([...userPermissions, ...rolePermissions])

    if (combinedPermissions.size === 0) {
      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        return Object.values(PERMISSIONS)
      }

      return []
    }

    return Array.from(combinedPermissions)
  } catch (error) {
    console.error('❌ Error getting user permissions:', error)
    return []
  }
}