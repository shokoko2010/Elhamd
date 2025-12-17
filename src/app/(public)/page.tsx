
import { Suspense } from 'react'
import Link from 'next/link'
import {
  Car, Phone, Mail, MapPin, Calendar, Award, Clock, ArrowLeft,
  Facebook, Instagram, Linkedin, Twitter, Youtube, MessageCircle
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { EnhancedLazyImage } from '@/components/ui/enhanced-lazy-loading'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import ConfigurablePopup from '@/components/ConfigurablePopup'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import CompanyMap from '@/components/ui/CompanyMap'

// New Server Components
import { ServicesSection } from '@/components/home/ServicesSection'
import { StatsSection } from '@/components/home/StatsSection'
import { VehiclesSection } from '@/components/home/VehiclesSection'
import { ValuesSection } from '@/components/home/ValuesSection'
import { TimelineSection } from '@/components/home/TimelineSection'
import { SectionSkeleton } from '@/components/home/SectionSkeleton'
import { VehiclesSkeleton } from '@/components/home/VehiclesSkeleton'

import { normalizeBrandingObject, normalizeBrandingText, DISTRIBUTOR_BRANDING } from '@/lib/branding'
import {
  getHomepageSettings,
  getCompanyInfo,
  getContactInfo,
  getSiteSettings,
  getSliders,
} from '@/services/home-data'

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
    mapLat: data.mapLat,
    mapLng: data.mapLng,
    googleMapLink: data.googleMapLink,
    branches: data.branches || []
  }
}

// Main Server Component
export default async function Home() {
  // Fetch initial data (Hero & Header) - Block until these are ready
  const [
    homepageSettingsData,
    companyInfoData,
    contactData,
    siteSettingsData,
    slidersRaw
  ] = await Promise.all([
    getHomepageSettings(),
    getCompanyInfo(),
    getContactInfo(),
    getSiteSettings(),
    getSliders(true)
  ])

  // Normalize Data
  const homepageSettings = {
    showHeroSlider: Boolean(homepageSettingsData?.showHeroSlider),
    autoPlaySlider: Boolean(homepageSettingsData?.autoPlaySlider),
    sliderInterval: typeof homepageSettingsData?.sliderInterval === 'number' ? homepageSettingsData.sliderInterval : 5000,
  }

  const companyInfo = normalizeBrandingObject(companyInfoData || {} as any)
  const contactInfo = normalizeContactInfo(normalizeBrandingObject(contactData))
  const siteSettings = siteSettingsData || {}

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
    addLinks((companyInfo as any)?.socialMedia)
    addLinks((companyInfo as any)?.socialLinks)
    addLinks((siteSettings as any)?.socialLinks)

    const prioritized = priorityOrder.map((platform) => ({ platform, url: collected[platform] })).filter((item) => Boolean(item.url))
    const remaining = Object.entries(collected).filter(([platform]) => !priorityOrder.includes(platform)).map(([platform, url]) => ({ platform, url }))
    return [...prioritized, ...remaining]
  }
  const socialLinks = getSocialLinks()

  // Styling Constants
  const brandHeroGradient = 'linear-gradient(135deg, var(--brand-primary-600, #081432) 0%, var(--brand-primary-700, #061028) 55%, var(--brand-secondary-500, #C1272D) 100%)'

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
                    priority={false}
                    mobileOptimized={true}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20 blur-xl bg-[color:var(--brand-secondary,#C1272D)]"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-xl bg-[color:var(--brand-primary-400,#798fb0)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing between sections */}
        <div className="h-8 md:h-12 bg-gradient-to-b from-blue-800 to-gray-50"></div>

        {/* Our Vehicles - Suspense Wrapped */}
        <Suspense fallback={<VehiclesSkeleton />}>
          <VehiclesSection />
        </Suspense>

        {/* Company Stats - Suspense Wrapped */}
        <Suspense fallback={<div className="h-40 w-full bg-slate-50 animate-pulse"></div>}>
          <StatsSection />
        </Suspense>

        {/* Services Section - Suspense Wrapped */}
        <Suspense fallback={<SectionSkeleton />}>
          <ServicesSection />
        </Suspense>

        {/* Tata Motors Section - Static/Link */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] via-[color:rgba(var(--brand-secondary-50-rgb,251_236_236),1)] to-[color:rgba(var(--brand-primary-50-rgb,238_241_246),1)] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23dc2626\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge className="mb-4 border border-[color:rgba(var(--brand-secondary-200-rgb,240_177_179),1)] bg-[color:rgba(var(--brand-secondary-50-rgb,251_236_236),1)] text-[color:var(--brand-secondary,#C1272D)]">
                <Car className="ml-2 h-4 w-4" />
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

        {/* Company Values - Suspense Wrapped */}
        <Suspense fallback={<SectionSkeleton />}>
          <ValuesSection />
        </Suspense>

        {/* Timeline Section - Suspense Wrapped */}
        <Suspense fallback={<SectionSkeleton />}>
          <TimelineSection />
        </Suspense>

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
                        <h3 className="text-lg font-semibold text-white mb-1">المقر الرئيسي</h3>
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
                        <h3 className="text-lg font-semibold text-white mb-1">اتصل بنا</h3>
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
                        <h3 className="text-lg font-semibold text-white mb-1">البريد الإلكتروني</h3>
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

                  {/* Branches Addresses List */}
                  {contactInfo.branches && contactInfo.branches.length > 0 && (
                    <div className="pt-6 border-t border-white/10 space-y-4">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        فروعنا الأخرى
                      </h3>
                      {contactInfo.branches.map((branch: any) => (
                        <div key={branch.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                          <h4 className="text-lg font-semibold text-white mb-1">{branch.name}</h4>
                          <p className="text-blue-100/70 text-sm leading-relaxed">{branch.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
                    <CompanyMap contactInfo={contactInfo} />

                    {/* Overlay Info for Working Hours on Desktop */}
                    <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md text-white p-5 rounded-xl border border-white/10 max-w-xs shadow-xl hidden md:block">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <h3 className="font-bold">ساعات العمل</h3>
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