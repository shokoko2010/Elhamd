'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Car, Search } from 'lucide-react'
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
  mileage?: number
  color?: string
  status: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface Filters {
  search: string
  category: string
  fuelType: string
  transmission: string
  sortBy: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: 'all',
    fuelType: 'all',
    transmission: 'all',
    sortBy: 'featured'
  })

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/public/vehicles')
        if (response.ok) {
          const data = await response.json()
          setVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    loadVehicles()
  }, [])

  useEffect(() => {
    let filtered = [...vehicles]

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(filters.search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.category === filters.category)
    }

    // Apply fuel type filter
    if (filters.fuelType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.fuelType === filters.fuelType)
    }

    // Apply transmission filter
    if (filters.transmission !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.transmission === filters.transmission)
    }

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'year-desc':
          return b.year - a.year
        case 'year-asc':
          return a.year - b.year
        case 'featured':
          return (b.status === 'FEATURED' ? 1 : 0) - (a.status === 'FEATURED' ? 1 : 0)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
  }, [vehicles, filters])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      fuelType: 'all',
      transmission: 'all',
      sortBy: 'featured'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المركبات...</p>
          </div>
        </div>
      </div>
    )
  }

  const categoryLabels: Record<string, string> = {
    SEDAN: 'سيدان',
    SUV: 'دفع رباعي',
    HATCHBACK: 'هاتشباك',
    TRUCK: 'شاحنة',
    VAN: 'فان',
    COMMERCIAL: 'تجارية',
    BUS: 'حافلة',
    PICKUP: 'بيك أب'
  }

  const getCategoryLabel = (category: string) => categoryLabels[category] || category

  const fuelTypeLabels: Record<string, string> = {
    PETROL: 'بنزين',
    DIESEL: 'ديزل',
    ELECTRIC: 'كهربائي',
    HYBRID: 'هجين',
    CNG: 'غاز طبيعي'
  }

  const getFuelTypeLabel = (fuelType: string) => fuelTypeLabels[fuelType] || fuelType

  const transmissionLabels: Record<string, string> = {
    MANUAL: 'يدوي',
    AUTOMATIC: 'أوتوماتيك',
    CVT: 'ناقل حركة متغير'
  }

  const getTransmissionLabel = (transmission: string) => transmissionLabels[transmission] || transmission

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">المركبات</h1>
              <p className="text-gray-600 mt-1">ابحث عن سيارتك Tata المثالية</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>تم العثور على {filteredVehicles.length} مركبة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ابحث عن مركبة..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="SEDAN">سيدان</SelectItem>
                  <SelectItem value="SUV">دفع رباعي</SelectItem>
                  <SelectItem value="HATCHBACK">هاتشباك</SelectItem>
                  <SelectItem value="PICKUP">بيك أب</SelectItem>
                  <SelectItem value="TRUCK">شاحنة</SelectItem>
                  <SelectItem value="VAN">فان</SelectItem>
                  <SelectItem value="BUS">حافلة</SelectItem>
                  <SelectItem value="COMMERCIAL">تجارية</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.fuelType} onValueChange={(value) => updateFilter('fuelType', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="PETROL">بنزين</SelectItem>
                  <SelectItem value="DIESEL">ديزل</SelectItem>
                  <SelectItem value="ELECTRIC">كهربائي</SelectItem>
                  <SelectItem value="HYBRID">هجين</SelectItem>
                  <SelectItem value="CNG">غاز طبيعي</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.transmission} onValueChange={(value) => updateFilter('transmission', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="MANUAL">يدوي</SelectItem>
                  <SelectItem value="AUTOMATIC">أوتوماتيك</SelectItem>
                  <SelectItem value="CVT">ناقل حركة متغير</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">المميزة</SelectItem>
                  <SelectItem value="price-asc">السعر: الأقل</SelectItem>
                  <SelectItem value="price-desc">السعر: الأعلى</SelectItem>
                  <SelectItem value="year-desc">الأحدث</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مركبات</h3>
            <p className="text-gray-600 mb-4">لم يتم العثور على مركبات تطابق معايير البحث الخاصة بك</p>
            <Button onClick={clearFilters} variant="outline">
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={vehicle.images[0]?.imageUrl || '/uploads/vehicles/1/nexon-front-new.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 text-xs z-10 ${
                    vehicle.status === 'AVAILABLE' ? 'bg-green-500' : 
                    vehicle.status === 'SOLD' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {vehicle.status === 'AVAILABLE' ? 'متاحة' : vehicle.status === 'SOLD' ? 'مباعة' : 'محجوزة'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-gray-600">{vehicle.year}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{getCategoryLabel(vehicle.category)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <Badge variant="secondary" className="text-xs">{getFuelTypeLabel(vehicle.fuelType)}</Badge>
                    <Badge variant="secondary" className="text-xs">{getTransmissionLabel(vehicle.transmission)}</Badge>
                    {vehicle.color && (
                      <Badge variant="secondary" className="text-xs">{vehicle.color}</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-blue-900">
                      {formatPrice(vehicle.price)}
                    </span>
                  </div>
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <Button className="w-full">
                      التفاصيل
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}