import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { PermissionService, Permission } from './permissions'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: Permission[]
}

export async function getUnifiedAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded || !decoded.id) {
      return null
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    // Map permissions
    const permissions = user.permissions.map(up => up.permission.name as Permission)

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
    console.error('Error in unified auth:', error)
    return null
  }
}

export async function requireUnifiedAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getUnifiedAuthUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireUnifiedRole(request: NextRequest, role: UserRole): Promise<AuthUser> {
  const user = await requireUnifiedAuth(request)
  
  if (user.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`)
  }
  
  return user
}

export async function requireUnifiedAnyRole(request: NextRequest, roles: UserRole[]): Promise<AuthUser> {
  const user = await requireUnifiedAuth(request)
  
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required one of roles: ${roles.join(', ')}`)
  }
  
  return user
}

export async function requireUnifiedPermission(request: NextRequest, permission: Permission): Promise<AuthUser> {
  const user = await requireUnifiedAuth(request)
  
  if (!user.permissions.includes(permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
  
  return user
}

export async function requireUnifiedAnyPermission(request: NextRequest, permissions: Permission[]): Promise<AuthUser> {
  const user = await requireUnifiedAuth(request)
  
  if (!permissions.some(permission => user.permissions.includes(permission))) {
    throw new Error(`Access denied. Required one of permissions: ${permissions.join(', ')}`)
  }
  
  return user
}

export async function requireUnifiedAllPermissions(request: NextRequest, permissions: Permission[]): Promise<AuthUser> {
  const user = await requireUnifiedAuth(request)
  
  if (!permissions.every(permission => user.permissions.includes(permission))) {
    throw new Error(`Access denied. Required all permissions: ${permissions.join(', ')}`)
  }
  
  return user
}

export async function isUnifiedAdmin(request: NextRequest): Promise<AuthUser> {
  return await requireUnifiedAnyRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function isUnifiedBranchManager(request: NextRequest): Promise<AuthUser> {
  return await requireUnifiedAnyRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER])
}

export async function isUnifiedStaff(request: NextRequest): Promise<AuthUser> {
  return await requireUnifiedAnyRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
}