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

  // Clean in order to respect foreign key constraints
  for (const modelName of modelNames) {
    try {
      await (prisma as any)[modelName.toLowerCase()].deleteMany()
      console.log(`✓ Cleaned ${modelName}`)
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
      siteDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة - السيارات التجارية والبيك أب والشاحنات',
      contactEmail: 'info@elhamdimport.online',
      contactPhone: '+20 2 12345678',
      contactAddress: 'بورسعيد، مصر',
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
      subtitle: 'الموزع المعتمد لسيارات تاتا في مدن القناة',
      description: 'الموزع المعتمد لسيارات تاتا في مدن القناة، متخصصون في السيارات التجارية والبيك أب والشاحنات فقط',
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
      { number: '5000+', label: 'عملاء سعداء', icon: 'users' },
      { number: '10000+', label: 'مركبة مباعة', icon: 'truck' },
        { number: '14+', label: 'سنوات خبرة', icon: 'award' },
        { number: '2', label: 'فروع', icon: 'map-pin' }
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
      address: 'القنطرة غرب، الإسماعيلية، مصر',
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

  const createdRoles = []
  for (const role of roleTemplates) {
    try {
      const createdRole = await prisma.roleTemplate.create({ data: role })
      createdRoles.push(createdRole)
      console.log(`✓ Created role: ${role.name} with role value: ${role.role}`)
    } catch (error) {
      console.log(`⚠️ Role ${role.name} already exists, skipping...`)
      // Try to find existing role
      const existingRole = await prisma.roleTemplate.findFirst({
        where: { name: role.name }
      })
      if (existingRole) {
        createdRoles.push(existingRole)
        console.log(`✓ Found existing role: ${role.name} with role value: ${existingRole.role}`)
      }
    }
  }

  console.log('Created roles summary:', createdRoles.map(r => ({ name: r.name, role: r.role })))

  // 4. Create Main Branch
  console.log('🏢 Creating main branch...')
  const mainBranch = await prisma.branch.create({
    data: {
      name: 'الفرع الرئيسي - القنطرة غرب',
      code: 'ELHAMD-MAIN',
      address: 'القنطرة غرب، الإسماعيلية، مصر',
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
  const superAdminRole = createdRoles.find(r => r.role === 'SUPER_ADMIN')
  const adminRole = createdRoles.find(r => r.role === 'ADMIN')
  const branchManagerRole = createdRoles.find(r => r.role === 'BRANCH_MANAGER')
  const staffRole = createdRoles.find(r => r.role === 'STAFF')
  const customerRole = createdRoles.find(r => r.role === 'CUSTOMER')

  if (!superAdminRole || !adminRole || !branchManagerRole || !staffRole || !customerRole) {
    throw new Error('Some required roles were not created successfully')
  }

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
      role: 'STAFF',
      phone: '+20 1034567890',
      isActive: true,
      emailVerified: true,
      roleTemplateId: staffRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'service.manager@elhamdimport.online',
      name: 'مدير الخدمة',
      password: await bcrypt.hash('servicemanager123', 10),
      role: 'STAFF',
      phone: '+20 1045678901',
      isActive: true,
      emailVerified: true,
      roleTemplateId: staffRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'sales1@elhamdimport.online',
      name: 'موظف مبيعات 1',
      password: await bcrypt.hash('sales123', 10),
      role: 'STAFF',
      phone: '+20 1056789012',
      isActive: true,
      emailVerified: true,
      roleTemplateId: staffRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'sales2@elhamdimport.online',
      name: 'موظف مبيعات 2',
      password: await bcrypt.hash('sales123', 10),
      role: 'STAFF',
      phone: '+20 1067890123',
      isActive: true,
      emailVerified: true,
      roleTemplateId: staffRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'service1@elhamdimport.online',
      name: 'موظف خدمة 1',
      password: await bcrypt.hash('service123', 10),
      role: 'STAFF',
      phone: '+20 1078901234',
      isActive: true,
      emailVerified: true,
      roleTemplateId: staffRole.id,
      branchId: mainBranch.id
    },
    {
      email: 'customer1@elhamdimport.online',
      name: 'عميل تجريبي',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
      phone: '+20 1089012345',
      isActive: true,
      emailVerified: true,
      roleTemplateId: customerRole.id,
      branchId: mainBranch.id
    }
  ]

  await Promise.all(
    users.map(user => 
      prisma.user.create({ data: user })
    )
  )

  // 6. Create Vehicles from Excel Data
  console.log('🚚 Creating vehicles from Excel data...')

  const vehiclesData = [
    {
      title: 'PRIMA 3328.K',
      description: 'شاحنة Tata Motors Prima 3328.K هي شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة. تعمل الشاحنة بمحرك Cummins ISBe مبرد بالماء، بحقن مباشر، مزود بشاحن توربيني ومبرد لاحق، ديزل، يولد قدرة قصوى تبلغ 269 حصان عند 2500 دورة/دقيقة، وعزم دوران أقصى 970 نيوتن.متر.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 1200000,
      stockNumber: 'PRIMA-3328K-001',
      specifications: {
        "موديل المحرك": "محرك CUMMINS ISBe 270 - ديزل مبرد بالماء، حقن مباشر، مزود بشاحن توربيني ومبرد بعدي.",
        "نوع الجسم": "18 Cum",
        "سعة المحرك": "السعة اللترية للمحرك: 6700",
        "قوة المحرك": "قوة المحرك: 266 حصان عند 2500 دورة/دقيقة",
        "أقصى عزم الدوران": "عزم الدوران: 970 نيوتن.متر عند 1500 دورة/دقيقة",
        "علبة التروس": "علبة التروس: ZF، عدد 9 أمامي + 1 خلفي",
        "الإطارات": "مقاس الإطارات: 12R24 - 18PR",
        "الوزن الإجمالي المسموح به": "28500 كجم",
        "سعة خزان الوقود": "260 لتر"
      },
      images: [
        '/uploads/vehicles/prima-3328k-1.jpg',
        '/uploads/vehicles/PRIMA-3328.K-1.jpg',
        '/uploads/vehicles/prima-3328k-2.jpg'
      ],
      highlights: ['970 نيوتن.متر', '270 حصان', '35%', '260 لتر'],
      features: [
        'منحنى عزم دوران ثابت',
        'مكونات موثوقة مثل محرك CUMMINS، علبة تروس ZF، ومحور خلفي TATA RA 109',
        'كابينة Prima عالمية مريحة بتصميم مريح',
        'توفر قطع الغيار',
        'فرامل عادم المحرك فلتر هواء من مرحلتين',
        'نظام التعليق الخلفي (Bogie)'
      ]
    },
    {
      title: 'LPT 1618',
      description: 'تم تصميم تاتا LPT 1618 لإعادة تعريف الأداء والموثوقية، ويجسد القوة والدقة. مدعوم بمحرك تاتا كمنز B5.9، 6 أسطوانات يورو II المثبت، يولد هذا المحرك قوة عالية قدرها 179 حصان عند 2500 دورة في الدقيقة وعزم دوران أقصى قدره 650 نيوتن متر.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 850000,
      stockNumber: 'LPT-1618-001',
      specifications: {
        "موديل المحرك": "CUMMINS B5.9-180 20",
        "نوع المحرك": "محرك ديزل بالحقن المباشر مبرد بالماء مع مبرد داخلي",
        "سعة المحرك": "5883 cc",
        "أقصى خرج للمحرك": "132 كيلو واط (176.9 حصان) عند 2500 دورة في الدقيقة.",
        "عدد الاسطوانات": "6 مضمنة",
        "السرعة القصوى": "120 كم/ساعة",
        "انبعاث": "يورو 2",
        "أقصى عزم الدوران": "650 نيوتن متر (66.2 ملليغرام) عند 1500 دورة في الدقيقة.",
        "علبة التروس": "Tata G600-6/6.58",
        "الإطارات": "11R22.5- 16PR",
        "الوزن الإجمالي المسموح به": "16200",
        "سعة خزان الوقود": "350"
      },
      images: [
        '/uploads/vehicles/LPT-1618-1.jpg'
      ],
      highlights: ['650 نيوتن متر', '178 حصان قو', '27%', '350لتر'],
      features: [
        'محرك TATA CUMMINS B5.9 سداسي الأسطوانات',
        'فرامل S - CAM هوائية بالكامل',
        'علبة تروس تاتا G600 متينة'
      ]
    },
    {
      title: 'LPT 613',
      description: 'تاتا LPT 613 هي مركبة تجارية قوية ومتعددة الاستخدامات مصممة لإعادة تعريف الأداء والموثوقية في مشهد النقل. مدعومة بمحرك تاتا 697 TCIC مبرد بالماء، حقن مباشر، ذو شاحن توربيني، والذي ينتج قوة قصوى قدرها 130 حصان عند 2400 دورة في الدقيقة وعزم دوران أقصى قدره 416 نيوتن متر.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 650000,
      stockNumber: 'LPT-613-001',
      specifications: {
        "موديل المحرك": "TATA 697 TCIC",
        "نوع المحرك": "محرك ديزل بالحقن المباشر مبرد بالماء مع مبرد داخلي",
        "سعة المحرك": "5675 cc",
        "أقصى خرج للمحرك": "130 Ps@ 2400rpm",
        "عدد الاسطوانات": "6 مضمنة",
        "السرعة القصوى": "112 كم/ساعة",
        "انبعاث": "يورو 2",
        "أقصى عزم الدوران": "430 نيوتن متر @ 1350-1800 دورة في الدقيقة",
        "علبة التروس": "GBS 40 synchromesh",
        "الإطارات": "7.50R16 14PR طبقة شعاعية",
        "الوزن الإجمالي المسموح به": "7500",
        "سعة خزان الوقود": "90"
      },
      images: [
        '/uploads/vehicles/LPT-613-1.jpg',
        '/uploads/vehicles/LP-613-1.jpg',
        '/uploads/vehicles/lp-613-2.jpg'
      ],
      highlights: ['416 نيوتن متر', '130 حصان', '120 لتر', '36%'],
      features: [
        'محرك ديزل TATA 697 TCIC بحقن مباشر ومبرد بالماء',
        'فرامل كاملة الهواء من نوع S-cam',
        'نوابض متعددة شبه بيضاوية في الأمام والخلف',
        'ناقل حركة GBS 40 بتقنية السينكروميش',
        'قابلية التسلق'
      ]
    },
    {
      title: 'LPT613 TIPPER',
      description: 'تعد تاتا LPT 613 صندوق القلاب شاحنة تجارية خفيفة استثنائية مصممة لتعزيز قدراتك في النقل. تتميز هذه الشاحنة بمحرك Cummins B5.9 مبرد بالماء، حقن مباشر، ديزل، والذي ينتج قوة قصوى قدرها 130 حصان عند 2400 دورة في الدقيقة وعزم دوران قدره 416 نيوتن متر.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 720000,
      stockNumber: 'LPT613-TIPPER-001',
      specifications: {
        "موديل المحرك": "CUMMINS B5.9-180 20",
        "نوع المحرك": "ديزل بحقن مباشر وتبريد بالماء مع مبرّد داخلي (Intercooler)",
        "سعة المحرك": "5675 سم³",
        "أقصى خرج للمحرك": "95 كيلوواط عند 2400 دورة/دقيقة",
        "عدد الاسطوانات": "6 أسطوانات متراصة (Inline)",
        "السرعة القصوى": "112 كم/س",
        "انبعاث": "Euro II",
        "أقصى عزم الدوران": "416 نيوتن متر عند 1400–1700 دورة/دقيقة",
        "علبة التروس": "GBS 40 سنكروميش",
        "الإطارات": "7.50R16 14PR، نوع شعاعي",
        "الوزن الإجمالي المسموح به": "7500",
        "سعة خزان الوقود": "90"
      },
      images: [
        '/uploads/vehicles/lpt613-tipper-1.jpg'
      ],
      highlights: ['416', '130 حصان', '36%', '90L'],
      features: [
        'محرك ديزل TATA 697 TCIC، تبريد بالماء، حقن مباشر',
        'فرامل هوائية كاملة من نوع S-cam',
        'نوابض نصف بيضاوية متعددة الأوراق',
        'ناقل حركة GBS 40 سنكروميش',
        'القدرة على التسلق (Gradeability)'
      ]
    },
    {
      title: 'ULTRA T.7',
      description: 'وجّه نجاح أعمالك مع Tata Ultra T.7 مدعومة بمحرك NG3.3L CR EIV المجرب، تولد قوة قدرها 155 حصان عند 2600 دورة/دقيقة، وعزم دوران يبلغ 450 نيوتن.متر، ما يضمن أداءً استثنائيًا في عمليات النقل والخدمات اللوجستية.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 580000,
      stockNumber: 'ULTRA-T7-001',
      specifications: {
        "موديل المحرك": "NG3.3L CR EIV",
        "نوع المحرك": "اشتعال الضغط، EURO-4",
        "نوع الجسم": "مقصورة وهيكل قاعدي",
        "سعة المحرك": "3300 سي سي",
        "أقصى خرج للمحرك": "155 Ps @ 2600 rpm",
        "عدد الاسطوانات": "4 مضمنة",
        "السرعة القصوى": "105 كم في الساعة",
        "انبعاث": "EuroIV",
        "أقصى عزم الدوران": "450 نيوتن متر عند 2200-1500 دورة في الدقيقة",
        "علبة التروس": "Tata G550 متزامن",
        "الإطارات": "215/75R 17.5",
        "الوزن الإجمالي المسموح به": "6450 kg",
        "سعة خزان الوقود": "90 L"
      },
      images: [
        '/uploads/vehicles/ULTRA-T.7-1.jpg',
        '/uploads/vehicles/ultra-t7-1.jpg'
      ],
      highlights: ['155 حصان', '450 نيوتن.متر', '215/75 R17.5', '90 لتر'],
      features: [
        'محرك NG سعة 3.3 لتر، سكة حديد مشتركة، TCIC Euro-IV',
        'عزم دوران عالي يصل إلى 450 نيوتن متر',
        'فرامل S-cam هوائية كاملة الدائرة مزدوجة مع نظام فرامل مانع للانغلاق',
        'علبة تروس متزامن Tata G550 (6F+1R)',
        'زنبرك ورقي مكافئ وشبه بيضاوي'
      ]
    },
    {
      title: 'ULTRA T.9',
      description: 'تخطَّ أصعب المهام مع الاعتمادية العالية لشاحنة Tata Ultra T.9، المصممة لرحلات لا تتوقف وسرعة دوران أعلى. مزوّدة بمحرك 3.3L NG Common Rail TCIC يولّد 155 حصان عند 2600 دورة/دقيقة، مع 450 نيوتن.متر من عزم الدوران لتحقيق أداء عالي في مختلف العمليات.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 680000,
      stockNumber: 'ULTRA-T9-001',
      specifications: {
        "موديل المحرك": "NG3.3L CR EIV",
        "نوع المحرك": "EURO- 4",
        "نوع الجسم": "مقصورة وهيكل قاعدي",
        "سعة المحرك": "3300 سي سي",
        "أقصى خرج للمحرك": "155 Ps عند 2600 دورة في الدقيقة",
        "عدد الاسطوانات": "4 مضمنة",
        "السرعة القصوى": "105 كم في الساعة",
        "انبعاث": "EuroIV",
        "أقصى عزم الدوران": "450 نيوتن متر عند 2200-1500 دورة في الدقيقة",
        "علبة التروس": "Tata G550 متزامن",
        "الإطارات": "215/75R 17.5",
        "الوزن الإجمالي المسموح به": "8990 kg",
        "سعة خزان الوقود": "120 L"
      },
      images: [
        '/uploads/vehicles/ULTRA-T.9-1.jpg',
        '/uploads/vehicles/ultra-t9-1.jpg'
      ],
      highlights: ['155 حصان', '450 نيوتن.متر', '215/75 R17.5', '120 لتر'],
      features: [
        'محرك NG سعة 3.3 لتر، سكة حديد مشتركة، TCIC Euro-IV',
        'High Torque of 450Nm @ 1500-2000 rpm',
        'فرامل S-cam هوائية كاملة الدائرة مزدوجة مع نظام فرامل مانع للانغلاق',
        'صندوق تروس متزامن Tata G550 (6F+1R)',
        'زنبرك ورقي مكافئ وشبه بيضاوي'
      ]
    },
    {
      title: 'XENON SC',
      description: 'يجمع تاتا زينون X2 SC بين القوة والمتانة، ما يوفّر أداءً معززًا ويساهم في زيادة الأرباح. مدعوم بمحرك تاتا 2.2 لتر DICOR يورو IV، ديزل، حقن مباشر، سكة وقود مشتركة، مزود بشاحن توربيني ومبرد داخلي، يولد 150 حصان عند 4000 دورة/دقيقة وعزم دوران أقصى يبلغ 320 نيوتن.متر.',
      category: 'PICKUP',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 420000,
      stockNumber: 'XENON-SC-001',
      specifications: {
        "موديل المحرك": "محرك ديزل TATA 2.2L DICOR Euro IV بالحقن المباشر للسكك الحديدية المشتركة بشاحن توربيني",
        "سعة المحرك": "2179",
        "قوة المحرك": "320 نيوتن متر @ 1500-3000 دورة في الدقيقة",
        "أقصى خرج للمحرك": "150 حصان عند 4000 دورة في الدقيقة",
        "عدد الاسطوانات": "4 مضمنة",
        "السرعة القصوى": "160 كم/ساعة",
        "انبعاث": "E4",
        "أقصى عزم الدوران": "320 نيوتن متر @ 1500-3000 دورة في الدقيقة",
        "علبة التروس": "GBS -76-5/4.10 - علبة تروس MK - II مع زيادة السرعة",
        "الإطارات": "235/70 R16 إطارات بدون أنابيب",
        "الوزن الإجمالي المسموح به": "3100",
        "سعة خزان الوقود": "70 لتر"
      },
      images: [
        '/uploads/vehicles/XENON-SC-1.jpg',
        '/uploads/vehicles/xenon-sc-2.jpg'
      ],
      highlights: ['41%', '1280 كجم', '70 لتر', '320 نيوتن.متر'],
      features: [
        'الطاقة والالتقاط',
        'محرك 2179cc',
        'قابلية عالية للتصنيف',
        'التوجيه بمساعدة الطاقة الكهربائية'
      ]
    }
  ]

  for (const vehicleData of vehiclesData) {
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Tata Motors',
        model: vehicleData.title,
        year: 2024,
        price: vehicleData.price,
        stockNumber: vehicleData.stockNumber,
        description: vehicleData.description,
        category: vehicleData.category as any,
        fuelType: vehicleData.fuelType as any,
        transmission: vehicleData.transmission as any,
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch.id
      }
    })

    // Create vehicle images
    for (let i = 0; i < vehicleData.images.length; i++) {
      await prisma.vehicleImage.create({
        data: {
          vehicleId: vehicle.id,
          imageUrl: vehicleData.images[i],
          altText: `${vehicleData.title} - صورة ${i + 1}`,
          isPrimary: i === 0,
          order: i
        }
      })
    }

    // Create vehicle specifications
    for (const [key, value] of Object.entries(vehicleData.specifications)) {
      await prisma.vehicleSpecification.create({
        data: {
          vehicleId: vehicle.id,
          key: key,
          label: key,
          value: value as string,
          category: 'ENGINE'
        }
      })
    }

    // Create vehicle pricing
    await prisma.vehiclePricing.create({
      data: {
        vehicleId: vehicle.id,
        basePrice: vehicleData.price,
        totalPrice: vehicleData.price,
        currency: 'EGP',
        hasDiscount: false
      }
    })
  }

  // 7. Create Sliders
  console.log('🖼️ Creating sliders...')
  await prisma.slider.createMany({
    data: [
      {
        title: 'PRIMA 3328.K',
        subtitle: 'القوة والموثوقية في شاحنة واحدة',
        description: 'شاحنة قوية صُممت للتعامل مع أصعب المهام',
        imageUrl: '/uploads/vehicles/prima-3328k-1.jpg',
        ctaText: 'استعرض الآن',
        ctaLink: '/vehicles',
        isActive: true,
        order: 1
      },
      {
        title: 'ULTRA T.9',
        subtitle: 'الأداء المتطور للنقل الخفيف',
        description: 'تخطَّ أصعب المهام مع الاعتمادية العالية',
        imageUrl: '/uploads/vehicles/ULTRA-T.9-1.jpg',
        ctaText: 'اكتشف المزيد',
        ctaLink: '/vehicles',
        isActive: true,
        order: 2
      },
      {
        title: 'XENON SC',
        subtitle: 'البيك أب القوي والمتين',
        description: 'يجمع بين القوة والمتانة',
        imageUrl: '/uploads/vehicles/XENON-SC-1.jpg',
        ctaText: 'تفاصيل السيارة',
        ctaLink: '/vehicles',
        isActive: true,
        order: 3
      },
      {
        title: 'خدمة 24 ساعة',
        subtitle: 'دعم فني على مدار الساعة',
        description: 'خدمة طوارئ سريعة وموثوقة',
        imageUrl: '/uploads/showroom-luxury.jpg',
        ctaText: 'اتصل بنا',
        ctaLink: '/contact',
        isActive: true,
        order: 4
      }
    ]
  })

  // 8. Create Service Types
  console.log('🔧 Creating service types...')
  await prisma.serviceType.createMany({
    data: [
      {
        name: 'صيانة دورية',
        description: 'صيانة دورية شاملة للمركبات التجارية',
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
        name: 'فحص فرامل',
        description: 'فحص وصيانة نظام الفرامل',
        duration: 90,
        price: 300,
        category: 'REPAIR'
      },
      {
        name: 'تغيير إطارات',
        description: 'تغيير وترصيص الإطارات',
        duration: 45,
        price: 150,
        category: 'REPAIR'
      },
      {
        name: 'فحص شامل',
        description: 'فحص شامل للمركبة قبل السفر',
        duration: 180,
        price: 800,
        category: 'INSPECTION'
      }
    ]
  })

  // 9. Create Header and Footer Content
  console.log('📄 Creating header and footer content...')
  
  await prisma.headerContent.create({
    data: {
      logoUrl: '/uploads/logo/elhamd-logo.png',
      logoText: 'شركة الحمد لاستيراد السيارات',
      tagline: 'الموزع المعتمد لسيارات تاتا في مدن القناة',
      primaryPhone: '+20 2 12345678',
      primaryEmail: 'info@elhamdimport.online',
      address: 'القنطرة غرب، الإسماعيلية، مصر',
      workingHours: 'السبت - الخميس: 9:00 ص - 5:00 م، الجمعة: مغلق',
      ctaButton: {
        text: 'احجز الآن',
        link: '/contact'
      }
    }
  })

  await prisma.footerContent.create({
    data: {
      logoUrl: '/uploads/logo/elhamd-logo.png',
      logoText: 'شركة الحمد لاستيراد السيارات',
      tagline: 'الموزع المعتمد لسيارات تاتا في مدن القناة - متخصصون في السيارات التجارية والبيك أب والشاحنات',
      primaryPhone: '+20 2 12345678',
      secondaryPhone: '+20 1012345678',
      primaryEmail: 'info@elhamdimport.online',
      address: 'القنطرة غرب، الجيزة، مصر',
      workingHours: 'السبت - الخميس: 9:00 ص - 5:00 م، الجمعة: مغلق',
      copyrightText: '© 2024 شركة الحمد لاستيراد السيارات. جميع الحقوق محفوظة.',
      newsletterText: 'اشترك في نشرتنا البريدية للحصول على آخر الأخبار والعروض',
      backToTopText: 'العودة للأعلى'
    }
  })

  console.log('✅ Comprehensive database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`- Vehicles: ${vehiclesData.length}`)
  console.log('- Users: 8')
  console.log('- Role Templates: 8')
  console.log('- Permissions: 32')
  console.log('- Service Types: 5')
  console.log('- Sliders: 4')
  console.log('- All emails updated to use @elhamdimport.online domain')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })