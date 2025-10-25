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
      // Clear any local storage items that might persist after logout
      const keysToClear = [
        'next-auth.csrf-token',
        'next-auth.callback-url',
        'user-preferences',
        'cart-items',
        'booking-draft'
      ]
      
      keysToClear.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          // Ignore localStorage errors
        }
      })
    }
  }, [status, session])

  // This component doesn't render anything
  return null
}