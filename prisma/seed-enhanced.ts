import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting enhanced database seeding...')

  // Clean existing data
  await cleanDatabase()
  console.log('🧹 Cleaned existing data')

  // Seed data in order of dependencies
  await seedPermissions()
  await seedRoleTemplates()
  await seedBranches()
  await seedUsers()
  await seedUserPermissions()
  await seedMedia() // Add existing media first
  await seedSliders() // Add sliders
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

  console.log('✅ Enhanced database seeding completed successfully!')
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
  await prisma.slider.deleteMany() // Clean sliders
  await prisma.media.deleteMany() // Clean media
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
    
    // Media Management
    { name: 'media.view', description: 'View media', category: 'MEDIA_MANAGEMENT' },
    { name: 'media.create', description: 'Create media', category: 'MEDIA_MANAGEMENT' },
    { name: 'media.update', description: 'Update media', category: 'MEDIA_MANAGEMENT' },
    { name: 'media.delete', description: 'Delete media', category: 'MEDIA_MANAGEMENT' },
    
    // Slider Management
    { name: 'sliders.view', description: 'View sliders', category: 'CONTENT_MANAGEMENT' },
    { name: 'sliders.create', description: 'Create sliders', category: 'CONTENT_MANAGEMENT' },
    { name: 'sliders.update', description: 'Update sliders', category: 'CONTENT_MANAGEMENT' },
    { name: 'sliders.delete', description: 'Delete sliders', category: 'CONTENT_MANAGEMENT' },
    
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
      email: 'cairo@elhamdimports.com',
      openingDate: new Date('2020-01-15'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
    },
    {
      name: 'فرع الإسكندرية',
      code: 'ALEX-002',
      address: 'شارع سعد زغلول، الإسكندرية',
      phone: '+20 3 4567 8901',
      email: 'alexandria@elhamdimports.com',
      openingDate: new Date('2021-03-20'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
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
      email: 'admin@elhamdimports.com',
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
      email: 'manager@elhamdimports.com',
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
      email: 'employee@elhamdimports.com',
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

async function seedMedia() {
  console.log('📸 Seeding media from uploads folder...')

  const mediaItems = [
    // Vehicle images
    { url: '/uploads/vehicles/1/nexon-front-new.jpg', category: 'vehicles', title: 'Tata Nexon Front', altText: 'Tata Nexon - Front View' },
    { url: '/uploads/vehicles/1/nexon-side-new.jpg', category: 'vehicles', title: 'Tata Nexon Side', altText: 'Tata Nexon - Side View' },
    { url: '/uploads/vehicles/2/punch-front-new.jpg', category: 'vehicles', title: 'Tata Punch Front', altText: 'Tata Punch - Front View' },
    { url: '/uploads/vehicles/3/tiago-front-new.jpg', category: 'vehicles', title: 'Tata Tiago Front', altText: 'Tata Tiago - Front View' },
    { url: '/uploads/vehicles/4/tigor-front.jpg', category: 'vehicles', title: 'Tata Tigor Front', altText: 'Tata Tigor - Front View' },
    { url: '/uploads/vehicles/5/harrier-front.jpg', category: 'vehicles', title: 'Tata Harrier Front', altText: 'Tata Harrier - Front View' },
    { url: '/uploads/vehicles/6/altroz-front.jpg', category: 'vehicles', title: 'Tata Altroz Front', altText: 'Tata Altroz - Front View' },
    
    // Banner images for sliders
    { url: '/uploads/banners/nexon-banner.jpg', category: 'banner', title: 'Tata Nexon Banner', altText: 'Tata Nexon - Special Offer' },
    { url: '/uploads/banners/punch-banner.jpg', category: 'banner', title: 'Tata Punch Banner', altText: 'Tata Punch - Compact SUV' },
    { url: '/uploads/banners/tiago-electric-banner.jpg', category: 'banner', title: 'Tata Tiago EV Banner', altText: 'Tata Tiago EV - Electric Future' },
    { url: '/uploads/banners/service-banner.jpg', category: 'banner', title: 'Service Banner', altText: 'Professional Service Center' },
    { url: '/uploads/banners/showroom-banner.jpg', category: 'banner', title: 'Showroom Banner', altText: 'Modern Showroom' },
    { url: '/uploads/banners/electric-banner.jpg', category: 'banner', title: 'Electric Banner', altText: 'Electric Vehicles' },
    { url: '/uploads/banners/adventure-banner.jpg', category: 'banner', title: 'Adventure Banner', altText: 'Adventure Ready' },
    
    // Company images
    { url: '/uploads/showroom-luxury.jpg', category: 'company', title: 'Luxury Showroom', altText: 'Luxury Car Showroom' },
    { url: '/uploads/dealership-exterior.jpg', category: 'company', title: 'Dealership Exterior', altText: 'Dealership Building Exterior' },
    { url: '/uploads/logo/alhamd-cars-logo.png', category: 'company', title: 'Alhamd Cars Logo', altText: 'Alhamd Cars Company Logo' },
    
    // Gallery images
    { url: '/uploads/thumbnails/showroom-1_thumbnail.webp', category: 'gallery', title: 'Showroom Interior', altText: 'Showroom Interior View' },
    { url: '/uploads/thumbnails/luxury-sedan-1_thumbnail.webp', category: 'gallery', title: 'Luxury Sedan', altText: 'Luxury Sedan Car' },
    { url: '/uploads/thumbnails/sports-car-1_thumbnail.webp', category: 'gallery', title: 'Sports Car', altText: 'Sports Car View' },
    { url: '/uploads/thumbnails/service-1_thumbnail.webp', category: 'gallery', title: 'Service Center', altText: 'Car Service Center' },
    { url: '/uploads/thumbnails/banner-1_thumbnail.webp', category: 'gallery', title: 'Promotional Banner', altText: 'Promotional Car Banner' },
  ]

  for (const item of mediaItems) {
    await prisma.media.create({
      data: {
        filename: item.url.split('/').pop() || 'image.jpg',
        originalName: item.title,
        path: item.url,
        url: item.url,
        thumbnailUrl: item.url,
        mimeType: 'image/jpeg',
        size: 500000, // Approximate size
        width: 800,
        height: 600,
        altText: item.altText,
        title: item.title,
        description: '',
        tags: JSON.stringify([item.category]),
        category: item.category,
        entityId: null,
        isPublic: true,
        isFeatured: item.category === 'banner',
        order: 0,
        metadata: JSON.stringify({
          source: 'uploads-folder',
          addedAt: new Date().toISOString()
        }),
        createdBy: 'system'
      }
    })
  }
}

async function seedSliders() {
  console.log('🎠 Seeding sliders...')

  const sliders = [
    {
      title: 'Tata Nexon - SUV عائلية متطورة',
      subtitle: 'الأمان والقوة في تصميم عصري',
      description: 'اكتشف Tata Nexon، السيارة SUV التي تجمع بين التصميم الأنيق والأداء القوي والميزات الأمان المتقدمة. مثالية للعائلات المصرية.',
      imageUrl: '/uploads/banners/nexon-banner.jpg',
      ctaText: 'اطلب سيارتك الآن',
      ctaLink: '/vehicles?model=nexon',
      badge: 'الأكثر مبيعاً',
      badgeColor: 'bg-red-500',
      isActive: true,
      order: 1,
    },
    {
      title: 'Tata Punch - SUV مدمجة للمدن',
      subtitle: 'القوة والكفاءة في حجم مثالي',
      description: 'Tata Punch هي السيارة المثالية للقيادة في المدن المصرية. تصميم مدمج قوي مع استهلاك وقود ممتاز وميزات ذكية.',
      imageUrl: '/uploads/banners/punch-banner.jpg',
      ctaText: 'جرب قيادة تجريبية',
      ctaLink: '/test-drive',
      badge: 'جديد',
      badgeColor: 'bg-green-500',
      isActive: true,
      order: 2,
    },
    {
      title: 'Tata Tiago EV - مستقبل الكهرباء',
      subtitle: 'سيارة كهربائية اقتصادية وصديقة للبيئة',
      description: 'انضم إلى ثورة السيارات الكهربائية مع Tata Tiago EV. صفر انبعاثات، استهلاك طاقة منخفض، وتكاليف تشغيل اقتصادية.',
      imageUrl: '/uploads/banners/tiago-electric-banner.jpg',
      ctaText: 'اعرف المزيد',
      ctaLink: '/vehicles?fuel=ELECTRIC',
      badge: 'كهربائي',
      badgeColor: 'bg-blue-500',
      isActive: true,
      order: 3,
    }
  ]

  for (const slider of sliders) {
    await prisma.slider.create({
      data: slider
    })
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
      description: 'سيارة SUV عائلية عصرية مع ميزات أمان متقدمة وتصميم أنيق',
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

  const vehicleImageMap = {
    'Nexon': [
      '/uploads/vehicles/1/nexon-front-new.jpg',
      '/uploads/vehicles/1/nexon-side-new.jpg',
      '/uploads/vehicles/tata-nexon-1.jpg',
      '/uploads/vehicles/tata-nexon-2.jpg',
    ],
    'Punch': [
      '/uploads/vehicles/2/punch-front-new.jpg',
      '/uploads/vehicles/tata-punch-1.jpg',
      '/uploads/vehicles/tata-punch-2.jpg',
    ],
    'Tiago': [
      '/uploads/vehicles/3/tiago-front-new.jpg',
      '/uploads/vehicles/tata-tiago-1.jpg',
      '/uploads/vehicles/tata-tiago-2.jpg',
    ],
    'Altroz': [
      '/uploads/vehicles/6/altroz-front.jpg',
      '/uploads/vehicles/tata-altroz-1.jpg',
      '/uploads/vehicles/tata-altroz-2.jpg',
    ],
    'Harrier': [
      '/uploads/vehicles/5/harrier-front.jpg',
      '/uploads/vehicles/tata-harrier-1.jpg',
      '/uploads/vehicles/tata-harrier-2.jpg',
    ],
    'Safari': [
      '/uploads/vehicles/tata-safari-1.jpg',
      '/uploads/vehicles/tata-safari-2.jpg',
      '/uploads/vehicles/tata-safari-3.jpg',
    ],
  }

  for (const vehicle of vehicles) {
    const images = vehicleImageMap[vehicle.model as keyof typeof vehicleImageMap] || []
    
    for (let i = 0; i < images.length; i++) {
      await prisma.vehicleImage.create({
        data: {
          vehicleId: vehicle.id,
          imageUrl: images[i],
          altText: `${vehicle.make} ${vehicle.model} - View ${i + 1}`,
          isPrimary: i === 0,
          order: i,
        },
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
        hasDiscount: false,
      },
    })
  }
}

async function seedServiceTypes() {
  console.log('🔧 Seeding service types...')

  const services = [
    {
      name: 'تغيير زيت المحرك',
      description: 'تغيير زيت المحرك وفلتر الزيت',
      duration: 60,
      price: 250,
      category: 'MAINTENANCE',
    },
    {
      name: 'فحص دوري',
      description: 'فحص شامل للسيارة',
      duration: 120,
      price: 400,
      category: 'MAINTENANCE',
    },
    {
      name: 'تغيير إطارات',
      description: 'تغيير الإطارات وضغط الهواء',
      duration: 90,
      price: 800,
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
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        timeSlot: '09:00',
        status: 'SCHEDULED',
        notes: 'تغيير زيت دوري',
      },
      {
        customerId: customers[1].id,
        vehicleId: vehicles[1].id,
        serviceTypeId: services[1].id,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        timeSlot: '11:00',
        status: 'SCHEDULED',
        notes: 'فحص شامل قبل السفر',
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

  for (const user of users) {
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'INFO',
        details: JSON.stringify({ loginTime: new Date().toISOString() }),
      },
    })
  }
}

async function seedNotifications() {
  console.log('🔔 Seeding notifications...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })

  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'مرحباً بك في الحمد للسيارات',
        message: 'يسعدنا انضمامك إلينا. اطلع على أحدث عروض سيارات تاتا.',
        type: 'WELCOME',
        isRead: false,
        data: JSON.stringify({ link: '/vehicles' }),
      },
    })
  }
}

async function seedActivityLogs() {
  console.log('📝 Seeding activity logs...')

  const users = await prisma.user.findMany()

  for (const user of users) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ 
          loginTime: new Date().toISOString(),
          userAgent: 'System Seed'
        }),
        ipAddress: '192.168.1.100',
      },
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