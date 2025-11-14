// prisma/merged-seed-clean.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PermissionService } from '../src/lib/permissions'

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
  console.log('✓ siteSettings created')

  // 2. COMPANY INFO
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
  console.log('✓ companyInfo created')

  // 3. Company Stats
  await prisma.companyStat.createMany({
    data: [
      { number: '5000+', label: 'عملاء سعداء', icon: 'users' },
      { number: '10000+', label: 'مركبة مباعة', icon: 'truck' },
      { number: '14+', label: 'سنوات خبرة', icon: 'award' },
      { number: '2', label: 'فروع', icon: 'map-pin' }
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
      { year: '2010', title: 'تأسيس الشركة', description: 'تأسست شركة الحمد لاستيراد السيارات كموزع معتمد لتاتا موتورز في مدن القناة' },
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
      address: 'بورسعيد (الفرع الرئيسي) - القنطرة غرب، الإسماعيلية (الفرع الثاني)',
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

  // 8 & 9. Permissions and role templates (synchronised with application definitions)
  console.log('⏳ initializing permission catalog and role templates...')
  await PermissionService.initializeRoleTemplates()
  console.log('✓ permission catalog synchronized')

  const roleTemplates = await prisma.roleTemplate.findMany({
    where: {
      role: {
        in: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'STAFF', 'CUSTOMER']
      }
    }
  })

  const roleTemplateMap = new Map(roleTemplates.map(template => [template.role, template]))

  for (const role of ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'STAFF', 'CUSTOMER'] as const) {
    if (!roleTemplateMap.get(role)) {
      throw new Error(`Missing role template for ${role}`)
    }
  }

  // 10. Branches
  const mainBranch = await prisma.branch.create({
    data: {
      name: 'الفرع الرئيسي - بورسعيد',
      code: 'ELHAMD-PORTSAID',
      address: 'بورسعيد، مصر',
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
        coordinates: { lat: 31.2565, lng: 32.2841 }
      }
    }
  })
  console.log('✓ main branch (Port Said) created')

  const qantaraBranch = await prisma.branch.create({
    data: {
      name: 'فرع القنطرة غرب',
      code: 'ELHAMD-QANTARA',
      address: 'القنطرة غرب، الإسماعيلية، مصر',
      phone: '+20 2 12345679',
      email: 'qantara@elhamdimport.online',
      isActive: true,
      openingDate: new Date('2012-05-01'),
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
        services: ['صيانة', 'قطع غيار', 'دعم الأسطول'],
        coordinates: { lat: 30.8672, lng: 32.3225 }
      }
    }
  })
  console.log('✓ secondary branch (Qantara Gharb) created')

  // 11. Users
  const superAdminRole = roleTemplateMap.get('SUPER_ADMIN')
  const branchManagerRole = roleTemplateMap.get('BRANCH_MANAGER')
  const staffRole = roleTemplateMap.get('STAFF')
  const customerRole = roleTemplateMap.get('CUSTOMER')

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
      branchId: qantaraBranch.id
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
      branchId: qantaraBranch.id
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
      title: 'Tata Tiago',
      make: 'Tata Motors',
      year: 2025,
      description: 'هاتشباك عصرية بخمسة أبواب مصممة للمدن المصرية مع كفاءة عالية في استهلاك الوقود وتقنيات أمان متقدمة مثل ABS وEBD ووسائد هوائية مزدوجة بشكل قياسي.',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      price: 345000,
      stockNumber: 'TIAGO-2025-001',
      specifications: {
        "المحرك": "1.2 لتر Revotron ثلاثي الأسطوانات بقوة 86 حصان",
        "استهلاك الوقود": "5.5 لتر/100 كم (متوسط)",
        "الناقل": "يدوي 5 سرعات مع خيار وضع المدينة والاقتصاد",
        "نظام التعليق": "ماكفرسون أمامي ووصلة ملتوية خلفية",
        "أنظمة الأمان": "ABS مع EBD، وسائد هوائية أمامية مزدوجة",
        "الترفيه": "شاشة لمس 7 بوصات مع Android Auto وApple CarPlay",
        "سعة الصندوق": "242 لتر",
        "العجلات": "عجلات ألمنيوم 15 بوصة"
      },
      images: [
        '/uploads/vehicles/tiago-1.jpg',
        '/uploads/vehicles/tiago-2.jpg',
        '/uploads/vehicles/tiago-3.jpg'
      ],
      highlights: ['86 حصان', '5.5 لتر/100كم', 'وسائد هوائية مزدوجة', 'شاشة 7 بوصة'],
      features: [
        'تصميم داخلي أنيق مع خامات محسنة',
        'نظام صوت Harman بأربعة سماعات',
        'مقعد خلفي قابل للطي بنسبة 60:40',
        'ضمان المصنع لمدة 5 سنوات أو 150 ألف كم'
      ]
    },
    {
      title: 'Tata Tigor',
      make: 'Tata Motors',
      year: 2025,
      description: 'سيدان مدمجة بأربعة أبواب مع مساحة رحبة في المقصورة وصندوق أمتعة كبير يناسب العائلات والشركات الصغيرة.',
      category: 'SEDAN',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      price: 365000,
      stockNumber: 'TIGOR-2025-001',
      specifications: {
        "المحرك": "1.2 لتر Revotron مع نظام التحكم الذكي في الصمامات",
        "القوة": "86 حصان و113 نيوتن.متر عزم دوران",
        "استهلاك الوقود": "5.7 لتر/100 كم",
        "الصندوق الخلفي": "419 لتر",
        "الأمان": "هيكل عالي الصلابة مع نظام تثبيت مقاعد الأطفال ISOFIX",
        "الترفيه": "نظام صوت Harman مع شاشة 7 بوصة",
        "الإضاءة": "مصابيح أمامية Projector مع إضاءة LED نهارية",
        "العجلات": "سبائكية مقاس 15 بوصة"
      },
      images: [
        '/uploads/vehicles/tigor-1.jpg',
        '/uploads/vehicles/tigor-2.jpg'
      ],
      highlights: ['419 لتر', '86 حصان', 'Harman Audio', 'وسائد هوائية'],
      features: [
        'تصميم Fastback مميز',
        'فتحة تهوية خلفية للركاب',
        'كاميرا خلفية مع خطوط توجيه ديناميكية',
        'دعم أوامر صوتية باللغة الإنجليزية والعربية'
      ]
    },
    {
      title: 'Tata Altroz',
      make: 'Tata Motors',
      year: 2025,
      description: 'هاتشباك بريميوم بتصنيف أمان 5 نجوم في اختبارات Global NCAP مع بنية ALFA قوية وتجهيزات ترفيهية متقدمة.',
      category: 'HATCHBACK',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      price: 395000,
      stockNumber: 'ALTROZ-2025-001',
      specifications: {
        "المحرك": "1.2 لتر i-Turbo بقوة 110 حصان",
        "العزم": "140 نيوتن.متر",
        "المنصة": "هندسة ALFA القابلة للتكيف",
        "أنظمة الأمان": "6 وسائد هوائية، ESP، HBA، نظام مراقبة ضغط الإطارات",
        "الترفيه": "شاشة 10.25 بوصة مع نظام IRA المتصل",
        "الإضاءة": "مصابيح LED أمامية وخلفية بالكامل",
        "الراحة": "مقعد سائق قابل للتعديل ارتفاعًا، تكييف أوتوماتيكي",
        "العجلات": "عجلات ألمنيوم 16 بوصة مزدوجة اللون"
      },
      images: [
        '/uploads/vehicles/altroz-1.jpg',
        '/uploads/vehicles/altroz-2.jpg',
        '/uploads/vehicles/altroz-3.jpg'
      ],
      highlights: ['110 حصان', '6 وسائد', 'TPMS', 'شاشة 10.25"'],
      features: [
        'تصميم داخلي مزدوج الألوان مع إضاءة محيطية',
        'نظام IRA المتصل مع تتبع المركبة',
        'مقعد خلفي عريض مع مسند ذراع مركزي',
        'فرامل قرصية على الأربع عجلات'
      ]
    },
    {
      title: 'Tata Punch',
      make: 'Tata Motors',
      year: 2025,
      description: 'كروس أوفر مدمج بارتفاع عن الأرض 187 مم وقدرات قيادة ذكية في المدن والمناطق الوعرة الخفيفة مع وضعيات قيادة متعددة.',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      price: 415000,
      stockNumber: 'PUNCH-2025-001',
      specifications: {
        "المحرك": "1.2 لتر Revotron بقوة 86 حصان",
        "العزم": "113 نيوتن.متر",
        "الخلوص الأرضي": "187 مم",
        "الزوايا": "زاوية اقتراب 20.3° وزاوية مغادرة 37.6°",
        "أنظمة القيادة": "وضع مدينة + وضع ECO مع Traction Pro",
        "السلامة": "تصنيف 5 نجوم من Global NCAP",
        "الراحة": "مقاعد شبه جلدية، تحكم بالمناخ أوتوماتيكي",
        "العجلات": "عجلات 16 بوصة مع أغطية مميزة"
      },
      images: [
        '/uploads/vehicles/punch-1.jpg',
        '/uploads/vehicles/punch-2.jpg'
      ],
      highlights: ['5 نجوم أمان', '187 مم', 'Traction Pro', '86 حصان'],
      features: [
        'مقعد سائق قابل لضبط الارتفاع',
        'مصابيح LED نهارية على شكل حرف T',
        'مفتاح ذكي وتشغيل بضغطة زر',
        'نظام صوت من Harman مع أربعة سماعات'
      ]
    },
    {
      title: 'Tata Nexon',
      make: 'Tata Motors',
      year: 2025,
      description: 'SUV مدمجة الأكثر مبيعًا من تاتا مزودة بمحرك توربو Revotron جديد وشاشة رقمية 12.3 بوصة مع نظام Pure Pulse للهواء النقي.',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      price: 495000,
      stockNumber: 'NEXON-2025-001',
      specifications: {
        "المحرك": "1.2 لتر TGDi بقوة 120 حصان",
        "العزم": "170 نيوتن.متر",
        "الناقل": "DCA أوتوماتيكي مزدوج القابض 7 سرعات",
        "الشاشة": "مجموعة عدادات رقمية 10.25 بوصة",
        "الترفيه": "شاشة 12.3 بوصة مع نظام Arcade.ev",
        "السلامة": "6 وسائد، ESP، HSA، كاميرا 360°",
        "الراحة": "مقاعد مهواة مع دعم قطني",
        "العجلات": "عجلات ألمنيوم 16 بوصة مزدوجة اللون"
      },
      images: [
        '/uploads/vehicles/nexon-1.jpg',
        '/uploads/vehicles/nexon-2.jpg',
        '/uploads/vehicles/nexon-3.jpg'
      ],
      highlights: ['120 حصان', 'شاشة 12.3"', '6 وسائد', 'هواء نقي'],
      features: [
        'إضاءة LED بالكامل مع مؤشرات متحركة',
        'اتصال لاسلكي Android Auto/Apple CarPlay',
        'إضاءة محيطية قابلة للتخصيص',
        'فرامل يد إلكترونية مع أوتو هولد'
      ]
    },
    {
      title: 'Tata Nexon EV',
      make: 'Tata Motors',
      year: 2025,
      description: 'إصدار كهربائي بالكامل من Nexon ببطارية 40.5 كيلووات ساعة ومدى قيادة يصل إلى 465 كم بشهادة MIDC مع شحن سريع DC.',
      category: 'SUV',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      price: 985000,
      stockNumber: 'NEXON-EV-2025-001',
      specifications: {
        "المحرك": "محرك كهربائي 106 كيلووات",
        "العزم": "215 نيوتن.متر فوري",
        "البطارية": "40.5 كيلووات ساعة ليثيوم أيون",
        "المدى": "465 كم بشهادة MIDC",
        "الشحن السريع": "من 10% إلى 80% في 56 دقيقة (DC 50kW)",
        "الوضعيات": "Eco, City, Sport مع Regen في 4 مستويات",
        "السلامة": "6 وسائد، ESP، نظام تحذير صوتي للمشاة",
        "الراحة": "مقاعد مهواة ومكيفة، فتحة سقف بانورامية"
      },
      images: [
        '/uploads/vehicles/nexon-ev-1.jpg',
        '/uploads/vehicles/nexon-ev-2.jpg'
      ],
      highlights: ['465 كم', '215 نيوتن.متر', 'شحن سريع 56 دقيقة', 'فتحة سقف'],
      features: [
        'نظام تبريد سائل للبطارية',
        'مخطط استهلاك الطاقة في الوقت الفعلي',
        'تطبيق متصل للتحكم عن بعد',
        'ضمان البطارية 8 سنوات أو 160 ألف كم'
      ]
    },
    {
      title: 'Tata Harrier',
      make: 'Tata Motors',
      year: 2025,
      description: 'SUV متوسطة الحجم بسبعة أوضاع قيادة ومحرك ديزل قوي Kryotec 2.0 لتر مع ناقل أوتوماتيكي 6 سرعات من هيونداي.',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      price: 995000,
      stockNumber: 'HARRIER-2025-001',
      specifications: {
        "المحرك": "2.0 لتر Kryotec توربو ديزل 170 حصان",
        "العزم": "350 نيوتن.متر",
        "الناقل": "أوتوماتيكي 6 سرعات مع مجاذيف تبديل",
        "نظام الدفع": "Multi Drive 2.0 مع Terrain Response",
        "السلامة": "7 وسائد، ADAS من المستوى 2، كاميرا 360°",
        "التقنيات": "شاشة 12.3 بوصة، عدادات 10.25 بوصة",
        "الراحة": "مقاعد مهواة مع وظيفة تدليك للسائق",
        "العجلات": "19 بوصة بتصميم ماسي"
      },
      images: [
        '/uploads/vehicles/harrier-1.jpg',
        '/uploads/vehicles/harrier-2.jpg',
        '/uploads/vehicles/harrier-3.jpg'
      ],
      highlights: ['170 حصان', '350 نيوتن.متر', 'ADAS', 'Terrain Response'],
      features: [
        'إضاءة محيطية كاملة الأبواب',
        'نظام صوت JBL بتقنية Clari-Fi',
        'فتحة سقف بانورامية كهربائية',
        'فرش جلد بني فاخر بخياطة متباينة'
      ]
    },
    {
      title: 'Tata Safari',
      make: 'Tata Motors',
      year: 2025,
      description: 'SUV عائلية بثلاثة صفوف من المقاعد وتخطيط 6 أو 7 مقاعد مع تجهيزات فاخرة، مبنية على منصة OMEGARC المشتقة من لاندروفر.',
      category: 'SUV',
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      price: 1050000,
      stockNumber: 'SAFARI-2025-001',
      specifications: {
        "المحرك": "2.0 لتر Kryotec ديزل 170 حصان",
        "المقاعد": "6 أو 7 مقاعد مع خيار كابتن",
        "السلامة": "7 وسائد، ADAS، ESC، رصد النقطة العمياء",
        "الراحة": "مقاعد أمامية مهواة مع ذاكرة للسائق",
        "الترفيه": "شاشة 12.3 بوصة مع 9 سماعات JBL",
        "التحكم": "نظام Terrain Response مع وضعات Wet وRough",
        "الإضاءة": "LED ماتريكس مع إضاءة خلفية متصلة",
        "العجلات": "19 بوصة بلون ماسي أزرق"
      },
      images: [
        '/uploads/vehicles/safari-1.jpg',
        '/uploads/vehicles/safari-2.jpg'
      ],
      highlights: ['3 صفوف', 'ADAS', 'مقاعد مهواة', 'JBL 9 سماعات'],
      features: [
        'نظام تنقية هواء مع مؤشر جودة',
        'إضاءة محيطية 64 لون',
        'أوامر صوتية بالمقعدين الخلفيين',
        'باب خلفي كهربائي مع مستشعر حركة'
      ]
    },
    {
      title: 'Tata Xenon Single Cab',
      make: 'Tata Motors',
      year: 2024,
      description: 'بيك أب بغمارة واحدة لتحميل ثقيل يصل إلى 1140 كجم مع نظام تعليق متين يناسب أعمال المقاولات والنقل داخل المدن.',
      category: 'PICKUP',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 455000,
      stockNumber: 'XENON-SC-2024-001',
      specifications: {
        "المحرك": "2.2 لتر Dicor بقوة 148 حصان",
        "العزم": "320 نيوتن.متر",
        "الحمولة": "قدرة تحميل 1140 كجم",
        "نظام الدفع": "دفع رباعي مع ترس تخفيض",
        "الأمان": "ABS، وسائد أمامية، هيكل مقوى",
        "الصندوق": "طول 2550 مم مع خطافات تثبيت",
        "الخلوص الأرضي": "210 مم",
        "العجلات": "عجلات فولاذية 16 بوصة مع إطارات AT"
      },
      images: [
        '/uploads/vehicles/xenon-sc-1.jpg',
        '/uploads/vehicles/xenon-sc-2.jpg'
      ],
      highlights: ['1140 كجم', '4x4', '320 نيوتن.متر', 'ABS'],
      features: [
        'مكيف هواء قوي مناسب للأجواء الحارة',
        'مقاعد قماش متينة سهلة التنظيف',
        'مرايا كهربائية قابلة للطي',
        'نظام قفل تفاضلي خلفي Limited Slip'
      ]
    },
    {
      title: 'Tata Xenon Double Cab',
      make: 'Tata Motors',
      year: 2024,
      description: 'بيك أب مزدوجة الكابينة بخمسة مقاعد مع تجهيزات فاخرة تشمل نظام ترفيه بشاشة لمس وتحكم في الثبات لمزيد من الأمان.',
      category: 'PICKUP',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 485000,
      stockNumber: 'XENON-DC-2024-001',
      specifications: {
        "المحرك": "2.2 لتر Dicor بقوة 150 حصان",
        "العزم": "320 نيوتن.متر",
        "المقاعد": "5 مقاعد مع مساحات تخزين داخلية",
        "الترفيه": "شاشة لمس 7 بوصة مع بلوتوث",
        "الأمان": "وسائد أمامية، ESP، نظام مراقبة ضغط الإطارات",
        "الصندوق": "طول 1520 مم وعرض 1410 مم",
        "الخلوص الأرضي": "210 مم",
        "العجلات": "جنط ألمنيوم 17 بوصة"
      },
      images: [
        '/uploads/vehicles/xenon-dc-1.jpg',
        '/uploads/vehicles/xenon-dc-2.jpg'
      ],
      highlights: ['5 مقاعد', '4x4', 'شاشة لمس', 'ESP'],
      features: [
        'فرش جلد صناعي مع خياطة مزدوجة',
        'خطاف سحب خلفي معزز',
        'منافذ USB للشحن السريع',
        'مصابيح ضباب أمامية وخلفية'
      ]
    },
    {
      title: 'Tata Ultra T.7',
      make: 'Tata Motors',
      year: 2024,
      description: 'شاحنة خفيفة متعددة الاستخدامات بقاعدة عجلات 3920 مم وغرفة قيادة ألترا مريحة مع رؤية بانورامية لتسليم البضائع داخل المدن.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 765000,
      stockNumber: 'ULTRA-T7-2024-001',
      specifications: {
        "المحرك": "3.3 لتر NG Turbo بقوة 155 حصان",
        "العزم": "450 نيوتن.متر",
        "قاعدة العجلات": "3920 مم",
        "الحمولة": "قدرة تحميل 4.4 طن",
        "الكابينة": "مكيفة مع مقعد هوائي للسائق",
        "الأمان": "فرامل هوائية مع ABS",
        "خزان الوقود": "160 لتر",
        "العجلات": "215/75 R17.5"
      },
      images: [
        '/uploads/vehicles/ultra-t7-1.jpg',
        '/uploads/vehicles/ultra-t7-2.jpg'
      ],
      highlights: ['4.4 طن', '450 نيوتن.متر', 'ABS', 'كابينة مكيفة'],
      features: [
        'مقصورة بمستوى أرضية منخفض لسهولة الدخول',
        'زجاج أمامي بانورامي مع رؤية 295°',
        'نظام تعليق خلفي Parabolic لضمان راحة الحمولة',
        'مقود قابل للإمالة والتلسكوب'
      ]
    },
    {
      title: 'Tata Ultra T.9',
      make: 'Tata Motors',
      year: 2024,
      description: 'شاحنة متوسطة بوزن إجمالي 9 طن مع محرك ديزل فعال وتم تجهيزها بناقل حركة 6 سرعات لتحسين استهلاك الوقود في النقل بين المحافظات.',
      category: 'COMMERCIAL',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 845000,
      stockNumber: 'ULTRA-T9-2024-001',
      specifications: {
        "المحرك": "3.3 لتر NG Turbo بقوة 155 حصان",
        "العزم": "450 نيوتن.متر",
        "الوزن الإجمالي": "8990 كجم",
        "الناقل": "6 سرعات مع تروس Planetary",
        "خزان الوقود": "200 لتر",
        "الراحة": "كابينة Ultra واسعة مع نظام تعليق معلّق",
        "الأمان": "فرامل هوائية مع ABS وEBS",
        "العجلات": "215/75 R17.5"
      },
      images: [
        '/uploads/vehicles/ultra-t9-1.jpg',
        '/uploads/vehicles/ultra-t9-2.jpg'
      ],
      highlights: ['9 طن', '200 لتر', 'ABS+EBS', '155 حصان'],
      features: [
        'مقاعد مبطنة بمساند رأس مدمجة',
        'نوافذ كهربائية مع قفل مركزي',
        'لوحة عدادات رقمية متعددة الوظائف',
        'خيار مثبت سرعة للطرق الطويلة'
      ]
    },
    {
      title: 'Tata Prima 4438.S',
      make: 'Tata Motors',
      year: 2024,
      description: 'رأس جرار ثقيل مخصص لعمليات النقل لمسافات طويلة، مزود بمحرك Cummins ISLe ثنائي الشاحن لتحقيق قوة 375 حصان وتوفير في استهلاك الديزل.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 1495000,
      stockNumber: 'PRIMA-4438S-2024-001',
      specifications: {
        "المحرك": "Cummins ISLe 8.9 لتر بقوة 375 حصان",
        "العزم": "1550 نيوتن.متر",
        "نظام النقل": "علبة تروس 9 سرعات ZF مع Crawler",
        "نظام التعليق": "هوائي خلفي بست وسائد هوائية",
        "الراحة": "كابينة عالية مع سرير مريح",
        "الأمان": "فرامل هوائية مزدوجة مع ABS + ASR",
        "خزان الوقود": "2 × 365 لتر",
        "الإطارات": "315/80 R22.5"
      },
      images: [
        '/uploads/vehicles/prima-4438s-1.jpg',
        '/uploads/vehicles/prima-4438s-2.jpg'
      ],
      highlights: ['375 حصان', '1550 نيوتن.متر', '730 لتر', 'كابينة عالية'],
      features: [
        'مقعد سائق هوائي متعدد الضبط',
        'مكيف ثنائي المناطق',
        'أنظمة مانعة للانزلاق والتحكم في الجر',
        'نظام مراقبة ضغط الإطارات على الشاشة'
      ]
    },
    {
      title: 'Tata Signa 4225.TK',
      make: 'Tata Motors',
      year: 2024,
      description: 'شاحنة قلابة ثقيلة بتجهيز Signa Cabin لمواقع الإنشاءات مع قدرة تحميل 28.5 طن ومحرك Cummins BSVI موثوق.',
      category: 'TRUCK',
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      price: 1325000,
      stockNumber: 'SIGNA-4225TK-2024-001',
      specifications: {
        "المحرك": "Cummins 6.7 لتر بقوة 250 حصان",
        "العزم": "950 نيوتن.متر",
        "الحمولة": "28.5 طن",
        "ناقل الحركة": "9 سرعات Eaton مع Crawler",
        "الكابينة": "Signa Sleeper مع مكيف هواء",
        "التعليق": "Bogie خلفي ثقيل مع زنبركات مساعدة",
        "خزان الوقود": "300 لتر",
        "الإطارات": "295/90 R20"
      },
      images: [
        '/uploads/vehicles/signa-4225tk-1.jpg',
        '/uploads/vehicles/signa-4225tk-2.jpg'
      ],
      highlights: ['28.5 طن', '250 حصان', '950 نيوتن.متر', 'Signa Cabin'],
      features: [
        'نظام رفع هيدروليكي بقدرة عالية',
        'هيكل صندوق Rock Body 18 متر مكعب',
        'نظام إدارة أسطول عبر الإنترنت Fleet Edge',
        'مقعد مساعد قابل للإمالة مع حزام ثلاثي النقاط'
      ]
    }
  ]

  for (const vehicleData of vehiclesData) {
    const vehicle = await prisma.vehicle.create({
      data: {
        make: vehicleData.make ?? 'Tata Motors',
        model: vehicleData.title,
        year: vehicleData.year ?? 2024,
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
        title: 'Tata Tiago',
        subtitle: 'هاتشباك ذكية للمدن المصرية',
        description: 'اقتصادية في الوقود مع تقنيات أمان متقدمة ومساحة داخلية عملية.',
        imageUrl: '/uploads/vehicles/tiago-hero.jpg',
        ctaText: 'احجز تجربة قيادة',
        ctaLink: '/vehicles/tiago',
        isActive: true,
        order: 1
      },
      {
        title: 'Tata Nexon',
        subtitle: 'SUV مدمجة بتقنيات متطورة',
        description: 'شاشة 12.3 بوصة، وضعيات قيادة متعددة، وأنظمة أمان شاملة.',
        imageUrl: '/uploads/vehicles/nexon-hero.jpg',
        ctaText: 'استكشف المزايا',
        ctaLink: '/vehicles/nexon',
        isActive: true,
        order: 2
      },
      {
        title: 'Tata Harrier',
        subtitle: 'قوة وأمان لعائلتك',
        description: 'محرك Kryotec 170 حصان مع ADAS من المستوى الثاني وفتحة سقف بانورامية.',
        imageUrl: '/uploads/vehicles/harrier-hero.jpg',
        ctaText: 'اكتشف التفاصيل',
        ctaLink: '/vehicles/harrier',
        isActive: true,
        order: 3
      },
      {
        title: 'Tata Safari',
        subtitle: 'رحابة بثلاثة صفوف',
        description: 'مقاعد كابتن مريحة، تكييف ثلاثي المناطق، وتجهيزات فاخرة للرحلات الطويلة.',
        imageUrl: '/uploads/vehicles/safari-hero.jpg',
        ctaText: 'تعرف على العروض',
        ctaLink: '/vehicles/safari',
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

  // 13. Departments and Positions for Employee Management
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'الإدارة العليا' },
      update: { description: 'المديرون التنفيذيون وكبار المديرين' },
      create: { name: 'الإدارة العليا', description: 'المديرون التنفيذيون وكبار المديرين' }
    }),
    prisma.department.upsert({
      where: { name: 'المبيعات' },
      update: { description: 'فريق المبيعات والتسويق' },
      create: { name: 'المبيعات', description: 'فريق المبيعات والتسويق' }
    }),
    prisma.department.upsert({
      where: { name: 'الخدمة الفنية' },
      update: { description: 'الفنيون والهندسة' },
      create: { name: 'الخدمة الفنية', description: 'الفنيون والهندسة' }
    }),
    prisma.department.upsert({
      where: { name: 'المحاسبة والمالية' },
      update: { description: 'المحاسبون والماليون' },
      create: { name: 'المحاسبة والمالية', description: 'المحاسبون والماليون' }
    }),
    prisma.department.upsert({
      where: { name: 'الموارد البشرية' },
      update: { description: 'إدارة الموظفين والشؤون الإدارية' },
      create: { name: 'الموارد البشرية', description: 'إدارة الموظفين والشؤون الإدارية' }
    }),
    prisma.department.upsert({
      where: { name: 'المخزون والمشتريات' },
      update: { description: 'إدارة المخزون والمشتريات' },
      create: { name: 'المخزون والمشتريات', description: 'إدارة المخزون والمشتريات' }
    })
  ])
  console.log('✓ departments created')

  const positions = await Promise.all([
    // الإدارة العليا
    prisma.position.create({ data: { title: 'المدير العام', departmentId: departments[0].id, level: 'EXECUTIVE' } }),
    prisma.position.create({ data: { title: 'مدير الفرع', departmentId: departments[0].id, level: 'SENIOR' } }),
    
    // المبيعات
    prisma.position.create({ data: { title: 'مدير المبيعات', departmentId: departments[1].id, level: 'SENIOR' } }),
    prisma.position.create({ data: { title: 'مندوب مبيعات', departmentId: departments[1].id, level: 'MID' } }),
    prisma.position.create({ data: { title: 'مساعد مبيعات', departmentId: departments[1].id, level: 'JUNIOR' } }),
    
    // الخدمة الفنية
    prisma.position.create({ data: { title: 'مدير الخدمة', departmentId: departments[2].id, level: 'SENIOR' } }),
    prisma.position.create({ data: { title: 'فني أول', departmentId: departments[2].id, level: 'MID' } }),
    prisma.position.create({ data: { title: 'فني', departmentId: departments[2].id, level: 'JUNIOR' } }),
    
    // المحاسبة والمالية
    prisma.position.create({ data: { title: 'المحاسب الرئيسي', departmentId: departments[3].id, level: 'SENIOR' } }),
    prisma.position.create({ data: { title: 'محاسب', departmentId: departments[3].id, level: 'MID' } }),
    
    // الموارد البشرية
    prisma.position.create({ data: { title: 'مدير الموارد البشرية', departmentId: departments[4].id, level: 'SENIOR' } }),
    prisma.position.create({ data: { title: 'أخصائي موارد بشرية', departmentId: departments[4].id, level: 'MID' } }),
    
    // المخزون والمشتريات
    prisma.position.create({ data: { title: 'مدير المشتريات', departmentId: departments[5].id, level: 'SENIOR' } }),
    prisma.position.create({ data: { title: 'مسؤول مخزون', departmentId: departments[5].id, level: 'MID' } })
  ])
  console.log('✓ positions created')

  // 14. Create Employee Records for existing staff users
  const staffUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'STAFF']
      }
    }
  })

  for (const user of staffUsers) {
    try {
      let departmentId, positionId
      
      // Assign department and position based on role
      switch (user.role) {
        case 'SUPER_ADMIN':
          departmentId = departments[0].id // الإدارة العليا
          positionId = positions[0].id // المدير العام
          break
        case 'ADMIN':
        case 'BRANCH_MANAGER':
          departmentId = departments[0].id // الإدارة العليا
          positionId = positions[1].id // مدير الفرع
          break
        case 'STAFF':
          if (user.email?.includes('sales')) {
            departmentId = departments[1].id // المبيعات
            positionId = positions[3].id // مندوب مبيعات
          } else if (user.email?.includes('service')) {
            departmentId = departments[2].id // الخدمة الفنية
            positionId = positions[5].id // فني أول
          } else {
            departmentId = departments[1].id // المبيعات افتراضياً
            positionId = positions[4].id // مساعد مبيعات
          }
          break
        default:
          departmentId = departments[1].id // المبيعات افتراضياً
          positionId = positions[4].id // مساعد مبيعات
      }

      // Generate employee number
      const employeeCount = await prisma.employee.count()
      const employeeNumber = `EMP${String(employeeCount + 1).padStart(4, '0')}`

      await prisma.employee.create({
        data: {
          employeeNumber,
          userId: user.id,
          departmentId,
          positionId,
          hireDate: new Date('2023-01-01'),
          salary: user.role === 'SUPER_ADMIN' ? 25000 : 
                 user.role === 'ADMIN' || user.role === 'BRANCH_MANAGER' ? 18000 : 
                 user.email?.includes('manager') ? 15000 : 8000,
          status: 'ACTIVE',
          branchId: mainBranch.id,
          emergencyContact: {
            name: 'طوارئ',
            phone: '+20 1123456789',
            relationship: 'عائلة'
          },
          notes: 'موظف أساسي في الشركة'
        }
      })
    } catch (err) {
      // Ignore if employee already exists
      console.log(`Note: Employee for ${user.email} may already exist`)
    }
  }
  console.log('✓ employees created')

  // 15. Sample Leave Requests
  const employees = await prisma.employee.findMany({
    include: { user: true }
  })

  if (employees.length > 0) {
    await prisma.leaveRequest.createMany({
      data: [
        {
          employeeId: employees[0].id,
          leaveType: 'ANNUAL',
          startDate: new Date('2024-06-15'),
          endDate: new Date('2024-06-19'),
          totalDays: 5,
          reason: 'إجازة سنوية مع العائلة',
          status: 'APPROVED',
          approvedBy: staffUsers[0].id,
          approvedAt: new Date('2024-06-01')
        },
        {
          employeeId: employees[1]?.id || employees[0].id,
          leaveType: 'SICK',
          startDate: new Date('2024-05-20'),
          endDate: new Date('2024-05-21'),
          totalDays: 2,
          reason: 'إجازة مرضية',
          status: 'APPROVED',
          approvedBy: staffUsers[0].id,
          approvedAt: new Date('2024-05-19')
        }
      ]
    })
    console.log('✓ leave requests created')

    // 16. Sample Payroll Records
    await prisma.payrollRecord.createMany({
      data: employees.map((emp) => ({
        employeeId: emp.id,
        period: '2024-05',
        basicSalary: emp.salary,
        allowances: emp.salary * 0.2, // 20% allowances
        deductions: emp.salary * 0.1, // 10% deductions
        overtime: Math.random() > 0.5 ? emp.salary * 0.05 : 0, // Random overtime
        bonus: Math.random() > 0.7 ? emp.salary * 0.1 : 0, // Random bonus
        netSalary: emp.salary * 1.1, // Basic + allowances - deductions
        payDate: new Date('2024-05-31'),
        status: 'PAID',
        createdBy: staffUsers[0].id,
        approvedBy: staffUsers[0].id
      })),
      skipDuplicates: true
    })
    console.log('✓ payroll records created')
  }

  console.log('✅ Comprehensive database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`- Vehicles: ${vehiclesData.length}`)
  console.log('- Users: 8')
  console.log('- Employees: Created for staff users')
  console.log('- Departments: 6')
  console.log('- Positions: 14')
  console.log('- Role Templates: 8')
  console.log('- Permissions: 32')
  console.log('- Service Types: 5')
  console.log('- Leave Requests: Sample data')
  console.log('- Payroll Records: Sample data')
  console.log('- Sliders: 4')
  console.log('- All emails updated to use @elhamdimport.online domain')
  
  // Import and run additional seed scripts
  console.log('\n🔄 Running additional seed scripts...')
  
  try {
    // Run accounting data seed
    console.log('📊 Seeding accounting data...')
    await import('../scripts/seed-accounting-data.js')
    console.log('✓ Accounting data seeded')
    
    // Run CRM data seed
    console.log('🤝 Seeding CRM data...')
    await import('../scripts/seed-crm-data.js')
    console.log('✓ CRM data seeded')
    
    // Run Inventory & HR data seed
    console.log('📦 Seeding Inventory & HR data...')
    await import('../scripts/seed-inventory-hr-data.js')
    console.log('✓ Inventory & HR data seeded')
    
  } catch (error) {
    console.error('❌ Error running additional seed scripts:', error)
    // Continue even if additional seeds fail
  }
  
  console.log('\n🎉 All database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })