import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')

  // Clean existing data
  await cleanDatabase()
  console.log('🧹 Cleaned existing data')

  // Seed data in order of dependencies
  await seedPermissions()
  await seedRoleTemplates()
  await seedBranches()
  await seedUsers()
  await seedUserPermissions()
  await seedCompanyInfo()
  await seedSiteSettings()
  await seedHeaderContent()
  await seedFooterContent()
  await seedSliders()
  await seedServiceItems()
  await seedCompanyStats()
  await seedCompanyValues()
  await seedCompanyFeatures()
  await seedTimelineEvents()
  await seedContactInfo()
  await seedVehicles()
  await seedVehicleImages()
  await seedVehicleSpecifications()
  await seedVehiclePricing()
  await seedServiceTypes()
  await seedTimeSlots()
  await seedHolidays()
  await seedTestDriveBookings()
  await seedServiceBookings()
  await seedCustomers()
  await seedEmployees()
  await seedInvoices()
  await seedQuotations()
  await seedNotifications()
  await seedTasks()
  await seedActivityLogs()
  await seedSecurityLogs()
  await seedMedia()
  await seedPopupConfigs()
  await seedMarketingCampaigns()
  await seedSupportTickets()
  await seedMaintenanceRecords()
  await seedInsurancePolicies()

  console.log('✅ Comprehensive database seeding completed successfully!')
}

async function cleanDatabase() {
  // Delete in reverse order of dependencies
  const models = [
    'securityLog', 'notification', 'activityLog', 'taskComment', 'task',
    'popupConfig', 'media', 'supportTicket', 'ticketComment', 'ticketTimeline',
    'maintenanceRecord', 'maintenanceReminder', 'maintenanceSchedule', 'maintenancePart',
    'insurancePayment', 'insuranceClaim', 'insurancePolicy', 'insuranceCompany',
    'quotationItem', 'quotation', 'invoicePayment', 'invoiceTax', 'invoiceItem', 'invoice',
    'customerProfile', 'customerInteraction', 'customerFeedback',
    'serviceBooking', 'testDriveBooking', 'timeSlot', 'holiday',
    'vehiclePricing', 'vehicleSpecification', 'vehicleImage', 'vehicle',
    'serviceType', 'serviceItem',
    'companyFeature', 'companyValue', 'companyStat', 'timelineEvent', 'contactInfo', 'companyInfo',
    'slider', 'footerSocial', 'footerColumn', 'footerContent', 'headerSocial', 'headerNavigation', 'headerContent', 'siteSettings',
    'employee', 'customer', 'userPermission', 'user',
    'branch', 'roleTemplatePermission', 'roleTemplate', 'permission'
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

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const users = [
    {
      email: 'admin@elhamdimports.com',
      password: hashedPassword,
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
      password: hashedPassword,
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
      password: hashedPassword,
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
}

async function seedHeaderContent() {
  console.log('📱 Seeding header content...')

  const headerContent = {
    logo: '/uploads/logo/alhamd-cars-logo.png',
    title: 'الحمد للسيارات',
    navigation: [
      { label: 'الرئيسية', href: '/', order: 1 },
      { label: 'السيارات', href: '/vehicles', order: 2 },
      { label: 'عن الشركة', href: '/about', order: 3 },
      { label: 'الخدمات', href: '/service-booking', order: 4 },
      { label: 'اتصل بنا', href: '/contact', order: 5 }
    ],
    ctaButtons: [
      { text: 'طلب قيادة تجريبية', href: '/test-drive', variant: 'primary' },
      { text: 'تواصل معنا', href: '/contact', variant: 'secondary' }
    ],
    isActive: true
  }

  await prisma.headerContent.upsert({
    where: { id: 'default' },
    update: headerContent,
    create: { id: 'default', ...headerContent },
  })
}

async function seedFooterContent() {
  console.log('📄 Seeding footer content...')

  const footerContent = {
    description: 'الحمد للسيارات - الوكيل المعتمد لسيارات تاتا في مصر. نقدم أحدث الموديلات مع ضمان الجودة وخدمة ما بعد البيع المتميزة.',
    quickLinks: [
      { label: 'الرئيسية', href: '/' },
      { label: 'السيارات', href: '/vehicles' },
      { label: 'عن الشركة', href: '/about' },
      { label: 'الخدمات', href: '/service-booking' },
      { label: 'اتصل بنا', href: '/contact' }
    ],
    services: [
      { label: 'صيانة سيارات تاتا', href: '/service-booking' },
      { label: 'قطع غيار أصلية', href: '/parts' },
      { label: 'ضمان المصنع', href: '/warranty' },
      { label: 'تمويل السيارات', href: '/financing' }
    ],
    contactInfo: {
      address: 'شارع التحرير، وسط القاهرة',
      phone: '+20 2 2345 6789',
      email: 'info@elhamdimports.com',
      workingHours: 'الأحد - الخميس: 9:00 ص - 9:00 م'
    },
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com/elhamdcars', icon: 'facebook' },
      { platform: 'twitter', url: 'https://twitter.com/elhamdcars', icon: 'twitter' },
      { platform: 'instagram', url: 'https://instagram.com/elhamdcars', icon: 'instagram' },
      { platform: 'youtube', url: 'https://youtube.com/elhamdcars', icon: 'youtube' }
    ],
    copyright: '© 2024 الحمد للسيارات. جميع الحقوق محفوظة.',
    isActive: true
  }

  await prisma.footerContent.upsert({
    where: { id: 'default' },
    update: footerContent,
    create: { id: 'default', ...footerContent },
  })
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
      ctaLink: '/vehicles/nexon',
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
      ctaLink: '/vehicles/punch',
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
}

async function seedServiceItems() {
  console.log('🔧 Seeding service items...')

  const services = [
    {
      title: 'صيانة دورية',
      description: 'صيانة شاملة لسيارتك مع استخدام قطع غيار أصلية',
      icon: 'wrench',
      image: '/uploads/thumbnails/service-1_thumbnail.webp',
      features: ['تغيير زيت المحرك', 'فحص الفرامل', 'فحص الإطارات', 'فحص البطارية'],
      duration: '2-3 ساعات',
      price: 500,
      isActive: true,
      order: 1
    },
    {
      title: 'إصلاح المحركات',
      description: 'إصلاح متخصص لمحركات تاتا بفنيين مدربين',
      icon: 'settings',
      image: '/uploads/thumbnails/service-2_thumbnail.webp',
      features: ['تشخيص دقيق', 'إصلاح مضمون', 'قطع غيار أصلية', 'ضمان 6 أشهر'],
      duration: 'يوم واحد',
      price: 2000,
      isActive: true,
      order: 2
    },
    {
      title: 'تنظيف وتلميع',
      description: 'تنظيف شامل للسيارة داخلياً وخارجياً',
      icon: 'sparkles',
      image: '/uploads/thumbnails/service-3_thumbnail.webp',
      features: ['غسيل خارجي', 'تنظيف داخلي', 'تلميع', 'تعطير'],
      duration: '3-4 ساعات',
      price: 300,
      isActive: true,
      order: 3
    },
    {
      title: 'فحص ما قبل الشراء',
      description: 'فحص شامل للسيارات المستعملة قبل الشراء',
      icon: 'search',
      image: '/uploads/thumbnails/service-4_thumbnail.webp',
      features: ['فحص الميكانيكا', 'فحص الهيكل', 'فحص الإلكترونيات', 'تقرير مفصل'],
      duration: 'ساعة واحدة',
      price: 200,
      isActive: true,
      order: 4
    }
  ]

  for (const service of services) {
    await prisma.serviceItem.create({ data: service })
  }
}

async function seedCompanyStats() {
  console.log('📊 Seeding company stats...')

  const stats = [
    { label: 'سنة خبرة', number: '25+', description: 'خبرة في سوق السيارات المصري' },
    { label: 'سيارة مبيعة', number: '10000+', description: 'سيارة تاتا مباعة' },
    { label: 'عميل سعيد', number: '15000+', description: 'عميل راضٍ عن خدماتنا' },
    { label: 'فرع', number: '3', description: 'فروع في جميع أنحاء مصر' },
    { label: 'فني محترف', number: '50+', description: 'فني مدرب على سيارات تاتا' },
    { label: 'سيارة في العرض', number: '100+', description: 'سيارة جديدة ومستعملة' }
  ]

  for (const stat of stats) {
    await prisma.companyStat.create({ data: stat })
  }
}

async function seedCompanyValues() {
  console.log('💎 Seeding company values...')

  const values = [
    {
      title: 'الجودة',
      description: 'نلتزم بأعلى معايير الجودة في كل ما نقدمه',
      icon: 'award',
      order: 1
    },
    {
      title: 'الثقة',
      description: 'نبني علاقات طويلة الأمد مبنية على الثقة والشفافية',
      icon: 'shield',
      order: 2
    },
    {
      title: 'الابتكار',
      description: 'نسعى دائماً لتقديم أحدث الحلول والتقنيات',
      icon: 'lightbulb',
      order: 3
    },
    {
      title: 'العميل أولاً',
      description: 'رضا العملاء هو أولويتنا القصوى',
      icon: 'heart',
      order: 4
    }
  ]

  for (const value of values) {
    await prisma.companyValue.create({ data: value })
  }
}

async function seedCompanyFeatures() {
  console.log('⭐ Seeding company features...')

  const features = [
    {
      title: 'ضمان المصنع الكامل',
      description: 'جميع سياراتنا تأتي مع ضمان المصنع الكامل',
      icon: 'shield-check',
      order: 1
    },
    {
      title: 'خدمة 24/7',
      description: 'خدمة طوارئ على مدار الساعة طوال أيام الأسبوع',
      icon: 'phone',
      order: 2
    },
    {
      title: 'تمويل معتمد',
      description: 'شركات تمويل معتمدة مع أفضل الفوائد',
      icon: 'credit-card',
      order: 3
    },
    {
      title: 'قطع غيار أصلية',
      description: 'نستخدم فقط قطع الغيار الأصلية المعتمدة',
      icon: 'package',
      order: 4
    },
    {
      title: 'فنيون مدربون',
      description: 'فنيون محترفون مدربون من تاتا',
      icon: 'users',
      order: 5
    },
    {
      title: 'أسعار تنافسية',
      description: 'أفضل الأسعار في السوق المصري',
      icon: 'tag',
      order: 6
    }
  ]

  for (const feature of features) {
    await prisma.companyFeature.create({ data: feature })
  }
}

async function seedTimelineEvents() {
  console.log('📅 Seeding timeline events...')

  const events = [
    {
      year: '1999',
      title: 'تأسيس الشركة',
      description: 'تأسست الحمد للسيارات كواحدة من أول الوكلاء المعتمدين لسيارات تاتا في مصر',
      order: 1
    },
    {
      year: '2005',
      title: 'التوسع في القاهرة',
      description: 'افتتاح الفرع الرئيسي في قلب القاهرة',
      order: 2
    },
    {
      year: '2010',
      title: 'الجودة الذهبية',
      description: 'حصولنا على شهادة الجودة الذهبية من تاتا',
      order: 3
    },
    {
      year: '2015',
      title: 'التوسع في الإسكندرية',
      description: 'افتتاح فرع الإسكندرية لتغطية الساحل الشمالي',
      order: 4
    },
    {
      year: '2020',
      title: 'الرقمنة',
      description: 'تحويل جميع خدماتنا إلى منصات رقمية متطورة',
      order: 5
    },
    {
      year: '2024',
      title: 'الريادة',
      description: 'أكبر وكلاء تاتا في مصر بأكثر من 10000 سيارة مبيعة',
      order: 6
    }
  ]

  for (const event of events) {
    await prisma.timelineEvent.create({ data: event })
  }
}

async function seedContactInfo() {
  console.log('📞 Seeding contact info...')

  const contactInfo = {
    headquarters: {
      address: 'شارع التحرير، وسط القاهرة',
      phone: '+20 2 2345 6789',
      email: 'info@elhamdimports.com',
      mapUrl: 'https://maps.google.com/?q=Elhamd+Cars+Cairo'
    },
    branches: [
      {
        name: 'فرع الإسكندرية',
        address: 'شارع سعد زغلول، وسط الإسكندرية',
        phone: '+20 3 4567 8901',
        email: 'alex@elhamdimports.com'
      },
      {
        name: 'فرع الجيزة',
        address: 'ميدان المحطة، الجيزة',
        phone: '+20 2 3456 7890',
        email: 'giza@elhamdimports.com'
      }
    ],
    workingHours: {
      weekdays: 'الأحد - الخميس: 9:00 ص - 9:00 م',
      friday: 'الجمعة: 2:00 م - 8:00 م',
      saturday: 'السبت: 10:00 ص - 6:00 م'
    },
    emergency: {
      phone: '+20 10 9999 8888',
      description: 'خدمة طوارئ 24/7'
    },
    socialMedia: {
      facebook: 'https://facebook.com/elhamdcars',
      twitter: 'https://twitter.com/elhamdcars',
      instagram: 'https://instagram.com/elhamdcars',
      youtube: 'https://youtube.com/elhamdcars',
      whatsapp: '+20 10 1234 5678'
    }
  }

  await prisma.contactInfo.upsert({
    where: { id: 'default' },
    update: contactInfo,
    create: { id: 'default', ...contactInfo },
  })
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
      description: 'سيارة SUV عائلية عصرية مع ميزات أمان متقدمة وتصميم رياضي أنيق',
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
      description: 'سيارة SUV مدمجة مثالية للقيادة في المدينة بتصميم شبابي',
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
      description: 'سيارة هاتشباك اقتصادية مع استهلاك وقود ممتاز وتصميم عصري',
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
      description: 'سيارة هاتشباك Premium مع تصميم عصري وميزات فاخرة',
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
      description: 'سيارة SUV فاخرة بمحرك قوي وتصميم أنيق ومساحة واسعة',
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
      description: 'سيارة SUV عائلية كبيرة بـ 7 مقاعد وميزات أمان متقدمة',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'فضي',
      status: 'SOLD',
      featured: false,
      branchId: branches[2]?.id,
    },
    {
      make: 'TATA',
      model: 'Tiago EV',
      year: 2024,
      price: 420000,
      stockNumber: 'TTE-2024-007',
      vin: 'MAT62543798765438',
      description: 'سيارة كهربائية صديقة للبيئة بمدى 300 كم',
      category: 'SUV',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أخضر',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[0]?.id,
    },
    {
      make: 'TATA',
      model: 'Nexon EV',
      year: 2024,
      price: 580000,
      stockNumber: 'TNX-2024-008',
      vin: 'MAT62543798765439',
      description: 'سيارة SUV كهربائية بتقنية متطورة وأداء ممتاز',
      category: 'SUV',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أزرق',
      status: 'AVAILABLE',
      featured: true,
      branchId: branches[1]?.id,
    }
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

  const imageMap = {
    'Nexon': ['/uploads/vehicles/1/nexon-front.jpg', '/uploads/vehicles/1/nexon-side.jpg', '/uploads/vehicles/1/nexon-front-new.jpg'],
    'Punch': ['/uploads/vehicles/2/punch-front.jpg', '/uploads/vehicles/2/punch-front-new.jpg'],
    'Tiago': ['/uploads/vehicles/3/tiago-front.jpg', '/uploads/vehicles/3/tiago-front-new.jpg'],
    'Altroz': ['/uploads/vehicles/6/altroz-front.jpg'],
    'Harrier': ['/uploads/vehicles/5/harrier-front.jpg', '/uploads/vehicles/tata-harrier-1.jpg', '/uploads/vehicles/tata-harrier-2.jpg'],
    'Safari': ['/uploads/vehicles/tata-safari-1.jpg', '/uploads/vehicles/tata-safari-2.jpg'],
    'Tiago EV': ['/uploads/vehicles/tige2024001/tiago-ev-front.jpg'],
    'Nexon EV': ['/uploads/vehicles/nxz2024001/nexon-ev-front.jpg']
  }

  for (const vehicle of vehicles) {
    const images = imageMap[vehicle.model] || []
    
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

  const specMap = {
    'Nexon': [
      { key: 'engine', label: 'المحرك', value: '1.2L Turbocharged', category: 'ENGINE' },
      { key: 'power', label: 'القدرة الحصانية', value: '120 HP', category: 'ENGINE' },
      { key: 'torque', label: 'عزم الدوران', value: '170 Nm', category: 'ENGINE' },
      { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '44 لتر', category: 'ENGINE' }
    ],
    'Punch': [
      { key: 'engine', label: 'المحرك', value: '1.2L Naturally Aspirated', category: 'ENGINE' },
      { key: 'power', label: 'القدرة الحصانية', value: '86 HP', category: 'ENGINE' },
      { key: 'torque', label: 'عزم الدوران', value: '113 Nm', category: 'ENGINE' },
      { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '37 لتر', category: 'ENGINE' }
    ],
    'Tiago': [
      { key: 'engine', label: 'المحرك', value: '1.2L Revotron', category: 'ENGINE' },
      { key: 'power', label: 'القدرة الحصانية', value: '86 HP', category: 'ENGINE' },
      { key: 'torque', label: 'عزم الدوران', value: '113 Nm', category: 'ENGINE' },
      { key: 'fuel_tank', label: 'سعة خزان الوقود', value: '35 لتر', category: 'ENGINE' }
    ]
  }

  const commonSpecs = [
    { key: 'doors', label: 'عدد الأبواب', value: '4', category: 'EXTERIOR' },
    { key: 'seats', label: 'عدد المقاعد', value: '5', category: 'INTERIOR' },
    { key: 'airbags', label: 'وسائد هوائية', value: '2', category: 'SAFETY' },
    { key: 'abs', label: 'نظام ABS', value: 'متوفر', category: 'SAFETY' },
    { key: 'touchscreen', label: 'شاشة لمس', value: '7 بوصة', category: 'TECHNOLOGY' },
    { key: 'bluetooth', label: 'بلوتوث', value: 'متوفر', category: 'TECHNOLOGY' },
    { key: 'ac', label: 'تكييف', value: 'أوتوماتيك', category: 'COMFORT' },
    { key: 'power_windows', label: 'نوافذ كهربائية', value: 'الأربعة', category: 'COMFORT' }
  ]

  for (const vehicle of vehicles) {
    const vehicleSpecs = specMap[vehicle.model] || []
    const allSpecs = [...vehicleSpecs, ...commonSpecs]
    
    for (const spec of allSpecs) {
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

  const serviceTypes = [
    {
      name: 'صيانة دورية',
      description: 'صيانة دورية شاملة للسيارة',
      duration: 120,
      price: 500,
      category: 'MAINTENANCE',
      isActive: true
    },
    {
      name: 'تغيير زيت',
      description: 'تغيير زيت المحرك والفلتر',
      duration: 30,
      price: 150,
      category: 'MAINTENANCE',
      isActive: true
    },
    {
      name: 'فحص شامل',
      description: 'فحص شامل لكافة أنظمة السيارة',
      duration: 60,
      price: 200,
      category: 'INSPECTION',
      isActive: true
    },
    {
      name: 'إصلاح مكابح',
      description: 'إصلاح وصيانة نظام الفرامل',
      duration: 90,
      price: 800,
      category: 'REPAIR',
      isActive: true
    },
    {
      name: 'تكييف هواء',
      description: 'صيانة وإصلاح نظام التكييف',
      duration: 120,
      price: 600,
      category: 'REPAIR',
      isActive: true
    }
  ]

  for (const serviceType of serviceTypes) {
    await prisma.serviceType.create({ data: serviceType })
  }
}

async function seedTimeSlots() {
  console.log('⏰ Seeding time slots...')

  const timeSlots = []
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  for (const day of weekDays) {
    for (const time of times) {
      timeSlots.push({
        dayOfWeek: day,
        startTime: time,
        endTime: `${parseInt(time) + 1}:00`,
        isAvailable: true,
        maxBookings: 3
      })
    }
  }

  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot })
  }
}

async function seedHolidays() {
  console.log('🎉 Seeding holidays...')

  const holidays = [
    {
      name: 'عيد الفطر',
      date: new Date('2024-04-10'),
      description: 'عطلة عيد الفطر المبارك',
      isRecurring: true
    },
    {
      name: 'عيد الأضحى',
      date: new Date('2024-06-17'),
      description: 'عطلة عيد الأضحى المبارك',
      isRecurring: true
    },
    {
      name: 'رأس السنة الهجرية',
      date: new Date('2024-07-07'),
      description: 'رأس السنة الهجرية',
      isRecurring: true
    },
    {
      name: 'عيد الميلاد المجيد',
      date: new Date('2024-12-25'),
      description: 'عيد الميلاد المجيد',
      isRecurring: true
    }
  ]

  for (const holiday of holidays) {
    await prisma.holiday.create({ data: holiday })
  }
}

async function seedTestDriveBookings() {
  console.log('🚗 Seeding test drive bookings...')

  const vehicles = await prisma.vehicle.findMany({ where: { status: 'AVAILABLE' } })
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const timeSlots = await prisma.timeSlot.findMany({ take: 10 })

  for (let i = 0; i < 5; i++) {
    const vehicle = vehicles[i % vehicles.length]
    const customer = customers[i % customers.length]
    const slot = timeSlots[i % timeSlots.length]

    await prisma.testDriveBooking.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        timeSlot: slot.startTime,
        status: i < 3 ? 'CONFIRMED' : 'PENDING',
        notes: `اختبار قيادة لسيارة ${vehicle.make} ${vehicle.model}`
      }
    })
  }
}

async function seedServiceBookings() {
  console.log('🔧 Seeding service bookings...')

  const vehicles = await prisma.vehicle.findMany({ take: 5 })
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const serviceTypes = await prisma.serviceType.findMany()
  const timeSlots = await prisma.timeSlot.findMany({ take: 10 })

  for (let i = 0; i < 8; i++) {
    const customer = customers[i % customers.length]
    const serviceType = serviceTypes[i % serviceTypes.length]
    const slot = timeSlots[i % timeSlots.length]
    const vehicle = vehicles[i % vehicles.length]

    await prisma.serviceBooking.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceTypeId: serviceType.id,
        timeSlotId: slot.id,
        date: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),
        timeSlot: slot.startTime,
        status: i < 5 ? 'CONFIRMED' : 'PENDING',
        totalPrice: serviceType.price,
        paymentStatus: 'PENDING',
        notes: `حجز ${serviceType.name} للسيارة ${vehicle.make} ${vehicle.model}`
      }
    })
  }
}

async function seedCustomers() {
  console.log('👥 Seeding customer profiles...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })

  for (const customer of customers) {
    await prisma.customerProfile.create({
      data: {
        userId: customer.id,
        dateOfBirth: new Date('1990-01-01'),
        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
        nationalId: '12345678901234',
        address: 'القاهرة، مصر',
        city: 'القاهرة',
        country: 'مصر',
        postalCode: '12345',
        preferredContactMethod: 'PHONE',
        interests: ['SUV', 'SEDAN'],
        budget: 500000,
        preferredBrands: ['TATA'],
        notes: 'عميل مهتم بالسيارات العائلية'
      }
    })
  }
}

async function seedEmployees() {
  console.log('👨‍💼 Seeding employees...')

  const staffUsers = await prisma.user.findMany({ where: { role: { in: ['STAFF', 'BRANCH_MANAGER'] } } })

  for (const user of staffUsers) {
    await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId: `EMP${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        department: user.role === 'BRANCH_MANAGER' ? 'MANAGEMENT' : 'SALES',
        position: user.role === 'BRANCH_MANAGER' ? 'مدير فرع' : 'مندوب مبيعات',
        hireDate: new Date('2020-01-01'),
        salary: user.role === 'BRANCH_MANAGER' ? 15000 : 8000,
        workSchedule: JSON.stringify({
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          hours: { start: '09:00', end: '18:00' }
        }),
        skills: ['Sales', 'Customer Service', 'Product Knowledge'],
        certifications: ['TATA Product Training'],
        performanceRating: 4.5,
        isActive: true
      }
    })
  }
}

async function seedInvoices() {
  console.log('🧾 Seeding invoices...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ where: { status: 'SOLD' } })

  for (let i = 0; i < 3; i++) {
    const customer = customers[i % customers.length]
    const vehicle = vehicles[i % vehicles.length] || vehicles[0]

    await prisma.invoice.create({
      data: {
        customerId: customer.id,
        invoiceNumber: `INV${String(1000 + i).padStart(6, '0')}`,
        issueDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + (30 - i) * 24 * 60 * 60 * 1000),
        subtotal: vehicle.price,
        taxAmount: vehicle.price * 0.14,
        totalAmount: vehicle.price * 1.14,
        status: i === 0 ? 'PAID' : 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        notes: `فاتورة بيع سيارة ${vehicle.make} ${vehicle.model}`
      }
    })
  }
}

async function seedQuotations() {
  console.log('💰 Seeding quotations...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ where: { status: 'AVAILABLE' } })

  for (let i = 0; i < 5; i++) {
    const customer = customers[i % customers.length]
    const vehicle = vehicles[i % vehicles.length]

    await prisma.quotation.create({
      data: {
        customerId: customer.id,
        quotationNumber: `QUO${String(2000 + i).padStart(6, '0')}`,
        issueDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + (7 - i) * 24 * 60 * 60 * 1000),
        subtotal: vehicle.price,
        discountAmount: vehicle.price * 0.05,
        taxAmount: (vehicle.price * 0.95) * 0.14,
        totalAmount: (vehicle.price * 0.95) * 1.14,
        status: i < 3 ? 'ACCEPTED' : 'PENDING',
        notes: `عرض سعر لسيارة ${vehicle.make} ${vehicle.model}`
      }
    })
  }
}

async function seedNotifications() {
  console.log('🔔 Seeding notifications...')

  const users = await prisma.user.findMany()

  const notifications = [
    {
      title: 'ترحيب',
      message: 'مرحباً بك في الحمد للسيارات',
      type: 'INFO',
      category: 'SYSTEM'
    },
    {
      title: 'تذكير بالصيانة',
      message: 'حان موعد الصيانة الدورية لسيارتك',
      type: 'REMINDER',
      category: 'MAINTENANCE'
    },
    {
      title: 'عرض خاص',
      message: 'استفد من العروض الحصرية على سيارات تاتا',
      type: 'PROMOTION',
      category: 'MARKETING'
    }
  ]

  for (const user of users) {
    for (let i = 0; i < notifications.length; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          ...notifications[i],
          isRead: i === 0,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        }
      })
    }
  }
}

async function seedTasks() {
  console.log('📋 Seeding tasks...')

  const staffUsers = await prisma.user.findMany({ where: { role: { in: ['STAFF', 'BRANCH_MANAGER'] } } })

  const tasks = [
    {
      title: 'متابعة العملاء',
      description: 'الاتصال بالعملاء الجدد للاستفسار عن الخدمة',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'تحديث معرض السيارات',
      description: 'تحديث أسعار ومواصفات السيارات المعروضة',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'تجهيز سيارة للتسليم',
      description: 'تنظيف وفحص السيارة قبل تسليمها للعميل',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  ]

  for (const user of staffUsers) {
    for (let i = 0; i < tasks.length; i++) {
      await prisma.task.create({
        data: {
          assignedUserId: user.id,
          createdById: staffUsers[0].id,
          ...tasks[i]
        }
      })
    }
  }
}

async function seedActivityLogs() {
  console.log('📝 Seeding activity logs...')

  const users = await prisma.user.findMany()

  const activities = [
    {
      action: 'LOGIN',
      description: 'تسجيل الدخول إلى النظام',
      category: 'AUTHENTICATION'
    },
    {
      action: 'VIEW_VEHICLES',
      description: 'عرض قائمة السيارات',
      category: 'VEHICLE_MANAGEMENT'
    },
    {
      action: 'CREATE_BOOKING',
      description: 'إنشاء حجز جديد',
      category: 'BOOKING_MANAGEMENT'
    }
  ]

  for (const user of users) {
    for (let i = 0; i < activities.length; i++) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          ...activities[i],
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: new Date(Date.now() - i * 60 * 60 * 1000)
        }
      })
    }
  }
}

async function seedSecurityLogs() {
  console.log('🔒 Seeding security logs...')

  const users = await prisma.user.findMany()

  const securityEvents = [
    {
      action: 'LOGIN_SUCCESS',
      description: 'تسجيل دخول ناجح',
      severity: 'INFO'
    },
    {
      action: 'PASSWORD_CHANGE',
      description: 'تغيير كلمة المرور',
      severity: 'WARNING'
    },
    {
      action: 'FAILED_LOGIN',
      description: 'محاولة تسجيل دخول فاشلة',
      severity: 'DANGER'
    }
  ]

  for (const user of users.slice(0, 3)) {
    for (let i = 0; i < securityEvents.length; i++) {
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          ...securityEvents[i],
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { timestamp: new Date().toISOString() }
        }
      })
    }
  }
}

async function seedMedia() {
  console.log('🖼️ Seeding media...')

  const mediaItems = [
    {
      title: 'معرض السيارات',
      description: 'صورة معرض الحمد للسيارات الرئيسي',
      fileName: 'showroom-luxury.jpg',
      filePath: '/uploads/showroom-luxury.jpg',
      fileSize: 2048576,
      mimeType: 'image/jpeg',
      width: 1920,
      height: 1080,
      alt: 'معرض الحمد للسيارات',
      category: 'GALLERY',
      tags: ['معرض', 'سيارات', 'تاتا'],
      isActive: true
    },
    {
      title: 'خدمة العملاء',
      description: 'فريق خدمة العملاء المتخصص',
      fileName: 'customer-service.jpg',
      filePath: '/uploads/customer-service.jpg',
      fileSize: 1536789,
      mimeType: 'image/jpeg',
      width: 1920,
      height: 1080,
      alt: 'خدمة العملاء',
      category: 'TEAM',
      tags: ['خدمة', 'عملاء', 'فريق'],
      isActive: true
    },
    {
      title: 'ورشة الصيانة',
      description: 'ورشة الصيانة المجهزة بأحدث الأجهزة',
      fileName: 'service-workshop.jpg',
      filePath: '/uploads/service-workshop.jpg',
      fileSize: 2567890,
      mimeType: 'image/jpeg',
      width: 1920,
      height: 1080,
      alt: 'ورشة الصيانة',
      category: 'FACILITY',
      tags: ['صيانة', 'ورشة', 'تجهيزات'],
      isActive: true
    }
  ]

  for (const media of mediaItems) {
    await prisma.media.create({ data: media })
  }
}

async function seedPopupConfigs() {
  console.log('🎯 Seeding popup configurations...')

  const popups = [
    {
      title: 'عرض خاص',
      content: 'احصل على خصم 10% على جميع سيارات تاتا هذا الشهر',
      type: 'PROMOTION',
      trigger: 'PAGE_LOAD',
      delay: 3000,
      showOnce: true,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetPages: ['/', '/vehicles'],
      ctaButton: {
        text: 'استعرض العروض',
        url: '/vehicles'
      }
    },
    {
      title: 'نشرة أخبار',
      content: 'اشترك في نشرتنا الإخبارية للحصول على أحدث العروض والأخبار',
      type: 'NEWSLETTER',
      trigger: 'SCROLL',
      delay: 0,
      showOnce: false,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      targetPages: ['/'],
      ctaButton: {
        text: 'اشترك الآن',
        url: '#newsletter'
      }
    }
  ]

  for (const popup of popups) {
    await prisma.popupConfig.create({ data: popup })
  }
}

async function seedMarketingCampaigns() {
  console.log('📢 Seeding marketing campaigns...')

  const campaigns = [
    {
      name: 'عروض الصيف',
      description: 'عروض خاصة على سيارات تاتا خلال فصل الصيف',
      type: 'PROMOTION',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budget: 50000,
      targetAudience: ['CUSTOMER', 'VIP'],
      channels: ['EMAIL', 'SMS', 'SOCIAL_MEDIA'],
      metrics: {
        sent: 1000,
        opened: 600,
        clicked: 120,
        converted: 15
      }
    },
    {
      name: 'إطلاق تاتا نيكسون',
      description: 'حملة تسويقية لإطلاق تاتا نيكسون الجديدة',
      type: 'PRODUCT_LAUNCH',
      status: 'PLANNED',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      budget: 100000,
      targetAudience: ['ALL'],
      channels: ['EMAIL', 'SMS', 'SOCIAL_MEDIA', 'ADS'],
      metrics: {
        planned: 5000,
        expected: 500
      }
    }
  ]

  for (const campaign of campaigns) {
    await prisma.marketingCampaign.create({ data: campaign })
  }
}

async function seedSupportTickets() {
  console.log('🎫 Seeding support tickets...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const staffUsers = await prisma.user.findMany({ where: { role: { in: ['STAFF', 'BRANCH_MANAGER'] } } })

  const tickets = [
    {
      subject: 'استفسار عن الصيانة',
      description: 'أرغب في حجز موعد لصيانة سيارتي تاتا نيكسون',
      category: 'MAINTENANCE',
      priority: 'MEDIUM',
      status: 'OPEN'
    },
    {
      subject: 'مشكلة في التكييف',
      description: 'تكييف الهواء في سيارتي لا يعمل بشكل جيد',
      category: 'TECHNICAL',
      priority: 'HIGH',
      status: 'IN_PROGRESS'
    },
    {
      subject: 'طلب قطعة غيار',
      description: 'أحتاج إلى قطعة غيار للفرامل الأمامية',
      category: 'PARTS',
      priority: 'LOW',
      status: 'RESOLVED'
    }
  ]

  for (let i = 0; i < tickets.length; i++) {
    const customer = customers[i % customers.length]
    const assignedTo = staffUsers[i % staffUsers.length]

    await prisma.supportTicket.create({
      data: {
        customerId: customer.id,
        assignedUserId: assignedTo.id,
        ...tickets[i],
        ticketNumber: `TKT${String(1000 + i).padStart(6, '0')}`
      }
    })
  }
}

async function seedMaintenanceRecords() {
  console.log('🔧 Seeding maintenance records...')

  const vehicles = await prisma.vehicle.findMany()
  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })

  const records = [
    {
      type: 'OIL_CHANGE',
      description: 'تغيير زيت المحرك والفلتر',
      odometer: 5000,
      cost: 250,
      status: 'COMPLETED'
    },
    {
      type: 'BRAKE_SERVICE',
      description: 'صيانة نظام الفرامل',
      odometer: 10000,
      cost: 800,
      status: 'COMPLETED'
    },
    {
      type: 'GENERAL_INSPECTION',
      description: 'فحص شامل للسيارة',
      odometer: 15000,
      cost: 200,
      status: 'SCHEDULED'
    }
  ]

  for (let i = 0; i < Math.min(vehicles.length, records.length); i++) {
    await prisma.maintenanceRecord.create({
      data: {
        vehicleId: vehicles[i].id,
        customerId: customers[i % customers.length].id,
        ...records[i],
        serviceDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + (30 - i) * 24 * 60 * 60 * 1000)
      }
    })
  }
}

async function seedInsurancePolicies() {
  console.log('🛡️ Seeding insurance policies...')

  const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany()

  const policies = [
    {
      policyNumber: 'INS001234',
      type: 'COMPREHENSIVE',
      provider: 'شركة التأمين العربية',
      premium: 15000,
      coverage: 500000,
      deductible: 2000,
      status: 'ACTIVE'
    },
    {
      policyNumber: 'INS001235',
      type: 'THIRD_PARTY',
      provider: 'مصر للتأمين',
      premium: 8000,
      coverage: 200000,
      deductible: 5000,
      status: 'ACTIVE'
    }
  ]

  for (let i = 0; i < Math.min(customers.length, policies.length); i++) {
    await prisma.insurancePolicy.create({
      data: {
        customerId: customers[i].id,
        vehicleId: vehicles[i % vehicles.length].id,
        ...policies[i],
        startDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + (365 - i) * 24 * 60 * 60 * 1000)
      }
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