'use client'

import { useState } from 'react'
import { 
  Heart, 
  Share2, 
  Eye, 
  Calendar, 
  Fuel, 
  Settings, 
  Users,
  Zap,
  Shield,
  Clock,
  Car
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

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
  features?: string[]
  rating?: number
  mileage?: number
  isNew?: boolean
}

interface EnhancedVehicleCardProps {
  vehicle: Vehicle
  className?: string
  showActions?: boolean
  compact?: boolean
  loading?: boolean
}

export function EnhancedVehicleCard({
  vehicle,
  className = '',
  showActions = true,
  compact = false,
  loading = false
}: EnhancedVehicleCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showQuickView, setShowQuickView] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ar-EG').format(mileage) + ' كم'
  }

  const primaryImage = vehicle.images.find(img => img.isPrimary) || vehicle.images[0]
  const hasMultipleImages = vehicle.images.length > 1

  if (loading) {
    return (
      <Card className={`${compact ? 'h-72' : 'h-full min-h-[520px]'} ${className}`}>
        <CardContent className="p-0 h-full">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل السيارة...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-full min-h-[620px] overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 shadow-xl ${className}`}>
      <CardContent className="p-0 h-full">
        {/* Image Section */}
        <div className="relative h-[22rem] md:h-[26rem] overflow-hidden bg-gray-100">
          <img
            src={primaryImage?.imageUrl || '/placeholder-car.jpg'}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-car.jpg';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {vehicle.isNew && (
              <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white text-sm px-3 py-1 shadow-lg">
                جديدة
              </Badge>
            )}
            {vehicle.fuelType === 'ELECTRIC' && (
              <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm px-3 py-1 shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                كهربائية
              </Badge>
            )}
          </div>

          {/* Image Navigation */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {vehicle.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index ? 'bg-white w-6' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 p-0 shadow-lg backdrop-blur-sm"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 p-0 shadow-lg backdrop-blur-sm"
                onClick={() => setShowQuickView(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 bg-white flex-1 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-3xl text-gray-900 mb-2 leading-tight truncate">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-lg text-gray-600 truncate">{vehicle.year} • {vehicle.category}</p>
            </div>
            <div className="text-right mr-3 flex-shrink-0">
              <p className="font-bold text-3xl text-blue-600 mb-1 whitespace-nowrap">
                {formatPrice(vehicle.price)}
              </p>
              {vehicle.mileage && (
                <p className="text-sm text-gray-500 whitespace-nowrap">{formatMileage(vehicle.mileage)}</p>
              )}
            </div>
          </div>

          {/* Key Specifications */}
          <div className="grid grid-cols-3 gap-5">
            <div className="text-center p-5 bg-gray-50 rounded-2xl border border-gray-100 min-h-[72px] flex flex-col justify-center shadow-sm">
              <Fuel className="w-7 h-7 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-medium text-gray-700 leading-tight">
                {vehicle.fuelType === 'PETROL' ? 'بنزين' :
                 vehicle.fuelType === 'DIESEL' ? 'ديزل' :
                 vehicle.fuelType === 'ELECTRIC' ? 'كهرباء' : vehicle.fuelType}
              </p>
            </div>
            <div className="text-center p-5 bg-gray-50 rounded-2xl border border-gray-100 min-h-[72px] flex flex-col justify-center shadow-sm">
              <Settings className="w-7 h-7 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-medium text-gray-700 leading-tight">
                {vehicle.transmission === 'MANUAL' ? 'يدوي' : 'أوتوماتيك'}
              </p>
            </div>
            <div className="text-center p-5 bg-gray-50 rounded-2xl border border-gray-100 min-h-[72px] flex flex-col justify-center shadow-sm">
              <Users className="w-7 h-7 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-medium text-gray-700 leading-tight">5 مقاعد</p>
            </div>
          </div>

          {/* Features Preview */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-4 flex-1">
              <div className="flex flex-wrap gap-2">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-base border-blue-200 text-blue-700 px-4 py-1.5">
                    {feature}
                  </Badge>
                ))}
                {vehicle.features.length > 3 && (
                  <Badge variant="outline" className="text-base border-gray-200 text-gray-600 px-4 py-1.5">
                    +{vehicle.features.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto pt-2">
            <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href={`/vehicles/${vehicle.id}`}>
                عرض التفاصيل
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
              <Link href={`/test-drive?vehicle=${vehicle.id}`}>
                اختبار قيادة
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {vehicle.make} {vehicle.model}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickView(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={primaryImage?.imageUrl || '/placeholder-car.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-car.jpg';
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">السعر:</span>
                    <p className="font-semibold text-blue-600 text-lg">{formatPrice(vehicle.price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">الموديل:</span>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">الوقود:</span>
                    <p className="font-semibold">
                      {vehicle.fuelType === 'PETROL' ? 'بنزين' : 
                       vehicle.fuelType === 'DIESEL' ? 'ديزل' : 
                       vehicle.fuelType === 'ELECTRIC' ? 'كهرباء' : vehicle.fuelType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">ناقل الحركة:</span>
                    <p className="font-semibold">
                      {vehicle.transmission === 'MANUAL' ? 'يدوي' : 'أوتوماتيك'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href={`/vehicles/${vehicle.id}`}>
                      التفاصيل الكاملة
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                    <Link href={`/test-drive?vehicle=${vehicle.id}`}>
                      اختبار قيادة
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}