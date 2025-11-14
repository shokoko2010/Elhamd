import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHomepage() {
  try {
    console.log('🌱 Starting homepage data seeding...');

    // 1. Site Settings
    const siteSettings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        siteTitle: 'الحمد للسيارات - الموزع المعتمد لسيارات تاتا في مدن القناة',
        siteDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة - نقدم أفضل السيارات والخدمات المتخصصة',
        contactEmail: 'info@elhamdimport.com',
        contactPhone: '+20 123 456 7890',
        contactAddress: 'القاهرة، مصر',
        workingHours: 'الأحد - الخميس: 9ص - 8م | الجمعة - السبت: 10ص - 6م',
        logoUrl: '/logo.svg',
        primaryColor: '#DC2626',
        secondaryColor: '#059669',
        accentColor: '#D97706'
      },
      create: {
        id: 'default',
        siteTitle: 'الحمد للسيارات - الموزع المعتمد لسيارات تاتا في مدن القناة',
        siteDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة - نقدم أفضل السيارات والخدمات المتخصصة',
        contactEmail: 'info@elhamdimport.com',
        contactPhone: '+20 123 456 7890',
        contactAddress: 'القاهرة، مصر',
        workingHours: 'الأحد - الخميس: 9ص - 8م | الجمعة - السبت: 10ص - 6م',
        logoUrl: '/logo.svg',
        primaryColor: '#DC2626',
        secondaryColor: '#059669',
        accentColor: '#D97706'
      }
    });

    console.log('✅ Site settings created/updated');

    // 2. Sliders
    const sliders = [
      {
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
    ];

    for (const slider of sliders) {
      await prisma.slider.upsert({
        where: { id: `slider-${slider.order}` },
        update: slider,
        create: {
          id: `slider-${slider.order}`,
          ...slider
        }
      });
    }

    console.log('✅ Sliders created/updated');

    // 3. Company Info
    const companyInfo = await prisma.companyInfo.upsert({
      where: { id: 'main' },
      update: {
        title: 'نحن شريككم الموثوق في عالم السيارات',
        subtitle: 'خبرة تمتد لأكثر من 20 عاماً في السوق المصري',
        description: 'الحمد للسيارات هي الموزع المعتمد لشركة تاتا موتورز في مدن القناة، نقدم أفضل السيارات والخدمات مع ضمان الجودة والأداء العالي. فريقنا من الخبراء جاهز لمساعدتك في اختيار السيارة المناسبة لك.',
        imageUrl: '/uploads/company-showroom.jpg',
        features: {
          quality: 'جودة عالمية',
          service: 'خدمة ممتازة',
          warranty: 'ضمان شامل',
          support: 'دعم فني 24/7'
        },
        ctaButtons: [
          {
            text: 'تصفح السيارات',
            link: '/vehicles'
          },
          {
            text: 'احجز موعد',
            link: '/test-drive'
          }
        ]
      },
      create: {
        id: 'main',
        title: 'نحن شريككم الموثوق في عالم السيارات',
        subtitle: 'خبرة تمتد لأكثر من 20 عاماً في السوق المصري',
        description: 'الحمد للسيارات هي الموزع المعتمد لشركة تاتا موتورز في مدن القناة، نقدم أفضل السيارات والخدمات مع ضمان الجودة والأداء العالي. فريقنا من الخبراء جاهز لمساعدتك في اختيار السيارة المناسبة لك.',
        imageUrl: '/uploads/company-showroom.jpg',
        features: {
          quality: 'جودة عالمية',
          service: 'خدمة ممتازة',
          warranty: 'ضمان شامل',
          support: 'دعم فني 24/7'
        },
        ctaButtons: [
          {
            text: 'تصفح السيارات',
            link: '/vehicles'
          },
          {
            text: 'احجز موعد',
            link: '/test-drive'
          }
        ]
      }
    });

    console.log('✅ Company info created/updated');

    // 4. Services
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
    ];

    for (const service of services) {
      await prisma.serviceItem.upsert({
        where: { id: service.id },
        update: service,
        create: service
      });
    }

    console.log('✅ Services created/updated');

    // 5. Company Features
    const features = [
      {
        id: 'feature-experience',
        title: 'خبرة 20 عاماً',
        description: 'خبرة طويلة في السوق المصري',
        icon: 'Award',
        color: 'bg-blue-100 text-blue-600',
        order: 0
      },
      {
        id: 'feature-quality',
        title: 'جودة عالمية',
        description: 'معايير جودة عالمية في كل شيء',
        icon: 'Shield',
        color: 'bg-green-100 text-green-600',
        order: 1
      },
      {
        id: 'feature-customers',
        title: 'آلاف العملاء',
        description: 'قاعدة عملاء واسعة وثقة',
        icon: 'Users',
        color: 'bg-purple-100 text-purple-600',
        order: 2
      },
      {
        id: 'feature-vehicles',
        title: 'تشكيلة واسعة',
        description: 'مجموعة متنوعة من السيارات',
        icon: 'Car',
        color: 'bg-orange-100 text-orange-600',
        order: 3
      }
    ];

    for (const feature of features) {
      await prisma.companyFeature.upsert({
        where: { id: feature.id },
        update: feature,
        create: feature
      });
    }

    console.log('✅ Features created/updated');

    console.log('🎉 Homepage data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding homepage data:', error);
    throw error;
  }
}

async function main() {
  await seedHomepage();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });