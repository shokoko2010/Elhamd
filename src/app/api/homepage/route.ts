import { NextRequest, NextResponse } from 'next/server';

// Mock data for homepage - this will be replaced with database data later
const mockHomepageData = {
  siteSettings: {
    siteTitle: 'الهمد للسيارات - وكيل تاتا موتورز المعتمد',
    siteDescription: 'الوكيل المعتمد لسيارات تاتا في مصر - نقدم أفضل السيارات والخدمات',
    contactEmail: 'info@elhamdimport.com',
    contactPhone: '+20 123 456 7890',
    contactAddress: 'القاهرة، مصر',
    workingHours: 'الأحد - الخميس: 9ص - 8م | الجمعة - السبت: 10ص - 6م',
    logoUrl: '/logo.svg'
  },
  sliders: [
    {
      id: 'slider-1',
      title: 'تاتا نيكسون إي في 2024',
      subtitle: 'ثورة في عالم السيارات الكهربائية',
      description: 'استمتع بأحدث تقنيات السيارات الكهربائية مع أداء استثنائي وتصميم عصري',
      imageUrl: '/uploads/vehicles/1/tata-nexon-ev-hero.jpg',
      ctaText: 'اكتشف المزيد',
      ctaLink: '/vehicles',
      badge: 'جديد',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'slider-2',
      title: 'تاتا بانش 2024',
      subtitle: 'القوة في حجم صغير',
      description: 'سيارة مدمجة قوية ومثالية للمدينة، تجمع بين الأداء وكفاءة استهلاك الوقود',
      imageUrl: '/uploads/vehicles/2/tata-punch-hero.jpg',
      ctaText: 'اطلب الآن',
      ctaLink: '/vehicles',
      badge: 'الأكثر مبيعاً',
      badgeColor: 'bg-red-500'
    }
  ],
  companyInfo: {
    id: 'main',
    title: 'نحن شريككم الموثوق في عالم السيارات',
    subtitle: 'خبرة تمتد لأكثر من 20 عاماً في السوق المصري',
    description: 'الهمد للسيارات هي الوكيل المعتمد لشركة تاتا موتورز في مصر، نقدم أفضل السيارات والخدمات مع ضمان الجودة والأداء العالي. فريقنا من الخبراء جاهز لمساعدتك في اختيار السيارة المناسبة لك.',
    imageUrl: '/uploads/company-showroom.jpg',
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
  services: [
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
  ],
  features: [
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
  ],
  featuredVehicles: [
    {
      id: 'vehicle-1',
      make: 'Tata',
      model: 'Nexon EV',
      year: 2024,
      price: 650000,
      mileage: 0,
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      description: 'سيارة كهربائية عصرية مع مدى قيادة ممتاز وتقنيات متقدمة',
      images: [
        {
          id: 'img-1',
          imageUrl: '/uploads/vehicles/1/tata-nexon-ev-1.jpg',
          altText: 'Tata Nexon EV Front View',
          isPrimary: true
        }
      ],
      pricing: {
        basePrice: 650000,
        currency: 'EGP',
        hasDiscount: false
      }
    },
    {
      id: 'vehicle-2',
      make: 'Tata',
      model: 'Punch',
      year: 2024,
      price: 380000,
      mileage: 0,
      fuelType: 'GASOLINE',
      transmission: 'MANUAL',
      description: 'سيارة مدمجة قوية مثالية للمدينة بكفاءة استهلاك وقود ممتازة',
      images: [
        {
          id: 'img-2',
          imageUrl: '/uploads/vehicles/2/tata-punch-1.jpg',
          altText: 'Tata Punch Front View',
          isPrimary: true
        }
      ],
      pricing: {
        basePrice: 380000,
        currency: 'EGP',
        hasDiscount: false
      }
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockHomepageData);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}