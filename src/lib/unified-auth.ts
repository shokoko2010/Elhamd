import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions?: string[]
}

export async function getServerAuthSession(request?: NextRequest) {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

export async function requireUnifiedAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await getServerAuthSession(request)
    
    if (!session?.user?.id) {
      return null
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        branchId: true,
        isActive: true,
        customPermissions: true
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions: user.customPermissions || []
    }
  } catch (error) {
    console.error('Error in requireUnifiedAuth:', error)
    return null
  }
}

export async function requireAuthWithRole(request: NextRequest, requiredRoles: UserRole[]): Promise<AuthUser | null> {
  const user = await requireUnifiedAuth(request)
  
  if (!user || !requiredRoles.includes(user.role)) {
    return null
  }
  
  return user
}

export async function authorize(request: NextRequest, options: { roles?: UserRole[] } = {}) {
  if (options.roles) {
    return await requireAuthWithRole(request, options.roles)
  }
  return await requireUnifiedAuth(request)
}

export function createUnauthorizedResponse(message: string = 'غير مصرح بالوصول') {
  return Response.json({ error: message }, { status: 401 })
}

export function createForbiddenResponse(message: string = 'ممنوع الوصول') {
  return Response.json({ error: message }, { status: 403 })
}

// Re-export UserRole for convenience
export { UserRole }