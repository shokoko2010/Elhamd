import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive Prisma Postgres database seeding...')

  try {
    // Skip cleaning to avoid foreign key constraints issues
    console.log('📝 Creating new data without cleaning existing data...')

    // 1. Create Branches (if they don't exist)
    console.log('🏢 Creating branches...')
    let mainBranch, alexBranch
    
    try {
      mainBranch = await prisma.branch.create({
        data: {
          id: 'branch_main',
          name: 'الفرع الرئيسي - القاهرة',
          code: 'CAI-001',
          address: 'شارع التحرير، القاهرة، مصر',
          phone: '+20 2 1234 5678',
          email: 'cairo@elhamd-cars.com',
          isActive: true,
          openingDate: new Date('2020-01-01'),
          currency: 'EGP',
          timezone: 'Africa/Cairo',
          settings: {
            workingHours: '9:00 ص - 8:00 م',
            services: ['Sales', 'Service', 'Parts', 'Finance']
          }
        }
      })
      console.log(`✅ Main branch created: ${mainBranch.name}`)
    } catch (error) {
      mainBranch = await prisma.branch.findUnique({ where: { code: 'CAI-001' } })
      console.log(`ℹ️ Main branch already exists: ${mainBranch?.name}`)
    }

    try {
      alexBranch = await prisma.branch.create({
        data: {
          id: 'branch_alex',
          name: 'فرع الإسكندرية',
          code: 'ALX-001',
          address: 'شارع الجيش، الإسكندرية، مصر',
          phone: '+20 3 1234 5678',
          email: 'alexandria@elhamd-cars.com',
          isActive: true,
          openingDate: new Date('2021-06-01'),
          currency: 'EGP',
          timezone: 'Africa/Cairo',
          settings: {
            workingHours: '10:00 ص - 7:00 م',
            services: ['Sales', 'Service']
          }
        }
      })
      console.log(`✅ Alexandria branch created: ${alexBranch.name}`)
    } catch (error) {
      alexBranch = await prisma.branch.findUnique({ where: { code: 'ALX-001' } })
      console.log(`ℹ️ Alexandria branch already exists: ${alexBranch?.name}`)
    }

    // 2. Create Permissions (if they don't exist)
    console.log('🔐 Creating permissions...')
    const permissions = [
      // User Management
      { id: 'perm_users_view', name: 'view_users', description: 'View users list', category: 'USER_MANAGEMENT' },
      { id: 'perm_users_create', name: 'create_users', description: 'Create new users', category: 'USER_MANAGEMENT' },
      { id: 'perm_users_edit', name: 'edit_users', description: 'Edit existing users', category: 'USER_MANAGEMENT' },
      { id: 'perm_users_delete', name: 'delete_users', description: 'Delete users', category: 'USER_MANAGEMENT' },
      { id: 'perm_users_manage_roles', name: 'manage_user_roles', description: 'Manage user roles and permissions', category: 'USER_MANAGEMENT' },
      
      // Vehicle Management
      { id: 'perm_vehicles_view', name: 'view_vehicles', description: 'View vehicles list', category: 'VEHICLE_MANAGEMENT' },
      { id: 'perm_vehicles_create', name: 'create_vehicles', description: 'Add new vehicles', category: 'VEHICLE_MANAGEMENT' },
      { id: 'perm_vehicles_edit', name: 'edit_vehicles', description: 'Edit vehicle information', category: 'VEHICLE_MANAGEMENT' },
      { id: 'perm_vehicles_delete', name: 'delete_vehicles', description: 'Delete vehicles', category: 'VEHICLE_MANAGEMENT' },
      { id: 'perm_vehicles_pricing', name: 'manage_pricing', description: 'Manage vehicle pricing', category: 'VEHICLE_MANAGEMENT' },
      
      // Bookings Management
      { id: 'perm_bookings_view', name: 'view_bookings', description: 'View all bookings', category: 'BOOKINGS_MANAGEMENT' },
      { id: 'perm_bookings_create', name: 'create_bookings', description: 'Create new bookings', category: 'BOOKINGS_MANAGEMENT' },
      { id: 'perm_bookings_edit', name: 'edit_bookings', description: 'Edit existing bookings', category: 'BOOKINGS_MANAGEMENT' },
      { id: 'perm_bookings_cancel', name: 'cancel_bookings', description: 'Cancel bookings', category: 'BOOKINGS_MANAGEMENT' },
      { id: 'perm_bookings_approve', name: 'approve_bookings', description: 'Approve bookings', category: 'BOOKINGS_MANAGEMENT' },
      
      // Content Management
      { id: 'perm_sliders_view', name: 'view_sliders', description: 'View homepage sliders', category: 'CONTENT_MANAGEMENT' },
      { id: 'perm_sliders_create', name: 'create_sliders', description: 'Create homepage sliders', category: 'CONTENT_MANAGEMENT' },
      { id: 'perm_sliders_edit', name: 'edit_sliders', description: 'Edit homepage sliders', category: 'CONTENT_MANAGEMENT' },
      { id: 'perm_sliders_delete', name: 'delete_sliders', description: 'Delete homepage sliders', category: 'CONTENT_MANAGEMENT' },
      { id: 'perm_settings_view', name: 'view_settings', description: 'View site settings', category: 'CONTENT_MANAGEMENT' },
      { id: 'perm_settings_edit', name: 'edit_settings', description: 'Edit site settings', category: 'CONTENT_MANAGEMENT' },
      
      // Reports and Analytics
      { id: 'perm_reports_view', name: 'view_reports', description: 'View reports and analytics', category: 'REPORTS_ANALYTICS' },
      { id: 'perm_reports_export', name: 'export_reports', description: 'Export reports', category: 'REPORTS_ANALYTICS' },
      { id: 'perm_analytics_view', name: 'view_analytics', description: 'View analytics dashboard', category: 'REPORTS_ANALYTICS' },
      
      // System Administration
      { id: 'perm_system_logs', name: 'view_system_logs', description: 'View system logs', category: 'SYSTEM_ADMINISTRATION' },
      { id: 'perm_system_backup', name: 'manage_backup', description: 'Manage system backup', category: 'SYSTEM_ADMINISTRATION' },
      { id: 'perm_system_settings', name: 'system_settings', description: 'Manage system settings', category: 'SYSTEM_ADMINISTRATION' },
      
      // Branch Management
      { id: 'perm_branches_view', name: 'view_branches', description: 'View branches', category: 'BRANCH_MANAGEMENT' },
      { id: 'perm_branches_create', name: 'create_branches', description: 'Create new branches', category: 'BRANCH_MANAGEMENT' },
      { id: 'perm_branches_edit', name: 'edit_branches', description: 'Edit branch information', category: 'BRANCH_MANAGEMENT' },
      { id: 'perm_branches_delete', name: 'delete_branches', description: 'Delete branches', category: 'BRANCH_MANAGEMENT' }
    ]

    let createdPermissions = 0
    for (const perm of permissions) {
      try {
        await prisma.permission.create({ data: perm })
        createdPermissions++
      } catch (error) {
        // Permission already exists
      }
    }
    console.log(`✅ Permissions created: ${createdPermissions} new permissions`)

    // 3. Create Role Templates
    console.log('👥 Creating role templates...')
    let adminRole, managerRole, salesRole, serviceRole

    try {
      adminRole = await prisma.roleTemplate.create({
        data: {
          id: 'role_admin',
          name: 'Administrator',
          description: 'Full system access with all permissions',
          role: 'ADMIN',
          permissions: permissions.map(p => p.id),
          isActive: true,
          isSystem: true
        }
      })
      console.log(`✅ Admin role created`)
    } catch (error) {
      adminRole = await prisma.roleTemplate.findUnique({ where: { id: 'role_admin' } })
      console.log(`ℹ️ Admin role already exists`)
    }

    try {
      managerRole = await prisma.roleTemplate.create({
        data: {
          id: 'role_manager',
          name: 'Branch Manager',
          description: 'Branch management with limited permissions',
          role: 'MANAGER',
          permissions: [
            'perm_users_view', 'perm_users_create', 'perm_users_edit',
            'perm_vehicles_view', 'perm_vehicles_create', 'perm_vehicles_edit', 'perm_vehicles_pricing',
            'perm_bookings_view', 'perm_bookings_create', 'perm_bookings_edit', 'perm_bookings_approve',
            'perm_reports_view', 'perm_reports_export',
            'perm_branches_view', 'perm_branches_edit'
          ],
          isActive: true,
          isSystem: false
        }
      })
      console.log(`✅ Manager role created`)
    } catch (error) {
      managerRole = await prisma.roleTemplate.findUnique({ where: { id: 'role_manager' } })
      console.log(`ℹ️ Manager role already exists`)
    }

    try {
      salesRole = await prisma.roleTemplate.create({
        data: {
          id: 'role_sales',
          name: 'Sales Representative',
          description: 'Sales focused role with customer management',
          role: 'SALES',
          permissions: [
            'perm_users_view', 'perm_users_create',
            'perm_vehicles_view',
            'perm_bookings_view', 'perm_bookings_create', 'perm_bookings_edit',
            'perm_reports_view'
          ],
          isActive: true,
          isSystem: false
        }
      })
      console.log(`✅ Sales role created`)
    } catch (error) {
      salesRole = await prisma.roleTemplate.findUnique({ where: { id: 'role_sales' } })
      console.log(`ℹ️ Sales role already exists`)
    }

    try {
      serviceRole = await prisma.roleTemplate.create({
        data: {
          id: 'role_service',
          name: 'Service Advisor',
          description: 'Service and maintenance focused role',
          role: 'SERVICE_ADVISOR',
          permissions: [
            'perm_users_view',
            'perm_vehicles_view', 'perm_vehicles_edit',
            'perm_bookings_view', 'perm_bookings_create', 'perm_bookings_edit',
            'perm_reports_view'
          ],
          isActive: true,
          isSystem: false
        }
      })
      console.log(`✅ Service role created`)
    } catch (error) {
      serviceRole = await prisma.roleTemplate.findUnique({ where: { id: 'role_service' } })
      console.log(`ℹ️ Service role already exists`)
    }

    // 4. Create Users with different roles
    console.log('👤 Creating users...')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    let createdUsers = 0

    // Super Admin
    try {
      const superAdmin = await prisma.user.create({
        data: {
          id: 'admin_super',
          email: 'admin@elhamd-cars.com',
          password: hashedPassword,
          name: 'Super Admin',
          role: 'ADMIN',
          phone: '+20 1 2345 67890',
          isActive: true,
          emailVerified: true,
          segment: 'VIP',
          status: 'active',
          roleTemplateId: adminRole?.id,
          securitySettings: {
            twoFactorEnabled: true,
            loginNotifications: true,
            sessionTimeout: 120
          }
        }
      })
      console.log(`✅ Super Admin created: ${superAdmin.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Super Admin already exists`)
    }

    // Branch Manager
    try {
      const branchManager = await prisma.user.create({
        data: {
          id: 'manager_cairo',
          email: 'manager.cairo@elhamd-cars.com',
          password: hashedPassword,
          name: 'أحمد محمد',
          role: 'MANAGER',
          phone: '+20 1 2345 67891',
          isActive: true,
          emailVerified: true,
          segment: 'PREMIUM',
          status: 'active',
          branchId: mainBranch?.id,
          roleTemplateId: managerRole?.id,
          customPermissions: {
            canApproveLargeDiscounts: true,
            maxDiscountPercentage: 15
          }
        }
      })
      console.log(`✅ Branch Manager created: ${branchManager.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Branch Manager already exists`)
    }

    // Sales Representatives
    try {
      const salesRep1 = await prisma.user.create({
        data: {
          id: 'sales_rep1',
          email: 'sales.rep1@elhamd-cars.com',
          password: hashedPassword,
          name: 'محمد علي',
          role: 'SALES',
          phone: '+20 1 2345 67892',
          isActive: true,
          emailVerified: true,
          segment: 'REGULAR',
          status: 'active',
          branchId: mainBranch?.id,
          roleTemplateId: salesRole?.id
        }
      })
      console.log(`✅ Sales Rep 1 created: ${salesRep1.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Sales Rep 1 already exists`)
    }

    try {
      const salesRep2 = await prisma.user.create({
        data: {
          id: 'sales_rep2',
          email: 'sales.rep2@elhamd-cars.com',
          password: hashedPassword,
          name: 'خالد أحمد',
          role: 'SALES',
          phone: '+20 1 2345 67893',
          isActive: true,
          emailVerified: true,
          segment: 'REGULAR',
          status: 'active',
          branchId: alexBranch?.id,
          roleTemplateId: salesRole?.id
        }
      })
      console.log(`✅ Sales Rep 2 created: ${salesRep2.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Sales Rep 2 already exists`)
    }

    // Service Advisors
    try {
      const serviceAdvisor1 = await prisma.user.create({
        data: {
          id: 'service_adv1',
          email: 'service.advisor1@elhamd-cars.com',
          password: hashedPassword,
          name: 'عمر حسن',
          role: 'SERVICE_ADVISOR',
          phone: '+20 1 2345 67894',
          isActive: true,
          emailVerified: true,
          segment: 'REGULAR',
          status: 'active',
          branchId: mainBranch?.id,
          roleTemplateId: serviceRole?.id
        }
      })
      console.log(`✅ Service Advisor created: ${serviceAdvisor1.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Service Advisor already exists`)
    }

    // Regular Customers
    try {
      const customer1 = await prisma.user.create({
        data: {
          id: 'customer1',
          email: 'customer1@example.com',
          password: hashedPassword,
          name: 'محمود عبدالله',
          role: 'CUSTOMER',
          phone: '+20 1 2345 67895',
          isActive: true,
          emailVerified: true,
          segment: 'REGULAR',
          status: 'active'
        }
      })
      console.log(`✅ Customer 1 created: ${customer1.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Customer 1 already exists`)
    }

    try {
      const customer2 = await prisma.user.create({
        data: {
          id: 'customer2',
          email: 'customer2@example.com',
          password: hashedPassword,
          name: 'ياسر محمد',
          role: 'CUSTOMER',
          phone: '+20 1 2345 67896',
          isActive: true,
          emailVerified: true,
          segment: 'VIP',
          status: 'active'
        }
      })
      console.log(`✅ Customer 2 created: ${customer2.email}`)
      createdUsers++
    } catch (error) {
      console.log(`ℹ️ Customer 2 already exists`)
    }

    console.log(`✅ Users created: ${createdUsers} new users`)

    // 5. Create Site Settings
    console.log('⚙️ Creating site settings...')
    try {
      const siteSettings = await prisma.siteSettings.create({
        data: {
          id: 'settings_main',
          logoUrl: '/uploads/logo/alhamd-cars-logo.png',
          faviconUrl: '/favicon.ico',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          fontFamily: 'Inter',
          siteTitle: 'الحمد للسيارات',
          siteDescription: 'مركز سيارات الحمد - أفضل خدمة لسيارتك. وكيل معتمد لتاتا للسيارات في مصر',
          contactEmail: 'info@elhamd-cars.com',
          contactPhone: '+20 2 1234 5678',
          contactAddress: 'شارع التحرير، القاهرة، مصر',
          workingHours: 'الأحد - الخميس: 9:00 ص - 8:00 م | الجمعة - السبت: 10:00 ص - 6:00 م',
          socialLinks: {
            facebook: 'https://facebook.com/elhamdcars',
            twitter: 'https://twitter.com/elhamdcars',
            instagram: 'https://instagram.com/elhamdcars',
            youtube: 'https://youtube.com/elhamdcars',
            whatsapp: '+20 2 1234 5678'
          },
          seoSettings: {
            metaTitle: 'الحمد للسيارات - وكيل تاتا المعتمد في مصر',
            metaDescription: 'مركز سيارات الحمد - أفضل أسعار تاتا، صيانة معتمدة، قطع غيار أصلية',
            keywords: ['تاتا', 'سيارات', 'مصر', 'الحمد', 'وكيل معتمد', 'صيانة', 'بيع'],
            ogImage: '/uploads/og-image.jpg'
          },
          performanceSettings: {
            cachingEnabled: true,
            debugMode: false,
            autoBackup: true,
            sessionTimeout: 30,
            maxFileSize: 10485760,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
          },
          headerSettings: {
            navigation: [
              { id: '1', label: 'الرئيسية', href: '/', order: 1, isVisible: true },
              { id: '2', label: 'السيارات', href: '/vehicles', order: 2, isVisible: true },
              { id: '3', label: 'الخدمات', href: '/service-booking', order: 3, isVisible: true },
              { id: '4', label: 'تجربة قيادة', href: '/test-drive', order: 4, isVisible: true },
              { id: '5', label: 'عن الشركة', href: '/about', order: 5, isVisible: true },
              { id: '6', label: 'اتصل بنا', href: '/contact', order: 6, isVisible: true }
            ],
            showPhoneNumber: true,
            showSocialMedia: true
          },
          footerSettings: {
            showNewsletter: true,
            showQuickLinks: true,
            showContactInfo: true,
            showSocialMedia: true,
            copyrightText: '© 2024 الحمد للسيارات. جميع الحقوق محفوظة'
          },
          isActive: true
        }
      })
      console.log(`✅ Site settings created: ${siteSettings.siteTitle}`)
    } catch (error) {
      console.log(`ℹ️ Site settings already exist`)
    }

    // 6. Create Homepage Sliders
    console.log('🎠 Creating homepage sliders...')
    const sliders = [
      {
        id: 'slider1',
        title: 'تاتا نيكسون 2024',
        subtitle: 'SUV عائلية متطورة',
        description: 'تجربة القيادة المثالية مع أحدث تقنيات السلامة والراحة. تمتع بأداء استثنائي وتصميم عصري يناسب جميع احتياجاتك. محرك قوي مع استهلاك وقود اقتصادي.',
        imageUrl: '/uploads/banners/nexon-banner.jpg',
        ctaText: 'اكتشف المزيد',
        ctaLink: '/vehicles?model=nexon',
        badge: 'جديد',
        badgeColor: 'bg-green-500',
        order: 0,
        isActive: true
      },
      {
        id: 'slider2',
        title: 'تاتا بانش',
        subtitle: 'SUV مدمجة للمدن',
        description: 'سيارة المدينة المثالية بتصميم عملي وأسعار تنافسية. قوة ومتانة في حجم صغير يتناسب مع ازدحام المدن. مثالية للعائلات الصغيرة.',
        imageUrl: '/uploads/banners/punch-banner.jpg',
        ctaText: 'احجز الآن',
        ctaLink: '/test-drive?model=punch',
        badge: 'الأكثر مبيعاً',
        badgeColor: 'bg-orange-500',
        order: 1,
        isActive: true
      },
      {
        id: 'slider3',
        title: 'تاتا تياجو إلكتريك',
        subtitle: 'مستقبل الكهرباء',
        description: 'انضم إلى ثورة السيارات الكهربائية مع تاتا تياجو إلكتريك. صديق للبيئة، اقتصادي في استهلاك الطاقة، هادئ وقوي في الأداء.',
        imageUrl: '/uploads/banners/tiago-electric-banner.jpg',
        ctaText: 'جرب القيادة',
        ctaLink: '/test-drive?model=tiago-ev',
        badge: 'كهربائي',
        badgeColor: 'bg-blue-500',
        order: 2,
        isActive: true
      },
      {
        id: 'slider4',
        title: 'عرض خاص',
        subtitle: 'تخفيضات تصل إلى 15%',
        description: 'احصل على أفضل العروض على سيارات تاتا المختارة. شاملة ضمان وتأمين شامل. فرصة محدودة!',
        imageUrl: '/uploads/banners/special-offer-banner.jpg',
        ctaText: 'شاهد العروض',
        ctaLink: '/offers',
        badge: 'عرض محدود',
        badgeColor: 'bg-red-500',
        order: 3,
        isActive: true
      },
      {
        id: 'slider5',
        title: 'تاتا هارير',
        subtitle: 'SUV فاخرة',
        description: 'تجربة الفخامة الحقيقية مع تاتا هارير. تصميم جريء، محرك قوي، تقنيات متطورة، ومساحة واسعة للعائلة.',
        imageUrl: '/uploads/banners/harrier-banner.jpg',
        ctaText: 'تعرف أكثر',
        ctaLink: '/vehicles?model=harrier',
        badge: 'فاخرة',
        badgeColor: 'bg-purple-500',
        order: 4,
        isActive: true
      }
    ]

    let createdSliders = 0
    for (const sliderData of sliders) {
      try {
        await prisma.slider.create({ data: sliderData })
        createdSliders++
      } catch (error) {
        // Slider already exists
      }
    }
    console.log(`✅ Sliders created: ${createdSliders} new sliders`)

    // 7. Create Service Types
    console.log('🔧 Creating service types...')
    const serviceTypes = [
      {
        id: 'service_basic',
        name: 'صيانة دورية أساسية',
        description: 'تغيير زيت، فلاتر، فحص شامل للسيارة',
        duration: 60,
        price: 350,
        category: 'MAINTENANCE'
      },
      {
        id: 'service_comprehensive',
        name: 'صيانة شاملة',
        description: 'صيانة دورية كاملة مع فحص جميع الأنظمة',
        duration: 120,
        price: 750,
        category: 'MAINTENANCE'
      },
      {
        id: 'service_ac',
        name: 'صيانة مكيف',
        description: 'فحص وتنظيف وتعبئة غاز المكيف',
        duration: 45,
        price: 250,
        category: 'REPAIR'
      },
      {
        id: 'service_brakes',
        name: 'صيانة فرامل',
        description: 'فحص وتغيير تيل الفرامل والديسك',
        duration: 90,
        price: 600,
        category: 'REPAIR'
      },
      {
        id: 'service_oil',
        name: 'تغيير زيت',
        description: 'تغيير زيت المحرك والفلتر',
        duration: 30,
        price: 150,
        category: 'MAINTENANCE'
      },
      {
        id: 'service_diagnostic',
        name: 'فحص تشخيصي',
        description: 'فحص شامل بالكمبيوتر للكشف عن الأعطال',
        duration: 60,
        price: 200,
        category: 'DIAGNOSTIC'
      },
      {
        id: 'service_wash',
        name: 'غسيل وتلميع',
        description: 'غسيل داخلي وخارجي مع التلميع',
        duration: 90,
        price: 180,
        category: 'DETAILING'
      },
      {
        id: 'service_inspection',
        name: 'فحص سنوي',
        description: 'الفحص السنوي المعتمد للترخيص',
        duration: 45,
        price: 300,
        category: 'INSPECTION'
      }
    ]

    let createdServices = 0
    for (const serviceData of serviceTypes) {
      try {
        await prisma.serviceType.create({ data: serviceData })
        createdServices++
      } catch (error) {
        // Service already exists
      }
    }
    console.log(`✅ Service types created: ${createdServices} new services`)

    // 8. Create Vehicles
    console.log('🚗 Creating vehicles...')
    const vehicles = [
      {
        id: 'nexon_ev_2024',
        make: 'Tata',
        model: 'Nexon EV',
        year: 2024,
        price: 550000,
        stockNumber: 'NEX-EV-2024-001',
        vin: 'MAT6EV45678901234',
        description: 'تاتا نيكسون إلكتريك 2024 - سيارة SUV عائلية كهربائية بمدى قيادة 312 كم، شحن سريع، وتصميم عصري',
        category: 'SUV',
        fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch?.id
      },
      {
        id: 'nexon_petrol_2024',
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 450000,
        stockNumber: 'NEX-2024-001',
        vin: 'MAT62345678901234',
        description: 'تاتا نيكسون 2024 - سيارة SUV عائلية متطورة بمحرك قوي وتصميم عصري، مثالية للعائلات المصرية',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch?.id
      },
      {
        id: 'punch_2024',
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 320000,
        stockNumber: 'PUN-2024-001',
        vin: 'MAT62345678901235',
        description: 'تاتا بانش 2024 - سيارة مدمجة للمدن بتصميم عملي وأسعار تنافسية، مثالية لشوارع المدن المزدحمة',
        category: 'COMPACT',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'رمادي',
        status: 'AVAILABLE',
        featured: true,
        branchId: alexBranch?.id
      },
      {
        id: 'tiago_ev_2024',
        make: 'Tata',
        model: 'Tiago EV',
        year: 2024,
        price: 380000,
        stockNumber: 'TIA-EV-2024-001',
        vin: 'MAT6EV45678901236',
        description: 'تاتا تياجو إلكتريك 2024 - سيارة هاتشباك كهربائية اقتصادية مثالية للمدن',
        category: 'HATCHBACK',
        fuelType: 'ELECTRIC',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: false,
        branchId: mainBranch?.id
      },
      {
        id: 'tiago_petrol_2024',
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 280000,
        stockNumber: 'TIA-2024-001',
        vin: 'MAT62345678901236',
        description: 'تاتا تياجو 2024 - سيارة هاتشباك عملية اقتصادية وموثوقة، خيار مثالي للعائلات الصغيرة',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: false,
        branchId: alexBranch?.id
      },
      {
        id: 'altroz_2024',
        make: 'Tata',
        model: 'Altroz',
        year: 2024,
        price: 350000,
        stockNumber: 'ALT-2024-001',
        vin: 'MAT62345678901237',
        description: 'تاتا ألتروز 2024 - سيارة بريميوم هاتشباك بتصميم أوروبي ومساحة واسعة',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أزرق',
        status: 'AVAILABLE',
        featured: false,
        branchId: mainBranch?.id
      },
      {
        id: 'harrier_2024',
        make: 'Tata',
        model: 'Harrier',
        year: 2024,
        price: 650000,
        stockNumber: 'HAR-2024-001',
        vin: 'MAT62345678901238',
        description: 'تاتا هارير 2024 - سيارة SUV فاخرة بتصميم جريء ومحرك قوي، تجربة قيادة ممتازة',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'أسود',
        status: 'AVAILABLE',
        featured: true,
        branchId: mainBranch?.id
      },
      {
        id: 'safari_2024',
        make: 'Tata',
        model: 'Safari',
        year: 2024,
        price: 750000,
        stockNumber: 'SAF-2024-001',
        vin: 'MAT62345678901239',
        description: 'تاتا سفاري 2024 - سيارة SUV عائلية كبيرة بمساحة واسعة وراحة فائقة، 7 مقاعد',
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'فضي',
        status: 'AVAILABLE',
        featured: true,
        branchId: alexBranch?.id
      }
    ]

    const createdVehicles = []
    for (const vehicleData of vehicles) {
      try {
        const vehicle = await prisma.vehicle.create({ data: vehicleData })
        createdVehicles.push(vehicle)
      } catch (error) {
        // Vehicle already exists, get it
        const existingVehicle = await prisma.vehicle.findUnique({ 
          where: { stockNumber: vehicleData.stockNumber } 
        })
        if (existingVehicle) {
          createdVehicles.push(existingVehicle)
        }
      }
    }
    console.log(`✅ Vehicles processed: ${createdVehicles.length} vehicles`)

    // 9. Create Vehicle Images
    console.log('📸 Creating vehicle images...')
    const vehicleImages = [
      // Nexon EV images
      { vehicleId: 'nexon_ev_2024', imageUrl: '/uploads/vehicles/nexon-ev/nexon-ev-front.jpg', altText: 'تاتا نيكسون إلكتريك - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'nexon_ev_2024', imageUrl: '/uploads/vehicles/nexon-ev/nexon-ev-side.jpg', altText: 'تاتا نيكسون إلكتريك - جانب', isPrimary: false, order: 1 },
      { vehicleId: 'nexon_ev_2024', imageUrl: '/uploads/vehicles/nexon-ev/nexon-ev-rear.jpg', altText: 'تاتا نيكسون إلكتريك - خلف', isPrimary: false, order: 2 },
      { vehicleId: 'nexon_ev_2024', imageUrl: '/uploads/vehicles/nexon-ev/nexon-ev-interior.jpg', altText: 'تاتا نيكسون إلكتريك - داخلي', isPrimary: false, order: 3 },
      
      // Nexon Petrol images
      { vehicleId: 'nexon_petrol_2024', imageUrl: '/uploads/vehicles/nexon/nexon-front.jpg', altText: 'تاتا نيكسون - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'nexon_petrol_2024', imageUrl: '/uploads/vehicles/nexon/nexon-side.jpg', altText: 'تاتا نيكسون - جانب', isPrimary: false, order: 1 },
      { vehicleId: 'nexon_petrol_2024', imageUrl: '/uploads/vehicles/nexon/nexon-rear.jpg', altText: 'تاتا نيكسون - خلف', isPrimary: false, order: 2 },
      
      // Punch images
      { vehicleId: 'punch_2024', imageUrl: '/uploads/vehicles/punch/punch-front.jpg', altText: 'تاتا بانش - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'punch_2024', imageUrl: '/uploads/vehicles/punch/punch-side.jpg', altText: 'تاتا بانش - جانب', isPrimary: false, order: 1 },
      { vehicleId: 'punch_2024', imageUrl: '/uploads/vehicles/punch/punch-rear.jpg', altText: 'تاتا بانش - خلف', isPrimary: false, order: 2 },
      
      // Tiago EV images
      { vehicleId: 'tiago_ev_2024', imageUrl: '/uploads/vehicles/tiago-ev/tiago-ev-front.jpg', altText: 'تاتا تياجو إلكتريك - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'tiago_ev_2024', imageUrl: '/uploads/vehicles/tiago-ev/tiago-ev-side.jpg', altText: 'تاتا تياجو إلكتريك - جانب', isPrimary: false, order: 1 },
      
      // Tiago Petrol images
      { vehicleId: 'tiago_petrol_2024', imageUrl: '/uploads/vehicles/tiago/tiago-front.jpg', altText: 'تاتا تياجو - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'tiago_petrol_2024', imageUrl: '/uploads/vehicles/tiago/tiago-side.jpg', altText: 'تاتا تياجو - جانب', isPrimary: false, order: 1 },
      
      // Altroz images
      { vehicleId: 'altroz_2024', imageUrl: '/uploads/vehicles/altroz/altroz-front.jpg', altText: 'تاتا ألتروز - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'altroz_2024', imageUrl: '/uploads/vehicles/altroz/altroz-side.jpg', altText: 'تاتا ألتروز - جانب', isPrimary: false, order: 1 },
      
      // Harrier images
      { vehicleId: 'harrier_2024', imageUrl: '/uploads/vehicles/harrier/harrier-front.jpg', altText: 'تاتا هارير - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'harrier_2024', imageUrl: '/uploads/vehicles/harrier/harrier-side.jpg', altText: 'تاتا هارير - جانب', isPrimary: false, order: 1 },
      { vehicleId: 'harrier_2024', imageUrl: '/uploads/vehicles/harrier/harrier-interior.jpg', altText: 'تاتا هارير - داخلي', isPrimary: false, order: 2 },
      
      // Safari images
      { vehicleId: 'safari_2024', imageUrl: '/uploads/vehicles/safari/safari-front.jpg', altText: 'تاتا سفاري - أمام', isPrimary: true, order: 0 },
      { vehicleId: 'safari_2024', imageUrl: '/uploads/vehicles/safari/safari-side.jpg', altText: 'تاتا سفاري - جانب', isPrimary: false, order: 1 },
      { vehicleId: 'safari_2024', imageUrl: '/uploads/vehicles/safari/safari-rear.jpg', altText: 'تاتا سفاري - خلف', isPrimary: false, order: 2 }
    ]

    let createdImages = 0
    for (const imageData of vehicleImages) {
      try {
        await prisma.vehicleImage.create({ data: imageData })
        createdImages++
      } catch (error) {
        // Image already exists
      }
    }
    console.log(`✅ Vehicle images created: ${createdImages} new images`)

    console.log('\n🎉 Comprehensive database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   🏢 Branches: 2`)
    console.log(`   🔐 Permissions: ${createdPermissions}`)
    console.log(`   👥 Role Templates: 4`)
    console.log(`   👤 Users: ${createdUsers} new users`)
    console.log(`   ⚙️ Site Settings: 1`)
    console.log(`   🎠 Sliders: ${createdSliders}`)
    console.log(`   🔧 Service Types: ${createdServices}`)
    console.log(`   🚗 Vehicles: ${createdVehicles.length}`)
    console.log(`   📸 Vehicle Images: ${createdImages}`)
    
    console.log('\n🔑 Login Credentials:')
    console.log('   Super Admin: admin@elhamd-cars.com / admin123')
    console.log('   Manager: manager.cairo@elhamd-cars.com / admin123')
    console.log('   Sales Rep 1: sales.rep1@elhamd-cars.com / admin123')
    console.log('   Sales Rep 2: sales.rep2@elhamd-cars.com / admin123')
    console.log('   Service Advisor: service.advisor1@elhamd-cars.com / admin123')
    console.log('   Customer 1: customer1@example.com / admin123')
    console.log('   Customer 2: customer2@example.com / admin123')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })