'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertCircle,
  Package,
  Shield,
  Award,
  Users,
  Clock,
  Zap,
  Heart,
  Eye,
  Grid,
  List,
  Home as HomeIcon,
  Truck,
  Settings,
  Droplet,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MessageCircle
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'
import { OptimizedImage, ResponsiveImage, BackgroundImage } from '@/components/ui/OptimizedImage'
import { LoadingIndicator, LoadingCard } from '@/components/ui/LoadingIndicator'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import { normalizeBrandingObject, normalizeBrandingText, DISTRIBUTOR_BRANDING } from '@/lib/branding'
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
import { FacebookFeeds } from '@/components/social/FacebookFeeds'
import { ModernVehicleCarousel } from '@/components/home/ModernVehicleCarousel'
import type { PublicVehicle } from '@/types/public-vehicle'

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

const arabicDayLabels: Record<string, string> = {
  Saturday: 'السبت',
  Sunday: 'الأحد',
  Monday: 'الإثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة'
}

const fallbackVehicles: PublicVehicle[] = [
  {
    id: 'fallback-nexon-ev',
    make: 'Tata',
    model: 'Nexon EV',
    year: 2024,
    price: 650000,
    category: 'SUV',
    fuelType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    mileage: 0,
    images: [
      { imageUrl: '/uploads/vehicles/1/tata-nexon-ev-1.jpg', isPrimary: true }
    ]
  },
  {
    id: 'fallback-punch',
    make: 'Tata',
    model: 'Punch',
    year: 2024,
    price: 380000,
    category: 'CROSSOVER',
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    mileage: 0,
    images: [
      { imageUrl: '/uploads/vehicles/2/tata-punch-1.jpg', isPrimary: true }
    ]
  },
  {
    id: 'fallback-tiago',
    make: 'Tata',
    model: 'Tiago',
    year: 2024,
    price: 345000,
    category: 'HATCHBACK',
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    mileage: 0,
    images: [
      { imageUrl: '/uploads/vehicles/3/tata-tiago-1.jpg', isPrimary: true }
    ]
  }
]

const resolveServiceIcon = (iconName?: string): LucideIcon => {
  if (!iconName) {
    return Wrench
  }

  const trimmed = iconName.trim()
  if (!trimmed) {
    return Wrench
  }

  const directMatch = (LucideIcons as Record<string, LucideIcon | undefined>)[trimmed as keyof typeof LucideIcons]
  if (directMatch) {
    return directMatch
  }

  const pascalCase = trimmed
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('')

  const normalizedMatch = (LucideIcons as Record<string, LucideIcon | undefined>)[pascalCase as keyof typeof LucideIcons]

  return normalizedMatch ?? Wrench
}

const resolveServiceLink = (rawLink?: string): string => {
  if (!rawLink) {
    return '/service-booking'
  }

  const trimmed = rawLink.trim()
  if (!trimmed) {
    return '/service-booking'
  }

  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(trimmed)) {
    return trimmed
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizeContactInfo = (data: any) => {
  if (!data) {
    return null
  }

  const workingHoursRaw = data.workingHours ?? {}
  const workingHoursObject = Array.isArray(workingHoursRaw)
    ? workingHoursRaw.reduce((acc: Record<string, string>, entry: any) => {
        if (entry?.day && entry?.hours) {
          acc[entry.day] = entry.hours
        }
        return acc
      }, {})
    : typeof workingHoursRaw === 'object' && workingHoursRaw !== null
      ? workingHoursRaw
      : {}

  const resolveValue = (key: string) => {
    const direct = workingHoursObject[key]
    if (typeof direct === 'string' && direct.trim()) {
      return direct
    }

    const capitalized = key.charAt(0).toUpperCase() + key.slice(1)
    const fallback = workingHoursObject[capitalized]
    if (typeof fallback === 'string' && fallback.trim()) {
      return fallback
    }

    return undefined
  }

  const weekdayKeys = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  const weekdaySegments = weekdayKeys
    .map((day) => {
      const value = resolveValue(day)
      return value ? `${arabicDayLabels[day]}: ${value}` : null
    })
    .filter(Boolean) as string[]

  const weekdaysLine =
    resolveValue('weekdays') ?? resolveValue('Weekdays') ?? (weekdaySegments.length ? weekdaySegments.join(' • ') : null)

  const fridayValue = resolveValue('friday') ?? resolveValue('Friday')
  const saturdayValue = resolveValue('saturday') ?? resolveValue('Saturday')

  return {
    headquarters: {
      address: data.address ?? 'القاهرة، مصر',
      phone: data.primaryPhone ?? data.secondaryPhone ?? 'غير متوفر',
      email: data.primaryEmail ?? data.secondaryEmail ?? 'غير متوفر'
    },
    contactNumbers: {
      primary: data.primaryPhone ?? null,
      secondary: data.secondaryPhone ?? null
    },
    workingHours: {
      weekdays: weekdaysLine ?? 'السبت - الخميس: 9:00 ص - 5:00 م',
      friday: fridayValue ? `الجمعة: ${fridayValue}` : 'الجمعة: مغلق',
      saturday: saturdayValue ? `السبت: ${saturdayValue}` : undefined
    },
    emergency: data.emergency ?? null,
    socialMedia: data.socialMedia ?? {},
    headquartersGeo:
      typeof data.mapLat === 'number' && typeof data.mapLng === 'number'
        ? { lat: data.mapLat, lng: data.mapLng }
        : null
  }
}

export default function Home() {
  const deviceInfo = useDeviceInfo()
  const [featuredVehicles, setFeaturedVehicles] = useState<PublicVehicle[]>([])
  const [totalVehiclesCount, setTotalVehiclesCount] = useState<number | null>(null)
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [serviceItems, setServiceItems] = useState<any[]>([])
  const [companyStats, setCompanyStats] = useState<any[]>([])
  const [companyValues, setCompanyValues] = useState<any[]>([])
  const [companyFeatures, setCompanyFeatures] = useState<any[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [homepageSettings, setHomepageSettings] = useState({
    showHeroSlider: true,
    autoPlaySlider: true,
    sliderInterval: 5000,
    showServices: true,
    servicesTitle: 'خدماتنا المتكاملة',
    servicesSubtitle: 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
    servicesDescription: 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
    servicesCtaText: 'احجز الآن',
    facebookPageUrl: 'https://www.facebook.com/elhamdimport',
    facebookVideoUrl: 'https://www.facebook.com/elhamdimport/videos'
  })
  const [loading, setLoading] = useState(true)
  const [sliderLoading, setSliderLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [sliderInterval, setSliderInterval] = useState(5000)

  const { handleError, clearError } = useErrorHandler()

  const facebookPageUrl =
    homepageSettings.facebookPageUrl ??
    contactInfo?.socialMedia?.facebook ??
    companyInfo?.socialMedia?.facebook ??
    companyInfo?.socialLinks?.facebook ??
    'https://www.facebook.com/elhamdimport'

  const facebookVideoUrl = homepageSettings.facebookVideoUrl?.trim() || `${facebookPageUrl}/videos`

  const carouselVehicles = useMemo(() => {
    if (featuredVehicles.length > 0) {
      return featuredVehicles
    }

    return fallbackVehicles
  }, [featuredVehicles])
  const resolvedVehiclesCount =
    typeof totalVehiclesCount === 'number'
      ? totalVehiclesCount
      : featuredVehicles.length > 0
        ? featuredVehicles.length
        : carouselVehicles.length

  useEffect(() => {
    console.log('🚀 Component mounted, starting data fetch...')
    
    // Fetch all data from APIs
    const fetchAllData = async () => {
      try {
        // Fetch homepage settings
        const settingsResponse = await fetch('/api/homepage-settings', { cache: 'no-store' })
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setHomepageSettings({
            showHeroSlider: Boolean(settingsData?.showHeroSlider),
            autoPlaySlider: Boolean(settingsData?.autoPlaySlider),
            sliderInterval: typeof settingsData?.sliderInterval === 'number' ? settingsData.sliderInterval : 5000,
            showServices: Boolean(settingsData?.showServices),
            servicesTitle: typeof settingsData?.servicesTitle === 'string'
              ? settingsData.servicesTitle
              : 'خدماتنا المتكاملة',
            servicesSubtitle: typeof settingsData?.servicesSubtitle === 'string'
              ? settingsData.servicesSubtitle
              : 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
            servicesDescription: typeof settingsData?.servicesDescription === 'string'
              ? settingsData.servicesDescription
              : 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
            servicesCtaText: typeof settingsData?.servicesCtaText === 'string'
              ? settingsData.servicesCtaText
              : 'احجز الآن',
            facebookPageUrl: typeof settingsData?.facebookPageUrl === 'string'
              ? settingsData.facebookPageUrl
              : 'https://www.facebook.com/elhamdimport',
            facebookVideoUrl: typeof settingsData?.facebookVideoUrl === 'string'
              ? settingsData.facebookVideoUrl
              : 'https://www.facebook.com/elhamdimport/videos'
          })
          setIsAutoPlay(Boolean(settingsData?.autoPlaySlider))
          setSliderInterval(typeof settingsData?.sliderInterval === 'number' ? settingsData.sliderInterval : 5000)
        }

        // Fetch company info
        const companyInfoResponse = await fetch('/api/company-info')
        if (companyInfoResponse.ok) {
          const companyData = await companyInfoResponse.json()
          setCompanyInfo(normalizeBrandingObject(companyData))
        }

        // Fetch service items
        const serviceItemsResponse = await fetch('/api/service-items')
        if (serviceItemsResponse.ok) {
          const serviceData = await serviceItemsResponse.json()
          if (Array.isArray(serviceData)) {
            // Remove duplicates based on title
            const uniqueServices = serviceData.reduce((acc, current) => {
              if (!acc.find(item => item.title === current.title)) {
                acc.push(normalizeBrandingObject(current))
              }
              return acc
            }, [])
            setServiceItems(uniqueServices)
          } else {
            setServiceItems([])
          }
        }

        // Fetch company stats
        const statsResponse = await fetch('/api/about/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (Array.isArray(statsData)) {
            // Remove duplicates based on label
            const uniqueStats = statsData.reduce((acc, current) => {
              if (!acc.find(item => item.label === current.label)) {
                acc.push(normalizeBrandingObject(current))
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
          if (Array.isArray(valuesData)) {
            // Remove duplicates based on title
            const uniqueValues = valuesData.reduce((acc, current) => {
              if (!acc.find(item => item.title === current.title)) {
                acc.push(normalizeBrandingObject(current))
              }
              return acc
            }, [])
            setCompanyValues(uniqueValues)
          } else {
            setCompanyValues([])
          }
        }

        // Fetch company features
        const featuresResponse = await fetch('/api/about/features')
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json()
          setCompanyFeatures(Array.isArray(featuresData) ? featuresData.map((feature: any) => normalizeBrandingObject(feature)) : [])
        }

        // Fetch timeline events
        const timelineResponse = await fetch('/api/about/timeline')
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json()
          if (Array.isArray(timelineData)) {
            // Remove duplicates based on year and title
            const uniqueTimeline = timelineData.reduce((acc, current) => {
              const exists = acc.find(item => item.year === current.year && item.title === current.title)
              if (!exists) {
                acc.push(normalizeBrandingObject(current))
              }
              return acc
            }, [])
            setTimelineEvents(uniqueTimeline)
          } else {
            setTimelineEvents([])
          }
        }

        // Fetch contact info
        const contactResponse = await fetch('/api/contact-info')
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          setContactInfo(normalizeContactInfo(normalizeBrandingObject(contactData)))
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
          setSliderItems(sliders.map((item) => normalizeBrandingObject(item)))
        }

        // Fetch vehicles
        const vehiclesResponse = await fetch('/api/public/vehicles?limit=1000&page=1')
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          const normalizedVehicles = Array.isArray(vehiclesData?.vehicles)
            ? vehiclesData.vehicles.map((vehicle: PublicVehicle) => normalizeBrandingObject(vehicle))
            : []
          setFeaturedVehicles(normalizedVehicles)
          setTotalVehiclesCount(
            typeof vehiclesData?.pagination?.total === 'number'
              ? vehiclesData.pagination.total
              : normalizedVehicles.length
          )

          if (!vehiclesData?.vehicles || vehiclesData.vehicles.length === 0) {
            toast.info('لا توجد سيارات متاحة حالياً')
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
      }, sliderInterval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAutoPlay, sliderItems.length, sliderInterval])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const serviceSectionTitle = homepageSettings.servicesTitle?.trim() || 'خدماتنا المتكاملة'
  const serviceSectionSubtitle = homepageSettings.servicesSubtitle?.trim() || 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا'
  const serviceSectionDescription = homepageSettings.servicesDescription?.trim()
  const serviceCtaText = homepageSettings.servicesCtaText?.trim() || 'احجز الآن'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Mobile-Optimized Slider Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh]">
        <WorkingSlider
          items={sliderItems}
          loading={sliderLoading}
          autoPlay={isAutoPlay}
          autoPlayInterval={sliderInterval}
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
                        {companyInfo.features?.[0] || 'موزع معتمد'}
                      </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      {companyInfo.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 text-blue-100 font-semibold">
                      {normalizeBrandingText(companyInfo.subtitle || DISTRIBUTOR_BRANDING)}
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

        {/* Our Vehicles */}
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
                  <Car className="ml-2 h-4 w-4" />
                  {companyInfo?.features?.[0] || 'سياراتنا'}
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  {companyInfo?.title || 'استعرض سيارات تاتا'}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {normalizeBrandingText(companyInfo?.subtitle || DISTRIBUTOR_BRANDING)}
                </p>
              </div>
            
              <ModernVehicleCarousel
                vehicles={carouselVehicles}
                loading={loading}
                error={error}
                onRetry={() => window.location.reload()}
                totalVehiclesCount={resolvedVehiclesCount}
              />
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
        {homepageSettings.showServices && serviceItems.length > 0 && (
          <EnhancedLazySection rootMargin="100px" preload={false}>
            <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">
                    <Wrench className="ml-2 h-4 w-4" />
                    خدماتنا
                  </Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                    {serviceSectionTitle}
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {serviceSectionSubtitle}
                  </p>
                  {serviceSectionDescription && (
                    <p className="text-base text-gray-500 max-w-3xl mx-auto leading-relaxed mt-3">
                      {serviceSectionDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {serviceItems.map((service, index) => {
                    const IconComponent = resolveServiceIcon(service.icon)
                    const href = resolveServiceLink(service.link)

                    return (
                      <Card
                        key={service?.id ?? `service-${index}`}
                        className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                      >
                        <CardHeader className="text-center pb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {service.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          {service.description && (
                            <p className="text-gray-600 mb-6 leading-relaxed">
                              {service.description}
                            </p>
                          )}
                          {Array.isArray(service.features) && service.features.length > 0 && (
                            <ul className="text-sm text-gray-500 space-y-2 mb-6 text-right">
                              {service.features.slice(0, 3).map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-center justify-end gap-2">
                                  <span>{feature}</span>
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                </li>
                              ))}
                            </ul>
                          )}
                          {service.duration && (
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-gray-500">المدة:</span>
                              <span className="text-sm font-medium text-gray-700">{service.duration}</span>
                            </div>
                          )}
                          {service.price && (
                            <div className="flex items-center justify-between mb-6">
                              <span className="text-sm text-gray-500">السعر:</span>
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(service.price)}
                              </span>
                            </div>
                          )}
                          <Link href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                            <TouchButton
                              variant="outline"
                              className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                            >
                              {service.ctaText?.trim() || serviceCtaText}
                            </TouchButton>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
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
                      {contactInfo.socialMedia &&
                        Object.entries(contactInfo.socialMedia)
                          .filter(([, url]) => typeof url === 'string' && url)
                          .map(([platform, url]) => {
                            const platformKey = platform.toLowerCase()
                            const socialIconMap: Record<string, LucideIcon> = {
                              facebook: Facebook,
                              instagram: Instagram,
                              linkedin: Linkedin,
                              twitter: Twitter,
                              youtube: Youtube,
                              whatsapp: MessageCircle,
                              messenger: MessageCircle,
                              default: Users
                            }
                            const SocialIcon = socialIconMap[platformKey] || socialIconMap.default

                            return (
                              <a
                                key={platform}
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-blue-50 hover:text-white transition-colors"
                              >
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                  <SocialIcon className="h-4 w-4" />
                                </div>
                                <span className="capitalize">{platform}</span>
                              </a>
                            )
                          })}
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

        <EnhancedLazySection rootMargin="100px" preload={false}>
          <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                  <Facebook className="ml-2 h-4 w-4" />
                  تابعونا على فيسبوك
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  أحدث ما ننشره على فيسبوك
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  تعرفوا على آخر الأخبار والعروض من خلال فيديوهاتنا ومنشوراتنا على فيسبوك.
                </p>
              </div>
              <FacebookFeeds pageUrl={facebookPageUrl} videoUrl={facebookVideoUrl} />
            </div>
          </section>
        </EnhancedLazySection>

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
                    comment: 'أفضل موزع سيارات تعاملت معه. أسعار ممتازة وخدمة ما بعد البيع رائعة.',
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