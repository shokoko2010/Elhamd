'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Car, Calendar } from 'lucide-react'
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
  description?: string
  status: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface Filters {
  search: string
  category: string
  fuelType: string
  transmission: string
  minPrice: string
  maxPrice: string
  sortBy: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    fuelType: '',
    transmission: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'price-asc'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const vehiclesPerPage = 9

  useEffect(() => {
    // Mock data for now - will be replaced with API call
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 850000,
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'White',
        description: 'Premium SUV with advanced safety features and modern design',
        status: 'AVAILABLE',
        images: [{ imageUrl: `https://source.unsplash.com/400x300/?tata,nexon,suv`, isPrimary: true }]
      },
      {
        id: '2',
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 650000,
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'Red',
        description: 'سيارة SUV عائلية مثالية للقيادة في المدينة',
        status: 'AVAILABLE',
        images: [{ imageUrl: `https://source.unsplash.com/400x300/?tata,punch,suv`, isPrimary: true }]
      },
      {
        id: '3',
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 550000,
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'Blue',
        description: 'سيارة هاتشباك فعالة باقتصاد وقود ممتاز',
        status: 'AVAILABLE',
        images: [{ imageUrl: `https://source.unsplash.com/400x300/?tata,tiago,hatchback`, isPrimary: true }]
      },
      {
        id: '4',
        make: 'Tata',
        model: 'Tigor',
        year: 2024,
        price: 600000,
        category: 'SEDAN',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'Silver',
        description: 'سيارة سيدان أنيقة بمميزات فاخرة',
        status: 'AVAILABLE',
        images: [{ imageUrl: `https://source.unsplash.com/400x300/?tata,tigor,sedan`, isPrimary: true }]
      },
      {
        id: '5',
        make: 'Tata',
        model: 'Harrier',
        year: 2024,
        price: 1200000,
        category: 'SUV',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        mileage: 0,
        color: 'Black',
        description: 'سيارة SUV فاخرة بأداء قوي وقوي',
        status: 'AVAILABLE',
        images: [{ imageUrl: `https://source.unsplash.com/400x300/?tata,harrier,suv`, isPrimary: true }]
      },
      {
        id: '6',
        make: 'Tata',
        model: 'Altroz',
        year: 2024,
        price: 580000,
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'Green',
        description: 'هاتشباك فاخرة بتقنيات سلامة متقدمة',
        status: 'AVAILABLE',
        images: [{ imageUrl: `https://source.unsplash.com/400x300/?tata,altroz,hatchback`, isPrimary: true }]
      }
    ]
    setVehicles(mockVehicles)
    setFilteredVehicles(mockVehicles)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.make.toLowerCase().includes(filters.search.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(filters.search.toLowerCase()) ||
                           vehicle.description?.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesCategory = !filters.category || filters.category === 'all' || vehicle.category === filters.category
      const matchesFuelType = !filters.fuelType || filters.fuelType === 'all' || vehicle.fuelType === filters.fuelType
      const matchesTransmission = !filters.transmission || filters.transmission === 'all' || vehicle.transmission === filters.transmission
      
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity
      const matchesPrice = vehicle.price >= minPrice && vehicle.price <= maxPrice

      return matchesSearch && matchesCategory && matchesFuelType && matchesTransmission && matchesPrice
    })

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
        case 'name-asc':
          return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
    setCurrentPage(1)
  }, [vehicles, filters])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const indexOfLastVehicle = currentPage * vehiclesPerPage
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle)
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 ml-2" />
                  الفلاتر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">بحث</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="ابحث عن مركبة..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pr-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">الفئة</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الفئات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الفئات</SelectItem>
                      <SelectItem value="SEDAN">سيدان</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="HATCHBACK">هاتشباك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الوقود</label>
                  <Select value={filters.fuelType} onValueChange={(value) => setFilters({...filters, fuelType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع أنواع الوقود" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع أنواع الوقود</SelectItem>
                      <SelectItem value="PETROL">بنزين</SelectItem>
                      <SelectItem value="DIESEL">ديزل</SelectItem>
                      <SelectItem value="ELECTRIC">كهربائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ناقل الحركة</label>
                  <Select value={filters.transmission} onValueChange={(value) => setFilters({...filters, transmission: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع أنواع ناقل الحركة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع أنواع ناقل الحركة</SelectItem>
                      <SelectItem value="MANUAL">يدوي</SelectItem>
                      <SelectItem value="AUTOMATIC">أوتوماتيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">نطاق السعر (ج.م)</label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="الحد الأدنى"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="الحد الأقصى"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ترتيب حسب</label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">السعر: من الأقل إلى الأعلى</SelectItem>
                      <SelectItem value="price-desc">السعر: من الأعلى إلى الأقل</SelectItem>
                      <SelectItem value="year-desc">السنة: الأحدث أولاً</SelectItem>
                      <SelectItem value="year-asc">السنة: الأقدم أولاً</SelectItem>
                      <SelectItem value="name-asc">الاسم: من أ إلى ي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    search: '',
                    category: 'all',
                    fuelType: 'all',
                    transmission: 'all',
                    minPrice: '',
                    maxPrice: '',
                    sortBy: 'price-asc'
                  })}
                >
                  مسح الفلاتر
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل المركبات...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gray-200 relative">
                        <img
                          src={vehicle.images[0]?.imageUrl || 'https://source.unsplash.com/400x300/?tata,car'}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                        <Badge className={`absolute top-2 right-2 ${
                          vehicle.status === 'AVAILABLE' ? 'bg-green-500' : 
                          vehicle.status === 'SOLD' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {vehicle.status === 'AVAILABLE' ? 'متاحة' : vehicle.status === 'SOLD' ? 'مباعة' : 'محجوزة'}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-gray-600">{vehicle.year}</p>
                          </div>
                          <Badge variant="outline">{vehicle.category}</Badge>
                        </div>
                        <div className="flex gap-2 mb-4">
                          <Badge variant="secondary">{vehicle.fuelType}</Badge>
                          <Badge variant="secondary">{vehicle.transmission}</Badge>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-blue-900">
                            {formatPrice(vehicle.price)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Button size="sm" className="flex-1">
                              <Car className="ml-2 h-4 w-4" />
                              التفاصيل
                            </Button>
                          </Link>
                          <Link href="/test-drive">
                            <Button size="sm" variant="outline">
                              <Calendar className="ml-2 h-4 w-4" />
                              قيادة تجريبية
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Simple Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
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
                          onClick={() => paginate(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      التالي
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}