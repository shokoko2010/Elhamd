'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Phone, Mail, MapPin, Calendar, Wrench, Star, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, AlertCircle, Package } from 'lucide-react'
import Link from 'next/link'
import { VehicleCardSkeleton, HeroSliderSkeleton } from '@/components/ui/skeleton'
import { LazySection } from '@/components/ui/LazySection'
import { OptimizedImage, ResponsiveImage, BackgroundImage } from '@/components/ui/OptimizedImage'
import { LoadingIndicator, LoadingCard, ErrorState } from '@/components/ui/LoadingIndicator'
import { cache } from '@/lib/cache'
import { ErrorHandler, useErrorHandler } from '@/lib/errorHandler'
import { toast } from 'sonner'

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
    // Fetch company info from API with caching
    const fetchCompanyInfo = async () => {
      try {
        // Check cache first
        const cachedData = cache.get('company-info')
        if (cachedData) {
          setCompanyInfo(cachedData)
          return
        }

        const response = await fetch('/api/company-info')
        if (response.ok) {
          const data = await response.json()
          setCompanyInfo(data)
          // Cache the data for 30 minutes (static data)
          cache.setStatic('company-info', data)
        }
      } catch (error) {
        handleError(error)
      }
    }

    // Fetch service items from API with caching
    const fetchServiceItems = async () => {
      try {
        // Check cache first
        const cachedData = cache.get('service-items')
        if (cachedData) {
          setServiceItems(cachedData)
          return
        }

        const response = await fetch('/api/service-items')
        if (response.ok) {
          const data = await response.json()
          setServiceItems(data)
          // Cache the data for 30 minutes (static data)
          cache.setStatic('service-items', data)
        }
      } catch (error) {
        handleError(error)
      }
    }

    // Fetch company stats from API with caching
    const fetchCompanyStats = async () => {
      try {
        // Check cache first
        const cachedData = cache.get('company-stats')
        if (cachedData) {
          setCompanyStats(cachedData)
          return
        }

        const response = await fetch('/api/about/stats')
        if (response.ok) {
          const data = await response.json()
          setCompanyStats(data)
          // Cache the data for 30 minutes (static data)
          cache.setStatic('company-stats', data)
        }
      } catch (error) {
        handleError(error)
      }
    }

    // Fetch company values from API with caching
    const fetchCompanyValues = async () => {
      try {
        // Check cache first
        const cachedData = cache.get('company-values')
        if (cachedData) {
          setCompanyValues(cachedData)
          return
        }

        const response = await fetch('/api/about/values')
        if (response.ok) {
          const data = await response.json()
          setCompanyValues(data)
          // Cache the data for 30 minutes (static data)
          cache.setStatic('company-values', data)
        }
      } catch (error) {
        handleError(error)
      }
    }

    // Fetch company features from API with caching
    const fetchCompanyFeatures = async () => {
      try {
        // Check cache first
        const cachedData = cache.get('company-features')
        if (cachedData) {
          setCompanyFeatures(cachedData)
          return
        }

        const response = await fetch('/api/about/features')
        if (response.ok) {
          const data = await response.json()
          setCompanyFeatures(data)
          // Cache the data for 30 minutes (static data)
          cache.setStatic('company-features', data)
        }
      } catch (error) {
        handleError(error)
      }
    }

    // Fetch sliders from API with caching
    const fetchSliders = async () => {
      try {
        // Check cache first
        const cachedData = cache.get('sliders')
        if (cachedData) {
          setSliderItems(cachedData)
          setSliderLoading(false)
          return
        }

        const response = await fetch('/api/sliders?activeOnly=true')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setSliderItems(data.sliders)
        
        // Cache the data for 10 minutes (dynamic content)
        cache.setApiResponse('sliders', data.sliders)
        
        if (data.sliders.length === 0) {
          // If no sliders in database, use default ones
          const defaultSliders: SliderItem[] = [
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
          setSliderItems(defaultSliders)
        }
      } catch (error) {
        handleError(error)
        // Use default sliders on error as fallback
        const defaultSliders: SliderItem[] = [
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
        setSliderItems(defaultSliders)
      } finally {
        setSliderLoading(false)
      }
    }

    // Fetch featured vehicles from API with caching
    const fetchVehicles = async () => {
      try {
        clearError()
        
        // Check cache first
        const cachedData = cache.get('featured-vehicles')
        if (cachedData) {
          setFeaturedVehicles(cachedData)
          setLoading(false)
          return
        }

        const response = await fetch('/api/vehicles?featured=true&limit=6')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setFeaturedVehicles(data.vehicles)
        
        // Cache the data for 5 minutes (dynamic content)
        cache.setDynamic('featured-vehicles', data.vehicles)
        
        if (data.vehicles.length === 0) {
          toast.info('لا توجد سيارات مميزة متاحة حالياً')
        }
      } catch (error) {
        const appError = handleError(error)
        setError(appError.message)
        toast.error(appError.message, {
          description: appError.details,
          duration: 5000
        })
        setFeaturedVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyInfo()
    fetchServiceItems()
    fetchCompanyStats()
    fetchCompanyValues()
    fetchCompanyFeatures()
    fetchSliders()
    fetchVehicles()
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
    <div className="min-h-screen">
      {/* Professional Slider Section */}
      <section className="relative">
        {sliderLoading ? (
          <div className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-blue-900 to-blue-700">
            <LoadingCard 
              title="جاري تحميل السلايدر..."
              description="يرجى الانتظار بينما نقوم بتحميل المحتوى"
              className="bg-transparent border-0 text-white"
            />
          </div>
        ) : (
          <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
            {/* Simple Carousel Implementation */}
            <div className="relative w-full h-full">
              {sliderItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                    currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className="relative h-full w-full">
                    <img
                      src={item.imageUrl}
                      alt={`${item.title} - ${item.subtitle}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', item.imageUrl)
                        const target = e.target as HTMLImageElement
                        if (!target.src.includes('/public')) {
                          target.src = `/public${item.imageUrl}`
                        } else if (target.src.includes('/public')) {
                          target.src = item.imageUrl.replace('/public', '')
                        } else if (!target.src.startsWith('http')) {
                          target.src = `http://localhost:3000${item.imageUrl}`
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
                    
                    {/* Content Overlay */}
                    <div className="relative z-20 h-full flex items-center">
                      <div className="container mx-auto px-4">
                        <div className="max-w-3xl text-right">
                          {/* Badge */}
                          {item.badge && (
                            <Badge className={`${item.badgeColor} text-white mb-4 text-sm px-3 py-1`}>
                              {item.badge}
                            </Badge>
                          )}
                          
                          {/* Title */}
                          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                            {item.title}
                          </h1>
                          
                          {/* Subtitle */}
                          <h2 className="text-xl md:text-2xl lg:text-3xl text-blue-200 mb-6 font-light">
                            {item.subtitle}
                          </h2>
                          
                          {/* Description */}
                          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl ml-auto">
                            {item.description}
                          </p>
                          
                          {/* CTA Button */}
                          <Link href={item.ctaLink}>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                              {item.ctaText}
                              <ChevronLeft className="mr-2 h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Controls */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : sliderItems.length - 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev < sliderItems.length - 1 ? prev + 1 : 0))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Custom Dots */}
            <div className="absolute bottom-8 right-1/2 translate-x-1/2 z-20">
              <div className="flex space-x-2">
                {sliderItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Auto-play Toggle */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        )}
      </section>

      {/* Company Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-right">
                {companyInfo ? (
                  <>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                      {companyInfo.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 text-blue-600 font-semibold">
                      {companyInfo.subtitle}
                    </p>
                    <p className="text-lg mb-8 text-gray-700 leading-relaxed">
                      {companyInfo.description}
                    </p>
                    <div className="space-y-4 mb-8">
                      {companyInfo.features && companyInfo.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {companyInfo.ctaButtons && companyInfo.ctaButtons.map((button: any, index: number) => (
                        <Link key={index} href={button.link}>
                          <Button 
                            size="lg" 
                            className={button.variant === 'primary' 
                              ? "bg-blue-600 hover:bg-blue-700 text-white" 
                              : button.text === 'قيادة تجريبية'
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            }
                          >
                            {button.text === 'استعرض السيارات' && <Car className="ml-2 h-5 w-5" />}
                            {button.text === 'قيادة تجريبية' && <Calendar className="ml-2 h-5 w-5" />}
                            {button.text}
                          </Button>
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
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden shadow-2xl">
                  <OptimizedImage 
                    src="/uploads/showroom-luxury.jpg" 
                    alt="معرض الحمد للسيارات" 
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={85}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                  <div className="text-2xl font-bold">
                    {companyStats.find(stat => stat.label === 'سنة خبرة')?.number || '25+'}
                  </div>
                  <div className="text-sm">سنة خبرة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <LazySection rootMargin="50px">
        <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">السيارات المميزة</h2>
            <p className="text-lg text-gray-600 mb-2">
              استكشف أحدث وأشهر موديلات تاتا لعام 2024
            </p>
            <p className="text-sm text-gray-500">
              جميع السيارات جديدة مع ضمان المصنع الكامل
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <LoadingCard key={i} title="جاري تحميل السيارة..." className="h-80" />
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
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد سيارات مميزة</h3>
              <p className="text-gray-600 mb-4">سيتم إضافة سيارات مميزة قريباً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <ResponsiveImage
                      src={vehicle.images[0]?.imageUrl || '/api/placeholder/400/300'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      quality={80}
                    />
                    <Badge className="absolute top-2 left-2 bg-blue-600">
                      مميزة
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-gray-600">{vehicle.year}</p>
                      </div>
                      <Badge variant="outline">{vehicle.category}</Badge>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="secondary">{vehicle.fuelType}</Badge>
                      <Badge variant="secondary">{vehicle.transmission}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-900">
                        {formatPrice(vehicle.price)}
                      </span>
                      <Link href={`/vehicles/${vehicle.id}`}>
                        <Button size="sm">التفاصيل</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/vehicles">
              <Button size="lg" variant="outline">
                عرض جميع السيارات
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </LazySection>

      {/* Services Section */}
      <LazySection rootMargin="50px">
        <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا المتميزة</h2>
            <p className="text-lg text-gray-600 mb-2">
              حلول سيارات شاملة تلبي جميع احتياجاتك
            </p>
            <p className="text-sm text-gray-500">
              نقدم لكم أفضل الخدمات بمعايير عالمية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  return <IconComponent className="h-8 w-8" />
                }

                // Map service colors with explicit Tailwind classes
                const getBgColorClass = (iconName: string) => {
                  switch (iconName) {
                    case 'Car': return 'bg-blue-100';
                    case 'Calendar': return 'bg-green-100';
                    case 'Wrench': return 'bg-orange-100';
                    case 'CreditCard': return 'bg-purple-100';
                    case 'Mail': return 'bg-red-100';
                    case 'Package': return 'bg-indigo-100';
                    case 'Phone': return 'bg-pink-100';
                    case 'MapPin': return 'bg-yellow-100';
                    default: return 'bg-blue-100';
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
                  <Card key={service.id} className="text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
                    <Link href={service.link || '#'}>
                      <CardHeader>
                        <div className={`w-16 h-16 ${getBgColorClass(service.icon)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <div className={`${getTextColorClass(service.icon)}`}>
                            {getIconComponent(service.icon)}
                          </div>
                        </div>
                        <CardTitle>{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Link>
                  </Card>
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
      </LazySection>

      {/* Features Section */}
      <LazySection rootMargin="50px">
        <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختار الحمد للسيارات؟</h2>
            <p className="text-lg text-gray-600 mb-2">
              نحن نقدم لك أفضل تجربة لشراء وامتلاك السيارات
            </p>
            <p className="text-sm text-gray-500">
              أكثر من 25 عاماً من الخبرة في سوق السيارات المصري
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  return <IconComponent className="h-10 w-10 text-white" />
                }

                // Map feature colors with explicit Tailwind classes
                const getBgColorClass = (colorName: string) => {
                  switch (colorName) {
                    case 'orange': return 'bg-orange-600';
                    case 'green': return 'bg-green-600';
                    case 'red': return 'bg-red-600';
                    case 'purple': return 'bg-purple-600';
                    case 'yellow': return 'bg-yellow-600';
                    case 'pink': return 'bg-pink-600';
                    case 'indigo': return 'bg-indigo-600';
                    case 'blue':
                    default: return 'bg-blue-600';
                  }
                };
                
                const getDotColorClass = (colorName: string) => {
                  switch (colorName) {
                    case 'orange': return 'bg-orange-600';
                    case 'green': return 'bg-green-600';
                    case 'red': return 'bg-red-600';
                    case 'purple': return 'bg-purple-600';
                    case 'yellow': return 'bg-yellow-600';
                    case 'pink': return 'bg-pink-600';
                    case 'indigo': return 'bg-indigo-600';
                    case 'blue':
                    default: return 'bg-blue-600';
                  }
                };

                return (
                  <div key={feature.id} className="text-center group">
                    <div className={`w-20 h-20 ${getBgColorClass(feature.color)} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      {getIconComponent(feature.icon)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-3">
                      {feature.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      {feature.features && feature.features.map((feat: string, index: number) => (
                        <div key={index} className="flex items-center justify-center gap-2">
                          <div className={`w-1 h-1 ${getDotColorClass(feature.color)} rounded-full`}></div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <>
                <div className="text-center group">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Car className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">تشكيلة واسعة</h3>
                  <p className="text-gray-600 mb-3">
                    أحدث موديلات تاتا 2024 بمواصفات عالمية وأسعار تنافسية
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      <span>نيكسون • بانش • تياجو</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      <span>تيغور • ألتروز • هارير</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Wrench className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">خدمة مميزة</h3>
                  <p className="text-gray-600 mb-3">
                    فريق محترف من الفنيين المعتمدين وخدمة عملاء على مدار الساعة
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      <span>صيانة معتمدة</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                      <span>قطع غيار أصلية</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">تمويل سهل</h3>
                  <p className="text-gray-600 mb-3">
                    خيارات تمويل مرنة وبنود سداد مريحة تناسب جميع الميزانيات
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>فوائد تنافسية</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>موافقات سريعة</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      </LazySection>

      {/* About Company Section */}
      <LazySection rootMargin="50px">
        <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">من نحن</h2>
              <p className="text-lg text-gray-600 mb-2">
                الحمد للسيارات - شريككم الموثوق في عالم السيارات
              </p>
              <p className="text-sm text-gray-500">
                أكثر من ربع قرن من الخبرة والتميز
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">قصتنا</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    تأسست الحمد للسيارات في عام 1999 كأحد الوكلاء الرائدين لسيارات تاتا في مصر. 
                    ومنذ ذلك الحين، ونحن نلتزم بتقديم أفضل المنتجات والخدمات لعملائنا الكرام.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    اليوم، نحن فخورون بكوننا أحد أكبر وأهم وكلاء تاتا في مصر، مع شبكة واسعة من المعارض 
                    ومراكز الخدمة تغطي جميع أنحاء الجمهورية.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">رؤيتنا</h3>
                  <p className="text-gray-700 leading-relaxed">
                    أن نكون الخيار الأول والأفضل لكل من يبحث عن سيارة عالية الجودة بأسعار تنافسية في مصر، 
                    من خلال تقديم تجربة شراء فريدة وخدمة ما بعد بيع لا مثيل لها.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">رسالتنا</h3>
                  <p className="text-gray-700 leading-relaxed">
                    تقديم سيارات تاتا عالية الجودة مع ضمان الجودة الأصلي، وخدمة عملاء استثنائية، 
                    وأسعار تنافسية تجعلنا الخيار الأمثل للعملاء في جميع أنحاء مصر.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">إنجازاتنا</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {companyStats.length > 0 ? (
                      companyStats.slice(0, 4).map((stat) => (
                        <div key={stat.id} className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">{stat.number}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">25+</div>
                          <div className="text-sm text-gray-600">سنة خبرة</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">50K+</div>
                          <div className="text-sm text-gray-600">سيارة مباعة</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">15+</div>
                          <div className="text-sm text-gray-600">معرض وخدمة</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">100K+</div>
                          <div className="text-sm text-gray-600">عميل راضٍ</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">قيمنا</h3>
                  <div className="space-y-3">
                    {companyValues.length > 0 ? (
                      companyValues.map((value) => (
                        <div key={value.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-semibold">{value.title}</div>
                            <div className="text-sm text-gray-600">{value.description}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-semibold">الجودة</div>
                            <div className="text-sm text-gray-600">نلتزم بأعلى معايير الجودة في كل ما نقدمه</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-semibold">الثقة</div>
                            <div className="text-sm text-gray-600">نبني علاقات طويلة الأمد مبنية على الثقة والشفافية</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-semibold">الابتكار</div>
                            <div className="text-sm text-gray-600">نسعى دائماً لتقديم أحدث التقنيات والحلول</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-semibold">الخدمة</div>
                            <div className="text-sm text-gray-600">نضع العميل في مركز كل ما نقوم به</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <Link href="/about">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                      تعرف المزيد عن الشركة
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </LazySection>

      {/* CTA Section */}
      <LazySection rootMargin="50px">
        <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            جاهز لتجربة سيارة تاتا؟
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            زرنا اليوم واكتشف بنفسك تميز سيارات تاتا
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/test-drive">
              <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                <Calendar className="ml-2 h-5 w-5" />
                قيادة تجريبية
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="bg-transparent text-white hover:bg-white/20 border-2 border-white">
                <Phone className="ml-2 h-5 w-5" />
                اتصل بنا
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </LazySection>

      {/* Contact Section */}
      <LazySection rootMargin="50px">
        <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-lg text-blue-100 mb-2">
              نحن هنا لمساعدتك على مدار الساعة
            </p>
            <p className="text-sm text-blue-200">
              لا تتردد في الاتصال بنا لأي استفسار أو مساعدة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">اتصل بنا</h3>
              <p className="text-blue-100 mb-1">+20 2 1234 5678</p>
              <p className="text-sm text-blue-200">خدمة عملاء 24/7</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">البريد الإلكتروني</h3>
              <p className="text-blue-100 mb-1">info@alhamdcars.com</p>
              <p className="text-sm text-blue-200">رد خلال 24 ساعة</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">الفروع</h3>
              <p className="text-blue-100 mb-1">القاهرة، مصر</p>
              <p className="text-sm text-blue-200">15 فرع في جميع المحافظات</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 border-2 border-white">
                <Mail className="ml-2 h-5 w-5" />
                إرسال رسالة
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </LazySection>
    </div>
  )
}