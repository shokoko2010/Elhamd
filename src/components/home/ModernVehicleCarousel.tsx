'use client'

import Link from 'next/link'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react'
import { Car, ChevronLeft, ChevronRight, Droplets, Fuel, Gauge, Settings2 } from 'lucide-react'

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

type GalleryStyle = CSSProperties & {
  '--gallery-width'?: string
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
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [slidesCount])

  const layeredVehicles = useMemo(() => {
    if (slidesCount === 0) return []

    const offsets =
      slidesCount >= 5 ? [-2, -1, 0, 1, 2] : Array.from({ length: slidesCount }, (_, idx) => idx - Math.floor(slidesCount / 2))
    const seen = new Set<number>()

    return offsets
      .map((offset, positionIndex) => {
        const vehicleIndex = (activeIndex + offset + slidesCount) % slidesCount
        if (seen.has(vehicleIndex)) {
          return null
        }
        seen.add(vehicleIndex)

        const dataPos = slidesCount >= 5 ? positionIndex : positionIndex

        return {
          vehicle: displayVehicles[vehicleIndex],
          vehicleIndex,
          dataPos,
          offset
        }
      })
      .filter(Boolean) as {
        vehicle: PublicVehicle
        vehicleIndex: number
        dataPos: number
        offset: number
      }[]
  }, [activeIndex, displayVehicles, slidesCount])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
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
      <ErrorState title="حدث خطأ" message={error} onRetry={onRetry} />
    )
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

  const heroVehicle = displayVehicles[activeIndex] ?? displayVehicles[0]

  const galleryStyle: GalleryStyle = {
    '--gallery-width': 'min(1000px, 90vw)'
  }

  const scaleMap: Record<number, number> = {
    0: 1,
    1: 1.35,
    2: 1.75,
    3: 1.35,
    4: 1
  }

  const zIndexMap: Record<number, number> = {
    0: 1,
    1: 5,
    2: 10,
    3: 5,
    4: 1
  }

  const handleCardClick = (index: number) => {
    if (!Number.isFinite(index)) return
    setActiveIndex(index)
  }

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % slidesCount)
  }

  const handlePrevious = () => {
    setActiveIndex(prev => (prev - 1 + slidesCount) % slidesCount)
  }

  const heroPrice = formatPrice(heroVehicle?.price)

  const renderGallery = () => {
    if (slidesCount < 5) {
      return (
        <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayVehicles.map(vehicle => (
            <button
              key={vehicle.id}
              type="button"
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-0 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                heroVehicle?.id === vehicle.id ? 'ring-2 ring-cyan-400/60 ring-offset-4 ring-offset-slate-900' : ''
              }`}
              onClick={() => handleCardClick(displayVehicles.indexOf(vehicle))}
            >
              <GalleryImage vehicle={vehicle} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-sm text-white/80">{getVehicleCategory(vehicle)}</p>
                <h4 className="text-xl font-bold">{vehicle.make} {vehicle.model}</h4>
              </div>
            </button>
          ))}
        </div>
      )
    }

    return (
      <div className="relative mx-auto flex w-full max-w-[1000px] items-center justify-center">
        <button
          type="button"
          aria-label="السابق"
          className="z-20 hidden h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 lg:flex"
          onClick={handlePrevious}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <ul className="vehicle-gallery" style={galleryStyle}>
          {layeredVehicles.map(item => {
            const dataPos = Math.min(4, Math.max(0, slidesCount >= 5 ? item.dataPos : item.dataPos))
            const offset = slidesCount >= 5 ? item.offset : item.dataPos - Math.floor(layeredVehicles.length / 2)
            const scale = scaleMap[dataPos] ?? 1
            const zIndex = zIndexMap[dataPos] ?? 1
            const translateX = slidesCount >= 5 ? offset : offset * 1.2

            return (
              <li
                key={`${item.vehicle.id}-${item.vehicleIndex}`}
                data-pos={dataPos}
                className="vehicle-gallery-item"
                style={{
                  transform: `translateX(calc(var(--gallery-width) * 0.18 * ${translateX})) scale(${scale})`,
                  zIndex
                }}
              >
                <button
                  type="button"
                  className={`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
                    item.vehicleIndex === activeIndex ? 'ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                  onClick={() => handleCardClick(item.vehicleIndex)}
                >
                  <GalleryImage vehicle={item.vehicle} />
                </button>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          aria-label="التالي"
          className="z-20 hidden h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 lg:flex"
          onClick={handleNext}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white shadow-[0_45px_120px_-50px_rgba(15,23,42,0.9)] sm:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-blue-500/30 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-cyan-400/30 blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-cyan-300">المعرض الديناميكي</p>
            <h3 className="mt-2 text-3xl font-bold md:text-4xl">جميع سيارات شركة الحمد في شاشة واحدة</h3>
            <p className="mt-3 text-sm text-white/70">
              استعرض كل السيارات ({slidesCount}) من خلال النقر على أي صورة أو استخدام أزرار التنقل. التصميم الجديد يضمن وضوح الصور واستجابتها على جميع الأجهزة.
            </p>
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              aria-label="السابق"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
              onClick={handlePrevious}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="التالي"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
              onClick={handleNext}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-10">
          {renderGallery()}

          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-white/70">السيارة المختارة حالياً</p>
                <h4 className="mt-2 text-3xl font-bold">{heroVehicle.make} {heroVehicle.model}</h4>
                <p className="text-sm text-white/70">{getVehicleCategory(heroVehicle)} • {heroVehicle.year ?? 'بدون سنة'}</p>
              </div>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <SpecPill icon={<Fuel className="h-4 w-4" />} label="نوع الوقود" value={getFuelType(heroVehicle)} />
                <SpecPill icon={<Settings2 className="h-4 w-4" />} label="ناقل الحركة" value={getTransmission(heroVehicle)} />
                <SpecPill
                  icon={<Gauge className="h-4 w-4" />}
                  label="عدد الكيلومترات"
                  value={heroVehicle.mileage ? `${heroVehicle.mileage.toLocaleString('ar-EG')} كم` : 'جديدة بالكامل'}
                />
                <SpecPill icon={<Droplets className="h-4 w-4" />} label="السعر" value={heroPrice} />
              </div>
              <div className="flex flex-col items-end gap-3 text-left lg:text-right">
                <p className="text-xs text-white/70">السعر يبدأ من</p>
                <p className="text-3xl font-bold text-cyan-300">{heroPrice}</p>
                <Link href={`/vehicles/${heroVehicle.id}`} className="w-full lg:w-auto">
                  <TouchButton
                    variant="default"
                    size="lg"
                    className="w-full bg-cyan-500 text-white hover:bg-cyan-400"
                  >
                    تفاصيل أكثر
                  </TouchButton>
                </Link>
              </div>
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

      <style jsx>{`
        .vehicle-gallery {
          width: min(var(--gallery-width), 100%);
          list-style-type: none;
          display: grid;
          place-items: center;
          padding: 0;
        }

        .vehicle-gallery-item {
          position: relative;
          grid-column: 1;
          grid-row: 1;
          width: calc(var(--gallery-width) / 5);
          aspect-ratio: 1;
          cursor: pointer;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.45);
          transition: transform 0.8s ease, filter 0.8s ease;
          will-change: transform;
        }

        @media (max-width: 768px) {
          .vehicle-gallery-item {
            width: calc(var(--gallery-width) / 2.2);
          }
        }
      `}</style>
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cyan-200">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-sm font-semibold text-white">{value}</span>
      </div>
    </div>
  )
}

interface GalleryImageProps {
  vehicle: PublicVehicle
}

function GalleryImage({ vehicle }: GalleryImageProps) {
  const primaryImage = getPrimaryImageUrl(vehicle)
  const placeholderUrl = `/api/placeholder/800/800?text=${encodeURIComponent(`${vehicle.make} ${vehicle.model}`)}`

  return (
    <div className="relative block h-full w-full overflow-hidden rounded-[32px]">
      <img
        src={primaryImage ?? placeholderUrl}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-right text-white">
        <p className="text-xs text-white/80">{getVehicleCategory(vehicle)}</p>
        <h4 className="text-lg font-bold">{vehicle.make} {vehicle.model}</h4>
      </div>
    </div>
  )
}
