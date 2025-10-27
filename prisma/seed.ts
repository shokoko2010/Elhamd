// prisma/merged-seed-clean.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Starting CLEAN seed (delete all -> recreate)')

  // Models to clean (same as original files)
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

  // Delete in order (best-effort, ignore errors)
  for (const modelName of modelNames) {
    try {
      // prisma model client names are lowercased plural in runtime; use (prisma as any)[modelName.toLowerCase()]
      // deleteMany is safe - will delete all rows of the model if it exists
      const key = modelName[0].toLowerCase() + modelName.slice(1)
      if ((prisma as any)[key] && (prisma as any)[key].deleteMany) {
        await (prisma as any)[key].deleteMany()
        console.log(`✓ Cleared ${modelName}`)
      } else {
        // fallback: try direct deleteMany on lowercased name
        const low = modelName.toLowerCase()
        if ((prisma as any)[low] && (prisma as any)[low].deleteMany) {
          await (prisma as any)[low].deleteMany()
          console.log(`✓ Cleared ${modelName} (lowercase)`)
        }
      }
    } catch (err) {
      // ignore
    }
  }

  // 1. SITE SETTINGS (create)
  const siteSettings = await prisma.siteSettings.create({
    data: {
      siteTitle: 'شركة الحمد لاستيراد السيارات',
      siteDescription: 'الوكيل الحصري لشركة تاتا موتورز في مصر - السيارات التجارية والبيك أب والشاحنات',
      contactEmail: 'info@elhamdimport.online',
      contactPhone: '+20 2 12345678',
      contactAddress: 'القنطرة غرب، الإسماعيلية، مصر',
      socialLinks: {
        facebook: 'https://facebook.com/elhamdimport',
        twitter: 'https://twitter.com/elhamdimport',
        instagram: 'https://instagram.com/elhamdimport',
        linkedin: 'https://linkedin.com/company/elhamdimport'
      },
      workingHours: 'السبت - الخميس: 9:00 ص - 5:00 م، الجمعة: مغلق'
    }
  })
  console.log('✓ siteSettings created')

  // 2. COMPANY INFO
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
  console.log('✓ companyInfo created')

  // 3. Company Stats
  await prisma.companyStat.createMany({
    data: [
      { number: '5000+', label: 'عملاء سعداء', icon: 'users' },
      { number: '10000+', label: 'مركبة مباعة', icon: 'truck' },
      { number: '14+', label: 'سنوات خبرة', icon: 'award' },
      { number: '1', label: 'فرع', icon: 'map-pin' }
    ]
  })
  console.log('✓ companyStat created')

  // 4. Company Values
  await prisma.companyValue.createMany({
    data: [
      { title: 'الجودة', description: 'نقدم منتجات وخدمات عالية الجودة تلبي أعلى المعايير', icon: 'shield' },
      { title: 'الموثوقية', description: 'نضمن موثوقية عالية في جميع منتجاتنا وخدماتنا', icon: 'check-circle' },
      { title: 'خدمة العملاء', description: 'نقدم خدمة عملاء ممتازة على مدار الساعة', icon: 'headphones' },
      { title: 'الابتكار', description: 'نسعى دائماً للابتكار وتطوير حلول جديدة', icon: 'lightbulb' }
    ]
  })
  console.log('✓ companyValue created')

  // 5. Services (from homepage)
  const services = [
    {
      id: 'service-sales',
      title: 'بيع سيارات جديدة',
      description: 'أحدث موديلات سيارات تاتا مع ضمان المصنع',
      icon: '🚗',
      link: '/vehicles',
      order: 0
    },
    {
      id: 'service-finance',
      title: 'تمويل سيارات',
      description: 'خطط تمويلية ميسرة تناسب جميع الميزانيات',
      icon: '💰',
      link: '/financing',
      order: 1
    },
    {
      id: 'service-maintenance',
      title: 'صيانة معتمدة',
      description: 'مركز صيانة معتمد يوفر أفضل الخدمات الفنية',
      icon: '🔧',
      link: '/maintenance',
      order: 2
    },
    {
      id: 'service-parts',
      title: 'قطع غيار أصلية',
      description: 'قطع غيار أصلية مضمونة من تاتا موتورز',
      icon: '⚙️',
      link: '/parts',
      order: 3
    },
    {
      id: 'service-warranty',
      title: 'ضمان شامل',
      description: 'ضمان شامل على جميع السيارات والخدمات',
      icon: '🛡️',
      link: '/warranty',
      order: 4
    },
    {
      id: 'service-support',
      title: 'دعم فني 24/7',
      description: 'فريق دعم فني متواصل على مدار الساعة',
      icon: '📞',
      link: '/support',
      order: 5
    }
  ]

  for (const s of services) {
    await prisma.serviceItem.create({ data: s })
  }
  console.log('✓ serviceItem created')

  // 6. Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      { year: '2010', title: 'تأسيس الشركة', description: 'تأسست شركة الحمد لاستيراد السيارات كوكيل لـ تاتا موتورز' },
      { year: '2015', title: 'توسع الخدمات', description: 'إضافة خدمات الصيانة وقطع الغيار' },
      { year: '2020', title: 'التحول الرقمي', description: 'إطلاق النظام الإلكتروني لإدارة المبيعات والخدمات' },
      { year: '2024', title: 'التطوير المستمر', description: 'تحديث النظام وتوسيع قاعدة العملاء' }
    ]
  })
  console.log('✓ timelineEvent created')

  // 7. Contact Info
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
  console.log('✓ contactInfo created')

  // 8. Permissions - using the correct permission names from the system
  const permissions = [
    // User Management
    { name: 'view_users', description: 'عرض المستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'create_users', description: 'إنشاء مستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'edit_users', description: 'تعديل المستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'delete_users', description: 'حذف المستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'manage_user_roles', description: 'إدارة أدوار المستخدمين', category: 'USER_MANAGEMENT' },
    { name: 'manage_user_permissions', description: 'إدارة صلاحيات المستخدمين', category: 'USER_MANAGEMENT' },

    // Vehicle Management
    { name: 'view_vehicles', description: 'عرض المركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'create_vehicles', description: 'إنشاء مركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'edit_vehicles', description: 'تعديل المركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'delete_vehicles', description: 'حذف المركبات', category: 'VEHICLE_MANAGEMENT' },
    { name: 'manage_vehicle_inventory', description: 'إدارة مخزون المركبات', category: 'VEHICLE_MANAGEMENT' },

    // Booking Management
    { name: 'view_bookings', description: 'عرض الحجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'create_bookings', description: 'إنشاء حجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'edit_bookings', description: 'تعديل الحجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'delete_bookings', description: 'حذف الحجوزات', category: 'BOOKING_MANAGEMENT' },
    { name: 'manage_booking_status', description: 'إدارة حالة الحجوزات', category: 'BOOKING_MANAGEMENT' },

    // Service Management
    { name: 'view_services', description: 'عرض الخدمات', category: 'SERVICE_MANAGEMENT' },
    { name: 'create_services', description: 'إنشاء خدمات', category: 'SERVICE_MANAGEMENT' },
    { name: 'edit_services', description: 'تعديل الخدمات', category: 'SERVICE_MANAGEMENT' },
    { name: 'delete_services', description: 'حذف الخدمات', category: 'SERVICE_MANAGEMENT' },
    { name: 'manage_service_schedule', description: 'إدارة جدول الخدمات', category: 'SERVICE_MANAGEMENT' },

    // Inventory Management
    { name: 'view_inventory', description: 'عرض المخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'create_inventory_items', description: 'إنشاء أصناف مخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'edit_inventory_items', description: 'تعديل أصناف المخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'delete_inventory_items', description: 'حذف أصناف المخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'manage_warehouses', description: 'إدارة المستودعات', category: 'INVENTORY_MANAGEMENT' },
    { name: 'manage_suppliers', description: 'إدارة الموردين', category: 'INVENTORY_MANAGEMENT' },
    { name: 'sync_vehicles_to_inventory', description: 'مزامنة المركبات مع المخزون', category: 'INVENTORY_MANAGEMENT' },
    { name: 'initialize_inventory_data', description: 'تهيئة بيانات المخزون', category: 'INVENTORY_MANAGEMENT' },

    // Financial Management
    { name: 'view_financials', description: 'عرض البيانات المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'create_invoices', description: 'إنشاء فواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'edit_invoices', description: 'تعديل الفواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'delete_invoices', description: 'حذف الفواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'manage_payments', description: 'إدارة المدفوعات', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'view_reports', description: 'عرض التقارير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'export_financial_data', description: 'تصدير البيانات المالية', category: 'FINANCIAL_MANAGEMENT' },

    // Enhanced Financial Permissions
    { name: 'view_invoices', description: 'عرض الفواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'create_quotations', description: 'إنشاء عروض أسعار', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'edit_quotations', description: 'تعديل عروض الأسعار', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'delete_quotations', description: 'حذف عروض الأسعار', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'view_payments', description: 'عرض المدفوعات', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'create_payments', description: 'إنشاء مدفوعات', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'edit_payments', description: 'تعديل المدفوعات', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'view_financial_reports', description: 'عرض التقارير المالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'approve_invoices', description: 'الموافقة على الفواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'send_invoices', description: 'إرسال الفواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'download_invoices', description: 'تحميل الفواتير', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'manage_quotations', description: 'إدارة عروض الأسعار', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'approve_quotations', description: 'الموافقة على عروض الأسعار', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'convert_quotations', description: 'تحويل عروض الأسعار', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'process_offline_payments', description: 'معالجة المدفوعات النقدية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'manage_payment_methods', description: 'إدارة طرق الدفع', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'view_payment_history', description: 'عرض سجل المدفوعات', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'refund_payments', description: 'استرداد المدفوعات', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'manage_tax_settings', description: 'إدارة إعدادات الضرائب', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'view_financial_overview', description: 'عرض نظرة عامة مالية', category: 'FINANCIAL_MANAGEMENT' },
    { name: 'access_finance_dashboard', description: 'الوصول للوحة التحكم المالية', category: 'FINANCIAL_MANAGEMENT' },

    // Branch Management
    { name: 'view_branches', description: 'عرض الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'create_branches', description: 'إنشاء فروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'edit_branches', description: 'تعديل الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'delete_branches', description: 'حذف الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'manage_branch_staff', description: 'إدارة موظفي الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'manage_branch_budget', description: 'إدارة ميزانية الفروع', category: 'BRANCH_MANAGEMENT' },
    { name: 'approve_branch_transfers', description: 'الموافقة على تحويلات الفروع', category: 'BRANCH_MANAGEMENT' },

    // Customer Management
    { name: 'view_customers', description: 'عرض العملاء', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'create_customers', description: 'إنشاء عملاء', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'edit_customers', description: 'تعديل العملاء', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'delete_customers', description: 'حذف العملاء', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'manage_customer_profiles', description: 'إدارة ملفات العملاء', category: 'CUSTOMER_MANAGEMENT' },
    { name: 'view_customer_history', description: 'عرض سجل العملاء', category: 'CUSTOMER_MANAGEMENT' },

    // Marketing Management
    { name: 'view_campaigns', description: 'عرض الحملات', category: 'MARKETING_MANAGEMENT' },
    { name: 'create_campaigns', description: 'إنشاء حملات', category: 'MARKETING_MANAGEMENT' },
    { name: 'edit_campaigns', description: 'تعديل الحملات', category: 'MARKETING_MANAGEMENT' },
    { name: 'delete_campaigns', description: 'حذف الحملات', category: 'MARKETING_MANAGEMENT' },
    { name: 'manage_email_templates', description: 'إدارة قوالب البريد الإلكتروني', category: 'MARKETING_MANAGEMENT' },

    // System Settings
    { name: 'view_system_settings', description: 'عرض إعدادات النظام', category: 'SYSTEM_SETTINGS' },
    { name: 'manage_system_settings', description: 'إدارة إعدادات النظام', category: 'SYSTEM_SETTINGS' },
    { name: 'manage_roles_templates', description: 'إدارة أدوار وقوالب', category: 'SYSTEM_SETTINGS' },
    { name: 'view_system_logs', description: 'عرض سجلات النظام', category: 'SYSTEM_SETTINGS' },
    { name: 'manage_backups', description: 'إدارة النسخ الاحتياطية', category: 'SYSTEM_SETTINGS' },

    // Reporting
    { name: 'generate_reports', description: 'إنشاء تقارير', category: 'REPORTING' },
    { name: 'view_analytics', description: 'عرض التحليلات', category: 'REPORTING' },
    { name: 'export_data', description: 'تصدير البيانات', category: 'REPORTING' },
    { name: 'manage_dashboards', description: 'إدارة لوحات التحكم', category: 'REPORTING' }
  ]

  const createdPermissions = await Promise.all(permissions.map(p => prisma.permission.create({ data: p })))
  console.log('✓ permissions created')

  // 9. Role Templates - using the correct permission names
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
        'view_vehicles', 'create_vehicles', 'edit_vehicles',
        'view_bookings', 'create_bookings', 'edit_bookings',
        'view_users', 'create_users', 'edit_users',
        'view_inventory', 'create_inventory_items', 'edit_inventory_items',
        'view_financials', 'view_customers', 'create_customers', 'edit_customers',
        'view_reports', 'view_analytics'
      ],
      isSystem: true
    },
    {
      name: 'Sales Manager',
      description: 'مدير مبيعات',
      role: 'STAFF',
      permissions: [
        'view_vehicles', 'view_bookings', 'create_bookings', 'edit_bookings',
        'view_users', 'view_customers', 'create_customers', 'edit_customers',
        'view_reports', 'view_analytics'
      ],
      isSystem: true
    },
    {
      name: 'Service Manager',
      description: 'مدير خدمة',
      role: 'STAFF',
      permissions: [
        'view_vehicles', 'view_bookings', 'create_bookings', 'edit_bookings',
        'view_inventory', 'create_inventory_items', 'edit_inventory_items',
        'view_services', 'create_services', 'edit_services',
        'view_reports', 'view_analytics'
      ],
      isSystem: true
    },
    {
      name: 'Sales Employee',
      description: 'موظف مبيعات',
      role: 'STAFF',
      permissions: [
        'view_vehicles', 'view_bookings', 'create_bookings', 'edit_bookings',
        'view_customers', 'create_customers', 'edit_customers'
      ],
      isSystem: true
    },
    {
      name: 'Service Employee',
      description: 'موظف خدمة',
      role: 'STAFF',
      permissions: [
        'view_vehicles', 'view_bookings', 'create_bookings', 'edit_bookings',
        'view_inventory', 'view_services'
      ],
      isSystem: true
    },
    {
      name: 'Customer',
      description: 'عميل',
      role: 'CUSTOMER',
      permissions: ['view_vehicles', 'view_bookings', 'create_bookings'],
      isSystem: true
    }
  ]

  const createdRoles = []
  for (const role of roleTemplates) {
    try {
      const r = await prisma.roleTemplate.create({ data: role })
      createdRoles.push(r)
    } catch (err) {
      // ignore duplicates
      const existing = await prisma.roleTemplate.findFirst({ where: { name: role.name } })
      if (existing) createdRoles.push(existing)
    }
  }
  console.log('✓ roleTemplates created')

  // 10. Main Branch
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
  console.log('✓ main branch created')

  // 11. Users
  const superAdminRole = createdRoles.find(r => r.role === 'SUPER_ADMIN')
  const branchManagerRole = createdRoles.find(r => r.role === 'BRANCH_MANAGER')
  const staffRole = createdRoles.find(r => r.role === 'STAFF')
  const customerRole = createdRoles.find(r => r.role === 'CUSTOMER')

  const users = [
    {
      email: 'admin@elhamdimport.online',
      name: 'مدير النظام',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
      phone: '+20 1012345678',
      isActive: true,
      emailVerified: true,
      roleTemplateId: superAdminRole?.id,
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
      roleTemplateId: branchManagerRole?.id,
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
      roleTemplateId: staffRole?.id,
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
      roleTemplateId: staffRole?.id,
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
      roleTemplateId: staffRole?.id,
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
      roleTemplateId: staffRole?.id,
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
      roleTemplateId: staffRole?.id,
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
      roleTemplateId: customerRole?.id,
      branchId: mainBranch.id
    }
  ]

  for (const u of users) {
    try {
      await prisma.user.create({ data: u as any })
    } catch (err) {
      // ignore duplicates on clean create - but since we deleted earlier, shouldn't happen
    }
  }
  console.log('✓ users created')

  // 12. SLIDERS & HOMEPAGE (from homepage-seed)
  const sliders = [
    {
      id: 'slider-0',
      title: 'تاتا نيكسون إي في 2024',
      subtitle: 'ثورة في عالم السيارات الكهربائية',
      description: 'استمتع بأحدث تقنيات السيارات الكهربائية مع أداء استثنائي وتصميم عصري',
      imageUrl: '/uploads/vehicles/1/tata-nexon-ev-hero.jpg',
      ctaText: 'اكتشف المزيد',
      ctaLink: '/vehicles/tata-nexon-ev',
      badge: 'جديد',
      badgeColor: 'bg-green-500',
      order: 0
    },
    {
      id: 'slider-1',
      title: 'تاتا بانش 2024',
      subtitle: 'القوة في حجم صغير',
      description: 'سيارة مدمجة قوية ومثالية للمدينة، تجمع بين الأداء وكفاءة استهلاك الوقود',
      imageUrl: '/uploads/vehicles/2/tata-punch-hero.jpg',
      ctaText: 'اطلب الآن',
      ctaLink: '/vehicles/tata-punch',
      badge: 'الأكثر مبيعاً',
      badgeColor: 'bg-red-500',
      order: 1
    },
    {
      id: 'slider-2',
      title: 'عروض خاصة',
      subtitle: 'وفر حتى 25% على سيارات تاتا',
      description: 'فرصة محدودة للاستفادة من أفضل العروض على سيارات تاتا المميزة',
      imageUrl: '/uploads/special-offer-hero.jpg',
      ctaText: 'شاهد العروض',
      ctaLink: '/vehicles?offers=true',
      badge: 'عرض محدود',
      badgeColor: 'bg-orange-500',
      order: 2
    }
  ]

  for (const s of sliders) {
    await prisma.slider.create({ data: s as any })
  }
  console.log('✓ sliders created')

  // 13. VEHICLES (full dataset from your seed.ts) - create them all
  // Below is the full vehiclesData array extracted from your original seed.ts
  const vehiclesData = [
    {
      title: 'PRIMA 3328.K',
      description: 'شاحنة Tata Motors Prima 3328.K هي شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة. تعمل الشاحنة بمحرك Cummins ISBe مبرد بالم الماء، بحقن مباشر، مزود بشاحن توربيني ومبرد لاحق، ديزل، يولد قدرة قصوى تبلغ 269 حصان عند 2500 دورة/دقيقة، وعزم دوران أقصى 970 نيوتن.متر.',
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
      tagline: 'الوكيل الحصري لشركة تاتا موتورز في مصر',
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
      tagline: 'الوكيل الحصري لشركة تاتا موتورز في مصر - متخصصون في السيارات التجارية والبيك أب والشاحنات',
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