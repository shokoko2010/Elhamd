
import { Suspense } from 'react'
import Link from 'next/link'
import { Car, ArrowLeft } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { WorkingSlider } from '@/components/ui/WorkingSlider'
import ConfigurablePopup from '@/components/ConfigurablePopup'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'

// New Server Components
import { ServicesSection } from '@/components/home/ServicesSection'
import { StatsSection } from '@/components/home/StatsSection'
import { VehiclesSection } from '@/components/home/VehiclesSection'
import { ValuesSection } from '@/components/home/ValuesSection'
import { TimelineSection } from '@/components/home/TimelineSection'
import { ContactSection } from '@/components/home/ContactSection'
import { CompanyIntroSection } from '@/components/home/CompanyIntroSection'
import { SectionSkeleton } from '@/components/home/SectionSkeleton'
import { VehiclesSkeleton } from '@/components/home/VehiclesSkeleton'

import { normalizeBrandingObject } from '@/lib/branding'
import {
  getHomepageSettings,
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

// Main Server Component
export default async function Home() {
  // Fetch initial data (Hero & Header) - Block until these are ready
  // OPTIMIZATION: Only fetch strictly required data for LCP (Hero)
  const [
    homepageSettingsData,
    slidersRaw
  ] = await Promise.all([
    getHomepageSettings(),
    getSliders(true)
  ])

  // Normalize Data
  const homepageSettings = {
    showHeroSlider: Boolean(homepageSettingsData?.showHeroSlider),
    autoPlaySlider: Boolean(homepageSettingsData?.autoPlaySlider),
    sliderInterval: typeof homepageSettingsData?.sliderInterval === 'number' ? homepageSettingsData.sliderInterval : 5000,
  }

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
        {/* Company Introduction Section - Suspense Wrapped */}
        <Suspense fallback={<SectionSkeleton />}>
          <CompanyIntroSection />
        </Suspense>

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

        {/* Contact Section - Suspense Wrapped */}
        <Suspense fallback={<SectionSkeleton />}>
          <ContactSection />
        </Suspense>

      </div>
      <ConfigurablePopup />
    </div>
  )
}