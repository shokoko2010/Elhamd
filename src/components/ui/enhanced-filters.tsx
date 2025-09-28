'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Filter, X, SlidersHorizontal, RotateCcw, Palette, Gauge, Calendar } from 'lucide-react'

interface EnhancedFiltersProps {
  filters: {
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
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  resultCount: number
  className?: string
}

const COLORS = [
  { value: 'أبيض', label: 'أبيض', hex: '#FFFFFF' },
  { value: 'أسود', label: 'أسود', hex: '#000000' },
  { value: 'فضي', label: 'فضي', hex: '#C0C0C0' },
  { value: 'رمادي', label: 'رمادي', hex: '#808080' },
  { value: 'أحمر', label: 'أحمر', hex: '#FF0000' },
  { value: 'أزرق', label: 'أزرق', hex: '#0000FF' },
  { value: 'أخضر', label: 'أخضر', hex: '#008000' },
  { value: 'أصفر', label: 'أصفر', hex: '#FFFF00' },
  { value: 'برتقالي', label: 'برتقالي', hex: '#FFA500' },
  { value: 'بنفسجي', label: 'بنفسجي', hex: '#800080' },
  { value: 'بني', label: 'بني', hex: '#A52A2A' },
  { value: 'بيج', label: 'بيج', hex: '#F5F5DC' }
]

const CATEGORIES = [
  { value: 'SEDAN', label: 'سيدان' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'هاتشباك' },
  { value: 'COUPE', label: 'كوبيه' },
  { value: 'CONVERTIBLE', label: 'كابريوليه' },
  { value: 'PICKUP', label: 'بيك أب' },
  { value: 'VAN', label: 'فان' }
]

const FUEL_TYPES = [
  { value: 'PETROL', label: 'بنزين' },
  { value: 'DIESEL', label: 'ديزل' },
  { value: 'ELECTRIC', label: 'كهربائي' },
  { value: 'HYBRID', label: 'هجين' },
  { value: 'CNG', label: 'غاز طبيعي' }
]

const TRANSMISSIONS = [
  { value: 'MANUAL', label: 'يدوي' },
  { value: 'AUTOMATIC', label: 'أوتوماتيك' },
  { value: 'CVT', label: 'CVT' },
  { value: 'DCT', label: 'DCT' }
]

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'year-desc', label: 'السنة: الأحدث أولاً' },
  { value: 'year-asc', label: 'السنة: الأقدم أولاً' },
  { value: 'mileage-asc', label: 'المسافة: الأقل أولاً' },
  { value: 'mileage-desc', label: 'المسافة: الأكثر أولاً' },
  { value: 'name-asc', label: 'الاسم: من أ إلى ي' },
  { value: 'name-desc', label: 'الاسم: من ي إلى أ' },
  { value: 'featured', label: 'المميزة أولاً' }
]

export function EnhancedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  resultCount,
  className = ""
}: EnhancedFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000])
  const [yearRange, setYearRange] = useState<[number, number]>([2015, 2024])
  const [mileageRange, setMileageRange] = useState<[number, number]>([0, 200000])
  const isInternalUpdate = useRef(false)

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    
    // Update ranges when filters change from external sources (not from our own slider changes)
    // Only update if the actual filter values are different from our current range values
    const currentMinPrice = filters.minPrice ? parseInt(filters.minPrice) : 0
    const currentMaxPrice = filters.maxPrice ? parseInt(filters.maxPrice) : 2000000
    
    const currentMinYear = filters.minYear ? parseInt(filters.minYear) : 2015
    const currentMaxYear = filters.maxYear ? parseInt(filters.maxYear) : 2024
    
    const currentMinMileage = filters.minMileage ? parseInt(filters.minMileage) : 0
    const currentMaxMileage = filters.maxMileage ? parseInt(filters.maxMileage) : 200000

    // Only update state if values actually changed to prevent infinite loops
    const priceChanged = currentMinPrice !== priceRange[0] || currentMaxPrice !== priceRange[1]
    const yearChanged = currentMinYear !== yearRange[0] || currentMaxYear !== yearRange[1]
    const mileageChanged = currentMinMileage !== mileageRange[0] || currentMaxMileage !== mileageRange[1]

    if (priceChanged) {
      setPriceRange([currentMinPrice, currentMaxPrice])
    }
    if (yearChanged) {
      setYearRange([currentMinYear, currentMaxYear])
    }
    if (mileageChanged) {
      setMileageRange([currentMinMileage, currentMaxMileage])
    }
  }, [filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear, filters.minMileage, filters.maxMileage])

  const updateFilter = useCallback((key: string, value: string | string[]) => {
    onFiltersChange(prevFilters => ({ ...prevFilters, [key]: value }))
  }, [onFiltersChange])

  // Create a stable callback that doesn't depend on filters
  const handleFilterChange = useCallback((key: string, value: string | string[] | ((prev: any) => any)) => {
    if (typeof value === 'function') {
      onFiltersChange(prevFilters => ({ ...prevFilters, [key]: value(prevFilters[key]) }))
    } else {
      onFiltersChange(prevFilters => ({ ...prevFilters, [key]: value }))
    }
  }, [onFiltersChange])

  const handlePriceRangeChange = useCallback((values: number[]) => {
    const newPriceRange = values as [number, number]
    isInternalUpdate.current = true
    setPriceRange(newPriceRange)
    // Update both min and max price at once to avoid multiple filter updates
    handleFilterChange('minPrice', newPriceRange[0].toString())
    handleFilterChange('maxPrice', newPriceRange[1].toString())
  }, [handleFilterChange])

  const handleYearRangeChange = useCallback((values: number[]) => {
    const newYearRange = values as [number, number]
    isInternalUpdate.current = true
    setYearRange(newYearRange)
    // Update both min and max year at once to avoid multiple filter updates
    handleFilterChange('minYear', newYearRange[0].toString())
    handleFilterChange('maxYear', newYearRange[1].toString())
  }, [handleFilterChange])

  const handleMileageRangeChange = useCallback((values: number[]) => {
    const newMileageRange = values as [number, number]
    isInternalUpdate.current = true
    setMileageRange(newMileageRange)
    // Update both min and max mileage at once to avoid multiple filter updates
    handleFilterChange('minMileage', newMileageRange[0].toString())
    handleFilterChange('maxMileage', newMileageRange[1].toString())
  }, [handleFilterChange])

  const handleColorChange = useCallback((color: string, checked: boolean) => {
    handleFilterChange('colors', (prevColors: string[] = []) => {
      const currentColors = prevColors || []
      if (checked) {
        return [...currentColors, color]
      } else {
        return currentColors.filter(c => c !== color)
      }
    })
  }, [handleFilterChange])

  const getActiveFiltersCount = useCallback(() => {
    const count = Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      return value && value !== '' && value !== 'all'
    }).length
    return count
  }, [filters])

  const activeFiltersCount = getActiveFiltersCount()

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }, [])

  const formatMileage = useCallback((mileage: number) => {
    return new Intl.NumberFormat('ar-EG').format(mileage) + ' كم'
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <SlidersHorizontal className="h-5 w-5 ml-2" />
            الفلاتر المتقدمة
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} نشط
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category */}
        <div className="space-y-2">
          <Label className="text-right font-medium">الفئة</Label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Fuel Type */}
        <div className="space-y-2">
          <Label className="text-right font-medium">نوع الوقود</Label>
          <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange('fuelType', value)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="جميع أنواع الوقود" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع أنواع الوقود</SelectItem>
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
          <Label className="text-right font-medium">ناقل الحركة</Label>
          <Select value={filters.transmission} onValueChange={(value) => handleFilterChange('transmission', value)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="جميع أنواع ناقل الحركة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع أنواع ناقل الحركة</SelectItem>
              {TRANSMISSIONS.map((transmission) => (
                <SelectItem key={transmission.value} value={transmission.value}>
                  {transmission.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-4">
          <Label className="text-right font-medium flex items-center gap-2">
            نطاق السعر
            <span className="text-xs text-gray-500 font-normal">
              ({formatPrice(priceRange[0])} - {formatPrice(priceRange[1])})
            </span>
          </Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={2000000}
            min={0}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(2000000)}</span>
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-4">
          <Label className="text-right font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            نطاق السنة
            <span className="text-xs text-gray-500 font-normal">
              ({yearRange[0]} - {yearRange[1]})
            </span>
          </Label>
          <Slider
            value={yearRange}
            onValueChange={handleYearRangeChange}
            max={2024}
            min={2015}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>2015</span>
            <span>2024</span>
          </div>
        </div>

        {/* Mileage Range */}
        <div className="space-y-4">
          <Label className="text-right font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            نطاق المسافة
            <span className="text-xs text-gray-500 font-normal">
              ({formatMileage(mileageRange[0])} - {formatMileage(mileageRange[1])})
            </span>
          </Label>
          <Slider
            value={mileageRange}
            onValueChange={handleMileageRangeChange}
            max={200000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 كم</span>
            <span>200,000 كم</span>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div className="space-y-3">
          <Label className="text-right font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            الألوان
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((color) => (
              <div key={color.value} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`color-${color.value}`}
                  checked={filters.colors?.includes(color.value) || false}
                  onCheckedChange={(checked) => handleColorChange(color.value, checked as boolean)}
                />
                <label
                  htmlFor={`color-${color.value}`}
                  className="flex items-center gap-1 cursor-pointer text-xs"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-right font-medium">ترتيب حسب</Label>
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger className="text-right">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            مسح جميع الفلاتر ({activeFiltersCount})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}