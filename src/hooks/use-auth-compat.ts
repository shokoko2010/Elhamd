'use client'

import { useSimpleAuth } from './use-simple-auth'
import { UserRole } from '@prisma/client'

interface AuthUser {
  id: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  branchId?: string
  permissions: string[]
}

interface UseAuthCompatReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  logout: () => void
}

export function useAuthCompat(): UseAuthCompatReturn {
  const { user, loading, error, logout } = useSimpleAuth()

  const authUser: AuthUser | null = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    branchId: user.branchId,
    permissions: user.permissions
  } : null

  return {
    user: authUser,
    loading,
    error,
    logout
  }
}

// Add helper methods to the user object
declare module '@/hooks/use-auth-compat' {
  interface AuthUser {
    isStaff(): boolean
    isAdmin(): boolean
    isSuperAdmin(): boolean
    hasPermission(permission: string): boolean
  }
}

// Add the methods to the user prototype
if (typeof window !== 'undefined') {
  Object.defineProperty(Object.prototype, 'isStaff', {
    value: function(this: AuthUser) {
      return this.role === UserRole.STAFF
    },
    enumerable: false
  })

  Object.defineProperty(Object.prototype, 'isAdmin', {
    value: function(this: AuthUser) {
      return this.role === UserRole.ADMIN
    },
    enumerable: false
  })

  Object.defineProperty(Object.prototype, 'isSuperAdmin', {
    value: function(this: AuthUser) {
      return this.role === UserRole.SUPER_ADMIN
    },
    enumerable: false
  })

  Object.defineProperty(Object.prototype, 'hasPermission', {
    value: function(this: AuthUser, permission: string) {
      return this.permissions.includes(permission)
    },
    enumerable: false
  })
}