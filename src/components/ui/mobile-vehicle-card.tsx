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
  Star,
  Zap,
  Shield,
  Clock,
  Car
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { EnhancedLoadingIndicator } from '@/components/ui/enhanced-loading'
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
  isFeatured?: boolean
  isNew?: boolean
}

interface MobileVehicleCardProps {
  vehicle: Vehicle
  className?: string
  showActions?: boolean
  compact?: boolean
  loading?: boolean
}

export function MobileVehicleCard({
  vehicle,
  className = '',
  showActions = true,
  compact = false,
  loading = false
}: MobileVehicleCardProps) {
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
      <Card className={`${compact ? 'h-64' : 'h-96'} ${className}`}>
        <CardContent className="p-0 h-full">
          <div className="h-full flex items-center justify-center">
            <EnhancedLoadingIndicator 
              variant="car" 
              text="جاري تحميل السيارة..." 
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={`h-64 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardContent className="p-0 h-full">
          {/* Compact Image Section */}
          <div className="relative h-32">
            <OptimizedImage
              src={primaryImage?.imageUrl || '/placeholder-car.jpg'}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
            
            {/* Compact Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {vehicle.isFeatured && (
                <Badge className="bg-blue-600 text-white text-xs">
                  مميزة
                </Badge>
              )}
              {vehicle.isNew && (
                <Badge className="bg-green-500 text-white text-xs">
                  جديدة
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            {showActions && (
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 bg-white/80 hover:bg-white text-gray-700 p-0"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 bg-white/80 hover:bg-white text-gray-700 p-0"
                  onClick={() => setShowQuickView(true)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Compact Content */}
          <div className="p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-sm text-gray-900">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-xs text-gray-500">{vehicle.year}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-blue-600">
                  {formatPrice(vehicle.price)}
                </p>
                {vehicle.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{vehicle.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Specs */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Fuel className="w-3 h-3" />
                <span>{vehicle.fuelType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Settings className="w-3 h-3" />
                <span>{vehicle.transmission}</span>
              </div>
            </div>

            {/* Compact Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs py-1.5" asChild>
                <Link href={`/vehicles/${vehicle.id}`}>
                  التفاصيل
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs py-1.5" asChild>
                <Link href={`/test-drive?vehicle=${vehicle.id}`}>
                  اختبار قيادة
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-96 overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}>
      <CardContent className="p-0 h-full">
        {/* Image Section */}
        <div className="relative h-48">
          <OptimizedImage
            src={primaryImage?.imageUrl || '/placeholder-car.jpg'}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {vehicle.isFeatured && (
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                مميزة
              </Badge>
            )}
            {vehicle.isNew && (
              <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                جديدة
              </Badge>
            )}
            {vehicle.rating && vehicle.rating >= 4.5 && (
              <Badge className="bg-blue-500 text-white text-sm px-3 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {vehicle.rating}
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
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentImageIndex === index ? 'bg-white w-4' : 'bg-white/50'
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
                className="w-8 h-8 bg-white/80 hover:bg-white text-gray-700 p-0"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 bg-white/80 hover:bg-white text-gray-700 p-0"
                onClick={() => setShowQuickView(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 bg-white/80 hover:bg-white text-gray-700 p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-blue-600 mb-1">
                {formatPrice(vehicle.price)}
              </p>
              {vehicle.mileage && (
                <p className="text-xs text-gray-500">{formatMileage(vehicle.mileage)}</p>
              )}
            </div>
          </div>

          {/* Key Specifications */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Fuel className="w-4 h-4 mx-auto mb-1 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">{vehicle.fuelType}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Settings className="w-4 h-4 mx-auto mb-1 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">{vehicle.transmission}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <Users className="w-4 h-4 mx-auto mb-1 text-gray-600" />
              <p className="text-xs font-medium text-gray-700">5 مقاعد</p>
            </div>
          </div>

          {/* Features Preview */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {vehicle.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{vehicle.features.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/vehicles/${vehicle.id}`}>
                عرض التفاصيل
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/test-drive?vehicle=${vehicle.id}`}>
                اختبار قيادة
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  {vehicle.make} {vehicle.model}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickView(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={primaryImage?.imageUrl || '/placeholder-car.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">السعر:</span>
                    <p className="font-semibold text-blue-600">{formatPrice(vehicle.price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">الموديل:</span>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">الوقود:</span>
                    <p className="font-semibold">{vehicle.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ناقل الحركة:</span>
                    <p className="font-semibold">{vehicle.transmission}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/vehicles/${vehicle.id}`}>
                      التفاصيل الكاملة
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
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

// Mobile-optimized vehicle grid
interface MobileVehicleGridProps {
  vehicles: Vehicle[]
  loading?: boolean
  className?: string
  compact?: boolean
}

export function MobileVehicleGrid({
  vehicles,
  loading = false,
  className = '',
  compact = false
}: MobileVehicleGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <MobileVehicleCard
            key={index}
            vehicle={{} as Vehicle}
            compact={compact}
            loading={true}
          />
        ))}
      </div>
    )
  }

  if (!vehicles.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <Car className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          لا توجد سيارات متاحة
        </h3>
        <p className="text-gray-600 mb-4">
          لم نجد سيارات تطابق معايير البحث الخاصة بك
        </p>
        <Button variant="outline">
          إعادة تعيين الفلاتر
        </Button>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {vehicles.map((vehicle) => (
        <MobileVehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          compact={compact}
        />
      ))}
    </div>
  )
}

// Mobile vehicle comparison card
interface MobileComparisonCardProps {
  vehicle: Vehicle
  isSelected?: boolean
  onSelect?: () => void
  onRemove?: () => void
  className?: string
}

export function MobileComparisonCard({
  vehicle,
  isSelected = false,
  onSelect,
  onRemove,
  className = ''
}: MobileComparisonCardProps) {
  const primaryImage = vehicle.images.find(img => img.isPrimary) || vehicle.images[0]

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    } ${className}`}>
      <CardContent className="p-0">
        <div className="relative h-32">
          <OptimizedImage
            src={primaryImage?.imageUrl || '/placeholder-car.jpg'}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 200px"
          />
          
          {isSelected && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-500 text-white">
                مختارة
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h4 className="font-semibold text-sm mb-1">
            {vehicle.make} {vehicle.model}
          </h4>
          <p className="text-xs text-gray-500 mb-2">{vehicle.year}</p>
          <p className="font-bold text-sm text-blue-600 mb-3">
            {new Intl.NumberFormat('ar-EG', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0
            }).format(vehicle.price)}
          </p>
          
          {isSelected ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={onRemove}
            >
              إزالة من المقارنة
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={onSelect}
            >
              إضافة للمقارنة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}