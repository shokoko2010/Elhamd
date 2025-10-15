'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Phone, Mail, MapPin, Calendar, Wrench, Star, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, AlertCircle, Package, Shield, Award, Users, Clock, Zap, Heart, Eye, Grid, List, Home as HomeIcon, Truck, Settings, Droplet } from 'lucide-react'
import Link from 'next/link'
import { VehicleCardSkeleton, HeroSliderSkeleton } from '@/components/ui/skeleton'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'
import { OptimizedImage, ResponsiveImage, BackgroundImage } from '@/components/ui/OptimizedImage'
import { LoadingIndicator, LoadingCard, ErrorState } from '@/components/ui/LoadingIndicator'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import { EnhancedVehicleCard } from '@/components/ui/EnhancedVehicleCard'
import { cache } from '@/lib/cache'
import { ErrorHandler, useErrorHandler } from '@/lib/errorHandler'
import { toast } from 'sonner'
import { AdvancedPublicSearch } from '@/components/search/AdvancedPublicSearch'
import ConfigurablePopup from '@/components/ConfigurablePopup'
import { 
  TouchButton, 
  useDeviceInfo,
  ResponsiveGrid,
  SwipeableCard,
  MobileNav
} from '@/components/ui/enhanced-mobile-optimization'
import { EnhancedLazyImage } from '@/components/ui/enhanced-lazy-loading'
import { VehicleImage } from '@/components/ui/VehicleImage'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
  fuelType: string
  transmission: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface SliderItem {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  badge?: string
  badgeColor?: string
}

export default function Home() {
  const deviceInfo = useDeviceInfo()
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [serviceItems, setServiceItems] = useState<any[]>([])
  const [companyStats, setCompanyStats] = useState<any[]>([])
  const [companyValues, setCompanyValues] = useState<any[]>([])
  const [companyFeatures, setCompanyFeatures] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sliderLoading, setSliderLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  
  const { handleError, clearError } = useErrorHandler()

  useEffect(() => {
    console.log('🚀 Component mounted, starting data fetch...')
    
    // Fetch all data from APIs
    const fetchAllData = async () => {
      try {
        // Fetch company info
        const companyInfoResponse = await fetch('/api/company-info')
        if (companyInfoResponse.ok) {
          const companyData = await companyInfoResponse.json()
          setCompanyInfo(companyData)
        }

        // Fetch service items
        const serviceItemsResponse = await fetch('/api/service-items')
        if (serviceItemsResponse.ok) {
          const serviceData = await serviceItemsResponse.json()
          setServiceItems(Array.isArray(serviceData) ? serviceData : [])
        }

        // Fetch company stats
        const statsResponse = await fetch('/api/about/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (Array.isArray(statsData)) {
            const uniqueStats = statsData.reduce((acc, current) => {
              if (!acc.find(item => item.label === current.label)) {
                acc.push(current)
              }
              return acc
            }, [])
            setCompanyStats(uniqueStats)
          }
        }

        // Fetch company values
        const valuesResponse = await fetch('/api/about/values')
        if (valuesResponse.ok) {
          const valuesData = await valuesResponse.json()
          setCompanyValues(Array.isArray(valuesData) ? valuesData : [])
        }

        // Fetch company features
        const featuresResponse = await fetch('/api/about/features')
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json()
          setCompanyFeatures(Array.isArray(featuresData) ? featuresData : [])
        }

        // Fetch timeline events
        const timelineResponse = await fetch('/api/about/timeline')
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json()
          setTimelineEvents(Array.isArray(timelineData) ? timelineData : [])
        }

        // Fetch contact info
        const contactResponse = await fetch('/api/contact-info')
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          setContactInfo(contactData)
        }

        // Fetch sliders
        const slidersResponse = await fetch('/api/sliders?activeOnly=true')
        if (slidersResponse.ok) {
          const slidersData = await slidersResponse.json()
          let sliders: SliderItem[] = []
          if (slidersData?.sliders) {
            sliders = slidersData.sliders
          } else if (Array.isArray(slidersData)) {
            sliders = slidersData
          }
          setSliderItems(sliders)
        }

        // Fetch featured vehicles
        const vehiclesResponse = await fetch('/api/vehicles?featured=true&limit=6')
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          setFeaturedVehicles(vehiclesData?.vehicles || [])
          
          if (vehiclesData?.vehicles?.length === 0) {
            toast.info('لا توجد سيارات مميزة متاحة حالياً')
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        setError('فشل في تحميل بعض البيانات')
        toast.error('فشل في تحميل بعض البيانات')
      } finally {
        setLoading(false)
        setSliderLoading(false)
      }
    }

    fetchAllData()

    // Fallback timeout
    setTimeout(() => {
      setSliderLoading(false)
    }, 10000)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isAutoPlay && sliderItems.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev < sliderItems.length - 1 ? prev + 1 : 0))
      }, 5000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAutoPlay, sliderItems.length])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Mobile-Optimized Slider Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh]">
        <WorkingSlider 
          items={sliderItems}
          loading={sliderLoading}
          autoPlay={isAutoPlay}
          autoPlayInterval={5000}
          className="w-full h-full"
        />
      </section>

      <div className="w-full">
        {/* Company Introduction Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-right">
                {companyInfo ? (
                  <>
                    <div className="mb-6">
                      <Badge className="bg-white/20 text-white border-white/30 mb-4">
                        <Award className="ml-2 h-4 w-4" />
                        {companyInfo.features?.[0] || 'وكيل معتمد'}
                      </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      {companyInfo.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 text-blue-100 font-semibold">
                      {companyInfo.subtitle}
                    </p>
                    <p className="text-lg md:text-xl mb-8 text-blue-50 leading-relaxed">
                      {companyInfo.description}
                    </p>
                    <div className="space-y-4 mb-10">
                      {companyInfo.features && companyInfo.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 group">
                          <div className="w-3 h-3 bg-white rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                          <span className="text-blue-50 text-lg group-hover:text-white transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      {companyInfo.ctaButtons && companyInfo.ctaButtons.map((button: any, index: number) => (
                        <Link key={index} href={button.link} className="flex-1 sm:flex-none">
                          <TouchButton
                            variant={button.variant === 'primary' ? 'primary' : 'outline'}
                            size={deviceInfo.isMobile ? 'lg' : 'xl'}
                            fullWidth
                            hapticFeedback={true}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600 flex items-center justify-center"
                          >
                            {button.text === 'استعرض السيارات' && <Car className="ml-3 h-6 w-6" />}
                            {button.text === 'قيادة تجريبية' && <Calendar className="ml-3 h-6 w-6" />}
                            {button.text}
                          </TouchButton>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <LoadingCard 
                    title="جاري تحميل معلومات الشركة..."
                    description="يرجى الانتظار بينما نقوم بتحميل المعلومات"
                  />
                )}
              </div>
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/20">
                  <EnhancedLazyImage 
                    src={companyInfo?.imageUrl || "/uploads/showroom-luxury.jpg"} 
                    alt="معرض الحمد للسيارات" 
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={deviceInfo.isMobile ? 80 : 95}
                    priority={true}
                    mobileOptimized={true}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Stats */}
                {companyStats.length > 0 && (
                  <div className="absolute -bottom-6 -right-6 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl border border-blue-100">
                    <div className="text-3xl font-bold mb-1">
                      {companyStats.find(stat => stat.label?.includes('سنة'))?.number || '25+'}
                    </div>
                    <div className="text-sm text-blue-500 font-medium">
                      {companyStats.find(stat => stat.label?.includes('سنة'))?.label || 'سنة خبرة'}
                    </div>
                  </div>
                )}
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing between sections */}
        <div className="h-8 md:h-12 bg-gradient-to-b from-blue-800 to-gray-50"></div>

        {/* Featured Vehicles */}
        <EnhancedLazySection rootMargin="100px" preload={false}>
          <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative w-full">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full opacity-30 blur-3xl"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                  <Star className="ml-2 h-4 w-4" />
                  مميزة
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  السيارات المميزة
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  استعرض أحدث سيارات تاتا المميزة بعروض حصرية وأسعار ممتازة
                </p>
              </div>
            
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(3)].map((_, i) => (
                    <LoadingCard key={i} title="جاري تحميل السيارة..." className="h-80 md:h-96" />
                  ))}
                </div>
              ) : error ? (
                <ErrorState 
                  title="حدث خطأ" 
                  message={error}
                  onRetry={() => window.location.reload()}
                />
              ) : featuredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد سيارات مميزة حالياً</h3>
                  <p className="text-gray-500 mb-6">يرجى التحقق لاحقاً أو استعراض جميع السيارات المتاحة</p>
                  <Link href="/vehicles">
                    <TouchButton variant="outline" size="lg">
                      استعرض جميع السيارات
                    </TouchButton>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {featuredVehicles.map((vehicle) => (
                    <EnhancedVehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                    />
                  ))}
                </div>
              )}

              <div className="text-center mt-12">
                <Link href="/vehicles">
                  <TouchButton 
                    variant="outline" 
                    size="xl"
                    className="bg-white hover:bg-gray-50 text-blue-600 border-blue-200 hover:border-blue-300"
                  >
                    استعرض جميع السيارات
                    <Car className="mr-3 h-5 w-5" />
                  </TouchButton>
                </Link>
              </div>
            </div>
          </section>
        </EnhancedLazySection>

        {/* Company Stats */}
        {companyStats.length > 0 && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-20 bg-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                    <Users className="ml-2 h-4 w-4" />
                    إنجازاتنا
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    أرقام تتحدث عنا
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    نحن فخورون بما حققناه على مدار سنوات من الخبرة والتميز
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                  {companyStats.map((stat, index) => (
                    <div key={index} className="text-center group">
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                        <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                          {stat.number}
                        </div>
                        <div className="text-sm md:text-base text-gray-600 font-medium">
                          {stat.label}
                        </div>
                        {stat.description && (
                          <div className="text-xs text-gray-500 mt-2">
                            {stat.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </EnhancedLazySection>
        )}

        {/* Services Section */}
        {serviceItems.length > 0 && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                    <Wrench className="ml-2 h-4 w-4" />
                    خدماتنا
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                    خدماتنا المتكاملة
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {serviceItems.map((service, index) => (
                    <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Wrench className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {service.description}
                        </p>
                        {service.features && (
                          <ul className="text-sm text-gray-500 space-y-2 mb-6 text-right">
                            {service.features.slice(0, 3).map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center justify-end gap-2">
                                <span>{feature}</span>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-500">المدة:</span>
                          <span className="text-sm font-medium text-gray-700">{service.duration}</span>
                        </div>
                        {service.price && (
                          <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-gray-500">السعر:</span>
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        )}
                        <Link href="/service-booking">
                          <TouchButton 
                            variant="outline" 
                            className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                          >
                            احجز الآن
                          </TouchButton>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          </EnhancedLazySection>
        )}

        {/* Tata Motors Section */}
        <EnhancedLazySection rootMargin="100px" preload={false}>
          <section className="py-16 md:py-24 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23dc2626\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <Badge className="bg-red-100 text-red-700 border-red-200 mb-4">
                  <Truck className="ml-2 h-4 w-4" />
                  Tata Motors
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  تاتا موتورز
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  القوة والاعتمادية في عالم النقل التجاري. استعرض تشكيلتنا المتكاملة من المركبات التجارية الثقيلة والخفيفة وبيك أب
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Featured Categories */}
                <div className="lg:col-span-1">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        المركبات التجارية الثقيلة
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        قوة فائقة لأصعب المهام
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-3">
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-red-600">PRIMA 3328.K</div>
                          <div className="text-sm text-gray-600">270 حصان | 970 نيوتن.متر</div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        المركبات التجارية الخفيفة
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        كفاءة وموثوقية لكل الأعمال
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-3">
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-orange-600">ULTRA T.9</div>
                          <div className="text-sm text-gray-600">155 حصان | 450 نيوتن.متر</div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          مصممة لرحلات لا تتوقف وسرعة دوران أعلى، مع اعتمادية عالية لتحقيق أقصى إنتاجية
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Truck className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        بيك أب
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        قوة ومتانة للربحية العالية
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-3">
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-yellow-600">XENON SC</div>
                          <div className="text-sm text-gray-600">150 حصان | 320 نيوتن.متر</div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          يجمع بين القوة والمتانة، ما يوفّر أداءً معززًا ويساهم في زيادة الأرباح
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: Settings, title: 'محركات قوية', desc: 'تقنية متقدمة' },
                  { icon: Droplet, title: 'كفاءة وقود', desc: 'استهلاك منخفض' },
                  { icon: Shield, title: 'سلامة عالية', desc: 'مواصفات أوروبية' },
                  { icon: Wrench, title: 'صيانة سهلة', desc: 'قطع غيار متوفرة' }
                ].map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center">
                <Link href="/tata-motors">
                  <TouchButton 
                    size="xl"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg font-semibold px-8 py-4 shadow-lg"
                  >
                    استعرض جميع موديلات تاتا
                    <ArrowLeft className="mr-3 h-5 w-5" />
                  </TouchButton>
                </Link>
              </div>
            </div>
          </section>
        </EnhancedLazySection>

        {/* Company Values */}
        {companyValues.length > 0 && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239333EA\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
                    <Heart className="ml-2 h-4 w-4" />
                    قيمنا
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                    قيمنا ومبادئنا
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    المبادئ التي توجهنا في كل ما نفعله
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {companyValues.map((value, index) => (
                    <div key={index} className="text-center group">
                      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 group-hover:border-purple-200 h-full">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Award className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </EnhancedLazySection>
        )}

        {/* Timeline Section */}
        {timelineEvents.length > 0 && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-24 bg-white relative">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4">
                    <Clock className="ml-2 h-4 w-4" />
                    رحلتنا
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">
                    قصة نجاحنا
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    رحلة مليئة بالإنجازات والنمو المستمر
                  </p>
                </div>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute right-1/2 transform translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-200 to-orange-400 rounded-full"></div>
                  
                  <div className="space-y-12">
                    {timelineEvents.map((event, index) => (
                      <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                              {event.year}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Timeline Dot */}
                        <div className="absolute right-1/2 transform translate-x-1/2 w-6 h-6 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </EnhancedLazySection>
        )}

        {/* Contact Section */}
        {contactInfo && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                  <Badge className="bg-white/20 text-white border-white/30 mb-4">
                    <Phone className="ml-2 h-4 w-4" />
                    تواصل معنا
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    نحن هنا لمساعدتك
                  </h2>
                  <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                    لا تتردد في التواصل معنا لأي استفسار أو مساعدة
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Headquarters */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">الفرع الرئيسي</h3>
                    <div className="space-y-3 text-blue-50">
                      <p className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{contactInfo.headquarters?.address}</span>
                      </p>
                      <p className="flex items-center gap-3">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{contactInfo.headquarters?.phone}</span>
                      </p>
                      <p className="flex items-center gap-3">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>{contactInfo.headquarters?.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">ساعات العمل</h3>
                    <div className="space-y-3 text-blue-50">
                      <p>{contactInfo.workingHours?.weekdays}</p>
                      <p>{contactInfo.workingHours?.friday}</p>
                      <p>{contactInfo.workingHours?.saturday}</p>
                      {contactInfo.emergency && (
                        <div className="pt-3 border-t border-white/20">
                          <p className="font-semibold text-white">طوارئ:</p>
                          <p className="flex items-center gap-3">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{contactInfo.emergency?.phone}</span>
                          </p>
                          <p className="text-sm">{contactInfo.emergency?.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">تابعنا</h3>
                    <div className="space-y-3">
                      {contactInfo.socialMedia && Object.entries(contactInfo.socialMedia).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-50 hover:text-white transition-colors"
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="capitalize">{platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <Link href="/contact">
                    <TouchButton 
                      variant="outline" 
                      size="xl"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
                    >
                      تواصل معنا الآن
                      <Phone className="mr-3 h-5 w-5" />
                    </TouchButton>
                  </Link>
                </div>
              </div>
            </section>
          </EnhancedLazySection>
        )}

        {/* Features Section */}
        {companyFeatures.length > 0 && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mb-4">
                    <Shield className="ml-2 h-4 w-4" />
                    مميزاتنا
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                    لماذا تختار الحمد للسيارات؟
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    نقدم لكم الأفضل في كل جوانب خدمتنا
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {companyFeatures.map((feature, index) => (
                    <div key={index} className="group">
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-indigo-200 h-full">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </EnhancedLazySection>
        )}

        {/* Testimonials Section - Using Customer Feedback */}
        <EnhancedLazySection rootMargin="100px" preload={false}>
          <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2310B981\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                  <Star className="ml-2 h-4 w-4" />
                  آراء العملاء
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                  تجارب حقيقية من عملاء سعداء
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  آراء عملائنا هي أفضل دليل على جودة خدماتنا
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    name: 'أحمد محمد',
                    rating: 5,
                    comment: 'تجربة رائعة مع الحمد للسيارات! خدمة عملاء ممتازة والسيارة في حالة ممتازة.',
                    car: 'تاتا نيكسون',
                    date: '2024'
                  },
                  {
                    name: 'سارة أحمد',
                    rating: 5,
                    comment: 'أشكر فريق الحمد للسيارات على التعامل الرائع والاحترافية في كل التفاصيل.',
                    car: 'تاتا بنش',
                    date: '2024'
                  },
                  {
                    name: 'خالد إبراهيم',
                    rating: 5,
                    comment: 'أفضل وكيل سيارات تعاملت معه. أسعار ممتازة وخدمة ما بعد البيع رائعة.',
                    car: 'تاتا هارير',
                    date: '2024'
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6 italic">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.car}</div>
                      </div>
                      <div className="text-sm text-gray-400">{testimonial.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </EnhancedLazySection>
      </div>

      {/* Configurable Popup */}
      <ConfigurablePopup />
    </div>
  )
}