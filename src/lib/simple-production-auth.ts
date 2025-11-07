import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'
import { getApiUser } from '@/lib/api-auth'

export interface SimpleAuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

/**
 * Securely authenticate a user in production. Decode the request via
 * bearer token or NextAuth session using `getApiUser`, then load the
 * corresponding user and their permissions. If the user has no explicit
 * permissions and is an admin, grant all permissions defined in
 * `PERMISSIONS`. Returns null if authentication fails.
 */
export async function getSimpleAuthUser(request?: NextRequest): Promise<SimpleAuthUser | null> {
  try {
    const apiUser = request ? await getApiUser(request) : null
    if (!apiUser) {
      return null
    }
    const user = await db.user.findFirst({
      where: { id: apiUser.id, isActive: true },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    })
    if (!user) {
      return null
    }
    const userPermissions = user.permissions.map(up => up.permission.name)
    if (userPermissions.length === 0 && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
      userPermissions.push(...Object.values(PERMISSIONS))
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions: userPermissions
    }
  } catch (error) {
    console.error('simple-production-auth error:', error)
    return null
  }
}

// Alias for backwards compatibility
export const authenticateProductionUser = getSimpleAuthUser
