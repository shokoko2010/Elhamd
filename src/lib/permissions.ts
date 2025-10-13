import { db } from '@/lib/db'

// Define Permission type locally since we can't import from schema
type Permission = string

// Available permissions constants
export const PERMISSIONS = {
  // Bookings
  VIEW_BOOKINGS: 'VIEW_BOOKINGS',
  CREATE_BOOKINGS: 'CREATE_BOOKINGS',
  EDIT_BOOKINGS: 'EDIT_BOOKINGS',
  DELETE_BOOKINGS: 'DELETE_BOOKINGS',
  
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
  
  // Vehicles
  VIEW_VEHICLES: 'VIEW_VEHICLES',
  CREATE_VEHICLES: 'CREATE_VEHICLES',
  EDIT_VEHICLES: 'EDIT_VEHICLES',
  
  // Services
  VIEW_SERVICES: 'VIEW_SERVICES',
  CREATE_SERVICES: 'CREATE_SERVICES',
  EDIT_SERVICES: 'EDIT_SERVICES',
  
  // Reports
  VIEW_REPORTS: 'VIEW_REPORTS',
  
  // Admin
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_SYSTEM: 'VIEW_SYSTEM'
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