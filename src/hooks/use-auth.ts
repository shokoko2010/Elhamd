'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    try {
      if (status === 'authenticated' && session?.user) {
        setUser({
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || null,
          role: session.user.role as UserRole || UserRole.CUSTOMER,
          phone: session.user.phone || null,
          branchId: session.user.branchId || null,
          permissions: (session.user.permissions as Permission[]) || [],
          isActive: true, // Assuming active if session exists
          emailVerified: true, // Assuming verified if session exists
          lastLoginAt: session.user.lastLoginAt ? new Date(session.user.lastLoginAt) : null,
          createdAt: new Date(), // Default values
          updatedAt: new Date()
        })
        setError(null)
      } else if (status === 'unauthenticated') {
        setUser(null)
        setError(null)
      } else if (status === 'error') {
        setUser(null)
        setError('Session error occurred')
      }
    } catch (error) {
      console.error('Error processing session:', error)
      setUser(null)
      setError('Session processing error')
    }
    
    setLoading(false)
  }, [session, status])

  const logout = async () => {
    try {
      console.log('Starting logout process...')
      
      // Clear local state first
      setUser(null)
      setError(null)
      setLoading(false)
      
      // Call our custom logout API to ensure all cookies are cleared
      try {
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          console.log('Logout API call successful')
          const data = await response.json()
          console.log('Logout response:', data)
        } else {
          console.error('Logout API call failed:', response.status)
        }
      } catch (apiError) {
        console.error('Logout API error:', apiError)
      }
      
      // Then sign out from NextAuth
      try {
        await signOut({ 
          redirect: false // We'll handle redirect manually
        })
        console.log('NextAuth signOut completed')
      } catch (signOutError) {
        console.error('NextAuth signOut error:', signOutError)
      }
      
      // Clear any remaining local storage
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
      } catch (storageError) {
        console.log('Storage clear error:', storageError)
      }
      
      // Force redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local state on error as well
      setUser(null)
      setError(null)
      setLoading(false)
      
      // Try to clear cookies via API even on error
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
        })
      } catch (apiError) {
        console.error('Fallback logout API failed:', apiError)
      }
      
      // Force redirect even if everything fails
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  const update = async () => {
    // Force a session refresh
    if (status === 'authenticated') {
      setLoading(true)
      try {
        // Trigger a session refresh by calling the update endpoint
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData) {
            // Session is valid, NextAuth will automatically update the session
            await new Promise(resolve => setTimeout(resolve, 100))
          } else {
            // Session is null/invalid, clear local state
            setUser(null)
            setError(null)
          }
        } else {
          // Session is invalid, clear local state
          setUser(null)
          setError(null)
        }
      } catch (error) {
        console.error('Session refresh error:', error)
        setUser(null)
        setError('Failed to refresh session')
      } finally {
        setLoading(false)
      }
    }
  }

  const authenticated = !!user && !loading
  const unauthenticated = !user && !loading

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  const userHasWildcard = (): boolean => {
    if (!user || !Array.isArray(user?.permissions)) {
      return false
    }
    return user.permissions.includes('*')
  }

  const isSuperAdminRole = (): boolean => user?.role === UserRole.SUPER_ADMIN

  const hasPermission = (permission: Permission): boolean => {
    if (!permission) {
      return false
    }

    if (!user || !Array.isArray(user.permissions)) {
      return false
    }

    if (isSuperAdminRole() || userHasWildcard()) {
      return true
    }

    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user || !Array.isArray(user.permissions) || !Array.isArray(permissions) || permissions.length === 0) {
      return false
    }

    if (isSuperAdminRole() || userHasWildcard()) {
      return true
    }

    return permissions.some(permission => user.permissions.includes(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user || !Array.isArray(user.permissions) || !Array.isArray(permissions) || permissions.length === 0) {
      return false
    }

    if (isSuperAdminRole() || userHasWildcard()) {
      return true
    }

    return permissions.every(permission => user.permissions.includes(permission))
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

  // Permission check helpers using updated PERMISSIONS constants
  const canViewUsers = (): boolean => hasPermission('view_users')
  const canManageUsers = (): boolean => hasAnyPermission(['create_users', 'edit_users', 'delete_users'])
  const canManageRoles = (): boolean => hasPermission('edit_users')
  const canManagePermissions = (): boolean => hasPermission('edit_users')

  const canViewVehicles = (): boolean => hasPermission('view_vehicles')
  const canManageVehicles = (): boolean => hasAnyPermission(['create_vehicles', 'edit_vehicles', 'delete_vehicles'])

  const canViewBookings = (): boolean => hasPermission('view_bookings')
  const canManageBookings = (): boolean => hasAnyPermission(['create_bookings', 'edit_bookings', 'delete_bookings'])

  const canViewServices = (): boolean => hasPermission('view_services')
  const canManageServices = (): boolean => hasAnyPermission(['create_services', 'edit_services'])

  const canViewInventory = (): boolean => hasPermission('view_inventory')
  const canManageInventory = (): boolean => hasAnyPermission(['create_inventory_items', 'edit_inventory_items'])
  const canManageWarehouses = (): boolean => hasPermission('view_branches')
  const canManageSuppliers = (): boolean => hasPermission('view_branches')

  const canViewFinancials = (): boolean => hasPermission('view_financials')
  const canManageFinancials = (): boolean => hasAnyPermission(['view_financials', 'export_financial_data'])
  
  // Finance permissions
  const canViewInvoices = (): boolean => hasPermission('view_invoices') || hasPermission('view_financials')
  const canCreateInvoices = (): boolean => hasPermission('create_invoices')
  const canEditInvoices = (): boolean => hasPermission('edit_invoices')
  const canDeleteInvoices = (): boolean => hasPermission('delete_invoices')
  const canSendInvoices = (): boolean => hasPermission('send_invoices')
  const canDownloadInvoices = (): boolean => hasPermission('download_invoices')
  const canManageQuotations = (): boolean => hasPermission('manage_quotations')
  const canManagePayments = (): boolean => hasPermission('manage_payments')
  const canViewPaymentHistory = (): boolean => hasPermission('view_payment_history')
  const canProcessOfflinePayments = (): boolean => hasPermission('process_offline_payments')
  const canViewFinancialOverview = (): boolean => hasPermission('view_financial_overview')
  const canAccessFinanceDashboard = (): boolean => hasPermission('access_finance_dashboard')

  const canViewBranches = (): boolean => hasPermission('view_branches')
  const canManageBranches = (): boolean => hasAnyPermission(['create_branches', 'edit_branches', 'delete_branches'])
  const canManageBranchStaff = (): boolean => hasPermission('edit_users')

  const canViewCustomers = (): boolean => hasPermission('view_customers')
  const canManageCustomers = (): boolean => hasAnyPermission(['create_customers', 'edit_customers'])

  const canViewReports = (): boolean => hasPermission('view_reports')
  const canGenerateReports = (): boolean => hasPermission('export_data')
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
    
    // Finance permissions
    canViewInvoices,
    canCreateInvoices,
    canEditInvoices,
    canDeleteInvoices,
    canSendInvoices,
    canDownloadInvoices,
    canManageQuotations,
    canManagePayments,
    canViewPaymentHistory,
    canProcessOfflinePayments,
    canViewFinancialOverview,
    canAccessFinanceDashboard,
    
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