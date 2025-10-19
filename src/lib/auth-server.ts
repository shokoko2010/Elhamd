import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { UserRole } from '@prisma/client'
import { PermissionService } from './permissions'

export { authOptions }

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    console.log('=== DEBUG: getAuthUser called ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session found:', !!session)
    console.log('Session user:', !!session?.user)
    
    if (!session?.user) {
      console.log('No session user found, returning null')
      return null
    }

    console.log('Session user email:', session.user.email)
    console.log('Session user role:', session.user.role)

    let permissions: string[] = []
    
    // Try to get permissions, but don't fail if they don't exist yet
    try {
      console.log('Fetching permissions for user:', session.user.id)
      permissions = await PermissionService.getUserPermissions(session.user.id)
      console.log('Permissions fetched:', permissions.length)
    } catch (error) {
      console.warn('Could not fetch user permissions, they may not be initialized yet:', error)
      permissions = []
    }

    // Ensure user has the minimum required permissions based on role
    if (session.user.role === UserRole.ADMIN || session.user.role === UserRole.SUPER_ADMIN) {
      // Admin users get all permissions by default
      const allPermissions = Object.values(PERMISSIONS)
      permissions = Array.from(new Set([...permissions, ...allPermissions]))
      console.log('Admin user - all permissions granted')
    } else if (session.user.role === UserRole.BRANCH_MANAGER) {
      // Branch managers get vehicle management permissions
      const vehiclePermissions = [
        PERMISSIONS.VEHICLE_MANAGE,
        PERMISSIONS.VEHICLE_VIEW,
        PERMISSIONS.VEHICLE_EDIT,
        PERMISSIONS.VEHICLE_IMAGES_MANAGE
      ]
      permissions = Array.from(new Set([...permissions, ...vehiclePermissions]))
      console.log('Branch manager - vehicle permissions granted')
    } else if (session.user.role === UserRole.STAFF) {
      // Staff get basic vehicle permissions
      const staffPermissions = [
        PERMISSIONS.VEHICLE_VIEW,
        PERMISSIONS.VEHICLE_EDIT
      ]
      permissions = Array.from(new Set([...permissions, ...staffPermissions]))
      console.log('Staff - basic permissions granted')
    }

    const authUser: AuthUser = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name,
      role: session.user.role,
      phone: session.user.phone,
      branchId: session.user.branchId,
      permissions
    }

    console.log('Auth user created:', {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      permissionsCount: authUser.permissions.length
    })

    return authUser
  } catch (error) {
    console.error('Error getting auth user:', error)
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

export async function requirePermission(permission: string): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!user.permissions.includes(permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
  
  return user
}

export async function requireAnyPermission(permissions: string[]): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!permissions.some(permission => user.permissions.includes(permission))) {
    throw new Error(`Access denied. Required one of permissions: ${permissions.join(', ')}`)
  }
  
  return user
}

export async function requireAllPermissions(permissions: string[]): Promise<AuthUser> {
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
    console.error('Auth verification error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}