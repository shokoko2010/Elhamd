import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export interface SimpleAuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
}

// Simple authentication for API routes - bypasses NextAuth for now
export async function simpleAuth(request: NextRequest): Promise<SimpleAuthUser | null> {
  try {
    // Get API key from headers or query params
    const apiKey = request.headers.get('x-api-key') || 
                   new URL(request.url).searchParams.get('apiKey')
    
    // For development, allow a simple bypass
    if (process.env.NODE_ENV === 'development' && apiKey === 'dev-key') {
      // Return a mock admin user for development
      return {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Development User',
        role: UserRole.SUPER_ADMIN,
        phone: null,
        branchId: null
      }
    }
    
    // For production, check if there's a valid session
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      // For now, accept any bearer token as valid (temporary solution)
      // In production, you should validate this token properly
      
      // Try to get a user from database (fallback to first admin user)
      const adminUser = await db.user.findFirst({
        where: {
          role: {
            in: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
          },
          isActive: true
        }
      })
      
      if (adminUser) {
        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          phone: adminUser.phone,
          branchId: adminUser.branchId
        }
      }
    }
    
    // If no valid auth found, return null
    return null
    
  } catch (error) {
    console.error('Simple auth error:', error)
    return null
  }
}

// Check if user has required role
export function hasRequiredRole(user: SimpleAuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false
  return requiredRoles.includes(user.role)
}

// Middleware to require authentication
export async function requireSimpleAuth(request: NextRequest, requiredRoles?: UserRole[]) {
  const user = await simpleAuth(request)
  
  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  if (requiredRoles && !hasRequiredRole(user, requiredRoles)) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Insufficient permissions' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  return { user }
}