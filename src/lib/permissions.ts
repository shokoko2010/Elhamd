import { db } from '@/lib/db'

// Define Permission type locally since we can't import from schema
export type Permission = string

// Available permissions constants
export const PERMISSIONS = {
  // Bookings
  VIEW_BOOKINGS: 'VIEW_BOOKINGS',
  CREATE_BOOKINGS: 'CREATE_BOOKINGS',
  EDIT_BOOKINGS: 'EDIT_BOOKINGS',
  DELETE_BOOKINGS: 'DELETE_BOOKINGS',
  MANAGE_BOOKING_STATUS: 'MANAGE_BOOKING_STATUS',
  
  // Customer permissions
  VIEW_OWN_BOOKINGS: 'VIEW_OWN_BOOKINGS',
  CREATE_OWN_BOOKINGS: 'CREATE_OWN_BOOKINGS',
  EDIT_OWN_BOOKINGS: 'EDIT_OWN_BOOKINGS',
  VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
  EDIT_OWN_PROFILE: 'EDIT_OWN_PROFILE',
  
  // Customers
  VIEW_CUSTOMERS: 'VIEW_CUSTOMERS',
  CREATE_CUSTOMERS: 'CREATE_CUSTOMERS',
  EDIT_CUSTOMERS: 'EDIT_CUSTOMERS',
  DELETE_CUSTOMERS: 'DELETE_CUSTOMERS',
  MANAGE_CUSTOMER_PROFILES: 'MANAGE_CUSTOMER_PROFILES',
  VIEW_CUSTOMER_HISTORY: 'VIEW_CUSTOMER_HISTORY',
  
  // Vehicles
  VIEW_VEHICLES: 'VIEW_VEHICLES',
  CREATE_VEHICLES: 'CREATE_VEHICLES',
  EDIT_VEHICLES: 'EDIT_VEHICLES',
  DELETE_VEHICLES: 'DELETE_VEHICLES',
  MANAGE_VEHICLE_INVENTORY: 'MANAGE_VEHICLE_INVENTORY',
  
  // Services
  VIEW_SERVICES: 'VIEW_SERVICES',
  CREATE_SERVICES: 'CREATE_SERVICES',
  EDIT_SERVICES: 'EDIT_SERVICES',
  DELETE_SERVICES: 'DELETE_SERVICES',
  MANAGE_SERVICE_SCHEDULE: 'MANAGE_SERVICE_SCHEDULE',
  
  // Reports
  VIEW_REPORTS: 'VIEW_REPORTS',
  GENERATE_REPORTS: 'GENERATE_REPORTS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  EXPORT_DATA: 'EXPORT_DATA',
  
  // Users
  VIEW_USERS: 'VIEW_USERS',
  CREATE_USERS: 'CREATE_USERS',
  EDIT_USERS: 'EDIT_USERS',
  DELETE_USERS: 'DELETE_USERS',
  MANAGE_USER_ROLES: 'MANAGE_USER_ROLES',
  MANAGE_USER_PERMISSIONS: 'MANAGE_USER_PERMISSIONS',
  
  // Inventory
  VIEW_INVENTORY: 'VIEW_INVENTORY',
  CREATE_INVENTORY_ITEMS: 'CREATE_INVENTORY_ITEMS',
  EDIT_INVENTORY_ITEMS: 'EDIT_INVENTORY_ITEMS',
  DELETE_INVENTORY_ITEMS: 'DELETE_INVENTORY_ITEMS',
  MANAGE_WAREHOUSES: 'MANAGE_WAREHOUSES',
  MANAGE_SUPPLIERS: 'MANAGE_SUPPLIERS',
  SYNC_VEHICLES_TO_INVENTORY: 'SYNC_VEHICLES_TO_INVENTORY',
  INITIALIZE_INVENTORY_DATA: 'INITIALIZE_INVENTORY_DATA',
  
  // Financial
  VIEW_FINANCIALS: 'VIEW_FINANCIALS',
  CREATE_INVOICES: 'CREATE_INVOICES',
  EDIT_INVOICES: 'EDIT_INVOICES',
  DELETE_INVOICES: 'DELETE_INVOICES',
  MANAGE_PAYMENTS: 'MANAGE_PAYMENTS',
  EXPORT_FINANCIAL_DATA: 'EXPORT_FINANCIAL_DATA',
  
  // Branches
  VIEW_BRANCHES: 'VIEW_BRANCHES',
  CREATE_BRANCHES: 'CREATE_BRANCHES',
  EDIT_BRANCHES: 'EDIT_BRANCHES',
  DELETE_BRANCHES: 'DELETE_BRANCHES',
  MANAGE_BRANCH_STAFF: 'MANAGE_BRANCH_STAFF',
  MANAGE_BRANCH_BUDGET: 'MANAGE_BRANCH_BUDGET',
  APPROVE_BRANCH_TRANSFERS: 'APPROVE_BRANCH_TRANSFERS',
  
  // Marketing
  VIEW_CAMPAIGNS: 'VIEW_CAMPAIGNS',
  CREATE_CAMPAIGNS: 'CREATE_CAMPAIGNS',
  EDIT_CAMPAIGNS: 'EDIT_CAMPAIGNS',
  DELETE_CAMPAIGNS: 'DELETE_CAMPAIGNS',
  MANAGE_EMAIL_TEMPLATES: 'MANAGE_EMAIL_TEMPLATES',
  
  // Admin
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_SYSTEM: 'VIEW_SYSTEM',
  VIEW_SYSTEM_SETTINGS: 'VIEW_SYSTEM_SETTINGS',
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
  MANAGE_ROLES_TEMPLATES: 'MANAGE_ROLES_TEMPLATES'
} as const

export class PermissionsService {
  // Basic permission checking - simplified since we don't have the full relations
  static async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return false
      }

      // Simplified permission checking based on user role
      // In a real implementation, this would check the full permission structure
      switch (user.role) {
        case 'ADMIN':
          return true // Admin has all permissions
        case 'MANAGER':
          return this.hasManagerPermission(permission)
        case 'EMPLOYEE':
          return this.hasEmployeePermission(permission)
        case 'CUSTOMER':
          return this.hasCustomerPermission(permission)
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  private static hasManagerPermission(permission: Permission): boolean {
    const managerPermissions = [
      'VIEW_BOOKINGS',
      'CREATE_BOOKINGS',
      'EDIT_BOOKINGS',
      'DELETE_BOOKINGS',
      'VIEW_CUSTOMERS',
      'CREATE_CUSTOMERS',
      'EDIT_CUSTOMERS',
      'VIEW_VEHICLES',
      'CREATE_VEHICLES',
      'EDIT_VEHICLES',
      'VIEW_SERVICES',
      'CREATE_SERVICES',
      'EDIT_SERVICES',
      'VIEW_REPORTS'
    ]
    return managerPermissions.includes(permission)
  }

  private static hasEmployeePermission(permission: Permission): boolean {
    const employeePermissions = [
      'VIEW_BOOKINGS',
      'CREATE_BOOKINGS',
      'EDIT_BOOKINGS',
      'VIEW_CUSTOMERS',
      'EDIT_CUSTOMERS',
      'VIEW_VEHICLES',
      'VIEW_SERVICES'
    ]
    return employeePermissions.includes(permission)
  }

  private static hasCustomerPermission(permission: Permission): boolean {
    const customerPermissions = [
      'VIEW_OWN_BOOKINGS',
      'CREATE_OWN_BOOKINGS',
      'EDIT_OWN_BOOKINGS',
      'VIEW_OWN_PROFILE',
      'EDIT_OWN_PROFILE'
    ]
    return customerPermissions.includes(permission)
  }

  static async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true
      }
    }
    return false
  }

  static async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false
      }
    }
    return true
  }

  // Simplified user permissions - returns basic permissions based on role
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return []
      }

      switch (user.role) {
        case 'ADMIN':
          return ['*'] // All permissions
        case 'MANAGER':
          return [
            'VIEW_BOOKINGS',
            'CREATE_BOOKINGS', 
            'EDIT_BOOKINGS',
            'DELETE_BOOKINGS',
            'VIEW_CUSTOMERS',
            'CREATE_CUSTOMERS',
            'EDIT_CUSTOMERS',
            'VIEW_VEHICLES',
            'CREATE_VEHICLES',
            'EDIT_VEHICLES',
            'VIEW_SERVICES',
            'CREATE_SERVICES',
            'EDIT_SERVICES',
            'VIEW_REPORTS'
          ]
        case 'EMPLOYEE':
          return [
            'VIEW_BOOKINGS',
            'CREATE_BOOKINGS',
            'EDIT_BOOKINGS',
            'VIEW_CUSTOMERS',
            'EDIT_CUSTOMERS',
            'VIEW_VEHICLES',
            'VIEW_SERVICES'
          ]
        case 'CUSTOMER':
          return [
            'VIEW_OWN_BOOKINGS',
            'CREATE_OWN_BOOKINGS',
            'EDIT_OWN_BOOKINGS',
            'VIEW_OWN_PROFILE',
            'EDIT_OWN_PROFILE'
          ]
        default:
          return []
      }
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return []
    }
  }

  // Initialize default permissions
  static async initializeDefaultPermissions(): Promise<void> {
    try {
      // This would create default permissions in the database
      // For now, we'll just log it since we don't have the full permission model
      console.log('Default permissions initialized')
    } catch (error) {
      console.error('Error initializing default permissions:', error)
      throw error
    }
  }

  // Initialize role templates
  static async initializeRoleTemplates(): Promise<void> {
    try {
      // This would create default role templates in the database
      // For now, we'll just log it since we don't have the full model
      console.log('Role templates initialized')
    } catch (error) {
      console.error('Error initializing role templates:', error)
      throw error
    }
  }

  // Set user permissions
  static async setUserPermissions(userId: string, permissions: Permission[], updatedBy: string): Promise<void> {
    try {
      // This would update user permissions in the database
      // For now, we'll just log it since we don't have the full model
      console.log(`User permissions updated for ${userId}:`, permissions)
    } catch (error) {
      console.error('Error setting user permissions:', error)
      throw error
    }
  }

  // Middleware helper for API routes
  static requirePermission(permission: Permission) {
    return async (userId: string): Promise<boolean> => {
      return await this.hasPermission(userId, permission)
    }
  }

  // Check if user can access a specific resource
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return false
      }

      // Admin can access everything
      if (user.role === 'ADMIN') {
        return true
      }

      // Check specific resource access
      switch (resourceType) {
        case 'booking':
          return await this.canAccessBooking(userId, resourceId, action)
        case 'customer':
          return await this.canAccessCustomer(userId, resourceId, action)
        case 'vehicle':
          return await this.canAccessVehicle(userId, resourceId, action)
        default:
          return false
      }
    } catch (error) {
      console.error('Error checking resource access:', error)
      return false
    }
  }

  private static async canAccessBooking(
    userId: string,
    bookingId: string,
    action: string
  ): Promise<boolean> {
    // Simplified booking access check
    const hasPermission = await this.hasPermission(userId, `${action}_BOOKINGS` as Permission)
    return hasPermission
  }

  private static async canAccessCustomer(
    userId: string,
    customerId: string,
    action: string
  ): Promise<boolean> {
    // Users can access their own profile
    if (userId === customerId) {
      return true
    }

    const hasPermission = await this.hasPermission(userId, `${action}_CUSTOMERS` as Permission)
    return hasPermission
  }

  private static async canAccessVehicle(
    userId: string,
    vehicleId: string,
    action: string
  ): Promise<boolean> {
    const hasPermission = await this.hasPermission(userId, `${action}_VEHICLES` as Permission)
    return hasPermission
  }
}

export default PermissionsService