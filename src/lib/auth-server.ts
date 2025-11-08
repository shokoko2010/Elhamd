import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/authOptions'
import { UserRole } from '@prisma/client'
import { getUserPermissions } from '@/lib/simple-permissions'
import { PermissionService } from '@/lib/permissions'

export { authOptions }
export { UserRole as PrismaUserRole }
export { UserRole }

export async function authenticateProductionUser(_request?: NextRequest): Promise<AuthUser | null> {
  return resolveAuthUser()
}

export interface AuthorizeOptions {
  roles?: UserRole[]
  permissions?: string[]
}

export type AuthorizeResult =
  | { user: AuthUser; error?: undefined }
  | { user?: undefined; error: NextResponse }

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

function normalizeAuthUser(user: AuthUser): AuthUser {
  const permissions = Array.isArray(user.permissions) ? user.permissions : []

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    branchId: user.branchId,
    permissions: Array.from(new Set(permissions))
  }
}

async function resolveAuthUser(): Promise<AuthUser | null> {
  const sessionUser = await getAuthUser()
  if (sessionUser) {
    return normalizeAuthUser(sessionUser)
  }

  return null
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return null
    }

    // Get user permissions
    const permissions = await getUserPermissions(session.user.id)
    const authUser: AuthUser = normalizeAuthUser({
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name,
      role: session.user.role,
      phone: session.user.phone,
      branchId: session.user.branchId,
      permissions
    })
    return authUser
  } catch (error) {
    console.error('❌ Error in getAuthUser:', error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireRole(roleOrRoles: UserRole | UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles]

  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${roles.join(', ')}`)
  }

  return user
}

export async function requireAnyRole(roles: UserRole[]): Promise<AuthUser> {
  return requireRole(roles)
}

export async function isAdmin(): Promise<AuthUser> {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function isBranchManager(): Promise<AuthUser> {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER])
}

export async function isStaff(): Promise<AuthUser> {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
}

export async function isCustomer(): Promise<AuthUser> {
  return requireRole(UserRole.CUSTOMER)
}

export async function authorize(
  request: NextRequest,
  options: AuthorizeOptions = {}
): Promise<AuthorizeResult> {
  try {
    const user = await resolveAuthUser()

    if (!user) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (options.roles?.length && !options.roles.includes(user.role)) {
      return {
        error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (options.permissions?.length) {
      const hasWildcard =
        user.role === UserRole.SUPER_ADMIN || user.permissions.includes('*')
      const missingPermissions = options.permissions.filter(permission =>
        !hasWildcard && !user.permissions.includes(permission)
      )

      if (missingPermissions.length > 0) {
        return {
          error: NextResponse.json(
            {
              error: 'Insufficient permissions',
              missingPermissions
            },
            { status: 403 }
          )
        }
      }
    }

    return { user }
  } catch (error) {
    console.error('Authorization error:', error)
    return {
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }
  }
}

// Helper functions to check permissions without throwing errors
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  return await PermissionService.hasPermission(userId, permission)
}

export async function hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
  return await PermissionService.hasAnyPermission(userId, permissions)
}

export async function hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
  return await PermissionService.hasAllPermissions(userId, permissions)
}

// Simple auth verification for API routes
export async function verifyAuth(request: Request) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return { success: false, error: 'No authenticated user found' }
    }

    return { success: true, user }
  } catch (error) {
    return { success: false, error: 'Authentication failed' }
  }
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; delayMs?: number; backoffFactor?: number } = {}
): Promise<T> {
  const { retries = 3, delayMs = 100, backoffFactor = 2 } = options
  const attempts = Math.max(1, retries + 1)
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === attempts - 1) {
        break
      }

      const waitTime = delayMs * Math.pow(backoffFactor, attempt)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error('Operation failed after maximum retry attempts')
}