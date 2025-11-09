import { db } from './db'
import { UserRole as PrismaUserRole, PermissionCategory, Prisma } from '@prisma/client'

// Define UserRole enum locally to match Prisma enum
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  STAFF = 'STAFF',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Permission constants
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USER_ROLES: 'manage_user_roles',
  MANAGE_USER_PERMISSIONS: 'manage_user_permissions',
  
  // Vehicle Management
  VIEW_VEHICLES: 'view_vehicles',
  CREATE_VEHICLES: 'create_vehicles',
  EDIT_VEHICLES: 'edit_vehicles',
  DELETE_VEHICLES: 'delete_vehicles',
  MANAGE_VEHICLE_INVENTORY: 'manage_vehicle_inventory',
  
  // Booking Management
  VIEW_BOOKINGS: 'view_bookings',
  CREATE_BOOKINGS: 'create_bookings',
  EDIT_BOOKINGS: 'edit_bookings',
  DELETE_BOOKINGS: 'delete_bookings',
  MANAGE_BOOKING_STATUS: 'manage_booking_status',
  
  // Service Management
  VIEW_SERVICES: 'view_services',
  CREATE_SERVICES: 'create_services',
  EDIT_SERVICES: 'edit_services',
  DELETE_SERVICES: 'delete_services',
  MANAGE_SERVICE_SCHEDULE: 'manage_service_schedule',
  
  // Inventory Management
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY_ITEMS: 'create_inventory_items',
  EDIT_INVENTORY_ITEMS: 'edit_inventory_items',
  DELETE_INVENTORY_ITEMS: 'delete_inventory_items',
  MANAGE_WAREHOUSES: 'manage_warehouses',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  SYNC_VEHICLES_TO_INVENTORY: 'sync_vehicles_to_inventory',
  INITIALIZE_INVENTORY_DATA: 'initialize_inventory_data',
  
  // Financial Management
  VIEW_FINANCIALS: 'view_financials',
  CREATE_INVOICES: 'create_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',
  MANAGE_PAYMENTS: 'manage_payments',
  VIEW_REPORTS: 'view_reports',
  EXPORT_FINANCIAL_DATA: 'export_financial_data',
  
  // Enhanced Financial Permissions
  VIEW_INVOICES: 'view_invoices',
  CREATE_QUOTATIONS: 'create_quotations',
  EDIT_QUOTATIONS: 'edit_quotations',
  DELETE_QUOTATIONS: 'delete_quotations',
  VIEW_PAYMENTS: 'view_payments',
  CREATE_PAYMENTS: 'create_payments',
  EDIT_PAYMENTS: 'edit_payments',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  APPROVE_INVOICES: 'approve_invoices',
  SEND_INVOICES: 'send_invoices',
  DOWNLOAD_INVOICES: 'download_invoices',
  MANAGE_QUOTATIONS: 'manage_quotations',
  APPROVE_QUOTATIONS: 'approve_quotations',
  CONVERT_QUOTATIONS: 'convert_quotations',
  PROCESS_OFFLINE_PAYMENTS: 'process_offline_payments',
  MANAGE_PAYMENT_METHODS: 'manage_payment_methods',
  VIEW_PAYMENT_HISTORY: 'view_payment_history',
  REFUND_PAYMENTS: 'refund_payments',
  MANAGE_TAX_SETTINGS: 'manage_tax_settings',
  VIEW_FINANCIAL_OVERVIEW: 'view_financial_overview',
  ACCESS_FINANCE_DASHBOARD: 'access_finance_dashboard',
  
  // Branch Management
  VIEW_BRANCHES: 'view_branches',
  CREATE_BRANCHES: 'create_branches',
  EDIT_BRANCHES: 'edit_branches',
  DELETE_BRANCHES: 'delete_branches',
  MANAGE_BRANCH_STAFF: 'manage_branch_staff',
  MANAGE_BRANCH_BUDGET: 'manage_branch_budget',
  APPROVE_BRANCH_TRANSFERS: 'approve_branch_transfers',
  
  // Customer Management
  VIEW_CUSTOMERS: 'view_customers',
  CREATE_CUSTOMERS: 'create_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  MANAGE_CUSTOMER_PROFILES: 'manage_customer_profiles',
  VIEW_CUSTOMER_HISTORY: 'view_customer_history',
  
  // Marketing Management
  VIEW_CAMPAIGNS: 'view_campaigns',
  CREATE_CAMPAIGNS: 'create_campaigns',
  EDIT_CAMPAIGNS: 'edit_campaigns',
  DELETE_CAMPAIGNS: 'delete_campaigns',
  MANAGE_EMAIL_TEMPLATES: 'manage_email_templates',
  
  // System Settings
  VIEW_SYSTEM_SETTINGS: 'view_system_settings',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  MANAGE_ROLES_TEMPLATES: 'manage_roles_templates',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  MANAGE_BACKUPS: 'manage_backups',
  
  // Reporting
  GENERATE_REPORTS: 'generate_reports',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  MANAGE_DASHBOARDS: 'manage_dashboards',
  VIEW_DASHBOARD: 'view_dashboard'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [PERMISSIONS.VIEW_USERS]: 'View user list and details',
  [PERMISSIONS.CREATE_USERS]: 'Create new users',
  [PERMISSIONS.EDIT_USERS]: 'Edit user information',
  [PERMISSIONS.DELETE_USERS]: 'Delete users',
  [PERMISSIONS.MANAGE_USER_ROLES]: 'Manage user roles and assignments',
  [PERMISSIONS.MANAGE_USER_PERMISSIONS]: 'Manage user permissions and access',
  [PERMISSIONS.VIEW_VEHICLES]: 'View vehicle inventory and details',
  [PERMISSIONS.CREATE_VEHICLES]: 'Add new vehicles to inventory',
  [PERMISSIONS.EDIT_VEHICLES]: 'Edit vehicle information',
  [PERMISSIONS.DELETE_VEHICLES]: 'Remove vehicles from inventory',
  [PERMISSIONS.MANAGE_VEHICLE_INVENTORY]: 'Manage vehicle inventory levels',
  [PERMISSIONS.VIEW_BOOKINGS]: 'View booking list and details',
  [PERMISSIONS.CREATE_BOOKINGS]: 'Create new bookings',
  [PERMISSIONS.EDIT_BOOKINGS]: 'Edit booking information',
  [PERMISSIONS.DELETE_BOOKINGS]: 'Cancel or delete bookings',
  [PERMISSIONS.MANAGE_BOOKING_STATUS]: 'Change booking statuses',
  [PERMISSIONS.VIEW_SERVICES]: 'View service list and details',
  [PERMISSIONS.CREATE_SERVICES]: 'Create new services',
  [PERMISSIONS.EDIT_SERVICES]: 'Edit service information',
  [PERMISSIONS.DELETE_SERVICES]: 'Delete services',
  [PERMISSIONS.MANAGE_SERVICE_SCHEDULE]: 'Manage service schedules and time slots',
  [PERMISSIONS.VIEW_INVENTORY]: 'View inventory items and stock levels',
  [PERMISSIONS.CREATE_INVENTORY_ITEMS]: 'Add new inventory items',
  [PERMISSIONS.EDIT_INVENTORY_ITEMS]: 'Edit inventory item information',
  [PERMISSIONS.DELETE_INVENTORY_ITEMS]: 'Remove inventory items',
  [PERMISSIONS.MANAGE_WAREHOUSES]: 'Manage warehouse information and settings',
  [PERMISSIONS.MANAGE_SUPPLIERS]: 'Manage supplier information and relationships',
  [PERMISSIONS.SYNC_VEHICLES_TO_INVENTORY]: 'Sync vehicles with inventory system',
  [PERMISSIONS.INITIALIZE_INVENTORY_DATA]: 'Initialize inventory with default data',
  [PERMISSIONS.VIEW_FINANCIALS]: 'View financial reports and data',
  [PERMISSIONS.VIEW_INVOICES]: 'View invoice list and details',
  [PERMISSIONS.CREATE_INVOICES]: 'Create new invoices',
  [PERMISSIONS.EDIT_INVOICES]: 'Edit invoice information',
  [PERMISSIONS.DELETE_INVOICES]: 'Delete invoices',
  [PERMISSIONS.APPROVE_INVOICES]: 'Approve invoice validation',
  [PERMISSIONS.SEND_INVOICES]: 'Send invoices to customers',
  [PERMISSIONS.DOWNLOAD_INVOICES]: 'Download invoice PDFs',
  [PERMISSIONS.MANAGE_QUOTATIONS]: 'Manage price quotations',
  [PERMISSIONS.APPROVE_QUOTATIONS]: 'Approve price quotations',
  [PERMISSIONS.CONVERT_QUOTATIONS]: 'Convert quotations to invoices',
  [PERMISSIONS.MANAGE_PAYMENTS]: 'Manage payment processing and records',
  [PERMISSIONS.PROCESS_OFFLINE_PAYMENTS]: 'Process offline/cash payments',
  [PERMISSIONS.MANAGE_PAYMENT_METHODS]: 'Manage payment methods and gateways',
  [PERMISSIONS.VIEW_PAYMENT_HISTORY]: 'View payment history and records',
  [PERMISSIONS.REFUND_PAYMENTS]: 'Process payment refunds',
  [PERMISSIONS.MANAGE_TAX_SETTINGS]: 'Configure tax settings and rates',
  [PERMISSIONS.VIEW_REPORTS]: 'View financial reports and analytics',
  [PERMISSIONS.EXPORT_FINANCIAL_DATA]: 'Export financial data',
  [PERMISSIONS.VIEW_FINANCIAL_OVERVIEW]: 'View overall financial status',
  [PERMISSIONS.ACCESS_FINANCE_DASHBOARD]: 'Access finance dashboard',
  [PERMISSIONS.VIEW_BRANCHES]: 'View branch list and details',
  [PERMISSIONS.CREATE_BRANCHES]: 'Create new branches',
  [PERMISSIONS.EDIT_BRANCHES]: 'Edit branch information',
  [PERMISSIONS.DELETE_BRANCHES]: 'Delete branches',
  [PERMISSIONS.MANAGE_BRANCH_STAFF]: 'Manage staff assignments for branches',
  [PERMISSIONS.MANAGE_BRANCH_BUDGET]: 'Manage branch budgets',
  [PERMISSIONS.APPROVE_BRANCH_TRANSFERS]: 'Approve branch transfers',
  [PERMISSIONS.VIEW_CUSTOMERS]: 'View customer list and details',
  [PERMISSIONS.CREATE_CUSTOMERS]: 'Create new customer records',
  [PERMISSIONS.EDIT_CUSTOMERS]: 'Edit customer information',
  [PERMISSIONS.DELETE_CUSTOMERS]: 'Delete customer records',
  [PERMISSIONS.MANAGE_CUSTOMER_PROFILES]: 'Manage customer profiles',
  [PERMISSIONS.VIEW_CUSTOMER_HISTORY]: 'View customer interaction history',
  [PERMISSIONS.VIEW_CAMPAIGNS]: 'View marketing campaigns',
  [PERMISSIONS.CREATE_CAMPAIGNS]: 'Create marketing campaigns',
  [PERMISSIONS.EDIT_CAMPAIGNS]: 'Edit marketing campaigns',
  [PERMISSIONS.DELETE_CAMPAIGNS]: 'Delete marketing campaigns',
  [PERMISSIONS.MANAGE_EMAIL_TEMPLATES]: 'Manage email templates',
  [PERMISSIONS.VIEW_SYSTEM_SETTINGS]: 'View system settings',
  [PERMISSIONS.MANAGE_SYSTEM_SETTINGS]: 'Manage system configuration',
  [PERMISSIONS.MANAGE_ROLES_TEMPLATES]: 'Manage role templates',
  [PERMISSIONS.VIEW_SYSTEM_LOGS]: 'View system logs',
  [PERMISSIONS.MANAGE_BACKUPS]: 'Manage system backups',
  [PERMISSIONS.GENERATE_REPORTS]: 'Generate analytical reports',
  [PERMISSIONS.VIEW_ANALYTICS]: 'View analytics dashboards',
  [PERMISSIONS.EXPORT_DATA]: 'Export platform data',
  [PERMISSIONS.MANAGE_DASHBOARDS]: 'Manage dashboard layouts and widgets',
  [PERMISSIONS.VIEW_DASHBOARD]: 'View dashboard insights'
}

export function inferPermissionCategory(permission: Permission): PermissionCategory {
  if (permission.includes('user')) return PermissionCategory.USER_MANAGEMENT
  if (permission.includes('vehicle')) return PermissionCategory.VEHICLE_MANAGEMENT
  if (permission.includes('booking')) return PermissionCategory.BOOKING_MANAGEMENT
  if (permission.includes('service')) return PermissionCategory.SERVICE_MANAGEMENT
  if (
    permission.includes('inventory') ||
    permission.includes('warehouse') ||
    permission.includes('supplier')
  ) {
    return PermissionCategory.INVENTORY_MANAGEMENT
  }
  if (
    permission.includes('financial') ||
    permission.includes('invoice') ||
    permission.includes('payment') ||
    permission.includes('quotation') ||
    permission.includes('tax')
  ) {
    return PermissionCategory.FINANCIAL_MANAGEMENT
  }
  if (permission.includes('branch')) return PermissionCategory.BRANCH_MANAGEMENT
  if (permission.includes('customer')) return PermissionCategory.CUSTOMER_MANAGEMENT
  if (
    permission.includes('campaign') ||
    permission.includes('marketing') ||
    permission.includes('email')
  ) {
    return PermissionCategory.MARKETING_MANAGEMENT
  }
  if (
    permission.includes('system') ||
    permission.includes('setting') ||
    permission.includes('log') ||
    permission.includes('backup')
  ) {
    return PermissionCategory.SYSTEM_SETTINGS
  }
  if (
    permission.includes('report') ||
    permission.includes('analytics') ||
    permission.includes('export') ||
    permission.includes('dashboard')
  ) {
    return PermissionCategory.REPORTING
  }

  return PermissionCategory.SYSTEM_SETTINGS
}

export function getPermissionMetadata(permission: Permission): {
  category: PermissionCategory
  description: string
} {
  const category = inferPermissionCategory(permission)
  const description = PERMISSION_DESCRIPTIONS[permission] ?? permission.replace(/_/g, ' ')

  return { category, description }
}

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [UserRole.ADMIN]: [
    // User Management
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_USER_ROLES,
    PERMISSIONS.MANAGE_USER_PERMISSIONS,
    
    // Vehicle Management
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.CREATE_VEHICLES,
    PERMISSIONS.EDIT_VEHICLES,
    PERMISSIONS.DELETE_VEHICLES,
    PERMISSIONS.MANAGE_VEHICLE_INVENTORY,
    
    // Booking Management
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.CREATE_BOOKINGS,
    PERMISSIONS.EDIT_BOOKINGS,
    PERMISSIONS.DELETE_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKING_STATUS,
    
    // Service Management
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.CREATE_SERVICES,
    PERMISSIONS.EDIT_SERVICES,
    PERMISSIONS.DELETE_SERVICES,
    PERMISSIONS.MANAGE_SERVICE_SCHEDULE,
    
    // Inventory Management
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY_ITEMS,
    PERMISSIONS.EDIT_INVENTORY_ITEMS,
    PERMISSIONS.DELETE_INVENTORY_ITEMS,
    PERMISSIONS.MANAGE_WAREHOUSES,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.SYNC_VEHICLES_TO_INVENTORY,
    PERMISSIONS.INITIALIZE_INVENTORY_DATA,
    
    // Financial Management
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.DELETE_INVOICES,
    PERMISSIONS.APPROVE_INVOICES,
    PERMISSIONS.SEND_INVOICES,
    PERMISSIONS.DOWNLOAD_INVOICES,
    PERMISSIONS.MANAGE_QUOTATIONS,
    PERMISSIONS.APPROVE_QUOTATIONS,
    PERMISSIONS.CONVERT_QUOTATIONS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.PROCESS_OFFLINE_PAYMENTS,
    PERMISSIONS.MANAGE_PAYMENT_METHODS,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.REFUND_PAYMENTS,
    PERMISSIONS.MANAGE_TAX_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_FINANCIAL_DATA,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW,
    PERMISSIONS.ACCESS_FINANCE_DASHBOARD,
    
    // Branch Management
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.CREATE_BRANCHES,
    PERMISSIONS.EDIT_BRANCHES,
    PERMISSIONS.DELETE_BRANCHES,
    PERMISSIONS.MANAGE_BRANCH_STAFF,
    PERMISSIONS.MANAGE_BRANCH_BUDGET,
    PERMISSIONS.APPROVE_BRANCH_TRANSFERS,
    
    // Customer Management
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.DELETE_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMER_PROFILES,
    PERMISSIONS.VIEW_CUSTOMER_HISTORY,
    
    // Marketing Management
    PERMISSIONS.VIEW_CAMPAIGNS,
    PERMISSIONS.CREATE_CAMPAIGNS,
    PERMISSIONS.EDIT_CAMPAIGNS,
    PERMISSIONS.DELETE_CAMPAIGNS,
    PERMISSIONS.MANAGE_EMAIL_TEMPLATES,
    
    // System Settings
    PERMISSIONS.VIEW_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_ROLES_TEMPLATES,
    PERMISSIONS.VIEW_SYSTEM_LOGS,
    PERMISSIONS.MANAGE_BACKUPS,
    
    // Reporting
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_DASHBOARDS,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  [UserRole.BRANCH_MANAGER]: [
    // User Management (limited to branch)
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.MANAGE_USER_ROLES,
    
    // Vehicle Management (limited to branch)
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.CREATE_VEHICLES,
    PERMISSIONS.EDIT_VEHICLES,
    PERMISSIONS.MANAGE_VEHICLE_INVENTORY,
    
    // Booking Management
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.CREATE_BOOKINGS,
    PERMISSIONS.EDIT_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKING_STATUS,
    
    // Service Management
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.CREATE_SERVICES,
    PERMISSIONS.EDIT_SERVICES,
    PERMISSIONS.MANAGE_SERVICE_SCHEDULE,
    
    // Inventory Management
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY_ITEMS,
    PERMISSIONS.EDIT_INVENTORY_ITEMS,
    PERMISSIONS.MANAGE_WAREHOUSES,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.SYNC_VEHICLES_TO_INVENTORY,
    
    // Financial Management (limited to branch)
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.SEND_INVOICES,
    PERMISSIONS.DOWNLOAD_INVOICES,
    PERMISSIONS.MANAGE_QUOTATIONS,
    PERMISSIONS.CONVERT_QUOTATIONS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.PROCESS_OFFLINE_PAYMENTS,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW,
    PERMISSIONS.ACCESS_FINANCE_DASHBOARD,
    
    // Branch Management (limited to own branch)
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.EDIT_BRANCHES,
    PERMISSIONS.MANAGE_BRANCH_STAFF,
    PERMISSIONS.MANAGE_BRANCH_BUDGET,
    
    // Customer Management
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMER_PROFILES,
    PERMISSIONS.VIEW_CUSTOMER_HISTORY,
    
    // Marketing Management (limited)
    PERMISSIONS.VIEW_CAMPAIGNS,
    
    // Reporting
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  [UserRole.ACCOUNTANT]: [
    // User Management (very limited)
    PERMISSIONS.VIEW_USERS,
    
    // Vehicle Management (view only)
    PERMISSIONS.VIEW_VEHICLES,
    
    // Booking Management (view only)
    PERMISSIONS.VIEW_BOOKINGS,
    
    // Service Management (view only)
    PERMISSIONS.VIEW_SERVICES,
    
    // Inventory Management (view only)
    PERMISSIONS.VIEW_INVENTORY,
    
    // Financial Management (full access)
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.DELETE_INVOICES,
    PERMISSIONS.APPROVE_INVOICES,
    PERMISSIONS.SEND_INVOICES,
    PERMISSIONS.DOWNLOAD_INVOICES,
    PERMISSIONS.CREATE_QUOTATIONS,
    PERMISSIONS.EDIT_QUOTATIONS,
    PERMISSIONS.DELETE_QUOTATIONS,
    PERMISSIONS.MANAGE_QUOTATIONS,
    PERMISSIONS.APPROVE_QUOTATIONS,
    PERMISSIONS.CONVERT_QUOTATIONS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENTS,
    PERMISSIONS.EDIT_PAYMENTS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.PROCESS_OFFLINE_PAYMENTS,
    PERMISSIONS.MANAGE_PAYMENT_METHODS,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.REFUND_PAYMENTS,
    PERMISSIONS.MANAGE_TAX_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_FINANCIAL_DATA,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW,
    PERMISSIONS.ACCESS_FINANCE_DASHBOARD,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    
    // Branch Management (view only)
    PERMISSIONS.VIEW_BRANCHES,
    
    // Customer Management
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_HISTORY,
    
    // Reporting
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_DASHBOARDS,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  [UserRole.STAFF]: [
    // User Management (very limited)
    PERMISSIONS.VIEW_USERS,
    
    // Vehicle Management (view only)
    PERMISSIONS.VIEW_VEHICLES,
    
    // Booking Management
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.CREATE_BOOKINGS,
    PERMISSIONS.EDIT_BOOKINGS,
    
    // Service Management
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.CREATE_SERVICES,
    PERMISSIONS.EDIT_SERVICES,
    
    // Inventory Management
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY_ITEMS,
    PERMISSIONS.EDIT_INVENTORY_ITEMS,
    
    // Financial Management (view only)
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW,
    
    // Branch Management (view only)
    PERMISSIONS.VIEW_BRANCHES,
    
    // Customer Management
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_HISTORY,
    
    // Reporting (view only)
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_DASHBOARD
  ],
  [UserRole.CUSTOMER]: [
    // Very limited permissions for customers
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.CREATE_BOOKINGS,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.CREATE_SERVICES,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMER_PROFILES
  ]
} as const

// Permission service class
export class PermissionService {
  private static coercePermissionList(value: unknown): Permission[] {
    if (!value) {
      return []
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === 'string' ? entry : undefined))
        .filter((permission): permission is Permission => Boolean(permission))
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return this.coercePermissionList(parsed)
      } catch (error) {
        return []
      }
    }

    if (typeof value === 'object') {
      const values = Object.values(value as Record<string, unknown>)
      return this.coercePermissionList(values)
    }

    return []
  }

  static async initializeDefaultPermissions() {
    const permissions = Object.values(PERMISSIONS)

    for (const permissionName of permissions) {
      const { category, description } = getPermissionMetadata(permissionName)

      await db.permission.upsert({
        where: { name: permissionName },
        update: {
          description,
          category
        },
        create: {
          name: permissionName,
          description,
          category
        }
      })
    }
  }

  static async initializeRoleTemplates() {
    const roles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.BRANCH_MANAGER, UserRole.STAFF, UserRole.CUSTOMER]

    await this.initializeDefaultPermissions()

    const permissionRecords = await db.permission.findMany({
      select: { id: true, name: true }
    })
    const permissionLookup = new Map(permissionRecords.map(record => [record.name, record.id]))

    for (const role of roles) {
      const permissions = Array.from(new Set(DEFAULT_ROLE_PERMISSIONS[role] ?? []))
      const templateName = `${role}_TEMPLATE`
      const jsonPermissions = permissions as unknown as Prisma.JsonArray

      const template = await db.roleTemplate.upsert({
        where: { name: templateName },
        update: {
          description: `Default permissions for ${role} role`,
          role,
          permissions: jsonPermissions,
          isSystem: true,
          isActive: true
        },
        create: {
          name: templateName,
          description: `Default permissions for ${role} role`,
          role,
          permissions: jsonPermissions,
          isSystem: true,
          isActive: true
        }
      })

      const permissionIds = permissions
        .map(permissionName => permissionLookup.get(permissionName))
        .filter((value): value is string => Boolean(value))

      await db.roleTemplatePermission.deleteMany({ where: { templateId: template.id } })

      if (permissionIds.length > 0) {
        await db.roleTemplatePermission.createMany({
          data: permissionIds.map(permissionId => ({
            templateId: template.id,
            permissionId
          })),
          skipDuplicates: true
        })
      }
    }
  }

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          },
          roleTemplate: {
            include: {
              roleTemplatePermissions: {
                include: { permission: true }
              }
            }
          },
          branchPermissions: true
        }
      })

      if (!user) {
        return []
      }

      let permissions: Permission[] = []

      // For admin users, return all permissions to simplify
      if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
        return Object.values(PERMISSIONS)
      }

      // Start with role template permissions
      if (user.roleTemplate) {
        const templatePermissionsFromRelation = user.roleTemplate.roleTemplatePermissions?.map(
          (edge) => edge.permission?.name as Permission | undefined
        )
        const relationPermissions = (templatePermissionsFromRelation ?? []).filter(
          (permission): permission is Permission => Boolean(permission)
        )

        const storedPermissions = this.coercePermissionList(user.roleTemplate.permissions)

        const combinedTemplatePermissions = new Set<Permission>([
          ...relationPermissions,
          ...storedPermissions
        ])

        permissions = [...permissions, ...combinedTemplatePermissions]
      }

      // Add custom permissions if they exist
      permissions = [
        ...permissions,
        ...this.coercePermissionList(user.customPermissions)
      ]

      // Add individual user permissions
      const userPermissions = user.permissions.map(up => up.permission.name as Permission)
      permissions = [...permissions, ...userPermissions]

      // Add branch-specific permissions if user is assigned to a branch
      if (user.branchId) {
        const branchPermission = user.branchPermissions.find(bp => bp.branchId === user.branchId)
        if (branchPermission?.permissions) {
          try {
            const branchPermissions = JSON.parse(branchPermission.permissions)
            permissions = [...permissions, ...branchPermissions]
          } catch (error) {
            // Error parsing branch permissions
          }
        }
      }

      // Remove duplicates
      const uniquePermissions = [...new Set(permissions)]
      
      return uniquePermissions
    } catch (error) {
      // Return default permissions based on role if database fails
      try {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { role: true }
        })
        
        if (user) {
          if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
            return Object.values(PERMISSIONS)
          } else if (user.role === UserRole.ACCOUNTANT) {
            return [
              PERMISSIONS.VIEW_INVOICES,
              PERMISSIONS.CREATE_INVOICES,
              PERMISSIONS.EDIT_INVOICES,
              PERMISSIONS.DELETE_INVOICES,
              PERMISSIONS.VIEW_QUOTATIONS,
              PERMISSIONS.CREATE_QUOTATIONS,
              PERMISSIONS.EDIT_QUOTATIONS,
              PERMISSIONS.DELETE_QUOTATIONS,
              PERMISSIONS.VIEW_PAYMENTS,
              PERMISSIONS.CREATE_PAYMENTS,
              PERMISSIONS.EDIT_PAYMENTS,
              PERMISSIONS.VIEW_FINANCIAL_REPORTS
            ]
          } else if (user.role === UserRole.BRANCH_MANAGER) {
            return [
              PERMISSIONS.MANAGE_VEHICLE_INVENTORY,
              PERMISSIONS.VIEW_VEHICLES,
              PERMISSIONS.EDIT_VEHICLES,
              PERMISSIONS.CREATE_VEHICLES,
              PERMISSIONS.VIEW_INVOICES,
              PERMISSIONS.CREATE_INVOICES,
              PERMISSIONS.EDIT_INVOICES
            ]
          } else if (user.role === UserRole.STAFF) {
            return [
              PERMISSIONS.VIEW_VEHICLES,
              PERMISSIONS.EDIT_VEHICLES,
              PERMISSIONS.VIEW_INVOICES
            ]
          }
        }
      } catch (e) {
        // Final fallback
      }
      
      return []
    }
  }

  static async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return userPermissions.includes(permission)
  }

  static async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return permissions.some(permission => userPermissions.includes(permission))
  }

  static async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return permissions.every(permission => userPermissions.includes(permission))
  }

  static async setUserPermissions(userId: string, permissions: Permission[], grantedBy?: string) {
    // Clear existing permissions
    await db.userPermission.deleteMany({
      where: { userId }
    })

    // Add new permissions
    const permissionRecords = await db.permission.findMany({
      where: { name: { in: permissions } },
      select: { id: true }
    })

    if (permissionRecords.length === 0) {
      return
    }

    await db.userPermission.createMany({
      data: permissionRecords.map((permission) => ({
        userId,
        permissionId: permission.id,
        grantedBy
      })),
      skipDuplicates: true
    })
  }

  static async applyTemplateToUser(
    userId: string,
    templateId: string,
    options?: {
      grantedBy?: string
      additionalPermissions?: Permission[]
      preserveManualPermissions?: boolean
    }
  ) {
    const template = await db.roleTemplate.findUnique({
      where: { id: templateId },
      include: {
        roleTemplatePermissions: {
          include: { permission: true }
        }
      }
    })

    if (!template) {
      throw new Error('Role template not found')
    }

    const templatePermissions = template.roleTemplatePermissions
      .map((edge) => edge.permission?.name as Permission | undefined)
      .filter((permission): permission is Permission => Boolean(permission))

    const manualPermissions = options?.preserveManualPermissions
      ? await this.getUserPermissions(userId)
      : []

    const mergedManualPermissions = new Set<Permission>([...manualPermissions])

    for (const permission of options?.additionalPermissions ?? []) {
      mergedManualPermissions.add(permission)
    }

    const manualOnlyPermissions = Array.from(mergedManualPermissions).filter(
      (permission) => !templatePermissions.includes(permission)
    )

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          role: template.role as PrismaUserRole,
          roleTemplateId: template.id,
          updatedAt: new Date()
        }
      })

      await tx.userPermission.deleteMany({ where: { userId } })

      if (manualOnlyPermissions.length > 0) {
        const permissionRecords = await tx.permission.findMany({
          where: { name: { in: manualOnlyPermissions } },
          select: { id: true }
        })

        if (permissionRecords.length > 0) {
          await tx.userPermission.createMany({
            data: permissionRecords.map((record) => ({
              userId,
              permissionId: record.id,
              grantedBy: options?.grantedBy
            })),
            skipDuplicates: true
          })
        }
      }
    })
  }

  static async setBranchPermissions(userId: string, branchId: string, permissions: Permission[], grantedBy?: string) {
    await db.branchPermission.upsert({
      where: {
        userId_branchId: {
          userId,
          branchId
        }
      },
      update: {
        permissions: JSON.stringify(permissions),
        grantedBy,
        updatedAt: new Date()
      },
      create: {
        userId,
        branchId,
        permissions: JSON.stringify(permissions),
        grantedBy
      }
    })
  }


}
