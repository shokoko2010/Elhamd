'use client'

import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@prisma/client'
import { ReactNode } from 'react'

interface StaffPermissionsProps {
  children: ReactNode
  requiredPermissions?: string[]
  fallback?: ReactNode
  requireAdmin?: boolean
}

export function StaffPermissions({ 
  children, 
  requiredPermissions = [],
  fallback = null,
  requireAdmin = false
}: StaffPermissionsProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  // Admin users have access to everything
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return <>{children}</>
  }

  // If admin access is required and user is not admin, deny access
  if (requireAdmin && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return <>{fallback}</>
  }

  // Staff users have limited permissions
  if (user.role === UserRole.STAFF) {
    // Define staff permissions for inventory
    const staffPermissions = [
      'view_inventory',
      'view_warehouses',
      'view_suppliers',
      'add_inventory_items',
      'edit_inventory_items',
      'view_reports'
    ]

    // Check if staff has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      staffPermissions.includes(permission)
    )

    if (hasAllPermissions || requiredPermissions.length === 0) {
      return <>{children}</>
    }
  }

  // Branch Manager users have more permissions than staff but less than admin
  if (user.role === UserRole.BRANCH_MANAGER) {
    // Define manager permissions for inventory
    const managerPermissions = [
      'view_inventory',
      'view_warehouses',
      'view_suppliers',
      'add_inventory_items',
      'edit_inventory_items',
      'delete_inventory_items',
      'manage_warehouses',
      'manage_suppliers',
      'view_reports',
      'export_data'
    ]

    // Check if manager has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      managerPermissions.includes(permission)
    )

    if (hasAllPermissions || requiredPermissions.length === 0) {
      return <>{children}</>
    }
  }

  return <>{fallback}</>
}

// Permission constants for easy reference
export const InventoryPermissions = {
  VIEW_INVENTORY: 'view_inventory',
  VIEW_WAREHOUSES: 'view_warehouses',
  VIEW_SUPPLIERS: 'view_suppliers',
  ADD_ITEMS: 'add_inventory_items',
  EDIT_ITEMS: 'edit_inventory_items',
  DELETE_ITEMS: 'delete_inventory_items',
  MANAGE_WAREHOUSES: 'manage_warehouses',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  INITIALIZE_DATA: 'initialize_data',
  SYNC_VEHICLES: 'sync_vehicles'
} as const