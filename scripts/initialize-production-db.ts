import { PrismaClient } from '@prisma/client'
import { PERMISSIONS } from '../src/lib/permissions'
import { UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeDatabase() {
  console.log('🚀 Initializing production database...')
  
  try {
    // 1. Initialize Permissions
    console.log('📋 Initializing permissions...')
    const permissionCategories = {
      view_users: 'USER_MANAGEMENT',
      create_users: 'USER_MANAGEMENT',
      edit_users: 'USER_MANAGEMENT',
      delete_users: 'USER_MANAGEMENT',
      view_customers: 'CUSTOMER_MANAGEMENT',
      create_customers: 'CUSTOMER_MANAGEMENT',
      edit_customers: 'CUSTOMER_MANAGEMENT',
      delete_customers: 'CUSTOMER_MANAGEMENT',
      view_vehicles: 'VEHICLE_MANAGEMENT',
      create_vehicles: 'VEHICLE_MANAGEMENT',
      edit_vehicles: 'VEHICLE_MANAGEMENT',
      delete_vehicles: 'VEHICLE_MANAGEMENT',
      view_invoices: 'FINANCIAL_MANAGEMENT',
      create_invoices: 'FINANCIAL_MANAGEMENT',
      edit_invoices: 'FINANCIAL_MANAGEMENT',
      delete_invoices: 'FINANCIAL_MANAGEMENT',
      manage_payments: 'FINANCIAL_MANAGEMENT',
      view_bookings: 'BOOKING_MANAGEMENT',
      create_bookings: 'BOOKING_MANAGEMENT',
      edit_bookings: 'BOOKING_MANAGEMENT',
      delete_bookings: 'BOOKING_MANAGEMENT'
    }

    for (const [name, category] of Object.entries(permissionCategories)) {
      await prisma.permission.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `Permission to ${name.replace(/_/g, ' ')}`,
          category: category as any
        }
      })
    }
    console.log('✅ Permissions initialized')

    // 2. Initialize Role Templates
    console.log('👥 Initializing role templates...')
    
    const adminPermissions = Object.values(PERMISSIONS)
    
    await prisma.roleTemplate.upsert({
      where: { name: 'ADMIN_TEMPLATE' },
      update: {},
      create: {
        name: 'ADMIN_TEMPLATE',
        description: 'Default permissions for administrators',
        role: UserRole.ADMIN,
        permissions: JSON.stringify(adminPermissions),
        isSystem: true
      }
    })

    const branchManagerPermissions = [
      PERMISSIONS.VIEW_CUSTOMERS,
      PERMISSIONS.CREATE_CUSTOMERS,
      PERMISSIONS.EDIT_CUSTOMERS,
      PERMISSIONS.VIEW_VEHICLES,
      PERMISSIONS.CREATE_VEHICLES,
      PERMISSIONS.EDIT_VEHICLES,
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.CREATE_INVOICES,
      PERMISSIONS.EDIT_INVOICES,
      PERMISSIONS.VIEW_BOOKINGS,
      PERMISSIONS.CREATE_BOOKINGS,
      PERMISSIONS.EDIT_BOOKINGS
    ]

    await prisma.roleTemplate.upsert({
      where: { name: 'BRANCH_MANAGER_TEMPLATE' },
      update: {},
      create: {
        name: 'BRANCH_MANAGER_TEMPLATE',
        description: 'Default permissions for branch managers',
        role: UserRole.BRANCH_MANAGER,
        permissions: JSON.stringify(branchManagerPermissions),
        isSystem: true
      }
    })

    const staffPermissions = [
      PERMISSIONS.VIEW_CUSTOMERS,
      PERMISSIONS.CREATE_CUSTOMERS,
      PERMISSIONS.VIEW_VEHICLES,
      PERMISSIONS.VIEW_BOOKINGS,
      PERMISSIONS.CREATE_BOOKINGS
    ]

    await prisma.roleTemplate.upsert({
      where: { name: 'STAFF_TEMPLATE' },
      update: {},
      create: {
        name: 'STAFF_TEMPLATE',
        description: 'Default permissions for staff members',
        role: UserRole.STAFF,
        permissions: JSON.stringify(staffPermissions),
        isSystem: true
      }
    })

    console.log('✅ Role templates initialized')

    // 3. Create default admin user if not exists
    console.log('👤 Creating default admin user...')
    const adminEmail = 'admin@elhamd.com'
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const adminTemplate = await prisma.roleTemplate.findUnique({
        where: { name: 'ADMIN_TEMPLATE' }
      })

      if (adminTemplate) {
        await prisma.user.create({
          data: {
            email: adminEmail,
            name: 'Administrator',
            role: UserRole.ADMIN,
            isActive: true,
            emailVerified: true,
            roleTemplateId: adminTemplate.id,
            // You should set a proper password hash here
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e' // 'admin123'
          }
        })
        console.log('✅ Default admin user created')
      }
    } else {
      console.log('ℹ️ Admin user already exists')
    }

    // 4. Initialize default tax rate
    console.log('💰 Initializing tax rates...')
    
    // Check if tax rate already exists
    const existingTaxRate = await prisma.taxRate.findFirst({
      where: { name: 'ضريبة القيمة المضافة' }
    })

    if (!existingTaxRate) {
      await prisma.taxRate.create({
        data: {
          name: 'ضريبة القيمة المضافة',
          type: 'STANDARD',
          rate: 14.0,
          description: 'ضريبة القيمة المضافة القياسية في مصر',
          isActive: true,
          effectiveFrom: new Date('2020-01-01')
        }
      })
      console.log('✅ Default tax rate created')
    } else {
      console.log('ℹ️ Tax rate already exists')
    }
    console.log('✅ Tax rates initialized')

    // 5. Create default branch if not exists
    console.log('🏢 Creating default branch...')
    const existingBranch = await prisma.branch.findFirst()
    
    if (!existingBranch) {
      await prisma.branch.create({
        data: {
          name: 'الفرع الرئيسي',
          code: 'MAIN',
          address: 'العنوان الرئيسي',
          phone: '+201234567890',
          email: 'main@elhamd.com',
          isActive: true,
          openingDate: new Date()
        }
      })
      console.log('✅ Default branch created')
    } else {
      console.log('ℹ️ Branch already exists')
    }

    console.log('🎉 Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error)
      process.exit(1)
    })
}

export default initializeDatabase