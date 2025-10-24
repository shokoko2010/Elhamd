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
    try {
      if (status === 'loading') {
        setLoading(true)
        return
      }

      if (status === 'authenticated' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name,
          role: session.user.role as UserRole,
          phone: session.user.phone,
          branchId: session.user.branchId,
          permissions: session.user.permissions as Permission[] || [],
          isActive: true, // Assuming active if session exists
          emailVerified: true, // Assuming verified if session exists
          lastLoginAt: session.user.lastLoginAt ? new Date(session.user.lastLoginAt) : null,
          createdAt: new Date(), // Default values
          updatedAt: new Date()
        })
        setError(null)
      } else {
        setUser(null)
        setError(null)
      }
    } catch (err) {
      console.error('Auth hook error:', err)
      setError(err instanceof Error ? err.message : 'Authentication error')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [session, status])

  const logout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/login'
    }
  }

  const update = async () => {
    // NextAuth handles session updates automatically
    // This is a placeholder for any manual refresh logic
    if (status === 'authenticated') {
      setLoading(true)
      // NextAuth will automatically refresh the session
      setTimeout(() => setLoading(false), 100)
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