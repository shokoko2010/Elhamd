'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
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
  const hasCheckedAuth = useRef(false)

  useEffect(() => {
    // Prevent infinite loops by using ref
    if (hasCheckedAuth.current) return
    
    if (!loading) {
      hasCheckedAuth.current = true
      
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
  }, [loading, authenticated, user, hasAnyRole, hasAnyPermission, requiredRoles, requiredPermissions, redirectTo, router])

  // Reset ref when dependencies change that might require re-authentication
  useEffect(() => {
    if (!loading && !authenticated) {
      hasCheckedAuth.current = false
    }
  }, [loading, authenticated])

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

  // Don't render anything if authentication checks are still loading or failed
  if (loading || !authenticated || !user) {
    return null
  }

  // Check role permissions
  if (!hasAnyRole(requiredRoles)) {
    return null
  }

  // Check specific permissions if required
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions as any)) {
    return null
  }

  // Safely render children with error boundary
  try {
    return <>{children}</>
  } catch (error) {
    console.error('AdminRoute rendering error:', error)
    return null
  }
}