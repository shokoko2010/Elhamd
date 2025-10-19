import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting comprehensive database seeding for Elhamd Import...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  const modelNames = [
    'VehicleImage', 'VehicleSpecification', 'VehiclePricing', 'TestDriveBooking', 'ServiceBooking',
    'Payment', 'Booking', 'TaskComment', 'Task', 'ActivityLog', 'QuotationItem', 'Quotation',
    'InvoiceItem', 'InvoicePayment', 'InvoiceTax', 'Invoice', 'Transaction', 'TaxRecord',
    'CustomerFeedback', 'SupportTicket', 'TicketComment', 'TicketTimeline', 'ServiceEvaluation',
    'ComplaintFollowUp', 'Complaint', 'KnowledgeBaseRating', 'KnowledgeBaseArticle',
    'CustomerServiceMetric', 'MarketingCampaign', 'LeadActivity', 'Lead', 'SalesFunnel',
    'SalesTarget', 'MarketingMetric', 'JournalEntryItem', 'JournalEntry', 'Employee',
    'PayrollRecord', 'LeaveRequest', 'PerformanceReview', 'TrainingRecord', 'Contract',
    'WarrantyClaim', 'Warranty', 'MaintenanceRecord', 'MaintenanceReminder', 'MaintenancePart',
    'InsurancePayment', 'InsuranceClaim', 'InsurancePolicy', 'InsuranceCompany',
    'OrderItem', 'OrderPayment', 'Order', 'Product', 'ProductReview', 'PromotionUsage',
    'Promotion', 'Media', 'PopupConfig', 'CommerceSettings', 'MaintenanceSchedule',
    'CustomerProfile', 'CRMInteraction', 'InventoryItem', 'Warehouse', 'Supplier',
    'StockAlert', 'CustomerTagAssignment', 'MarketingAutomation', 'CustomerLifecycle',
    'CampaignMember', 'Campaign', 'Opportunity', 'CustomerInteraction', 'TimelineEvent',
    'CompanyValue', 'CompanyStat', 'CompanyFeature', 'ContactInfo', 'ServiceItem',
    'CompanyInfo', 'Slider', 'HeaderNavigation', 'HeaderSocial', 'HeaderContent',
    'FooterColumn', 'FooterSocial', 'FooterContent', 'SiteSettings', 'PageSEO',
    'PerformanceMetric', 'CalendarEvent', 'TimeSlot', 'Holiday', 'Notification',
    'EmailTemplate', 'RoleTemplatePermission', 'UserPermission', 'BranchPermission',
    'BranchTransfer', 'BranchBudget', 'Vehicle', 'ServiceType', 'Permission', 'RoleTemplate',
    'User', 'Branch', 'SecurityLog'
  ]

  for (const modelName of modelNames) {
    try {
      await (prisma as any)[modelName.toLowerCase()].deleteMany()
    } catch (error) {
      // Ignore errors for models that don't exist or have constraints
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
      { label: 'عملاء سعداء', value: '5000+', icon: 'users' },
      { label: 'مركبة مباعة', value: '10000+', icon: 'truck' },
      { label: 'سنوات خبرة', value: '14+', icon: 'award' },
      { label: 'فرع', value: '1', icon: 'map-pin' }
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
        icon: 'wrench',
        features: ['فحص شامل', 'تغيير زيت', 'فحص فرامل', 'تأكد من سلامة المركبة']
      },
      {
        title: 'قطع غيار أصلية',
        description: 'توفير قطع غيار أصلية من تاتا موتورز',
        icon: 'package',
        features: ['ضمان أصالة', 'أسعار تنافسية', 'توصيل سريع', 'دعم فني']
      },
      {
        title: 'خدمة 24 ساعة',
        description: 'خدمة طوارئ على مدار الساعة طوال أيام الأسبوع',
        icon: 'clock',
        features: ['استجابة سريعة', 'فنيون محترفون', 'معدات حديثة', 'تغطية واسعة']
      },
      {
        title: 'التأجير',
        description: 'تأجير شاحنات ومركبات تجارية للشركات والأفراد',
        icon: 'truck',
        features: ['أسعار مرنة', 'شروط سهلة', 'تأمين شامل', 'صيانة دورية']
      }
    ]
  })

  // Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      {
        year: 2010,
        title: 'تأسيس الشركة',
        description: 'تأسست شركة الحمد لاستيراد السيارات كوكيل لـ تاتا موتورز'
      },
      {
        year: 2015,
        title: 'توسع الخدمات',
        description: 'إضافة خدمات الصيانة وقطع الغيار'
      },
      {
        year: 2020,
        title: 'التحول الرقمي',
        description: 'إطلاق النظام الإلكتروني لإدارة المبيعات والخدمات'
      },
      {
        year: 2024,
        title: 'التطوير المستمر',
        description: 'تحديث النظام وتوسيع قاعدة العملاء'
      }
    ]
  })

  // Contact Info
  await prisma.contactInfo.createMany({
    data: [
      {
        type: 'phone',
        label: 'الهاتف',
        value: '+20 2 12345678',
        icon: 'phone'
      },
      {
        type: 'email',
        label: 'البريد الإلكتروني',
        value: 'info@elhamdimport.online',
        icon: 'mail'
      },
      {
        type: 'address',
        label: 'العنوان',
        value: 'القنطرة غرب، الجيزة، مصر',
        icon: 'map-pin'
      },
      {
        type: 'whatsapp',
        label: 'واتساب',
        value: '+20 1012345678',
        icon: 'message-circle'
      }
    ]
  })

  // 2. Create Permissions
  console.log('🔐 Creating permissions...')
  const permissions = [
    // Vehicle Management
    { name: 'vehicles.view', description: 'عرض المركبات', category: 'VEHICLES' },
    { name: 'vehicles.create', description: 'إنشاء مركبات', category: 'VEHICLES' },
    { name: 'vehicles.edit', description: 'تعديل المركبات', category: 'VEHICLES' },
    { name: 'vehicles.delete', description: 'حذف المركبات', category: 'VEHICLES' },
    
    // Booking Management
    { name: 'bookings.view', description: 'عرض الحجوزات', category: 'BOOKINGS' },
    { name: 'bookings.create', description: 'إنشاء حجوزات', category: 'BOOKINGS' },
    { name: 'bookings.edit', description: 'تعديل الحجوزات', category: 'BOOKINGS' },
    { name: 'bookings.delete', description: 'حذف الحجوزات', category: 'BOOKINGS' },
    
    // User Management
    { name: 'users.view', description: 'عرض المستخدمين', category: 'USERS' },
    { name: 'users.create', description: 'إنشاء مستخدمين', category: 'USERS' },
    { name: 'users.edit', description: 'تعديل المستخدمين', category: 'USERS' },
    { name: 'users.delete', description: 'حذف المستخدمين', category: 'USERS' },
    
    // Branch Management
    { name: 'branches.view', description: 'عرض الفروع', category: 'BRANCHES' },
    { name: 'branches.create', description: 'إنشاء فروع', category: 'BRANCHES' },
    { name: 'branches.edit', description: 'تعديل الفروع', category: 'BRANCHES' },
    { name: 'branches.delete', description: 'حذف الفروع', category: 'BRANCHES' },
    
    // Inventory Management
    { name: 'inventory.view', description: 'عرض المخزون', category: 'INVENTORY' },
    { name: 'inventory.create', description: 'إنشاء أصناف مخزون', category: 'INVENTORY' },
    { name: 'inventory.edit', description: 'تعديل المخزون', category: 'INVENTORY' },
    { name: 'inventory.delete', description: 'حذف المخزون', category: 'INVENTORY' },
    
    // Financial Management
    { name: 'financial.view', description: 'عرض التقارير المالية', category: 'FINANCIAL' },
    { name: 'financial.create', description: 'إنشاء تقارير مالية', category: 'FINANCIAL' },
    { name: 'financial.edit', description: 'تعديل التقارير المالية', category: 'FINANCIAL' },
    { name: 'financial.delete', description: 'حذف التقارير المالية', category: 'FINANCIAL' },
    
    // CRM Management
    { name: 'crm.view', description: 'عرض علاقات العملاء', category: 'CRM' },
    { name: 'crm.create', description: 'إنشاء سجلات CRM', category: 'CRM' },
    { name: 'crm.edit', description: 'تعديل سجلات CRM', category: 'CRM' },
    { name: 'crm.delete', description: 'حذف سجلات CRM', category: 'CRM' },
    
    // Admin
    { name: 'admin.dashboard', description: 'لوحة التحكم', category: 'ADMIN' },
    { name: 'admin.settings', description: 'الإعدادات', category: 'ADMIN' },
    { name: 'admin.reports', description: 'التقارير', category: 'ADMIN' },
    { name: 'admin.logs', description: 'سجلات النظام', category: 'ADMIN' }
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
      role: 'SALES_MANAGER',
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
      role: 'SERVICE_MANAGER',
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
      role: 'SALES_EMPLOYEE',
      permissions: [
        'vehicles.view', 'bookings.view', 'bookings.create', 'bookings.edit',
        'crm.view', 'crm.create', 'crm.edit'
      ],
      isSystem: true
    },
    {
      name: 'Service Employee',
      description: 'موظف خدمة',
      role: 'SERVICE_EMPLOYEE',
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
  const superAdminRole = createdRoles.find(r => r.role === 'SUPER_ADMIN')!
  const adminRole = createdRoles.find(r => r.role === 'ADMIN')!
  const branchManagerRole = createdRoles.find(r => r.role === 'BRANCH_MANAGER')!
  const salesManagerRole = createdRoles.find(r => r.role === 'SALES_MANAGER')!
  const serviceManagerRole = createdRoles.find(r => r.role === 'SERVICE_MANAGER')!
  const salesEmployeeRole = createdRoles.find(r => r.role === 'SALES_EMPLOYEE')!
  const serviceEmployeeRole = createdRoles.find(r => r.role === 'SERVICE_EMPLOYEE')!
  const customerRole = createdRoles.find(r => r.role === 'CUSTOMER')!

  const users = [
    {
      email: 'admin@elhamdimport.online',
      name: 'مدير النظام',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
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
      role: 'BRANCH_MANAGER',
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
      role: 'SALES_MANAGER',
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
      role: 'SERVICE_MANAGER',
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
      role: 'SALES_EMPLOYEE',
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
      role: 'SALES_EMPLOYEE',
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
      role: 'SERVICE_EMPLOYEE',
      phone: '+20 1078901234',
      isActive: true,
      emailVerified: true,
      roleTemplateId: serviceEmployeeRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'service2@elhamdimport.online',
      name: 'موظف خدمة 2',
      password: await bcrypt.hash('service123', 10),
      role: 'SERVICE_EMPLOYEE',
      phone: '+20 1089012345',
      isActive: true,
      emailVerified: true,
      roleTemplateId: serviceEmployeeRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'customer1@elhamdimport.online',
      name: 'عميل ذهبي',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
      phone: '+20 1090123456',
      isActive: true,
      emailVerified: true,
      roleTemplateId: customerRole.id,
      branchId: mainBranch.id,
      segment: 'VIP'
    },
    {
      email: 'customer2@elhamdimport.online',
      name: 'عميل فضي',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
      phone: '+20 1101234567',
      isActive: true,
      emailVerified: true,
      roleTemplateId: customerRole.id,
      branchId: mainBranch.id,
      segment: 'PREMIUM'
    },
    {
      email: 'customer3@elhamdimport.online',
      name: 'عميل عادي',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
      phone: '+20 1112345678',
      isActive: true,
      emailVerified: true,
      roleTemplateId: customerRole.id,
      branchId: mainBranch.id,
      segment: 'STANDARD'
    }
  ]

  const createdUsers = await Promise.all(
    users.map(user => prisma.user.create({ data: user }))
  )

  // Update branch manager
  await prisma.branch.update({
    where: { id: mainBranch.id },
    data: { managerId: createdUsers[1].id }
  })

  // 6. Create Service Types
  console.log('🔧 Creating service types...')
  const serviceTypes = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية للشاحنات والمركبات التجارية',
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
      name: 'إصلاح مكابح',
      description: 'إصلاح وصيانة نظام المكابح',
      duration: 180,
      price: 800,
      category: 'REPAIR'
    },
    {
      name: 'تغيير إطارات',
      description: 'تغيير وتوازن الإطارات',
      duration: 90,
      price: 400,
      category: 'REPAIR'
    },
    {
      name: 'صيانة محرك',
      description: 'صيانة شاملة للمحرك',
      duration: 240,
      price: 1500,
      category: 'REPAIR'
    },
    {
      name: 'فحص كهرباء',
      description: 'فحص وإصلاح النظام الكهربائي',
      duration: 120,
      price: 600,
      category: 'REPAIR'
    },
    {
      name: 'تكييف هواء',
      description: 'صيانة وإصلاح نظام التكييف',
      duration: 90,
      price: 450,
      category: 'REPAIR'
    }
  ]

  await Promise.all(
    serviceTypes.map(service => 
      prisma.serviceType.create({ data: service })
    )
  )

  // 7. Create Commercial Vehicles from Excel Data
  console.log('🚚 Creating commercial vehicles from Excel data...')
  
  const commercialVehicles = [
    {
      make: 'Tata',
      model: 'PRIMA 3328.K',
      year: 2024,
      price: 2850000,
      stockNumber: 'TPR3328K',
      vin: 'ELHAMDPR3328K2024001',
      description: 'شاحنة Tata Motors Prima 3328.K هي شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة. تعمل الشاحنة بمحرك Cummins ISBe مبرد بالماء، بحقن مباشر، مزود بشاحن توربيني ومبرد لاحق، ديزل، يولد قدرة قصوى تبلغ 269 حصان عند 2500 دورة/دقيقة، وعزم دوران أقصى 970 نيوتن.متر.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/prima-3328k-1.jpg',
          altText: 'Tata Prima 3328.K شاحنة ثقيلة - امامية',
          isPrimary: true,
          order: 0
        },
        {
          imageUrl: '/uploads/vehicles/prima-3328k-2.jpg',
          altText: 'Tata Prima 3328.K شاحنة ثقيلة - جانبية',
          isPrimary: false,
          order: 1
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'محرك CUMMINS ISBe 270 - ديزل مبرد بالماء، حقن مباشر، مزود بشاحن توربيني ومبرد بعدي', category: 'ENGINE' },
        { key: 'body_type', label: 'نوع الجسم', value: '18 Cum', category: 'GENERAL' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: 'السعة اللترية للمحرك: 6700', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: 'قوة المحرك: 266 حصان عند 2500 دورة/دقيقة', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: 'رمز الفرامل: 109', category: 'PERFORMANCE' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: 'عزم الدوران: 970 نيوتن.متر عند 1500 دورة/دقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: 'القدرة على التسلق: 21% (الترس الأول)، 32% (زاحف)', category: 'PERFORMANCE' },
        { key: 'transmission', label: 'علبة التروس', value: 'علبة التروس: ZF، عدد 9 أمامي + 1 خلفي', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'القابض: 430 ملم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'نظام التوجيه: هيدروليكي', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'الفرامل: هواء مزدوج الدائرة بالكامل - نوع S Cam', category: 'BRAKES' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'نظام التعليق الأمامي: نوابض ورقية شبه بيضاوية (Parabolic leaf spring)', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'نظام التعليق الخلفي: نوابض شعاعية مع قضبان مطاطية متعددة ونظام عزم دوران & قضيب V', category: 'SUSPENSION' },
        { key: 'tires', label: 'الإطارات', value: 'مقاس الإطارات: 12R24 - 18PR', category: 'WHEELS' },
        { key: 'length', label: 'الطول', value: 'الوزن الإجمالي للمركبة: 8038 كجم', category: 'DIMENSIONS' },
        { key: 'width', label: 'العرض', value: 'عرض الكابينة: 2590 ملم', category: 'DIMENSIONS' },
        { key: 'height', label: 'الارتفاع (مم)', value: 'طول الصندوق: 3219 ملم', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: 'الطول الإجمالي: 4570 ملم', category: 'DIMENSIONS' },
        { key: 'ground_clearance', label: 'الخلوص الأرضي', value: 'ارتفاع الصندوق: 353 ملم', category: 'DIMENSIONS' },
        { key: 'min_tcr', label: 'الحد الأدنى TCR (مم)', value: 'الوزن الإجمالي على المحور الخلفي: 9175 كجم', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: 'الوزن الإجمالي المسموح به: 28500 كجم', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: 'الوزن على المحور الأمامي: 9570 كجم', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: 'الوزن على المحور الخلفي: 7500 كجم', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: 'حمولة الصندوق: 21000 كجم', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: 'قاعدة العجلات: 365 سم', category: 'FUEL' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'مكيف هواء (AC)', category: 'COMFORT' },
        { key: 'body_option', label: 'خيار الجسم', value: 'سعة الصندوق: 18 متر مكعب', category: 'GENERAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: '6X4', category: 'TRANSMISSION' }
      ],
      pricing: {
        basePrice: 2850000,
        taxes: 0,
        fees: 0,
        totalPrice: 2850000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'LP 613',
      year: 2024,
      price: 750000,
      stockNumber: 'TLP613',
      vin: 'ELHAMDLPT6132024001',
      description: 'صُممت حافلة تاتا LP 613 لتناسب تنقلات الموظفين والمدارس والرحلات داخل المدينة، وهي مزوّدة بمحرك تاتا 697 TCIC Euro 3 الذي ينتج قوة قصوى تبلغ 130 حصانًا وعزم دوران يصل إلى 430 نيوتن.متر عند 1800 دورة في الدقيقة.',
      category: 'BUS',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أصفر',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/lp-613-1.jpg',
          altText: 'Tata LP 613 حافلة - امامية',
          isPrimary: true,
          order: 0
        },
        {
          imageUrl: '/uploads/vehicles/lp-613-2.jpg',
          altText: 'Tata LP 613 حافلة - داخلية',
          isPrimary: false,
          order: 1
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'Tata 697 TCIC E3', category: 'ENGINE' },
        { key: 'engine_type', label: 'نوع المحرك', value: 'ديزل', category: 'ENGINE' },
        { key: 'body_type', label: 'نوع الجسم', value: 'هيكل حافلة', category: 'GENERAL' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '5675 سم³', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: '130 حصان عند 2400 دورة/دقيقة', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '130 حصان عند 2400 دورة/دقيقة', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '6 أسطوانات', category: 'ENGINE' },
        { key: 'cylinders_displacement', label: 'اسطوانات / الإزاحة', value: '6 / 5675 سم³', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '112 كم/ساعة', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'يورو 3', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '430 نيوتن.متر عند 1400-1800 دورة/دقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '25%', category: 'PERFORMANCE' },
        { key: 'transmission_type', label: 'نوع النقل', value: 'Tata GBS40 سنكرومش', category: 'TRANSMISSION' },
        { key: 'gears', label: 'عدد العتاد', value: '5 أمامي + 1 خلفي', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'Tata GBS40، يدوي', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'نوع جاف، صفيحة واحدة', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: 'قطر 310 مم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'نظام توجيه هيدروليكي متكامل', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'فرامل هوائية مزدوجة الدائرة مع ABS', category: 'BRAKES' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: 'طبلة', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: 'طبلة', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: '325 مم', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'نوابض صفائحية شبه بيضاوية أمامية وخلفية مع عمود مقاوم للانقلاب', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'نابض صفائحي أمامي', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'نابض صفائحي أمامي', category: 'SUSPENSION' },
        { key: 'shock_absorber', label: 'ممتص الصدمات', value: 'ممتص صدمات هيدروليكي مزدوج الفعل تلسكوبي أمامي وخلفي', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'أمامي وخلفي', category: 'SUSPENSION' },
        { key: 'wheels_tires', label: 'عدد العجلات / الإطارات', value: 'أمامي: 2، خلفي: 4، احتياطي: 1', category: 'WHEELS' },
        { key: 'tires', label: 'الإطارات', value: '215/75 R17.5', category: 'WHEELS' },
        { key: 'wheel_rims', label: 'حافات العجلات', value: '6.0 x 17.5', category: 'WHEELS' },
        { key: 'tire_size_rating', label: 'الحجم وتصنيف الرقائق', value: '215/75 R17.5', category: 'WHEELS' },
        { key: 'front_axle_description', label: 'وصف المحور الأمامي', value: 'محور أمامي I قوي ومطروق نوع Elliot عكسي', category: 'AXLES' },
        { key: 'rear_axle', label: 'المحور الخلفي', value: 'Tata RAS-104، تخفيض مفرد، تروس هيبويد، أعمدة محاور طافية بالكامل', category: 'AXLES' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '3.111:1', category: 'AXLES' },
        { key: 'frame_depth', label: 'عمق الإطار', value: '200 مم', category: 'DIMENSIONS' },
        { key: 'frame_width', label: 'عرض الإطار', value: '822 × 200 مم', category: 'DIMENSIONS' },
        { key: 'length', label: 'الطول', value: 'غير قابل للتطبيق', category: 'DIMENSIONS' },
        { key: 'width', label: 'العرض', value: 'غير قابل للتطبيق', category: 'DIMENSIONS' },
        { key: 'height', label: 'الارتفاع (مم)', value: 'غير قابل للتطبيق', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '3800 مم', category: 'DIMENSIONS' },
        { key: 'vehicle_length', label: 'طول_المركبة_الكلي', value: 'الحافلة: 7510 مم', category: 'DIMENSIONS' },
        { key: 'vehicle_width', label: 'عرض_المركبة_الكلي', value: 'الحافلة: 2200 مم', category: 'DIMENSIONS' },
        { key: 'overhang_front', label: 'تعليق علوي - أمامي', value: 'الشاسيه: 1180 مم', category: 'DIMENSIONS' },
        { key: 'overhang_rear', label: 'تعليق علوي - خلفي', value: 'الشاسيه: 2050 مم', category: 'DIMENSIONS' },
        { key: 'turning_circle_diameter', label: 'Turning Circle Diameter', value: '13.5 م', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '1656 مم', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '1577 مم', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '7500 كجم', category: 'WEIGHTS' },
        { key: 'gcw', label: 'GCW', value: 'غير قابل للتطبيق', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: '5210 كجم', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: '2800 كجم', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: '4700 كجم', category: 'WEIGHTS' },
        { key: 'max_payload', label: 'الحمولة القصوى', value: '2290 كجم', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '120 لتر', category: 'FUEL' },
        { key: 'def_tank', label: 'DEF Tank', value: 'غير قابل للتطبيق', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'غير قابل للتطبيق', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'غير قابل للتطبيق', category: 'COMFORT' },
        { key: 'cargo_box_dimensions', label: 'Cargo Box Dimensions', value: 'غير قابل للتطبيق', category: 'DIMENSIONS' },
        { key: 'battery', label: 'البطارية', value: '2 × 12 فولت، 120 أمبير/ساعة', category: 'ELECTRICAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: '4×2، المقود على اليسار', category: 'TRANSMISSION' },
        { key: 'alternator', label: 'المولد', value: '24 فولت، 150 أمبير', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'مقاعد ركاب بظهر مرتفع', category: 'COMFORT' }
      ],
      pricing: {
        basePrice: 750000,
        taxes: 0,
        fees: 0,
        totalPrice: 750000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'LPT 1618',
      year: 2024,
      price: 1620000,
      stockNumber: 'TLPT1618',
      vin: 'ELHAMDLPT16182024001',
      description: 'تم تصميم تاتا LPT 1618 لإعادة تعريف الأداء والموثوقية، ويجسد القوة والدقة. مدعوم بمحرك تاتا كمنز B5.9، 6 أسطوانات يورو II المثبت، يولد هذا المحرك قوة عالية قدرها 179 حصان عند 2500 دورة في الدقيقة وعزم دوران أقصى قدره 650 نيوتن متر.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أزرق',
      status: 'AVAILABLE',
      featured: false,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/lpt-1618-1.jpg',
          altText: 'Tata LPT 1618 شاحنة - امامية',
          isPrimary: true,
          order: 0
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'CUMMINS B5.9-180 20', category: 'ENGINE' },
        { key: 'engine_type', label: 'نوع المحرك', value: 'محرك ديزل بالحقن المباشر مبرد بالماء مع مبرد داخلي', category: 'ENGINE' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '5883 cc', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '132 كيلو واط (176.9 حصان) عند 2500 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '6 مضمنة', category: 'ENGINE' },
        { key: 'cylinders_displacement', label: 'اسطوانات / الإزاحة', value: '6 سلندر، 5675 سم مكعب', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '120 كم/ساعة', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'يورو 2', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '650 نيوتن متر (66.2 ملليغرام) عند 1500 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '27%', category: 'PERFORMANCE' },
        { key: 'grade_restartability', label: 'إمكانية إعادة تشغيل الدرجة', value: '30%', category: 'PERFORMANCE' },
        { key: 'transmission_type', label: 'نوع النقل', value: 'يدوي', category: 'TRANSMISSION' },
        { key: 'gears', label: 'عدد العتاد', value: '6 للأمام + 1 للخلف', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'Tata G600-6/6.58', category: 'TRANSMISSION' },
        { key: 'fgr', label: 'FGR', value: '6.58', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'لوحة واحدة من نوع الاحتكاك الجاف، بمساعدة المعزز', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: '352 ملم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'طاقة هيدروليكية متكاملة', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'مكابح S - Cam هوائية كاملة مزدوجة الدائرة', category: 'BRAKES' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: 'كاميرا S - Cam هوائية كاملة مع أداة ضبط الارتخاء التلقائي', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: 'كاميرا S - Cam هوائية كاملة مع أداة ضبط الارتخاء التلقائي', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: '410 نانومتر', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'نابض صفائحي شبه بيضاوي في الأمام والخلف', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'زنبرك ورقي شبه إهليلجي', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'زنبرك ورقي شبه بيضاوي الشكل مع زنبركات مساعدة', category: 'SUSPENSION' },
        { key: 'shock_absorber', label: 'ممتص الصدمات', value: 'Hydraulic double acting telescopic type at front and rear', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'Front only', category: 'SUSPENSION' },
        { key: 'wheels_tires', label: 'عدد العجلات / الإطارات', value: 'الأمامي: 2، الخلفي:4 والاحتياطي: 1', category: 'WHEELS' },
        { key: 'tires', label: 'الإطارات', value: '11R22.5- 16PR', category: 'WHEELS' },
        { key: 'wheel_rims', label: 'حافات العجلات', value: '8.25 x 22.5', category: 'WHEELS' },
        { key: 'tire_size_rating', label: 'الحجم وتصنيف الرقائق', value: '11R22.5- 16PR', category: 'WHEELS' },
        { key: 'front_axle_description', label: 'وصف المحور الأمامي', value: 'شعاع I مطروق شديد التحمل، نوع إليوت عكسي', category: 'AXLES' },
        { key: 'rear_axle', label: 'المحور الخلفي', value: 'RA 109 RR 41/7 (5.86)، 1044،فلنجة T -150dia', category: 'AXLES' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '5.86', category: 'AXLES' },
        { key: 'frame_type', label: 'النوع (الإطار)', value: 'إطار من نوع السلم مع أعضاء متصالبة مثبتة/مثبتة بمسامير أعضاء جانبية من قسم القناة', category: 'FRAME' },
        { key: 'frame_depth', label: 'عمق الإطار', value: '285', category: 'DIMENSIONS' },
        { key: 'frame_width', label: 'عرض الإطار', value: '888', category: 'DIMENSIONS' },
        { key: 'length', label: 'الطول', value: '9170', category: 'DIMENSIONS' },
        { key: 'width', label: 'العرض', value: '2492', category: 'DIMENSIONS' },
        { key: 'height', label: 'الارتفاع (مم)', value: '2795', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '5195', category: 'DIMENSIONS' },
        { key: 'ground_clearance', label: 'الخلوص الأرضي', value: '225', category: 'DIMENSIONS' },
        { key: 'overhang_front', label: 'تعليق علوي - أمامي', value: '1515', category: 'DIMENSIONS' },
        { key: 'overhang_rear', label: 'تعليق علوي - خلفي', value: '2337', category: 'DIMENSIONS' },
        { key: 'min_tcr', label: 'الحد الأدنى TCR (مم)', value: '9.8', category: 'DIMENSIONS' },
        { key: 'min_turning_circle', label: 'الحد الأدنى لقطر دائرة خلوص الدوران', value: '20.9', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '1955', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '1860', category: 'DIMENSIONS' },
        { key: 'departure_angle', label: 'زاوية المغادرة', value: '10 درجة', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '16200', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: '5875', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: '6000', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: '10200', category: 'WEIGHTS' },
        { key: 'max_payload', label: 'الحمولة القصوى', value: '10325', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '350', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'وجه LPT', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'التدفئة والتهوية وتكييف الهواء', category: 'COMFORT' },
        { key: 'battery', label: 'البطارية', value: '12 فولت × 2 = 24 فولت × 150 أمبير', category: 'ELECTRICAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: 'القيادة جهة اليسار', category: 'TRANSMISSION' },
        { key: 'alternator', label: 'المولد', value: '75 أمبير', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'ي+ 2', category: 'COMFORT' }
      ],
      pricing: {
        basePrice: 1620000,
        taxes: 0,
        fees: 0,
        totalPrice: 1620000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'LPT 613',
      year: 2024,
      price: 750000,
      stockNumber: 'TLPT613',
      vin: 'ELHAMDLPT6132024001',
      description: 'تاتا LPT 613 هي مركبة تجارية قوية ومتعددة الاستخدامات مصممة لإعادة تعريف الأداء والموثوقية في مشهد النقل. مدعومة بمحرك تاتا 697 TCIC مبرد بالماء، حقن مباشر، ذو شاحن توربيني، والذي ينتج قوة قصوى قدرها 130 حصان عند 2400 دورة في الدقيقة وعزم دوران أقصى قدره 416 نيوتن متر.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: false,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/lpt-613-1.jpg',
          altText: 'Tata LPT 613 شاحنة خفيفة - امامية',
          isPrimary: true,
          order: 0
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'TATA 697 TCIC', category: 'ENGINE' },
        { key: 'engine_type', label: 'نوع المحرك', value: 'محرك ديزل بالحقن المباشر مبرد بالماء مع مبرد داخلي', category: 'ENGINE' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '5675 cc', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '130 Ps@ 2400rpm', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '6 مضمنة', category: 'ENGINE' },
        { key: 'cylinders_displacement', label: 'اسطوانات / الإزاحة', value: '6 سلندر، 5675 سم مكعب', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '112 كم/ساعة', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'يورو 2', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '430 نيوتن متر @ 1350-1800 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '36%', category: 'PERFORMANCE' },
        { key: 'transmission_type', label: 'نوع النقل', value: 'يدوي', category: 'TRANSMISSION' },
        { key: 'gears', label: 'عدد العتاد', value: '5 للأمام + 1 للخلف', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'GBS 40 synchromesh', category: 'TRANSMISSION' },
        { key: 'fgr', label: 'FGR', value: '6.34', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'لوحة واحدة من نوع الاحتكاك الجاف، بمساعدة المعزز', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: '310 ملم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'طاقة هيدروليكية متكاملة', category: 'STEERING' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: 'طبلة', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: 'طبلة', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: '325 ملم', category: 'BRAKES' },
        { key: 'brakes', label: 'الفرامل', value: 'مكابح S - Cam هوائية كاملة مزدوجة الدائرة', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'زنبرك متعدد الأوراق شبه بيضاوي الشكل في الأمام والخلف مع زنبركات مساعدة في الخلف فقط', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'زنبرك ورقي شبه إهليلجي', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'زنبرك ورقي شبه بيضاوي الشكل مع زنبركات مساعدة', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'نعم', category: 'SUSPENSION' },
        { key: 'wheels_tires', label: 'عدد العجلات / الإطارات', value: 'الأمامي: 2، الخلفي:4 والاحتياطي: 1', category: 'WHEELS' },
        { key: 'tires', label: 'الإطارات', value: '7.50R16 14PR طبقة شعاعية', category: 'WHEELS' },
        { key: 'tire_size_rating', label: 'الحجم وتصنيف الرقائق', value: '7.50R16 14PR طبقة شعاعية', category: 'WHEELS' },
        { key: 'front_axle_description', label: 'وصف المحور الأمامي', value: 'عارضة I مُطرقة شديدة التحمل', category: 'AXLES' },
        { key: 'rear_axle', label: 'المحور الخلفي', value: 'تخفيض واحد، ترس هيبويد', category: 'AXLES' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '3.111:1', category: 'AXLES' },
        { key: 'wheel_rims', label: 'حافات العجلات', value: '6.00 G x 16 SDC', category: 'WHEELS' },
        { key: 'frame_type', label: 'النوع (الإطار)', value: 'إطار من نوع السلم مع أعضاء متصالبة مثبتة/مثبتة بمسامير أعضاء جانبية من قسم القناة', category: 'FRAME' },
        { key: 'frame_depth', label: 'عمق الإطار', value: '200', category: 'DIMENSIONS' },
        { key: 'frame_width', label: 'عرض الإطار', value: '60', category: 'DIMENSIONS' },
        { key: 'length', label: 'الطول', value: '6243', category: 'DIMENSIONS' },
        { key: 'width', label: 'العرض', value: '2155', category: 'DIMENSIONS' },
        { key: 'height', label: 'الارتفاع (مم)', value: '2341', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '3400', category: 'DIMENSIONS' },
        { key: 'overhang_front', label: 'تعليق علوي - أمامي', value: '1275', category: 'DIMENSIONS' },
        { key: 'turning_circle_diameter', label: 'Turning Circle Diameter', value: '6.15', category: 'DIMENSIONS' },
        { key: 'min_turning_circle', label: 'الحد الأدنى لقطر دائرة خلوص الدوران', value: '14', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '1650', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '1577', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '7500', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: '3060', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: '2800', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: '4700', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '90', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'وجه LPT', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'غير قابل للتطبيق', category: 'COMFORT' },
        { key: 'battery', label: 'البطارية', value: '12 V, 180 Ah', category: 'ELECTRICAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: 'القيادة جهة اليسار', category: 'TRANSMISSION' },
        { key: 'alternator', label: 'المولد', value: '65 أمبير', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'ي+ 2', category: 'COMFORT' },
        { key: 'chassis', label: 'Chassis', value: 'إطار من نوع السلم مع أعضاء متصالبة مثبتة/مثبتة بمسامير أعضاء جانبية من قسم القناة', category: 'FRAME' }
      ],
      pricing: {
        basePrice: 750000,
        taxes: 0,
        fees: 0,
        totalPrice: 750000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'LPT613 TIPPER',
      year: 2024,
      price: 780000,
      stockNumber: 'TLPT613T',
      vin: 'ELHAMDLPT613T2024001',
      description: 'تعد تاتا LPT 613 صندوق القلاب شاحنة تجارية خفيفة استثنائية مصممة لتعزيز قدراتك في النقل. تتميز هذه الشاحنة بمحرك Cummins B5.9 مبرد بالماء، حقن مباشر، ديزل، والذي ينتج قوة قصوى قدرها 130 حصان عند 2400 دورة في الدقيقة وعزم دوران قدره 416 نيوتن متر، مما يضمن التعامل الدقيق والفعّال مع كل حمولة.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'برتقالي',
      status: 'AVAILABLE',
      featured: false,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/lpt613-tipper-1.jpg',
          altText: 'Tata LPT 613 Tipper شاحنة قلاب - امامية',
          isPrimary: true,
          order: 0
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'CUMMINS B5.9-180 20', category: 'ENGINE' },
        { key: 'engine_type', label: 'نوع المحرك', value: 'ديزل بحقن مباشر وتبريد بالماء مع مبرّد داخلي (Intercooler)', category: 'ENGINE' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '5675 سم³', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '95 كيلوواط عند 2400 دورة/دقيقة', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '6 أسطوانات متراصة (Inline)', category: 'ENGINE' },
        { key: 'cylinders_displacement', label: 'اسطوانات / الإزاحة', value: '6 أسطوانات، 5675 سم³', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '112 كم/س', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'Euro II', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '416 نيوتن متر عند 1400–1700 دورة/دقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '36%', category: 'PERFORMANCE' },
        { key: 'transmission_type', label: 'نوع النقل', value: 'يدوي', category: 'TRANSMISSION' },
        { key: 'gears', label: 'عدد العتاد', value: '5 أمامية + 1 خلفية', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'GBS 40 سنكروميش', category: 'TRANSMISSION' },
        { key: 'fgr', label: 'FGR', value: '6.34', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'قرص مفرد جاف مع تعزيز بواسطة مضخة (booster assisted)', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: '310 مم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'هيدروليكي متكامل', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'مزدوجة الدائرة، فرامل هوائية كاملة من نوع S-cam', category: 'BRAKES' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: 'طبلة', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: 'طبلة', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: '325 مم', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'نوابض متعددة الأوراق نصف بيضاوية بالأمام والخلف، مع نوابض إضافية بالخلف فقط', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'نوابض نصف بيضاوية', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'نوابض نصف بيضاوية مع نوابض إضافية', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'موجود', category: 'SUSPENSION' },
        { key: 'wheels_tires', label: 'عدد العجلات / الإطارات', value: 'أمام: 2، خلف: 4، احتياطي: 1', category: 'WHEELS' },
        { key: 'tires', label: 'الإطارات', value: '7.50R16 14PR، نوع شعاعي', category: 'WHEELS' },
        { key: 'wheel_rims', label: 'حافات العجلات', value: '6.00 G x 16 SDC', category: 'WHEELS' },
        { key: 'tire_size_rating', label: 'الحجم وتصنيف الرقائق', value: '7.50R16 14PR Radial ply', category: 'WHEELS' },
        { key: 'front_axle_description', label: 'وصف المحور الأمامي', value: 'I-Beam مطروق للخدمة الشاقة', category: 'AXLES' },
        { key: 'rear_axle', label: 'المحور الخلفي', value: 'تخفيض مفرد، تروس هيبويد', category: 'AXLES' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '3.111:1', category: 'AXLES' },
        { key: 'frame_type', label: 'النوع (الإطار)', value: 'إطار سلم (Ladder) مع وصلات مثبتة بمسامير / برشام، الأجزاء الجانبية من مقطع حرف U', category: 'FRAME' },
        { key: 'frame_depth', label: 'عمق الإطار', value: '200', category: 'DIMENSIONS' },
        { key: 'frame_width', label: 'عرض الإطار', value: '60', category: 'DIMENSIONS' },
        { key: 'length', label: 'الطول', value: '5914', category: 'DIMENSIONS' },
        { key: 'width', label: 'العرض', value: '2116', category: 'DIMENSIONS' },
        { key: 'height', label: 'الارتفاع (مم)', value: '2341', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '3400', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '1650', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '1577', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '7500', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '90', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'تصميم LPT', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'غير قابل للتطبيق', category: 'COMFORT' },
        { key: 'battery', label: 'البطارية', value: '12 فولت، 180 أمبير/ساعة', category: 'ELECTRICAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: 'المقود على الجهة اليسرى (LHD)', category: 'TRANSMISSION' },
        { key: 'alternator', label: 'المولد', value: '65 أمبير', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'D+2 (السائق + 2 ركاب)', category: 'COMFORT' }
      ],
      pricing: {
        basePrice: 780000,
        taxes: 0,
        fees: 0,
        totalPrice: 780000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'ULTRA T.7',
      year: 2024,
      price: 645000,
      stockNumber: 'TULT7',
      vin: 'ELHAMDTULT72024001',
      description: 'وجّه نجاح أعمالك مع Tata Ultra T.7 مدعومة بمحرك NG3.3L CR EIV المجرب، تولد قوة قدرها 155 حصان عند 2600 دورة/دقيقة، وعزم دوران يبلغ 450 نيوتن.متر، ما يضمن أداءً استثنائيًا في عمليات النقل والخدمات اللوجستية.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أخضر',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/ultra-t7-1.jpg',
          altText: 'Tata Ultra T.7 شاحنة حديثة - امامية',
          isPrimary: true,
          order: 0
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'NG3.3L CR EIV', category: 'ENGINE' },
        { key: 'engine_type', label: 'نوع المحرك', value: 'اشتعال الضغط، EURO-4', category: 'ENGINE' },
        { key: 'body_type', label: 'نوع الجسم', value: 'مقصورة وهيكل قاعدي', category: 'GENERAL' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '3300 سي سي', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '155 Ps @ 2600 rpm', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '4 مضمنة', category: 'ENGINE' },
        { key: 'cylinders_displacement', label: 'اسطوانات / الإزاحة', value: '4 سلندر، 3300 سي سي', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '105 كم في الساعة', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'EuroIV', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '450 نيوتن متر عند 2200-1500 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '45%', category: 'PERFORMANCE' },
        { key: 'grade_restartability', label: 'إمكانية إعادة تشغيل الدرجة', value: '40%', category: 'PERFORMANCE' },
        { key: 'transmission_type', label: 'نوع النقل', value: 'يدوي', category: 'TRANSMISSION' },
        { key: 'gears', label: 'عدد العتاد', value: '6 للأمام +1 للخلف', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'Tata G550 متزامن', category: 'TRANSMISSION' },
        { key: 'fgr', label: 'FGR', value: '6.9', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'لوحة واحدة من نوع الاحتكاك الجاف، مساعدة بتعزيز', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: '330 ملم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'الطاقة الهيدروليكية المتكاملة', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'فرامل هوائية S-cam كاملة الدائرة مزدوجة + ABS + ESP', category: 'BRAKES' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: '325 X 140 فرامل هوائية ذات أسطوانة S-Cam', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: '325 X 140 فرامل هوائية ذات أسطوانة S-Cam', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: 'قطر 325', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'زنبرك أوراق مكافئ وشبه إهليلجي', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'زنبرك مكافئ', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'نابض أوراق شبه إهليلجي مع النوابض المساعدة', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'نعم', category: 'SUSPENSION' },
        { key: 'wheels_tires', label: 'عدد العجلات / الإطارات', value: 'أمامي: 2، خلفي: 4، احتياطي: 1', category: 'WHEELS' },
        { key: 'tires', label: 'الإطارات', value: '215/75R 17.5', category: 'WHEELS' },
        { key: 'wheel_rims', label: 'حافات العجلات', value: '6.00 X 17.5', category: 'WHEELS' },
        { key: 'tire_size_rating', label: 'الحجم وتصنيف الرقائق', value: '215/75R 17.5', category: 'WHEELS' },
        { key: 'front_axle_description', label: 'وصف المحور الأمامي', value: 'عرض I مطروق لأداء عالي', category: 'AXLES' },
        { key: 'rear_axle', label: 'المحور الخلفي', value: 'Tata RA-1055', category: 'AXLES' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '4.125', category: 'AXLES' },
        { key: 'frame_type', label: 'النوع (الإطار)', value: 'إطار مستقيم من سلمية الشكل', category: 'FRAME' },
        { key: 'frame_depth', label: 'عمق الإطار', value: '186 mm', category: 'DIMENSIONS' },
        { key: 'frame_width', label: 'عرض الإطار', value: '820 mm', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '3550 mm', category: 'DIMENSIONS' },
        { key: 'ground_clearance', label: 'الخلوص الأرضي', value: '187 mm', category: 'DIMENSIONS' },
        { key: 'vehicle_length', label: 'طول_المركبة_الكلي', value: '6234 mm', category: 'DIMENSIONS' },
        { key: 'vehicle_width', label: 'عرض_المركبة_الكلي', value: '2050 mm', category: 'DIMENSIONS' },
        { key: 'overall_height_unladen', label: 'الارتفاع الإجمالي (بدون حمولة)', value: '2457 mm', category: 'DIMENSIONS' },
        { key: 'overhang_front', label: 'تعليق علوي - أمامي', value: '1180 mm', category: 'DIMENSIONS' },
        { key: 'overhang_rear', label: 'تعليق علوي - خلفي', value: '1414 mm', category: 'DIMENSIONS' },
        { key: 'min_tcr', label: 'الحد الأدنى TCR (مم)', value: '6.5', category: 'DIMENSIONS' },
        { key: 'min_turning_circle', label: 'الحد الأدنى لقطر دائرة خلوص الدوران', value: '14.1', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '1565 mm', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '1620 mm', category: 'DIMENSIONS' },
        { key: 'departure_angle', label: 'زاوية المغادرة', value: '13 deg', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '6450 kg', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: '2970 kg', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: '2990 kg', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: '4500 kg', category: 'WEIGHTS' },
        { key: 'max_payload', label: 'الحمولة القصوى', value: '3480 kg', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '90 L', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'عرض ضيق للغاية 1905 ملم', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'التدفئة والتهوية وتكييف الهواء', category: 'COMFORT' },
        { key: 'battery', label: 'البطارية', value: '2 x 12V 100 AH', category: 'ELECTRICAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: 'LHD', category: 'TRANSMISSION' },
        { key: 'alternator', label: 'المولد', value: '80 أمبير', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'السائق : نوع الدلو + مقعد طويل يتسع لراكبين', category: 'COMFORT' }
      ],
      pricing: {
        basePrice: 645000,
        taxes: 0,
        fees: 0,
        totalPrice: 645000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'ULTRA T.9',
      year: 2024,
      price: 899000,
      stockNumber: 'TULT9',
      vin: 'ELHAMDTULT92024001',
      description: 'تخطَّ أصعب المهام مع الاعتمادية العالية لشاحنة Tata Ultra T.9، المصممة لرحلات لا تتوقف وسرعة دوران أعلى. مزوّدة بمحرك 3.3L NG Common Rail TCIC يولّد 155 حصان عند 2600 دورة/دقيقة، مع 450 نيوتن.متر من عزم الدوران لتحقيق أداء عالي في مختلف العمليات.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'أحمر',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/ultra-t9-1.jpg',
          altText: 'Tata Ultra T.9 شاحنة متطورة - امامية',
          isPrimary: true,
          order: 0
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'NG3.3L CR EIV', category: 'ENGINE' },
        { key: 'engine_type', label: 'نوع المحرك', value: 'EURO- 4', category: 'ENGINE' },
        { key: 'body_type', label: 'نوع الجسم', value: 'مقصورة وهيكل قاعدي', category: 'GENERAL' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '3300 سي سي', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '155 Ps عند 2600 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '4 مضمنة', category: 'ENGINE' },
        { key: 'cylinders_displacement', label: 'اسطوانات / الإزاحة', value: '4 سلندر، 3300 سي سي', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '105 كم في الساعة', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'EuroIV', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '450 نيوتن متر عند 2200-1500 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '37%', category: 'PERFORMANCE' },
        { key: 'grade_restartability', label: 'إمكانية إعادة تشغيل الدرجة', value: '31.31%', category: 'PERFORMANCE' },
        { key: 'transmission_type', label: 'نوع النقل', value: 'يدوي', category: 'TRANSMISSION' },
        { key: 'gears', label: 'عدد العتاد', value: '6 للأمام +1 للخلف', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'Tata G550 متزامن', category: 'TRANSMISSION' },
        { key: 'fgr', label: 'FGR', value: '6.9', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: 'لوحة واحدة من نوع الاحتكاك الجاف، مساعدة بتعزيز', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: '330 ملم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'Integrated Hydraulic Power', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'فرامل هوائية S-cam كاملة الدائرة مزدوجة ABS +', category: 'BRAKES' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: 'طبل 325X120 ملم', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: 'طبل 325X120 ملم', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: '325 ملم', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'زنبرك أوراق مكافئ وشبه إهليلجي', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'زنبرك مكافئ', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'نابض أوراق شبه إهليلجي مع النوابض المساعدة', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'نعم', category: 'SUSPENSION' },
        { key: 'wheels_tires', label: 'عدد العجلات / الإطارات', value: 'أمامي: 2، خلفي: 4، احتياطي: 1', category: 'WHEELS' },
        { key: 'tires', label: 'الإطارات', value: '215/75R 17.5', category: 'WHEELS' },
        { key: 'wheel_rims', label: 'حافات العجلات', value: '6.00 X 17.5', category: 'WHEELS' },
        { key: 'tire_size_rating', label: 'الحجم وتصنيف الرقائق', value: '215/75R 17.5', category: 'WHEELS' },
        { key: 'front_axle_description', label: 'وصف المحور الأمامي', value: 'عرض I مطروق لأداء عالي', category: 'AXLES' },
        { key: 'rear_axle', label: 'المحور الخلفي', value: 'Tata RA-1055', category: 'AXLES' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '4.125', category: 'AXLES' },
        { key: 'frame_type', label: 'النوع (الإطار)', value: 'إطار مستقيم من سلمية الشكل', category: 'FRAME' },
        { key: 'frame_depth', label: 'عمق الإطار', value: '200 mm', category: 'DIMENSIONS' },
        { key: 'frame_width', label: 'عرض الإطار', value: '850 mm', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '3920 mm', category: 'DIMENSIONS' },
        { key: 'ground_clearance', label: 'الخلوص الأرضي', value: '185.5 mm', category: 'DIMENSIONS' },
        { key: 'vehicle_length', label: 'طول_المركبة_الكلي', value: '7058 mm', category: 'DIMENSIONS' },
        { key: 'vehicle_width', label: 'عرض_المركبة_الكلي', value: '2204 mm', category: 'DIMENSIONS' },
        { key: 'overall_height_unladen', label: 'الارتفاع الإجمالي (بدون حمولة)', value: '2469 mm', category: 'DIMENSIONS' },
        { key: 'overhang_front', label: 'تعليق علوي - أمامي', value: '1180 mm', category: 'DIMENSIONS' },
        { key: 'overhang_rear', label: 'تعليق علوي - خلفي', value: '1863 mm', category: 'DIMENSIONS' },
        { key: 'min_tcr', label: 'الحد الأدنى TCR (مم)', value: '6.45', category: 'DIMENSIONS' },
        { key: 'min_turning_circle', label: 'الحد الأدنى لقطر دائرة خلوص الدوران', value: '14.8', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '1836 mm', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '1684 mm', category: 'DIMENSIONS' },
        { key: 'departure_angle', label: 'زاوية المغادرة', value: '10 deg', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '8990 kg', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: '3370 kg', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: '3327 kg', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: '5663 kg', category: 'WEIGHTS' },
        { key: 'max_payload', label: 'الحمولة القصوى', value: '5620 kg', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '120 L', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'مقصورة واسعة جدًا', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'التدفئة والتهوية وتكييف الهواء', category: 'COMFORT' },
        { key: 'battery', label: 'البطارية', value: '12V  100AH', category: 'ELECTRICAL' },
        { key: 'drive_type', label: 'قيادة السيارة', value: 'LHD', category: 'TRANSMISSION' },
        { key: 'alternator', label: 'المولد', value: '80 أمبير', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'السائق : نوع الدلو + مقعد طويل يتسع لراكبين', category: 'COMFORT' }
      ],
      pricing: {
        basePrice: 899000,
        taxes: 0,
        fees: 0,
        totalPrice: 899000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      make: 'Tata',
      model: 'XENON SC',
      year: 2024,
      price: 310000,
      stockNumber: 'TXENON',
      vin: 'ELHAMDXENON2024001',
      description: 'يجمع تاتا زينون X2 SC بين القوة والمتانة، ما يوفّر أداءً معززًا ويساهم في زيادة الأرباح. مدعوم بمحرك تاتا 2.2 لتر DICOR يورو IV، ديزل، حقن مباشر، سكة وقود مشتركة، مزود بشاحن توربيني ومبرد داخلي، يولد 150 حصان عند 4000 دورة/دقيقة وعزم دوران أقصى يبلغ 320 نيوتن.متر.',
      category: 'PICKUP',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      mileage: 0,
      color: 'فضي',
      status: 'AVAILABLE',
      featured: true,
      branchId: mainBranch.id,
      images: [
        {
          imageUrl: '/uploads/vehicles/xenon-sc-1.jpg',
          altText: 'Tata Xenon SC بيك أب - امامية',
          isPrimary: true,
          order: 0
        },
        {
          imageUrl: '/uploads/vehicles/xenon-sc-2.jpg',
          altText: 'Tata Xenon SC بيك أب - خلفية',
          isPrimary: false,
          order: 1
        }
      ],
      specifications: [
        { key: 'engine_model', label: 'موديل المحرك', value: 'محرك ديزل TATA 2.2L DICOR Euro IV بالحقن المباشر للسكك الحديدية المشتركة بشاحن توربيني', category: 'ENGINE' },
        { key: 'engine_capacity', label: 'سعة المحرك', value: '2179', category: 'ENGINE' },
        { key: 'engine_power', label: 'قوة المحرك', value: '320 نيوتن متر @ 1500-3000 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'max_power', label: 'أقصى خرج للمحرك', value: '150 حصان عند 4000 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'cylinders', label: 'عدد الاسطوانات', value: '4 مضمنة', category: 'ENGINE' },
        { key: 'max_speed', label: 'السرعة القصوى', value: '160 كم/ساعة', category: 'PERFORMANCE' },
        { key: 'emission', label: 'انبعاث', value: 'E4', category: 'ENVIRONMENT' },
        { key: 'max_torque', label: 'أقصى عزم الدوران', value: '320 نيوتن متر @ 1500-3000 دورة في الدقيقة', category: 'ENGINE' },
        { key: 'max_climbing', label: 'أقصى قدرة على الصعود', value: '41%', category: 'PERFORMANCE' },
        { key: 'grade_restartability', label: 'إمكانية إعادة تشغيل الدرجة', value: '21%', category: 'PERFORMANCE' },
        { key: 'gears', label: 'عدد العتاد', value: '5 للأمام + 1 للخلف', category: 'TRANSMISSION' },
        { key: 'transmission', label: 'علبة التروس', value: 'GBS -76-5/4.10 - علبة تروس MK - II مع زيادة السرعة', category: 'TRANSMISSION' },
        { key: 'clutch_type', label: 'نوع قابض المحرك', value: '560 سم مربع', category: 'TRANSMISSION' },
        { key: 'clutch_lining_diameter', label: 'القطر الخارجي لبطانة القابض', value: '260 ملم', category: 'TRANSMISSION' },
        { key: 'steering', label: 'المقود', value: 'توجيه الجريدة المسننة والترس الصغير بمساعدة الطاقة (هيدروليكي)', category: 'STEERING' },
        { key: 'brakes', label: 'الفرامل', value: 'مكابح قرصية مهواة مع فرجار بوعاء مزدوج', category: 'BRAKES' },
        { key: 'front_brakes', label: 'الفرامل الأمامية', value: 'مكابح قرصية', category: 'BRAKES' },
        { key: 'rear_brakes', label: 'الفرامل الخلفية', value: 'فرامل الأسطوانة', category: 'BRAKES' },
        { key: 'brake_drum_diameter', label: 'قطر طبلة الفرامل', value: '282 ملم', category: 'BRAKES' },
        { key: 'suspension', label: 'تعليق', value: 'نوع عظم الترقوة الأمامي المزدوج مع نابض لفائف فوق ممتص الصدمات', category: 'SUSPENSION' },
        { key: 'front_suspension', label: 'التعليق الأمامي', value: 'نوع عظم الترقوة الأمامي المزدوج مع نابض لفائف فوق ممتص الصدمات', category: 'SUSPENSION' },
        { key: 'rear_suspension', label: 'التعليق الخلفي', value: 'الينابيع الورقية المكافئة', category: 'SUSPENSION' },
        { key: 'shock_absorber', label: 'ممتص الصدمات', value: 'نوع تلسكوبي أمامي هيدروليكي مزدوج التمثيل', category: 'SUSPENSION' },
        { key: 'stabilizer_bar', label: 'قضيب موازنة عرضي', value: 'نعم', category: 'SUSPENSION' },
        { key: 'tires', label: 'الإطارات', value: '235/70 R16 إطارات بدون أنابيب', category: 'WHEELS' },
        { key: 'axle_ratio_rear', label: 'نسبة المحور - الخلفي', value: '4.1', category: 'AXLES' },
        { key: 'frame_width', label: 'عرض الإطار', value: '70 ملم كحد أقصى', category: 'DIMENSIONS' },
        { key: 'length', label: 'الطول', value: '5312 mm', category: 'DIMENSIONS' },
        { key: 'width', label: 'العرض', value: '1860 mm', category: 'DIMENSIONS' },
        { key: 'height', label: 'الارتفاع (مم)', value: '1788 mm', category: 'DIMENSIONS' },
        { key: 'wheelbase', label: 'قاعدة العجلات', value: '3170 مم', category: 'DIMENSIONS' },
        { key: 'ground_clearance', label: 'الخلوص الأرضي', value: '210 مم', category: 'DIMENSIONS' },
        { key: 'vehicle_length', label: 'طول_المركبة_الكلي', value: '5312 mm', category: 'DIMENSIONS' },
        { key: 'vehicle_width', label: 'عرض_المركبة_الكلي', value: '1860 mm', category: 'DIMENSIONS' },
        { key: 'overall_height_unladen', label: 'الارتفاع الإجمالي (بدون حمولة)', value: '1788', category: 'DIMENSIONS' },
        { key: 'overall_height_laden', label: 'الارتفاع الإجمالي (محملاً)', value: '1739', category: 'DIMENSIONS' },
        { key: 'overhang_front', label: 'تعليق علوي - أمامي', value: '916', category: 'DIMENSIONS' },
        { key: 'overhang_rear', label: 'تعليق علوي - خلفي', value: '1226', category: 'DIMENSIONS' },
        { key: 'min_tcr', label: 'الحد الأدنى TCR (مم)', value: '6.35', category: 'DIMENSIONS' },
        { key: 'turning_circle_diameter', label: 'Turning Circle Diameter', value: '12.7', category: 'DIMENSIONS' },
        { key: 'min_turning_circle', label: 'الحد الأدنى لقطر دائرة خلوص الدوران', value: '13.9', category: 'DIMENSIONS' },
        { key: 'front_track', label: 'المسار الأمامي', value: '235/70 R16 : 1580 ملم', category: 'DIMENSIONS' },
        { key: 'rear_track', label: 'المسار الخلفي', value: '235/70 R16: 1548 ملم', category: 'DIMENSIONS' },
        { key: 'departure_angle', label: 'زاوية المغادرة', value: '21 درجة', category: 'DIMENSIONS' },
        { key: 'total_weight', label: 'إجمالي وزن السيارة', value: '3100', category: 'WEIGHTS' },
        { key: 'curb_weight', label: 'الوزن الفارغ', value: '1820', category: 'WEIGHTS' },
        { key: 'max_faw', label: 'الحد الأقصى المسموح به FAW', value: '1115', category: 'WEIGHTS' },
        { key: 'max_raw', label: 'الحد الأقصى المسموح به RAW', value: '705', category: 'WEIGHTS' },
        { key: 'max_payload', label: 'الحمولة القصوى', value: '1280', category: 'WEIGHTS' },
        { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '70 لتر', category: 'FUEL' },
        { key: 'cabin', label: 'المقصورة', value: 'مقصورة مفردة ممتدة', category: 'COMFORT' },
        { key: 'cabin_ventilation', label: 'تهوية المقصورة', value: 'التدفئة والتهوية وتكييف الهواء', category: 'COMFORT' },
        { key: 'battery', label: 'البطارية', value: '12 V 80 Ah MF', category: 'ELECTRICAL' },
        { key: 'alternator', label: 'المولد', value: '125 صباحًا', category: 'ELECTRICAL' },
        { key: 'seats', label: 'المقاعد', value: 'ج) 4+', category: 'COMFORT' }
      ],
      pricing: {
        basePrice: 310000,
        taxes: 0,
        fees: 0,
        totalPrice: 310000,
        currency: 'EGP',
        hasDiscount: false
      }
    }
  ]

  // Create vehicles with their related data
  for (const vehicleData of commercialVehicles) {
    const { images, specifications, pricing, ...vehicleInfo } = vehicleData
    
    const vehicle = await prisma.vehicle.create({
      data: vehicleInfo
    })

    // Create images
    await Promise.all(
      images.map(image => 
        prisma.vehicleImage.create({
          data: {
            ...image,
            vehicleId: vehicle.id
          }
        })
      )
    )

    // Create specifications
    await Promise.all(
      specifications.map(spec => 
        prisma.vehicleSpecification.create({
          data: {
            ...spec,
            vehicleId: vehicle.id
          }
        })
      )
    )

    // Create pricing
    if (pricing) {
      await prisma.vehiclePricing.create({
        data: {
          ...pricing,
          vehicleId: vehicle.id
        }
      })
    }

    console.log(`✅ Created vehicle: ${vehicle.make} ${vehicle.model}`)
  }

  // 8. Create Additional Sample Data
  console.log('📊 Creating additional sample data...')

  // Time Slots
  await prisma.timeSlot.createMany({
    data: [
      { startTime: '09:00', endTime: '10:00', isActive: true },
      { startTime: '10:00', endTime: '11:00', isActive: true },
      { startTime: '11:00', endTime: '12:00', isActive: true },
      { startTime: '12:00', endTime: '13:00', isActive: false }, // Lunch break
      { startTime: '13:00', endTime: '14:00', isActive: true },
      { startTime: '14:00', endTime: '15:00', isActive: true },
      { startTime: '15:00', endTime: '16:00', isActive: true },
      { startTime: '16:00', endTime: '17:00', isActive: true }
    ]
  })

  // Holidays
  await prisma.holiday.createMany({
    data: [
      { name: 'عيد الفطر', date: new Date('2024-04-10'), isActive: true },
      { name: 'عيد الأضحى', date: new Date('2024-06-17'), isActive: true },
      { name: 'رأس السنة الهجرية', date: new Date('2024-07-07'), isActive: true },
      { name: 'عيد الميلاد المجيد', date: new Date('2024-01-07'), isActive: true }
    ]
  })

  // Sample Bookings
  const customerUser = createdUsers.find(u => u.role === 'CUSTOMER')!
  const vehicles = await prisma.vehicle.findMany({ take: 3 })
  const existingServiceTypes = await prisma.serviceType.findMany({ take: 2 })

  // Test drive bookings
  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + (i + 1) * 2)

    await prisma.testDriveBooking.create({
      data: {
        customerId: customerUser.id,
        vehicleId: vehicle.id,
        date: futureDate,
        timeSlot: `${10 + i}:00 - ${11 + i}:00`,
        status: 'PENDING',
        notes: `حجز قيادة تجريبية لـ ${vehicle.make} ${vehicle.model}`
      }
    })
  }

  // Service bookings
  for (let i = 0; i < existingServiceTypes.length; i++) {
    const serviceType = existingServiceTypes[i]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + (i + 1) * 3)

    await prisma.serviceBooking.create({
      data: {
        customerId: customerUser.id,
        serviceTypeId: serviceType.id,
        date: futureDate,
        timeSlot: `${9 + i}:00 - ${11 + i}:00`,
        status: 'PENDING',
        totalPrice: serviceType.price,
        notes: `حجز ${serviceType.name}`
      }
    })
  }

  // 9. Create Security Logs
  console.log('🔒 Creating security logs...')
  await prisma.securityLog.createMany({
    data: [
      {
        userId: createdUsers[0].id,
        action: 'LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'INFO'
      },
      {
        userId: createdUsers[1].id,
        action: 'VEHICLE_CREATE',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'INFO',
        details: { vehicleCount: 7 }
      },
      {
        userId: createdUsers[2].id,
        action: 'BOOKING_CREATE',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'INFO',
        details: { bookingType: 'TEST_DRIVE' }
      }
    ]
  })

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Permissions: ${createdPermissions.length}`)
  console.log(`- Role Templates: ${createdRoles.length}`)
  console.log(`- Users: ${createdUsers.length}`)
  console.log(`- Branches: 1`)
  console.log(`- Service Types: ${existingServiceTypes.length}`)
  console.log(`- Vehicles: ${commercialVehicles.length}`)
  console.log(`- Images: ${commercialVehicles.reduce((acc, v) => acc + v.images.length, 0)}`)
  console.log(`- Specifications: ${commercialVehicles.reduce((acc, v) => acc + v.specifications.length, 0)}`)
  console.log(`- Time Slots: 8`)
  console.log(`- Holidays: 4`)
  console.log(`- Security Logs: 3`)
  console.log('\n🔑 Login Credentials:')
  console.log('Super Admin: admin@elhamdimport.online / admin123')
  console.log('Branch Manager: manager@elhamdimport.online / manager123')
  console.log('Sales Manager: sales.manager@elhamdimport.online / salesmanager123')
  console.log('Service Manager: service.manager@elhamdimport.online / servicemanager123')
  console.log('Sales Employee 1: sales1@elhamdimport.online / sales123')
  console.log('Sales Employee 2: sales2@elhamdimport.online / sales123')
  console.log('Service Employee 1: service1@elhamdimport.online / service123')
  console.log('Service Employee 2: service2@elhamdimport.online / service123')
  console.log('Customer (VIP): customer1@elhamdimport.online / customer123')
  console.log('Customer (Premium): customer2@elhamdimport.online / customer123')
  console.log('Customer (Standard): customer3@elhamdimport.online / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })