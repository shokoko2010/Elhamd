import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/authOptions'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { getUserPermissions } from '@/lib/simple-permissions'

export { authOptions }
export { UserRole as PrismaUserRole }

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
    console.log('🔍 Getting authenticated user...')
    
    // For development, return a mock admin user
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Using mock admin user')
      
      const mockUser: AuthUser = {
        id: 'dev-admin-id',
        email: 'admin@elhamdimport.online',
        name: 'Development Admin',
        role: UserRole.SUPER_ADMIN,
        phone: '01234567890',
        branchId: null,
        permissions: ['*'] // All permissions
      }
      
      console.log('✅ Mock auth user created:', mockUser.email, 'Role:', mockUser.role)
      return mockUser
    }
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('❌ No session found')
      return null
    }

    console.log('✅ Session found for user:', session.user.email)
    
    // Get user permissions
    const permissions = await getUserPermissions(session.user.id)
    console.log('🔑 User permissions:', permissions.length)

    const authUser: AuthUser = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name,
      role: session.user.role,
      phone: session.user.phone,
      branchId: session.user.branchId,
      permissions
    }

    console.log('✅ Auth user created:', authUser.email, 'Role:', authUser.role)
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

export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!user.role.includes(role)) {
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

export async function isAdmin(): Promise<AuthUser> {
  return await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function isBranchManager(): Promise<AuthUser> {
  return await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER])
}

export async function isStaff(): Promise<AuthUser> {
  return await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
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