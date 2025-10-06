'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Car, Star } from 'lucide-react'
import Link from 'next/link'
import { MobileVehicleCard } from '@/components/ui/mobile-vehicle-card'
import { LoadingCard, ErrorState } from '@/components/ui/LoadingIndicator'
import { TouchButton, useDeviceInfo } from '@/components/ui/enhanced-mobile-optimization'
import { EnhancedLazySection } from '@/components/ui/enhanced-lazy-loading'
import { toast } from 'sonner'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
  fuelType: string
  transmission: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

export function FeaturedVehicles() {
  const deviceInfo = useDeviceInfo()
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehiclesResponse = await fetch('/api/vehicles?featured=true&limit=6')
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          setFeaturedVehicles(vehiclesData?.vehicles || [])
          
          if (vehiclesData?.vehicles?.length === 0) {
            toast.info('لا توجد سيارات مميزة متاحة حالياً')
          }
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setError('فشل في تحميل السيارات المميزة')
        toast.error('فشل في تحميل السيارات المميزة')
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <EnhancedLazySection rootMargin="100px" preload={false}>
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative w-full">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full opacity-30 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <Star className="ml-2 h-4 w-4" />
              مميزة
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              السيارات المميزة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              استعرض أحدث سيارات تاتا المميزة بعروض حصرية وأسعار ممتازة
            </p>
          </div>
        
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <LoadingCard key={i} title="جاري تحميل السيارة..." className="h-80 md:h-96" />
              ))}
            </div>
          ) : error ? (
            <ErrorState 
              title="حدث خطأ" 
              message={error}
              onRetry={() => window.location.reload()}
            />
          ) : featuredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد سيارات مميزة حالياً</h3>
              <p className="text-gray-500 mb-6">يرجى التحقق لاحقاً أو استعراض جميع السيارات المتاحة</p>
              <Link href="/vehicles">
                <TouchButton variant="outline" size="lg">
                  استعرض جميع السيارات
                </TouchButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredVehicles.map((vehicle) => (
                <MobileVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  formatPrice={formatPrice}
                  deviceInfo={deviceInfo}
                />
              ))}
            </div>
          )}
          
          {/* View All Button */}
          <div className="text-center mt-12">
            <Link href="/vehicles">
              <TouchButton 
                variant="outline" 
                size="xl"
                className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300 px-8 py-4 text-lg font-semibold"
              >
                استعرض جميع السيارات
                <Car className="mr-3 h-6 w-6" />
              </TouchButton>
            </Link>
          </div>
        </div>
      </section>
    </EnhancedLazySection>
  )
}