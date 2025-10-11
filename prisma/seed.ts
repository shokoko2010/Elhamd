import { PrismaClient, UserRole, PermissionCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Core permissions for the car dealership
const CORE_PERMISSIONS = [
  // User Management
  'view_users', 'create_users', 'edit_users', 'delete_users',
  
  // Vehicle Management  
  'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles',
  
  // Booking Management
  'view_bookings', 'create_bookings', 'edit_bookings', 'delete_bookings',
  
  // Service Management
  'view_services', 'create_services', 'edit_services', 'delete_services',
  
  // Financial Management
  'view_financials', 'create_invoices', 'edit_invoices', 'manage_payments',
  
  // Customer Management
  'view_customers', 'create_customers', 'edit_customers', 'view_customer_history',
  
  // System Settings
  'view_system_settings', 'manage_system_settings'
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data
  await prisma.userPermission.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.roleTemplate.deleteMany()
  await prisma.user.deleteMany()

  // Create permissions
  console.log('📋 Creating permissions...')
  for (const permissionName of CORE_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: permissionName },
      update: {},
      create: {
        name: permissionName,
        description: `Permission to ${permissionName.replace('_', ' ')}`,
        category: PermissionCategory.SYSTEM_SETTINGS
      }
    })
  }

  // Create role templates
  console.log('👥 Creating role templates...')
  
  // Admin template
  const adminTemplate = await prisma.roleTemplate.create({
    data: {
      name: 'ADMIN_TEMPLATE',
      description: 'Administrator role with full access',
      role: UserRole.ADMIN,
      permissions: JSON.stringify(CORE_PERMISSIONS),
      isSystem: true
    }
  })

  // Staff template
  const staffPermissions = CORE_PERMISSIONS.filter(p => 
    !p.includes('delete') && !p.includes('manage_system')
  )
  
  const staffTemplate = await prisma.roleTemplate.create({
    data: {
      name: 'STAFF_TEMPLATE',
      description: 'Staff role with limited access',
      role: UserRole.STAFF,
      permissions: JSON.stringify(staffPermissions),
      isSystem: true
    }
  })

  // Customer template
  const customerPermissions = ['view_vehicles', 'create_bookings', 'view_bookings', 'view_services']
  
  const customerTemplate = await prisma.roleTemplate.create({
    data: {
      name: 'CUSTOMER_TEMPLATE',
      description: 'Customer role with basic access',
      role: UserRole.CUSTOMER,
      permissions: JSON.stringify(customerPermissions),
      isSystem: true
    }
  })

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@elhamd.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
      roleTemplateId: adminTemplate.id
    }
  })

  // Create sample staff user
  console.log('👤 Creating staff user...')
  const staffPassword = await bcrypt.hash('staff123', 12)
  
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@elhamd.com',
      password: staffPassword,
      name: 'Staff User',
      role: UserRole.STAFF,
      isActive: true,
      emailVerified: true,
      roleTemplateId: staffTemplate.id
    }
  })

  // Create sample customer
  console.log('👤 Creating customer user...')
  const customerPassword = await bcrypt.hash('customer123', 12)
  
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@elhamd.com',
      password: customerPassword,
      name: 'Customer User',
      role: UserRole.CUSTOMER,
      isActive: true,
      emailVerified: true,
      roleTemplateId: customerTemplate.id
    }
  })

  // Create sample vehicles
  console.log('🚗 Creating sample vehicles...')
  
  const vehicles = [
    {
      make: 'Tata',
      model: 'Nexon',
      year: 2024,
      price: 450000,
      stockNumber: 'NEX001',
      vin: 'MAT6A3KJ2NA123456',
      description: 'Latest Tata Nexon with premium features',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'White',
      status: 'AVAILABLE',
      featured: true
    },
    {
      make: 'Tata',
      model: 'Punch',
      year: 2024,
      price: 350000,
      stockNumber: 'PUN001',
      vin: 'MAT6A3KJ2PA123456',
      description: 'Compact SUV with modern design',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'Blue',
      status: 'AVAILABLE',
      featured: true
    },
    {
      make: 'Tata',
      model: 'Tiago',
      year: 2024,
      price: 280000,
      stockNumber: 'TIA001',
      vin: 'MAT6A3KJ2TA123456',
      description: 'Efficient hatchback for city driving',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'Red',
      status: 'AVAILABLE',
      featured: false
    }
  ]

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: {
        ...vehicle,
        category: vehicle.category as any, // Cast to any to bypass type checking for enum
        fuelType: vehicle.fuelType as any, // Cast to any to bypass type checking for enum
        transmission: vehicle.transmission as any, // Cast to any to bypass type checking for enum
        status: vehicle.status as any, // Cast to any to bypass type checking for enum
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📧 Login credentials:')
  console.log('Admin: admin@elhamd.com / admin123')
  console.log('Staff: staff@elhamd.com / staff123')
  console.log('Customer: customer@elhamd.com / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })