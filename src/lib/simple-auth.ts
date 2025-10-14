import { db } from '@/lib/db'
import { PermissionService } from './permissions'
import { UserRole } from '@prisma/client'

export interface SimpleUser {
  id: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  branchId?: string
  permissions: string[]
}

export async function getSimpleUser(request: Request): Promise<SimpleUser | null> {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null

    const tokenMatch = cookieHeader.match(/staff_token=([^;]+)/)
    if (!tokenMatch) return null

    const token = tokenMatch[1]
    
    // Decode token to get user ID
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, timestamp] = decoded.split(':')
    
    if (!userId || !timestamp) return null

    // Check if token is not too old (24 hours)
    const tokenTime = parseInt(timestamp)
    const now = Date.now()
    const maxAge = 60 * 60 * 24 * 1000 // 24 hours
    
    if (now - tokenTime > maxAge) return null

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roleTemplate: true
      }
    })

    if (!user || !user.isActive) return null

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
  } catch (error) {
    console.error('Simple auth error:', error)
    return null
  }
}

export async function requireSimpleAuth(request: Request): Promise<SimpleUser> {
  const user = await getSimpleUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export function createSimpleAuthHook() {
  return { getSimpleUser, requireSimpleAuth }
}