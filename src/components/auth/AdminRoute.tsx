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
  const { user, loading, authenticated, hasAnyRole, hasAnyPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('=== DEBUG: AdminRoute useEffect ===')
    console.log('User:', user)
    console.log('Loading:', loading)
    console.log('Authenticated:', authenticated)
    console.log('Required roles:', requiredRoles)
    console.log('Has any role:', hasAnyRole(requiredRoles))
    
    if (!loading) {
      // Check if user is authenticated
      if (!authenticated || !user) {
        console.log('User not authenticated, redirecting to:', redirectTo)
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (!hasAnyRole(requiredRoles)) {
        console.log('User does not have required roles, redirecting to /')
        console.log('User role:', user.role, 'Required:', requiredRoles)
        router.push('/')
        return
      }

      // Check if user has required permissions (if specified)
      if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions as any)) {
        console.log('User does not have required permissions, redirecting to /')
        router.push('/')
        return
      }

      console.log('User passed all checks, staying on page')
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
    console.log('AdminRoute: User not authorized, returning null')
    return null // Will redirect in useEffect
  }

  console.log('AdminRoute: Rendering children')
  return <>{children}</>
}