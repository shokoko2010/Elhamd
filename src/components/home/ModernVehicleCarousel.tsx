'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { VehicleImage } from '@/components/ui/VehicleImage'
import { LoadingCard, ErrorState } from '@/components/ui/LoadingIndicator'
import { Fuel, Gauge, Settings2, ArrowLeft, Droplets, Car } from 'lucide-react'
import type { PublicVehicle } from '@/types/public-vehicle'

interface ModernVehicleCarouselProps {
  vehicles: PublicVehicle[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  totalVehiclesCount?: number
}

const categoryLabels: Record<string, string> = {
  SUV: 'بيك أب',
  SEDAN: 'سيدان',
  HATCHBACK: 'هاتشباك',
  TRUCK: 'شاحنة',
  COMMERCIAL: 'تجارية',
  VAN: 'فان'
}

const fuelTypeLabels: Record<string, string> = {
  PETROL: 'بنزين',
  GASOLINE: 'بنزين',
  DIESEL: 'ديزل',
  ELECTRIC: 'كهرباء',
  HYBRID: 'هجين',
  CNG: 'غاز طبيعي'
}

const transmissionLabels: Record<string, string> = {
  AUTOMATIC: 'اوتوماتيك',
  MANUAL: 'يدوي',
  CVT: 'CVT'
}

const formatPrice = (price?: number) => {
  if (typeof price !== 'number') {
    return 'السعر عند الطلب'
  }

  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  }).format(price)
}

const getVehicleCategory = (vehicle: PublicVehicle) => {
  if (!vehicle.category) return 'بدون تصنيف'
  return categoryLabels[vehicle.category] ?? vehicle.category
}

const getFuelType = (vehicle: PublicVehicle) => {
  if (!vehicle.fuelType) return 'غير محدد'
  return fuelTypeLabels[vehicle.fuelType] ?? vehicle.fuelType
}

const getTransmission = (vehicle: PublicVehicle) => {
  if (!vehicle.transmission) return 'غير محدد'
  return transmissionLabels[vehicle.transmission] ?? vehicle.transmission
}

export function ModernVehicleCarousel({
  vehicles,
  loading = false,
  error,
  onRetry,
  totalVehiclesCount
}: ModernVehicleCarouselProps) {
  const displayVehicles = useMemo(
    () => (vehicles ?? []).filter((vehicle): vehicle is PublicVehicle => Boolean(vehicle?.id)),
    [vehicles]
  )
  const slidesCount = displayVehicles.length
  const [slidesPerView, setSlidesPerView] = useState(1)

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth

      if (width >= 1600) return setSlidesPerView(4)
      if (width >= 1280) return setSlidesPerView(3)
      if (width >= 960) return setSlidesPerView(2.5)
      if (width >= 768) return setSlidesPerView(2)

      setSlidesPerView(1)
    }

    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)
    return () => window.removeEventListener('resize', updateSlidesPerView)
  }, [])

  const slideWidth = useMemo(() => `${100 / slidesPerView}%`, [slidesPerView])
  const align: 'start' | 'center' = slidesCount > 1 ? 'start' : 'center'
  const loop = slidesCount > slidesPerView

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-full min-h-[520px]">
            <LoadingCard title="جاري تحميل السيارة..." className="h-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="حدث خطأ"
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (displayVehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <Car className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-700">لا توجد سيارات حالياً</h3>
        <p className="mb-6 text-gray-500">يرجى التحقق لاحقاً أو التواصل معنا للمزيد من التفاصيل</p>
        <Link href="/contact">
          <TouchButton variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50">
            تواصل معنا
          </TouchButton>
        </Link>
      </div>
    )
  }

  const visibleNow = Math.min(slidesCount, Math.max(1, Math.round(slidesPerView)))

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-orange-100 blur-3xl" />
        </div>

        <Carousel
          opts={{
            align,
            loop,
            slidesToScroll: Math.max(1, Math.floor(slidesPerView)),
            dragFree: true
          }}
          className="relative w-full overflow-visible"
        >
          <div className="relative flex flex-col gap-4 px-4 pb-2 pt-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">معرض السيارات</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                  {slidesCount} سيارة متاحة
                </span>
                <span className="rounded-full bg-slate-50 px-3 py-1">يعرض {visibleNow} سيارة في كل شريحة</span>
              </div>
            </div>

            {slidesCount > 1 && (
              <div className="hidden items-center gap-3 md:flex">
                <CarouselPrevious className="static h-12 w-12 rounded-full border-0 bg-white text-blue-600 shadow-lg hover:-translate-y-0.5 hover:bg-blue-50" />
                <CarouselNext className="static h-12 w-12 rounded-full border-0 bg-white text-blue-600 shadow-lg hover:-translate-y-0.5 hover:bg-blue-50" />
              </div>
            )}
          </div>

          <div className="relative px-2 pb-6 sm:px-3 md:px-6">
            <CarouselContent className="-ml-2 py-4 md:-ml-3 md:py-6 lg:-ml-4">
              {displayVehicles.map((vehicle) => (
                <CarouselItem
                  key={vehicle.id}
                  style={{ flex: `0 0 ${slideWidth}` }}
                  className="pl-2 md:pl-3 lg:pl-4"
                >
                  <VehicleCard vehicle={vehicle} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {slidesCount > 1 && (
              <div className="flex items-center justify-center gap-4 pb-4 pt-2 md:hidden">
                <CarouselPrevious className="relative h-12 w-12 rounded-full border-0 bg-white text-blue-600 shadow-lg hover:-translate-y-0.5 hover:bg-blue-50" />
                <CarouselNext className="relative h-12 w-12 rounded-full border-0 bg-white text-blue-600 shadow-lg hover:-translate-y-0.5 hover:bg-blue-50" />
              </div>
            )}
          </div>
        </Carousel>
      </div>

      {typeof totalVehiclesCount === 'number' && totalVehiclesCount > 0 && (
        <div className="text-center">
          <Link href="/vehicles">
            <TouchButton
              variant="outline"
              size="xl"
              className="border-blue-200 bg-white text-blue-600 shadow-sm hover:border-blue-300 hover:bg-blue-50"
            >
              استعرض جميع السيارات ({totalVehiclesCount})
            </TouchButton>
          </Link>
        </div>
      )}
    </div>
  )
}

interface SpecPillProps {
  icon: ReactNode
  label: string
  value: string
}

function SpecPill({ icon, label, value }: SpecPillProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 text-right shadow-sm">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-700">{value}</span>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
        {icon}
      </span>
    </div>
  )
}

interface VehicleCardProps {
  vehicle: PublicVehicle
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="group h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-b from-white via-white/90 to-white/70 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_35px_90px_-40px_rgba(15,23,42,0.65)]">
        <div className="relative overflow-hidden">
          <div className="relative aspect-[16/9] w-full rounded-[28px] bg-slate-100">
            <VehicleImage
              vehicle={{
                id: vehicle.id,
                make: vehicle.make,
                model: vehicle.model,
                images: vehicle.images
              }}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
            <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between text-white">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  {getVehicleCategory(vehicle)}
                </p>
                <h3 className="text-2xl font-bold leading-tight">
                  {vehicle.make} {vehicle.model}
                </h3>
              </div>
              <Badge className="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white">
                {vehicle.year}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-6 p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <SpecPill icon={<Fuel className="h-4 w-4" />} label="نوع الوقود" value={getFuelType(vehicle)} />
            <SpecPill icon={<Settings2 className="h-4 w-4" />} label="ناقل الحركة" value={getTransmission(vehicle)} />
            <SpecPill icon={<Gauge className="h-4 w-4" />} label="عداد السير" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString('ar-EG')} كم` : 'جديد تماماً'} />
            <SpecPill icon={<Droplets className="h-4 w-4" />} label="السعر" value={formatPrice(vehicle.price)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">السعر يبدأ من</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(vehicle.price)}</p>
            </div>
            <Link href={`/vehicles/${vehicle.id}`}>
              <TouchButton
                variant="outline"
                size="md"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                icon={<ArrowLeft className="h-4 w-4" />}
                iconPosition="right"
              >
                استكشف السيارة
              </TouchButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
