import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting basic database seeding...')

  // Clean existing data
  await cleanDatabase()
  console.log('🧹 Cleaned existing data')

  // Seed basic data
  await seedPermissions()
  await seedRoleTemplates()
  await seedBranches()
  await seedUsers()
  await seedUserPermissions()
  await seedVehicles()

  console.log('✅ Basic database seeding completed successfully!')
}

async function cleanDatabase() {
  const models = [
    'userPermission', 'user',
    'vehicle', 'branch', 
    'roleTemplatePermission', 'roleTemplate', 'permission'
  ]

  for (const model of models) {
    try {
      await prisma[model].deleteMany()
    } catch (error) {
      console.log(`Note: Model ${model} might not exist or is already empty`)
    }
  }
}

async function seedPermissions() {
  console.log('📋 Seeding permissions...')

  const permissions = [
    { name: 'users.view', description: 'View users', category: 'USER_MANAGEMENT' },
    { name: 'users.create', description: 'Create users', category: 'USER_MANAGEMENT' },
    { name: 'users.update', description: 'Update users', category: 'USER_MANAGEMENT' },
    { name: 'users.delete', description: 'Delete users', category: 'USER_MANAGEMENT' },
    { name: 'vehicles.view', description: 'View vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.create', description: 'Create vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.update', description: 'Update vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.delete', description: 'Delete vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'bookings.view', description: 'View bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.create', description: 'Create bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.update', description: 'Update bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.delete', description: 'Delete bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'system.settings', description: 'Manage system settings', category: 'SYSTEM_SETTINGS' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    })
  }
}

async function seedRoleTemplates() {
  console.log('👥 Seeding role templates...')

  const permissions = await prisma.permission.findMany()

  // Admin role template
  const adminPermissions = permissions.map(p => p.id)
  await prisma.roleTemplate.upsert({
    where: { name: 'Admin Template' },
    update: { permissions: adminPermissions },
    create: {
      name: 'Admin Template',
      description: 'Full system access',
      role: 'ADMIN',
      permissions: adminPermissions,
      isSystem: true,
    },
  })

  // Manager role template
  const managerPermissions = permissions
    .filter(p => !p.name.includes('delete') && !p.name.includes('system.settings'))
    .map(p => p.id)
  
  await prisma.roleTemplate.upsert({
    where: { name: 'Manager Template' },
    update: { permissions: managerPermissions },
    create: {
      name: 'Manager Template',
      description: 'Manager access',
      role: 'BRANCH_MANAGER',
      permissions: managerPermissions,
      isSystem: true,
    },
  })

  // Employee role template
  const employeePermissions = permissions
    .filter(p => p.name.includes('view') || p.name.includes('bookings.create') || p.name.includes('bookings.update'))
    .map(p => p.id)
  
  await prisma.roleTemplate.upsert({
    where: { name: 'Employee Template' },
    update: { permissions: employeePermissions },
    create: {
      name: 'Employee Template',
      description: 'Employee access',
      role: 'STAFF',
      permissions: employeePermissions,
      isSystem: true,
    },
  })
}

async function seedBranches() {
  console.log('🏢 Seeding branches...')

  const branches = [
    {
      name: 'الفرع الرئيسي - القاهرة',
      code: 'CAI-001',
      address: 'شارع التحرير، وسط القاهرة، القاهرة',
      phone: '+20 2 2345 6789',
      email: 'cairo@elhamdimports.com',
      openingDate: new Date('2020-01-15'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      settings: {
        workingHours: { open: '09:00', close: '21:00' },
        services: ['Sales', 'Service', 'Parts']
      }
    },
    {
      name: 'فرع الإسكندرية',
      code: 'ALEX-002',
      address: 'شارع سعد زغلول، وسط الإسكندرية',
      phone: '+20 3 4567 8901',
      email: 'alexandria@elhamdimports.com',
      openingDate: new Date('2021-03-20'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      settings: {
        workingHours: { open: '09:00', close: '20:00' },
        services: ['Sales', 'Service']
      }
    },
    {
      name: 'فرع الجيزة',
      code: 'GIZ-003',
      address: 'ميدان المحطة، الجيزة',
      phone: '+20 2 3456 7890',
      email: 'giza@elhamdimports.com',
      openingDate: new Date('2022-06-10'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      settings: {
        workingHours: { open: '10:00', close: '22:00' },
        services: ['Sales', 'Service', 'Parts']
      }
    },
  ]

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: branch,
      create: branch,
    })
  }
}

async function seedUsers() {
  console.log('👤 Seeding users...')

  const branches = await prisma.branch.findMany()
  const adminTemplate = await prisma.roleTemplate.findFirst({ where: { role: 'ADMIN' } })
  const managerTemplate = await prisma.roleTemplate.findFirst({ where: { role: 'BRANCH_MANAGER' } })
  const employeeTemplate = await prisma.roleTemplate.findFirst({ where: { role: 'STAFF' } })

  const users = [
    {
      email: 'admin@elhamdimports.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'أحمد محمد السيد',
      role: 'ADMIN',
      phone: '+20 10 1234 5678',
      isActive: true,
      emailVerified: true,
      segment: 'VIP',
      status: 'active',
      branchId: branches[0]?.id,
      roleTemplateId: adminTemplate?.id,
    },
    {
      email: 'manager@elhamdimports.com',
      password: await bcrypt.hash('manager123', 10),
      name: 'محمد علي عبدالله',
      role: 'BRANCH_MANAGER',
      phone: '+20 10 2345 6789',
      isActive: true,
      emailVerified: true,
      segment: 'CUSTOMER',
      status: 'active',
      branchId: branches[0]?.id,
      roleTemplateId: managerTemplate?.id,
    },
    {
      email: 'employee@elhamdimports.com',
      password: await bcrypt.hash('employee123', 10),
      name: 'عمر حسن أحمد',
      role: 'STAFF',
      phone: '+20 10 3456 7890',
      isActive: true,
      emailVerified: true,
      segment: 'CUSTOMER',
      status: 'active',
      branchId: branches[1]?.id,
      roleTemplateId: employeeTemplate?.id,
    },
    {
      email: 'customer1@example.com',
      password: await bcrypt.hash('customer123', 10),
      name: 'خالد أحمد محمد',
      role: 'CUSTOMER',
      phone: '+20 11 1234 5678',
      isActive: true,
      emailVerified: true,
      segment: 'CUSTOMER',
      status: 'active',
      branchId: branches[0]?.id,
    },
    {
      email: 'customer2@example.com',
      password: await bcrypt.hash('customer123', 10),
      name: 'سارة محمد إبراهيم',
      role: 'CUSTOMER',
      phone: '+20 12 2345 6789',
      isActive: true,
      emailVerified: true,
      segment: 'VIP',
      status: 'active',
      branchId: branches[1]?.id,
    },
    {
      email: 'sales@elhamdimports.com',
      password: await bcrypt.hash('sales123', 10),
      name: 'محمود أحمد علي',
      role: 'STAFF',
      phone: '+20 10 4567 8901',
      isActive: true,
      emailVerified: true,
      segment: 'CUSTOMER',
      status: 'active',
      branchId: branches[2]?.id,
      roleTemplateId: employeeTemplate?.id,
    },
    {
      email: 'service@elhamdimports.com',
      password: await bcrypt.hash('service123', 10),
      name: 'عبدالله محمود حسن',
      role: 'STAFF',
      phone: '+20 10 5678 9012',
      isActive: true,
      emailVerified: true,
      segment: 'CUSTOMER',
      status: 'active',
      branchId: branches[2]?.id,
      roleTemplateId: employeeTemplate?.id,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    })
  }
}

async function seedUserPermissions() {
  console.log('🔐 Seeding user permissions...')

  const users = await prisma.user.findMany()
  const permissions = await prisma.permission.findMany()

  // Give admin user all permissions
  const adminUser = users.find(u => u.role === 'ADMIN')
  if (adminUser) {
    for (const permission of permissions) {
      await prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: adminUser.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      })
    }
  }

  // Give manager user specific permissions
  const managerUser = users.find(u => u.role === 'BRANCH_MANAGER')
  if (managerUser) {
    const managerPermissions = permissions.filter(p => 
      !p.name.includes('delete') && !p.name.includes('system.settings')
    )
    
    for (const permission of managerPermissions) {
      await prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: managerUser.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: managerUser.id,
          permissionId: permission.id,
        },
      })
    }
  }
}

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...')

  const branches = await prisma.branch.findMany()

  const vehicles = [
    {
      make: 'TATA',
      model: 'Nexon',
      year: 2024,
      price: 450000,
      stockNumber: 'TNX-2024-001',
      vin: 'MAT62543798765432',
      description: 'سيارة SUV عائلية عصرية مع ميزات أمان متقدمة وتصميم رياضي أنيق. تأتي بمحرك قوي واستهلاك وقود ممتاز.',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[0]?.id,
    },
    {
      make: 'TATA',
      model: 'Punch',
      year: 2024,
      price: 320000,
      stockNumber: 'TPU-2024-002',
      vin: 'MAT62543798765433',
      description: 'سيارة SUV مدمجة مثالية للقيادة في المدينة بتصميم شبابي وأداء ممتاز.',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'رمادي',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[0]?.id,
    },
    {
      make: 'TATA',
      model: 'Tiago',
      year: 2024,
      price: 280000,
      stockNumber: 'TTI-2024-003',
      vin: 'MAT62543798765434',
      description: 'سيارة هاتشباك اقتصادية مع استهلاك وقود ممتاز وتصميم عصري يناسب الشباب.',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أحمر',
      status: 'AVAILABLE',
      featured: false,
      branchId: branches[1]?.id,
    },
    {
      make: 'TATA',
      model: 'Altroz',
      year: 2024,
      price: 350000,
      stockNumber: 'TAL-2024-004',
      vin: 'MAT62543798765435',
      description: 'سيارة بريميوم هاتشباك بتصميم أوروبي وميزات أمان متقدمة.',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أزرق',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[1]?.id,
    },
    {
      make: 'TATA',
      model: 'Safari',
      year: 2024,
      price: 650000,
      stockNumber: 'TSA-2024-005',
      vin: 'MAT62543798765436',
      description: 'سيارة SUV كبيرة بسبعة مقاعد ومحرك قوي، مثالية للعائلات الكبيرة.',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أسود',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[2]?.id,
    },
    {
      make: 'TATA',
      model: 'Harrier',
      year: 2024,
      price: 550000,
      stockNumber: 'THA-2024-006',
      vin: 'MAT62543798765437',
      description: 'سيارة SUV فاخرة بتصميم رياضي ومحرك قوي وتقنيات متقدمة.',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'فضي',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[2]?.id,
    }
  ]

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({ data: vehicle })
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })