import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PermissionService, PERMISSIONS } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INITIALIZING FINANCE PERMISSIONS ===')
    
    // Authenticate user
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({
        error: 'المصادقة مطلوبة',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Check if user is admin
    if (authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        error: 'صلاحية غير كافية',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 })
    }

    // Initialize all permissions
    await PermissionService.initializeDefaultPermissions()
    console.log('Default permissions initialized')

    // Initialize role templates
    await PermissionService.initializeRoleTemplates()
    console.log('Role templates initialized')

    // Get all finance permissions
    const financePermissions = [
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
      PERMISSIONS.ACCESS_FINANCE_DASHBOARD
    ]

    // Get permission IDs
    const permissionRecords = await db.permission.findMany({
      where: {
        name: { in: financePermissions }
      }
    })

    console.log(`Found ${permissionRecords.length} finance permissions`)

    // Update ADMIN and SUPER_ADMIN users with all finance permissions
    const adminUsers = await db.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    })

    for (const user of adminUsers) {
      console.log(`Updating permissions for admin user: ${user.email}`)
      
      // Clear existing finance permissions
      await db.userPermission.deleteMany({
        where: {
          userId: user.id,
          permissionId: { in: permissionRecords.map(p => p.id) }
        }
      })

      // Add all finance permissions
      for (const permission of permissionRecords) {
        await db.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: user.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            permissionId: permission.id,
            grantedBy: authUser.id
          }
        })
      }
    }

    // Update BRANCH_MANAGER users with limited finance permissions
    const branchManagerPermissions = [
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
      PERMISSIONS.ACCESS_FINANCE_DASHBOARD
    ]

    const branchManagerPermissionRecords = await db.permission.findMany({
      where: {
        name: { in: branchManagerPermissions }
      }
    })

    const branchManagers = await db.user.findMany({
      where: {
        role: 'BRANCH_MANAGER'
      }
    })

    for (const user of branchManagers) {
      console.log(`Updating permissions for branch manager: ${user.email}`)
      
      // Clear existing finance permissions
      await db.userPermission.deleteMany({
        where: {
          userId: user.id,
          permissionId: { in: branchManagerPermissionRecords.map(p => p.id) }
        }
      })

      // Add branch manager finance permissions
      for (const permission of branchManagerPermissionRecords) {
        await db.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: user.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            permissionId: permission.id,
            grantedBy: authUser.id
          }
        })
      }
    }

    // Update STAFF users with view-only finance permissions
    const staffPermissions = [
      PERMISSIONS.VIEW_FINANCIALS,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.VIEW_PAYMENT_HISTORY,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_FINANCIAL_OVERVIEW
    ]

    const staffPermissionRecords = await db.permission.findMany({
      where: {
        name: { in: staffPermissions }
      }
    })

    const staffUsers = await db.user.findMany({
      where: {
        role: 'STAFF'
      }
    })

    for (const user of staffUsers) {
      console.log(`Updating permissions for staff user: ${user.email}`)
      
      // Clear existing finance permissions
      await db.userPermission.deleteMany({
        where: {
          userId: user.id,
          permissionId: { in: staffPermissionRecords.map(p => p.id) }
        }
      })

      // Add staff finance permissions
      for (const permission of staffPermissionRecords) {
        await db.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: user.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            userId: user.id,
            permissionId: permission.id,
            grantedBy: authUser.id
          }
        })
      }
    }

    console.log('=== FINANCE PERMISSIONS INITIALIZATION COMPLETE ===')

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة الصلاحيات المالية بنجاح',
      stats: {
        totalPermissions: permissionRecords.length,
        adminUsersUpdated: adminUsers.length,
        branchManagersUpdated: branchManagers.length,
        staffUsersUpdated: staffUsers.length
      }
    })

  } catch (error) {
    console.error('Error initializing finance permissions:', error)
    return NextResponse.json({
      error: 'خطأ في تهيئة الصلاحيات المالية',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}