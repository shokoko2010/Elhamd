'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { Car, Droplets, Fuel, Gauge, Settings2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ErrorState, LoadingCard } from '@/components/ui/LoadingIndicator'
import type { PublicVehicle } from '@/types/public-vehicle'

interface ModernVehicleCarouselProps {
  vehicles: PublicVehicle[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  totalVehiclesCount?: number
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

const categoryLabels: Record<string, string> = {
  SUV: 'بيك أب',
  SEDAN: 'سيدان',
  HATCHBACK: 'هاتشباك',
  TRUCK: 'شاحنة',
  COMMERCIAL: 'تجارية',
  VAN: 'فان'
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

const getPrimaryImageUrl = (vehicle: PublicVehicle) => {
  const images = vehicle?.images ?? []
  const primary = images.find((img) => img.isPrimary) ?? images[0]
  return primary?.imageUrl ? encodeURI(primary.imageUrl) : '/placeholder-car.jpg'
}

const getFuelType = (vehicle: PublicVehicle) => {
  if (!vehicle.fuelType) return 'غير محدد'
  return fuelTypeLabels[vehicle.fuelType] ?? vehicle.fuelType
}

const getTransmission = (vehicle: PublicVehicle) => {
  if (!vehicle.transmission) return 'غير محدد'
  return transmissionLabels[vehicle.transmission] ?? vehicle.transmission
}

const getCategory = (vehicle: PublicVehicle) => {
  if (!vehicle.category) return 'بدون تصنيف'
  return categoryLabels[vehicle.category] ?? vehicle.category
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-full min-h-[420px]">
            <LoadingCard title="جاري تحميل السيارات..." className="h-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState title="حدث خطأ" message={error} onRetry={onRetry} />
  }

  if (displayVehicles.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <Car className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-900">لا توجد سيارات حالياً</h3>
        <p className="text-slate-600">يرجى التحقق لاحقاً أو التواصل معنا للمزيد من التفاصيل</p>
      </div>
    )
  }

  return (
    <Carousel opts={{ loop: true, align: 'start' }} className="group space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit bg-blue-100 text-blue-700 border-blue-200">مجموعة السيارات</Badge>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">كاروسيل مميز لكل السيارات</h3>
          <p className="text-slate-600">
            استكشف تشكيلتنا الكاملة من سيارات تاتا بعرض بصري كبير وواضح. {totalVehiclesCount ?? displayVehicles.length} سيارة جاهزة للاستعراض.
          </p>
        </div>
        <div className="hidden gap-3 md:flex">
          <CarouselPrevious className="static translate-y-0 border-blue-200 text-blue-600 hover:bg-blue-50" />
          <CarouselNext className="static translate-y-0 border-blue-200 text-blue-600 hover:bg-blue-50" />
        </div>
      </div>

      <CarouselContent className="-ml-0">
          {displayVehicles.map((vehicle, index) => {
            const imageUrl = getPrimaryImageUrl(vehicle)

            return (
              <CarouselItem key={vehicle.id} className="basis-full">
                <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
                  <div className="relative aspect-[16/7] w-full">
                    <Image
                      src={imageUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-slate-900/85 via-slate-900/55 to-black/10" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-12">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-white/15 text-white backdrop-blur-sm">
                        السيارة {index + 1} / {displayVehicles.length}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-100 border border-blue-300/30">{getCategory(vehicle)}</Badge>
                      {vehicle.year && (
                        <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-300/30">موديل {vehicle.year}</Badge>
                      )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-end">
                      <div className="space-y-4 max-w-3xl">
                        <h4 className="text-3xl md:text-4xl font-bold leading-tight">
                          {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-lg text-slate-200">
                          تصميم عصري، مساحة مريحة، وأداء موثوق لرحلاتك اليومية والبعيدة.
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                            <Fuel className="h-4 w-4" />
                            <span>الوقود: {getFuelType(vehicle)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                            <Settings2 className="h-4 w-4" />
                            <span>ناقل الحركة: {getTransmission(vehicle)}</span>
                          </div>
                          {typeof vehicle.mileage === 'number' && (
                            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                              <Gauge className="h-4 w-4" />
                              <span>المسافة: {vehicle.mileage.toLocaleString('ar-EG')} كم</span>
                            </div>
                          )}
                          {vehicle.category && (
                            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                              <Droplets className="h-4 w-4" />
                              <span>الفئة: {getCategory(vehicle)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur">
                        <div className="text-sm text-slate-200">السعر</div>
                        <div className="text-3xl font-semibold text-white">{formatPrice(vehicle.price)}</div>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Button size="lg" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
                              التفاصيل والحجز
                            </Button>
                          </Link>
                          <Link href="/tata-motors">
                            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                              جميع السيارات
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )
          })}
      </CarouselContent>

      <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
        <CarouselPrevious className="static translate-y-0 border-blue-200 text-blue-600 hover:bg-blue-50" />
        <CarouselNext className="static translate-y-0 border-blue-200 text-blue-600 hover:bg-blue-50" />
      </div>
    </Carousel>
  )
}
