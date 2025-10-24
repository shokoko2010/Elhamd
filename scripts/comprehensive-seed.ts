import { PrismaClient } from '@prisma/client'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...')
  
  try {
    // Clean existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...')
    await cleanupDatabase()
    
    // 1. Seed Core Data
    console.log('📋 Seeding core data...')
    await seedPermissions()
    await seedRoleTemplates()
    await seedBranches()
    await seedUsers()
    
    // 2. Seed Vehicle Data
    console.log('🚗 Seeding vehicles...')
    await seedVehicles()
    
    // 3. Seed Service Data
    console.log('🔧 Seeding service data...')
    await seedServiceTypes()
    await seedTimeSlots()
    await seedHolidays()
    
    // 4. Seed Financial Data
    console.log('💰 Seeding financial data...')
    await seedTaxRates()
    
    // 5. Seed Inventory Data
    console.log('📦 Seeding inventory data...')
    await seedWarehouses()
    await seedInventoryItems()
    
    // 6. Seed Communication Data
    console.log('📧 Seeding communication data...')
    await seedEmailTemplates()
    await seedNotifications()
    
    // 7. Seed Business Operations
    console.log('📅 Seeding business operations...')
    await seedBookings()
    await seedInvoices()
    await seedTasks()
    
    // 8. Seed CRM Data
    console.log('👥 Seeding CRM data...')
    await seedCRMData()
    
    // 9. Seed Marketing Data
    console.log('📢 Seeding marketing data...')
    await seedMarketingData()
    
    // 10. Seed Support Data
    console.log('🎧 Seeding support data...')
    await seedSupportData()
    
    // 11. Seed Knowledge Base
    console.log('📚 Seeding knowledge base...')
    await seedKnowledgeBase()
    
    // 12. Seed Performance Data
    console.log('📊 Seeding performance data...')
    await seedPerformanceData()
    
    console.log('🎉 Comprehensive database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanupDatabase() {
  const tablenames = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  
  for (const { tablename } of tablenames as any[]) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
      } catch (error) {
        console.log(`Note: ${tablename} doesn't exist, skipping`)
      }
    }
  }
}

async function seedPermissions() {
  const permissions = [
    // User Management
    { name: 'view_users', description: 'View users', category: 'USER_MANAGEMENT' },
    { name: 'create_users', description: 'Create users', category: 'USER_MANAGEMENT' },
    { name: 'edit_users', description: 'Edit users', category: 'USER_MANAGEMENT' },
    { name: 'delete_users', description: 'Delete users', category: 'USER_MANAGEMENT' },
    { name: 'manage_user_roles', description: 'Manage user roles', category: 'USER_MANAGEMENT' },
    
    // Customer Management
    { name: 'view_customers', description: 'View customers', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'create_customers', description: 'Create customers', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'edit_customers', description: 'Edit customers', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'delete_customers', description: 'Delete customers', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'manage_customer_segments', description: 'Manage customer segments', category: 'CUSTOMER_MANAGEMENT' },
    
    // Vehicle Management
    { name: 'view_vehicles', description: 'View vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'create_vehicles', description: 'Create vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'edit_vehicles', description: 'Edit vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'delete_vehicles', description: 'Delete vehicles', category: 'VEHICLE_MANAGEMENT' },
    { name: 'manage_vehicle_pricing', description: 'Manage vehicle pricing', category: 'VEHICLE_MANAGEMENT' },
    { name: 'manage_vehicle_images', description: 'Manage vehicle images', category: 'VEHICLE_MANAGEMENT' },
    
    // Booking Management
    { name: 'view_bookings', description: 'View bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'create_bookings', description: 'Create bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'edit_bookings', description: 'Edit bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'delete_bookings', description: 'Delete bookings', category: 'BOOKING_MANAGEMENT' },
    { name: 'manage_test_drives', description: 'Manage test drives', category: 'BOOKING_MANAGEMENT' },
    { name: 'manage_service_bookings', description: 'Manage service bookings', category: 'BOOKING_MANAGEMENT' },
    
    // Service Management
    { name: 'view_services', description: 'View services', category: 'SERVICE_MANAGEMENT' },
    { name: 'create_services', description: 'Create services', category: 'SERVICE_MANAGEMENT' },
    { name: 'edit_services', description: 'Edit services', category: 'SERVICE_MANAGEMENT' },
    { name: 'delete_services', description: 'Delete services', category: 'SERVICE_MANAGEMENT' },
    { name: 'manage_service_pricing', description: 'Manage service pricing', category: 'SERVICE_MANAGEMENT' },
    
    // Inventory Management
    { name: 'view_inventory', description: 'View inventory', category: 'INVENTORY_MANAGEMENT' },
    { name: 'create_inventory', description: 'Create inventory items', category: 'INVENTORY_MANAGEMENT' },
    { name: 'edit_inventory', description: 'Edit inventory items', category: 'INVENTORY_MANAGEMENT' },
    { name: 'delete_inventory', description: 'Delete inventory items', category: 'INVENTORY_MANAGEMENT' },
    { name: 'manage_warehouses', description: 'Manage warehouses', category: 'INVENTORY_MANAGEMENT' },
    
    // Financial Management
    { name: 'view_invoices', description: 'View invoices', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'create_invoices', description: 'Create invoices', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'edit_invoices', description: 'Edit invoices', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'delete_invoices', description: 'Delete invoices', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'manage_payments', description: 'Manage payments', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'manage_tax_rates', description: 'Manage tax rates', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'view_financial_reports', description: 'View financial reports', category: 'FINANCIAL_MANAGEMENT' },
    
    // Branch Management
    { name: 'view_branches', description: 'View branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'create_branches', description: 'Create branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'edit_branches', description: 'Edit branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'delete_branches', description: 'Delete branches', category: 'BRANCH_MANAGEMENT' },
    { name: 'manage_branch_transfers', description: 'Manage branch transfers', category: 'BRANCH_MANAGEMENT' },
    { name: 'manage_branch_budgets', description: 'Manage branch budgets', category: 'BRANCH_MANAGEMENT' },
    
    // Marketing Management
    { name: 'view_campaigns', description: 'View marketing campaigns', category: 'MARKETING_MANAGEMENT' },
    { name: 'create_campaigns', description: 'Create marketing campaigns', category: 'MARKETING_MANAGEMENT' },
    { name: 'edit_campaigns', description: 'Edit marketing campaigns', category: 'MARKETING_MANAGEMENT' },
    { name: 'delete_campaigns', description: 'Delete marketing campaigns', category: 'MARKETING_MANAGEMENT' },
    { name: 'manage_leads', description: 'Manage leads', category: 'MARKETING_MANAGEMENT' },
    
    // Reporting
    { name: 'view_reports', description: 'View reports', category: 'REPORTING' },
    { name: 'create_reports', description: 'Create reports', category: 'REPORTING' },
    { name: 'export_reports', description: 'Export reports', category: 'REPORTING' },
    { name: 'view_analytics', description: 'View analytics', category: 'REPORTING' },
    
    // System Settings
    { name: 'view_system_settings', description: 'View system settings', category: 'SYSTEM_SETTINGS' },
    { name: 'edit_system_settings', description: 'Edit system settings', category: 'SYSTEM_SETTINGS' },
    { name: 'manage_permissions', description: 'Manage permissions', category: 'SYSTEM_SETTINGS' },
    { name: 'view_audit_logs', description: 'View audit logs', category: 'SYSTEM_SETTINGS' },
    { name: 'manage_backups', description: 'Manage backups', category: 'SYSTEM_SETTINGS' }
  ]

  for (const permission of permissions) {
    await prisma.permission.create({
      data: {
        ...permission,
        category: permission.category as any
      }
    })
  }
}

async function seedRoleTemplates() {
  const permissions = await prisma.permission.findMany()
  const permissionMap = new Map(permissions.map(p => [p.name, p.id]))
  
  const roleTemplates = [
    {
      name: 'SUPER_ADMIN_TEMPLATE',
      description: 'Full system access for super administrators',
      role: UserRole.SUPER_ADMIN,
      permissions: permissions.map(p => p.name),
      isSystem: true
    },
    {
      name: 'ADMIN_TEMPLATE',
      description: 'Administrative access for system administrators',
      role: UserRole.ADMIN,
      permissions: permissions.filter(p => 
        !p.name.includes('super_admin') && 
        !p.name.includes('manage_backups')
      ).map(p => p.name),
      isSystem: true
    },
    {
      name: 'BRANCH_MANAGER_TEMPLATE',
      description: 'Branch management access',
      role: UserRole.BRANCH_MANAGER,
      permissions: [
        'view_customers', 'create_customers', 'edit_customers',
        'view_vehicles', 'create_vehicles', 'edit_vehicles', 'manage_vehicle_pricing',
        'view_bookings', 'create_bookings', 'edit_bookings',
        'view_services', 'create_services', 'edit_services',
        'view_inventory', 'create_inventory', 'edit_inventory',
        'view_invoices', 'create_invoices', 'edit_invoices',
        'manage_payments',
        'view_reports', 'view_analytics'
      ],
      isSystem: true
    },
    {
      name: 'STAFF_TEMPLATE',
      description: 'Staff access for daily operations',
      role: UserRole.STAFF,
      permissions: [
        'view_customers', 'create_customers',
        'view_vehicles',
        'view_bookings', 'create_bookings',
        'view_services',
        'view_inventory'
      ],
      isSystem: true
    },
    {
      name: 'CUSTOMER_TEMPLATE',
      description: 'Customer access for self-service',
      role: UserRole.CUSTOMER,
      permissions: [
        'view_vehicles',
        'create_bookings', 'view_bookings'
      ],
      isSystem: true
    }
  ]

  for (const template of roleTemplates) {
    const createdTemplate = await prisma.roleTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        role: template.role,
        permissions: JSON.stringify(template.permissions),
        isSystem: template.isSystem
      }
    })

    // Create role template permissions
    for (const permissionName of template.permissions) {
      const permissionId = permissionMap.get(permissionName)
      if (permissionId) {
        await prisma.roleTemplatePermission.create({
          data: {
            templateId: createdTemplate.id,
            permissionId: permissionId
          }
        })
      }
    }
  }
}

async function seedBranches() {
  const branches = [
    {
      name: 'الفرع الرئيسي - القاهرة',
      code: 'CAI-MAIN',
      address: 'شارع جسر السويس، القاهرة، مصر',
      phone: '+20223456789',
      email: 'cairo@elhamdimport.online',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      openingDate: new Date('2020-01-01')
    },
    {
      name: 'فرع الإسكندرية',
      code: 'ALEX-01',
      address: 'شارع الكورنيش، الإسكندرية، مصر',
      phone: '+0334567890',
      email: 'alexandria@elhamdimport.online',
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      openingDate: new Date('2021-06-01')
    },
    {
      name: 'فرع الرياض',
      code: 'RIY-01',
      address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
      phone: '+966112345678',
      email: 'riyadh@elhamdimport.online',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      openingDate: new Date('2022-03-01')
    }
  ]

  for (const branch of branches) {
    await prisma.branch.create({ data: branch })
  }
}

async function seedUsers() {
  const branches = await prisma.branch.findMany()
  const roleTemplates = await prisma.roleTemplate.findMany()
  const roleTemplateMap = new Map(roleTemplates.map(rt => [rt.role, rt.id]))
  
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const users = [
    {
      email: 'admin@elhamdimport.online',
      name: 'مدير النظام',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
      branchId: branches[0]?.id,
      roleTemplateId: roleTemplateMap.get(UserRole.SUPER_ADMIN)
    },
    {
      email: 'cairo.manager@elhamdimport.online',
      name: 'مدير فرع القاهرة',
      password: hashedPassword,
      role: UserRole.BRANCH_MANAGER,
      isActive: true,
      emailVerified: true,
      branchId: branches[0]?.id,
      roleTemplateId: roleTemplateMap.get(UserRole.BRANCH_MANAGER)
    },
    {
      email: 'alex.manager@elhamdimport.online',
      name: 'مدير فرع الإسكندرية',
      password: hashedPassword,
      role: UserRole.BRANCH_MANAGER,
      isActive: true,
      emailVerified: true,
      branchId: branches[1]?.id,
      roleTemplateId: roleTemplateMap.get(UserRole.BRANCH_MANAGER)
    },
    {
      email: 'staff1@elhamdimport.online',
      name: 'موظف استقبال',
      password: hashedPassword,
      role: UserRole.STAFF,
      isActive: true,
      emailVerified: true,
      branchId: branches[0]?.id,
      roleTemplateId: roleTemplateMap.get(UserRole.STAFF)
    },
    {
      email: 'customer1@example.com',
      name: 'أحمد محمد',
      role: UserRole.CUSTOMER,
      isActive: true,
      emailVerified: true,
      phone: '+201012345678',
      roleTemplateId: roleTemplateMap.get(UserRole.CUSTOMER)
    },
    {
      email: 'customer2@example.com',
      name: 'مريم أحمد',
      role: UserRole.CUSTOMER,
      isActive: true,
      emailVerified: true,
      phone: '+201023456789',
      roleTemplateId: roleTemplateMap.get(UserRole.CUSTOMER)
    }
  ]

  for (const user of users) {
    await prisma.user.create({ data: user })
  }
}

async function seedVehicles() {
  const branches = await prisma.branch.findMany()
  
  const vehicles = [
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 850000,
      stockNumber: 'TOY-CAM-2024-001',
      vin: 'JTHBE5C21R1234567',
      description: 'تويوتا كامري موديل 2024 - لون أبيض',
      category: 'SEDAN',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[0]?.id
    },
    {
      make: 'Hyundai',
      model: 'Tucson',
      year: 2024,
      price: 920000,
      stockNumber: 'HYD-TUC-2024-001',
      vin: 'KM8J3CA26RU123456',
      description: 'هيونداي توسان موديل 2024 - لون أسود',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أسود',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[0]?.id
    },
    {
      make: 'Nissan',
      model: 'Sunny',
      year: 2023,
      price: 420000,
      stockNumber: 'NIS-SUN-2023-001',
      vin: 'JN1BF11D23M123456',
      description: 'نيسان سنترا موديل 2023 - لون فضي',
      category: 'SEDAN',
      fuelType: 'PETROL',
      transmission: 'CVT',
      mileage: 5000,
      color: 'فضي',
      status: 'AVAILABLE',
      featured: false,
      branchId: branches[1]?.id
    }
  ]

  for (const vehicle of vehicles) {
    const createdVehicle = await prisma.vehicle.create({
      data: {
        ...vehicle,
        category: vehicle.category as any,
        fuelType: vehicle.fuelType as any,
        transmission: vehicle.transmission as any,
        status: vehicle.status as any
      }
    })

    // Create vehicle pricing
    await prisma.vehiclePricing.create({
      data: {
        vehicleId: createdVehicle.id,
        basePrice: vehicle.price,
        totalPrice: vehicle.price * 1.14, // Including tax
        currency: branches.find(b => b.id === vehicle.branchId)?.currency || 'EGP'
      }
    })

    // Create vehicle specifications
    const specifications = [
      { key: 'engine', label: 'المحرك', value: '2.5L', category: 'ENGINE' },
      { key: 'power', label: 'القوة', value: '203 حصان', category: 'ENGINE' },
      { key: 'seats', label: 'عدد المقاعد', value: '5', category: 'INTERIOR' },
      { key: 'doors', label: 'عدد الأبواب', value: '4', category: 'EXTERIOR' },
      { key: 'airbags', label: 'وسائد الهواء', value: '6', category: 'SAFETY' },
      { key: 'abs', label: 'نظام ABS', value: 'متوفر', category: 'SAFETY' }
    ]

    for (const spec of specifications) {
      await prisma.vehicleSpecification.create({
        data: {
          vehicleId: createdVehicle.id,
          ...spec,
          category: spec.category as any
        }
      })
    }

    // Create sample vehicle images
    const images = [
      { imageUrl: '/images/vehicles/sample1-front.jpg', altText: 'الواجهة الأمامية', isPrimary: true, order: 1 },
      { imageUrl: '/images/vehicles/sample1-side.jpg', altText: 'الجانب', isPrimary: false, order: 2 },
      { imageUrl: '/images/vehicles/sample1-rear.jpg', altText: 'الخلف', isPrimary: false, order: 3 },
      { imageUrl: '/images/vehicles/sample1-interior.jpg', altText: 'الداخلية', isPrimary: false, order: 4 }
    ]

    for (const image of images) {
      await prisma.vehicleImage.create({
        data: {
          vehicleId: createdVehicle.id,
          ...image
        }
      })
    }
  }
}

async function seedServiceTypes() {
  const serviceTypes = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية شاملة للسيارة',
      duration: 120,
      price: 500,
      category: 'MAINTENANCE'
    },
    {
      name: 'تغيير زيت',
      description: 'تغيير زيت المحرك والفلتر',
      duration: 30,
      price: 150,
      category: 'MAINTENANCE'
    },
    {
      name: 'فحص شامل',
      description: 'فحص شامل للحالة العامة للسيارة',
      duration: 60,
      price: 200,
      category: 'INSPECTION'
    },
    {
      name: 'تنظيف وتلميع',
      description: 'تنظيف وتلميع شامل للسيارة',
      duration: 180,
      price: 300,
      category: 'DETAILING'
    },
    {
      name: 'إصلاح مكابح',
      description: 'إصلاح وصيانة نظام المكابح',
      duration: 90,
      price: 400,
      category: 'REPAIR'
    },
    {
      name: 'تغيير إطارات',
      description: 'تغيير وترصيص الإطارات',
      duration: 60,
      price: 800,
      category: 'REPAIR'
    }
  ]

  for (const service of serviceTypes) {
    await prisma.serviceType.create({
      data: {
        ...service,
        category: service.category as any
      }
    })
  }
}

async function seedTimeSlots() {
  const timeSlots = []
  
  // Create time slots for each day of the week
  for (let day = 0; day < 7; day++) {
    // Morning slots
    timeSlots.push(
      { dayOfWeek: day, startTime: '09:00', endTime: '10:00', maxBookings: 3 },
      { dayOfWeek: day, startTime: '10:00', endTime: '11:00', maxBookings: 3 },
      { dayOfWeek: day, startTime: '11:00', endTime: '12:00', maxBookings: 3 }
    )
    
    // Afternoon slots
    timeSlots.push(
      { dayOfWeek: day, startTime: '12:00', endTime: '13:00', maxBookings: 2 },
      { dayOfWeek: day, startTime: '14:00', endTime: '15:00', maxBookings: 3 },
      { dayOfWeek: day, startTime: '15:00', endTime: '16:00', maxBookings: 3 },
      { dayOfWeek: day, startTime: '16:00', endTime: '17:00', maxBookings: 3 }
    )
    
    // Evening slots
    timeSlots.push(
      { dayOfWeek: day, startTime: '17:00', endTime: '18:00', maxBookings: 2 },
      { dayOfWeek: day, startTime: '18:00', endTime: '19:00', maxBookings: 2 }
    )
  }

  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot })
  }
}

async function seedHolidays() {
  const currentYear = new Date().getFullYear()
  const holidays = [
    {
      date: new Date(currentYear, 0, 1), // New Year
      name: 'رأس السنة الميلادية',
      description: 'بداية العام الجديد',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 3, 25), // Sinai Liberation Day
      name: 'عيد تحرير سيناء',
      description: 'ذكرى تحرير سيناء',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 6, 23), // July 23 Revolution
      name: 'عيد ثورة 23 يوليو',
      description: 'ذكرى ثورة 23 يوليو',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 9, 6), // Armed Forces Day
      name: 'عيد القوات المسلحة',
      description: 'عيد القوات المسلحة المصرية',
      isRecurring: true
    },
    {
      date: new Date(currentYear, 11, 25), // Christmas
      name: 'عيد الميلاد المجيد',
      description: 'عيد ميلاد السيد المسيح',
      isRecurring: true
    }
  ]

  for (const holiday of holidays) {
    await prisma.holiday.create({ data: holiday })
  }
}

async function seedEmailTemplates() {
  const templates = [
    {
      name: 'booking_confirmation',
      subject: 'تأكيد الحجز - شركة الحمد للسيارات',
      content: 'عزيزي العميل،\n\nتم تأكيد حجزك بنجاح. تفاصيل الحجز:\n\n{booking_details}\n\nشكراً لثقتك بنا.\n\nشركة الحمد للسيارات',
      type: 'BOOKING_CONFIRMATION'
    },
    {
      name: 'booking_reminder',
      subject: 'تذكير بالحجز - شركة الحمد للسيارات',
      content: 'عزيزي العميل،\n\nنذكرك بموعد حجزك غداً في {booking_time}.\n\nنتطلع لرؤيتك.\n\nشركة الحمد للسيارات',
      type: 'BOOKING_REMINDER'
    },
    {
      name: 'welcome_email',
      subject: 'مرحباً بك في شركة الحمد للسيارات',
      content: 'عزيزي العميل،\n\nيسرنا انضمامك لعائلة شركة الحمد للسيارات.\n\nنحن هنا لخدمتك بأفضل السيارات والخدمات.\n\nمع أطيب التحيات،\nفريق شركة الحمد',
      type: 'WELCOME'
    },
    {
      name: 'payment_received',
      subject: 'استلام الدفعة - شركة الحمد للسيارات',
      content: 'عزيزي العميل،\n\nتم استلام دفعتك بنجاح.\n\nتفاصيل الدفعة:\n{payment_details}\n\nشكراً لك.\n\nشركة الحمد للسيارات',
      type: 'PAYMENT_RECEIVED'
    }
  ]

  for (const template of templates) {
    await prisma.emailTemplate.create({
      data: {
        ...template,
        type: template.type as any
      }
    })
  }
}

async function seedTaxRates() {
  const taxRates = [
    {
      name: 'ضريبة القيمة المضافة',
      type: 'STANDARD',
      rate: 14.0,
      description: 'ضريبة القيمة المضافة القياسية في مصر',
      isActive: true,
      effectiveFrom: new Date('2020-01-01')
    },
    {
      name: 'ضريبة الدمغة',
      type: 'STAMP_DUTY',
      rate: 0.5,
      description: 'ضريبة الدمغة على العقود',
      isActive: true,
      effectiveFrom: new Date('2020-01-01')
    },
    {
      name: 'رسوم التسجيل',
      type: 'REGISTRATION_FEE',
      rate: 2.0,
      description: 'رسوم تسجيل المركبات',
      isActive: true,
      effectiveFrom: new Date('2020-01-01')
    }
  ]

  for (const tax of taxRates) {
    await prisma.taxRate.create({
      data: {
        ...tax,
        type: tax.type as any
      }
    })
  }
}

async function seedWarehouses() {
  const branches = await prisma.branch.findMany()
  
  const warehouses = [
    {
      name: 'المستودع الرئيسي - القاهرة',
      code: 'WH-CAI-01',
      address: 'منطقة التجمع الخامس، القاهرة',
      phone: '+20223456789',
      email: 'warehouse.cairo@elhamdimport.online',
      branchId: branches[0]?.id,
      capacity: 500,
      isActive: true
    },
    {
      name: 'مستودع الإسكندرية',
      code: 'WH-ALEX-01',
      address: 'منطقة العامرية، الإسكندرية',
      phone: '+0334567890',
      email: 'warehouse.alex@elhamdimport.online',
      branchId: branches[1]?.id,
      capacity: 300,
      isActive: true
    }
  ]

  for (const warehouse of warehouses) {
    await prisma.warehouse.create({ data: warehouse })
  }
}

async function seedInventoryItems() {
  const warehouses = await prisma.warehouse.findMany()
  
  const inventoryItems = [
    {
      name: 'زيت محرك تويوتا',
      code: 'OIL-TOY-5W30',
      description: 'زيت محرك أصلي تويوتا 5W30',
      category: 'OIL',
      unitPrice: 250,
      quantity: 100,
      minStock: 20,
      warehouseId: warehouses[0]?.id,
      status: 'IN_STOCK'
    },
    {
      name: 'فلتر زيت تويوتا',
      code: 'FLT-TOY-OIL',
      description: 'فلتر زيت أصلي تويوتا',
      category: 'FILTER',
      unitPrice: 80,
      quantity: 150,
      minStock: 30,
      warehouseId: warehouses[0]?.id,
      status: 'IN_STOCK'
    },
    {
      name: 'بطارية سيارة',
      code: 'BAT-60AH',
      description: 'بطارية 60 أمبير للسيارات',
      category: 'BATTERY',
      unitPrice: 1200,
      quantity: 25,
      minStock: 10,
      warehouseId: warehouses[0]?.id,
      status: 'IN_STOCK'
    },
    {
      name: 'إطارات سيارة',
      code: 'TIRE-195-65R15',
      description: 'إطار سيارة مقاس 195/65R15',
      category: 'TIRE',
      unitPrice: 800,
      quantity: 40,
      minStock: 15,
      warehouseId: warehouses[1]?.id,
      status: 'IN_STOCK'
    }
  ]

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        ...item,
        category: item.category as any,
        status: item.status as any
      }
    })
  }
}

async function seedBookings() {
  const users = await prisma.user.findMany({ where: { role: UserRole.CUSTOMER } })
  const vehicles = await prisma.vehicle.findMany({ where: { status: 'AVAILABLE' } })
  const serviceTypes = await prisma.serviceType.findMany()
  
  const bookings = [
    {
      customerId: users[0]?.id,
      vehicleId: vehicles[0]?.id,
      serviceTypeId: serviceTypes[0]?.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      timeSlot: '10:00-11:00',
      status: 'CONFIRMED',
      notes: 'العميل يريد تغيير زيت وفحص عام'
    },
    {
      customerId: users[1]?.id,
      vehicleId: vehicles[1]?.id,
      serviceTypeId: serviceTypes[2]?.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      timeSlot: '14:00-15:00',
      status: 'PENDING',
      notes: 'فحص شامل قبل الشراء'
    }
  ]

  for (const booking of bookings) {
    const createdBooking = await prisma.booking.create({
      data: {
        ...booking,
        status: booking.status as any
      }
    })

    // Create service booking
    await prisma.serviceBooking.create({
      data: {
        customerId: booking.customerId!,
        vehicleId: booking.vehicleId!,
        serviceTypeId: booking.serviceTypeId!,
        date: booking.date!,
        timeSlot: booking.timeSlot!,
        status: booking.status as any,
        notes: booking.notes,
        totalPrice: 500
      }
    })
  }
}

async function seedInvoices() {
  const users = await prisma.user.findMany({ where: { role: UserRole.CUSTOMER } })
  const branches = await prisma.branch.findMany()
  
  const invoices = [
    {
      customerId: users[0]?.id,
      branchId: branches[0]?.id,
      invoiceNumber: 'INV-2024-001',
      type: 'SERVICE',
      status: 'PAID',
      subtotal: 500,
      taxAmount: 70,
      totalAmount: 570,
      currency: 'EGP',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      issueDate: new Date(),
      paidAt: new Date(),
      notes: 'فاتورة صيانة دورية'
    },
    {
      customerId: users[1]?.id,
      branchId: branches[0]?.id,
      invoiceNumber: 'INV-2024-002',
      type: 'SERVICE',
      status: 'PENDING',
      subtotal: 200,
      taxAmount: 28,
      totalAmount: 228,
      currency: 'EGP',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      issueDate: new Date(),
      notes: 'فاتورة فحص شامل'
    }
  ]

  for (const invoice of invoices) {
    await prisma.invoice.create({
      data: {
        ...invoice,
        type: invoice.type as any,
        status: invoice.status as any
      }
    })
  }
}

async function seedTasks() {
  const users = await prisma.user.findMany({ where: { role: { in: [UserRole.ADMIN, UserRole.STAFF] } } })
  const customers = await prisma.user.findMany({ where: { role: UserRole.CUSTOMER } })
  
  const tasks = [
    {
      title: 'متابعة العميل أحمد محمد',
      description: 'الاتصال بالعميل للاستفسار عن رضاه عن الخدمة',
      priority: 'MEDIUM',
      status: 'PENDING',
      assignedTo: users[0]?.id,
      assignedBy: users[1]?.id,
      customerId: customers[0]?.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 1
    },
    {
      title: 'تحديث أسعار السيارات',
      description: 'تحديث أسعار السيارات الجديدة في النظام',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: users[1]?.id,
      assignedBy: users[0]?.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedHours: 4,
      actualHours: 2
    },
    {
      title: 'صيانة نظام التكييف',
      description: 'صيانة دورية لنظام التكييف في الفرع',
      priority: 'LOW',
      status: 'COMPLETED',
      assignedTo: users[0]?.id,
      assignedBy: users[0]?.id,
      completedAt: new Date(),
      estimatedHours: 2,
      actualHours: 2
    }
  ]

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        priority: task.priority as any,
        status: task.status as any
      }
    })
  }
}

async function seedNotifications() {
  const users = await prisma.user.findMany()
  
  const notifications = [
    {
      userId: users[0]?.id,
      type: 'BOOKING_CONFIRMATION',
      title: 'تأكيد الحجز',
      message: 'تم تأكيد حجزك بنجاح لموعد غداً الساعة 10 صباحاً',
      channel: 'EMAIL',
      recipient: users[0]?.email || '',
      status: 'SENT',
      sentAt: new Date()
    },
    {
      userId: users[1]?.id,
      type: 'PROMOTION',
      title: 'عرض خاص',
      message: 'خصم 20% على جميع خدمات الصيانة هذا الأسبوع',
      channel: 'EMAIL',
      recipient: users[1]?.email || '',
      status: 'PENDING'
    },
    {
      type: 'SYSTEM',
      title: 'صيانة النظام',
      message: 'سيتم إجراء صيانة دورية للنظام اليوم الساعة 11 مساءً',
      channel: 'PUSH',
      recipient: 'all_users',
      status: 'SCHEDULED'
    }
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        ...notification,
        type: notification.type as any,
        status: notification.status as any,
        channel: notification.channel as any
      }
    })
  }
}

async function seedCRMData() {
  const users = await prisma.user.findMany()
  const branches = await prisma.branch.findMany()
  
  // Customer Profiles
  for (let i = 0; i < 3; i++) {
    await prisma.customerProfile.create({
      data: {
        userId: users.find(u => u.role === UserRole.CUSTOMER)?.id,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        nationality: 'مصري',
        address: 'العنوان التجريبي',
        city: 'القاهرة',
        country: 'مصر',
        postalCode: '12345',
        preferredLanguage: 'AR',
        interests: ['سيارات', 'تكنولوجيا'],
        preferences: { notifications: true, newsletters: false }
      }
    })
  }

  // CRM Interactions
  const interactions = [
    {
      userId: users.find(u => u.role === UserRole.CUSTOMER)?.id,
      type: 'PHONE_CALL',
      direction: 'INBOUND',
      subject: 'استفسار عن السيارات',
      notes: 'العميل يستفسر عن سيارات تويوتا المتوفرة',
      duration: 15,
      outcome: 'INTERESTED'
    },
    {
      userId: users.find(u => u.role === UserRole.CUSTOMER)?.id,
      type: 'EMAIL',
      direction: 'OUTBOUND',
      subject: 'متابعة الطلب',
      notes: 'إرسال قائمة بالسيارات المتوفرة والأسعار',
      outcome: 'AWAITING_RESPONSE'
    }
  ]

  for (const interaction of interactions) {
    await prisma.cRMInteraction.create({
      data: {
        ...interaction,
        type: interaction.type as any,
        direction: interaction.direction as any
      }
    })
  }

  // Customer Feedback
  await prisma.customerFeedback.create({
    data: {
      userId: users.find(u => u.role === UserRole.CUSTOMER)?.id,
      type: 'SERVICE',
      rating: 5,
      comment: 'خدمة ممتازة وموظفين محترفين',
      category: 'SERVICE_QUALITY',
      status: 'PUBLISHED'
    }
  })
}

async function seedMarketingData() {
  const users = await prisma.user.findMany()
  const branches = await prisma.branch.findMany()
  
  // Marketing Campaigns
  const campaigns = [
    {
      name: 'حملة العيد',
      description: 'عرض خاص بمناسبة العيد',
      type: 'PROMOTION',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 10000,
      targetAudience: 'ALL_CUSTOMERS',
      createdBy: users.find(u => u.role === UserRole.ADMIN)?.id,
      branchId: branches[0]?.id
    },
    {
      name: 'حملة الصيانة',
      description: 'تخفيضات على خدمات الصيانة',
      type: 'SERVICE',
      status: 'SCHEDULED',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      budget: 5000,
      targetAudience: 'EXISTING_CUSTOMERS',
      createdBy: users.find(u => u.role === UserRole.ADMIN)?.id,
      branchId: branches[0]?.id
    }
  ]

  for (const campaign of campaigns) {
    await prisma.marketingCampaign.create({
      data: {
        ...campaign,
        type: campaign.type as any,
        status: campaign.status as any
      }
    })
  }

  // Leads
  await prisma.lead.create({
    data: {
      name: 'خالد علي',
      email: 'khaled@example.com',
      phone: '+201012345679',
      source: 'WEBSITE',
      status: 'NEW',
      priority: 'HIGH',
      assignedTo: users.find(u => u.role === UserRole.STAFF)?.id,
      assignedBy: users.find(u => u.role === UserRole.ADMIN)?.id,
      branchId: branches[0]?.id,
      notes: 'مهتم جداً بشراء سيارة جديدة'
    }
  })
}

async function seedSupportData() {
  const users = await prisma.user.findMany()
  const branches = await prisma.branch.findMany()
  
  // Support Tickets
  const tickets = [
    {
      customerId: users.find(u => u.role === UserRole.CUSTOMER)?.id,
      subject: 'مشكلة في نظام الحجز',
      description: 'لا يمكنني إتمام عملية الحجز عبر الموقع',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: users.find(u => u.role === UserRole.STAFF)?.id,
      assignedBy: users.find(u => u.role === UserRole.ADMIN)?.id,
      branchId: branches[0]?.id
    },
    {
      customerId: users.find(u => u.role === UserRole.CUSTOMER)?.id,
      subject: 'استفسار عن الضمان',
      description: 'ما هي تفاصيل الضمان على السيارات الجديدة؟',
      category: 'INQUIRY',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedTo: users.find(u => u.role === UserRole.STAFF)?.id,
      assignedBy: users.find(u => u.role === UserRole.ADMIN)?.id,
      branchId: branches[0]?.id,
      resolvedAt: new Date(),
      resolvedBy: users.find(u => u.role === UserRole.STAFF)?.id
    }
  ]

  for (const ticket of tickets) {
    await prisma.supportTicket.create({
      data: {
        ...ticket,
        category: ticket.category as any,
        priority: ticket.priority as any,
        status: ticket.status as any
      }
    })
  }

  // Ticket Comments
  const createdTickets = await prisma.supportTicket.findMany()
  for (const ticket of createdTickets) {
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        userId: users.find(u => u.role === UserRole.STAFF)?.id,
        comment: 'تم استلام التذكرة وجاري المعالجة',
        isInternal: false
      }
    })
  }
}

async function seedKnowledgeBase() {
  const users = await prisma.user.findMany()
  
  const articles = [
    {
      title: 'كيفية حجز موعد صيانة',
      content: 'خطوات حجز موعد الصيانة:\n1. تسجيل الدخول\n2. اختيار الخدمة\n3. تحديد الموعد\n4. تأكيد الحجز',
      category: 'BOOKING',
      tags: ['حجز', 'صيانة', 'موعد'],
      status: 'PUBLISHED',
      authorId: users.find(u => u.role === UserRole.ADMIN)?.id,
      reviewerId: users.find(u => u.role === UserRole.ADMIN)?.id,
      views: 150,
      helpful: 25
    },
    {
      title: 'أنواع الضمان المتوفرة',
      content: 'نقدم أنواع مختلفة من الضمان:\n1. الضمان الأساسي\n2. الضمان الممتد\n3. ضمان محرك القوة',
      category: 'WARRANTY',
      tags: ['ضمان', 'حماية', 'تغطية'],
      status: 'PUBLISHED',
      authorId: users.find(u => u.role === UserRole.ADMIN)?.id,
      reviewerId: users.find(u => u.role === UserRole.ADMIN)?.id,
      views: 200,
      helpful: 40
    }
  ]

  for (const article of articles) {
    await prisma.knowledgeBaseArticle.create({
      data: {
        ...article,
        status: article.status as any
      }
    })
  }
}

async function seedPerformanceData() {
  const users = await prisma.user.findMany()
  const branches = await prisma.branch.findMany()
  
  // Performance Metrics
  const metrics = [
    {
      userId: users.find(u => u.role === UserRole.STAFF)?.id,
      metricType: 'BOOKINGS_COMPLETED',
      value: 25,
      period: 'MONTHLY',
      recordedAt: new Date(),
      branchId: branches[0]?.id
    },
    {
      userId: users.find(u => u.role === UserRole.STAFF)?.id,
      metricType: 'CUSTOMER_SATISFACTION',
      value: 4.8,
      period: 'MONTHLY',
      recordedAt: new Date(),
      branchId: branches[0]?.id
    },
    {
      userId: users.find(u => u.role === UserRole.BRANCH_MANAGER)?.id,
      metricType: 'REVENUE_GENERATED',
      value: 150000,
      period: 'MONTHLY',
      recordedAt: new Date(),
      branchId: branches[0]?.id
    }
  ]

  for (const metric of metrics) {
    await prisma.performanceMetric.create({
      data: {
        ...metric,
        period: metric.period as any
      }
    })
  }

  // Customer Service Metrics
  await prisma.customerServiceMetric.create({
    data: {
      branchId: branches[0]?.id,
      avgResponseTime: 15,
      customerSatisfactionScore: 4.7,
      ticketsResolved: 45,
      ticketsPending: 3,
      period: 'MONTHLY',
      recordedAt: new Date()
    }
  })
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Comprehensive seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

export default seedDatabase