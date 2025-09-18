'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'

interface Filters {
  search: string
  category: string
  fuelType: string
  transmission: string
  minPrice: string
  maxPrice: string
  sortBy: string
}

interface MobileFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClearFilters: () => void
  resultCount: number
}

export function MobileFilters({ filters, onFiltersChange, onClearFilters, resultCount }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {resultCount} نتيجة
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} فلتر
            </Badge>
          )}
        </div>
        
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              فلترة
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh]">
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader className="text-right">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-xl">فلترة المركبات</DrawerTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DrawerDescription>
                  اضبط الفلاتر للعثور على المركبة المناسبة لك
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-right">بحث</Label>
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

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-right">الفئة</Label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                    <SelectTrigger className="text-right">
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
                <div className="space-y-2">
                  <Label className="text-right">نوع الوقود</Label>
                  <Select value={filters.fuelType} onValueChange={(value) => updateFilter('fuelType', value)}>
                    <SelectTrigger className="text-right">
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
                <div className="space-y-2">
                  <Label className="text-right">ناقل الحركة</Label>
                  <Select value={filters.transmission} onValueChange={(value) => updateFilter('transmission', value)}>
                    <SelectTrigger className="text-right">
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
                <div className="space-y-2">
                  <Label className="text-right">نطاق السعر (ج.م)</Label>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="الحد الأدنى"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="text-right"
                    />
                    <Input
                      type="number"
                      placeholder="الحد الأقصى"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="text-right"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-right">ترتيب حسب</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger className="text-right">
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      onClearFilters()
                      setIsOpen(false)
                    }}
                  >
                    مسح الكل
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    تطبيق ({resultCount})
                  </Button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}