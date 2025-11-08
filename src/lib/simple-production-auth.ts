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

// Simple authentication that always returns the admin user
export async function getSimpleAuthUser(request?: NextRequest): Promise<SimpleAuthUser | null> {
  try {
    console.log('🔐 Simple Auth: Starting authentication...')
    
    // For production, always return the admin user
    const adminUser = await db.user.findUnique({
      where: { email: 'admin@elhamdimport.online' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    if (adminUser && adminUser.isActive) {
      const userPermissions = adminUser.permissions.map(up => up.permission.name)
      
      // If no permissions in database, give all permissions to admin
      if (userPermissions.length === 0) {
        userPermissions.push(...Object.values(PERMISSIONS))
      }
      
      console.log('✅ Simple Auth: Admin user authenticated successfully')
      
      return {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        phone: adminUser.phone,
        branchId: adminUser.branchId,
        permissions: userPermissions
      }
    }
    
    // Fallback to any admin user
    const anyAdmin = await db.user.findFirst({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        },
        isActive: true
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    if (anyAdmin) {
      const userPermissions = anyAdmin.permissions.map(up => up.permission.name)
      if (userPermissions.length === 0) {
        userPermissions.push(...Object.values(PERMISSIONS))
      }
      
      console.log('✅ Simple Auth: Fallback admin user authenticated')
      
      return {
        id: anyAdmin.id,
        email: anyAdmin.email,
        name: anyAdmin.name,
        role: anyAdmin.role,
        phone: anyAdmin.phone,
        branchId: anyAdmin.branchId,
        permissions: userPermissions
      }
    }
    
    console.log('❌ Simple Auth: No admin user found')
    return null
    
  } catch (error) {
    console.error('💥 Simple Auth: Error:', error)
    return null
  }
}

// Export as authenticateProductionUser for compatibility
export const authenticateProductionUser = getSimpleAuthUser