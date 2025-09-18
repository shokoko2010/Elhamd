'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EnhancedImage } from '@/components/ui/enhanced-image'
import { X, Plus, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useComparisonAnalytics } from '@/hooks/use-analytics'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color?: string
  description?: string
  status: string
  images: { imageUrl: string; isPrimary: boolean }[]
  engine?: string
  horsepower?: number
  acceleration?: number
  topSpeed?: number
  fuelEfficiency?: number
  seats?: number
  doors?: number
  features?: string[]
}

interface CarComparisonProps {
  vehicles: Vehicle[]
  onAddToComparison?: (vehicle: Vehicle) => void
  onRemoveFromComparison?: (vehicleId: string) => void
  comparisonVehicles: Vehicle[]
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

export default function CarComparison({ 
  vehicles, 
  onAddToComparison, 
  onRemoveFromComparison,
  comparisonVehicles,
  totalPages,
  currentPage,
  onPageChange
}: CarComparisonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localComparisonVehicles, setLocalComparisonVehicles] = useState<Vehicle[]>(comparisonVehicles)

  useEffect(() => {
    setLocalComparisonVehicles(comparisonVehicles)
  }, [comparisonVehicles])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num)
  }

  const { trackComparison, trackAddToComparison } = useComparisonAnalytics()

  const addToComparison = (vehicle: Vehicle) => {
    if (localComparisonVehicles.length >= 4) {
      alert('يمكنك مقارنة حتى 4 سيارات كحد أقصى')
      return
    }
    
    if (!localComparisonVehicles.find(v => v.id === vehicle.id)) {
      const updated = [...localComparisonVehicles, vehicle]
      setLocalComparisonVehicles(updated)
      onAddToComparison?.(vehicle)
      
      // Track analytics
      trackAddToComparison(vehicle.id, vehicle.make, vehicle.model, vehicle.price)
      trackComparison(
        updated.map(v => v.id),
        updated.length
      )
    }
  }

  const removeFromComparison = (vehicleId: string) => {
    const updated = localComparisonVehicles.filter(v => v.id !== vehicleId)
    setLocalComparisonVehicles(updated)
    onRemoveFromComparison?.(vehicleId)
    
    // Track analytics
    trackComparison(
      updated.map(v => v.id),
      updated.length
    )
  }

  const clearComparison = () => {
    setLocalComparisonVehicles([])
    localComparisonVehicles.forEach(vehicle => {
      onRemoveFromComparison?.(vehicle.id)
    })
    
    // Track analytics
    trackComparison([], 0)
  }

  const getComparisonData = () => {
    if (localComparisonVehicles.length === 0) return []

    const comparisonRows = [
      {
        label: 'الصورة',
        type: 'image',
        values: localComparisonVehicles.map(v => v.images[0]?.imageUrl || '/uploads/vehicles/1/nexon-front-new.jpg')
      },
      {
        label: 'الماركة والموديل',
        type: 'text',
        values: localComparisonVehicles.map(v => `${v.make} ${v.model}`)
      },
      {
        label: 'السنة',
        type: 'number',
        values: localComparisonVehicles.map(v => v.year)
      },
      {
        label: 'السعر',
        type: 'price',
        values: localComparisonVehicles.map(v => v.price)
      },
      {
        label: 'الفئة',
        type: 'text',
        values: localComparisonVehicles.map(v => v.category)
      },
      {
        label: 'نوع الوقود',
        type: 'text',
        values: localComparisonVehicles.map(v => v.fuelType)
      },
      {
        label: 'ناقل الحركة',
        type: 'text',
        values: localComparisonVehicles.map(v => v.transmission)
      },
      {
        label: 'المسافة المقطوعة',
        type: 'mileage',
        values: localComparisonVehicles.map(v => v.mileage || 0)
      },
      {
        label: 'اللون',
        type: 'text',
        values: localComparisonVehicles.map(v => v.color || '-')
      },
      {
        label: 'المحرك',
        type: 'text',
        values: localComparisonVehicles.map(v => v.engine || '-')
      },
      {
        label: 'قوة الحصان',
        type: 'number',
        values: localComparisonVehicles.map(v => v.horsepower || '-')
      },
      {
        label: 'التسارع (0-100 كم/س)',
        type: 'number',
        values: localComparisonVehicles.map(v => v.acceleration || '-')
      },
      {
        label: 'السرعة القصوى',
        type: 'number',
        values: localComparisonVehicles.map(v => v.topSpeed || '-')
      },
      {
        label: 'استهلاك الوقود',
        type: 'number',
        values: localComparisonVehicles.map(v => v.fuelEfficiency || '-')
      },
      {
        label: 'عدد المقاعد',
        type: 'number',
        values: localComparisonVehicles.map(v => v.seats || '-')
      },
      {
        label: 'عدد الأبواب',
        type: 'number',
        values: localComparisonVehicles.map(v => v.doors || '-')
      },
      {
        label: 'الحالة',
        type: 'status',
        values: localComparisonVehicles.map(v => v.status)
      }
    ]

    return comparisonRows
  }

  const renderCellValue = (value: any, type: string) => {
    switch (type) {
      case 'image':
        return (
          <div className="w-20 h-16 mx-auto">
            <EnhancedImage
              src={value}
              alt="Vehicle"
              className="w-full h-full object-cover rounded"
              aspectRatio="4/3"
              objectFit="cover"
              lazy={false}
              fadeIn={false}
            />
          </div>
        )
      case 'price':
        return formatPrice(value)
      case 'mileage':
        return value ? `${formatNumber(value)} كم` : '-'
      case 'status':
        return (
          <Badge className={
            value === 'AVAILABLE' ? 'bg-green-500' : 
            value === 'SOLD' ? 'bg-red-500' : 'bg-yellow-500'
          }>
            {value === 'AVAILABLE' ? 'متاحة' : value === 'SOLD' ? 'مباعة' : 'محجوزة'}
          </Badge>
        )
      case 'number':
        return value || '-'
      default:
        return value || '-'
    }
  }

  return (
    <>
      {/* Comparison Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="shadow-lg rounded-full h-14 w-14 p-0"
              disabled={localComparisonVehicles.length === 0}
            >
              <div className="relative">
                <ArrowRight className="h-6 w-6" />
                {localComparisonVehicles.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {localComparisonVehicles.length}
                  </Badge>
                )}
              </div>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>مقارنة السيارات</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {localComparisonVehicles.length} من 4 سيارات
                  </span>
                  {localComparisonVehicles.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearComparison}
                    >
                      مسح الكل
                    </Button>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-auto max-h-[calc(90vh-100px)]">
              {localComparisonVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRight className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لم تتم إضافة أي سيارات للمقارنة</h3>
                  <p className="text-gray-600 mb-4">
                    اختر سيارات من صفحة المركبات لإضافتها للمقارنة
                  </p>
                  <Button onClick={() => setIsOpen(false)}>
                    تصفح السيارات
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">المواصفة</TableHead>
                        {localComparisonVehicles.map((vehicle) => (
                          <TableHead key={vehicle.id} className="text-center">
                            <div className="space-y-2">
                              <div className="relative">
                                <EnhancedImage
                                  src={vehicle.images[0]?.imageUrl || '/uploads/vehicles/1/nexon-front-new.jpg'}
                                  alt={`${vehicle.make} ${vehicle.model}`}
                                  className="w-full h-24 object-cover rounded"
                                  aspectRatio="16/9"
                                  objectFit="cover"
                                  lazy={false}
                                  fadeIn={false}
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => removeFromComparison(vehicle.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div>
                                <div className="font-semibold">{vehicle.make} {vehicle.model}</div>
                                <div className="text-sm text-gray-600">{vehicle.year}</div>
                                <div className="text-lg font-bold text-blue-900">
                                  {formatPrice(vehicle.price)}
                                </div>
                              </div>
                              <Link href={`/vehicles/${vehicle.id}`}>
                                <Button size="sm" className="w-full">
                                  عرض التفاصيل
                                </Button>
                              </Link>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getComparisonData().map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.label}</TableCell>
                          {row.values.map((value, cellIndex) => (
                            <TableCell key={cellIndex} className="text-center">
                              {renderCellValue(value, row.type)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add to Comparison Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {vehicles.map((vehicle) => {
          const isInComparison = localComparisonVehicles.find(v => v.id === vehicle.id)
          
          return (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-40 sm:h-48 bg-gray-200 relative">
                <EnhancedImage
                  src={vehicle.images[0]?.imageUrl || '/uploads/vehicles/1/nexon-front-new.jpg'}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full"
                  aspectRatio="16/9"
                  objectFit="cover"
                  lazy={true}
                  fadeIn={true}
                  zoomOnHover={true}
                  priority={false}
                />
                <Badge className={`absolute top-2 right-2 text-xs z-10 ${
                  vehicle.status === 'AVAILABLE' ? 'bg-green-500' : 
                  vehicle.status === 'SOLD' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {vehicle.status === 'AVAILABLE' ? 'متاحة' : vehicle.status === 'SOLD' ? 'مباعة' : 'محجوزة'}
                </Badge>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{vehicle.year}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 ml-2">{vehicle.category}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  <Badge variant="secondary" className="text-xs">{vehicle.fuelType}</Badge>
                  <Badge variant="secondary" className="text-xs">{vehicle.transmission}</Badge>
                  {vehicle.color && (
                    <Badge variant="secondary" className="text-xs">{vehicle.color}</Badge>
                  )}
                  {vehicle.mileage && (
                    <Badge variant="secondary" className="text-xs">
                      {new Intl.NumberFormat('ar-EG').format(vehicle.mileage)} كم
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg sm:text-2xl font-bold text-blue-900">
                    {formatPrice(vehicle.price)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
                    <Button size="sm" className="w-full h-10 sm:h-9 text-sm">
                      التفاصيل
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant={isInComparison ? "default" : "outline"}
                    className="w-full h-10 sm:h-9 text-sm"
                    onClick={() => isInComparison ? removeFromComparison(vehicle.id) : addToComparison(vehicle)}
                    disabled={localComparisonVehicles.length >= 4 && !isInComparison}
                  >
                    {isInComparison ? (
                      <>
                        <XCircle className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
                        إزالة
                      </>
                    ) : (
                      <>
                        <Plus className="ml-1 h-3 w-3 sm:ml-2 sm:h-4 sm:w-4" />
                        مقارنة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onPageChange?.(Math.max(1, (currentPage || 1) - 1))}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => onPageChange?.(Math.min(totalPages, (currentPage || 1) + 1))}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </>
  )
}