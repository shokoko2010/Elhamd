'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  role?: string
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  role,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth()

  // Check role first
  if (role && user?.role !== role) {
    return <>{fallback}</>
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasRequired = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasRequired) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

interface AdminGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { isAdmin } = useAuth()
  
  if (!isAdmin) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface StaffGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function StaffGuard({ children, fallback = null }: StaffGuardProps) {
  const { isStaff } = useAuth()
  
  if (!isStaff) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

interface CustomerGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function CustomerGuard({ children, fallback = null }: CustomerGuardProps) {
  const { isCustomer } = useAuth()
  
  if (!isCustomer) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}