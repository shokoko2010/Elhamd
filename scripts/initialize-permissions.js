const { PrismaClient } = require('@prisma/client')
const { PERMISSIONS, PermissionService } = require('../src/lib/permissions')

const prisma = new PrismaClient()

async function initializePermissions() {
  try {
    console.log('🔧 Initializing permissions system...')
    
    // Initialize default permissions
    await PermissionService.initializeDefaultPermissions()
    console.log('✅ Default permissions initialized')
    
    // Initialize role templates
    await PermissionService.initializeRoleTemplates()
    console.log('✅ Role templates initialized')
    
    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      // Get all permissions for admin
      const allPermissions = Object.values(PERMISSIONS)
      
      // Clear existing permissions for admin
      await prisma.userPermission.deleteMany({
        where: { userId: adminUser.id }
      })
      
      // Add all permissions to admin
      for (const permissionName of allPermissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        })
        
        if (permission) {
          await prisma.userPermission.create({
            data: {
              userId: adminUser.id,
              permissionId: permission.id
            }
          })
        }
      }
      
      console.log('✅ Admin user permissions updated')
    } else {
      console.log('❌ No admin user found')
    }
    
    // Check permissions count
    const permissionsCount = await prisma.permission.count()
    const roleTemplatesCount = await prisma.roleTemplate.count()
    
    console.log(`📊 Permissions: ${permissionsCount}`)
    console.log(`📊 Role templates: ${roleTemplatesCount}`)
    
    // Test admin permissions
    if (adminUser) {
      const userPermissions = await PermissionService.getUserPermissions(adminUser.id)
      console.log(`🔑 Admin user has ${userPermissions.length} permissions`)
      
      // Check for EDIT_VEHICLES permission specifically
      const hasEditVehicles = userPermissions.includes(PERMISSIONS.EDIT_VEHICLES)
      console.log(`🚗 Admin can edit vehicles: ${hasEditVehicles ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.error('❌ Error initializing permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initializePermissions()