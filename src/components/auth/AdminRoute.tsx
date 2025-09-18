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
  redirectTo?: string
}

export function AdminRoute({ 
  children, 
  requiredRoles = [UserRole.ADMIN, UserRole.STAFF], 
  redirectTo = '/login' 
}: AdminRouteProps) {
  const { user, loading, authenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!authenticated || !user) {
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (!requiredRoles.includes(user.role)) {
        router.push('/')
        return
      }
    }
  }, [user, loading, authenticated, requiredRoles, redirectTo, router])

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

  if (!authenticated || !user || !requiredRoles.includes(user.role)) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}