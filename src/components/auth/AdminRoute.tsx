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
  requiredRoles = [UserRole.ADMIN], 
  requiredPermissions = [],
  redirectTo = '/login' 
}: AdminRouteProps) {
  const { user, loading, authenticated, hasAnyRole, hasAnyPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!authenticated || !user) {
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (!hasAnyRole(requiredRoles)) {
        router.push('/')
        return
      }

      // Check if user has required permissions (if specified)
      if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions as any)) {
        router.push('/')
        return
      }
    }
  }, [user, loading, authenticated, requiredRoles, requiredPermissions, redirectTo, router, hasAnyRole, hasAnyPermission])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!authenticated || !user || !hasAnyRole(requiredRoles) || 
      (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions as any))) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}