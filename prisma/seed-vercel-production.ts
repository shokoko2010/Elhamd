import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Vercel PostgreSQL database seeding...')
  console.log('📡 Connecting to Vercel PostgreSQL...')

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Connected to Vercel PostgreSQL successfully!')

    // Clean existing data
    await cleanDatabase()
    console.log('🧹 Cleaned existing data')

    // Seed data in order of dependencies
    await seedPermissions()
    await seedRoleTemplates()
    await seedBranches()
    await seedUsers()
    await seedUserPermissions()
    await seedVehicles()
    await seedVehicleImages()
    await seedVehicleSpecifications()
    await seedVehiclePricing()
    await seedServiceTypes()
    await seedTestDriveBookings()
    await seedServiceBookings()
    await seedCompanyInfo()
    await seedSiteSettings()
    await seedSliders()
    await seedCompanyStats()
    await seedCompanyValues()
    await seedCompanyFeatures()
    await seedTimelineEvents()
    await seedContactInfo()

    console.log('✅ Vercel PostgreSQL database seeding completed successfully!')
    
    // Print login credentials
    await printLoginCredentials()
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...')
  
  const models = [
    'serviceBooking', 'testDriveBooking', 
    'vehiclePricing', 'vehicleSpecification', 'vehicleImage', 'vehicle',
    'serviceType',
    'companyFeature', 'companyValue', 'companyStat', 'timelineEvent', 'contactInfo', 'companyInfo',
    'slider', 'siteSettings',
    'userPermission', 'user',
    'branch', 'roleTemplatePermission', 'roleTemplate', 'permission'
  ]

  for (const model of models) {
    try {
      const result = await prisma[model].deleteMany()
      if (result.count > 0) {
        console.log(`  ✓ Deleted ${result.count} records from ${model}`)
      }
    } catch (error) {
      console.log(`  Note: Model ${model} might not exist or is already empty`)
    }
  }
}

async function seedPermissions() {
  console.log('📋 Seeding permissions...')

  const permissions = [
    // User Management
    { name: 'users.view', description: 'View users', category: 'USER_MANAGEMENT' },
    { name: 'users.create', description: 'Create users', category: 'USER_MANAGEMENT' },
    { name: 'users.update', description: 'Update users', category: 'USER_MANAGEMENT' },
    { name: 'users.delete', description: 'Delete users', category: 'USER_MANAGEMENT' },
    
    // Vehicle Management
    { name: 'vehicles.view', description: 'View vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.create', description: 'Create vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.update', description: 'Update vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.delete', description: 'Delete vehicles', category: 'VEHICLE_MANAGEMENT' },
    
    // Booking Management
    { name: 'bookings.view', description: 'View bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.create', description: 'Create bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.update', description: 'Update bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.delete', description: 'Delete bookings', category: 'BOOKING_MANAGEMENT' },
    
    // Branch Management
    { name: 'branches.view', description: 'View branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'branches.create', description: 'Create branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'branches.update', description: 'Update branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'branches.delete', description: 'Delete branches', category: 'BRANCH_MANAGEMENT' },
    
    // Content Management
    { name: 'content.view', description: 'View content', category: 'SYSTEM_SETTINGS' },
    { name: 'content.create', description: 'Create content', category: 'SYSTEM_SETTINGS' },
    { name: 'content.update', description: 'Update content', category: 'SYSTEM_SETTINGS' },
    { name: 'content.delete', description: 'Delete content', category: 'SYSTEM_SETTINGS' },
    
    // Reports
    { name: 'reports.view', description: 'View reports', category: 'REPORTING' },
    { name: 'reports.export', description: 'Export reports', category: 'REPORTING' },
    
    // System
    { name: 'system.settings', description: 'Manage system settings', category: 'SYSTEM_SETTINGS' },
    { name: 'system.logs', description: 'View system logs', category: 'SYSTEM_SETTINGS' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    })
  }
  console.log(`  ✓ Created ${permissions.length} permissions`)
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
  console.log('  ✓ Created 3 role templates (Admin, Manager, Employee)')
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
  console.log(`  ✓ Created ${branches.length} branches`)
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
      email: 'customer3@example.com',
      password: await bcrypt.hash('customer123', 10),
      name: 'عمر حسن علي',
      role: 'CUSTOMER',
      phone: '+20 10 9876 5432',
      isActive: true,
      emailVerified: true,
      segment: 'CUSTOMER',
      status: 'active',
      branchId: branches[2]?.id,
    }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    })
  }
  console.log(`  ✓ Created ${users.length} users`)
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
  console.log('  ✓ Created user permissions')
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
  console.log(`  ✓ Created ${vehicles.length} vehicles`)
}

async function seedVehicleImages() {
  console.log('🖼️ Seeding vehicle images...')

  const vehicles = await prisma.vehicle.findMany()

  const vehicleImages = [
    // Nexon images
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      imageUrl: '/uploads/vehicles/tata-nexon-1.jpg',
      altText: 'تاتا نيكسون - جانب',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      imageUrl: '/uploads/vehicles/tata-nexon-2.jpg',
      altText: 'تاتا نيكسون - أمامي',
      isPrimary: false,
      order: 2
    },
    // Punch images
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      imageUrl: '/uploads/vehicles/tata-punch-1.jpg',
      altText: 'تاتا بنش - أمامي',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      imageUrl: '/uploads/vehicles/tata-punch-2.jpg',
      altText: 'تاتا بنش - جانب',
      isPrimary: false,
      order: 2
    },
    // Tiago images
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      imageUrl: '/uploads/vehicles/tata-tiago-1.jpg',
      altText: 'تاتا تياجو - أمامي',
      isPrimary: true,
      order: 1
    },
    // Altroz images
    {
      vehicleId: vehicles.find(v => v.model === 'Altroz')?.id || '',
      imageUrl: '/uploads/vehicles/tata-altroz-1.jpg',
      altText: 'تاتا ألتروز - أمامي',
      isPrimary: true,
      order: 1
    },
    // Safari images
    {
      vehicleId: vehicles.find(v => v.model === 'Safari')?.id || '',
      imageUrl: '/uploads/vehicles/tata-safari-1.jpg',
      altText: 'تاتا سفاري - أمامي',
      isPrimary: true,
      order: 1
    },
    // Harrier images
    {
      vehicleId: vehicles.find(v => v.model === 'Harrier')?.id || '',
      imageUrl: '/uploads/vehicles/tata-harrier-1.jpg',
      altText: 'تاتا هارير - أمامي',
      isPrimary: true,
      order: 1
    }
  ]

  for (const image of vehicleImages) {
    if (image.vehicleId) {
      await prisma.vehicleImage.create({ data: image })
    }
  }
  console.log(`  ✓ Created ${vehicleImages.length} vehicle images`)
}

async function seedVehicleSpecifications() {
  console.log('⚙️ Seeding vehicle specifications...')

  const vehicles = await prisma.vehicle.findMany()

  const specifications = [
    // Nexon specifications
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'engine',
      label: 'المحرك',
      value: '1.2L Turbocharged Petrol',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'power',
      label: 'القدرة الحصانية',
      value: '110 HP',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'INTERIOR'
    },
    // Punch specifications
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'engine',
      label: 'المحرك',
      value: '1.2L Naturally Aspirated Petrol',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'power',
      label: 'القدرة الحصانية',
      value: '85 HP',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'INTERIOR'
    },
    // Tiago specifications
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'engine',
      label: 'المحرك',
      value: '1.2L Revotron Petrol',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'power',
      label: 'القدرة الحصانية',
      value: '85 HP',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'INTERIOR'
    }
  ]

  for (const spec of specifications) {
    if (spec.vehicleId) {
      await prisma.vehicleSpecification.create({ data: spec })
    }
  }
  console.log(`  ✓ Created ${specifications.length} vehicle specifications`)
}

async function seedVehiclePricing() {
  console.log('💰 Seeding vehicle pricing...')

  const vehicles = await prisma.vehicle.findMany()

  for (const vehicle of vehicles) {
    const pricing = {
      vehicleId: vehicle.id,
      basePrice: vehicle.price,
      totalPrice: vehicle.price * 1.14, // Including 14% tax
      currency: 'EGP',
      hasDiscount: vehicle.featured,
      discountPercentage: vehicle.featured ? 5 : 0,
      taxes: vehicle.price * 0.14,
      fees: 5000
    }

    if (pricing.hasDiscount) {
      pricing.discountPrice = pricing.basePrice * 0.95
      pricing.discountExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }

    await prisma.vehiclePricing.create({ data: pricing })
  }
  console.log(`  ✓ Created pricing for ${vehicles.length} vehicles`)
}

async function seedServiceTypes() {
  console.log('🔧 Seeding service types...')

  const serviceTypes = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية شاملة لجميع سيارات تاتا',
      duration: 120,
      price: 500,
      category: 'MAINTENANCE',
      isActive: true
    },
    {
      name: 'تغيير الزيت',
      description: 'تغيير زيت المحرك والفلتر',
      duration: 30,
      price: 150,
      category: 'MAINTENANCE',
      isActive: true
    },
    {
      name: 'فحص الفرامل',
      description: 'فحص وصيانة نظام الفرامل',
      duration: 60,
      price: 300,
      category: 'REPAIR',
      isActive: true
    },
    {
      name: 'تكييف الهواء',
      description: 'صيانة نظام التكييف',
      duration: 90,
      price: 250,
      category: 'REPAIR',
      isActive: true
    },
    {
      name: 'فحص عام',
      description: 'فحص شامل قبل السفر',
      duration: 45,
      price: 100,
      category: 'INSPECTION',
      isActive: true
    }
  ]

  for (const serviceType of serviceTypes) {
    await prisma.serviceType.create({ data: serviceType })
  }
  console.log(`  ✓ Created ${serviceTypes.length} service types`)
}

async function seedTestDriveBookings() {
  console.log('🚗 Seeding test drive bookings...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ where: { featured: true } })

  if (users.length > 0 && vehicles.length > 0) {
    const bookings = [
      {
        customerId: users[0].id,
        vehicleId: vehicles[0].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: '10:00-11:00',
        status: 'CONFIRMED',
        notes: 'العميل مهتم جداً بالسيارة'
      },
      {
        customerId: users[1].id,
        vehicleId: vehicles[1].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: '11:00-12:00',
        status: 'PENDING',
        notes: 'ينتظر تأكيد من الإدارة'
      }
    ]

    for (const booking of bookings) {
      await prisma.testDriveBooking.create({ data: booking })
    }
    console.log(`  ✓ Created ${bookings.length} test drive bookings`)
  }
}

async function seedServiceBookings() {
  console.log('🔧 Seeding service bookings...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany()
  const serviceTypes = await prisma.serviceType.findMany()

  if (users.length > 0 && vehicles.length > 0 && serviceTypes.length > 0) {
    const bookings = [
      {
        customerId: users[0].id,
        vehicleId: vehicles[0].id,
        serviceTypeId: serviceTypes[0].id,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        timeSlot: '09:00-10:00',
        status: 'CONFIRMED',
        totalPrice: serviceTypes[0].price,
        paymentStatus: 'PENDING',
        notes: 'صيانة دورية للسيارة'
      },
      {
        customerId: users[1].id,
        vehicleId: vehicles[1].id,
        serviceTypeId: serviceTypes[1].id,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        timeSlot: '14:00-15:00',
        status: 'PENDING',
        totalPrice: serviceTypes[1].price,
        paymentStatus: 'PENDING',
        notes: 'تغيير زيت وفحص عام'
      }
    ]

    for (const booking of bookings) {
      await prisma.serviceBooking.create({ data: booking })
    }
    console.log(`  ✓ Created ${bookings.length} service bookings`)
  }
}

async function seedCompanyInfo() {
  console.log('🏢 Seeding company info...')

  const companyInfo = {
    title: 'الحمد للسيارات - وكيل تاتا المعتمد',
    subtitle: 'الجودة والثقة في عالم السيارات',
    description: 'نحن وكيل تاتا المعتمد في مصر، نقدم أحدث موديلات تاتا مع ضمان المصنع الكامل وخدمة ما بعد البيع المتميزة. خبرة تمتد لأكثر من 25 عاماً في تقديم أفضل الخدمات لعملائنا.',
    imageUrl: '/uploads/showroom-luxury.jpg',
    features: [
      'وكيل معتمد لتاتا',
      'ضمان المصنع الكامل',
      'خدمة ما بعد البيع 24/7',
      'تمويل سهل ومريح'
    ],
    ctaButtons: [
      { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
      { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
    ],
    isActive: true
  }

  await prisma.companyInfo.upsert({
    where: { id: 'default' },
    update: companyInfo,
    create: { id: 'default', ...companyInfo },
  })
  console.log('  ✓ Created company info')
}

async function seedSiteSettings() {
  console.log('⚙️ Seeding site settings...')

  const settings = {
    siteTitle: 'الحمد للسيارات',
    siteDescription: 'وكيل تاتا المعتمد في مصر - أحدث سيارات تاتا بأفضل الأسعار وضمان المصنع الكامل',
    logoUrl: '/uploads/logo/alhamd-cars-logo.png',
    faviconUrl: '/favicon.ico',
    contactEmail: 'info@elhamdimports.com',
    contactPhone: '+20 2 2345 6789',
    contactAddress: 'شارع التحرير، وسط القاهرة',
    workingHours: 'الأحد - الخميس: 9:00 ص - 9:00 م',
    socialLinks: {
      facebook: 'https://facebook.com/elhamdcars',
      twitter: 'https://twitter.com/elhamdcars',
      instagram: 'https://instagram.com/elhamdcars',
      youtube: 'https://youtube.com/elhamdcars'
    },
    seoSettings: {
      metaTitle: 'الحمد للسيارات - وكيل تاتا المعتمد في مصر',
      metaDescription: 'وكيل تاتا المعتمد في مصر - أحدث سيارات تاتا بأفضل الأسعار وضمان المصنع الكامل',
      keywords: 'سيارات تاتا, وكيل تاتا, سيارات جديدة, سيارات مستعملة, تمويل سيارات'
    },
    isActive: true
  }

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: settings,
    create: { id: 'default', ...settings },
  })
  console.log('  ✓ Created site settings')
}

async function seedSliders() {
  console.log('🎠 Seeding sliders...')

  const sliders = [
    {
      title: 'تاتا نيكسون 2024',
      subtitle: 'سيارة SUV عائلية متطورة',
      description: 'اكتشف تاتا نيكسون الجديدة تماماً بميزات أمان متقدمة وتصميم عصري',
      imageUrl: '/uploads/banners/nexon-banner.jpg',
      ctaText: 'استكشف الآن',
      ctaLink: '/vehicles',
      badge: 'جديد',
      badgeColor: 'bg-red-500',
      isActive: true,
      order: 1
    },
    {
      title: 'تاتا بنش 2024',
      subtitle: 'السيارة المدمجة القوية',
      description: 'مثالية للمدن بتصميم شبابي وأداء ممتاز',
      imageUrl: '/uploads/banners/punch-banner.jpg',
      ctaText: 'اعرف المزيد',
      ctaLink: '/vehicles',
      badge: 'الأكثر مبيعاً',
      badgeColor: 'bg-green-500',
      isActive: true,
      order: 2
    },
    {
      title: 'عروض التمويل',
      subtitle: 'تمويل سيارتك بأفضل الشروط',
      description: 'استفد من عروض التمويل المميزة على جميع سيارات تاتا',
      imageUrl: '/uploads/banners/electric-banner.jpg',
      ctaText: 'قدّم الآن',
      ctaLink: '/financing',
      badge: 'عرض خاص',
      badgeColor: 'bg-yellow-500',
      isActive: true,
      order: 3
    }
  ]

  for (const slider of sliders) {
    await prisma.slider.create({ data: slider })
  }
  console.log(`  ✓ Created ${sliders.length} sliders`)
}

async function seedCompanyStats() {
  console.log('📊 Seeding company stats...')

  const stats = [
    { label: 'سنة خبرة', number: '25+', description: 'في سوق السيارات المصري' },
    { label: 'سيارة مبيعة', number: '10000+', description: 'عميل سعيد' },
    { label: 'فرع', number: '3', description: 'في جميع أنحاء مصر' },
    { label: 'فني محترف', number: '50+', description: 'مدربون من تاتا' }
  ]

  for (const stat of stats) {
    await prisma.companyStat.create({ data: stat })
  }
  console.log(`  ✓ Created ${stats.length} company stats`)
}

async function seedCompanyValues() {
  console.log('💎 Seeding company values...')

  const values = [
    {
      title: 'الجودة',
      description: 'نقدم منتجات وخدمات عالية الجودة تلقى توقعات عملائنا',
      icon: 'award',
      order: 1
    },
    {
      title: 'الثقة',
      description: 'نبني علاقات طويلة الأمد مع عملائنا بناءً على الشفافية والأمانة',
      icon: 'shield',
      order: 2
    },
    {
      title: 'الابتكار',
      description: 'نسعى دائماً لتقديم أحدث الحلول والتقنيات في عالم السيارات',
      icon: 'lightbulb',
      order: 3
    },
    {
      title: 'العميل أولاً',
      description: 'رضا العملاء هو أولويتنا القصوى في كل ما نفعله',
      icon: 'heart',
      order: 4
    }
  ]

  for (const value of values) {
    await prisma.companyValue.create({ data: value })
  }
  console.log(`  ✓ Created ${values.length} company values`)
}

async function seedCompanyFeatures() {
  console.log('⭐ Seeding company features...')

  const features = [
    {
      title: 'ضمان المصنع الكامل',
      description: 'جميع سياراتنا تأتي مع ضمان المصنع الكامل',
      icon: 'check-circle',
      order: 1
    },
    {
      title: 'خدمة 24/7',
      description: 'خدمة عملاء متاحة على مدار الساعة',
      icon: 'phone',
      order: 2
    },
    {
      title: 'تمويل معتمد',
      description: 'شراكات مع أفضل البنوك لتمويل السيارات',
      icon: 'credit-card',
      order: 3
    },
    {
      title: 'صيانة معتمدة',
      description: 'مراكز صيانة معتمدة من تاتا',
      icon: 'wrench',
      order: 4
    }
  ]

  for (const feature of features) {
    await prisma.companyFeature.create({ data: feature })
  }
  console.log(`  ✓ Created ${features.length} company features`)
}

async function seedTimelineEvents() {
  console.log('📅 Seeding timeline events...')

  const events = [
    {
      year: '1999',
      title: 'تأسيس الشركة',
      description: 'تأسست الحمد للسيارات كوكيل لسيارات تاتا في مصر',
      order: 1
    },
    {
      year: '2005',
      title: 'التوسع في القاهرة',
      description: 'افتتاح الفرع الرئيسي في قلب القاهرة',
      order: 2
    },
    {
      year: '2015',
      title: 'التحول الرقمي',
      description: 'إطلاق الموقع الإلكتروني والخدمات الرقمية',
      order: 3
    },
    {
      year: '2020',
      title: 'التوسع الجديد',
      description: 'افتتاح فروع جديدة في الإسكندرية والجيزة',
      order: 4
    },
    {
      year: '2024',
      title: 'الريادة في السوق',
      description: 'أصبحنا الوكيل الأول لتاتا في مصر',
      order: 5
    }
  ]

  for (const event of events) {
    await prisma.timelineEvent.create({ data: event })
  }
  console.log(`  ✓ Created ${events.length} timeline events`)
}

async function seedContactInfo() {
  console.log('📞 Seeding contact info...')

  const contactInfo = {
    address: 'شارع التحرير، وسط القاهرة، القاهرة، مصر',
    phone: '+20 2 2345 6789',
    email: 'info@elhamdimports.com',
    workingHours: 'الأحد - الخميس: 9:00 ص - 9:00 م\nالجمعة - السبت: مغلق',
    emergencyPhone: '+20 10 1234 5678',
    whatsapp: '+20 10 1234 5678',
    mapUrl: 'https://maps.google.com/?q=Elhamd+Imports+Cairo'
  }

  await prisma.contactInfo.upsert({
    where: { id: 'default' },
    update: contactInfo,
    create: { id: 'default', ...contactInfo },
  })
  console.log('  ✓ Created contact info')
}

async function printLoginCredentials() {
  console.log('\n🔑 LOGIN CREDENTIALS FOR VERCEL DATABASE:');
  console.log('==========================================');
  
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true }
  });
  
  console.log('\n🔑 ADMIN USERS:');
  const adminUsers = users.filter(u => u.role === 'ADMIN');
  adminUsers.forEach(user => {
    console.log(`  📧 ${user.email}`);
    console.log(`  👤 ${user.name}`);
    console.log(`  🔐 Password: admin123`);
    console.log('');
  });
  
  console.log('👔 MANAGER USERS:');
  const managerUsers = users.filter(u => u.role === 'BRANCH_MANAGER');
  managerUsers.forEach(user => {
    console.log(`  📧 ${user.email}`);
    console.log(`  👤 ${user.name}`);
    console.log(`  🔐 Password: manager123`);
    console.log('');
  });
  
  console.log('👷 STAFF USERS:');
  const staffUsers = users.filter(u => u.role === 'STAFF');
  staffUsers.forEach(user => {
    let password = 'employee123';
    if (user.email.includes('sales')) password = 'sales123';
    if (user.email.includes('service')) password = 'service123';
    
    console.log(`  📧 ${user.email}`);
    console.log(`  👤 ${user.name}`);
    console.log(`  🔐 Password: ${password}`);
    console.log('');
  });
  
  console.log('👤 CUSTOMER USERS:');
  const customerUsers = users.filter(u => u.role === 'CUSTOMER');
  customerUsers.slice(0, 3).forEach(user => {
    console.log(`  📧 ${user.email}`);
    console.log(`  👤 ${user.name}`);
    console.log(`  🔐 Password: customer123`);
    console.log('');
  });
  
  console.log('🚗 FEATURED VEHICLES:');
  const vehicles = await prisma.vehicle.findMany({ 
    where: { featured: true },
    select: { make: true, model: true, year: true, price: true, color: true }
  });
  vehicles.forEach(vehicle => {
    console.log(`  🚗 ${vehicle.make} ${vehicle.model} ${vehicle.year}`);
    console.log(`  💰 EGP ${vehicle.price.toLocaleString()}`);
    console.log(`  🎨 ${vehicle.color}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Vercel database:', e)
    process.exit(1)
  })