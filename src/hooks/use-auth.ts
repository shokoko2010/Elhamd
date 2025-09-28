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
      
      const response = await fetch('/api/simple-auth/me')
      
      if (response.ok) {
        const data = await response.json()
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

  const logout = async () => {
    try {
      await fetch('/api/simple-auth/logout', { method: 'POST' })
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
    return hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  }

  const isBranchManager = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER])
  }

  const isStaff = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
  }

  const isCustomer = (): boolean => {
    return hasRole(UserRole.CUSTOMER)
  }

  // Permission check helpers
  const canViewUsers = (): boolean => hasPermission('view_users')
  const canManageUsers = (): boolean => hasAnyPermission(['create_users', 'edit_users', 'delete_users'])
  const canManageRoles = (): boolean => hasPermission('manage_user_roles')
  const canManagePermissions = (): boolean => hasPermission('manage_user_permissions')

  const canViewVehicles = (): boolean => hasPermission('view_vehicles')
  const canManageVehicles = (): boolean => hasAnyPermission(['create_vehicles', 'edit_vehicles', 'delete_vehicles'])

  const canViewBookings = (): boolean => hasPermission('view_bookings')
  const canManageBookings = (): boolean => hasAnyPermission(['create_bookings', 'edit_bookings', 'delete_bookings'])

  const canViewServices = (): boolean => hasPermission('view_services')
  const canManageServices = (): boolean => hasAnyPermission(['create_services', 'edit_services', 'delete_services'])

  const canViewInventory = (): boolean => hasPermission('view_inventory')
  const canManageInventory = (): boolean => hasAnyPermission(['create_inventory_items', 'edit_inventory_items', 'delete_inventory_items'])
  const canManageWarehouses = (): boolean => hasPermission('manage_warehouses')
  const canManageSuppliers = (): boolean => hasPermission('manage_suppliers')

  const canViewFinancials = (): boolean => hasPermission('view_financials')
  const canManageFinancials = (): boolean => hasAnyPermission(['create_invoices', 'edit_invoices', 'delete_invoices', 'manage_payments'])

  const canViewBranches = (): boolean => hasPermission('view_branches')
  const canManageBranches = (): boolean => hasAnyPermission(['create_branches', 'edit_branches', 'delete_branches'])
  const canManageBranchStaff = (): boolean => hasPermission('manage_branch_staff')

  const canViewCustomers = (): boolean => hasPermission('view_customers')
  const canManageCustomers = (): boolean => hasAnyPermission(['create_customers', 'edit_customers', 'delete_customers'])

  const canViewReports = (): boolean => hasPermission('view_reports')
  const canGenerateReports = (): boolean => hasPermission('generate_reports')
  const canExportData = (): boolean => hasPermission('export_data')

  const canManageSystemSettings = (): boolean => hasPermission('manage_system_settings')
  const canManageRoleTemplates = (): boolean => hasPermission('manage_roles_templates')

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