import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PERMISSIONS } from '@/lib/permissions'

// Finance permission groups for easier management
const FINANCE_PERMISSION_GROUPS = {
  // Full access to everything
  FULL_FINANCE_ACCESS: [
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
  ],
  
  // Invoice management only
  INVOICE_MANAGER: [
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.SEND_INVOICES,
    PERMISSIONS.DOWNLOAD_INVOICES,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW
  ],
  
  // Payment processing only
  PAYMENT_PROCESSOR: [
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.PROCESS_OFFLINE_PAYMENTS,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW
  ],
  
  // Quotations only
  QUOTATION_MANAGER: [
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.MANAGE_QUOTATIONS,
    PERMISSIONS.APPROVE_QUOTATIONS,
    PERMISSIONS.CONVERT_QUOTATIONS,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW
  ],
  
  // View only access
  FINANCE_VIEWER: [
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.VIEW_PAYMENT_HISTORY,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCIAL_OVERVIEW
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== GET FINANCE PERMISSIONS ===')
    
    // Authenticate user
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({
        error: 'المصادقة مطلوبة',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Check if user has permission to manage user permissions
    if (!authUser.permissions.includes(PERMISSIONS.MANAGE_USER_PERMISSIONS)) {
      return NextResponse.json({
        error: 'صلاحية غير كافية لإدارة صلاحيات المستخدمين',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 })
    }

    const userId = params.id
    
    // Get user with current permissions
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'المستخدم غير موجود',
        code: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // Extract current finance permissions
    const currentPermissions = user.permissions
      .map(up => up.permission.name)
      .filter(permission => 
        Object.values(PERMISSIONS).includes(permission as any) &&
        (permission.includes('financial') || 
         permission.includes('invoice') || 
         permission.includes('payment') || 
         permission.includes('quotation') ||
         permission.includes('tax') ||
         permission.includes('report'))
      )

    // Determine which groups the user currently has
    const userGroups = Object.entries(FINANCE_PERMISSION_GROUPS)
      .filter(([_, permissions]) => 
        permissions.every(perm => currentPermissions.includes(perm))
      )
      .map(([groupName, _]) => groupName)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      currentPermissions,
      userGroups,
      availableGroups: Object.keys(FINANCE_PERMISSION_GROUPS),
      groupDefinitions: Object.entries(FINANCE_PERMISSION_GROUPS).map(([name, perms]) => ({
        name,
        displayName: getGroupDisplayName(name),
        description: getGroupDescription(name),
        permissions: perms
      }))
    })

  } catch (error) {
    console.error('Error fetching finance permissions:', error)
    return NextResponse.json({
      error: 'خطأ في جلب صلاحيات المستخدم المالية',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== UPDATE FINANCE PERMISSIONS ===')
    
    // Authenticate user
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({
        error: 'المصادقة مطلوبة',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Check if user has permission to manage user permissions
    if (!authUser.permissions.includes(PERMISSIONS.MANAGE_USER_PERMISSIONS)) {
      return NextResponse.json({
        error: 'صلاحية غير كافية لإدارة صلاحيات المستخدمين',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { group, customPermissions } = body

    // Validate target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({
        error: 'المستخدم غير موجود',
        code: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    let permissionsToAssign: string[] = []

    if (group && FINANCE_PERMISSION_GROUPS[group as keyof typeof FINANCE_PERMISSION_GROUPS]) {
      // Assign predefined group permissions
      permissionsToAssign = FINANCE_PERMISSION_GROUPS[group as keyof typeof FINANCE_PERMISSION_GROUPS]
      console.log(`Assigning group ${group} with ${permissionsToAssign.length} permissions`)
    } else if (customPermissions && Array.isArray(customPermissions)) {
      // Assign custom permissions
      permissionsToAssign = customPermissions
      console.log(`Assigning ${permissionsToAssign.length} custom permissions`)
    } else {
      return NextResponse.json({
        error: 'يجب تحديد مجموعة صلاحيات صالحة أو صلاحيات مخصصة',
        code: 'INVALID_PERMISSIONS'
      }, { status: 400 })
    }

    // Clear existing finance permissions for this user
    await db.userPermission.deleteMany({
      where: {
        userId,
        permission: {
          name: {
            in: Object.values(PERMISSIONS).filter(p => 
              p.includes('financial') || 
              p.includes('invoice') || 
              p.includes('payment') || 
              p.includes('quotation') ||
              p.includes('tax') ||
              p.includes('report')
            )
          }
        }
      }
    })

    // Add new permissions
    for (const permissionName of permissionsToAssign) {
      const permission = await db.permission.findUnique({
        where: { name: permissionName }
      })

      if (permission) {
        await db.userPermission.create({
          data: {
            userId,
            permissionId: permission.id,
            grantedBy: authUser.id
          }
        })
      }
    }

    console.log(`Successfully assigned ${permissionsToAssign.length} finance permissions to user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الصلاحيات المالية بنجاح',
      assignedPermissions: permissionsToAssign,
      assignedBy: authUser.id,
      assignedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error updating finance permissions:', error)
    return NextResponse.json({
      error: 'خطأ في تحديث صلاحيات المستخدم المالية',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getGroupDisplayName(groupName: string): string {
  const displayNames: Record<string, string> = {
    FULL_FINANCE_ACCESS: 'وصول كامل للنظام المالي',
    INVOICE_MANAGER: 'مدير الفواتير',
    PAYMENT_PROCESSOR: 'معالج المدفوعات',
    QUOTATION_MANAGER: 'مدير عروض الأسعار',
    FINANCE_VIEWER: 'مشاهد مالي'
  }
  return displayNames[groupName] || groupName
}

function getGroupDescription(groupName: string): string {
  const descriptions: Record<string, string> = {
    FULL_FINANCE_ACCESS: 'صلاحية كاملة للوصول إلى جميع وظائف النظام المالي بما في ذلك إنشاء وتعديل وحذف الفواتير والمدفوعات والتقارير',
    INVOICE_MANAGER: 'صلاحية لإدارة الفواتير فقط - إنشاء وتعديل وإرسال وتحميل الفواتير',
    PAYMENT_PROCESSOR: 'صلاحية لمعالجة المدفوعات فقط - تسجيل المدفوعات ومعالجة الدفعات النقدية',
    QUOTATION_MANAGER: 'صلاحية لإدارة عروض الأسعار فقط - إنشاء والموافقة وتحويل عروض الأسعار إلى فواتير',
    FINANCE_VIEWER: 'صلاحية للمشاهدة فقط - عرض الفواتير والمدفوعات والتقارير المالية دون القدرة على التعديل'
  }
  return descriptions[groupName] || 'لا يوجد وصف'
}