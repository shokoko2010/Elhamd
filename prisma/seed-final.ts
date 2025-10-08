import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting final database seeding...')

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
  await seedHeaderNavigation()
  await seedHeaderSocial()
  await seedFooterContent()
  await seedFooterSocial()
  await seedFooterColumns()
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
  await seedTestDriveBookings()
  await seedServiceBookings()
  await seedNotifications()
  await seedTasks()
  await seedActivityLogs()
  await seedSecurityLogs()
  await seedMedia()
  await seedPopupConfigs()

  console.log('✅ Final database seeding completed successfully!')
}

async function cleanDatabase() {
  // Delete in reverse order of dependencies
  const models = [
    'securityLog', 'notification', 'activityLog', 'taskComment', 'task',
    'popupConfig', 'media',
    'serviceBooking', 'testDriveBooking', 'timeSlot',
    'vehiclePricing', 'vehicleSpecification', 'vehicleImage', 'vehicle',
    'serviceType', 'serviceItem',
    'companyFeature', 'companyValue', 'companyStat', 'timelineEvent', 'contactInfo', 'companyInfo',
    'slider', 'footerSocial', 'footerColumn', 'footerContent', 'headerSocial', 'headerNavigation', 'headerContent', 'siteSettings',
    'userPermission', 'user',
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
    logoUrl: '/uploads/logo/alhamd-cars-logo.png',
    logoText: 'الحمد للسيارات',
    tagline: 'وكيل تاتا المعتمد',
    primaryPhone: '+20 2 2345 6789',
    secondaryPhone: '+20 10 1234 5678',
    primaryEmail: 'info@elhamdimports.com',
    secondaryEmail: 'sales@elhamdimports.com',
    address: 'شارع التحرير، وسط القاهرة',
    workingHours: 'الأحد - الخميس: 9:00 ص - 9:00 م',
    ctaButton: {
      text: 'طلب قيادة تجريبية',
      href: '/test-drive',
      variant: 'primary'
    }
  }

  await prisma.headerContent.upsert({
    where: { id: 'default' },
    update: headerContent,
    create: { id: 'default', ...headerContent },
  })
}

async function seedHeaderNavigation() {
  console.log('🧭 Seeding header navigation...')

  const navigationItems = [
    { label: 'الرئيسية', href: '/', order: 1, isVisible: true },
    { label: 'السيارات', href: '/vehicles', order: 2, isVisible: true },
    { label: 'عن الشركة', href: '/about', order: 3, isVisible: true },
    { label: 'الخدمات', href: '/service-booking', order: 4, isVisible: true },
    { label: 'اتصل بنا', href: '/contact', order: 5, isVisible: true },
  ]

  for (const item of navigationItems) {
    await prisma.headerNavigation.create({ data: item })
  }
}

async function seedHeaderSocial() {
  console.log('🔗 Seeding header social...')

  const socialLinks = {
    facebook: 'https://facebook.com/elhamdcars',
    twitter: 'https://twitter.com/elhamdcars',
    instagram: 'https://instagram.com/elhamdcars',
    youtube: 'https://youtube.com/elhamdcars',
    linkedin: 'https://linkedin.com/company/elhamdcars'
  }

  await prisma.headerSocial.upsert({
    where: { id: 'default' },
    update: socialLinks,
    create: { id: 'default', ...socialLinks },
  })
}

async function seedFooterContent() {
  console.log('📄 Seeding footer content...')

  const footerContent = {
    logoUrl: '/uploads/logo/alhamd-cars-logo.png',
    logoText: 'الحمد للسيارات',
    tagline: 'وكيل تاتا المعتمد في مصر',
    primaryPhone: '+20 2 2345 6789',
    secondaryPhone: '+20 10 1234 5678',
    primaryEmail: 'info@elhamdimports.com',
    secondaryEmail: 'sales@elhamdimports.com',
    address: 'شارع التحرير، وسط القاهرة',
    workingHours: 'الأحد - الخميس: 9:00 ص - 9:00 م',
    copyrightText: '© 2024 الحمد للسيارات. جميع الحقوق محفوظة.',
    newsletterText: 'اشترك في نشرتنا البريدية للحصول على أحدث العروض',
    backToTopText: 'العودة للأعلى'
  }

  await prisma.footerContent.upsert({
    where: { id: 'default' },
    update: footerContent,
    create: { id: 'default', ...footerContent },
  })
}

async function seedFooterSocial() {
  console.log('🔗 Seeding footer social...')

  const socialLinks = {
    facebook: 'https://facebook.com/elhamdcars',
    twitter: 'https://twitter.com/elhamdcars',
    instagram: 'https://instagram.com/elhamdcars',
    youtube: 'https://youtube.com/elhamdcars',
    linkedin: 'https://linkedin.com/company/elhamdcars'
  }

  await prisma.footerSocial.upsert({
    where: { id: 'default' },
    update: socialLinks,
    create: { id: 'default', ...socialLinks },
  })
}

async function seedFooterColumns() {
  console.log('📋 Seeding footer columns...')

  const columns = [
    {
      title: 'روابط سريعة',
      links: [
        { label: 'الرئيسية', href: '/' },
        { label: 'السيارات', href: '/vehicles' },
        { label: 'عن الشركة', href: '/about' },
        { label: 'الخدمات', href: '/service-booking' },
        { label: 'اتصل بنا', href: '/contact' }
      ],
      order: 1
    },
    {
      title: 'خدماتنا',
      links: [
        { label: 'صيانة سيارات تاتا', href: '/service-booking' },
        { label: 'قطع غيار أصلية', href: '/parts' },
        { label: 'ضمان المصنع', href: '/warranty' },
        { label: 'تمويل السيارات', href: '/financing' }
      ],
      order: 2
    },
    {
      title: 'تواصل معنا',
      links: [
        { label: 'شارع التحرير، وسط القاهرة', href: '#' },
        { label: '+20 2 2345 6789', href: 'tel:+20223456789' },
        { label: 'info@elhamdimports.com', href: 'mailto:info@elhamdimports.com' }
      ],
      order: 3
    }
  ]

  for (const column of columns) {
    await prisma.footerColumn.create({ data: column })
  }
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
    }
  ]

  for (const service of services) {
    await prisma.serviceItem.create({ data: service })
  }
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
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      imageUrl: '/uploads/vehicles/tata-nexon-3.jpg',
      altText: 'تاتا نيكسون - خلفي',
      isPrimary: false,
      order: 3
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
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      imageUrl: '/uploads/vehicles/tata-tiago-2.jpg',
      altText: 'تاتا تياجو - جانب',
      isPrimary: false,
      order: 2
    },
    // Altroz images
    {
      vehicleId: vehicles.find(v => v.model === 'Altroz')?.id || '',
      imageUrl: '/uploads/vehicles/tata-altroz-1.jpg',
      altText: 'تاتا ألتروز - أمامي',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Altroz')?.id || '',
      imageUrl: '/uploads/vehicles/tata-altroz-2.jpg',
      altText: 'تاتا ألتروز - جانب',
      isPrimary: false,
      order: 2
    },
    // Safari images
    {
      vehicleId: vehicles.find(v => v.model === 'Safari')?.id || '',
      imageUrl: '/uploads/vehicles/tata-safari-1.jpg',
      altText: 'تاتا سفاري - أمامي',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Safari')?.id || '',
      imageUrl: '/uploads/vehicles/tata-safari-2.jpg',
      altText: 'تاتا سفاري - جانب',
      isPrimary: false,
      order: 2
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Safari')?.id || '',
      imageUrl: '/uploads/vehicles/tata-safari-3.jpg',
      altText: 'تاتا سفاري - خلفي',
      isPrimary: false,
      order: 3
    },
    // Harrier images
    {
      vehicleId: vehicles.find(v => v.model === 'Harrier')?.id || '',
      imageUrl: '/uploads/vehicles/tata-harrier-1.jpg',
      altText: 'تاتا هارير - أمامي',
      isPrimary: true,
      order: 1
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Harrier')?.id || '',
      imageUrl: '/uploads/vehicles/tata-harrier-2.jpg',
      altText: 'تاتا هارير - جانب',
      isPrimary: false,
      order: 2
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Harrier')?.id || '',
      imageUrl: '/uploads/vehicles/tata-harrier-3.jpg',
      altText: 'تاتا هارير - خلفي',
      isPrimary: false,
      order: 3
    }
  ]

  for (const image of vehicleImages) {
    if (image.vehicleId) {
      await prisma.vehicleImage.create({ data: image })
    }
  }
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
      key: 'torque',
      label: 'عزم الدوران',
      value: '170 Nm',
      category: 'ENGINE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'fuel_efficiency',
      label: 'استهلاك الوقود',
      value: '17 km/l',
      category: 'PERFORMANCE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Nexon')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'DIMENSIONS'
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
      key: 'fuel_efficiency',
      label: 'استهلاك الوقود',
      value: '18.5 km/l',
      category: 'PERFORMANCE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Punch')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'DIMENSIONS'
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
      key: 'fuel_efficiency',
      label: 'استهلاك الوقود',
      value: '19 km/l',
      category: 'PERFORMANCE'
    },
    {
      vehicleId: vehicles.find(v => v.model === 'Tiago')?.id || '',
      key: 'seating',
      label: 'عدد المقاعد',
      value: '5',
      category: 'DIMENSIONS'
    }
  ]

  for (const spec of specifications) {
    if (spec.vehicleId) {
      await prisma.vehicleSpecification.create({ data: spec })
    }
  }
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
}

async function seedTimeSlots() {
  console.log('⏰ Seeding time slots...')

  const timeSlots = [
    { timeSlot: '09:00-10:00', isAvailable: true },
    { timeSlot: '10:00-11:00', isAvailable: true },
    { timeSlot: '11:00-12:00', isAvailable: true },
    { timeSlot: '12:00-13:00', isAvailable: true },
    { timeSlot: '13:00-14:00', isAvailable: false }, // Lunch break
    { timeSlot: '14:00-15:00', isAvailable: true },
    { timeSlot: '15:00-16:00', isAvailable: true },
    { timeSlot: '16:00-17:00', isAvailable: true },
    { timeSlot: '17:00-18:00', isAvailable: true },
    { timeSlot: '18:00-19:00', isAvailable: true },
    { timeSlot: '19:00-20:00', isAvailable: true },
    { timeSlot: '20:00-21:00', isAvailable: true }
  ]

  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot })
  }
}

async function seedTestDriveBookings() {
  console.log('🚗 Seeding test drive bookings...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany({ where: { featured: true } })
  const timeSlots = await prisma.timeSlot.findMany({ where: { isAvailable: true } })

  if (users.length > 0 && vehicles.length > 0 && timeSlots.length > 0) {
    const bookings = [
      {
        customerId: users[0].id,
        vehicleId: vehicles[0].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: timeSlots[0].timeSlot,
        status: 'CONFIRMED',
        notes: 'العميل مهتم جداً بالسيارة'
      },
      {
        customerId: users[1].id,
        vehicleId: vehicles[1].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        timeSlot: timeSlots[1].timeSlot,
        status: 'PENDING',
        notes: 'ينتظر تأكيد من الإدارة'
      }
    ]

    for (const booking of bookings) {
      await prisma.testDriveBooking.create({ data: booking })
    }
  }
}

async function seedServiceBookings() {
  console.log('🔧 Seeding service bookings...')

  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } })
  const vehicles = await prisma.vehicle.findMany()
  const serviceTypes = await prisma.serviceType.findMany()
  const timeSlots = await prisma.timeSlot.findMany({ where: { isAvailable: true } })

  if (users.length > 0 && vehicles.length > 0 && serviceTypes.length > 0 && timeSlots.length > 0) {
    const bookings = [
      {
        customerId: users[0].id,
        vehicleId: vehicles[0].id,
        serviceTypeId: serviceTypes[0].id,
        timeSlotId: timeSlots[2].id,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        timeSlot: timeSlots[2].timeSlot,
        status: 'CONFIRMED',
        totalPrice: serviceTypes[0].price,
        paymentStatus: 'PENDING',
        notes: 'صيانة دورية للسيارة'
      },
      {
        customerId: users[1].id,
        vehicleId: vehicles[1].id,
        serviceTypeId: serviceTypes[1].id,
        timeSlotId: timeSlots[3].id,
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        timeSlot: timeSlots[3].timeSlot,
        status: 'PENDING',
        totalPrice: serviceTypes[1].price,
        paymentStatus: 'PENDING',
        notes: 'تغيير زيت وفحص عام'
      }
    ]

    for (const booking of bookings) {
      await prisma.serviceBooking.create({ data: booking })
    }
  }
}

async function seedNotifications() {
  console.log('🔔 Seeding notifications...')

  const users = await prisma.user.findMany()

  const notifications = [
    {
      userId: users.find(u => u.role === 'ADMIN')?.id || '',
      title: 'حجز قيادة تجريبية جديد',
      message: 'لديك حجز قيادة تجريبية جديد يحتاج تأكيد',
      type: 'BOOKING',
      isRead: false,
      priority: 'HIGH'
    },
    {
      userId: users.find(u => u.role === 'CUSTOMER')?.id || '',
      title: 'تأكيد حجز الصيانة',
      message: 'تم تأكيد حجز الصيانة الخاص بك',
      type: 'BOOKING',
      isRead: false,
      priority: 'MEDIUM'
    },
    {
      userId: users.find(u => u.role === 'BRANCH_MANAGER')?.id || '',
      title: 'تقرير المبيعات',
      message: 'التقرير الأسبوعي للمبيعات جاهز للمراجعة',
      type: 'REPORT',
      isRead: true,
      priority: 'LOW'
    }
  ]

  for (const notification of notifications) {
    if (notification.userId) {
      await prisma.notification.create({ data: notification })
    }
  }
}

async function seedTasks() {
  console.log('📋 Seeding tasks...')

  const users = await prisma.user.findMany({ where: { role: { in: ['STAFF', 'BRANCH_MANAGER'] } } })

  const tasks = [
    {
      title: 'متابعة حجوزات اليوم',
      description: 'مراجعة وتأكيد جميع حجوزات القيادة التجريبية لليوم',
      assignedTo: users.find(u => u.role === 'BRANCH_MANAGER')?.id || '',
      assignedBy: users.find(u => u.role === 'ADMIN')?.id || '',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      category: 'BOOKING'
    },
    {
      title: 'تحديث أسعار السيارات',
      description: 'تحديث أسعار جميع السيارات المعروضة',
      assignedTo: users.find(u => u.role === 'STAFF')?.id || '',
      assignedBy: users.find(u => u.role === 'BRANCH_MANAGER')?.id || '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      category: 'PRICING'
    },
    {
      title: 'صيانة سيارة العرض',
      description: 'صيانة سيارة النيكسون المعروضة في الواجهة',
      assignedTo: users.find(u => u.email === 'service@elhamdimports.com')?.id || '',
      assignedBy: users.find(u => u.role === 'BRANCH_MANAGER')?.id || '',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      category: 'MAINTENANCE'
    }
  ]

  for (const task of tasks) {
    if (task.assignedTo && task.assignedBy) {
      await prisma.task.create({ data: task })
    }
  }
}

async function seedActivityLogs() {
  console.log('📝 Seeding activity logs...')

  const users = await prisma.user.findMany()

  const activities = [
    {
      userId: users.find(u => u.role === 'ADMIN')?.id || '',
      action: 'LOGIN',
      details: 'تسجيل الدخول إلى لوحة التحكم',
      ipAddress: '196.1.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      userId: users.find(u => u.role === 'CUSTOMER')?.id || '',
      action: 'BOOKING_CREATED',
      details: 'إنشاء حجز قيادة تجريبية',
      ipAddress: '196.1.1.2',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
    },
    {
      userId: users.find(u => u.role === 'STAFF')?.id || '',
      action: 'VEHICLE_UPDATED',
      details: 'تحديث معلومات سيارة تاتا نيكسون',
      ipAddress: '196.1.1.3',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  ]

  for (const activity of activities) {
    if (activity.userId) {
      await prisma.activityLog.create({ data: activity })
    }
  }
}

async function seedSecurityLogs() {
  console.log('🔒 Seeding security logs...')

  const users = await prisma.user.findMany()

  const securityEvents = [
    {
      userId: users.find(u => u.role === 'ADMIN')?.id || '',
      action: 'LOGIN_SUCCESS',
      ipAddress: '196.1.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'INFO',
      details: { loginTime: new Date(), location: 'Cairo, Egypt' }
    },
    {
      userId: users.find(u => u.role === 'CUSTOMER')?.id || '',
      action: 'PASSWORD_CHANGE',
      ipAddress: '196.1.1.2',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      severity: 'WARNING',
      details: { previousPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    {
      action: 'FAILED_LOGIN_ATTEMPT',
      ipAddress: '196.1.1.100',
      userAgent: 'Mozilla/5.0 (compatible; bot/1.0)',
      severity: 'HIGH',
      details: { attempts: 5, reason: 'Invalid credentials' }
    }
  ]

  for (const event of securityEvents) {
    await prisma.securityLog.create({ data: event })
  }
}

async function seedMedia() {
  console.log('📸 Seeding media...')

  const mediaItems = [
    {
      title: 'صورة المعرض الرئيسي',
      description: 'صورة حديثة للمعرض الرئيسي',
      fileName: 'showroom-main.jpg',
      filePath: '/uploads/showroom-luxury.jpg',
      fileSize: 2048576,
      mimeType: 'image/jpeg',
      alt: 'معرض الحمد للسيارات',
      category: 'GALLERY',
      isActive: true
    },
    {
      title: 'شعار الشركة',
      description: 'شعار الحمد للسيارات الرسمي',
      fileName: 'logo.png',
      filePath: '/uploads/logo/alhamd-cars-logo.png',
      fileSize: 102400,
      mimeType: 'image/png',
      alt: 'شعار الحمد للسيارات',
      category: 'BRAND',
      isActive: true
    },
    {
      title: 'بنر تاتا نيكسون',
      description: 'بنر دعائي لتاتا نيكسون',
      fileName: 'nexon-banner.jpg',
      filePath: '/uploads/banners/nexon-banner.jpg',
      fileSize: 3145728,
      mimeType: 'image/jpeg',
      alt: 'بنر تاتا نيكسون',
      category: 'BANNER',
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
      title: 'عرض خاص على تاتا نيكسون',
      content: 'احصل على خصم 5% على تاتا نيكسون هذا الشهر فقط!',
      type: 'PROMOTION',
      trigger: 'PAGE_LOAD',
      delay: 3000,
      isActive: true,
      showOnce: true,
      buttonText: 'اعرف المزيد',
      buttonLink: '/vehicles/nexon',
      imageUrl: '/uploads/banners/nexon-banner.jpg',
      order: 1
    },
    {
      title: 'نشرة أخبار الحمد',
      content: 'اشترك في نشرتنا البريدية للحصول على أحدث العروض والأخبار',
      type: 'NEWSLETTER',
      trigger: 'SCROLL',
      delay: 0,
      isActive: true,
      showOnce: false,
      buttonText: 'اشترك الآن',
      buttonLink: '#newsletter',
      order: 2
    }
  ]

  for (const popup of popups) {
    await prisma.popupConfig.create({ data: popup })
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