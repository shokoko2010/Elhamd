import { PrismaClient, VehicleStatus, UserRole, BookingStatus, PaymentStatus, VehicleCategory, FuelType, TransmissionType, VehicleSpecCategory, ServiceCategory, LogSeverity, PermissionCategory, CustomerSegment, InvoiceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting comprehensive database seeding for Elhamd Import...')

  // Clean existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Cleaning existing data...')
  
  const models = [
    // Financial and transaction data (most dependent)
    'invoicePayment', 'invoiceTax', 'invoiceItem', 'quotationItem', 'orderPayment', 'orderItem',
    'transaction', 'journalEntryItem', 'journalEntry', 'taxRecord', 'payrollRecord', 'leaveRequest',
    
    // Media and content
    'vehicleImage', 'vehicleSpecification', 'vehiclePricing', 'media', 'popupConfig',
    
    // Bookings and services
    'testDriveBooking', 'serviceBooking', 'booking', 'payment', 'timeSlot', 'holiday',
    
    // Customer and CRM
    'customerInteraction', 'customerProfile', 'crmInteraction', 'opportunity', 'leadActivity',
    'lead', 'campaignMember', 'campaign', 'salesFunnel', 'salesTarget', 'customerFeedback',
    'supportTicket', 'ticketComment', 'ticketTimeline', 'serviceEvaluation', 'complaint', 'complaintFollowUp',
    
    // Inventory and products
    'maintenancePartToMaintenanceRecord', 'maintenancePart', 'maintenanceRecord', 'maintenanceReminder',
    'maintenanceSchedule', 'warrantyClaim', 'warranty', 'insurancePayment', 'insuranceClaim',
    'insurancePolicy', 'insuranceCompany', 'order', 'product', 'promotionUsage', 'promotion', 'productReview',
    
    // Employee and performance
    'taskComment', 'task', 'performanceMetric', 'performanceReview', 'trainingRecord', 'employee',
    
    // Vehicles
    'vehicle',
    
    // User and permissions
    'userPermission', 'roleTemplatePermission', 'user',
    
    // Core entities
    'roleTemplate', 'permission', 'branch', 'serviceType', 'slider', 'timelineEvent',
    'companyValue', 'companyStat', 'companyFeature', 'serviceItem', 'contactInfo', 'companyInfo',
    'siteSettings', 'footerSocial', 'footerColumn', 'footerContent', 'headerSocial', 'headerNavigation',
    'headerContent', 'pageSEO', 'notification', 'emailTemplate', 'calendarEvent', 'activityLog',
    'chartOfAccount', 'branchPermission', 'branchTransfer', 'branchBudget', 'customerTagAssignment',
    'marketingAutomation', 'customerLifecycle', 'knowledgeBaseRating', 'knowledgeBaseArticle',
    'knowledgeBaseCategory', 'customerServiceMetric', 'marketingMetric', 'marketingCampaign',
    'leadCommunication', 'customerJourney', 'quotation', 'invoice', 'purchaseOrderItem',
    'purchaseOrder', 'taxRate', 'paymentGatewayConfig', 'financialReport', 'commerceSettings',
    'contract', 'inventoryItem', 'warehouse', 'supplier', 'stockAlert', 'contactSubmission',
    'serviceBookingSubmission', 'testDriveSubmission', 'consultationSubmission', 'ticketArticles',
    'securityLog'
  ]

  for (const model of models) {
    try {
      // @ts-ignore - Dynamic model access
      await prisma[model].deleteMany()
      console.log(`✅ Cleared ${model}`)
    } catch (error) {
      console.log(`⚠️  Error clearing ${model}: ${error}`)
    }
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

  // Company Features
  await prisma.companyFeature.createMany({
    data: [
      {
        title: 'سيارات أصلية',
        description: 'سيارات تاتا أصلية مع ضمان المصنع',
        icon: 'shield-check'
      },
      {
        title: 'صيانة معتمدة',
        description: 'مراكز صيانة معتمدة من تاتا موتورز',
        icon: 'wrench'
      },
      {
        title: 'قطع غيار أصلية',
        description: 'توفير جميع قطع الغيار الأصلية',
        icon: 'package'
      },
      {
        title: 'خدمة 24 ساعة',
        description: 'خدمة طوارئ على مدار الساعة',
        icon: 'clock'
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

  // Header Content
  await prisma.headerContent.create({
    data: {
      logoUrl: '/logo.svg',
      logoText: 'شركة الحمد لاستيراد السيارات',
      tagline: 'الوكيل الحصري لشركة تاتا موتورز في مصر',
      primaryPhone: '+20 2 12345678',
      primaryEmail: 'info@elhamdimport.online',
      address: 'القنطرة غرب، الجيزة، مصر',
      workingHours: 'السبت - الخميس: 9:00 ص - 5:00 م، الجمعة: مغلق',
      ctaButton: [
        { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
        { text: 'تواصل معنا', link: '/contact', variant: 'secondary' }
      ]
    }
  })

  // Header Navigation
  await prisma.headerNavigation.createMany({
    data: [
      { label: 'الرئيسية', href: '/', order: 1 },
      { label: 'السيارات', href: '/vehicles', order: 2 },
      { label: 'الخدمات', href: '/services', order: 3 },
      { label: 'من نحن', href: '/about', order: 4 },
      { label: 'اتصل بنا', href: '/contact', order: 5 }
    ]
  })

  // Header Social
  await prisma.headerSocial.create({
    data: {
      facebook: 'https://facebook.com/elhamdimport',
      twitter: 'https://twitter.com/elhamdimport',
      instagram: 'https://instagram.com/elhamdimport',
      linkedin: 'https://linkedin.com/company/elhamdimport'
    }
  })

  // Footer Content
  await prisma.footerContent.create({
    data: {
      logoText: 'شركة الحمد لاستيراد السيارات',
      tagline: 'الوكيل الحصري لشركة تاتا موتورز في مصر',
      primaryPhone: '+20 2 12345678',
      primaryEmail: 'info@elhamdimport.online',
      address: 'القنطرة غرب، الجيزة، مصر',
      copyrightText: '© 2024 شركة الحمد لاستيراد السيارات. جميع الحقوق محفوظة.'
    }
  })

  // Footer Columns
  await prisma.footerColumn.createMany({
    data: [
      { title: 'روابط سريعة', content: '<ul><li><a href="/">الرئيسية</a></li><li><a href="/vehicles">السيارات</a></li><li><a href="/services">الخدمات</a></li></ul>', order: 1, type: 'LINKS' },
      { title: 'الخدمات', content: '<ul><li><a href="/services">صيانة</a></li><li><a href="/services">قطع غيار</a></li><li><a href="/services">تأجير</a></li></ul>', order: 2, type: 'LINKS' },
      { title: 'تواصل معنا', content: '<p>القنطرة غرب، الجيزة، مصر<br>+20 2 12345678<br>info@elhamdimport.online</p>', order: 3, type: 'CONTACT' },
      { title: 'تابعنا', content: '<div class="social-links"><a href="#">فيسبوك</a> <a href="#">تويتر</a> <a href="#">انستجرام</a></div>', order: 4, type: 'SOCIAL' }
    ]
  })

  // Footer Social
  await prisma.footerSocial.create({
    data: {
      facebook: 'https://facebook.com/elhamdimport',
      twitter: 'https://twitter.com/elhamdimport',
      instagram: 'https://instagram.com/elhamdimport',
      linkedin: 'https://linkedin.com/company/elhamdimport'
    }
  })

  // Contact Info
  const contactInfo = await prisma.contactInfo.create({
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
    
    // Financial Management
    { name: 'financial.view', description: 'عرض التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.create', description: 'إنشاء تقارير مالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.edit', description: 'تعديل التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.delete', description: 'حذف التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'financial.offline.payments', description: 'تسجيل المدفوعات النقدية', category: 'FINANCIAL_MANAGEMENT' },
    
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
      prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      })
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
        'financial.view', 'financial.offline.payments', 'crm.view', 'crm.create', 'crm.edit',
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
        'vehicles.view', 'bookings.view', 'bookings.create', 'bookings.edit'
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
      prisma.roleTemplate.upsert({
        where: { name: role.name },
        update: {},
        create: role
      })
    )
  )

  // 4. Create Main Branch
  console.log('🏢 Creating main branch...')
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'ELHAMD-MAIN' },
    update: {},
    create: {
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
    users.map(user => 
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      })
    )
  )

  // 6. Create Service Types
  console.log('🔧 Creating service types...')
  await prisma.serviceType.createMany({
    data: [
      {
        name: 'صيانة دورية',
        description: 'صيانة دورية شاملة للشاحنات والمركبات التجارية',
        duration: 120,
        price: 500,
        category: 'MAINTENANCE',
        isActive: true
      },
      {
        name: 'تغيير زيت',
        description: 'تغيير زيت المحرك والفلاتر',
        duration: 60,
        price: 200,
        category: 'MAINTENANCE',
        isActive: true
      },
      {
        name: 'فحص شامل',
        description: 'فحص شامل للمركبة قبل الشراء',
        duration: 90,
        price: 300,
        category: 'INSPECTION',
        isActive: true
      }
    ]
  })

  // 7. Create Vehicles
  console.log('🚚 Creating vehicles...')
  const vehicles = [
    {
      make: 'Tata',
      model: 'Nexon EV',
      year: 2024,
      price: 850000,
      stockNumber: 'NXE-2024-001',
      vin: 'MAT67890123456789',
      description: 'سيارة SUV كهربائية عالية الكفاءة',
      category: 'SUV',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id
    },
    {
      make: 'Tata',
      model: 'Punch',
      year: 2024,
      price: 650000,
      stockNumber: 'PUN-2024-001',
      vin: 'MAT67890123456790',
      description: 'سيارة compact SUV عصرية',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أحمر',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id
    },
    {
      make: 'Tata',
      model: 'Tiago EV',
      year: 2024,
      price: 550000,
      stockNumber: 'TIE-2024-001',
      vin: 'MAT67890123456791',
      description: 'سيارة هايتشباك كهربائية عملية',
      category: 'HATCHBACK',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'رمادي',
      status: 'AVAILABLE',
      featured: false,
      branchId: mainBranch.id
    }
  ]

  const createdVehicles = await Promise.all(
    vehicles.map(vehicle => 
      prisma.vehicle.upsert({
        where: { stockNumber: vehicle.stockNumber },
        update: {},
        create: vehicle
      })
    )
  )

  // 8. Create Vehicle Images
  console.log('📷 Creating vehicle images...')
  for (const vehicle of createdVehicles) {
    await prisma.vehicleImage.createMany({
      data: [
        {
          vehicleId: vehicle.id,
          imageUrl: `/uploads/vehicles/${vehicle.stockNumber.toLowerCase()}-front.jpg`,
          altText: `${vehicle.make} ${vehicle.model} - أمامي`,
          isPrimary: true,
          order: 1
        },
        {
          vehicleId: vehicle.id,
          imageUrl: `/uploads/vehicles/${vehicle.stockNumber.toLowerCase()}-side.jpg`,
          altText: `${vehicle.make} ${vehicle.model} - جانبي`,
          isPrimary: false,
          order: 2
        }
      ]
    })
  }

  // 9. Create Vehicle Specifications
  console.log('⚙️ Creating vehicle specifications...')
  for (const vehicle of createdVehicles) {
    const specs = getVehicleSpecs(vehicle.make, vehicle.model)
    await prisma.vehicleSpecification.createMany({
      data: specs.map(spec => ({
        vehicleId: vehicle.id,
        key: spec.key,
        label: spec.label,
        value: spec.value,
        category: spec.category
      }))
    })
  }

  // 10. Create Vehicle Pricing
  console.log('💰 Creating vehicle pricing...')
  for (const vehicle of createdVehicles) {
    await prisma.vehiclePricing.create({
      data: {
        vehicleId: vehicle.id,
        basePrice: vehicle.price,
        taxes: vehicle.price * 0.14, // 14% VAT
        fees: 5000,
        totalPrice: vehicle.price * 1.14 + 5000,
        currency: 'EGP',
        hasDiscount: false
      }
    })
  }

  // 11. Create Sliders
  console.log('🎠 Creating sliders...')
  await prisma.slider.createMany({
    data: [
      {
        title: 'تاتا نيكسون EV',
        subtitle: 'سيارة SUV كهربائية مستقبلية',
        description: 'استمتع بالقيادة الكهربائية مع تاتا نيكسون EV',
        imageUrl: '/slider-nexon.jpg',
        ctaText: 'استعرض الآن',
        ctaLink: '/vehicles/nexon-ev',
        order: 1,
        isActive: true
      },
      {
        title: 'تاتا بنتش',
        subtitle: 'سيارة SUV عصرية عملية',
        description: 'الاختيار المثالي للعائلات المصرية',
        imageUrl: '/slider-punch.jpg',
        ctaText: 'اكتشف المزيد',
        ctaLink: '/vehicles/punch',
        order: 2,
        isActive: true
      }
    ]
  })

  // 12. Create Sample Invoices for testing offline payments
  console.log('🧾 Creating sample invoices...')
  const customerUser = createdUsers.find(u => u.email === 'customer@example.com')!
  
  if (customerUser) {
    for (let i = 1; i <= 5; i++) {
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-2024-${String(i).padStart(4, '0')}`,
          customerId: customerUser.id,
          branchId: mainBranch.id,
          totalAmount: 50000 + (i * 10000),
          paidAmount: 0,
          status: InvoiceStatus.PENDING,
          currency: 'EGP',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
          createdBy: createdUsers.find(u => u.role === 'SUPER_ADMIN')?.id,
          items: {
            create: [
              {
                description: 'صيانة دورية',
                quantity: 1,
                unitPrice: 30000,
                totalPrice: 30000
              },
              {
                description: 'قطع غيار',
                quantity: 5,
                unitPrice: 4000,
                totalPrice: 20000
              }
            ]
          }
        }
      })
      
      console.log(`Created invoice: ${invoice.invoiceNumber}`)
    }
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: ${createdUsers.length}`)
  console.log(`- Vehicles: ${createdVehicles.length}`)
  console.log(`- Permissions: ${createdPermissions.length}`)
  console.log(`- Role Templates: ${createdRoles.length}`)
  console.log(`- Branches: 1`)
  console.log(`- Service Types: 3`)
  console.log(`- Sliders: 2`)
  console.log(`- Sample Invoices: 5`)
  console.log('\n🔑 Login Credentials:')
  console.log('Admin: admin@elhamdimport.online / admin123')
  console.log('Manager: manager@elhamdimport.online / manager123')
  console.log('Customer: customer@example.com / customer123')
}

// Helper function to get vehicle specifications
function getVehicleSpecs(make: string, model: string) {
  const baseSpecs = [
    { key: 'engine', label: 'المحرك', value: '1.2L Turbo', category: 'ENGINE' as any },
    { key: 'power', label: 'القوة', value: '110 hp', category: 'ENGINE' as any },
    { key: 'transmission', label: 'ناقل الحركة', value: 'Manual', category: 'ENGINE' as any },
    { key: 'seats', label: 'عدد المقاعد', value: '5', category: 'INTERIOR' as any },
    { key: 'airbags', label: 'وسائد هوائية', value: '2', category: 'SAFETY' as any }
  ]

  if (model === 'Nexon EV') {
    return [
      { key: 'battery', label: 'البطارية', value: '40.5 kWh', category: 'ENGINE' as any },
      { key: 'range', label: 'مدى السير', value: '325 km', category: 'ENGINE' as any },
      { key: 'power', label: 'القوة', value: '143 hp', category: 'ENGINE' as any },
      { key: 'transmission', label: 'ناقل الحركة', value: 'Automatic', category: 'ENGINE' as any },
      ...baseSpecs.filter(spec => !['engine'].includes(spec.key))
    ]
  }

  return baseSpecs
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })