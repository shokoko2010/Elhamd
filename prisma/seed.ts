import { PrismaClient, VehicleStatus, UserRole, BookingStatus, PaymentStatus, VehicleCategory, FuelType, TransmissionType, VehicleSpecCategory, ServiceCategory, LogSeverity, PermissionCategory, CustomerSegment } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting comprehensive database seeding for Elhamd Import...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  
  // Delete in reverse order to handle foreign key constraints
  try {
    await prisma.vehicleImage.deleteMany()
    await prisma.vehicleSpecification.deleteMany()
    await prisma.vehiclePricing.deleteMany()
    await prisma.vehicle.deleteMany()
    await prisma.testDriveBooking.deleteMany()
    await prisma.serviceBooking.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.userPermission.deleteMany()
    await prisma.roleTemplatePermission.deleteMany()
    await prisma.user.deleteMany()
    await prisma.roleTemplate.deleteMany()
    await prisma.permission.deleteMany()
    await prisma.branch.deleteMany()
    await prisma.serviceType.deleteMany()
    await prisma.slider.deleteMany()
    await prisma.timelineEvent.deleteMany()
    await prisma.companyValue.deleteMany()
    await prisma.companyStat.deleteMany()
    await prisma.serviceItem.deleteMany()
    await prisma.contactInfo.deleteMany()
    await prisma.companyInfo.deleteMany()
    await prisma.siteSettings.deleteMany()
    await prisma.securityLog.deleteMany()
    console.log('✅ All data cleaned successfully')
  } catch (error) {
    console.log(`⚠️  Cleaning error: ${error}`)
  }

  // 1. Create Core System Data
  console.log('🔧 Creating core system data...')

  // Site Settings
  const siteSettings = await prisma.siteSettings.create({
    data: {
      siteTitle: 'شركة الحمد لاستيراد السيارات',
      siteDescription: 'الوكيل الحصري لشركة تاتا موتورز في مصر - السيارات التجارية والبيك أب والشاحنات',
      contactEmail: 'info@elhamdimport.online',
      contactPhone: '+20 2 12345678',
      contactAddress: 'القنطرة غرب، الجيزة، مصر',
      socialLinks: {
        facebook: 'https://facebook.com/elhamdimport',
        twitter: 'https://twitter.com/elhamdimport',
        instagram: 'https://instagram.com/elhamdimport',
        linkedin: 'https://linkedin.com/company/elhamdimport'
      },
      workingHours: 'السبت - الخميس: 9:00 ص - 5:00 م، الجمعة: مغلق'
    }
  })

  // Company Info
  const companyInfo = await prisma.companyInfo.create({
    data: {
      title: 'شركة الحمد لاستيراد السيارات',
      subtitle: 'الوكيل الحصري لشركة تاتا موتورز في مصر',
      description: 'الوكيل الحصري لشركة تاتا موتورز في مصر، متخصصة في السيارات التجارية والبيك أب والشاحنات فقط',
      features: ['الجودة', 'الموثوقية', 'خدمة العملاء', 'الابتكار'],
      ctaButtons: [
        {
          text: 'استعرض السيارات',
          link: '/vehicles',
          variant: 'primary'
        },
        {
          text: 'قيادة تجريبية',
          link: '/test-drive',
          variant: 'secondary'
        }
      ]
    }
  })

  // Company Stats
  await prisma.companyStat.createMany({
    data: [
      { label: 'عملاء سعداء', number: '5000+', icon: 'users' },
      { label: 'مركبة مباعة', number: '10000+', icon: 'truck' },
      { label: 'سنوات خبرة', number: '14+', icon: 'award' },
      { label: 'فرع', number: '1', icon: 'map-pin' }
    ]
  })

  // Company Values
  await prisma.companyValue.createMany({
    data: [
      {
        title: 'الجودة',
        description: 'نقدم منتجات وخدمات عالية الجودة تلبي أعلى المعايير',
        icon: 'shield'
      },
      {
        title: 'الموثوقية',
        description: 'نضمن موثوقية عالية في جميع منتجاتنا وخدماتنا',
        icon: 'check-circle'
      },
      {
        title: 'خدمة العملاء',
        description: 'نقدم خدمة عملاء ممتازة على مدار الساعة',
        icon: 'headphones'
      },
      {
        title: 'الابتكار',
        description: 'نسعى دائماً للابتكار وتطوير حلول جديدة',
        icon: 'lightbulb'
      }
    ]
  })

  // Service Items
  await prisma.serviceItem.createMany({
    data: [
      {
        title: 'صيانة دورية',
        description: 'صيانة دورية شاملة للشاحنات والمركبات التجارية',
        icon: 'wrench'
      },
      {
        title: 'قطع غيار أصلية',
        description: 'توفير قطع غيار أصلية من تاتا موتورز',
        icon: 'package'
      },
      {
        title: 'خدمة 24 ساعة',
        description: 'خدمة طوارئ على مدار الساعة طوال أيام الأسبوع',
        icon: 'clock'
      },
      {
        title: 'التأجير',
        description: 'تأجير شاحنات ومركبات تجارية للشركات والأفراد',
        icon: 'truck'
      }
    ]
  })

  // Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      {
        year: '2010',
        title: 'تأسيس الشركة',
        description: 'تأسست شركة الحمد لاستيراد السيارات كوكيل لـ تاتا موتورز'
      },
      {
        year: '2015',
        title: 'توسع الخدمات',
        description: 'إضافة خدمات الصيانة وقطع الغيار'
      },
      {
        year: '2020',
        title: 'التحول الرقمي',
        description: 'إطلاق النظام الإلكتروني لإدارة المبيعات والخدمات'
      },
      {
        year: '2024',
        title: 'التطوير المستمر',
        description: 'تحديث النظام وتوسيع قاعدة العملاء'
      }
    ]
  })

  // Contact Info
  await prisma.contactInfo.create({
    data: {
      primaryPhone: '+20 2 12345678',
      secondaryPhone: '+20 1012345678',
      primaryEmail: 'info@elhamdimport.online',
      address: 'القنطرة غرب، الجيزة، مصر',
      workingHours: {
        Saturday: '9:00-17:00',
        Sunday: '9:00-17:00',
        Monday: '9:00-17:00',
        Tuesday: '9:00-17:00',
        Wednesday: '9:00-17:00',
        Thursday: '9:00-17:00',
        Friday: 'مغلق'
      }
    }
  })

  // 2. Create Permissions
  console.log('🔐 Creating permissions...')
  const permissions = [
    // Vehicle Management
    { name: 'vehicles.view', description: 'عرض المركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.create', description: 'إنشاء مركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.edit', description: 'تعديل المركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'vehicles.delete', description: 'حذف المركبات', category: 'VEHICLE_MANAGEMENT' },
    
    // Booking Management
    { name: 'bookings.view', description: 'عرض الحجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.create', description: 'إنشاء حجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.edit', description: 'تعديل الحجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'bookings.delete', description: 'حذف الحجوزات', category: 'BOOKING_MANAGEMENT' },
    
    // User Management
    { name: 'users.view', description: 'عرض المستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'users.create', description: 'إنشاء مستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'users.edit', description: 'تعديل المستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'users.delete', description: 'حذف المستخدمين', category: 'USER_MANAGEMENT' },
    
    // Branch Management
    { name: 'branches.view', description: 'عرض الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'branches.create', description: 'إنشاء فروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'branches.edit', description: 'تعديل الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'branches.delete', description: 'حذف الفروع', category: 'BRANCH_MANAGEMENT' },
    
    // Inventory Management
    { name: 'inventory.view', description: 'عرض المخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'inventory.create', description: 'إنشاء أصناف مخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'inventory.edit', description: 'تعديل المخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'inventory.delete', description: 'حذف المخزون', category: 'INVENTORY_MANAGEMENT' },
    
    // Financial Management
    { name: 'financial.view', description: 'عرض التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.create', description: 'إنشاء تقارير مالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.edit', description: 'تعديل التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.delete', description: 'حذف التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    
    // Customer Management
    { name: 'crm.view', description: 'عرض علاقات العملاء', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'crm.create', description: 'إنشاء سجلات CRM', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'crm.edit', description: 'تعديل سجلات CRM', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'crm.delete', description: 'حذف سجلات CRM', category: 'CUSTOMER_MANAGEMENT' },
    
    // System Settings
    { name: 'admin.dashboard', description: 'لوحة التحكم', category: 'SYSTEM_SETTINGS' },
    { name: 'admin.settings', description: 'الإعدادات', category: 'SYSTEM_SETTINGS' },
    { name: 'admin.reports', description: 'التقارير', category: 'REPORTING' },
    { name: 'admin.logs', description: 'سجلات النظام', category: 'SYSTEM_SETTINGS' }
  ]

  const createdPermissions = await Promise.all(
    permissions.map(permission => 
      prisma.permission.create({ data: permission })
    )
  )

  // 3. Create Role Templates
  console.log('👥 Creating role templates...')
  const roleTemplates = [
    {
      name: 'Super Admin',
      description: 'المدير العام',
      role: 'SUPER_ADMIN',
      permissions: createdPermissions.map(p => p.name),
      isSystem: true
    },
    {
      name: 'Admin',
      description: 'مدير',
      role: 'ADMIN',
      permissions: createdPermissions.filter(p => !p.name.includes('delete')).map(p => p.name),
      isSystem: true
    },
    {
      name: 'Branch Manager',
      description: 'مدير فرع',
      role: 'BRANCH_MANAGER',
      permissions: [
        'vehicles.view', 'vehicles.create', 'vehicles.edit',
        'bookings.view', 'bookings.create', 'bookings.edit',
        'users.view', 'users.create', 'users.edit',
        'inventory.view', 'inventory.create', 'inventory.edit',
        'financial.view', 'crm.view', 'crm.create', 'crm.edit',
        'admin.dashboard', 'admin.reports'
      ],
      isSystem: true
    },
    {
      name: 'Sales Manager',
      description: 'مدير مبيعات',
      role: 'STAFF',
      permissions: [
        'vehicles.view', 'bookings.view', 'bookings.create', 'bookings.edit',
        'users.view', 'crm.view', 'crm.create', 'crm.edit',
        'admin.dashboard', 'admin.reports'
      ],
      isSystem: true
    },
    {
      name: 'Service Manager',
      description: 'مدير خدمة',
      role: 'STAFF',
      permissions: [
        'vehicles.view', 'bookings.view', 'bookings.create', 'bookings.edit',
        'inventory.view', 'inventory.create', 'inventory.edit',
        'admin.dashboard', 'admin.reports'
      ],
      isSystem: true
    },
    {
      name: 'Sales Employee',
      description: 'موظف مبيعات',
      role: 'STAFF',
      permissions: [
        'vehicles.view', 'bookings.view', 'bookings.create', 'bookings.edit',
        'crm.view', 'crm.create', 'crm.edit'
      ],
      isSystem: true
    },
    {
      name: 'Service Employee',
      description: 'موظف خدمة',
      role: 'STAFF',
      permissions: [
        'vehicles.view', 'bookings.view', 'bookings.create', 'bookings.edit',
        'inventory.view'
      ],
      isSystem: true
    },
    {
      name: 'Customer',
      description: 'عميل',
      role: 'CUSTOMER',
      permissions: ['vehicles.view', 'bookings.view', 'bookings.create'],
      isSystem: true
    }
  ]

  const createdRoles = await Promise.all(
    roleTemplates.map(role => 
      prisma.roleTemplate.create({ data: role })
    )
  )

  // 4. Create Main Branch
  console.log('🏢 Creating main branch...')
  const mainBranch = await prisma.branch.create({
    data: {
      name: 'الفرع الرئيسي - القنطرة غرب',
      code: 'ELHAMD-MAIN',
      address: 'القنطرة غرب، الجيزة، مصر',
      phone: '+20 2 12345678',
      email: 'info@elhamdimport.online',
      isActive: true,
      openingDate: new Date('2010-01-01'),
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      settings: {
        workingHours: {
          Saturday: '9:00-17:00',
          Sunday: '9:00-17:00',
          Monday: '9:00-17:00',
          Tuesday: '9:00-17:00',
          Wednesday: '9:00-17:00',
          Thursday: '9:00-17:00',
          Friday: 'مغلق'
        },
        services: ['صيانة', 'قطع غيار', 'تأجير', 'بيع سيارات', 'خدمة 24 ساعة'],
        coordinates: { lat: 30.0131, lng: 31.2089 }
      }
    }
  })

  // 5. Create Users
  console.log('👤 Creating users...')
  const superAdminRole = createdRoles.find(r => r.name === 'Super Admin')!
  const adminRole = createdRoles.find(r => r.name === 'Admin')!
  const branchManagerRole = createdRoles.find(r => r.name === 'Branch Manager')!
  const salesManagerRole = createdRoles.find(r => r.name === 'Sales Manager')!
  const serviceManagerRole = createdRoles.find(r => r.name === 'Service Manager')!
  const salesEmployeeRole = createdRoles.find(r => r.name === 'Sales Employee')!
  const serviceEmployeeRole = createdRoles.find(r => r.name === 'Service Employee')!
  const customerRole = createdRoles.find(r => r.name === 'Customer')!

  const users = [
    {
      email: 'admin@elhamdimport.online',
      name: 'مدير النظام',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN' as any,
      phone: '+20 1012345678',
      isActive: true,
      emailVerified: true,
      roleTemplateId: superAdminRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'manager@elhamdimport.online',
      name: 'مدير الفرع',
      password: await bcrypt.hash('manager123', 10),
      role: 'BRANCH_MANAGER' as any,
      phone: '+20 1023456789',
      isActive: true,
      emailVerified: true,
      roleTemplateId: branchManagerRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'sales.manager@elhamdimport.online',
      name: 'مدير المبيعات',
      password: await bcrypt.hash('salesmanager123', 10),
      role: 'STAFF' as any,
      phone: '+20 1034567890',
      isActive: true,
      emailVerified: true,
      roleTemplateId: salesManagerRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'service.manager@elhamdimport.online',
      name: 'مدير الخدمة',
      password: await bcrypt.hash('servicemanager123', 10),
      role: 'STAFF' as any,
      phone: '+20 1045678901',
      isActive: true,
      emailVerified: true,
      roleTemplateId: serviceManagerRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'sales1@elhamdimport.online',
      name: 'موظف مبيعات 1',
      password: await bcrypt.hash('sales123', 10),
      role: 'STAFF' as any,
      phone: '+20 1056789012',
      isActive: true,
      emailVerified: true,
      roleTemplateId: salesEmployeeRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'sales2@elhamdimport.online',
      name: 'موظف مبيعات 2',
      password: await bcrypt.hash('sales123', 10),
      role: 'STAFF' as any,
      phone: '+20 1067890123',
      isActive: true,
      emailVerified: true,
      roleTemplateId: salesEmployeeRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'service1@elhamdimport.online',
      name: 'موظف خدمة 1',
      password: await bcrypt.hash('service123', 10),
      role: 'STAFF' as any,
      phone: '+20 1078901234',
      isActive: true,
      emailVerified: true,
      roleTemplateId: serviceEmployeeRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'customer@example.com',
      name: 'عميل تجريبي',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER' as any,
      phone: '+20 1089012345',
      isActive: true,
      emailVerified: true,
      roleTemplateId: customerRole.id,
      branchId: mainBranch.id
    }
  ]

  const createdUsers = await Promise.all(
    users.map(user => prisma.user.create({ data: user }))
  )

  // 6. Create Service Types
  console.log('🔧 Creating service types...')
  const serviceTypes = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية شاملة للمركبات',
      duration: 120,
      price: 500,
      category: 'MAINTENANCE'
    },
    {
      name: 'تغيير زيت',
      description: 'تغيير زيت المحرك والفلاتر',
      duration: 60,
      price: 200,
      category: 'MAINTENANCE'
    },
    {
      name: 'فحص شامل',
      description: 'فحص شامل للمركبة قبل الشراء',
      duration: 90,
      price: 300,
      category: 'INSPECTION'
    },
    {
      name: 'تصليح مكابح',
      description: 'صيانة وإصلاح نظام المكابح',
      duration: 180,
      price: 800,
      category: 'REPAIR'
    },
    {
      name: 'تغيير إطارات',
      description: 'تغيير وترصيص الإطارات',
      duration: 90,
      price: 400,
      category: 'MAINTENANCE'
    }
  ]

  await prisma.serviceType.createMany({
    data: serviceTypes
  })

  // 7. Create Tata Vehicles with Images
  console.log('🚗 Creating Tata vehicles...')
  const vehicles = [
    {
      make: 'Tata',
      model: 'PRIMA 3328.K',
      year: 2024,
      price: 1500000,
      stockNumber: 'TAT-001',
      vin: 'TATPRIMA3328K2024001',
      description: 'شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أبيض',
      status: VehicleStatus.AVAILABLE,
      featured: true,
      branchId: mainBranch.id,
      images: [
        { imageUrl: '/uploads/vehicles/prima-3328k-1.jpg', isPrimary: true, order: 0 },
        { imageUrl: '/uploads/vehicles/prima-3328k-2.jpg', isPrimary: false, order: 1 }
      ],
      specifications: [
        { key: 'engine_power', label: 'قوة المحرك', value: '280 حصان', category: 'ENGINE' },
        { key: 'payload', label: 'سعة التحميل', value: '32 طن', category: 'ENGINE' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '400 لتر', category: 'ENGINE' },
        { key: 'dimensions', label: 'الأبعاد', value: '9.5 × 2.5 × 3.2 متر', category: 'EXTERIOR' }
      ],
      pricing: {
        basePrice: 1500000,
        totalPrice: 1650000,
        taxes: 150000,
        currency: 'EGP'
      }
    },
    {
      make: 'Tata',
      model: 'LP 613',
      year: 2024,
      price: 850000,
      stockNumber: 'TAT-002',
      vin: 'TATLP6132024002',
      description: 'حافلة مصممة لتناسب تنقلات الموظفين والمدارس والرحلات داخل المدينة.',
      category: 'VAN',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أصفر',
      status: VehicleStatus.AVAILABLE,
      featured: true,
      branchId: mainBranch.id,
      images: [
        { imageUrl: '/uploads/vehicles/lp-613-2.jpg', isPrimary: true, order: 0 },
        { imageUrl: '/uploads/vehicles/LP-613-1.jpg', isPrimary: false, order: 1 }
      ],
        specifications: [
        { key: 'seating_capacity', label: 'سعة الركاب', value: '30 راكب', category: 'INTERIOR' },
        { key: 'engine_power', label: 'قوة المحرك', value: '150 حصان', category: 'ENGINE' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '120 لتر', category: 'ENGINE' },
        { key: 'dimensions', label: 'الأبعاد', value: '7.5 × 2.2 × 3.0 متر', category: 'EXTERIOR' }
      ],
      pricing: {
        basePrice: 850000,
        totalPrice: 935000,
        taxes: 85000,
        currency: 'EGP'
      }
    },
    {
      make: 'Tata',
      model: 'LPT 1618',
      year: 2024,
      price: 650000,
      stockNumber: 'TAT-003',
      vin: 'TATLPT16182024003',
      description: 'مركبة تجارية قوية ومتعددة الاستخدامات مصممة لإعادة تعريف الأداء والموثوقية.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أزرق',
      status: VehicleStatus.AVAILABLE,
      featured: true,
      branchId: mainBranch.id,
      images: [
        { imageUrl: '/uploads/vehicles/LPT-1618-1.jpg', isPrimary: true, order: 0 },
        { imageUrl: '/uploads/vehicles/LPT-613-1.jpg', isPrimary: false, order: 1 }
      ],
      specifications: [
        { key: 'payload', label: 'سعة التحميل', value: '10 طن', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: '180 حصان', category: 'ENGINE' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '200 لتر', category: 'ENGINE' },
        { key: 'dimensions', label: 'الأبعاد', value: '6.8 × 2.4 × 2.8 متر', category: 'EXTERIOR' }
      ],
      pricing: {
        basePrice: 650000,
        totalPrice: 715000,
        taxes: 65000,
        currency: 'EGP'
      }
    },
    {
      make: 'Tata',
      model: 'ULTRA T.7',
      year: 2024,
      price: 450000,
      stockNumber: 'TAT-004',
      vin: 'TATULTRAT72024004',
      description: 'شاحنة خفيفة مثالية للخدمات اللوجستية والنقل داخل المدن.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'رمادي',
      status: VehicleStatus.AVAILABLE,
      featured: false,
      branchId: mainBranch.id,
      images: [
        { imageUrl: '/uploads/vehicles/ultra-t7-1.jpg', isPrimary: true, order: 0 }
      ],
      specifications: [
        { key: 'payload', label: 'سعة التحميل', value: '7 طن', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: '140 حصان', category: 'ENGINE' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '150 لتر', category: 'ENGINE' },
        { key: 'dimensions', label: 'الأبعاد', value: '5.5 × 2.2 × 2.5 متر', category: 'EXTERIOR' }
      ],
      pricing: {
        basePrice: 450000,
        totalPrice: 495000,
        taxes: 45000,
        currency: 'EGP'
      }
    },
    {
      make: 'Tata',
      model: 'XENON SC',
      year: 2024,
      price: 380000,
      stockNumber: 'TAT-005',
      vin: 'TATXENONSC2024005',
      description: 'بيك أب يجمع بين القوة والمتانة، يوفر أداءً معززًا ويساهم في زيادة الأرباح.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أسود',
      status: VehicleStatus.AVAILABLE,
      featured: false,
      branchId: mainBranch.id,
      images: [
        { imageUrl: '/uploads/vehicles/xenon-sc-2.jpg', isPrimary: true, order: 0 }
      ],
      specifications: [
        { key: 'payload', label: 'سعة التحميل', value: '1.2 طن', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: '150 حصان', category: 'ENGINE' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '80 لتر', category: 'ENGINE' },
        { key: 'dimensions', label: 'الأبعاد', value: '5.2 × 1.8 × 1.9 متر', category: 'EXTERIOR' }
      ],
      pricing: {
        basePrice: 380000,
        totalPrice: 418000,
        taxes: 38000,
        currency: 'EGP'
      }
    },
    {
      make: 'Tata',
      model: 'LPT 613',
      year: 2024,
      price: 420000,
      stockNumber: 'TAT-006',
      vin: 'TATLPT6132024006',
      description: 'شاحنة صندوق قلاب استثنائية مصممة لتعزيز قدراتك في النقل.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أحمر',
      status: VehicleStatus.AVAILABLE,
      featured: false,
      branchId: mainBranch.id,
      images: [
        { imageUrl: '/uploads/vehicles/lpt613-tipper-1.jpg', isPrimary: true, order: 0 }
      ],
      specifications: [
        { key: 'payload', label: 'سعة التحميل', value: '6 طن', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: '130 حصان', category: 'ENGINE' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '120 لتر', category: 'ENGINE' },
        { key: 'dimensions', label: 'الأبعاد', value: '5.8 × 2.2 × 2.4 متر', category: 'EXTERIOR' }
      ],
      pricing: {
        basePrice: 420000,
        totalPrice: 462000,
        taxes: 42000,
        currency: 'EGP'
      }
    }
  ]

  const createdVehicles = await Promise.all(
    vehicles.map(async (vehicle) => {
      // Create vehicle
      const createdVehicle = await prisma.vehicle.create({
        data: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          stockNumber: vehicle.stockNumber,
          vin: vehicle.vin,
          description: vehicle.description,
          category: vehicle.category as any,
          fuelType: vehicle.fuelType as any,
          transmission: vehicle.transmission as any,
          mileage: vehicle.mileage,
          color: vehicle.color,
          status: vehicle.status,
          featured: vehicle.featured,
          branchId: vehicle.branchId
        }
      })

      // Create vehicle images
      if (vehicle.images && vehicle.images.length > 0) {
        await prisma.vehicleImage.createMany({
          data: vehicle.images.map(img => ({
            vehicleId: createdVehicle.id,
            imageUrl: img.imageUrl,
            altText: `${vehicle.make} ${vehicle.model}`,
            isPrimary: img.isPrimary,
            order: img.order
          }))
        })
      }

      // Create vehicle specifications
      if (vehicle.specifications && vehicle.specifications.length > 0) {
        await prisma.vehicleSpecification.createMany({
          data: vehicle.specifications.map(spec => ({
            vehicleId: createdVehicle.id,
            key: spec.key,
            label: spec.label,
            value: spec.value,
            category: spec.category as any
          }))
        })
      }

      // Create vehicle pricing
      if (vehicle.pricing) {
        await prisma.vehiclePricing.create({
          data: {
            vehicleId: createdVehicle.id,
            basePrice: vehicle.pricing.basePrice,
            totalPrice: vehicle.pricing.totalPrice,
            taxes: vehicle.pricing.taxes,
            currency: vehicle.pricing.currency
          }
        })
      }

      return createdVehicle
    })
  )

  // 8. Create Sliders
  console.log('🎠 Creating sliders...')
  const sliders = [
    {
      title: 'شاحنة تاتا PRIMA 3328.K',
      subtitle: 'القوة والموثوقية في مكان واحد',
      description: 'شاحنة ثقيلة صُممت للتعامل مع أصعب المهام مع كفاءة استهلاك وقود ممتازة',
      imageUrl: '/uploads/banners/showroom-banner.jpg',
      ctaText: 'اطلب الآن',
      ctaLink: '/vehicles',
      badge: 'جديد',
      badgeColor: 'bg-green-500',
      isActive: true,
      order: 0
    },
    {
      title: 'حافلة تاتا LP 613',
      subtitle: 'الراحة والأمان للركاب',
      description: 'حافلة عائلية مثالية للرحلات الطويلة مع تصميم داخلي فسيح',
      imageUrl: '/uploads/banners/service-banner.jpg',
      ctaText: 'احجز جولة',
      ctaLink: '/test-drive',
      badge: 'مميز',
      badgeColor: 'bg-blue-500',
      isActive: true,
      order: 1
    },
    {
      title: 'بيك أب تاتا XENON SC',
      subtitle: 'قوة للمهام الصعبة',
      description: 'بيك أب متين يجمع بين القوة والكفاءة لتناسب جميع الاستخدامات',
      imageUrl: '/uploads/banners/adventure-banner.jpg',
      ctaText: 'اكتشف المزيد',
      ctaLink: '/vehicles',
      badge: 'أقوى',
      badgeColor: 'bg-red-500',
      isActive: true,
      order: 2
    }
  ]

  await prisma.slider.createMany({
    data: sliders
  })

  console.log('✅ Database seeding completed successfully!')
  console.log(`📊 Created ${createdVehicles.length} vehicles`)
  console.log(`👥 Created ${createdUsers.length} users`)
  console.log(`🏢 Created 1 branch`)
  console.log(`🔐 Created ${createdPermissions.length} permissions`)
  console.log(`👥 Created ${createdRoles.length} role templates`)
  console.log(`🎠 Created ${sliders.length} sliders`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })