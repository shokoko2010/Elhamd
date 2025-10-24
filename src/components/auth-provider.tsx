'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * NextAuth Provider - The sole authentication provider for the application
 * 
 * This component wraps the entire application with NextAuth's SessionProvider,
 * making authentication state available throughout the component tree.
 * 
 * Features:
 * - JWT-based session management
 * - Automatic session refresh
 * - Secure cookie handling
 * - Role-based access control
 * - Permission management
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}