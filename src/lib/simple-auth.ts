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
    console.log('=== DEBUG: getSimpleUser called ===')
    
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookie header:', cookieHeader)
    
    if (!cookieHeader) {
      console.log('No cookie header found')
      return null
    }

    const tokenMatch = cookieHeader.match(/staff_token=([^;]+)/)
    if (!tokenMatch) {
      console.log('No staff_token found in cookies')
      return null
    }

    const token = tokenMatch[1]
    console.log('Token found:', token.substring(0, 20) + '...')
    
    // Decode token to get user ID
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, timestamp] = decoded.split(':')
    
    console.log('Decoded token:', { userId, timestamp })
    
    if (!userId || !timestamp) {
      console.log('Invalid token format')
      return null
    }

    // Check if token is not too old (24 hours)
    const tokenTime = parseInt(timestamp)
    const now = Date.now()
    const maxAge = 60 * 60 * 24 * 1000 // 24 hours
    
    if (now - tokenTime > maxAge) {
      console.log('Token expired')
      return null
    }

    console.log('Looking for user in database...')
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roleTemplate: true
      }
    })

    console.log('Database user:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    } : 'Not found')

    if (!user || !user.isActive) {
      console.log('User not found or inactive')
      return null
    }

    // Get user permissions
    const permissions = await PermissionService.getUserPermissions(user.id)
    console.log('User permissions:', permissions)

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions
    }
    
    console.log('Returning user:', result)
    return result
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