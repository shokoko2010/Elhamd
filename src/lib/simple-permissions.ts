import { db } from '@/lib/db'

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        roleTemplate: true,
      },
    })

    if (!user) {
      return []
    }

    // Collect permissions assigned directly to the user
    const userPermissions = user.permissions.map((p) => p.permission.name)

    // Collect permissions from the user's role template, if it exists
    let rolePermissions: string[] = []
    if (user.roleTemplate?.permissions) {
      const parsedPermissions =
        typeof user.roleTemplate.permissions === 'string'
          ? JSON.parse(user.roleTemplate.permissions)
          : user.roleTemplate.permissions
      rolePermissions = Array.isArray(parsedPermissions) ? parsedPermissions : []
    }

    // Return a de-duplicated array of permissions
    return Array.from(new Set([...userPermissions, ...rolePermissions]))
  } catch (error) {
    // In production, avoid logging sensitive data; handle error gracefully
    return []
  }
}
