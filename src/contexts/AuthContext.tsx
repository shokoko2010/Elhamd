'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount - only on client side
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          localStorage.removeItem('user')
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication logic
      if (email === 'admin@alhamdcars.com' && password === 'admin123') {
        const adminUser: User = {
          id: '1',
          email: 'admin@alhamdcars.com',
          name: 'Admin User',
          role: 'ADMIN'
        }
        setUser(adminUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(adminUser))
        }
        return true
      } else if (email === 'staff@alhamdcars.com' && password === 'staff123') {
        const staffUser: User = {
          id: '2',
          email: 'staff@alhamdcars.com',
          name: 'Staff User',
          role: 'STAFF'
        }
        setUser(staffUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(staffUser))
        }
        return true
      } else if (email && password) {
        // Mock customer login
        const customerUser: User = {
          id: '3',
          email: email,
          name: 'Customer User',
          role: 'CUSTOMER'
        }
        setUser(customerUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(customerUser))
        }
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}