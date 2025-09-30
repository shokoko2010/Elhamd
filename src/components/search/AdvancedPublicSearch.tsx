'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Car, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  Star,
  Grid,
  List,
  ArrowUpDown
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { formatPrice } from '@/lib/utils'

interface SearchSuggestion {
  id: string
  text: string
  type: 'vehicle'
  category: string
  popularity: number
}

interface SearchResult {
  id: string
  type: 'vehicle'
  title: string
  description: string
  category: string
  relevanceScore: number
  highlights: string[]
  metadata: {
    year: number
    price: number
    status: string
    mileage?: number
    fuelType: string
    transmission: string
    primaryImage?: string | null
  }
  createdAt: string
  updatedAt: string
}

interface SearchFilters {
  category: string
  minPrice: number
  maxPrice: number
  fuelType: string
  transmission: string
  year: string
}

interface AvailableFilters {
  categories: string[]
  fuelTypes: string[]
  transmissions: string[]
  years: number[]
  priceRange: {
    min: number
    max: number
  }
}

interface AdvancedPublicSearchProps {
  onSearch?: (results: SearchResult[]) => void
  className?: string
  placeholder?: string
  showResults?: boolean
}

export function AdvancedPublicSearch({
  onSearch,
  className = "",
  placeholder = "ابحث عن سيارة...",
  showResults = true
}: AdvancedPublicSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null)
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    minPrice: 0,
    maxPrice: 1000000,
    fuelType: 'all',
    transmission: 'all',
    year: 'all'
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  // Fetch suggestions with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2 && isOpen) {
        fetchSuggestions()
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, isOpen])

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/public/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      // Fallback suggestions
      const fallbackSuggestions = [
        { id: '1', text: 'تاتا نيكسون', type: 'vehicle', category: 'SUV', popularity: 95 },
        { id: '2', text: 'تاتا بانش', type: 'vehicle', category: 'SUV', popularity: 88 },
        { id: '3', text: 'تاتا تياجو', type: 'vehicle', category: 'HATCHBACK', popularity: 82 },
        { id: '4', text: 'تاتا ألتروز', type: 'vehicle', category: 'HATCHBACK', popularity: 75 },
        { id: '5', text: 'تاتا هارير', type: 'vehicle', category: 'SUV', popularity: 70 }
      ].filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(fallbackSuggestions)
    }
  }

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      toast({
        title: "الرجاء إدخال كلمة بحث",
        description: "اكتب اسم السيارة أو الموديل للبحث",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder,
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.minPrice > 0 && { minPrice: filters.minPrice.toString() }),
        ...(filters.maxPrice < 1000000 && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.fuelType !== 'all' && { fuelType: filters.fuelType }),
        ...(filters.transmission !== 'all' && { transmission: filters.transmission }),
        ...(filters.year !== 'all' && { year: filters.year })
      })

      const response = await fetch(`/api/public/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(page)
        setAvailableFilters(data.filters)
        
        if (onSearch) {
          onSearch(data.results)
        }
      } else {
        toast({
          title: "خطأ في البحث",
          description: "حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error performing search:', error)
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text)
    setIsOpen(false)
    setTimeout(() => handleSearch(), 100)
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: 1000000,
      fuelType: 'all',
      transmission: 'all',
      year: 'all'
    })
  }

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">الفئة</label>
        <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableFilters?.categories.map(category => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">نوع الوقود</label>
        <Select value={filters.fuelType} onValueChange={(value) => updateFilter('fuelType', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableFilters?.fuelTypes.map(fuelType => (
              <SelectItem key={fuelType} value={fuelType.toLowerCase()}>
                {fuelType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">ناقل الحركة</label>
        <Select value={filters.transmission} onValueChange={(value) => updateFilter('transmission', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableFilters?.transmissions.map(transmission => (
              <SelectItem key={transmission} value={transmission.toLowerCase()}>
                {transmission}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">السنة</label>
        <Select value={filters.year} onValueChange={(value) => updateFilter('year', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableFilters?.years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">نطاق السعر</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="الحد الأدنى"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="الحد الأقصى"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <TouchButton onClick={clearFilters} variant="outline" fullWidth>
          مسح الفلاتر
        </TouchButton>
        <TouchButton onClick={() => setShowFilters(false)} fullWidth>
          تطبيق
        </TouchButton>
      </div>
    </div>
  )

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        {result.metadata.primaryImage ? (
          <OptimizedImage
            src={result.metadata.primaryImage}
            alt={result.title}
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <Car className="h-12 w-12 text-gray-600" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-blue-600">
          {result.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{result.title}</h3>
            <p className="text-gray-600 text-sm">{result.metadata.year}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-900">
              {formatPrice(result.metadata.price)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{Math.round(result.relevanceScore * 100)}% تطابق</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">{result.metadata.fuelType}</Badge>
          <Badge variant="secondary" className="text-xs">{result.metadata.transmission}</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {result.description}
        </p>
        <TouchButton size="sm" fullWidth>
          عرض التفاصيل
        </TouchButton>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10 pl-10"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setSearchQuery('')
              setSearchResults([])
              setIsOpen(false)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border max-h-96 overflow-hidden"
        >
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">اقتراحات</span>
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full text-right px-3 py-2 hover:bg-gray-50 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-3 w-3" />
                      <span className="text-sm">{suggestion.text}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${suggestion.popularity}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{suggestion.popularity}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Controls */}
      <div className="flex items-center gap-2">
        {isMobile ? (
          <Drawer open={showFilters} onOpenChange={setShowFilters}>
            <DrawerTrigger asChild>
              <TouchButton variant="outline">
                <Filter className="ml-2 h-4 w-4" />
                فلاتر
              </TouchButton>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>فلاتر البحث</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <FilterContent />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <TouchButton variant="outline">
                <Filter className="ml-2 h-4 w-4" />
                فلاتر
              </TouchButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>فلاتر البحث</DialogTitle>
              </DialogHeader>
              <FilterContent />
            </DialogContent>
          </Dialog>
        )}

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">التطابق</SelectItem>
              <SelectItem value="price">السعر</SelectItem>
              <SelectItem value="year">السنة</SelectItem>
              <SelectItem value="created">الأحدث</SelectItem>
            </SelectContent>
          </Select>
          <TouchButton
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </TouchButton>
        </div>

        <div className="flex items-center gap-1">
          <TouchButton
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </TouchButton>
          <TouchButton
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </TouchButton>
        </div>

        <TouchButton onClick={() => handleSearch()} disabled={loading}>
          {loading ? 'جاري البحث...' : 'بحث'}
        </TouchButton>
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              تم العثور على {searchResults.length} نتيجة
            </p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <TouchButton
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handleSearch(currentPage - 1)}
              >
                السابق
              </TouchButton>
              <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
              <TouchButton
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handleSearch(currentPage + 1)}
              >
                التالي
              </TouchButton>
            </div>
          )}
        </div>
      )}

      {showResults && searchResults.length === 0 && !loading && searchQuery && (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على سيارات تطابق بحثك</p>
          <TouchButton onClick={clearFilters} variant="outline">
            مسح الفلاتر وحاول مرة أخرى
          </TouchButton>
        </div>
      )}
    </div>
  )
}