'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth-safe'
import { UserRole } from '@prisma/client'

export default function DashboardPage() {
  const { user, loading, authenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!authenticated || !user) {
        router.push('/login')
        return
      }

      // Redirect based on user role
      switch (user.role) {
        case UserRole.SUPER_ADMIN:
        case UserRole.ADMIN:
          router.push('/admin')
          break
        case UserRole.BRANCH_MANAGER:
          router.push('/employee/dashboard')
          break
        case UserRole.STAFF:
          router.push('/employee/dashboard')
          break
        case UserRole.CUSTOMER:
          router.push('/customer')
          break
        default:
          router.push('/')
      }
    }
  }, [user, loading, authenticated, router])

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحويلك إلى لوحة التحكم...</p>
      </div>
    </div>
  )
}