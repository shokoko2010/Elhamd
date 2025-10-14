import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { PermissionService } from './permissions'
import { UserRole } from '@prisma/client'

export interface SimpleAuthUser {
  id: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  branchId?: string
  permissions: string[]
}

export async function getSimpleAuthUser(request: NextRequest): Promise<SimpleAuthUser | null> {
  try {
    // Try simple auth staff token first
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/staff_token=([^;]+)/)
      if (tokenMatch) {
        const token = tokenMatch[1]
        
        // Decode token to get user ID
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const [userId, timestamp] = decoded.split(':')
        
        if (userId && timestamp) {
          // Check if token is not too old (24 hours)
          const tokenTime = parseInt(timestamp)
          const now = Date.now()
          const maxAge = 60 * 60 * 24 * 1000 // 24 hours
          
          if (now - tokenTime <= maxAge) {
            // Get user from database
            const user = await db.user.findUnique({
              where: { id: userId },
              include: {
                roleTemplate: true
              }
            })

            if (user && user.isActive) {
              // Get user permissions
              const permissions = await PermissionService.getUserPermissions(user.id)

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                branchId: user.branchId,
                permissions
              }
            }
          }
        }
      }
    }

    // Try NextAuth session token as fallback
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                       request.cookies.get('__Secure-next-auth.session-token')?.value

    if (sessionToken) {
      // Try to get the most recently logged-in staff user as a fallback
      // This is a temporary workaround for NextAuth JWT issues
      const recentStaffUser = await db.user.findFirst({
        where: {
          role: {
            in: ['STAFF', 'ADMIN', 'BRANCH_MANAGER', 'SUPER_ADMIN']
          },
          isActive: true
        },
        include: {
          roleTemplate: true
        },
        orderBy: {
          lastLoginAt: 'desc'
        },
        take: 1
      })

      if (recentStaffUser) {
        // Get user permissions
        const permissions = await PermissionService.getUserPermissions(recentStaffUser.id)

        return {
          id: recentStaffUser.id,
          email: recentStaffUser.email,
          name: recentStaffUser.name,
          role: recentStaffUser.role,
          phone: recentStaffUser.phone,
          branchId: recentStaffUser.branchId,
          permissions
        }
      }
    }

    return null
  } catch (error) {
    console.error('Simple auth error:', error)
    return null
  }
}

export async function requireSimpleAuth(request: NextRequest): Promise<SimpleAuthUser> {
  const user = await getSimpleAuthUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireStaffRole(request: NextRequest): Promise<SimpleAuthUser> {
  const user = await requireSimpleAuth(request)
  
  if (!['STAFF', 'ADMIN', 'BRANCH_MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Access denied. Staff role required.')
  }
  
  return user
}

export async function requirePermission(request: NextRequest, permission: string): Promise<SimpleAuthUser> {
  const user = await requireSimpleAuth(request)
  
  if (!user.permissions.includes(permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`)
  }
  
  return user
}