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

      if (width >= 1280) return setSlidesPerView(4)
      if (width >= 1024) return setSlidesPerView(3)
      if (width >= 640) return setSlidesPerView(2)

      setSlidesPerView(1)
    }

    updateSlidesPerView()
    window.addEventListener('resize', updateSlidesPerView)
    return () => window.removeEventListener('resize', updateSlidesPerView)
  }, [])

  const align: 'start' | 'center' = slidesCount > 1 ? 'start' : 'center'
  const loop = slidesCount > slidesPerView
  const slidesToScroll = slidesPerView >= 3 ? 2 : 1

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
      <div className="relative overflow-hidden rounded-[36px] border border-white/20 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900 text-white shadow-[0_50px_120px_-60px_rgba(15,23,42,0.85)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-40 top-12 h-64 w-64 rounded-full bg-blue-500/30 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-56 w-56 rounded-full bg-cyan-400/30 blur-[120px]" />
        </div>

        <Carousel
          opts={{
            align,
            loop,
            dragFree: true,
            slidesToScroll
          }}
          className="relative w-full"
        >
          <div className="relative flex flex-col gap-6 px-6 pb-4 pt-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">المعرض المتنقل</p>
              <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                أحدث سيارات شركة الحمد للاستيراد
              </h3>
              <p className="text-sm text-slate-300">
                يعرض الكاروسيل {visibleNow} سيارات في كل شريحة ويتضمن جميع السيارات المتاحة حالياً ({slidesCount}).
              </p>
            </div>

            {slidesCount > 1 && (
              <div className="flex items-center gap-4">
                <CarouselPrevious className="relative h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20" />
                <CarouselNext className="relative h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20" />
              </div>
            )}
          </div>

          <div className="relative px-2 pb-10 sm:px-4 lg:px-8">
            <CarouselContent className="-ml-2 py-2 sm:-ml-4">
              {displayVehicles.map((vehicle) => (
                <CarouselItem
                  key={vehicle.id}
                  className="basis-full pl-2 sm:basis-1/2 sm:pl-4 lg:basis-1/3 xl:basis-1/4"
                >
                  <VehicleCard vehicle={vehicle} />
                </CarouselItem>
              ))}
            </CarouselContent>
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
    <div className="flex items-center justify-between rounded-2xl border border-slate-100/70 bg-white/80 px-4 py-3 text-right shadow-sm">
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
      <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-white/30 bg-white/95 text-slate-900 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.85)] transition duration-500 group-hover:-translate-y-2">
        <div className="relative aspect-[4/3] overflow-hidden">
          <VehicleImage
            vehicle={{
              id: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              images: vehicle.images
            }}
            className="h-full w-full"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white/70">{getVehicleCategory(vehicle)}</p>
                <h4 className="text-xl font-bold">
                  {vehicle.make} {vehicle.model}
                </h4>
              </div>
              <Badge className="rounded-full bg-white/20 px-4 py-1 text-base text-white">
                {vehicle.year ?? 'بدون سنة'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <SpecPill icon={<Fuel className="h-4 w-4" />} label="نوع الوقود" value={getFuelType(vehicle)} />
            <SpecPill icon={<Settings2 className="h-4 w-4" />} label="ناقل الحركة" value={getTransmission(vehicle)} />
            <SpecPill icon={<Gauge className="h-4 w-4" />} label="عدد الكيلومترات" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString('ar-EG')} كم` : 'جديدة بالكامل'} />
            <SpecPill icon={<Droplets className="h-4 w-4" />} label="السعر" value={formatPrice(vehicle.price)} />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-500">السعر يبدأ من</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(vehicle.price)}</p>
            </div>
            <Link href={`/vehicles/${vehicle.id}`}>
              <TouchButton
                variant="default"
                size="md"
                className="bg-blue-600 text-white hover:bg-blue-700"
                icon={<ArrowLeft className="h-4 w-4" />}
                iconPosition="right"
              >
                تفاصيل أكثر
              </TouchButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
