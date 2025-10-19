import { PrismaClient } from '@prisma/client'
import { db } from '../src/lib/db'

async function setupTataVehiclesPermissions() {
  console.log('🔐 Setting up Tata Vehicles permissions...')

  try {
    // Define vehicle management permissions
    const vehiclePermissions = [
      {
        name: 'vehicles.create',
        description: 'إنشاء سيارات جديدة',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.read',
        description: 'عرض السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.update',
        description: 'تعديل بيانات السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.delete',
        description: 'حذف السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.images.create',
        description: 'إضافة صور للسيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.images.update',
        description: 'تعديل صور السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.images.delete',
        description: 'حذف صور السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.specifications.create',
        description: 'إضافة مواصفات للسيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.specifications.update',
        description: 'تعديل مواصفات السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.specifications.delete',
        description: 'حذف مواصفات السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.pricing.create',
        description: 'إنشاء تسعير للسيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.pricing.update',
        description: 'تعديل تسعير السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.pricing.delete',
        description: 'حذف تسعير السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.featured',
        description: 'تمييز السيارات كمميزة',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.status.update',
        description: 'تحديث حالة السيارات',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.bulk.import',
        description: 'استيراد سيارات بشكل جماعي',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      },
      {
        name: 'vehicles.bulk.export',
        description: 'تصدير سيارات بشكل جماعي',
        category: 'VEHICLE_MANAGEMENT' as const,
        isActive: true
      }
    ]

    // Create permissions
    for (const permissionData of vehiclePermissions) {
      const permission = await db.permission.upsert({
        where: { name: permissionData.name },
        update: {
          description: permissionData.description,
          category: permissionData.category,
          isActive: permissionData.isActive,
          updatedAt: new Date()
        },
        create: permissionData
      })
      console.log(`✅ Permission created/updated: ${permission.name}`)
    }

    // Update role templates with vehicle permissions
    const adminRoleTemplate = await db.roleTemplate.findFirst({
      where: { role: 'ADMIN' }
    })

    if (adminRoleTemplate) {
      const allVehiclePermissions = await db.permission.findMany({
        where: { category: 'VEHICLE_MANAGEMENT' }
      })

      // Update admin role permissions to include all vehicle permissions
      const currentPermissions = adminRoleTemplate.permissions as any || {}
      const vehicleManagementPermissions = allVehiclePermissions.reduce((acc, permission) => {
        acc[permission.name] = true
        return acc
      }, {} as Record<string, boolean>)

      const updatedPermissions = {
        ...currentPermissions,
        VEHICLE_MANAGEMENT: vehicleManagementPermissions
      }

      await db.roleTemplate.update({
        where: { id: adminRoleTemplate.id },
        data: {
          permissions: updatedPermissions,
          updatedAt: new Date()
        }
      })

      console.log('✅ Admin role template updated with vehicle permissions')
    }

    // Update SUPER_ADMIN role template
    const superAdminRoleTemplate = await db.roleTemplate.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (superAdminRoleTemplate) {
      const allVehiclePermissions = await db.permission.findMany({
        where: { category: 'VEHICLE_MANAGEMENT' }
      })

      const currentPermissions = superAdminRoleTemplate.permissions as any || {}
      const vehicleManagementPermissions = allVehiclePermissions.reduce((acc, permission) => {
        acc[permission.name] = true
        return acc
      }, {} as Record<string, boolean>)

      const updatedPermissions = {
        ...currentPermissions,
        VEHICLE_MANAGEMENT: vehicleManagementPermissions
      }

      await db.roleTemplate.update({
        where: { id: superAdminRoleTemplate.id },
        data: {
          permissions: updatedPermissions,
          updatedAt: new Date()
        }
      })

      console.log('✅ Super Admin role template updated with vehicle permissions')
    }

    // Update BRANCH_MANAGER role template with limited vehicle permissions
    const branchManagerRoleTemplate = await db.roleTemplate.findFirst({
      where: { role: 'BRANCH_MANAGER' }
    })

    if (branchManagerRoleTemplate) {
      const limitedVehiclePermissions = [
        'vehicles.read',
        'vehicles.update',
        'vehicles.images.create',
        'vehicles.images.update',
        'vehicles.images.delete',
        'vehicles.specifications.create',
        'vehicles.specifications.update',
        'vehicles.pricing.update',
        'vehicles.featured',
        'vehicles.status.update',
        'vehicles.bulk.import',
        'vehicles.bulk.export'
      ]

      const permissions = await db.permission.findMany({
        where: { 
          name: { in: limitedVehiclePermissions }
        }
      })

      const currentPermissions = branchManagerRoleTemplate.permissions as any || {}
      const vehicleManagementPermissions = permissions.reduce((acc, permission) => {
        acc[permission.name] = true
        return acc
      }, {} as Record<string, boolean>)

      const updatedPermissions = {
        ...currentPermissions,
        VEHICLE_MANAGEMENT: vehicleManagementPermissions
      }

      await db.roleTemplate.update({
        where: { id: branchManagerRoleTemplate.id },
        data: {
          permissions: updatedPermissions,
          updatedAt: new Date()
        }
      })

      console.log('✅ Branch Manager role template updated with limited vehicle permissions')
    }

    // Update STAFF role template with basic vehicle permissions
    const staffRoleTemplate = await db.roleTemplate.findFirst({
      where: { role: 'STAFF' }
    })

    if (staffRoleTemplate) {
      const basicVehiclePermissions = [
        'vehicles.read',
        'vehicles.images.create',
        'vehicles.images.update',
        'vehicles.specifications.create',
        'vehicles.specifications.update'
      ]

      const permissions = await db.permission.findMany({
        where: { 
          name: { in: basicVehiclePermissions }
        }
      })

      const currentPermissions = staffRoleTemplate.permissions as any || {}
      const vehicleManagementPermissions = permissions.reduce((acc, permission) => {
        acc[permission.name] = true
        return acc
      }, {} as Record<string, boolean>)

      const updatedPermissions = {
        ...currentPermissions,
        VEHICLE_MANAGEMENT: vehicleManagementPermissions
      }

      await db.roleTemplate.update({
        where: { id: staffRoleTemplate.id },
        data: {
          permissions: updatedPermissions,
          updatedAt: new Date()
        }
      })

      console.log('✅ Staff role template updated with basic vehicle permissions')
    }

    console.log('🎉 Tata Vehicles permissions setup completed successfully!')

  } catch (error) {
    console.error('❌ Error setting up Tata Vehicles permissions:', error)
    throw error
  }
}

// Run setup function if called directly
if (require.main === module) {
  setupTataVehiclesPermissions()
    .then(() => {
      console.log('✅ Permissions setup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Permissions setup failed:', error)
      process.exit(1)
    })
}

export { setupTataVehiclesPermissions }