import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'
import { 
  PermissionCategory, 
  UserRole, 
  ServiceCategory, 
  PaymentMethod,
  NotificationType,
  NotificationChannel,
  EmailTemplateType 
} from '@prisma/client'

async function main() {
  console.log('Seeding database...')

  // Create default permissions
  const permissions = [
    // User Management
    { name: 'users.view', description: 'عرض المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.create', description: 'إنشاء مستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.edit', description: 'تعديل المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.delete', description: 'حذف المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.permissions', description: 'إدارة صلاحيات المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    
    // Vehicle Management
    { name: 'vehicles.view', description: 'عرض المركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    { name: 'vehicles.create', description: 'إنشاء مركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    { name: 'vehicles.edit', description: 'تعديل المركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    { name: 'vehicles.delete', description: 'حذف المركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    
    // Booking Management
    { name: 'bookings.view', description: 'عرض الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.create', description: 'إنشاء حجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.edit', description: 'تعديل الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.delete', description: 'حذف الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.confirm', description: 'تأكيد الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.cancel', description: 'إلغاء الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    
    // Service Management
    { name: 'services.view', description: 'عرض الخدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    { name: 'services.create', description: 'إنشاء خدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    { name: 'services.edit', description: 'تعديل الخدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    { name: 'services.delete', description: 'حذف الخدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    
    // Reporting
    { name: 'reports.view', description: 'عرض التقارير', category: PermissionCategory.REPORTING },
    { name: 'reports.export', description: 'تصدير التقارير', category: PermissionCategory.REPORTING },
    { name: 'reports.analytics', description: 'التحليلات والإحصائيات', category: PermissionCategory.REPORTING },
    
    // System Settings
    { name: 'settings.view', description: 'عرض الإعدادات', category: PermissionCategory.SYSTEM_SETTINGS },
    { name: 'settings.edit', description: 'تعديل الإعدادات', category: PermissionCategory.SYSTEM_SETTINGS },
    
    // Financial
    { name: 'financial.view', description: 'عرض البيانات المالية', category: PermissionCategory.FINANCIAL },
    { name: 'financial.edit', description: 'تعديل البيانات المالية', category: PermissionCategory.FINANCIAL },
    { name: 'financial.reports', description: 'تقارير مالية', category: PermissionCategory.FINANCIAL }
  ]

  for (const permission of permissions) {
    await db.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission
    })
  }

  // Create test users with hashed passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const hashedStaffPassword = await bcrypt.hash('staff123', 10)
  const hashedCustomerPassword = await bcrypt.hash('customer123', 10)

  // Create admin user
  const adminUser = await db.user.upsert({
    where: { email: 'admin@alhamdcars.com' },
    update: {},
    create: {
      email: 'admin@alhamdcars.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      phone: '+20 100 000 0001'
    }
  })

  // Create staff user
  const staffUser = await db.user.upsert({
    where: { email: 'staff@alhamdcars.com' },
    update: {},
    create: {
      email: 'staff@alhamdcars.com',
      password: hashedStaffPassword,
      name: 'Staff User',
      role: UserRole.STAFF,
      phone: '+20 100 000 0002'
    }
  })

  // Create customer user
  const customerUser = await db.user.upsert({
    where: { email: 'customer@alhamdcars.com' },
    update: {},
    create: {
      email: 'customer@alhamdcars.com',
      password: hashedCustomerPassword,
      name: 'Customer User',
      role: UserRole.CUSTOMER,
      phone: '+20 100 000 0003'
    }
  })

  // Create super admin user
  const superAdmin = await db.user.upsert({
    where: { email: 'admin@elhamd.com' },
    update: {},
    create: {
      email: 'admin@elhamd.com',
      password: hashedAdminPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      phone: '+20 100 000 0000'
    }
  })

  // Assign all permissions to super admin
  const allPermissions = await db.permission.findMany()
  for (const permission of allPermissions) {
    await db.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: superAdmin.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        userId: superAdmin.id,
        permissionId: permission.id
      }
    })
  }

  // Seed service types
  await seedServiceTypes()

  // Seed vehicles
  await seedVehicles()

  // Seed sliders
  await seedSliders()

  // Seed time slots
  await seedTimeSlots()

  // Seed holidays
  await seedHolidays()

  // Seed email templates
  await seedEmailTemplates()

  // Seed company info
  await seedCompanyInfo()

  // Seed service items
  await seedServiceItems()

  // Seed timeline events
  await seedTimelineEvents()

  // Seed company values
  await seedCompanyValues()

  // Seed company stats
  await seedCompanyStats()

  // Seed company features
  await seedCompanyFeatures()

  // Seed contact info
  await seedContactInfo()

  // Seed footer content
  await seedFooterContent()

  // Seed footer columns
  await seedFooterColumns()

  // Seed footer social
  await seedFooterSocial()

  console.log('Database seeded successfully!')
}

async function seedServiceTypes() {
  console.log('Seeding service types...')

  const serviceTypes = [
    // Maintenance
    { name: 'صيانة دورية', description: 'صيانة دورية للمركبة', duration: 120, price: 350, category: 'MAINTENANCE' },
    { name: 'تغيير زيت', description: 'تغيير زيت المحرك والفلتر', duration: 60, price: 150, category: 'MAINTENANCE' },
    { name: 'تناوب إطارات', description: 'تناوب الإطارات وتوازن العجلات', duration: 90, price: 200, category: 'MAINTENANCE' },
    { name: 'فحص مكابح', description: 'فحص وصيانة نظام المكابح', duration: 60, price: 180, category: 'MAINTENANCE' },
    
    // Repair
    { name: 'إصلاح محرك', description: 'إصلاح مشاكل المحرك', duration: 240, price: 800, category: 'REPAIR' },
    { name: 'إصلاح ناقل حركة', description: 'إصلاح ناقل الحركة', duration: 180, price: 600, category: 'REPAIR' },
    { name: 'إصلاح نظام كهربائي', description: 'إصلاح المشاكل الكهربائية', duration: 120, price: 400, category: 'REPAIR' },
    { name: 'إصلاح تكييف', description: 'إصلاح نظام التكييف', duration: 90, price: 300, category: 'REPAIR' },
    
    // Inspection
    { name: 'فحص سنوي', description: 'فحص سنوي شامل للمركبة', duration: 60, price: 100, category: 'INSPECTION' },
    { name: 'فحص إنبعاثات', description: 'فحص إنبعاثات العادم', duration: 30, price: 50, category: 'INSPECTION' },
    { name: 'فحص ما قبل الشراء', description: 'فحص شامل قبل شراء المركبة', duration: 120, price: 250, category: 'INSPECTION' },
    
    // Detailing
    { name: 'غسيل وتلميع', description: 'غسيل وتلميع خارجي', duration: 90, price: 120, category: 'DETAILING' },
    { name: 'تنظيف داخلي', description: 'تنظيف وتعقيم داخلي كامل', duration: 120, price: 200, category: 'DETAILING' },
    { name: 'حماية طلاء', description: 'حماية طلاء السيارة', duration: 180, price: 400, category: 'DETAILING' },
    { name: 'تلميع محرك', description: 'تنظيف وتلميع حجرة المحرك', duration: 60, price: 150, category: 'DETAILING' },
    
    // Custom
    { name: 'تركيب إكسسوارات', description: 'تركيب إكسسوارات خارجية', duration: 120, price: 300, category: 'CUSTOM' },
    { name: 'تعديل أداء', description: 'تعديلات لتحسين الأداء', duration: 240, price: 1000, category: 'CUSTOM' },
    { name: 'تركيب نظام صوت', description: 'تركيب نظام صوتي متقدم', duration: 180, price: 600, category: 'CUSTOM' }
  ]

  for (const serviceType of serviceTypes) {
    // Check if service type exists by name
    const existing = await db.serviceType.findFirst({
      where: { name: serviceType.name }
    })

    if (existing) {
      // Update existing service type
      await db.serviceType.update({
        where: { id: existing.id },
        data: serviceType
      })
    } else {
      // Create new service type
      await db.serviceType.create({
        data: serviceType
      })
    }
  }

  console.log('Service types seeded successfully!')
}

async function seedVehicles() {
  console.log('Seeding vehicles...')

  const vehicles = [
    {
      make: 'Tata',
      model: 'Nexon',
      year: 2024,
      price: 850000,
      stockNumber: 'TNX001',
      vin: 'MAT625487KLP12345',
      description: 'تاتا نيكسون 2024 - سيارة SUV عائلية متطورة مع أحدث تقنيات السلامة والراحة',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      images: [
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا نيكسون أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا نيكسون جانبية', isPrimary: false, order: 2 },
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا نيكسون خلفية', isPrimary: false, order: 3 }
      ]
    },
    {
      make: 'Tata',
      model: 'Punch',
      year: 2024,
      price: 650000,
      stockNumber: 'TPC002',
      vin: 'MAT625487KLP67890',
      description: 'تاتا بانش 2024 - سيارة SUV مدمجة مثالية للمدينة',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'رمادي',
      status: 'AVAILABLE',
      featured: true,
      images: [
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا بانش أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا بانش جانبية', isPrimary: false, order: 2 }
      ]
    },
    {
      make: 'Tata',
      model: 'Tiago',
      year: 2024,
      price: 550000,
      stockNumber: 'TTG003',
      vin: 'MAT625487KLP54321',
      description: 'تاتا تياجو 2024 - سيارة هاتشباك اقتصادية وعملية',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أحمر',
      status: 'AVAILABLE',
      featured: true,
      images: [
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا تياجو أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا تياجو داخلية', isPrimary: false, order: 2 }
      ]
    },
    {
      make: 'Tata',
      model: 'Harrier',
      year: 2024,
      price: 1200000,
      stockNumber: 'THR004',
      vin: 'MAT625487KLP98765',
      description: 'تاتا هاريير 2024 - سيارة SUV فاخرة بمحرك قوي',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أسود',
      status: 'AVAILABLE',
      featured: false,
      images: [
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا هاريير أمامية', isPrimary: true, order: 1 },
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا هاريير جانبية', isPrimary: false, order: 2 }
      ]
    },
    {
      make: 'Tata',
      model: 'Altroz',
      year: 2024,
      price: 480000,
      stockNumber: 'TAL005',
      vin: 'MAT625487KLP24680',
      description: 'تاتا ألتروز 2024 - سيارة هاتشباك عصرية بتصميم مميز',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أزرق',
      status: 'AVAILABLE',
      featured: false,
      images: [
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا ألتروز أمامية', isPrimary: true, order: 1 }
      ]
    },
    {
      make: 'Tata',
      model: 'Tigor',
      year: 2024,
      price: 520000,
      stockNumber: 'TIG006',
      vin: 'MAT625487KLP13579',
      description: 'تاتا تيغور 2024 - سيارة سيدان مدمجة أنيقة',
      category: 'SEDAN',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'فضي',
      status: 'AVAILABLE',
      featured: false,
      images: [
        { imageUrl: '/api/placeholder/400/300', altText: 'تاتا تيغور أمامية', isPrimary: true, order: 1 }
      ]
    }
  ]

  for (const vehicleData of vehicles) {
    // Check if vehicle exists by stock number
    const existing = await db.vehicle.findFirst({
      where: { stockNumber: vehicleData.stockNumber }
    })

    if (existing) {
      // Update existing vehicle
      await db.vehicle.update({
        where: { id: existing.id },
        data: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          price: vehicleData.price,
          vin: vehicleData.vin,
          description: vehicleData.description,
          category: vehicleData.category,
          fuelType: vehicleData.fuelType,
          transmission: vehicleData.transmission,
          mileage: vehicleData.mileage,
          color: vehicleData.color,
          status: vehicleData.status,
          featured: vehicleData.featured
        }
      })
    } else {
      // Create new vehicle
      const vehicle = await db.vehicle.create({
        data: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          price: vehicleData.price,
          stockNumber: vehicleData.stockNumber,
          vin: vehicleData.vin,
          description: vehicleData.description,
          category: vehicleData.category,
          fuelType: vehicleData.fuelType,
          transmission: vehicleData.transmission,
          mileage: vehicleData.mileage,
          color: vehicleData.color,
          status: vehicleData.status,
          featured: vehicleData.featured
        }
      })

      // Add images
      for (const imageData of vehicleData.images) {
        await db.vehicleImage.create({
          data: {
            vehicleId: vehicle.id,
            imageUrl: imageData.imageUrl,
            altText: imageData.altText,
            isPrimary: imageData.isPrimary,
            order: imageData.order
          }
        })
      }
    }
  }

  console.log('Vehicles seeded successfully!')
}

async function seedSliders() {
  console.log('Seeding sliders...')

  const sliders = [
    {
      title: 'تاتا نيكسون 2024',
      subtitle: 'سيارة SUV عائلية متطورة',
      description: 'تجربة القيادة المثالية مع أحدث تقنيات السلامة والراحة',
      imageUrl: '/uploads/banners/nexon-banner.jpg',
      ctaText: 'اكتشف المزيد',
      ctaLink: '/vehicles',
      badge: 'جديد',
      badgeColor: 'bg-green-500',
      order: 0,
      isActive: true
    },
    {
      title: 'عرض خاص على تاتا بانش',
      subtitle: 'خصم 15% على جميع الفئات',
      description: 'فرصة محدودة للحصول على سيارتك المفضلة بأفضل سعر',
      imageUrl: '/uploads/banners/punch-banner.jpg',
      ctaText: 'اطلب العرض الآن',
      ctaLink: '/vehicles',
      badge: 'عرض خاص',
      badgeColor: 'bg-red-500',
      order: 1,
      isActive: true
    },
    {
      title: 'تاتا تياجو إلكتريك',
      subtitle: 'مستقبل التنقل المستدام',
      description: 'انضم إلى ثورة السيارات الكهربائية مع تاتا تياجو إلكتريك',
      imageUrl: '/uploads/banners/tiago-electric-banner.jpg',
      ctaText: 'جرب القيادة',
      ctaLink: '/test-drive',
      badge: 'إلكتريك',
      badgeColor: 'bg-blue-500',
      order: 2,
      isActive: true
    }
  ]

  for (const sliderData of sliders) {
    // Check if slider exists by title
    const existing = await db.slider.findFirst({
      where: { title: sliderData.title }
    })

    if (!existing) {
      // Create new slider
      await db.slider.create({
        data: sliderData
      })
    }
  }

  console.log('Sliders seeded successfully!')
}

async function seedTimeSlots() {
  console.log('Seeding time slots...')

  const timeSlots = [
    // Sunday
    { dayOfWeek: 0, startTime: '09:00', endTime: '10:00', maxBookings: 3 },
    { dayOfWeek: 0, startTime: '10:00', endTime: '11:00', maxBookings: 3 },
    { dayOfWeek: 0, startTime: '11:00', endTime: '12:00', maxBookings: 3 },
    { dayOfWeek: 0, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
    { dayOfWeek: 0, startTime: '14:00', endTime: '15:00', maxBookings: 3 },
    { dayOfWeek: 0, startTime: '15:00', endTime: '16:00', maxBookings: 3 },
    { dayOfWeek: 0, startTime: '16:00', endTime: '17:00', maxBookings: 2 },
    
    // Monday
    { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxBookings: 3 },
    { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', maxBookings: 3 },
    { dayOfWeek: 1, startTime: '11:00', endTime: '12:00', maxBookings: 3 },
    { dayOfWeek: 1, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
    { dayOfWeek: 1, startTime: '14:00', endTime: '15:00', maxBookings: 3 },
    { dayOfWeek: 1, startTime: '15:00', endTime: '16:00', maxBookings: 3 },
    { dayOfWeek: 1, startTime: '16:00', endTime: '17:00', maxBookings: 2 },
    
    // Tuesday
    { dayOfWeek: 2, startTime: '09:00', endTime: '10:00', maxBookings: 3 },
    { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', maxBookings: 3 },
    { dayOfWeek: 2, startTime: '11:00', endTime: '12:00', maxBookings: 3 },
    { dayOfWeek: 2, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
    { dayOfWeek: 2, startTime: '14:00', endTime: '15:00', maxBookings: 3 },
    { dayOfWeek: 2, startTime: '15:00', endTime: '16:00', maxBookings: 3 },
    { dayOfWeek: 2, startTime: '16:00', endTime: '17:00', maxBookings: 2 },
    
    // Wednesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '10:00', maxBookings: 3 },
    { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', maxBookings: 3 },
    { dayOfWeek: 3, startTime: '11:00', endTime: '12:00', maxBookings: 3 },
    { dayOfWeek: 3, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
    { dayOfWeek: 3, startTime: '14:00', endTime: '15:00', maxBookings: 3 },
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:00', maxBookings: 3 },
    { dayOfWeek: 3, startTime: '16:00', endTime: '17:00', maxBookings: 2 },
    
    // Thursday
    { dayOfWeek: 4, startTime: '09:00', endTime: '10:00', maxBookings: 3 },
    { dayOfWeek: 4, startTime: '10:00', endTime: '11:00', maxBookings: 3 },
    { dayOfWeek: 4, startTime: '11:00', endTime: '12:00', maxBookings: 3 },
    { dayOfWeek: 4, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
    { dayOfWeek: 4, startTime: '14:00', endTime: '15:00', maxBookings: 3 },
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:00', maxBookings: 3 },
    { dayOfWeek: 4, startTime: '16:00', endTime: '17:00', maxBookings: 2 },
    
    // Saturday
    { dayOfWeek: 6, startTime: '09:00', endTime: '10:00', maxBookings: 2 },
    { dayOfWeek: 6, startTime: '10:00', endTime: '11:00', maxBookings: 2 },
    { dayOfWeek: 6, startTime: '11:00', endTime: '12:00', maxBookings: 2 },
    { dayOfWeek: 6, startTime: '12:00', endTime: '13:00', maxBookings: 1 },
    { dayOfWeek: 6, startTime: '14:00', endTime: '15:00', maxBookings: 2 },
    { dayOfWeek: 6, startTime: '15:00', endTime: '16:00', maxBookings: 2 },
    { dayOfWeek: 6, startTime: '16:00', endTime: '17:00', maxBookings: 1 }
  ]

  for (const timeSlot of timeSlots) {
    // Check if time slot exists
    const existing = await db.timeSlot.findFirst({
      where: {
        dayOfWeek: timeSlot.dayOfWeek,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime
      }
    })

    if (existing) {
      await db.timeSlot.update({
        where: { id: existing.id },
        data: timeSlot
      })
    } else {
      await db.timeSlot.create({
        data: timeSlot
      })
    }
  }

  console.log('Time slots seeded successfully!')
}

async function seedHolidays() {
  console.log('Seeding holidays...')

  const currentYear = new Date().getFullYear()
  const holidays = [
    {
      date: new Date(currentYear, 0, 1), // New Year
      name: 'رأس السنة الميلادية',
      description: 'عطلة رأس السنة الميلادية',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 0, 7), // Coptic Christmas
      name: 'عيد الميلاد المجيد',
      description: 'عيد الميلاد المجيد (الكريسماس القبطي)',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 0, 25), // Revolution Day
      name: 'عيد ثورة 25 يناير',
      description: 'ذكرى ثورة 25 يناير',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 3, 25), // Sinai Liberation Day
      name: 'عيد تحرير سيناء',
      description: 'عيد تحرير سيناء',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 4, 1), // Labor Day
      name: 'عيد العمال',
      description: 'عيد العمال',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 4, 25), // Liberation Day
      name: 'عيد التحرير',
      description: 'عيد التحرير',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 6, 23), // July Revolution
      name: 'عيد ثورة 23 يوليو',
      description: 'ذكرى ثورة 23 يوليو',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 9, 6), // Armed Forces Day
      name: 'عيد القوات المسلحة',
      description: 'عيد القوات المسلحة',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 9, 24), // October War Victory
      name: 'عيد النصر',
      description: 'ذكرى انتصار أكتوبر',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 11, 6), // Islamic New Year (approximate)
      name: 'رأس السنة الهجرية',
      description: 'رأس السنة الهجرية',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 11, 10), // Prophet's Birthday (approximate)
      name: 'عيد المولد النبوي',
      description: 'عيد المولد النبوي الشريف',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 5, 17), // Eid al-Fitr (approximate)
      name: 'عيد الفطر',
      description: 'عيد الفطر المبارك',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 7, 22), // Eid al-Adha (approximate)
      name: 'عيد الأضحى',
      description: 'عيد الأضحى المبارك',
      isRecurring: true
    }
  ]

  for (const holiday of holidays) {
    // Check if holiday exists
    const existing = await db.holiday.findFirst({
      where: {
        date: holiday.date,
        name: holiday.name
      }
    })

    if (existing) {
      await db.holiday.update({
        where: { id: existing.id },
        data: holiday
      })
    } else {
      await db.holiday.create({
        data: holiday
      })
    }
  }

  console.log('Holidays seeded successfully!')
}

async function seedEmailTemplates() {
  console.log('Seeding email templates...')

  const templates = [
    {
      name: 'booking_confirmation',
      subject: 'تأكيد حجز الخدمة - الحمد للسيارات',
      content: `
        عزيزي العميل،

        تم تأكيد حجزك بنجاح في الحمد للسيارات.

        تفاصيل الحجز:
        - الخدمة: {{serviceName}}
        - التاريخ: {{date}}
        - الوقت: {{timeSlot}}
        - المركبة: {{vehicleMake}} {{vehicleModel}}
        - السعر: {{price}}

        نرجو منك الحضور في الموعد المحدد مع إحضار المستندات اللازمة.

        مع تحيات،
        فريق الحمد للسيارات

        للتواصل: {{contactInfo}}
      `,
      type: EmailTemplateType.BOOKING_CONFIRMATION
    },
    {
      name: 'booking_reminder',
      subject: 'تذكير بموعد الخدمة - الحمد للسيارات',
      content: `
        عزيزي العميل،

        هذا تذكير بموعد خدمتك غداً في الحمد للسيارات.

        تفاصيل الموعد:
        - الخدمة: {{serviceName}}
        - التاريخ: {{date}}
        - الوقت: {{timeSlot}}
        - المركبة: {{vehicleMake}} {{vehicleModel}}

        نرجو منك الحضور في الموعد المحدد.

        في حال عدم تمكنك من الحضور، يرجى إلغاء الحجز قبل 24 ساعة.

        مع تحيات،
        فريق الحمد للسيارات

        للتواصل: {{contactInfo}}
      `,
      type: EmailTemplateType.BOOKING_REMINDER
    },
    {
      name: 'booking_cancellation',
      subject: 'إلغاء الحجز - الحمد للسيارات',
      content: `
        عزيزي العميل،

        تم إلغاء حجزك في الحمد للسيارات.

        تفاصيل الحجز الملغي:
        - الخدمة: {{serviceName}}
        - التاريخ: {{date}}
        - الوقت: {{timeSlot}}
        - سبب الإلغاء: {{cancellationReason}}

        نشكرك لتواصلك معنا ونتمنى خدمتك في المستقبل.

        مع تحيات،
        فريق الحمد للسيارات

        للتواصل: {{contactInfo}}
      `,
      type: EmailTemplateType.BOOKING_CANCELLATION
    },
    {
      name: 'payment_received',
      subject: 'تأكيد استلام الدفعة - الحمد للسيارات',
      content: `
        عزيزي العميل،

        تم استلام دفعتك بنجاح.

        تفاصيل الدفعة:
        - المبلغ: {{amount}}
        - العملة: {{currency}}
        - طريقة الدفع: {{paymentMethod}}
        - رقم المعاملة: {{transactionId}}
        - تاريخ الدفع: {{paymentDate}}

        شكراً لك على ثقتك في الحمد للسيارات.

        مع تحيات،
        فريق الحمد للسيارات

        للتواصل: {{contactInfo}}
      `,
      type: EmailTemplateType.PAYMENT_RECEIVED
    },
    {
      name: 'welcome',
      subject: 'مرحباً بك في الحمد للسيارات',
      content: `
        عزيزي العميل،

        يسعدنا أن نرحب بك في عائلة الحمد للسيارات - الوكيل الرسمي المعتمد لسيارات تاتا في مصر.

        في الحمد للسيارات، نقدم لك:
        - أحدث موديلات تاتا 2024
        - ضمان المصنع لمدة 3 سنوات
        - خدمة صيانة على مدار الساعة
        - تمويل سيارات بأفضل الأسعار
        - فريق من الخبراء المتخصصين

        يمكنك الآن:
        - حجز موعد صيانة
        - طلب قيادة تجريبية
        - استعراض أحدث السيارات
        - الاستفسار عن التمويل

        لا تتردد في التواصل معنا لأي استفسار.

        مع تحيات،
        فريق الحمد للسيارات

        للتواصل: {{contactInfo}}
        الموقع الإلكتروني: {{websiteUrl}}
      `,
      type: EmailTemplateType.WELCOME
    }
  ]

  for (const template of templates) {
    await db.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    })
  }

  console.log('Email templates seeded successfully!')
}

async function seedCompanyInfo() {
  console.log('Seeding company info...')

  const companyInfo = {
    title: 'مرحباً بك في الحمد للسيارات',
    subtitle: 'الوكيل الرسمي المعتمد لسيارات تاتا في مصر',
    description: 'نحن فخورون بتمثيل علامة تاتا التجارية في مصر، حيث نقدم لكم أحدث الموديلات مع ضمان الجودة الأصلي وخدمة ما بعد البيع المتميزة.',
    imageUrl: '/uploads/showroom-luxury.jpg',
    features: [
      'أحدث موديلات تاتا 2024',
      'ضمان المصنع لمدة 3 سنوات',
      'خدمة صيانة على مدار الساعة',
      'تمويل سيارات بأفضل الأسعار'
    ],
    ctaButtons: [
      { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
      { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
    ],
    isActive: true
  }

  const existing = await db.companyInfo.findFirst()
  if (!existing) {
    await db.companyInfo.create({
      data: companyInfo
    })
  }

  console.log('Company info seeded successfully!')
}

async function seedServiceItems() {
  console.log('Seeding service items...')

  const serviceItems = [
    {
      title: 'بيع سيارات جديدة',
      description: 'أحدث موديلات تاتا مع ضمان المصنع الكامل',
      icon: 'Car',
      link: '/vehicles',
      order: 0,
      isActive: true
    },
    {
      title: 'خدمة الصيانة',
      description: 'صيانة احترافية بأسعار تنافسية',
      icon: 'Wrench',
      link: '/maintenance',
      order: 1,
      isActive: true
    },
    {
      title: 'قطع غيار أصلية',
      description: 'قطع غيار تاتا الأصلية مع ضمان الجودة',
      icon: 'Package',
      link: '/parts',
      order: 2,
      isActive: true
    },
    {
      title: 'تمويل سيارات',
      description: 'خيارات تمويل متنوعة بأفضل الأسعار',
      icon: 'CreditCard',
      link: '/financing',
      order: 3,
      isActive: true
    }
  ]

  for (const item of serviceItems) {
    const existing = await db.serviceItem.findFirst({
      where: { title: item.title }
    })
    if (!existing) {
      await db.serviceItem.create({
        data: item
      })
    }
  }

  console.log('Service items seeded successfully!')
}

async function seedTimelineEvents() {
  console.log('Seeding timeline events...')

  const timelineEvents = [
    {
      year: '1999',
      title: 'تأسيس الشركة',
      description: 'تأسست الحمد للسيارات كوكيل رسمي لسيارات تاتا في مصر',
      icon: 'Car',
      order: 0,
      isActive: true
    },
    {
      year: '2005',
      title: 'التوسع في الخدمات',
      description: 'إطلاق أول مركز خدمة متكامل لصيانة سيارات تاتا',
      icon: 'Wrench',
      order: 1,
      isActive: true
    },
    {
      year: '2010',
      title: 'التوسع الجغرافي',
      description: 'افتتاح فروع جديدة في المحافظات المصرية',
      icon: 'MapPin',
      order: 2,
      isActive: true
    },
    {
      year: '2015',
      title: 'التميز في الخدمة',
      description: 'الحصول على جائزة أفضل وكيل خدمة لسيارات تاتا',
      icon: 'Award',
      order: 3,
      isActive: true
    },
    {
      year: '2020',
      title: 'التحول الرقمي',
      description: 'إطلاق المنصة الرقمية الشاملة لخدمة العملاء',
      icon: 'Smartphone',
      order: 4,
      isActive: true
    },
    {
      year: '2024',
      title: 'سيارات كهربائية',
      description: 'إدخال سيارات تاتا الكهربائية إلى السوق المصري',
      icon: 'Zap',
      order: 5,
      isActive: true
    }
  ]

  for (const event of timelineEvents) {
    const existing = await db.timelineEvent.findFirst({
      where: { title: event.title }
    })
    if (!existing) {
      await db.timelineEvent.create({
        data: event
      })
    }
  }

  console.log('Timeline events seeded successfully!')
}

async function seedCompanyValues() {
  console.log('Seeding company values...')

  const companyValues = [
    {
      title: 'الجودة',
      description: 'نلتزم بأعلى معايير الجودة في جميع منتجاتنا وخدماتنا',
      icon: 'Shield',
      order: 0,
      isActive: true
    },
    {
      title: 'العميل أولاً',
      description: 'نضع رضا العملاء في مقدمة أولوياتنا في كل قرار نتخذه',
      icon: 'Users',
      order: 1,
      isActive: true
    },
    {
      title: 'الابتكار',
      description: 'نسعى دائماً لتقديم حلول مبتكرة تلبي احتياجات العملاء',
      icon: 'Lightbulb',
      order: 2,
      isActive: true
    },
    {
      title: 'النزاهة',
      description: 'نعمل بشفافية ونزاهة في جميع تعاملاتنا',
      icon: 'Heart',
      order: 3,
      isActive: true
    },
    {
      title: 'التميز',
      description: 'نسعى دائماً لتقديم أفضل الخدمات والمنتجات في السوق',
      icon: 'Star',
      order: 4,
      isActive: true
    }
  ]

  for (const value of companyValues) {
    const existing = await db.companyValue.findFirst({
      where: { title: value.title }
    })
    if (!existing) {
      await db.companyValue.create({
        data: value
      })
    }
  }

  console.log('Company values seeded successfully!')
}

async function seedCompanyStats() {
  console.log('Seeding company stats...')

  const companyStats = [
    {
      number: '25+',
      label: 'سنة خبرة',
      icon: 'Clock',
      order: 0,
      isActive: true
    },
    {
      number: '50K+',
      label: 'سيارة مباعة',
      icon: 'Car',
      order: 1,
      isActive: true
    },
    {
      number: '15+',
      label: 'معرض وخدمة',
      icon: 'MapPin',
      order: 2,
      isActive: true
    },
    {
      number: '100K+',
      label: 'عميل راضٍ',
      icon: 'Users',
      order: 3,
      isActive: true
    }
  ]

  for (const stat of companyStats) {
    const existing = await db.companyStat.findFirst({
      where: { label: stat.label }
    })
    if (!existing) {
      await db.companyStat.create({
        data: stat
      })
    }
  }

  console.log('Company stats seeded successfully!')
}

async function seedCompanyFeatures() {
  console.log('Seeding company features...')

  const companyFeatures = [
    {
      title: 'تشكيلة واسعة',
      description: 'أحدث موديلات تاتا 2024 بمواصفات عالمية وأسعار تنافسية',
      icon: 'Car',
      color: 'blue',
      features: ['نيكسون • بانش • تياجو', 'تيغور • ألتروز • هارير'],
      order: 0,
      isActive: true
    },
    {
      title: 'خدمة مميزة',
      description: 'فريق محترف من الفنيين المعتمدين وخدمة عملاء على مدار الساعة',
      icon: 'Wrench',
      color: 'orange',
      features: ['صيانة معتمدة', 'قطع غيار أصلية'],
      order: 1,
      isActive: true
    },
    {
      title: 'تمويل سهل',
      description: 'خيارات تمويل مرنة وبنود سداد مريحة تناسب جميع الميزانيات',
      icon: 'Star',
      color: 'green',
      features: ['فوائد تنافسية', 'موافقات سريعة'],
      order: 2,
      isActive: true
    }
  ]

  for (const feature of companyFeatures) {
    const existing = await db.companyFeature.findFirst({
      where: { title: feature.title }
    })
    if (!existing) {
      await db.companyFeature.create({
        data: feature
      })
    }
  }

  console.log('Company features seeded successfully!')
}

async function seedContactInfo() {
  console.log('Seeding contact info...')

  const contactInfo = {
    primaryPhone: '+20 2 1234 5678',
    secondaryPhone: '+20 1 2345 6789',
    primaryEmail: 'info@alhamdcars.com',
    secondaryEmail: 'sales@alhamdcars.com',
    address: 'القاهرة، مصر',
    mapLat: 30.0444,
    mapLng: 31.2357,
    workingHours: [
      { day: 'السبت - الخميس', hours: '9:00 ص - 8:00 م' },
      { day: 'الجمعة', hours: '2:00 م - 8:00 م' }
    ],
    departments: [
      { 
        value: 'sales', 
        label: 'قسم المبيعات', 
        icon: 'Car', 
        description: 'للاستفسارات عن السيارات الجديدة والأسعار' 
      },
      { 
        value: 'service', 
        label: 'قسم الخدمة', 
        icon: 'Wrench', 
        description: 'لحجز مواعيد الصيانة والاستفسارات الفنية' 
      },
      { 
        value: 'support', 
        label: 'قسم الدعم', 
        icon: 'Users', 
        description: 'للمساعدة العامة والدعم الفني' 
      }
    ],
    isActive: true
  }

  const existing = await db.contactInfo.findFirst()
  if (!existing) {
    await db.contactInfo.create({
      data: contactInfo
    })
  }

  console.log('Contact info seeded successfully!')
}

async function seedFooterContent() {
  console.log('Seeding footer content...')

  const footerContent = {
    logoText: 'الحمد للسيارات',
    tagline: 'وكيل تاتا المعتمد في مصر',
    primaryPhone: '+20 2 1234 5678',
    secondaryPhone: '+20 1 2345 6789',
    primaryEmail: 'info@alhamdcars.com',
    secondaryEmail: 'sales@alhamdcars.com',
    address: 'القاهرة، مصر',
    workingHours: 'السبت - الخميس: 9 صباحاً - 8 مساءً، الجمعة: 2 مساءً - 8 مساءً',
    copyrightText: '© 2024 الحمد للسيارات. جميع الحقوق محفوظة.',
    newsletterText: 'اشترك في نشرتنا الإخبارية للحصول على آخر التحديثات والعروض.',
    backToTopText: 'العودة للأعلى'
  }

  const existing = await db.footerContent.findFirst()
  if (!existing) {
    await db.footerContent.create({
      data: footerContent
    })
  }

  console.log('Footer content seeded successfully!')
}

async function seedFooterColumns() {
  console.log('Seeding footer columns...')

  const footerColumns = [
    { 
      title: 'روابط سريعة', 
      content: 'الرئيسية\nالسيارات\nالخدمات\nمن نحن\nاتصل بنا', 
      order: 1, 
      isVisible: true,
      type: 'LINKS'
    },
    { 
      title: 'خدماتنا', 
      content: 'بيع السيارات\nقيادة تجريبية\nحجز الخدمة\nالتمويل\nالصيانة', 
      order: 2, 
      isVisible: true,
      type: 'LINKS'
    },
    { 
      title: 'معلومات التواصل', 
      content: '+20 2 1234 5678\ninfo@alhamdcars.com\nالقاهرة، مصر', 
      order: 3, 
      isVisible: true,
      type: 'CONTACT'
    },
    { 
      title: 'تابعنا', 
      content: 'فيسبوك\nتويتر\nانستغرام\nلينكدإن', 
      order: 4, 
      isVisible: true,
      type: 'SOCIAL'
    }
  ]

  for (const column of footerColumns) {
    const existing = await db.footerColumn.findFirst({
      where: { title: column.title }
    })
    if (!existing) {
      await db.footerColumn.create({
        data: column
      })
    }
  }

  console.log('Footer columns seeded successfully!')
}

async function seedFooterSocial() {
  console.log('Seeding footer social...')

  const footerSocial = {
    facebook: 'https://facebook.com/alhamdcars',
    twitter: 'https://twitter.com/alhamdcars',
    instagram: 'https://instagram.com/alhamdcars',
    linkedin: 'https://linkedin.com/company/alhamdcars',
    youtube: 'https://youtube.com/alhamdcars',
    tiktok: 'https://tiktok.com/@alhamdcars'
  }

  const existing = await db.footerSocial.findFirst()
  if (!existing) {
    await db.footerSocial.create({
      data: footerSocial
    })
  }

  console.log('Footer social seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })