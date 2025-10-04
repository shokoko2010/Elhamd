import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

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
  await seedTimeSlots()
  await seedTestDriveBookings()
  await seedServiceBookings()
  await seedSecurityLogs()
  await seedNotifications()
  await seedActivityLogs()

  console.log('✅ Database seeding completed successfully!')
}

async function cleanDatabase() {
  // Delete in reverse order of dependencies
  await prisma.securityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.serviceBooking.deleteMany()
  await prisma.testDriveBooking.deleteMany()
  await prisma.timeSlot.deleteMany()
  await prisma.vehiclePricing.deleteMany()
  await prisma.vehicleSpecification.deleteMany()
  await prisma.vehicleImage.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.serviceType.deleteMany()
  await prisma.userPermission.deleteMany()
  await prisma.user.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.roleTemplatePermission.deleteMany()
  await prisma.roleTemplate.deleteMany()
  await prisma.permission.deleteMany()
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
}

async function seedRoleTemplates() {
  console.log('👥 Seeding role templates...')

  const permissions = await prisma.permission.findMany()

  // Admin role template
  const adminPermissions = permissions.map(p => p.id)
  await prisma.roleTemplate.upsert({
    where: { name: 'Admin Template' },
    update: {
      permissions: adminPermissions,
    },
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
    update: {
      permissions: managerPermissions,
    },
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
    update: {
      permissions: employeePermissions,
    },
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
      address: 'شارع التحرير، وسط القاهرة',
      phone: '+20 2 2345 6789',
      email: 'cairo@elhamdimport.com',
      openingDate: new Date('2020-01-15'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
    },
    {
      name: 'فرع الإسكندرية',
      code: 'ALEX-002',
      address: 'شارع سعد زغلول، الإسكندرية',
      phone: '+20 3 4567 8901',
      email: 'alexandria@elhamdimport.com',
      openingDate: new Date('2021-03-20'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
    },
    {
      name: 'فرع الجيزة',
      code: 'GIZ-003',
      address: 'ميدان المحطة، الجيزة',
      phone: '+20 2 3456 7890',
      email: 'giza@elhamdimport.com',
      openingDate: new Date('2022-06-10'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
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

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const users = [
    {
      email: 'admin@elhamdimport.com',
      password: hashedPassword,
      name: 'أحمد محمد',
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
      email: 'manager@elhamdimport.com',
      password: hashedPassword,
      name: 'محمد علي',
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
      email: 'employee@elhamdimport.com',
      password: hashedPassword,
      name: 'عمر حسن',
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
      name: 'خالد أحمد',
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
      name: 'سارة محمد',
      role: 'CUSTOMER',
      phone: '+20 12 2345 6789',
      isActive: true,
      emailVerified: true,
      segment: 'VIP',
      status: 'active',
      branchId: branches[1]?.id,
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
      description: 'سيارة SUV عائلية عصرية مع ميزات أمان متقدمة',
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
      description: 'سيارة SUV مدمجة مثالية للقيادة في المدينة',
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
      description: 'سيارة هاتشباك اقتصادية مع استهلاك وقود ممتاز',
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
      description: 'سيارة هاتشباك Premium مع تصميم عصري',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أزرق',
      status: 'AVAILABLE',
      featured: false,
      branchId: branches[1]?.id,
    },
    {
      make: 'TATA',
      model: 'Harrier',
      year: 2024,
      price: 550000,
      stockNumber: 'THA-2024-005',
      vin: 'MAT62543798765436',
      description: 'سيارة SUV فاخرة بمحرك قوي وتصميم أنيق',
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
      model: 'Safari',
      year: 2024,
      price: 650000,
      stockNumber: 'TSA-2024-006',
      vin: 'MAT62543798765437',
      description: 'سيارة SUV عائلية كبيرة بـ 7 مقاعد',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'فضي',
      status: 'SOLD',
      featured: false,
      branchId: branches[2]?.id,
    },
  ]

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { stockNumber: vehicle.stockNumber },
      update: vehicle,
      create: vehicle,
    })
  }
}

async function seedVehicleImages() {
  console.log('📸 Seeding vehicle images...')

  const vehicles = await prisma.vehicle.findMany()

  for (const vehicle of vehicles) {
    const images = [
      {
        vehicleId: vehicle.id,
        imageUrl: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${vehicle.make}+${vehicle.model}-Front`,
        altText: `${vehicle.make} ${vehicle.model} - Front View`,
        isPrimary: true,
        order: 0,
      },
      {
        vehicleId: vehicle.id,
        imageUrl: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${vehicle.make}+${vehicle.model}-Side`,
        altText: `${vehicle.make} ${vehicle.model} - Side View`,
        isPrimary: false,
        order: 1,
      },
      {
        vehicleId: vehicle.id,
        imageUrl: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${vehicle.make}+${vehicle.model}-Rear`,
        altText: `${vehicle.make} ${vehicle.model} - Rear View`,
        isPrimary: false,
        order: 2,
      },
      {
        vehicleId: vehicle.id,
        imageUrl: `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${vehicle.make}+${vehicle.model}-Interior`,
        altText: `${vehicle.make} ${vehicle.model} - Interior`,
        isPrimary: false,
        order: 3,
      },
    ]

    for (const image of images) {
      await prisma.vehicleImage.create({
        data: image,
      })
    }
  }
}

async function seedVehicleSpecifications() {
  console.log('⚙️ Seeding vehicle specifications...')

  const vehicles = await prisma.vehicle.findMany()

  const specifications = [
    { key: 'engine', label: 'المحرك', value: '1.2L Turbo', category: 'ENGINE' },
    { key: 'power', label: 'القدرة الحصانية', value: '110 HP', category: 'ENGINE' },
    { key: 'torque', label: 'عزم الدوران', value: '140 Nm', category: 'ENGINE' },
    { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '35 لتر', category: 'ENGINE' },
    { key: 'doors', label: 'عدد الأبواب', value: '4', category: 'EXTERIOR' },
    { key: 'seats', label: 'عدد المقاعد', value: '5', category: 'INTERIOR' },
    { key: 'airbags', label: 'وسائد هوائية', value: '2', category: 'SAFETY' },
    { key: 'abs', label: 'نظام ABS', value: 'متوفر', category: 'SAFETY' },
    { key: 'touchscreen', label: 'شاشة لمس', value: '7 بوصة', category: 'TECHNOLOGY' },
    { key: 'bluetooth', label: 'بلوتوث', value: 'متوفر', category: 'TECHNOLOGY' },
  ]

  for (const vehicle of vehicles) {
    for (const spec of specifications) {
      await prisma.vehicleSpecification.create({
        data: {
          vehicleId: vehicle.id,
          ...spec,
        },
      })
    }
  }
}

async function seedVehiclePricing() {
  console.log('💰 Seeding vehicle pricing...')

  const vehicles = await prisma.vehicle.findMany()

  for (const vehicle of vehicles) {
    const basePrice = vehicle.price
    const taxes = basePrice * 0.14 // 14% tax
    const fees = 5000 // Fixed fees
    const totalPrice = basePrice + taxes + fees

    await prisma.vehiclePricing.create({
      data: {
        vehicleId: vehicle.id,
        basePrice,
        taxes,
        fees,
        totalPrice,
        currency: 'EGP',
        hasDiscount: Math.random() > 0.5,
        discountPercentage: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 5 : null,
        discountExpires: Math.random() > 0.5 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    })
  }
}

async function seedServiceTypes() {
  console.log('🔧 Seeding service types...')

  const services = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية شاملة للسيارة',
      duration: 120,
      price: 500,
      category: 'MAINTENANCE',
    },
    {
      name: 'تغيير زيت',
      description: 'تغيير زيت المحرك والفلتر',
      duration: 45,
      price: 150,
      category: 'MAINTENANCE',
    },
    {
      name: 'فحص مكابح',
      description: 'فحص وصيانة نظام المكابح',
      duration: 60,
      price: 200,
      category: 'REPAIR',
    },
    {
      name: 'تغيير إطارات',
      description: 'تغيير وتوازن الإطارات',
      duration: 90,
      price: 800,
      category: 'REPAIR',
    },
    {
      name: 'فحص تكييف',
      description: 'فحص وصيانة نظام التكييف',
      duration: 75,
      price: 250,
      category: 'REPAIR',
    },
    {
      name: 'غسيل وتلميع',
      description: 'غسيل كامل وتلميع للسيارة',
      duration: 180,
      price: 300,
      category: 'DETAILING',
    },
    {
      name: 'فحص قبل الشراء',
      description: 'فحص شامل للسيارة قبل الشراء',
      duration: 150,
      price: 400,
      category: 'INSPECTION',
    },
  ]

  for (const service of services) {
    await prisma.serviceType.create({
      data: service,
    })
  }
}

async function seedTimeSlots() {
  console.log('⏰ Seeding time slots...')

  const timeSlots = []
  const weekDays = [1, 2, 3, 4, 5, 6] // 1=Saturday, 2=Sunday, etc.
  
  for (const day of weekDays) {
    for (let hour = 9; hour <= 17; hour++) {
      timeSlots.push({
        dayOfWeek: day,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: true,
        maxBookings: 2,
      })
    }
  }

  for (const slot of timeSlots) {
    await prisma.timeSlot.create({
      data: {
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxBookings: slot.maxBookings,
        isActive: true,
      },
    })
  }
}

async function seedTestDriveBookings() {
  console.log('🚗 Seeding test drive bookings...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ where: { status: 'AVAILABLE' } })

  if (customers.length > 0 && vehicles.length > 0) {
    const bookings = [
      {
        customerId: customers[0].id,
        vehicleId: vehicles[0].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: '10:00',
        status: 'CONFIRMED',
        notes: 'العميل يريد تجربة القيادة في الطريق السريع',
      },
      {
        customerId: customers[1].id,
        vehicleId: vehicles[1].id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        timeSlot: '14:00',
        status: 'PENDING',
        notes: 'العميل يفضل القيادة في المدينة',
      },
    ]

    for (const booking of bookings) {
      await prisma.testDriveBooking.create({
        data: booking,
      })
    }
  }
}

async function seedServiceBookings() {
  console.log('🔧 Seeding service bookings...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ take: 3 })
  const services = await prisma.serviceType.findMany()

  if (customers.length > 0 && vehicles.length > 0 && services.length > 0) {
    const bookings = [
      {
        customerId: customers[0].id,
        vehicleId: vehicles[0].id,
        serviceTypeId: services[0].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: '09:00',
        status: 'CONFIRMED',
        totalPrice: services[0].price,
        paymentStatus: 'PENDING',
        notes: 'صيانة دورية بعد 10000 كم',
      },
      {
        customerId: customers[1].id,
        vehicleId: vehicles[1].id,
        serviceTypeId: services[1].id,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        timeSlot: '11:00',
        status: 'CONFIRMED',
        totalPrice: services[1].price,
        paymentStatus: 'COMPLETED',
        notes: 'تغيير زيت مع فلتر',
      },
    ]

    for (const booking of bookings) {
      await prisma.serviceBooking.create({
        data: booking,
      })
    }
  }
}

async function seedSecurityLogs() {
  console.log('🔒 Seeding security logs...')

  const users = await prisma.user.findMany()

  const logs = [
    {
      userId: users[0]?.id,
      action: 'LOGIN',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { loginMethod: 'email' },
      severity: 'INFO',
    },
    {
      userId: users[0]?.id,
      action: 'PASSWORD_CHANGE',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { previousPasswordChanged: true },
      severity: 'WARNING',
    },
    {
      userId: users[1]?.id,
      action: 'LOGIN_FAILED',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: { reason: 'invalid_password' },
      severity: 'WARNING',
    },
  ]

  for (const log of logs) {
    await prisma.securityLog.create({
      data: log,
    })
  }
}

async function seedNotifications() {
  console.log('🔔 Seeding notifications...')

  const users = await prisma.user.findMany()

  const notifications = [
    {
      userId: users[0]?.id,
      title: 'موعد صيانة قادم',
      message: 'لديك موعد صيانة يوم الخميس القادم الساعة 10 صباحاً',
      type: 'REMINDER',
      isRead: false,
      priority: 'MEDIUM',
    },
    {
      userId: users[1]?.id,
      title: 'تأكيد حجز اختبار قيادة',
      message: 'تم تأكيد حجز اختبار القيادة لسيارة TATA Nexon',
      type: 'BOOKING_CONFIRMED',
      isRead: true,
      priority: 'HIGH',
    },
    {
      userId: users[2]?.id,
      title: 'عرض خاص',
      message: 'خصم 10% على جميع خدمات الصيانة هذا الشهر',
      type: 'PROMOTION',
      isRead: false,
      priority: 'LOW',
    },
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    })
  }
}

async function seedActivityLogs() {
  console.log('📝 Seeding activity logs...')

  const users = await prisma.user.findMany()

  const activities = [
    {
      userId: users[0]?.id,
      action: 'VEHICLE_VIEWED',
      entityType: 'VEHICLE',
      entityId: '1',
      details: { vehicleMake: 'TATA', vehicleModel: 'Nexon' },
      ipAddress: '192.168.1.100',
    },
    {
      userId: users[1]?.id,
      action: 'BOOKING_CREATED',
      entityType: 'BOOKING',
      entityId: '1',
      details: { bookingType: 'TEST_DRIVE', vehicleId: '2' },
      ipAddress: '192.168.1.101',
    },
    {
      userId: users[0]?.id,
      action: 'PROFILE_UPDATED',
      entityType: 'USER',
      entityId: users[0]?.id,
      details: { updatedFields: ['phone', 'address'] },
      ipAddress: '192.168.1.100',
    },
  ]

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: activity,
    })
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