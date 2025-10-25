import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/authOptions'
import { PermissionService, PERMISSIONS } from './permissions'
import { UserRole as PrismaUserRole } from '@prisma/client'

export { authOptions }

// Define UserRole enum locally to match Prisma enum
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ACCOUNTANT = 'ACCOUNTANT',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('No session found in getAuthUser')
      return null
    }

    let permissions: string[] = []
    
    // Try to get permissions, but don't fail if they don't exist yet
    try {
      permissions = await PermissionService.getUserPermissions(session.user.id)
    } catch (error) {
      console.warn('Failed to get permissions, using defaults:', error)
      // If permissions fail, get default permissions based on role
      const userRole = session.user.role
      if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
        permissions = Object.values(PERMISSIONS)
      } else if (userRole === UserRole.ACCOUNTANT) {
        permissions = [
          PERMISSIONS.VIEW_INVOICES,
          PERMISSIONS.CREATE_INVOICES,
          PERMISSIONS.EDIT_INVOICES,
          PERMISSIONS.DELETE_INVOICES,
          PERMISSIONS.VIEW_QUOTATIONS,
          PERMISSIONS.CREATE_QUOTATIONS,
          PERMISSIONS.EDIT_QUOTATIONS,
          PERMISSIONS.DELETE_QUOTATIONS,
          PERMISSIONS.VIEW_PAYMENTS,
          PERMISSIONS.CREATE_PAYMENTS,
          PERMISSIONS.EDIT_PAYMENTS,
          PERMISSIONS.VIEW_FINANCIAL_REPORTS
        ]
      } else if (userRole === UserRole.BRANCH_MANAGER) {
        permissions = [
          PERMISSIONS.MANAGE_VEHICLE_INVENTORY,
          PERMISSIONS.VIEW_VEHICLES,
          PERMISSIONS.EDIT_VEHICLES,
          PERMISSIONS.CREATE_VEHICLES
        ]
      } else if (userRole === UserRole.STAFF) {
        permissions = [
          PERMISSIONS.VIEW_VEHICLES,
          PERMISSIONS.EDIT_VEHICLES
        ]
      }
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

    return authUser
  } catch (error) {
    console.error('Error in getAuthUser:', error)
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
    return { success: false, error: 'Authentication failed' }
  }
}

// Authorize function for API routes with role-based access
export async function authorize(request: NextRequest, options?: { roles?: UserRole[], permissions?: string[] }) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    // Check role-based access
    if (options?.roles && options.roles.length > 0) {
      if (!options.roles.includes(user.role)) {
        return {
          error: NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
    }

    // Check permission-based access
    if (options?.permissions && options.permissions.length > 0) {
      const hasRequiredPermission = options.permissions.some(permission => 
        user.permissions.includes(permission)
      )
      
      if (!hasRequiredPermission) {
        return {
          error: NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
    }

    return { user }
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: 'Authorization failed' },
        { status: 500 }
      )
    }
  }
}