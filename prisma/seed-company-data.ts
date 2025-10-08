import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏢 Starting company data seeding...')

  await seedCompanyInfo()
  await seedSiteSettings()
  await seedSliders()
  await seedServiceItems()
  await seedCompanyStats()
  await seedCompanyValues()
  await seedCompanyFeatures()
  await seedTimelineEvents()
  await seedContactInfo()

  console.log('✅ Company data seeding completed successfully!')
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

main()
  .catch((e) => {
    console.error('❌ Error seeding company data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })