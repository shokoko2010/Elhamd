'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function SessionManager() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Handle session changes
    if (status === 'unauthenticated') {
      console.log('SessionManager: User is unauthenticated, clearing storage')
      
      // Clear any local storage items that might persist after logout
      const keysToClear = [
        'next-auth.csrf-token',
        'next-auth.callback-url',
        'user-preferences',
        'cart-items',
        'booking-draft',
        'auth-storage',
        'session-storage'
      ]
      
      keysToClear.forEach(key => {
        try {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        } catch (error) {
          // Ignore localStorage errors
        }
      })
      
      // Clear all storage if possible
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (error) {
        console.log('Storage clear error:', error)
      }
      
      // Force redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('SessionManager: Redirecting to login')
        window.location.href = '/login'
      }
    }
  }, [status, session])

  // This component doesn't render anything
  return null
}