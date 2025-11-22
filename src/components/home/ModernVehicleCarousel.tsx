'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { Car, Droplets, Fuel, Gauge, Settings2 } from 'lucide-react'
import { buildVehicleImageAlt } from '@/lib/media-utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit bg-blue-100 text-blue-700 border-blue-200">مجموعة السيارات</Badge>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">عرض سيارات واضح ومتوازن</h3>
          <p className="text-slate-600">
            استكشف تشكيلتنا الكاملة من سيارات تاتا ببطاقات واضحة وسهلة التصفح. {totalVehiclesCount ?? displayVehicles.length}{' '}
            سيارة جاهزة للاستعراض.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {displayVehicles.map((vehicle, index) => {
          const imageUrl = getPrimaryImageUrl(vehicle)
          const altText = buildVehicleImageAlt(
            {
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              category: getCategory(vehicle)
            },
            { context: 'عرض سيارات شركة الحمد' }
          )

          return (
            <div
              key={vehicle.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-video w-full bg-slate-100">
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority={index < 2}
                />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Badge className="bg-white/90 text-slate-800">{getCategory(vehicle)}</Badge>
                  {vehicle.year && <Badge className="bg-blue-100 text-blue-800">موديل {vehicle.year}</Badge>}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-1">
                  <h4 className="text-xl font-semibold text-slate-900">
                    {vehicle.make} {vehicle.model}
                  </h4>
                  <p className="text-sm text-slate-600">سيارة عملية بتجهيزات موثوقة تناسب احتياجاتك اليومية.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <Fuel className="h-4 w-4 text-slate-500" />
                    <span>الوقود: {getFuelType(vehicle)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    <span>ناقل الحركة: {getTransmission(vehicle)}</span>
                  </div>
                  {typeof vehicle.mileage === 'number' && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <Gauge className="h-4 w-4 text-slate-500" />
                      <span>المسافة: {vehicle.mileage.toLocaleString('ar-EG')} كم</span>
                    </div>
                  )}
                  {vehicle.category && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <Droplets className="h-4 w-4 text-slate-500" />
                      <span>الفئة: {getCategory(vehicle)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-600">السعر</div>
                    <div className="text-2xl font-bold text-slate-900">{formatPrice(vehicle.price)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        التفاصيل والحجز
                      </Button>
                    </Link>
                    <Link href="/tata-motors">
                      <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                        جميع السيارات
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
