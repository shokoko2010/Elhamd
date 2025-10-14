import { db } from '@/lib/db'
import { PermissionService } from './permissions'
import { UserRole } from '@prisma/client'

// Re-export UserRole for convenience
export { UserRole }

export interface UnifiedUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// Server-side authentication for API routes
export async function getUnifiedUser(request: Request): Promise<UnifiedUser | null> {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const tokenMatch = cookieHeader.match(/staff_token=([^;]+)/)
    if (!tokenMatch) return null

    const token = tokenMatch[1]
    
    // Decode token to get user ID
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, timestamp] = decoded.split(':')
    
    if (!userId || !timestamp) return null

    // Check if token is not too old (24 hours)
    const tokenTime = parseInt(timestamp)
    const now = Date.now()
    const maxAge = 60 * 60 * 24 * 1000 // 24 hours
    
    if (now - tokenTime > maxAge) return null

    // Get user from database with full details
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roleTemplate: true
      }
    })

    if (!user || !user.isActive) return null

    // Get user permissions
    const permissions = await PermissionService.getUserPermissions(user.id)

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error) {
    console.error('Unified auth error:', error)
    return null
  }
}

export async function requireUnifiedAuth(request: Request): Promise<UnifiedUser> {
  const user = await getUnifiedUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

// Role-based authorization helpers
export function requireRole(user: UnifiedUser, allowedRoles: UserRole[]): UnifiedUser {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export function requireAnyRole(user: UnifiedUser, allowedRoles: UserRole[]): UnifiedUser {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export function requirePermission(user: UnifiedUser, permission: string): UnifiedUser {
  if (!user.permissions.includes(permission)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export function requireAnyPermission(user: UnifiedUser, permissions: string[]): UnifiedUser {
  if (!permissions.some(permission => user.permissions.includes(permission))) {
    throw new Error('Insufficient permissions')
  }
  return user
}

// Common role checkers
export const isAdmin = (user: UnifiedUser): boolean => 
  ['SUPER_ADMIN', 'ADMIN'].includes(user.role)

export const isBranchManager = (user: UnifiedUser): boolean => 
  ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'].includes(user.role)

export const isStaff = (user: UnifiedUser): boolean => 
  ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'STAFF'].includes(user.role)

export const isCustomer = (user: UnifiedUser): boolean => 
  user.role === 'CUSTOMER'

// Authorization middleware for API routes
export async function authorize(request: Request, options: {
  roles?: UserRole[]
  permissions?: string[]
  requireAll?: boolean
} = {}): Promise<UnifiedUser> {
  const user = await requireUnifiedAuth(request)
  
  if (options.roles && options.roles.length > 0) {
    if (options.requireAll) {
      if (!options.roles.every(role => role === user.role)) {
        throw new Error('Insufficient permissions')
      }
    } else {
      if (!options.roles.includes(user.role)) {
        throw new Error('Insufficient permissions')
      }
    }
  }
  
  if (options.permissions && options.permissions.length > 0) {
    if (options.requireAll) {
      if (!options.permissions.every(permission => user.permissions.includes(permission))) {
        throw new Error('Insufficient permissions')
      }
    } else {
      if (!options.permissions.some(permission => user.permissions.includes(permission))) {
        throw new Error('Insufficient permissions')
      }
    }
  }
  
  return user
}

// Create authentication response helpers
export function createAuthResponse(user: UnifiedUser, token?: string) {
  const responseToken = token || Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions: user.permissions
    },
    token: responseToken
  }
}

// Create authentication handler for API routes
export function createAuthHandler(options: {
  roles?: UserRole[]
  permissions?: string[]
  requireAll?: boolean
} = {}) {
  return async (request: Request): Promise<UnifiedUser> => {
    return await authorize(request, options)
  }
}