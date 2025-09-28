import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export interface ServerAuthUser {
  id: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  branchId?: string
  permissions?: string[]
}

export async function getServerAuthUser(): Promise<ServerAuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
      role: session.user.role,
      phone: session.user.phone || undefined,
      branchId: session.user.branchId || undefined,
      permissions: session.user.permissions || []
    }
  } catch (error) {
    console.error('Server auth error:', error)
    return null
  }
}

export async function requireServerAuth(): Promise<ServerAuthUser> {
  const user = await getServerAuthUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireStaffRole(): Promise<ServerAuthUser> {
  const user = await requireServerAuth()
  
  if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Access denied. Staff role required.')
  }
  
  return user
}

export async function requirePermission(permission: string): Promise<ServerAuthUser> {
  const user = await requireServerAuth()
  
  if (!user.permissions?.includes(permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
  
  return user
}