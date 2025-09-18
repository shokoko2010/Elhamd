'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import GoogleAnalytics from './GoogleAnalytics'
import { setUserType } from './GoogleAnalytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
  measurementId: string
}

export default function AnalyticsProvider({ children, measurementId }: AnalyticsProviderProps) {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Set user type based on authentication status
    if (status === 'authenticated') {
      const userType = session?.user?.role === 'admin' ? 'admin' : 'registered'
      setUserType(userType)
    } else if (status === 'unauthenticated') {
      setUserType('guest')
    }
  }, [session, status])

  return (
    <>
      <GoogleAnalytics measurementId={measurementId} />
      {children}
    </>
  )
}