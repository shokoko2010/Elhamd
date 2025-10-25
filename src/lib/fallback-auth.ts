import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from './permissions'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

// Fallback authentication when NextAuth session fails
export async function getAuthUserFallback(request?: Request): Promise<AuthUser | null> {
  try {
    // Try to get user from Authorization header or cookies
    let userEmail: string | null = null
    
    if (request) {
      // Try Authorization header
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // In a real app, you'd validate the JWT token here
        // For now, we'll try to extract email from other means
      }
      
      // Try cookies
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        
        // Check if there's a session token or other identifier
        if (cookies['next-auth.session-token']) {
          // This is a simplified approach - in production you'd decode the JWT
          // For now, we'll return null and let the main auth handle it
          return null
        }
      }
    }
    
    // If no email found, return null
    if (!userEmail) {
      return null
    }
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: {
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    if (!user || !user.isActive) {
      return null
    }
    
    // Get permissions
    const permissions = user.userPermissions.map(up => up.permission.name)
    
    // If no permissions in database, use defaults based on role
    if (permissions.length === 0) {
      if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
        permissions.push(...Object.values(PERMISSIONS))
      }
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

// Enhanced getAuthUser with fallback
export async function getAuthUserWithFallback(request?: Request): Promise<AuthUser | null> {
  try {
    // Try to get from NextAuth session first
    const { getAuthUser } = await import('./auth-server')
    const user = await getAuthUser()
    
    if (user) {
      return user
    }
    
    // Fallback to direct database check
    console.log('NextAuth failed, trying fallback authentication')
    return await getAuthUserFallback(request)
  } catch (error) {
    console.error('Error in enhanced authentication:', error)
    return null
  }
}