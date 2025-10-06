'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Phone, Mail, MapPin, Calendar, Wrench, Star, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, AlertCircle, Package, Shield, Award, Users, Clock, Zap, Heart, Eye, Grid, List, Home as HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { VehicleCardSkeleton, HeroSliderSkeleton } from '@/components/ui/skeleton'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'
import { OptimizedImage, ResponsiveImage, BackgroundImage } from '@/components/ui/OptimizedImage'
import { LoadingIndicator, LoadingCard, ErrorState } from '@/components/ui/LoadingIndicator'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import { MobileVehicleCard, MobileVehicleGrid } from '@/components/ui/mobile-vehicle-card'
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
                    <MobileVehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      formatPrice={formatPrice}
                      deviceInfo={deviceInfo}
                    />
                  ))}
                </div>
              )}
              
              {/* View All Button */}
              <div className="text-center mt-12">
                <Link href="/vehicles">
                  <TouchButton 
                    variant="outline" 
                    size="xl"
                    className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300 px-8 py-4 text-lg font-semibold"
                  >
                    استعرض جميع السيارات
                    <Car className="mr-3 h-6 w-6" />
                  </TouchButton>
                </Link>
              </div>
            </div>
          </section>
        </EnhancedLazySection>

        {/* Services Section */}
        <EnhancedLazySection rootMargin="100px" preload={false}>
          <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                  <Wrench className="ml-2 h-4 w-4" />
                  خدماتنا
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  خدماتنا المتكاملة
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  نقدم مجموعة شاملة من الخدمات لضمان رحلة شراء سيارة ممتعة وخالية من المتاعب
                </p>
              </div>
              
              {serviceItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {serviceItems.map((service, index) => (
                    <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Wrench className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(6)].map((_, i) => (
                    <LoadingCard key={i} title="جاري تحميل الخدمة..." className="h-48" />
                  ))}
                </div>
              )}
            </div>
          </section>
        </EnhancedLazySection>

        {/* Contact Section */}
        <EnhancedLazySection rootMargin="100px" preload={false}>
          <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative w-full overflow-hidden">
            {/* Background Pattern */}
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
                  لا تتردد في التواصل معنا لأي استفسار أو لتحديد موعد زيارة للمعرض
                </p>
              </div>
              
              {contactInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                    <CardContent className="p-8 text-center">
                      <Phone className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                      <h3 className="text-xl font-bold mb-2">الهاتف</h3>
                      <p className="text-blue-100">{contactInfo.phone}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                    <CardContent className="p-8 text-center">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                      <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
                      <p className="text-blue-100">{contactInfo.email}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                    <CardContent className="p-8 text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                      <h3 className="text-xl font-bold mb-2">العنوان</h3>
                      <p className="text-blue-100">{contactInfo.address}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(3)].map((_, i) => (
                    <LoadingCard key={i} title="جاري تحميل معلومات الاتصال..." className="h-32" />
                  ))}
                </div>
              )}
              
              <div className="text-center mt-12">
                <Link href="/contact">
                  <TouchButton 
                    variant="outline" 
                    size="xl"
                    className="bg-white hover:bg-blue-50 text-blue-600 border-white hover:border-blue-100 px-8 py-4 text-lg font-semibold"
                  >
                    تواصل معنا الآن
                    <Phone className="mr-3 h-6 w-6" />
                  </TouchButton>
                </Link>
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