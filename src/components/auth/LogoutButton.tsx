'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showText?: boolean
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default', 
  className = '',
  showText = true 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      
      // Call NextAuth signOut
      const result = await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      })

      // Clear any additional client-side data
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Redirect to login page
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback redirect
      window.location.href = '/login'
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="mr-2">جاري تسجيل الخروج...</span>}
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          {showText && <span className="mr-2">تسجيل الخروج</span>}
        </>
      )}
    </Button>
  )
}