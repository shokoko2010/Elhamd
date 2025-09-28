import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export interface ApiUser {
  id: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  branchId?: string
  permissions?: string[]
}

export function generateApiToken(user: ApiUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      branchId: user.branchId,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyApiToken(token: string): ApiUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ApiUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<ApiUser | null> {
  try {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user || !user.isActive || !user.password) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

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
    console.error('Authentication error:', error)
    return null
  }
}

export async function getApiUser(request: Request): Promise<ApiUser | null> {
  try {
    // First try Bearer token authentication
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyApiToken(token)
      if (decoded) {
        return decoded
      }
    }

    // Fallback to NextAuth session
    const session = await getServerSession(authOptions)
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        phone: session.user.phone,
        branchId: session.user.branchId,
        permissions: session.user.permissions || []
      }
    }

    return null
  } catch (error) {
    console.error('API auth error:', error)
    return null
  }
}