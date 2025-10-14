import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Direct permission initialization without using PermissionService
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initializing permissions directly...')
    
    // Define permissions
    const permissions = [
      // User Management
      'view_users', 'create_users', 'edit_users', 'delete_users', 'manage_user_roles', 'manage_user_permissions',
      
      // Vehicle Management
      'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles', 'manage_vehicle_inventory',
      
      // Other permissions...
      'view_bookings', 'create_bookings', 'edit_bookings', 'delete_bookings', 'manage_booking_status',
      'view_services', 'create_services', 'edit_services', 'delete_services', 'manage_service_schedule',
      'view_inventory', 'create_inventory_items', 'edit_inventory_items', 'delete_inventory_items',
      'manage_warehouses', 'manage_suppliers', 'sync_vehicles_to_inventory', 'initialize_inventory_data',
      'view_financials', 'create_invoices', 'edit_invoices', 'delete_invoices', 'manage_payments',
      'view_reports', 'export_financial_data', 'view_branches', 'create_branches', 'edit_branches',
      'delete_branches', 'manage_branch_staff', 'manage_branch_budget', 'approve_branch_transfers',
      'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
      'manage_customer_profiles', 'view_customer_history', 'view_campaigns', 'create_campaigns',
      'edit_campaigns', 'delete_campaigns', 'manage_email_templates', 'view_system_settings',
      'manage_system_settings', 'manage_roles_templates', 'view_system_logs', 'manage_backups',
      'generate_reports', 'view_analytics', 'export_data', 'manage_dashboards'
    ]
    
    // Create permissions
    for (const permissionName of permissions) {
      await db.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: {
          name: permissionName,
          description: `Permission to ${permissionName.replace(/_/g, ' ')}`,
          category: 'SYSTEM_SETTINGS'
        }
      })
    }
    
    console.log('✅ Permissions created')
    
    // Get admin user
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      // Clear existing permissions
      await db.userPermission.deleteMany({
        where: { userId: adminUser.id }
      })
      
      // Add all permissions to admin
      for (const permissionName of permissions) {
        const permission = await db.permission.findUnique({
          where: { name: permissionName }
        })
        
        if (permission) {
          await db.userPermission.create({
            data: {
              userId: adminUser.id,
              permissionId: permission.id
            }
          })
        }
      }
      
      console.log('✅ Admin user permissions updated')
    }
    
    // Check results
    const permissionsCount = await db.permission.count()
    const adminPermissionsCount = await db.userPermission.count({
      where: { userId: adminUser?.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Permissions initialized successfully',
      stats: {
        permissionsCount,
        adminPermissionsCount,
        adminUserFound: !!adminUser
      }
    })
    
  } catch (error) {
    console.error('❌ Error initializing permissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}