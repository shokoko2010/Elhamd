'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { Car, ChevronLeft, ChevronRight, Droplets, Fuel, Gauge, Image as ImageIcon, Settings2 } from 'lucide-react'

import type { PublicVehicle } from '@/types/public-vehicle'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { LoadingCard, ErrorState } from '@/components/ui/LoadingIndicator'

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

const getPrimaryImageUrl = (vehicle: PublicVehicle) => {
  const images = vehicle?.images ?? []
  const primary = images.find(img => img.isPrimary) ?? images[0]
  return primary?.imageUrl ? encodeURI(primary.imageUrl) : null
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

  const [itemsPerView, setItemsPerView] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  useEffect(() => {
    setCurrentIndex(0)
  }, [slidesCount])

  useEffect(() => {
    const maxIndex = Math.max(0, slidesCount - itemsPerView)
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, itemsPerView, slidesCount])

  const handleNext = () => {
    if (slidesCount === 0) return
    const maxIndex = Math.max(0, slidesCount - itemsPerView)
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }

  const handlePrevious = () => {
    if (slidesCount === 0) return
    const maxIndex = Math.max(0, slidesCount - itemsPerView)
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-full min-h-[440px]">
            <LoadingCard title="جاري تحميل السيارة..." className="h-full" />
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
      <div className="py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <Car className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-700">لا توجد سيارات حالياً</h3>
        <p className="mb-6 text-gray-500">يرجى التحقق لاحقاً أو التواصل معنا للمزيد من التفاصيل</p>
        <Link href="/contact">
          <TouchButton
            variant="outline"
            size="lg"
            className="border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
          >
            تواصل معنا
          </TouchButton>
        </Link>
      </div>
    )
  }

  const translate = `translateX(-${(currentIndex * 100) / itemsPerView}%)`
  const heroVehicle = displayVehicles[currentIndex] ?? displayVehicles[0]

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_45px_120px_-60px_rgba(15,23,42,0.35)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-blue-100 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-cyan-100 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-500">معرض السيارات</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">كاروسيل احترافي يعرض كل سياراتنا بوضوح</h3>
              <p className="mt-2 text-sm text-slate-600">
                تصفح كل السيارات ({slidesCount}) مع صور عالية الوضوح، بطاقات منظمة، وتحكم كامل من اللمس أو الأزرار.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                aria-label="السابق"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                onClick={handlePrevious}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="التالي"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                onClick={handleNext}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-inner min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.18),transparent_35%)]" />

            <div className="relative">
              <div className="flex items-center justify-between px-2 pb-4 text-white/80">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.35em]">
                  <div className="h-px w-10 bg-white/40" />
                  معرض حي
                  <div className="h-px w-10 bg-white/40" />
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <ImageIcon className="h-4 w-4" />
                  صور عالية الوضوح
                </div>
              </div>

              <div className="overflow-hidden">
                <ul
                  className="flex gap-5 transition-transform duration-500 ease-in-out"
                  style={{ transform: translate }}
                >
                  {displayVehicles.map(vehicle => (
                    <li
                      key={vehicle.id}
                      className="min-w-0 flex-shrink-0"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <VehicleCard vehicle={vehicle} onOpen={() => setCurrentIndex(displayVehicles.indexOf(vehicle))} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                    <Car className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-white/60">السيارة المعروضة</p>
                    <p className="text-lg font-semibold">{heroVehicle.make} {heroVehicle.model}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                  <SpecPill icon={<Fuel className="h-4 w-4" />} label="نوع الوقود" value={getFuelType(heroVehicle)} />
                  <SpecPill icon={<Settings2 className="h-4 w-4" />} label="ناقل الحركة" value={getTransmission(heroVehicle)} />
                  <SpecPill
                    icon={<Gauge className="h-4 w-4" />}
                    label="عدد الكيلومترات"
                    value={heroVehicle.mileage ? `${heroVehicle.mileage.toLocaleString('ar-EG')} كم` : 'جديدة بالكامل'}
                  />
                  <SpecPill icon={<Droplets className="h-4 w-4" />} label="السعر" value={formatPrice(heroVehicle.price)} />
                </div>

                <Link href={`/vehicles/${heroVehicle.id}`} className="w-full sm:w-auto">
                  <TouchButton
                    variant="default"
                    size="lg"
                    className="w-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-400"
                  >
                    تفاصيل أكثر
                  </TouchButton>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              جاهز للعرض الفوري • يدعم السحب باللمس والماوس
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                {currentIndex + 1} / {slidesCount}
              </span>
            </div>
          </div>
        </div>
      </section>

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
  icon: React.ReactNode
  label: string
  value: string
}

function SpecPill({ icon, label, value }: SpecPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white/90 backdrop-blur">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cyan-200">
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] text-white/70">{label}</span>
        <span className="text-xs font-semibold text-white">{value}</span>
      </div>
    </div>
  )
}

interface VehicleCardProps {
  vehicle: PublicVehicle
  onOpen: () => void
}

function VehicleCard({ vehicle, onOpen }: VehicleCardProps) {
  const primaryImage = getPrimaryImageUrl(vehicle)
  const placeholderUrl = `/api/placeholder/1200/800?text=${encodeURIComponent(`${vehicle.make} ${vehicle.model}`)}`

  return (
    <article className="group relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl ring-1 ring-white/5">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={primaryImage ?? placeholderUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg">
          {getVehicleCategory(vehicle)}
        </div>
        <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between gap-2 text-white">
          <div>
            <h4 className="text-xl font-bold leading-tight">{vehicle.make} {vehicle.model}</h4>
            <p className="text-xs text-white/70">سنة {vehicle.year ?? 'غير محدد'}</p>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-cyan-200 shadow-md backdrop-blur">
            {formatPrice(vehicle.price)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/70 p-4 text-white">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <SpecBox label="نوع الوقود" value={getFuelType(vehicle)} />
          <SpecBox label="ناقل الحركة" value={getTransmission(vehicle)} />
          <SpecBox label="السنة" value={vehicle.year ? vehicle.year.toString() : 'غير محدد'} />
          <SpecBox label="الكيلومترات" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString('ar-EG')} كم` : '0 كم'} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            <span className="h-2 w-2 rounded-full bg-green-400" />
            عرض في الأعلى
          </button>
          <Link href={`/vehicles/${vehicle.id}`} className="text-sm font-semibold text-white transition hover:text-cyan-200">
            التفاصيل الكاملة →
          </Link>
        </div>
      </div>
    </article>
  )
}

interface SpecBoxProps {
  label: string
  value: string
}

function SpecBox({ label, value }: SpecBoxProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] text-white/60">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
