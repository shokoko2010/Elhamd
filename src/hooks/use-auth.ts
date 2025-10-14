'use client'

import { useState, useEffect } from 'react'
import { UserRole } from '@prisma/client'
import { Permission } from '@/lib/permissions'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: Permission[]
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching user from /api/simple-auth/me...')
      const response = await fetch('/api/simple-auth/me', {
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('User data received:', data.user?.email)
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          phone: data.user.phone,
          branchId: data.user.branchId,
          permissions: data.user.permissions || [],
          isActive: data.user.isActive,
          emailVerified: data.user.emailVerified,
          lastLoginAt: data.user.lastLoginAt,
          createdAt: new Date(data.user.createdAt),
          updatedAt: new Date(data.user.updatedAt)
        })
      } else {
        console.log('Response not ok:', response.status)
        setUser(null)
        if (response.status !== 401) {
          setError('Failed to fetch user data')
        }
      }
    } catch (err) {
      console.error('Error in fetchUser:', err)
      setError('An error occurred')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/simple-auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      window.location.href = '/login'
    }
  }

  const update = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const authenticated = !!user && !loading
  const unauthenticated = !user && !loading

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return user ? permissions.some(permission => user.permissions.includes(permission)) : false
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return user ? permissions.every(permission => user.permissions.includes(permission)) : false
  }

  const isAdmin = (): boolean => {
    return hasAnyRole([UserRole.ADMIN])
  }

  const isBranchManager = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.BRANCH_MANAGER])
  }

  const isStaff = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
  }

  const isCustomer = (): boolean => {
    return hasRole(UserRole.CUSTOMER)
  }

  // Permission check helpers
  const canViewUsers = (): boolean => hasPermission('users.view')
  const canManageUsers = (): boolean => hasAnyPermission(['users.create', 'users.update', 'users.delete'])
  const canManageRoles = (): boolean => hasPermission('users.update')
  const canManagePermissions = (): boolean => hasPermission('users.update')

  const canViewVehicles = (): boolean => hasPermission('vehicles.view')
  const canManageVehicles = (): boolean => hasAnyPermission(['vehicles.create', 'vehicles.update', 'vehicles.delete'])

  const canViewBookings = (): boolean => hasPermission('bookings.view')
  const canManageBookings = (): boolean => hasAnyPermission(['bookings.create', 'bookings.update', 'bookings.delete'])

  const canViewServices = (): boolean => hasPermission('bookings.view')
  const canManageServices = (): boolean => hasAnyPermission(['bookings.create', 'bookings.update'])

  const canViewInventory = (): boolean => hasPermission('vehicles.view')
  const canManageInventory = (): boolean => hasAnyPermission(['vehicles.create', 'vehicles.update'])
  const canManageWarehouses = (): boolean => hasPermission('branches.view')
  const canManageSuppliers = (): boolean => hasPermission('branches.view')

  const canViewFinancials = (): boolean => hasPermission('reports.view')
  const canManageFinancials = (): boolean => hasAnyPermission(['reports.view', 'reports.export'])

  const canViewBranches = (): boolean => hasPermission('branches.view')
  const canManageBranches = (): boolean => hasAnyPermission(['branches.create', 'branches.update', 'branches.delete'])
  const canManageBranchStaff = (): boolean => hasPermission('users.update')

  const canViewCustomers = (): boolean => hasPermission('users.view')
  const canManageCustomers = (): boolean => hasAnyPermission(['users.create', 'users.update'])

  const canViewReports = (): boolean => hasPermission('reports.view')
  const canGenerateReports = (): boolean => hasPermission('reports.export')
  const canExportData = (): boolean => hasPermission('reports.export')

  const canManageSystemSettings = (): boolean => hasPermission('system.settings')
  const canManageRoleTemplates = (): boolean => hasPermission('system.settings')

  return {
    user,
    loading,
    error,
    authenticated,
    unauthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isBranchManager,
    isStaff,
    isCustomer,
    logout,
    update,
    
    // Permission helpers
    canViewUsers,
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canViewVehicles,
    canManageVehicles,
    canViewBookings,
    canManageBookings,
    canViewServices,
    canManageServices,
    canViewInventory,
    canManageInventory,
    canManageWarehouses,
    canManageSuppliers,
    canViewFinancials,
    canManageFinancials,
    canViewBranches,
    canManageBranches,
    canManageBranchStaff,
    canViewCustomers,
    canManageCustomers,
    canViewReports,
    canGenerateReports,
    canExportData,
    canManageSystemSettings,
    canManageRoleTemplates,
  }
}