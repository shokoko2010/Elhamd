'use client'

import { useState, useEffect } from 'react'
import { MobileSlider } from './mobile-slider'
import { MobileVehicleCard, MobileVehicleGrid } from './mobile-vehicle-card'
import { TouchNavButton, TouchBottomNav, TouchFAB, TouchCarouselNav, TouchFilterButton } from './touch-navigation'
import { EnhancedLoadingIndicator, EnhancedLoadingCard, EnhancedErrorState } from './enhanced-loading'
import { EnhancedErrorHandler } from './enhanced-error-handling'
import { FadeIn, StaggerContainer, StaggerItem, HoverScale, Pulse } from './smooth-animations'
import { LandmarkRegions, AccessibilityToolbar } from './accessibility'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Sample data for demonstration
const sampleSliderItems = [
  {
    id: '1',
    title: 'تاتا نيكسون 2024',
    subtitle: 'سيارة SUV عائلية متطورة',
    description: 'تجربة القيادة المثالية مع أحدث تقنيات السلامة والراحة',
    imageUrl: '/uploads/banners/nexon-banner.jpg',
    ctaText: 'اكتشف المزيد',
    ctaLink: '/vehicles',
    badge: 'جديد',
    badgeColor: 'bg-green-500'
  },
  {
    id: '2',
    title: 'عرض خاص على تاتا بانش',
    subtitle: 'خصم 15% على جميع الفئات',
    description: 'فرصة محدودة للحصول على سيارتك المفضلة بأفضل سعر',
    imageUrl: '/uploads/banners/punch-banner.jpg',
    ctaText: 'اطلب العرض الآن',
    ctaLink: '/vehicles',
    badge: 'عرض خاص',
    badgeColor: 'bg-red-500'
  },
  {
    id: '3',
    title: 'تاتا تياجو إلكتريك',
    subtitle: 'مستقبل التنقل المستدام',
    description: 'انضم إلى ثورة السيارات الكهربائية مع تاتا تياجو إلكتريك',
    imageUrl: '/uploads/banners/tiago-electric-banner.jpg',
    ctaText: 'جرب القيادة',
    ctaLink: '/test-drive',
    badge: 'إلكتريك',
    badgeColor: 'bg-blue-500'
  }
]

const sampleVehicles = [
  {
    id: '1',
    make: 'تاتا',
    model: 'نيكسون',
    year: 2024,
    price: 750000,
    category: 'SUV',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    images: [
      { imageUrl: '/uploads/vehicles/1/nexon-front.jpg', isPrimary: true },
      { imageUrl: '/uploads/vehicles/1/nexon-side.jpg', isPrimary: false }
    ],
    features: ['كاميرا خلفية', 'شاشة لمس', 'بلوتوث', 'مثبت سرعة'],
    rating: 4.5,
    mileage: 0,
    isFeatured: true,
    isNew: true
  },
  {
    id: '2',
    make: 'تاتا',
    model: 'بانش',
    year: 2024,
    price: 550000,
    category: 'هاتشباك',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    images: [
      { imageUrl: '/uploads/vehicles/2/punch-front.jpg', isPrimary: true },
      { imageUrl: '/uploads/vehicles/2/punch-front-new.jpg', isPrimary: false }
    ],
    features: ['نظام مانع الانزلاق', 'وسائد هوائية', 'تحكم في درجة الحرارة'],
    rating: 4.3,
    mileage: 0,
    isFeatured: false,
    isNew: true
  }
]

// Main component demonstrating all mobile optimizations
export function MobileOptimizedHomepage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeNav, setActiveNav] = useState('home')

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const bottomNavItems = [
    {
      id: 'home',
      icon: <span className="text-xl">🏠</span>,
      label: 'الرئيسية',
      onClick: () => setActiveNav('home')
    },
    {
      id: 'vehicles',
      icon: <span className="text-xl">🚗</span>,
      label: 'السيارات',
      onClick: () => setActiveNav('vehicles'),
      badge: '12'
    },
    {
      id: 'test-drive',
      icon: <span className="text-xl">🔑</span>,
      label: 'اختبار قيادة',
      onClick: () => setActiveNav('test-drive')
    },
    {
      id: 'contact',
      icon: <span className="text-xl">📞</span>,
      label: 'اتصل بنا',
      onClick: () => setActiveNav('contact')
    }
  ]

  if (error) {
    return (
      <LandmarkRegions>
        <div className="min-h-screen flex items-center justify-center p-4">
          <EnhancedErrorHandler
            error={error}
            variant="card"
            onRetry={() => window.location.reload()}
            showDetails={true}
          />
        </div>
      </LandmarkRegions>
    )
  }

  return (
    <LandmarkRegions>
      <div className="min-h-screen bg-gray-50">
        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />

        {/* Enhanced Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <EnhancedLoadingCard
              title="جاري تحميل الصفحة..."
              description="نقوم بإعداد أفضل تجربة لك"
              variant="elegant"
              icon={<EnhancedLoadingIndicator size="xl" variant="sparkle" color="primary" />}
            />
          </div>
        )}

        {/* Mobile-Optimized Slider */}
        <FadeIn direction="down">
          <MobileSlider
            items={sampleSliderItems}
            autoPlay={true}
            autoPlayInterval={5000}
            loading={loading}
          />
        </FadeIn>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 pb-24">
          {/* Featured Vehicles Section */}
          <FadeIn direction="up" delay={0.2}>
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">السيارات المميزة</h2>
                <TouchFilterButton
                  isActive={false}
                  count={3}
                  onClick={() => console.log('Filter clicked')}
                />
              </div>

              <StaggerContainer staggerDelay={0.1}>
                <MobileVehicleGrid
                  vehicles={sampleVehicles}
                  loading={loading}
                  compact={false}
                />
              </StaggerContainer>
            </section>
          </FadeIn>

          {/* Features Section */}
          <FadeIn direction="up" delay={0.4}>
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">لماذا تختارنا؟</h2>
              
              <StaggerContainer staggerDelay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: '🚗',
                      title: 'أحدث السيارات',
                      description: 'وكلاء معتمدون لأحدث موديلات تاتا'
                    },
                    {
                      icon: '💰',
                      title: 'أسعار تنافسية',
                      description: 'أفضل الأسعار في السمع المصري'
                    },
                    {
                      icon: '🔧',
                      title: 'صيانة معتمدة',
                      description: 'مراكز صيانة معتمدة بفنيين محترفين'
                    }
                  ].map((feature, index) => (
                    <StaggerItem key={index}>
                      <HoverScale>
                        <Card className="text-center p-6 h-full">
                          <CardContent className="space-y-4">
                            <div className="text-4xl">{feature.icon}</div>
                            <h3 className="font-bold text-lg">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                          </CardContent>
                        </Card>
                      </HoverScale>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </section>
          </FadeIn>

          {/* Services Section */}
          <FadeIn direction="up" delay={0.6}>
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">خدماتنا</h2>
              
              <StaggerContainer staggerDelay={0.1}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: '🔑', label: 'بيع سيارات', count: 150 },
                    { icon: '⚙️', label: 'صيانة', count: 500 },
                    { icon: '🛡️', label: 'ضمان', count: 24 },
                    { icon: '📱', label: 'تطبيق موبايل', count: 1 }
                  ].map((service, index) => (
                    <StaggerItem key={index}>
                      <HoverScale>
                        <Card className="text-center p-4">
                          <CardContent className="space-y-2">
                            <div className="text-2xl">{service.icon}</div>
                            <h3 className="font-semibold text-sm">{service.label}</h3>
                            {service.count && (
                              <Badge variant="secondary">{service.count}</Badge>
                            )}
                          </CardContent>
                        </Card>
                      </HoverScale>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </section>
          </FadeIn>

          {/* CTA Section */}
          <FadeIn direction="up" delay={0.8}>
            <section className="mb-12">
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">ابدأ رحلتك معنا اليوم</h2>
                  <p className="text-lg mb-6 opacity-90">
                    احصل على سيارتك المثالية مع أفضل الأسعار والخدمات
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      تصفح السيارات
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      حجز اختبار قيادة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </FadeIn>
        </main>

        {/* Touch-Optimized Bottom Navigation */}
        <TouchBottomNav
          items={bottomNavItems}
          activeId={activeNav}
        />

        {/* Floating Action Button */}
        <TouchFAB
          icon={<span className="text-xl">💬</span>}
          label="دردشة مباشرة"
          onClick={() => console.log('Chat clicked')}
          position="bottom-right"
          size="lg"
          badge="1"
        />

        {/* Quick Contact FAB */}
        <TouchFAB
          icon={<span className="text-xl">📞</span>}
          label="اتصل بنا"
          onClick={() => console.log('Call clicked')}
          position="bottom-left"
          size="lg"
        />
      </div>
    </LandmarkRegions>
  )
}

// Component showing error handling integration
export function ErrorHandlingDemo() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const simulateError = () => {
    setLoading(true)
    setTimeout(() => {
      setError(new Error('فشل الاتصال بالخادم'))
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">تجربة معالجة الأخطاء المحسنة</h2>
      
      <Button onClick={simulateError} disabled={loading}>
        محاكاة خطأ
      </Button>

      {loading && (
        <EnhancedLoadingCard
          title="جاري المعالجة..."
          description="يرجى الانتظار"
        />
      )}

      {error && (
        <EnhancedErrorHandler
          error={error}
          variant="card"
          onRetry={() => setError(null)}
          showDetails={true}
        />
      )}
    </div>
  )
}

// Component showing loading states integration
export function LoadingStatesDemo() {
  const [loadingStates, setLoadingStates] = useState({
    spinner: false,
    skeleton: false,
    car: false,
    sparkle: false
  })

  const toggleLoading = (type: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">تجربة مؤشرات التحميل المحسنة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات التحميل المختلفة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => toggleLoading('spinner')}>
              تبديل مؤشر الدوران
            </Button>
            {loadingStates.spinner && (
              <EnhancedLoadingIndicator variant="spinner" text="جاري التحميل..." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مؤشر السيارة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => toggleLoading('car')}>
              تبديل مؤشر السيارة
            </Button>
            {loadingStates.car && (
              <EnhancedLoadingIndicator variant="car" text="جاري تحميل السيارات..." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مؤشر الهيكل العظمي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => toggleLoading('skeleton')}>
              تبديل مؤشر الهيكل
            </Button>
            {loadingStates.skeleton && (
              <EnhancedLoadingIndicator variant="skeleton" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مؤشر التألق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => toggleLoading('sparkle')}>
              تبديل مؤشر التألق
            </Button>
            {loadingStates.sparkle && (
              <EnhancedLoadingIndicator variant="sparkle" text="جاري التحضير..." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export all components for easy importing
export {
  MobileSlider,
  MobileVehicleCard,
  MobileVehicleGrid,
  TouchNavButton,
  TouchBottomNav,
  TouchFAB,
  TouchCarouselNav,
  EnhancedLoadingIndicator,
  EnhancedLoadingCard,
  EnhancedErrorState,
  EnhancedErrorHandler,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  Pulse,
  LandmarkRegions,
  AccessibilityToolbar
}