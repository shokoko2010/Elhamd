'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Car, Fuel, Settings, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

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
  status: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface Filters {
  category: string
  fuelType: string
  transmission: string
  sortBy: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    fuelType: 'all',
    transmission: 'all',
    sortBy: 'featured'
  })

  // Derived state for filtering
  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.category !== 'all' && vehicle.category !== filters.category) return false
    if (filters.fuelType !== 'all' && vehicle.fuelType !== filters.fuelType) return false
    if (filters.transmission !== 'all' && vehicle.transmission !== filters.transmission) return false
    return true
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc': return a.price - b.price
      case 'price-desc': return b.price - a.price
      case 'year-desc': return b.year - a.year
      case 'year-asc': return a.year - b.year
      default: return (b.status === 'FEATURED' ? 1 : 0) - (a.status === 'FEATURED' ? 1 : 0)
    }
  })

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true)
      try {
        const response = await fetch('/api/public/vehicles')
        if (response.ok) {
          const data = await response.json()
          setVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [])

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ category: 'all', fuelType: 'all', transmission: 'all', sortBy: 'featured' })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">جاري تحميل أسطول السيارات...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 pt-16 md:pt-20">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">أسطول السيارات</h1>
              <p className="text-sm text-gray-500">اختر من بين تشكيلتنا المميزة من سيارات تاتا</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={filters.category}
                onChange={(v) => updateFilter('category', v)}
                placeholder="الفئة"
                options={[
                  { value: 'all', label: 'الكل' },
                  { value: 'TRUCK', label: 'شاحنات' },
                  { value: 'PICKUP', label: 'بيك أب' },
                  { value: 'BUS', label: 'حافلات' },
                  { value: 'VAN', label: 'فان' },
                  { value: 'SEDAN', label: 'سيدان' },
                ]}
              />
              <FilterSelect
                value={filters.fuelType}
                onChange={(v) => updateFilter('fuelType', v)}
                placeholder="الوقود"
                options={[
                  { value: 'all', label: 'الكل' },
                  { value: 'DIESEL', label: 'ديزل' },
                  { value: 'PETROL', label: 'بنزين' },
                ]}
              />
              <FilterSelect
                value={filters.sortBy}
                onChange={(v) => updateFilter('sortBy', v)}
                placeholder="ترتيب"
                options={[
                  { value: 'featured', label: 'المميزة' },
                  { value: 'price-asc', label: 'الأقل سعراً' },
                  { value: 'price-desc', label: 'الأعلى سعراً' },
                  { value: 'year-desc', label: 'الأحدث موديلاً' },
                ]}
              />
              {(filters.category !== 'all' || filters.fuelType !== 'all') && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="مسح الفلاتر">
                  <RotateCcw className="h-4 w-4 text-gray-500" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-500">
            {filteredVehicles.length} مركبة متوفرة
          </span>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Car className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">لا توجد نتائج</h3>
            <p className="text-gray-500 mt-2 max-w-md">لم نتمكن من العثور على مركبات تطابق معايير البحث الحالية. جرب تغيير الفلاتر.</p>
            <Button variant="outline" className="mt-6" onClick={clearFilters}>مسح جميع الفلاتر</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Link href={`/vehicles/${vehicle.id}`} key={vehicle.id} className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white ring-1 ring-gray-100 group-hover:ring-primary/20">
                  {/* Image Area */}
                  <div className="aspect-[4/3] relative bg-gray-200 overflow-hidden">
                    <Image
                      src={vehicle.images[0]?.imageUrl || '/placeholder-car.jpg'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={cn(
                        "backdrop-blur-md shadow-sm border-0 font-bold",
                        vehicle.status === 'AVAILABLE' ? "bg-green-500/90 text-white" : "bg-gray-900/90 text-white"
                      )}>
                        {vehicle.status === 'AVAILABLE' ? 'متاحة' : vehicle.status === 'SOLD' ? 'مباعة' : 'محجوزة'}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 right-3 left-3 text-white">
                      <h3 className="text-lg font-bold leading-tight drop-shadow-md">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm opacity-90 drop-shadow-sm">{vehicle.year} • {vehicle.category}</p>
                    </div>
                  </div>

                  {/* Content Area */}
                  <CardContent className="p-4 pt-5">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                        <Fuel className="h-3.5 w-3.5" />
                        <span>{vehicle.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                        <Settings className="h-3.5 w-3.5" />
                        <span>{vehicle.transmission}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="text-primary font-bold text-xl tracking-tight">
                        {formatPrice(vehicle.price)}
                      </div>
                      <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 text-white">
                        التفاصيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterSelect({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], placeholder: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[130px] h-9 text-xs font-medium bg-gray-50 border-gray-200 focus:ring-primary/20">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}