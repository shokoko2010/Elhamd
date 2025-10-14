import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PERMISSIONS, PermissionService } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 بدء الفحص الشامل لنظام الصلاحيات...')
    
    const results = {
      database: {},
      permissions: {},
      users: {},
      roles: {},
      tests: {},
      summary: { success: true, issues: [] }
    }

    // 1. فحص قاعدة البيانات
    console.log('📊 فحص قاعدة البيانات...')
    results.database = {
      permissionsCount: await db.permission.count(),
      roleTemplatesCount: await db.roleTemplate.count(),
      userPermissionsCount: await db.userPermission.count(),
      usersCount: await db.user.count()
    }

    // 2. فحص الصلاحيات المتاحة
    console.log('🔑 فحص الصلاحيات المتاحة...')
    const allPermissions = await db.permission.findMany()
    results.permissions = {
      total: allPermissions.length,
      list: allPermissions.map(p => ({ name: p.name, category: p.category })),
      expected: Object.values(PERMISSIONS).length,
      missing: []
    }

    // التحقق من الصلاحيات المفقودة
    const expectedPermissions = Object.values(PERMISSIONS)
    const existingPermissionNames = allPermissions.map(p => p.name)
    const missingPermissions = expectedPermissions.filter(p => !existingPermissionNames.includes(p))
    results.permissions.missing = missingPermissions

    if (missingPermissions.length > 0) {
      results.summary.issues.push(`صلاحيات مفقودة: ${missingPermissions.join(', ')}`)
    }

    // 3. فحص المستخدمين وصلاحياتهم
    console.log('👥 فحص المستخدمين وصلاحياتهم...')
    const users = await db.user.findMany({
      include: {
        permissions: {
          include: { permission: true }
        },
        roleTemplate: true
      }
    })

    results.users = {
      total: users.length,
      byRole: {},
      details: []
    }

    users.forEach(user => {
      // تجميع حسب الدور
      if (!results.users.byRole[user.role]) {
        results.users.byRole[user.role] = { count: 0, users: [] }
      }
      results.users.byRole[user.role].count++
      results.users.byRole[user.role].users.push({
        id: user.id,
        email: user.email,
        permissionsCount: user.permissions.length
      })

      // تفاصيل المستخدم
      results.users.details.push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissionsCount: user.permissions.length,
        permissions: user.permissions.map(up => up.permission.name),
        roleTemplate: user.roleTemplate?.name || null
      })
    })

    // 4. فحص أدوار النظام
    console.log('🎭 فحص أدوار النظام...')
    results.roles = {
      available: Object.values(UserRole),
      templates: await db.roleTemplate.findMany(),
      defaultPermissions: {}
    }

    // التحقق من الصلاحيات الافتراضية لكل دور
    for (const role of Object.values(UserRole)) {
      try {
        const rolePermissions = await PermissionService.getUserPermissions(
          users.find(u => u.role === role)?.id || ''
        )
        results.roles.defaultPermissions[role] = {
          count: rolePermissions.length,
          permissions: rolePermissions
        }
      } catch (error) {
        results.roles.defaultPermissions[role] = {
          count: 0,
          permissions: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // 5. اختبارات الصلاحيات
    console.log('🧪 إجراء اختبارات الصلاحيات...')
    results.tests = {
      adminUser: null,
      permissionChecks: {},
      criticalPermissions: {}
    }

    // العثور على مستخدم مدير
    const adminUser = users.find(u => u.role === UserRole.ADMIN)
    if (adminUser) {
      results.tests.adminUser = {
        id: adminUser.id,
        email: adminUser.email,
        permissionsCount: adminUser.permissions.length
      }

      // اختبار الصلاحيات الحرجة
      const criticalPermissions = [
        PERMISSIONS.EDIT_VEHICLES,
        PERMISSIONS.CREATE_VEHICLES,
        PERMISSIONS.DELETE_VEHICLES,
        PERMISSIONS.VIEW_VEHICLES,
        PERMISSIONS.MANAGE_VEHICLE_INVENTORY
      ]

      for (const permission of criticalPermissions) {
        const hasPermission = adminUser.permissions.some(up => up.permission.name === permission)
        results.tests.criticalPermissions[permission] = hasPermission
        
        if (!hasPermission) {
          results.summary.issues.push(`المدير يفتقد صلاحية: ${permission}`)
        }
      }
    } else {
      results.summary.issues.push('لا يوجد مستخدم مدير في النظام')
    }

    // 6. التحقق من تكامل الصلاحيات مع الـ API
    console.log('🔗 التحقق من تكامل الصلاحيات...')
    
    // اختبار صلاحيات تعديل المركبات
    try {
      const testVehicle = await db.vehicle.findFirst()
      if (testVehicle && adminUser) {
        const canEditVehicle = adminUser.permissions.some(up => up.permission.name === PERMISSIONS.EDIT_VEHICLES)
        results.tests.vehicleEditTest = {
          vehicleId: testVehicle.id,
          adminCanEdit: canEditVehicle,
          success: canEditVehicle
        }
        
        if (!canEditVehicle) {
          results.summary.issues.push('المدير لا يمكنه تعديل المركبات')
        }
      }
    } catch (error) {
      results.tests.vehicleEditTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // الملخص النهائي
    results.summary.success = results.summary.issues.length === 0
    results.summary.totalIssues = results.summary.issues.length
    results.summary.issuesCount = {
      critical: results.summary.issues.filter(i => i.includes('المدير') || i.includes('حرج')).length,
      warning: results.summary.issues.filter(i => !i.includes('المدير') && !i.includes('حرج')).length
    }

    console.log('✅ اكتمل الفحص الشامل للصلاحيات')
    console.log(`📊 النتائج: ${results.summary.success ? 'ناجح' : 'يوجد مشاكل'}`)
    if (results.summary.issues.length > 0) {
      console.log('⚠️ المشاكل المكتشفة:', results.summary.issues)
    }

    return NextResponse.json({
      success: true,
      message: 'اكتمل الفحص الشامل لنظام الصلاحيات',
      timestamp: new Date().toISOString(),
      results
    })

  } catch (error) {
    console.error('❌ خطأ في الفحص الشامل:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}