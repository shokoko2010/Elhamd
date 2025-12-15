
import { Suspense } from 'react'
import Link from 'next/link'
import {
  Car, Phone, Mail, MapPin, Calendar, Wrench, Star,
  ArrowLeft, ChevronLeft, ChevronRight, Play, Pause,
  AlertCircle, Package, Shield, Award, Users, Clock,
  Zap, Heart, Eye, Grid, List, Home as HomeIcon,
  Truck, Settings, Droplet, Facebook, Instagram,
  Linkedin, Twitter, Youtube, MessageCircle
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'
import { EnhancedLazyImage } from '@/components/ui/enhanced-lazy-loading'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import { ModernVehicleCarousel } from '@/components/home/ModernVehicleCarousel'
import { FacebookFeeds } from '@/components/social/FacebookFeeds'
import ConfigurablePopup from '@/components/ConfigurablePopup'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import CompanyMap from '@/components/ui/CompanyMap'

import { normalizeBrandingObject, normalizeBrandingText, DISTRIBUTOR_BRANDING } from '@/lib/branding'
import {
  getHomepageSettings,
  getCompanyInfo,
  getServiceItems,
  getStats,
  getValues,
  getFeatures,
  getTimeline,
  getContactInfo,
  getSiteSettings,
  getSliders,
  getPublicVehicles
} from '@/services/home-data'
import type { PublicVehicle } from '@/types/public-vehicle'

// Force revalidation every hour
export const revalidate = 3600

// Helper Types & Functions
type SliderContentPosition =
  | 'top-right'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
  | 'top-left'
  | 'bottom-left'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'

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
  contentPosition?: SliderContentPosition
  contentSize?: 'sm' | 'md' | 'lg'
  contentColor?: string
  contentShadow?: boolean
  contentStrokeColor?: string
  contentStrokeWidth?: number
  order?: number
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

const normalizeContentPosition = (position?: string): SliderContentPosition => {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
    case 'top-center':
    case 'bottom-center':
    case 'top-left':
    case 'bottom-left':
    case 'middle-left':
    case 'middle-center':
    case 'middle-right':
      return position as SliderContentPosition
    case 'left': return 'middle-left'
    case 'center': return 'middle-center'
    case 'right': return 'middle-right'
    case 'top': return 'top-center'
    case 'bottom': return 'bottom-center'
    default: return 'top-right'
  }
}

const resolveServiceIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Wrench
  const trimmed = iconName.trim()
  if (!trimmed) return Wrench

  const directMatch = (LucideIcons as any)[trimmed]
  if (directMatch) return directMatch

  const pascalCase = trimmed
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('')

  const normalizedMatch = (LucideIcons as any)[pascalCase]
  return normalizedMatch ?? Wrench
}

const resolveServiceLink = (rawLink?: string): string => {
  if (!rawLink) return '/service-booking'
  const trimmed = rawLink.trim()
  if (!trimmed) return '/service-booking'
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(trimmed)) return trimmed
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  }).format(price)
}

const normalizeContactInfo = (data: any) => {
  if (!data) return null
  const workingHoursRaw = data.workingHours ?? {}
  const workingHoursObject = Array.isArray(workingHoursRaw)
    ? workingHoursRaw.reduce((acc: Record<string, string>, entry: any) => {
      if (entry?.day && entry?.hours) acc[entry.day] = entry.hours
      return acc
    }, {})
    : typeof workingHoursRaw === 'object' && workingHoursRaw !== null
      ? workingHoursRaw
      : {}

  const resolveValue = (key: string) => {
    const direct = workingHoursObject[key]
    if (typeof direct === 'string' && direct.trim()) return direct
    const capitalized = key.charAt(0).toUpperCase() + key.slice(1)
    const fallback = workingHoursObject[capitalized]
    if (typeof fallback === 'string' && fallback.trim()) return fallback
    return undefined
  }

  const weekdayKeys = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  const weekdaySegments = weekdayKeys
    .map((day) => {
      const value = resolveValue(day)
      return value ? `${arabicDayLabels[day]}: ${value}` : null
    })
    .filter(Boolean) as string[]

  const weekdaysLine = resolveValue('weekdays') ?? resolveValue('Weekdays') ?? (weekdaySegments.length ? weekdaySegments.join(' • ') : null)
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
    headquartersGeo: typeof data.mapLat === 'number' && typeof data.mapLng === 'number'
      ? { lat: data.mapLat, lng: data.mapLng }
      : null,
    // Pass through map data for CompanyMap component
    mapLat: data.mapLat,
    mapLng: data.mapLng,
    googleMapLink: data.googleMapLink,
    branches: data.branches || []
  }
}

const dedupeVehicles = (vehicles: PublicVehicle[]): PublicVehicle[] => {
  const seen = new Set<string>()
  return vehicles.filter((vehicle) => {
    if (!vehicle?.id) return false
    if (seen.has(vehicle.id)) return false
    seen.add(vehicle.id)
    return true
  })
}

// Main Server Component
export default async function Home() {
  // Fetch all data in parallel directly from DB (no internal fetch)
  const [
    homepageSettingsData,
    companyInfoData,
    serviceItemsData,
    statsData,
    valuesData,
    featuresData,
    timelineData,
    contactData,
    siteSettingsData,
    slidersRaw,
    vehiclesDataResponse
  ] = await Promise.all([
    getHomepageSettings(),
    getCompanyInfo(),
    getServiceItems(),
    getStats(),
    getValues(),
    getFeatures(),
    getTimeline(),
    getContactInfo(),
    getSiteSettings(),
    getSliders(true),
    getPublicVehicles(6, 'AVAILABLE', undefined) // limit 6 for home page performance
  ])

  // Normalize Data
  const homepageSettings = {
    showHeroSlider: Boolean(homepageSettingsData?.showHeroSlider),
    autoPlaySlider: Boolean(homepageSettingsData?.autoPlaySlider),
    sliderInterval: typeof homepageSettingsData?.sliderInterval === 'number' ? homepageSettingsData.sliderInterval : 5000,
    showServices: Boolean(homepageSettingsData?.showServices),
    servicesTitle: homepageSettingsData?.servicesTitle || 'خدماتنا المتكاملة',
    servicesSubtitle: homepageSettingsData?.servicesSubtitle || 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
    servicesDescription: homepageSettingsData?.servicesDescription || 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
    servicesCtaText: homepageSettingsData?.servicesCtaText || 'احجز الآن',
    facebookPageUrl: homepageSettingsData?.facebookPageUrl || 'https://www.facebook.com/elhamdimport',
    facebookVideoUrl: homepageSettingsData?.facebookVideoUrl || 'https://www.facebook.com/elhamdimport/videos'
  }

  const companyInfo = normalizeBrandingObject(companyInfoData || {})

  // Services
  let serviceItems: any[] = []
  if (Array.isArray(serviceItemsData)) {
    // Unique
    const unique = new Map()
    for (const item of serviceItemsData) {
      // @ts-ignore
      if (!unique.has(item.title)) {
        // @ts-ignore
        unique.set(item.title, normalizeBrandingObject(item))
      }
    }
    serviceItems = Array.from(unique.values())
  }

  // Stats
  let companyStats: any[] = []
  if (Array.isArray(statsData) && statsData.length > 0) {
    const unique = new Map()
    for (const item of statsData) {
      // @ts-ignore
      if (item && item.label && !unique.has(item.label)) {
        // @ts-ignore
        unique.set(item.label, normalizeBrandingObject(item))
      }
    }
    companyStats = Array.from(unique.values())
  }

  // Values
  let companyValues: any[] = []
  if (Array.isArray(valuesData)) {
    const unique = new Map()
    for (const item of valuesData) {
      if (!unique.has(item.title)) {
        unique.set(item.title, normalizeBrandingObject(item))
      }
    }
    companyValues = Array.from(unique.values())
  }

  const companyFeatures = Array.isArray(featuresData) ? featuresData.map((f: any) => normalizeBrandingObject(f)) : []

  // Timeline
  let timelineEvents: any[] = []
  if (Array.isArray(timelineData)) {
    const unique = new Map()
    for (const item of timelineData) {
      const key = `${item.year}-${item.title}`
      if (!unique.has(key)) {
        unique.set(key, normalizeBrandingObject(item))
      }
    }
    timelineEvents = Array.from(unique.values())
  }

  const contactInfo = normalizeContactInfo(normalizeBrandingObject(contactData));
  const siteSettings = siteSettingsData || {};

  // Sliders
  let sliders: SliderItem[] = []
  if (Array.isArray(slidersRaw)) {
    sliders = slidersRaw.map((item: any, index: number) => ({
      ...normalizeBrandingObject(item),
      contentPosition: normalizeContentPosition(item?.contentPosition),
      contentSize: item?.contentSize || 'lg',
      contentColor: item?.contentColor || '#ffffff',
      contentShadow: item?.contentShadow !== false,
      contentStrokeColor: item?.contentStrokeColor || '#000000',
      contentStrokeWidth: typeof item?.contentStrokeWidth === 'number' && item.contentStrokeWidth >= 0 ? item.contentStrokeWidth : 0,
      order: typeof item?.order === 'number' ? item.order : index
    }))
  }

  // Vehicles
  let featuredVehicles: PublicVehicle[] = []
  let totalVehiclesCount = 0
  const vehiclesRaw = vehiclesDataResponse?.vehicles;
  if (Array.isArray(vehiclesRaw)) {
    // @ts-ignore
    featuredVehicles = dedupeVehicles(vehiclesRaw.map((v: any) => normalizeBrandingObject(v)))
    totalVehiclesCount = vehiclesDataResponse?.total || 0
  }

  // Social Links Logic
  const getSocialLinks = () => {
    const priorityOrder = ['facebook', 'instagram', 'whatsapp', 'twitter', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'telegram', 'messenger']
    const collected: Record<string, string> = {}
    const addLinks = (source?: Record<string, any>) => {
      if (!source || typeof source !== 'object') return
      Object.entries(source).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim()) {
          const normalizedKey = key.trim().toLowerCase()
          if (!collected[normalizedKey]) {
            collected[normalizedKey] = value.trim()
          }
        }
      })
    }
    addLinks(contactInfo?.socialMedia)
    addLinks(companyInfo?.socialMedia)
    addLinks(companyInfo?.socialLinks)
    addLinks(siteSettings?.socialLinks)

    const prioritized = priorityOrder.map((platform) => ({ platform, url: collected[platform] })).filter((item) => Boolean(item.url))
    const remaining = Object.entries(collected).filter(([platform]) => !priorityOrder.includes(platform)).map(([platform, url]) => ({ platform, url }))
    return [...prioritized, ...remaining]
  }
  const socialLinks = getSocialLinks()

  // Styling Constants
  const brandHeroGradient = 'linear-gradient(135deg, var(--brand-primary-600, #081432) 0%, var(--brand-primary-700, #061028) 55%, var(--brand-secondary-500, #C1272D) 100%)'
  const brandContactGradient = 'linear-gradient(135deg, var(--brand-primary-800, #050c1f) 0%, var(--brand-primary-700, #061028) 55%, var(--brand-secondary-600, #a41f25) 100%)'
  const brandTextGradient = 'linear-gradient(90deg, var(--brand-neutral-dark, #1F1F1F) 0%, var(--brand-primary-500, #0A1A3F) 55%, var(--brand-secondary-500, #C1272D) 100%)'

  // Device Info (useDeviceInfo) is client side. We should assume mobile/desktop default or just render responsive classes.
  // The original code used `deviceInfo.isMobile` for some logic like simple vs complex view or `TouchButton` size.
  // We will default to a responsive approach (CSS) instead of JS conditional rendering where possible.
  // `TouchButton` handles size internally via props, but we pass `size="xl"` usually. 
  // We can't use `deviceInfo` here on server.

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Mobile-Optimized Slider Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh]">
        <WorkingSlider
          items={sliders}
          loading={false}
          autoPlay={homepageSettings.autoPlaySlider}
          autoPlayInterval={homepageSettings.sliderInterval}
          className="w-full h-full"
        />
      </section>

      <div className="w-full">
        {/* Company Introduction Section */}
        <section
          className="py-16 md:py-24 text-white relative overflow-hidden"
          style={{ background: brandHeroGradient }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-right">
                {companyInfoData ? (
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
                            size="xl"
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
                  <div className="text-white">جاري تحميل المعلومات...</div>
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
                    quality={90}
                    priority={true}
                    mobileOptimized={true}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Stats */}
                {companyStats.length > 0 && (
                  <div className="absolute -bottom-6 -right-6 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl border border-blue-100 hidden md:block">
                    <div className="text-3xl font-bold mb-1">
                      {companyStats.find(stat => stat.label?.includes('سنة'))?.number || '25+'}
                    </div>
                    <div className="text-sm text-blue-500 font-medium">
                      {companyStats.find(stat => stat.label?.includes('سنة'))?.label || 'سنة خبرة'}
                    </div>
                  </div>
                )}
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20 blur-xl bg-[color:var(--brand-secondary,#C1272D)]"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-xl bg-[color:var(--brand-primary-400,#798fb0)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing between sections */}
        <div className="h-8 md:h-12 bg-gradient-to-b from-blue-800 to-gray-50"></div>

        {/* Our Vehicles */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative w-full">
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30 blur-3xl bg-[color:rgba(var(--brand-primary-100-rgb,225_230_239),1)]"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-30 blur-3xl bg-[color:rgba(var(--brand-secondary-100-rgb,247_216_217),1)]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                <Car className="ml-2 h-4 w-4" />
                {companyInfo?.features?.[0] || 'سياراتنا'}
              </Badge>
              <h2
                className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                style={{ backgroundImage: brandTextGradient }}
              >
                {companyInfo?.title || 'استعرض سيارات تاتا'}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {normalizeBrandingText(companyInfo?.subtitle || DISTRIBUTOR_BRANDING)}
              </p>
            </div>

            <ModernVehicleCarousel
              vehicles={featuredVehicles}
              loading={false}
              totalVehiclesCount={totalVehiclesCount}
            />
          </div>
        </section>

        {/* Company Stats */}
        {companyStats.length > 0 && (
          <section className="py-16 md:py-20 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] to-[color:rgba(var(--brand-secondary-50-rgb,251_236_236),1)] opacity-50"></div>
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
        )}

        {/* Services Section */}
        {homepageSettings.showServices && serviceItems.length > 0 && (
          <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 relative">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <Badge
                  className="mb-4 border border-[color:rgba(var(--brand-primary-200-rgb,199_209_224),1)] bg-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] text-[color:var(--brand-primary,#0A1A3F)]"
                >
                  <Wrench className="ml-2 h-4 w-4" />
                  خدماتنا
                </Badge>
                <h2
                  className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(120deg, var(--brand-primary,#0A1A3F), var(--brand-secondary,#C1272D))' }}
                >
                  {homepageSettings.servicesTitle}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {homepageSettings.servicesSubtitle}
                </p>
                {homepageSettings.servicesDescription && (
                  <p className="text-base text-gray-500 max-w-3xl mx-auto leading-relaxed mt-3">
                    {homepageSettings.servicesDescription}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {serviceItems.map((service: any, index: number) => {
                  const IconComponent = resolveServiceIcon(service.icon)
                  const href = resolveServiceLink(service.link)

                  return (
                    <Card
                      key={service?.id ?? `service-${index}`}
                      className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                    >
                      <CardHeader className="text-center pb-4">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                          style={{ background: 'linear-gradient(135deg, var(--brand-primary-700,#061028), var(--brand-secondary,#C1272D))' }}
                        >
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[color:var(--brand-secondary,#C1272D)] transition-colors">
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        {service.description && (
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                        <Link href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                          <TouchButton
                            variant="outline"
                            className="w-full border-[color:rgba(var(--brand-primary-200-rgb,199_209_224),1)] text-[color:var(--brand-primary,#0A1A3F)] hover:bg-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] hover:border-[color:rgba(var(--brand-secondary-300-rgb,228_117_122),1)]"
                          >
                            {service.ctaText?.trim() || homepageSettings.servicesCtaText}
                          </TouchButton>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tata Motors Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] via-[color:rgba(var(--brand-secondary-50-rgb,251_236_236),1)] to-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23dc2626\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="mb-4 border border-[color:rgba(var(--brand-secondary-200-rgb,240_177_179),1)] bg-[color:rgba(var(--brand-secondary-50-rgb,251_236_236),1)] text-[color:var(--brand-secondary,#C1272D)]">
                <Truck className="ml-2 h-4 w-4" />
                Tata Motors
              </Badge>
              <h2
                className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(120deg, var(--brand-primary,#0A1A3F), var(--brand-secondary,#C1272D))' }}
              >
                تاتا موتورز
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                القوة والاعتمادية في عالم النقل التجاري. استعرض تشكيلتنا المتكاملة من المركبات التجارية الثقيلة والخفيفة وبيك أب
              </p>
            </div>

            {/* Static Content maintained for SEO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Card 1 */}
              <div className="lg:col-span-1">
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <Truck className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                    <CardTitle>المركبات التجارية الثقيلة</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p>PRIMA 3328.K</p>
                  </CardContent>
                </Card>
              </div>
              {/* Card 2 */}
              <div className="lg:col-span-1">
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <Package className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                    <CardTitle>المركبات التجارية الخفيفة</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p>ULTRA T.9</p>
                  </CardContent>
                </Card>
              </div>
              {/* Card 3 */}
              <div className="lg:col-span-1">
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <Truck className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                    <CardTitle>بيك أب</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p>XENON SC</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center">
              <Link href="/tata-motors">
                <TouchButton
                  size="xl"
                  className="text-lg font-semibold px-8 py-4 shadow-lg bg-gradient-to-r from-[color:var(--brand-primary-700,#061028)] via-[color:var(--brand-primary,#0A1A3F)] to-[color:var(--brand-secondary,#C1272D)] hover:from-[color:var(--brand-primary-800,#050c1f)] hover:to-[color:var(--brand-secondary-600,#a41f25)] text-white"
                >
                  استعرض جميع موديلات تاتا
                  <ArrowLeft className="mr-3 h-5 w-5" />
                </TouchButton>
              </Link>
            </div>

          </div>
        </section>

        {/* Company Values */}
        {companyValues.length > 0 && (
          <section className="py-16 md:py-24 bg-gradient-to-br from-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] to-white relative overflow-hidden">
            {/* Content... using standard HTML instead of complex lazy load logic for text content to improve SEO */}
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              {/* Render values map... */}
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">قيمنا ومبادئنا</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {companyValues.map((value: any, index: number) => (
                  <div key={index} className="text-center p-6 bg-white rounded-xl shadow">
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Timeline Section - Premium Brand UI */}
        {timelineEvents.length > 0 && (
          <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-20">
                <Badge className="bg-[color:var(--brand-primary-50,#EBF1F8)] text-[color:var(--brand-primary,#0A1A3F)] border border-[color:var(--brand-primary-200,#C7D3E2)] shadow-sm mb-6 px-4 py-2 text-base">
                  <Clock className="ml-2 h-4 w-4" />
                  تاريخنا العريق
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[color:var(--brand-primary,#0A1A3F)] tracking-tight">
                  مسيرة النجاح المستمرة
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  محطات مضيئة في تاريخ الحمد للسيارات، نبني المستقبل بخبرة الماضي
                </p>
              </div>

              <div className="relative">
                {/* Center Line with Brand Color */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[color:var(--brand-primary-200,#C7D3E2)] via-[color:var(--brand-secondary,#C1272D)] to-[color:var(--brand-primary-200,#C7D3E2)] hidden md:block opacity-30"></div>

                <div className="space-y-16 md:space-y-24">
                  {timelineEvents.map((event: any, index: number) => {
                    const isEven = index % 2 === 0
                    return (
                      <div key={index} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''} gap-8 md:gap-0`}>
                        {/* Content Side */}
                        <div className="w-full md:w-1/2 flex justify-center md:block">
                          <div className={`w-full max-w-lg ${isEven ? 'md:pr-16 lg:pr-24 text-right' : 'md:pl-16 lg:pl-24 text-left'}`}>
                            <div className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[color:var(--brand-primary-50,#EBF1F8)] hover:border-[color:var(--brand-secondary-200,#F0B1B3)] transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                              {/* Brand Accent */}
                              <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-1.5 h-full bg-gradient-to-b from-[color:var(--brand-primary,#0A1A3F)] to-[color:var(--brand-secondary,#C1272D)]`}></div>

                              <span className="block text-6xl font-bold text-slate-50 absolute top-2 right-4 z-0 opacity-80 select-none font-outfit">
                                {event.year}
                              </span>

                              <div className="relative z-10">
                                <Badge className="mb-4 bg-[color:var(--brand-primary,#0A1A3F)] text-white hover:bg-[color:var(--brand-primary-800,#050c1f)] border-0">
                                  {event.year}
                                </Badge>
                                <h3 className="text-2xl font-bold text-[color:var(--brand-primary,#0A1A3F)] mb-3 leading-snug">
                                  {event.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Center Dot - Brand Style */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center hidden md:flex">
                          <div className="relative flex items-center justify-center">
                            <div className="w-4 h-4 bg-[color:var(--brand-secondary,#C1272D)] rounded-full z-20 shadow-[0_0_0_4px_white,0_0_0_8px_rgba(193,39,45,0.2)]"></div>
                          </div>
                        </div>

                        {/* Empty Side */}
                        <div className="w-full md:w-1/2 hidden md:block"></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Section - Redesigned & Detailed */}
        {contactInfo && (
          <section className="py-24 relative overflow-hidden bg-[#0A1A3F] text-white">
            <div className="absolute inset-0 opacity-20 bg-white/5"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A3F] via-[#0A1A3F]/95 to-transparent"></div>

            {/* Animated Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <Badge className="bg-blue-500/10 text-blue-200 border-blue-500/20 mb-4 px-4 py-1.5 text-sm backdrop-blur-sm">
                  تواصل معنا
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  نحن هنا <span className="text-blue-400">لخدمتك</span>
                </h2>
                <p className="text-blue-100/60 max-w-2xl mx-auto text-lg">
                  فريقنا جاهز للإجابة على استفساراتكم وتقديم أفضل خدمات الدعم والمبيعات.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Contact Info Column */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Address Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <MapPin className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">المقر الرئيسي</h4>
                        <p className="text-blue-100/70 mb-3 leading-relaxed">{contactInfo.headquarters.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                        <Phone className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">اتصل بنا</h4>
                        <div className="space-y-1">
                          <Link href={`tel:${contactInfo.contactNumbers.primary}`} className="block text-blue-100/70 hover:text-white transition-colors dir-ltr text-right">
                            {contactInfo.contactNumbers.primary}
                          </Link>
                          {contactInfo.contactNumbers.secondary && (
                            <Link href={`tel:${contactInfo.contactNumbers.secondary}`} className="block text-blue-100/70 hover:text-white transition-colors dir-ltr text-right">
                              {contactInfo.contactNumbers.secondary}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">البريد الإلكتروني</h4>
                        <Link href={`mailto:${contactInfo.headquarters.email}`} className="text-blue-100/70 hover:text-white transition-colors break-all">
                          {contactInfo.headquarters.email}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-4 flex justify-center gap-3">
                    {socialLinks.map(({ platform, url }) => {
                      const Icon = platform.includes('facebook') ? Facebook :
                        platform.includes('instagram') ? Instagram :
                          platform.includes('twitter') ? Twitter :
                            platform.includes('linkedin') ? Linkedin :
                              platform.includes('youtube') ? Youtube : MessageCircle
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                          aria-label={platform}
                        >
                          <Icon className="h-5 w-5 text-white/80" />
                        </a>
                      )
                    })}
                  </div>
                </div>

                {/* Map Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
                    <CompanyMap contactInfo={contactInfo} />

                    {/* Overlay Info for Working Hours on Desktop - or standard layout */}
                    <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md text-white p-5 rounded-xl border border-white/10 max-w-xs shadow-xl hidden md:block">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <h4 className="font-bold">ساعات العمل</h4>
                      </div>
                      <div className="space-y-2 text-sm text-blue-100/80">
                        {contactInfo.workingHours.weekdays && (
                          <div className="flex justify-between gap-4">
                            <span>أيام الأسبوع:</span>
                            <span dir="ltr" className="text-white">{contactInfo.workingHours.weekdays}</span>
                          </div>
                        )}
                        {contactInfo.workingHours.friday && (
                          <div className="flex justify-between gap-4">
                            <span>الجمعة:</span>
                            <span dir="ltr" className="text-white">{contactInfo.workingHours.friday}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      <ConfigurablePopup />
    </div>
  )
}