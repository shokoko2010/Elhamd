'use client'

import { useAuth as useAuthBase } from '@/hooks/use-auth'

export function useAuth() {
  try {
    return useAuthBase()
  } catch (error) {
    console.warn('useAuth hook failed, returning safe defaults:', error)
    
    // Return safe defaults that won't break the UI
    return {
      user: null,
      loading: false,
      error: null,
      authenticated: false,
      unauthenticated: true,
      hasRole: () => false,
      hasAnyRole: () => false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      isAdmin: () => false,
      isBranchManager: () => false,
      isStaff: () => false,
      isCustomer: () => false,
      logout: async () => {
        console.warn('Logout called but auth is not available')
        window.location.href = '/login'
      },
      update: async () => {
        console.warn('Update called but auth is not available')
      },
      
      // Permission helpers - all return false
      canViewUsers: () => false,
      canManageUsers: () => false,
      canManageRoles: () => false,
      canManagePermissions: () => false,
      canViewVehicles: () => false,
      canManageVehicles: () => false,
      canViewBookings: () => false,
      canManageBookings: () => false,
      canViewServices: () => false,
      canManageServices: () => false,
      canViewInventory: () => false,
      canManageInventory: () => false,
      canManageWarehouses: () => false,
      canManageSuppliers: () => false,
      canViewFinancials: () => false,
      canManageFinancials: () => false,
      
      // Finance permissions
      canViewInvoices: () => false,
      canCreateInvoices: () => false,
      canEditInvoices: () => false,
      canDeleteInvoices: () => false,
      canSendInvoices: () => false,
      canDownloadInvoices: () => false,
      canManageQuotations: () => false,
      canManagePayments: () => false,
      canViewPaymentHistory: () => false,
      canProcessOfflinePayments: () => false,
      canViewFinancialOverview: () => false,
      canAccessFinanceDashboard: () => false,
      
      canViewBranches: () => false,
      canManageBranches: () => false,
      canManageBranchStaff: () => false,
      canViewCustomers: () => false,
      canManageCustomers: () => false,
      canViewReports: () => false,
      canGenerateReports: () => false,
      canExportData: () => false,
      canManageSystemSettings: () => false,
      canManageRoleTemplates: () => false,
    }
  }
}