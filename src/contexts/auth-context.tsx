'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name?: string
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const checkAuth = () => {
      const savedUser = localStorage.getItem('alhamd_user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('alhamd_user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication logic
      if (email && password.length >= 6) {
        // Check if user exists in localStorage (mock database)
        const users = JSON.parse(localStorage.getItem('alhamd_users') || '[]')
        const existingUser = users.find((u: any) => u.email === email)
        
        if (existingUser) {
          if (existingUser.password === password) {
            const userWithoutPassword = {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role,
              phone: existingUser.phone
            }
            setUser(userWithoutPassword)
            localStorage.setItem('alhamd_user', JSON.stringify(userWithoutPassword))
            return true
          } else {
            return false // Wrong password
          }
        } else {
          // Create new user if not exists (for demo purposes)
          const newUser = {
            id: Date.now().toString(),
            email,
            password,
            name: email.split('@')[0], // Default name from email
            role: 'CUSTOMER' as const,
            phone: ''
          }
          
          users.push(newUser)
          localStorage.setItem('alhamd_users', JSON.stringify(users))
          
          const userWithoutPassword = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            phone: newUser.phone
          }
          setUser(userWithoutPassword)
          localStorage.setItem('alhamd_user', JSON.stringify(userWithoutPassword))
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('alhamd_users') || '[]')
      const existingUser = users.find((u: any) => u.email === userData.email)
      
      if (existingUser) {
        return false // User already exists
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'CUSTOMER' as const
      }
      
      users.push(newUser)
      localStorage.setItem('alhamd_users', JSON.stringify(users))
      
      // Log in the user automatically
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone
      }
      setUser(userWithoutPassword)
      localStorage.setItem('alhamd_user', JSON.stringify(userWithoutPassword))
      
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('alhamd_user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated
    }}>
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