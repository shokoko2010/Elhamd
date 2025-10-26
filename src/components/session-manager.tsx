'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/vehicles',
  '/search',
  '/test-drive',
  '/service-booking',
  '/consultation',
  '/contact',
  '/about',
  '/services',
  '/privacy',
  '/terms',
  '/سياسة-الخصوصية',
  'الشروط-والأحكام',
  '/الدعم-الفني',
  '/الضمان',
  '/الأسئلة-الشائعة',
  '/قطع-الغيار',
  '/financing',
  '/order-tracking',
  '/contact-info',
  '/خريطة-الموقع',
  '/tata-motors'
]

export function SessionManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Handle session changes
    if (status === 'unauthenticated') {
      console.log('SessionManager: User is unauthenticated')
      
      // Only clear specific non-NextAuth storage items
      const keysToClear = [
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
      
      // DON'T clear all storage - this interferes with NextAuth
      // NextAuth needs its own tokens to work properly
      
      // Only redirect to login if trying to access protected routes
      const isPublicRoute = PUBLIC_ROUTES.some(route => {
        if (route === '/') {
          return pathname === route
        }
        return pathname.startsWith(route)
      })
      
      // Also check if it's a public vehicle page
      const isVehiclePage = /^\/vehicles\/[^\/]+$/.test(pathname)
      
      if (!isPublicRoute && !isVehiclePage && typeof window !== 'undefined') {
        console.log('SessionManager: Accessing protected route, redirecting to login')
        window.location.href = '/login'
      }
    }
  }, [status, session, pathname])

  // This component doesn't render anything
  return null
}