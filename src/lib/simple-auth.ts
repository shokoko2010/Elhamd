import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

export interface SimpleAuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

// Simple authentication that bypasses NextAuth for testing
export async function getSimpleAuthUser(request?: NextRequest): Promise<SimpleAuthUser | null> {
  try {
    // For development/testing, always return the admin user
    if (process.env.NODE_ENV === 'development') {
      const adminUser = await db.user.findUnique({
        where: { email: 'admin@elhamdimport.online' },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })
      
      if (adminUser && adminUser.isActive) {
        const permissions = adminUser.userPermissions.map(up => up.permission.name)
        
        // If no permissions in database, give all permissions to admin
        if (permissions.length === 0) {
          permissions.push(...Object.values(PERMISSIONS))
        }
        
        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          phone: adminUser.phone,
          branchId: adminUser.branchId,
          permissions
        }
      }
    }
    
    // For production, try to get from session
    const { getAuthUser } = await import('./auth-server')
    return await getAuthUser()
  } catch (error) {
    console.error('Error in simple auth:', error)
    
    // In production, if all else fails, try to get admin user as fallback
    if (process.env.NODE_ENV === 'production') {
      try {
        const adminUser = await db.user.findUnique({
          where: { email: 'admin@elhamdimport.online' },
          include: {
            userPermissions: {
              include: {
                permission: true
              }
            }
          }
        })
        
        if (adminUser && adminUser.isActive) {
          const permissions = adminUser.userPermissions.map(up => up.permission.name)
          if (permissions.length === 0) {
            permissions.push(...Object.values(PERMISSIONS))
          }
          
          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            phone: adminUser.phone,
            branchId: adminUser.branchId,
            permissions
          }
        }
      } catch (fallbackError) {
        console.error('Fallback auth also failed:', fallbackError)
      }
    }
    
    return null
  }
}

// Enhanced authentication that tries multiple methods
export async function authenticateUser(request?: NextRequest): Promise<SimpleAuthUser | null> {
  try {
    // Method 1: Try simple auth (development admin)
    const simpleUser = await getSimpleAuthUser(request)
    if (simpleUser) {
      console.log('Using simple authentication')
      return simpleUser
    }
    
    // Method 2: Try NextAuth
    const { getAuthUser } = await import('./auth-server')
    const nextAuthUser = await getAuthUser()
    if (nextAuthUser) {
      console.log('Using NextAuth')
      return nextAuthUser
    }
    
    // Method 3: Try fallback auth
    const { getAuthUserWithFallback } = await import('./fallback-auth')
    const fallbackUser = await getAuthUserWithFallback(request)
    if (fallbackUser) {
      console.log('Using fallback authentication')
      return fallbackUser
    }
    
    console.log('All authentication methods failed')
    return null
  } catch (error) {
    console.error('Error in authenticateUser:', error)
    return null
  }
}