'use client'

import Link from 'next/link'
import { useMemo, type ReactNode } from 'react'
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
  const align: 'start' | 'center' = slidesCount > 1 ? 'start' : 'center'
  const loop = slidesCount > 1

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

  return (
    <>
      <div className="relative px-2 sm:px-4 lg:px-6">
        <Carousel
          opts={{
            align,
            loop
          }}
          className="w-full overflow-visible"
        >
          <CarouselContent className="py-6 -ml-2 md:-ml-4">
            {displayVehicles.map((vehicle) => (
              <CarouselItem
                key={vehicle.id}
                className="pl-2 md:pl-4 basis-full md:basis-1/2 xl:basis-1/3"
              >
                <VehicleCard vehicle={vehicle} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {slidesCount > 1 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-2 lg:-left-6 h-12 w-12 translate-y-[-50%] rounded-full border-0 bg-white/80 text-blue-600 shadow-xl backdrop-blur" />
              <CarouselNext className="hidden md:flex -right-2 lg:-right-6 h-12 w-12 translate-y-[-50%] rounded-full border-0 bg-white/80 text-blue-600 shadow-xl backdrop-blur" />
            </>
          )}
        </Carousel>
      </div>

      {typeof totalVehiclesCount === 'number' && totalVehiclesCount > 0 && (
        <div className="mt-12 text-center">
          <Link href="/vehicles">
            <TouchButton
              variant="outline"
              size="xl"
              className="border-blue-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50"
            >
              استعرض جميع السيارات ({totalVehiclesCount})
            </TouchButton>
          </Link>
        </div>
      )}
    </>
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
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/80 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]">
        <div className="relative overflow-hidden">
          <div className="relative aspect-[4/3] w-full">
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
