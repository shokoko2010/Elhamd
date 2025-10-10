'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  branchId?: string
  permissions: string[]
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isStaff: boolean
  isCustomer: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession()

  const user: User | null = session?.user || null

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN,
    isStaff: user?.role === UserRole.STAFF || user?.role === UserRole.BRANCH_MANAGER || user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN,
    isCustomer: user?.role === UserRole.CUSTOMER,
    hasPermission: (permission: string) => user?.permissions?.includes(permission) || false,
    hasAnyPermission: (permissions: string[]) => permissions.some(p => user?.permissions?.includes(p)) || false,
    hasAllPermissions: (permissions: string[]) => permissions.every(p => user?.permissions?.includes(p)) || false
  }
}