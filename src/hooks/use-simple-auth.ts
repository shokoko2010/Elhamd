'use client'

import { useState, useEffect } from 'react'
import { SimpleUser } from '@/lib/simple-auth'

interface UseSimpleAuthReturn {
  user: SimpleUser | null
  loading: boolean
  error: string | null
  logout: () => void
}

export function useSimpleAuth(): UseSimpleAuthReturn {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/simple-auth/me')
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
        if (response.status !== 401) {
          setError('Failed to fetch user data')
        }
      }
    } catch (err) {
      setError('An error occurred')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear the cookie by making a request to logout endpoint
    fetch('/api/simple-auth/logout', { method: 'POST' })
      .then(() => {
        setUser(null)
        // Redirect to main login page
        window.location.href = '/login'
      })
      .catch(() => {
        setUser(null)
        window.location.href = '/login'
      })
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    loading,
    error,
    logout
  }
}