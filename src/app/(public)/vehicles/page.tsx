'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VehicleCardSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton'
import { MobileFilters } from '@/components/ui/mobile-filters'
import { EnhancedSearch } from '@/components/ui/enhanced-search'
import { EnhancedFilters } from '@/components/ui/enhanced-filters'
import { LoadingState, SkeletonCard } from '@/components/ui/enhanced-loading'
import { EnhancedErrorComponent, useErrorHandler } from '@/components/ui/enhanced-error-handling'
import { EnhancedImage, useImagePreloader } from '@/components/ui/enhanced-image'
import { useFilterState } from '@/hooks/use-filter-state'
import { useRetry } from '@/hooks/use-retry'
import { Search, Filter, Car, Calendar, Share2 } from 'lucide-react'
import Link from 'next/link'
import CarComparison from '@/components/vehicle/CarComparison'
import { useComparison } from '@/hooks/use-comparison'

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
  minYear: string
  maxYear: string
  minMileage: string
  maxMileage: string
  colors: string[]
  sortBy: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const vehiclesPerPage = 9

  const { filters, setFilters, clearFilters, hasActiveFilters, getActiveFiltersCount, shareFilters } = useFilterState({
    persistToLocalStorage: true,
    syncWithUrl: true,
    storageKey: 'vehicle-filters'
  })

  const { handleError, clearError } = useErrorHandler()
  const { preloadImages, isImageLoaded } = useImagePreloader()
  const { 
    comparisonVehicles, 
    addToComparison, 
    removeFromComparison, 
    isInComparison,
    getComparisonCount 
  } = useComparison()

  const fetchVehicles = async (searchFilters: typeof filters) => {
    const params = new URLSearchParams()
    if (searchFilters.search) params.append('search', searchFilters.search)
    if (searchFilters.category && searchFilters.category !== 'all') params.append('category', searchFilters.category)
    if (searchFilters.fuelType && searchFilters.fuelType !== 'all') params.append('fuelType', searchFilters.fuelType)
    if (searchFilters.transmission && searchFilters.transmission !== 'all') params.append('transmission', searchFilters.transmission)
    
    const response = await fetch(`/api/vehicles?${params.toString()}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.vehicles
  }

  const { execute: fetchVehiclesWithRetry, isRetrying } = useRetry(fetchVehicles, {
    maxAttempts: 3,
    delay: 1000,
    backoffFactor: 2,
    jitter: true,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message)
    },
    onSuccess: (attempt) => {
      console.log(`Success on attempt ${attempt}`)
    },
    onFailure: (error) => {
      console.error('All retry attempts failed:', error)
    }
  })

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true)
      setError(null)
      clearError()
      
      try {
        const vehicleData = await fetchVehiclesWithRetry(filters)
        setVehicles(vehicleData)
        
        // Preload images for better performance
        const imageUrls = vehicleData
          .flatMap(vehicle => vehicle.images.map(img => img.imageUrl))
          .slice(0, 12) // Limit to first 12 images
        
        if (imageUrls.length > 0) {
          preloadImages(imageUrls).catch(console.error)
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        handleError(error as Error)
        setError(error as Error)
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    loadVehicles()
  }, [filters.search, filters.category, filters.fuelType, filters.transmission, fetchVehiclesWithRetry, handleError, clearError, preloadImages])

  useEffect(() => {
    let filtered = [...vehicles]
    
    // Apply price filtering
    if (filters.minPrice || filters.maxPrice) {
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity
      filtered = filtered.filter(vehicle => vehicle.price >= minPrice && vehicle.price <= maxPrice)
    }

    // Apply year filtering
    if (filters.minYear || filters.maxYear) {
      const minYear = filters.minYear ? parseInt(filters.minYear) : 0
      const maxYear = filters.maxYear ? parseInt(filters.maxYear) : Infinity
      filtered = filtered.filter(vehicle => vehicle.year >= minYear && vehicle.year <= maxYear)
    }

    // Apply mileage filtering
    if (filters.minMileage || filters.maxMileage) {
      const minMileage = filters.minMileage ? parseInt(filters.minMileage) : 0
      const maxMileage = filters.maxMileage ? parseInt(filters.maxMileage) : Infinity
      filtered = filtered.filter(vehicle => 
        vehicle.mileage && vehicle.mileage >= minMileage && vehicle.mileage <= maxMileage
      )
    }

    // Apply color filtering
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(vehicle => 
        vehicle.color && filters.colors.includes(vehicle.color)
      )
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
        case 'mileage-asc':
          return (a.mileage || 0) - (b.mileage || 0)
        case 'mileage-desc':
          return (b.mileage || 0) - (a.mileage || 0)
        case 'name-asc':
          return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
        case 'name-desc':
          return `${b.make} ${b.model}`.localeCompare(`${a.make} ${a.model}`)
        case 'featured':
          // Assuming featured vehicles have a specific status or flag
          return (b.status === 'FEATURED' ? 1 : 0) - (a.status === 'FEATURED' ? 1 : 0)
        default:
          return 0
      }
    })

    setFilteredVehicles(filtered)
    setCurrentPage(1)
  }, [vehicles, filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear, filters.minMileage, filters.maxMileage, filters.colors, filters.sortBy])

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

  const retryFetch = async () => {
    setLoading(true)
    setError(null)
    clearError()
    
    try {
      const vehicleData = await fetchVehiclesWithRetry(filters)
      setVehicles(vehicleData)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      handleError(error as Error)
      setError(error as Error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

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
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareFilters}
                    className="h-8 px-2"
                  >
                    <Share2 className="h-4 w-4 ml-1" />
                    مشاركة
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <MobileFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        resultCount={filteredVehicles.length}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block lg:w-1/4">
            <EnhancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              resultCount={filteredVehicles.length}
            />
          </div>

          {/* Vehicle Grid */}
          <div className="lg:w-3/4">
            <LoadingState
              isLoading={loading || isRetrying}
              error={error}
              retry={retryFetch}
              type="card"
              count={6}
              loadingMessage={isRetrying ? "جاري إعادة المحاولة..." : "جاري تحميل المركبات..."}
              errorMessage="فشل في تحميل المركبات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
            >
              <>
                {filteredVehicles.length === 0 && !loading && !error ? (
                  <div className="text-center py-12">
                    <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مركبات</h3>
                    <p className="text-gray-600 mb-4">لم يتم العثور على مركبات تطابق معايير البحث الخاصة بك</p>
                    <Button onClick={clearFilters} variant="outline">
                      مسح الفلاتر
                    </Button>
                  </div>
                ) : (
                  <CarComparison
                    vehicles={currentVehicles}
                    comparisonVehicles={comparisonVehicles}
                    onAddToComparison={addToComparison}
                    onRemoveFromComparison={removeFromComparison}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={paginate}
                  />
                )}
              </>
            </LoadingState>
          </div>
        </div>
      </div>
    </div>
  )
}