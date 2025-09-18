'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
}

export function useAuth() {
  const { data: session, status, update } = useSession()

  const user: AuthUser | null = session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    role: session.user.role,
    phone: session.user.phone
  } : null

  const loading = status === 'loading'
  const authenticated = status === 'authenticated'
  const unauthenticated = status === 'unauthenticated'

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN)
  }

  const isStaff = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.STAFF, UserRole.MANAGER])
  }

  const isCustomer = (): boolean => {
    return hasRole(UserRole.CUSTOMER)
  }

  return {
    user,
    loading,
    authenticated,
    unauthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    isCustomer,
    update
  }
}