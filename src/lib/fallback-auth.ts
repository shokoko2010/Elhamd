import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from './permissions'
import { getApiUser } from './api-auth'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

export async function getAuthUserFallback(request?: Request): Promise<AuthUser | null> {
  try {
    if (!request) return null
    const apiUser = await getApiUser(request)
    if (!apiUser) {
      return null
    }
    const user = await db.user.findFirst({
      where: { id: apiUser.id, isActive: true },
      include: {
        userPermissions: {
          include: { permission: true }
        }
      }
    })
    if (!user) {
      return null
    }
    const permissions = user.userPermissions.map(up => up.permission.name)
    if (permissions.length === 0 && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
      permissions.push(...Object.values(PERMISSIONS))
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions
    }
  } catch (error) {
    console.error('Error in fallback authentication:', error)
    return null
  }
}

export async function getAuthUserWithFallback(request?: Request): Promise<AuthUser | null> {
  try {
    const { getAuthUser } = await import('./auth-server')
    const user = await getAuthUser()
    if (user) {
      return user
    }
    console.warn('NextAuth session unavailable, falling back to token authentication')
    return await getAuthUserFallback(request)
  } catch (error) {
    console.error('Error in enhanced authentication:', error)
    return null
  }
}
