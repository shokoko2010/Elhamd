import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { UserRole } from '@prisma/client'
import { PermissionService, Permission } from './permissions'

export { authOptions }

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: Permission[]
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return null
  }

  let permissions: Permission[] = []
  
  // Try to get permissions, but don't fail if they don't exist yet
  try {
    permissions = await PermissionService.getUserPermissions(session.user.id)
  } catch (error) {
    console.warn('Could not fetch user permissions, they may not be initialized yet')
    permissions = []
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    role: session.user.role,
    phone: session.user.phone,
    branchId: session.user.branchId,
    permissions
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (user.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`)
  }
  
  return user
}

export async function requireAnyRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required one of roles: ${roles.join(', ')}`)
  }
  
  return user
}

export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!user.permissions.includes(permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
  
  return user
}

export async function requireAnyPermission(permissions: Permission[]): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!permissions.some(permission => user.permissions.includes(permission))) {
    throw new Error(`Access denied. Required one of permissions: ${permissions.join(', ')}`)
  }
  
  return user
}

export async function requireAllPermissions(permissions: Permission[]): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!permissions.every(permission => user.permissions.includes(permission))) {
    throw new Error(`Access denied. Required all permissions: ${permissions.join(', ')}`)
  }
  
  return user
}

export async function isAdmin(): Promise<AuthUser> {
  return await requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function isBranchManager(): Promise<AuthUser> {
  return await requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER])
}

export async function isStaff(): Promise<AuthUser> {
  return await requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
}

export async function isCustomer(): Promise<AuthUser> {
  return await requireRole(UserRole.CUSTOMER)
}

// Helper functions to check permissions without throwing errors
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  return await PermissionService.hasPermission(userId, permission)
}

export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  return await PermissionService.hasAnyPermission(userId, permissions)
}

export async function hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  return await PermissionService.hasAllPermissions(userId, permissions)
}