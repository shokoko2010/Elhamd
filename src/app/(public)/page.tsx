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
  const [loading, setLoading] = useState(true)
  const [sliderLoading, setSliderLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  
  const { handleError, clearError } = useErrorHandler()

  useEffect(() => {
    console.log('🚀 Component mounted, starting data fetch...')
    
    // Fetch company info from API with simple fetch
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch('/api/company-info')
        const data = await response.json()
        if (data) {
          setCompanyInfo(data)
        }
      } catch (error) {
        console.error('Error fetching company info:', error)
        // Set default company info on error
        setCompanyInfo({
          title: 'مرحباً بك في Elhamd Import',
          subtitle: 'الجودة والثقة في عالم السيارات',
          description: 'نحن وكيل تاتا المعتمد في مصر، نقدم أحدث موديلات تاتا مع ضمان المصنع الكامل وخدمة ما بعد البيع المتميزة.',
          features: ['وكيل معتمد لتاتا', 'ضمان المصنع الكامل', 'خدمة ما بعد البيع 24/7', 'تمويل سهل ومريح'],
          ctaButtons: [
            { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
            { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
          ]
        })
      }
    }

    // Fetch service items from API with simple fetch
    const fetchServiceItems = async () => {
      try {
        const response = await fetch('/api/service-items')
        const data = await response.json()
        if (data) {
          setServiceItems(data)
        }
      } catch (error) {
        console.error('Error fetching service items:', error)
        setServiceItems([])
      }
    }

    // Fetch company stats from API with simple fetch
    const fetchCompanyStats = async () => {
      try {
        const response = await fetch('/api/about/stats')
        const data = await response.json()
        if (data && Array.isArray(data)) {
          // Remove duplicate stats based on label
          const uniqueStats = data.reduce((acc, current) => {
            if (!acc.find(item => item.label === current.label)) {
              acc.push(current)
            }
            return acc
          }, [])
          setCompanyStats(uniqueStats)
        }
      } catch (error) {
        console.error('Error fetching company stats:', error)
        setCompanyStats([])
      }
    }

    // Fetch company values from API with simple fetch
    const fetchCompanyValues = async () => {
      try {
        const response = await fetch('/api/about/values')
        const data = await response.json()
        if (data) {
          setCompanyValues(data)
        }
      } catch (error) {
        console.error('Error fetching company values:', error)
        setCompanyValues([])
      }
    }

    // Fetch company features from API with simple fetch
    const fetchCompanyFeatures = async () => {
      try {
        const response = await fetch('/api/about/features')
        const data = await response.json()
        if (data) {
          setCompanyFeatures(data)
        }
      } catch (error) {
        console.error('Error fetching company features:', error)
        setCompanyFeatures([])
      }
    }

    // Fetch sliders from API with simple fetch
    const fetchSliders = async () => {
      try {
        console.log('🔄 Fetching sliders...')
        
        const response = await fetch('/api/sliders?activeOnly=true')
        const data = await response.json()
        
        console.log('✅ Sliders response:', data)
        
        // Handle different response formats
        let sliders: SliderItem[] = []
        if (data?.sliders) {
          sliders = data.sliders
        } else if (Array.isArray(data)) {
          sliders = data
        }
        
        console.log('🎯 Extracted sliders:', sliders)
        
        setSliderItems(sliders)
        
        if (sliders.length === 0) {
          console.log('⚠️ No sliders found')
          setSliderItems([])
        }
      } catch (error) {
        console.error('❌ Error fetching sliders:', error)
        setSliderItems([])
      } finally {
        setSliderLoading(false)
      }
    }

    // Fetch featured vehicles from API with simple fetch
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?featured=true&limit=6')
        const data = await response.json()
        
        setFeaturedVehicles(data?.vehicles || [])
        
        if (data?.vehicles?.length === 0) {
          toast.info('لا توجد سيارات مميزة متاحة حالياً')
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setError('فشل في تحميل السيارات المميزة')
        toast.error('فشل في تحميل السيارات المميزة')
        setFeaturedVehicles([])
      } finally {
        setLoading(false)
      }
    }

    // Batch API calls for better performance
    console.log('🎯 Starting all data fetches...')
    Promise.allSettled([
      fetchCompanyInfo(),
      fetchServiceItems(),
      fetchCompanyStats(),
      fetchCompanyValues(),
      fetchCompanyFeatures(),
      fetchSliders(),
      fetchVehicles()
    ]).then(() => {
      console.log('✅ All data fetches completed')
    }).catch((error) => {
      console.error('❌ Error in Promise.allSettled:', error)
    })

    // Fallback timeout to ensure sliderLoading is set to false
    setTimeout(() => {
      console.log('⏰ Fallback timeout triggered')
      setSliderLoading(false)
    }, 10000) // 10 seconds fallback
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    // Auto-play functionality using simple state management
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
                        وكيل معتمد لتاتا
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
                            className={button.variant === 'primary' 
                              ? "bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600 flex items-center justify-center" 
                              : "bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600 flex items-center justify-center"
                            }
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
                    src="/uploads/showroom-luxury.jpg" 
                    alt="معرض Elhamd Import" 
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
                <div className="absolute -bottom-6 -right-6 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl border border-blue-100">
                  <div className="text-3xl font-bold mb-1">
                    {companyStats.find(stat => stat.label === 'سنة خبرة')?.number || '25+'}
                  </div>
                  <div className="text-sm text-blue-500 font-medium">سنة خبرة</div>
                </div>
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
                <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                  استكشف أحدث وأشهر موديلات تاتا لعام 2024 مع ضمان المصنع الكامل
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>جميع السيارات جديدة مع ضمان المصنع</span>
                  <Award className="h-4 w-4" />
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">الفئة:</span>
                      <div className="flex gap-2 flex-wrap">
                        {['الكل', 'SUV', 'سيدان', 'هاتشباك'].map((category) => (
                          <TouchButton
                            key={category}
                            variant="outline"
                            size="sm"
                            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                              category === 'الكل' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'hover:bg-gray-100'
                            }`}
                            hapticFeedback={true}
                          >
                            {category}
                          </TouchButton>
                        ))}
                      </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">الترتيب:</span>
                      <div className="flex gap-2">
                        {['الأحدث', 'الأقل سعراً', 'الأعلى سعراً', 'الأكثر مبيعاً'].map((sort) => (
                          <TouchButton
                            key={sort}
                            variant="outline"
                            size="sm"
                            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                              sort === 'الأحدث' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'hover:bg-gray-100'
                            }`}
                            hapticFeedback={true}
                          >
                            {sort}
                          </TouchButton>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">العرض:</span>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      <TouchButton
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-md bg-white shadow-sm"
                        hapticFeedback={true}
                      >
                        <Grid className="h-4 w-4" />
                      </TouchButton>
                      <TouchButton
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-md hover:bg-gray-200"
                        hapticFeedback={true}
                      >
                        <List className="h-4 w-4" />
                      </TouchButton>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">الفلاتر النشطة:</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    SUV
                    <button className="ml-1 hover:text-blue-900">×</button>
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    الأحدث
                    <button className="ml-1 hover:text-blue-900">×</button>
                  </Badge>
                  <TouchButton variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                    مسح الكل
                  </TouchButton>
                </div>
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
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">لا توجد سيارات مميزة</h3>
                <p className="text-gray-600 mb-8 text-lg">سيتم إضافة سيارات مميزة قريباً</p>
                <Link href="/vehicles">
                  <TouchButton variant="outline" size="lg">
                    استعرض جميع السيارات
                  </TouchButton>
                </Link>
              </div>
            ) : (
              <ResponsiveGrid 
                cols={{ mobile: 1, tablet: 2, desktop: 3 }}
                gap={{ mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' }}
              >
                {featuredVehicles.map((vehicle) => (
                  <SwipeableCard
                    key={vehicle.id}
                    onSwipeLeft={() => console.log('Swiped left on vehicle:', vehicle.id)}
                    className="h-full"
                  >
                    <Card className="overflow-hidden group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                      <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <VehicleImage
                          vehicle={vehicle}
                          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                          width={400}
                          height={300}
                          priority={false}
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg">
                            <Star className="ml-1 h-3 w-3" />
                            مميزة
                          </Badge>
                          <Badge className="bg-white/90 text-gray-800 border-0 shadow-lg">
                            {vehicle.year}
                          </Badge>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
                            <Link href={`/vehicles/${vehicle.id}`}>
                              <TouchButton size="sm" className="bg-white/90 hover:bg-white text-gray-800 shadow-lg">
                                <Eye className="h-4 w-4" />
                              </TouchButton>
                            </Link>
                            <Link href={`/test-drive?vehicle=${vehicle.id}`}>
                              <TouchButton size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                                <Calendar className="h-4 w-4" />
                              </TouchButton>
                            </Link>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">{vehicle.year}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-sm font-medium border-gray-200 text-gray-700">
                            {vehicle.category}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {vehicle.fuelType}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            {vehicle.transmission}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                          <div className="text-center sm:text-right">
                            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                              {formatPrice(vehicle.price)}
                            </div>
                            <div className="text-sm text-gray-500 font-medium">شامل الضريبة</div>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
                              <TouchButton
                                variant="outline"
                                size="md"
                                fullWidth
                                hapticFeedback={true}
                                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                              >
                                التفاصيل
                              </TouchButton>
                            </Link>
                            <Link href={`/test-drive?vehicle=${vehicle.id}`} className="flex-1 sm:flex-none">
                              <TouchButton
                                size="md"
                                fullWidth
                                hapticFeedback={true}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              >
                                اختبار قيادة
                              </TouchButton>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SwipeableCard>
                ))}
              </ResponsiveGrid>
            )}
            
            <div className="text-center mt-12">
              <Link href="/vehicles">
                <TouchButton 
                  variant="outline" 
                  size={deviceInfo.isMobile ? "lg" : "xl"}
                  hapticFeedback={true}
                  className="border-2 border-gray-300 hover:border-gray-400 text-lg font-semibold py-3 px-8"
                >
                  عرض جميع السيارات
                  <ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
                </TouchButton>
              </Link>
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* Special Offers Section */}
      <EnhancedLazySection rootMargin="100px" preload={false}>
        <section className="py-16 md:py-24 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ef4444\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-red-100 text-red-700 border-red-200 mb-4">
                <Star className="ml-2 h-4 w-4" />
                عروض خاصة
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                عروض حصرية لفترة محدودة
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                استفد من أفضل العروض والخصومات على سيارات تاتا الجديدة
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-red-600 font-medium">
                <Clock className="h-4 w-4" />
                <span>العروض ستنتهي قريباً - استغل الفرصة الآن!</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Offer 1 */}
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                <div className="relative h-48 bg-gradient-to-br from-red-500 to-orange-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-5xl font-bold mb-2">25%</div>
                      <div className="text-xl">خصم</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-400 text-yellow-900 border-yellow-500 animate-pulse">
                      محدود
                    </Badge>
                  </div>
                  <div className="absolute -bottom-4 left-4">
                    <div className="bg-white text-red-600 px-4 py-2 rounded-full shadow-lg font-bold">
                      تاتا نيكسون
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">خصم خاص على تاتا نيكسون</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    احصل على خصم 25% على جميع فئات تاتا نيكسون الجديدة مع ضمان المصنع الكامل
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>ضمان المصنع 5 سنوات</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>خدمة صيانة مجانية لمدة سنة</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>تمويل حتى 7 سنوات</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TouchButton className="flex-1 bg-red-600 hover:bg-red-700" hapticFeedback={true}>
                      احجز الآن
                    </TouchButton>
                    <TouchButton variant="outline" className="flex-1" hapticFeedback={true}>
                      التفاصيل
                    </TouchButton>
                  </div>
                </CardContent>
              </Card>

              {/* Offer 2 */}
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-5xl font-bold mb-2">15%</div>
                      <div className="text-xl">خصم</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-400 text-green-900 border-green-500">
                      جديد
                    </Badge>
                  </div>
                  <div className="absolute -bottom-4 left-4">
                    <div className="bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg font-bold">
                      تاتا بانش
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">عرض تاتا بانش الحصري</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    خصم 15% على سيارة تاتا بانش مع هدايا مجانية وتأمين شامل لمدة عام
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>تأمين شامل مجاني</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>هدايا قيمة مجانية</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>فائدة تمويلية 0% لمدة 6 أشهر</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TouchButton className="flex-1 bg-blue-600 hover:bg-blue-700" hapticFeedback={true}>
                      احجز الآن
                    </TouchButton>
                    <TouchButton variant="outline" className="flex-1" hapticFeedback={true}>
                      التفاصيل
                    </TouchButton>
                  </div>
                </CardContent>
              </Card>

              {/* Offer 3 */}
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                <div className="relative h-48 bg-gradient-to-br from-green-500 to-teal-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-5xl font-bold mb-2">30%</div>
                      <div className="text-xl">خصم</div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-400 text-purple-900 border-purple-500">
                      الأكثر مبيعاً
                    </Badge>
                  </div>
                  <div className="absolute -bottom-4 left-4">
                    <div className="bg-white text-green-600 px-4 py-2 rounded-full shadow-lg font-bold">
                      تاتا تياجو
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900">أفضل عرض لتاتا تياجو</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    خصم 30% على تاتا تياجو مع باقة صيانة مجانية لمدة عامين وتمويل متميز
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>صيانة مجانية لمدة عامين</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>تمويل حتى 8 سنوات</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>استبدال سيارتك القديمة</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TouchButton className="flex-1 bg-green-600 hover:bg-green-700" hapticFeedback={true}>
                      احجز الآن
                    </TouchButton>
                    <TouchButton variant="outline" className="flex-1" hapticFeedback={true}>
                      التفاصيل
                    </TouchButton>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-600 font-semibold">شروط العروض</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  جميع العروض سارية حتى نهاية الشهر الحالي. العروض غير قابلة للدمج مع عروض أخرى. 
                  يرجى مراجعة الشروط والأحكام الكاملة في المعارض. الأسعار تشمل ضريبة القيمة المضافة.
                </p>
              </div>
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* Services Section */}
      <EnhancedLazySection rootMargin="100px" preload={false}>
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233b82f6\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                <Zap className="ml-2 h-4 w-4" />
                خدماتنا
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                خدماتنا المتميزة
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                حلول سيارات شاملة تلبي جميع احتياجاتك بأعلى معايير الجودة
              </p>
              <p className="text-sm text-gray-500">
                نقدم لكم أفضل الخدمات بمعايير عالمية وفريق محترف
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
              {serviceItems.length > 0 ? (
                serviceItems.map((service, index) => {
                  // Map service icons to components
                  const getIconComponent = (iconName: string) => {
                    const iconMap: { [key: string]: any } = {
                      'Car': Car,
                      'Calendar': Calendar,
                      'Wrench': Wrench,
                      'CreditCard': Star,
                      'Mail': Mail,
                      'Package': Package,
                      'Phone': Phone,
                      'MapPin': MapPin
                    }
                    const IconComponent = iconMap[iconName] || Car
                    return <IconComponent className="h-10 w-10" />
                  }

                  // Map service colors with explicit Tailwind classes
                  const getBgColorClass = (iconName: string) => {
                    switch (iconName) {
                      case 'Car': return 'from-blue-500 to-blue-600';
                      case 'Calendar': return 'from-green-500 to-green-600';
                      case 'Wrench': return 'from-orange-500 to-orange-600';
                      case 'CreditCard': return 'from-purple-500 to-purple-600';
                      case 'Mail': return 'from-red-500 to-red-600';
                      case 'Package': return 'from-indigo-500 to-indigo-600';
                      case 'Phone': return 'from-pink-500 to-pink-600';
                      case 'MapPin': return 'from-yellow-500 to-yellow-600';
                      default: return 'from-blue-500 to-blue-600';
                    }
                  };
                  
                  const getTextColorClass = (iconName: string) => {
                    switch (iconName) {
                      case 'Car': return 'text-blue-600';
                      case 'Calendar': return 'text-green-600';
                      case 'Wrench': return 'text-orange-600';
                      case 'CreditCard': return 'text-purple-600';
                      case 'Mail': return 'text-red-600';
                      case 'Package': return 'text-indigo-600';
                      case 'Phone': return 'text-pink-600';
                      case 'MapPin': return 'text-yellow-600';
                      default: return 'text-blue-600';
                    }
                  };

                  return (
                    <Link key={service.id} href={service.link || '#'} className="group">
                      <Card className="text-center cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white rounded-2xl overflow-hidden h-full">
                        <div className={`bg-gradient-to-br ${getBgColorClass(service.icon)} p-8 relative overflow-hidden`}>
                          {/* Decorative Elements */}
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                          
                          <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                              <div className="text-white">
                                {getIconComponent(service.icon)}
                              </div>
                            </div>
                            <CardTitle className="text-white text-xl font-bold mb-2">{service.title}</CardTitle>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <CardDescription className="text-gray-600 text-base leading-relaxed">
                            {service.description}
                          </CardDescription>
                          <div className="mt-4">
                            <Badge variant="outline" className={`${getTextColorClass(service.icon)} border-current bg-transparent`}>
                              اكتشف المزيد
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })
              ) : (
                <div className="col-span-5">
                  <LoadingCard 
                    title="جاري تحميل الخدمات..."
                    description="يرجى الانتظار بينما نقوم بتحميل الخدمات المتاحة"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* Features Section */}
      <EnhancedLazySection rootMargin="100px" preload={false}>
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-white text-blue-700 border-blue-200 shadow-lg mb-4">
                <Heart className="ml-2 h-4 w-4" />
                لماذا نحن
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                لماذا تختار الحمد للسيارات؟
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                نحن نقدم لك أفضل تجربة لشراء وامتلاك السيارات مع خدمة لا مثيل لها
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>أكثر من 25 عاماً من الخبرة والتميز</span>
                <Award className="h-4 w-4" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {companyFeatures.length > 0 ? (
                companyFeatures.map((feature) => {
                  // Map feature icons to components
                  const getIconComponent = (iconName: string) => {
                    const iconMap: { [key: string]: any } = {
                      'Car': Car,
                      'Calendar': Calendar,
                      'Wrench': Wrench,
                      'Star': Star,
                      'Mail': Mail,
                      'Package': Package,
                      'Phone': Phone,
                      'MapPin': MapPin
                    }
                    const IconComponent = iconMap[iconName] || Car
                    return <IconComponent className="h-12 w-12 text-white" />
                  }

                  // Map feature colors with explicit Tailwind classes
                  const getBgColorClass = (colorName: string) => {
                    switch (colorName) {
                      case 'orange': return 'from-orange-500 to-orange-600';
                      case 'green': return 'from-green-500 to-green-600';
                      case 'red': return 'from-red-500 to-red-600';
                      case 'purple': return 'from-purple-500 to-purple-600';
                      case 'yellow': return 'from-yellow-500 to-yellow-600';
                      case 'pink': return 'from-pink-500 to-pink-600';
                      case 'indigo': return 'from-indigo-500 to-indigo-600';
                      case 'blue':
                      default: return 'from-blue-500 to-blue-600';
                    }
                  };
                  
                  const getDotColorClass = (colorName: string) => {
                    switch (colorName) {
                      case 'orange': return 'bg-orange-500';
                      case 'green': return 'bg-green-500';
                      case 'red': return 'bg-red-500';
                      case 'purple': return 'bg-purple-500';
                      case 'yellow': return 'bg-yellow-500';
                      case 'pink': return 'bg-pink-500';
                      case 'indigo': return 'bg-indigo-500';
                      case 'blue':
                      default: return 'bg-blue-500';
                    }
                  };

                  return (
                    <div key={feature.id} className="text-center group">
                      <div className={`w-24 h-24 bg-gradient-to-br ${getBgColorClass(feature.color)} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {getIconComponent(feature.icon)}
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="space-y-3 text-sm text-gray-500">
                        {feature.features && feature.features.map((feat: string, index: number) => (
                          <div key={index} className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                            <div className={`w-2 h-2 ${getDotColorClass(feature.color)} rounded-full`}></div>
                            <span className="group-hover:text-gray-700 transition-colors">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <>
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Car className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">تشكيلة واسعة</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      أحدث موديلات تاتا 2024 بمواصفات عالمية وأسعار تنافسية
                    </p>
                    <div className="space-y-3 text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="group-hover:text-gray-700 transition-colors">نيكسون • بانش • تياجو</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="group-hover:text-gray-700 transition-colors">تيغور • ألتروز • هارير</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Wrench className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">خدمة مميزة</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      فريق محترف من الفنيين المعتمدين وخدمة عملاء على مدار الساعة
                    </p>
                    <div className="space-y-3 text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="group-hover:text-gray-700 transition-colors">صيانة معتمدة</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="group-hover:text-gray-700 transition-colors">قطع غيار أصلية</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Star className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">تمويل سهل</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      خيارات تمويل مرنة وبنود سداد مريحة تناسب جميع الميزانيات
                    </p>
                    <div className="space-y-3 text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="group-hover:text-gray-700 transition-colors">فوائد تنافسية</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 group-hover:gap-4 transition-all">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="group-hover:text-gray-700 transition-colors">موافقات سريعة</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* Customer Testimonials Section */}
      <EnhancedLazySection rootMargin="100px" preload={false}>
        <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a855f7\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
                <Star className="ml-2 h-4 w-4" />
                آراء العملاء
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ماذا يقول عملاؤنا عنا
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                تجارب حقيقية من عملاء سعداء اختاروا الحمد للسيارات
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-purple-600 font-medium">
                <Users className="h-4 w-4" />
                <span>أكثر من 100,000 عميل راضٍ</span>
                <Star className="h-4 w-4" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Testimonial 1 */}
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      أ
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">أحمد محمد</h3>
                      <p className="text-sm text-gray-500">مشتري تاتا نيكسون</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -top-2 -right-2 text-purple-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4 text-right">
                      تجربة رائعة مع الحمد للسيارات! خدمة عملاء ممتازة والسيارة في حالة ممتازة. 
                      أنصح الجميع بالتعامل معهم بثقة.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>منذ شهرين</span>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      س
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">سارة أحمد</h3>
                      <p className="text-sm text-gray-500">مشترية تاتا بانش</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -top-2 -right-2 text-purple-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4 text-right">
                      أفضل معرض للسيارات تعاملت معه! الأسعار مناسبة جداً والخدمة ممتازة. 
                      الفريق محترف ويساعد في اختيار السيارة المناسبة.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>منذ 3 أشهر</span>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      م
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">محمد علي</h3>
                      <p className="text-sm text-gray-500">مشتري تاتا تياجو</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -top-2 -right-2 text-purple-200">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4 text-right">
                      سيارة ممتازة بسعر ممتاز! خدمة ما بعد البيع رائعة والصيانة سريعة. 
                      أشكر فريق الحمد للسيارات على التعامل الرائع.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>منذ 6 أشهر</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Stats Summary */}
            <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">4.9</div>
                  <div className="text-sm text-gray-600 mb-1">تقييم العملاء</div>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">98%</div>
                  <div className="text-sm text-gray-600">رضا العملاء</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">15K+</div>
                  <div className="text-sm text-gray-600">تقييم</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">دعم عملاء</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* About Company Section */}
      <EnhancedLazySection rootMargin="50px">
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%233b82f6\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-lg mb-6 px-4 py-2">
                <Award className="ml-2 h-5 w-5" />
                من نحن
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                الحمد للسيارات
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
                شريككم الموثوق في عالم السيارات منذ أكثر من 25 عاماً
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>الوكيل الرسمي المعتمد لسيارات تاتا في مصر</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
                  <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    قصتنا
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                    تأسست الحمد للسيارات في عام 1999 كأحد الوكلاء الرائدين لسيارات تاتا في مصر. 
                    ومنذ ذلك الحين، ونحن نلتزم بتقديم أفضل المنتجات والخدمات لعملائنا الكرام.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    اليوم، نحن فخورون بكوننا أحد أكبر وأهم وكلاء تاتا في مصر، مع شبكة واسعة من المعارض 
                    ومراكز الخدمة تغطي جميع أنحاء الجمهورية.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
                  <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    رؤيتنا
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    أن نكون الخيار الأول والأفضل لكل من يبحث عن سيارة عالية الجودة بأسعار تنافسية في مصر، 
                    من خلال تقديم تجربة شراء فريدة وخدمة ما بعد بيع لا مثيل لها.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
                  <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    رسالتنا
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    تقديم سيارات تاتا عالية الجودة مع ضمان الجودة الأصلي، وخدمة عملاء استثنائية، 
                    وأسعار تنافسية تجعلنا الخيار الأمثل للعملاء في جميع أنحاء مصر.
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    إنجازاتنا
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {companyStats.length > 0 ? (
                      companyStats.slice(0, 4).map((stat) => (
                        <div key={stat.id} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-3xl font-bold mb-2">{stat.number}</div>
                          <div className="text-sm text-blue-100">{stat.label}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-3xl font-bold mb-2">25+</div>
                          <div className="text-sm text-blue-100">سنة خبرة</div>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-3xl font-bold mb-2">50K+</div>
                          <div className="text-sm text-blue-100">سيارة مباعة</div>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-3xl font-bold mb-2">15+</div>
                          <div className="text-sm text-blue-100">معرض وخدمة</div>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="text-3xl font-bold mb-2">100K+</div>
                          <div className="text-sm text-blue-100">عميل راضٍ</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl shadow-xl border border-green-200">
                  <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-700" />
                    </div>
                    قيمنا الأساسية
                  </h3>
                  <div className="space-y-4">
                    {companyValues.length > 0 ? (
                      companyValues.slice(0, 4).map((value) => (
                        <div key={value.id} className="flex items-start gap-3 group">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <div className="font-semibold text-green-800 group-hover:text-green-900 transition-colors">{value.title}</div>
                            <div className="text-sm text-green-600 group-hover:text-green-700 transition-colors">{value.description}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-3 group">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <div className="font-semibold text-green-800 group-hover:text-green-900 transition-colors">الجودة</div>
                            <div className="text-sm text-green-600 group-hover:text-green-700 transition-colors">نلتزم بأعلى معايير الجودة في كل ما نقدمه</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <div className="font-semibold text-green-800 group-hover:text-green-900 transition-colors">الثقة</div>
                            <div className="text-sm text-green-600 group-hover:text-green-700 transition-colors">نبني علاقات طويلة الأمد مبنية على الثقة والشفافية</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <div className="font-semibold text-green-800 group-hover:text-green-900 transition-colors">الابتكار</div>
                            <div className="text-sm text-green-600 group-hover:text-green-700 transition-colors">نسعى دائماً لتقديم أحدث التقنيات والحلول</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 group">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                          <div>
                            <div className="font-semibold text-green-800 group-hover:text-green-900 transition-colors">الخدمة</div>
                            <div className="text-sm text-green-600 group-hover:text-green-700 transition-colors">نضع العميل في مركز كل ما نقوم به</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <Link href="/about">
                    <TouchButton 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
                      hapticFeedback={true}
                    >
                      تعرف المزيد عن الشركة
                      <ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
                    </TouchButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* CTA Section */}
      <EnhancedLazySection rootMargin="50px">
        <section className="py-20 md:py-28 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-white/20 text-white border-white/30 shadow-lg mb-6 px-4 py-2">
                <Zap className="ml-2 h-5 w-5" />
                ابدأ رحلتك
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                جاهز لتجربة سيارة تاتا؟
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto leading-relaxed">
                زرنا اليوم واكتشف بنفسك تميز سيارات تاتا مع ضمان المصنع الكامل وخدمة ما بعد البيع المتميزة
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">قيادة تجريبية</h3>
                <p className="text-orange-100 mb-6 leading-relaxed">
                  جرب سيارة تاتا أحلامك بنفسك واختبر أدائها المتميز على الطريق
                </p>
                <Link href="/test-drive">
                  <TouchButton 
                    size="lg" 
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
                    hapticFeedback={true}
                  >
                    <Calendar className="ml-2 h-5 w-5" />
                    احجز قيادة تجريبية
                  </TouchButton>
                </Link>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">تواصل معنا</h3>
                <p className="text-orange-100 mb-6 leading-relaxed">
                  فريق الخبراء لدينا جاهز لمساعدتك في اختيار السيارة المثالية لك
                </p>
                <div className="flex justify-center">
                  <Link href="/contact">
                    <TouchButton 
                      size="lg" 
                      className="bg-transparent text-white hover:bg-white/20 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold flex items-center justify-center"
                      hapticFeedback={true}
                    >
                      <Phone className="ml-2 h-5 w-5" />
                      اتصل بنا الآن
                    </TouchButton>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-orange-100">
                  <Shield className="h-4 w-4" />
                  <span>ضمان المصنع لمدة 3 سنوات</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="flex items-center gap-2 text-orange-100">
                  <Wrench className="h-4 w-4" />
                  <span>خدمة صيانة معتمدة</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="flex items-center gap-2 text-orange-100">
                  <Star className="h-4 w-4" />
                  <span>تمويل سيارات بأفضل الأسعار</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </EnhancedLazySection>

      {/* Contact Section */}
      <EnhancedLazySection rootMargin="50px">
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-white/20 text-white border-white/30 shadow-lg mb-6 px-4 py-2">
                <Phone className="ml-2 h-5 w-5" />
                تواصل معنا
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                نحن هنا لمساعدتك
              </h2>
              <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                فريق الخبراء لدينا جاهز للرد على جميع استفساراتك وتقديم المساعدة على مدار الساعة
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-blue-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>خدمة عملاء 24/7</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>رد خلال ساعة واحدة</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Phone className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">اتصل بنا</h3>
                <p className="text-blue-100 mb-2 text-lg font-medium">+20 2 1234 5678</p>
                <p className="text-blue-200 mb-6">خدمة عملاء 24/7</p>
                <div className="space-y-2 text-sm text-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>استفسارات المبيعات</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>خدمة ما بعد البيع</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>دعم فني</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">البريد الإلكتروني</h3>
                <p className="text-blue-100 mb-2 text-lg font-medium">info@elhamdimport.com</p>
                <p className="text-blue-200 mb-6">رد خلال 24 ساعة</p>
                <div className="space-y-2 text-sm text-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span>معلومات عامة</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span>عروض خاصة</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span>شراكات عمل</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">الفروع</h3>
                <p className="text-blue-100 mb-2 text-lg font-medium">القاهرة، مصر</p>
                <p className="text-blue-200 mb-6">15 فرع في جميع المحافظات</p>
                <div className="space-y-2 text-sm text-blue-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>المعادي</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>مدينة نصر</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>الشيخ زايد</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-16">
              <Link href="/contact">
                <TouchButton 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold flex items-center justify-center"
                  hapticFeedback={true}
                >
                  <Mail className="ml-2 h-5 w-5" />
                  إرسال رسالة
                </TouchButton>
              </Link>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-blue-200">
                <Clock className="h-4 w-4" />
                <span>من السبت إلى الخميس: 9 صباحاً - 10 مساءً</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="flex items-center gap-2 text-blue-200">
                <Calendar className="h-4 w-4" />
                <span>الجمعة: 2 مساءً - 10 مساءً</span>
              </div>
            </div>
          </div>
        </section>
      </EnhancedLazySection>
      
      {/* Mobile Navigation */}
      {deviceInfo.isMobile && (
        <MobileNav
          items={[
            { label: 'الرئيسية', href: '/', icon: <HomeIcon className="w-5 h-5" /> },
            { label: 'السيارات', href: '/vehicles', icon: <Car className="w-5 h-5" /> },
            { label: 'قيادة تجريبية', href: '/test-drive', icon: <Calendar className="w-5 h-5" /> },
            { label: 'الخدمات', href: '/maintenance', icon: <Wrench className="w-5 h-5" /> },
            { label: 'اتصل بنا', href: '/contact', icon: <Phone className="w-5 h-5" /> },
          ]}
          activeItem="/"
          onItemClick={(href) => console.log('Navigate to:', href)}
        />
      )}
      
      {/* Quick Consultation Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Phone className="ml-2 h-4 w-4" />
              استشارة سريعة
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              تحتاج إلى مساعدة؟
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              فريقنا جاهز لمساعدتك في اختيار السيارة المناسبة أو حجز موعد للقيادة التجريبية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/consultation" className="group">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">استشارة فورية</h3>
                <p className="text-gray-600 mb-4">احصل على استشارة مجانية من خبرائنا</p>
                <div className="text-orange-600 font-medium group-hover:text-orange-700 transition-colors">
                  ابدأ الاستشارة →
                </div>
              </div>
            </Link>
            
            <Link href="/contact-info" className="group">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">معلومات الاتصال</h3>
                <p className="text-gray-600 mb-4">اعرف كيف تتصل بنا بسهولة</p>
                <div className="text-orange-600 font-medium group-hover:text-orange-700 transition-colors">
                  عرض المعلومات →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Configurable Popup */}
      <ConfigurablePopup page="homepage" />
      
      </div>
    </div>
  )
}