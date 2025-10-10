'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Shield } from 'lucide-react'
import { UserRole } from '@prisma/client'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  redirectTo?: string
}

export function AdminRoute({ 
  children, 
  requiredRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN], 
  requiredPermissions = [],
  redirectTo = '/login' 
}: AdminRouteProps) {
  const { user, isLoading, isAuthenticated, hasAnyPermission, hasAllPermissions } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (!requiredRoles.includes(user.role)) {
        router.push('/')
        return
      }

      // Check if user has required permissions (if specified)
      if (requiredPermissions.length > 0) {
        const hasRequired = requiredPermissions.length === 1 
          ? hasAnyPermission(requiredPermissions)
          : hasAllPermissions(requiredPermissions)
        
        if (!hasRequired) {
          router.push('/')
          return
        }
      }
    }
  }, [user, isLoading, isAuthenticated, requiredRoles, requiredPermissions, redirectTo, router, hasAnyPermission, hasAllPermissions])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !requiredRoles.includes(user.role) || 
      (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions))) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}