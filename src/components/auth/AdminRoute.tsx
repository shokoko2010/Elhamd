'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Shield } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  redirectTo?: string
}

export function AdminRoute({ 
  children, 
  requiredRoles = ['ADMIN', 'STAFF'], 
  redirectTo = '/login' 
}: AdminRouteProps) {
  const { user, login, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!user) {
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (!user.role || !requiredRoles.includes(user.role)) {
        router.push('/')
        return
      }
    }
  }, [user, isLoading, requiredRoles, redirectTo, router])

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

  if (!user || !user.role || !requiredRoles.includes(user.role)) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}