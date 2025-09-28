'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  Car,
  Users,
  Package,
  Calendar,
  X,
  Plus,
  Download
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SearchResult {
  id: string
  type: 'vehicle' | 'customer' | 'booking' | 'inventory_item' | 'supplier'
  title: string
  description: string
  category: string
  relevanceScore: number
  highlights: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface SearchFilter {
  type: string
  category: string
  dateRange: {
    start: string
    end: string
  }
  priceRange: {
    min: number
    max: number
  }
  status: string[]
  tags: string[]
}

interface SearchSuggestion {
  id: string
  text: string
  type: string
  category: string
  frequency: number
}

interface SearchAnalytics {
  totalSearches: number
  popularQueries: Array<{
    query: string
    count: number
  }>
  averageResults: number
  topCategories: Array<{
    category: string
    count: number
  }>
  searchTrends: Array<{
    date: string
    count: number
  }>
}

export default function AdvancedSearchPage() {
  return (
    <AdminRoute>
      <AdvancedSearchContent />
    </AdminRoute>
  )
}

function AdvancedSearchContent() {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [filters, setFilters] = useState<SearchFilter>({
    type: 'all',
    category: 'all',
    dateRange: { start: '', end: '' },
    priceRange: { min: 0, max: 1000000 },
    status: [],
    tags: []
  })
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/search/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: filters.type,
        category: filters.category,
        ...filters.dateRange.start && { startDate: filters.dateRange.start },
        ...filters.dateRange.end && { endDate: filters.dateRange.end },
        ...filters.priceRange.min > 0 && { minPrice: filters.priceRange.min.toString() },
        ...filters.priceRange.max < 1000000 && { maxPrice: filters.priceRange.max.toString() },
        ...(filters.status.length > 0) && { status: filters.status.join(',') },
        ...(filters.tags.length > 0) && { tags: filters.tags.join(',') }
      })

      const response = await fetch(`/api/search/advanced?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform search',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter))
  }

  const getResultIcon = (type: string) => {
    const icons = {
      vehicle: Car,
      customer: Users,
      booking: Calendar,
      inventory_item: Package,
      supplier: Package
    }
    const Icon = icons[type as keyof typeof icons] || Search
    return <Icon className="w-5 h-5" />
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      vehicle: 'مركبة',
      customer: 'عميل',
      booking: 'حجز',
      inventory_item: 'صنف مخزون',
      supplier: 'مورد'
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatRelevanceScore = (score: number) => {
    return Math.round(score * 100)
  }

  const exportResults = () => {
    // Export functionality would be implemented here
    toast({
      title: 'Export Started',
      description: 'Your search results are being exported'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام البحث المتقدم</h1>
          <p className="text-gray-600 mt-2">بحث متقدم مع تصفية وتحليلات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="ml-2 h-4 w-4" />
            تصدير النتائج
          </Button>
        </div>
      </div>

      {/* Search Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي البحوث</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSearches}</div>
              <p className="text-xs text-muted-foreground">
                هذا الشهر
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط النتائج</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageResults}</div>
              <p className="text-xs text-muted-foreground">
                لكل بحث
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أكثر البحوث</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.popularQueries[0]?.query || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.popularQueries[0]?.count || 0} مرة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التصنيف الأعلى</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.topCategories[0]?.category || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.topCategories[0]?.count || 0} نتيجة
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">بحث</TabsTrigger>
          <TabsTrigger value="analytics">تحليلات البحث</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle>بحث متقدم</CardTitle>
              <CardDescription>
                ابحث في جميع بيانات النظام مع خيارات تصفية متقدمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input with Suggestions */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث في المركبات، العملاء، الحجوزات، المخزون..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSearchQuery(suggestion.text)
                            setSuggestions([])
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{suggestion.text}</span>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(suggestion.type)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Filters */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="ml-2 h-4 w-4" />
                    الفلاتر
                  </Button>
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? 'جاري البحث...' : 'بحث'}
                  </Button>
                </div>

                {/* Selected Filters */}
                {selectedFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFilters.map((filter) => (
                      <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                        {filter}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeFilter(filter)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Advanced Filters Panel */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <label className="block text-sm font-medium mb-2">النوع</label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="vehicle">مركبات</SelectItem>
                          <SelectItem value="customer">عملاء</SelectItem>
                          <SelectItem value="booking">حجوزات</SelectItem>
                          <SelectItem value="inventory_item">أصناف المخزون</SelectItem>
                          <SelectItem value="supplier">موردون</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">التصنيف</label>
                      <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الكل</SelectItem>
                          <SelectItem value="sedan">سيدان</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">هاتشباك</SelectItem>
                          <SelectItem value="engine">محرك</SelectItem>
                          <SelectItem value="brakes">فرامل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">نطاق السعر</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="الحد الأدنى"
                          value={filters.priceRange.min}
                          onChange={(e) => setFilters({
                            ...filters,
                            priceRange: {...filters.priceRange, min: Number(e.target.value)}
                          })}
                        />
                        <Input
                          type="number"
                          placeholder="الحد الأقصى"
                          value={filters.priceRange.max}
                          onChange={(e) => setFilters({
                            ...filters,
                            priceRange: {...filters.priceRange, max: Number(e.target.value)}
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">من تاريخ</label>
                      <Input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters({
                          ...filters,
                          dateRange: {...filters.dateRange, start: e.target.value}
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">إلى تاريخ</label>
                      <Input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters({
                          ...filters,
                          dateRange: {...filters.dateRange, end: e.target.value}
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">الحالة</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>نتائج البحث</CardTitle>
                <CardDescription>
                  {searchResults.length} نتيجة لـ "{searchQuery}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{result.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {getTypeLabel(result.type)}
                            </Badge>
                            <Badge variant="secondary">
                              {formatRelevanceScore(result.relevanceScore)}% تطابق
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {result.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            تحديث: {new Date(result.updatedAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        {result.highlights.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">أجزاء متطابقة:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.highlights.map((highlight, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Queries */}
            <Card>
              <CardHeader>
                <CardTitle>أكثر البحوث شيوعاً</CardTitle>
                <CardDescription>
                  البحوث الأكثر تكراراً في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.popularQueries ? (
                  <div className="space-y-2">
                    {analytics.popularQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{query.query}</span>
                        <Badge variant="outline">{query.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">لا توجد بيانات متاحة</p>
                )}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>أهم التصنيفات</CardTitle>
                <CardDescription>
                  التصنيفات الأكثر بحثاً
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.topCategories ? (
                  <div className="space-y-2">
                    {analytics.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{category.category}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">لا توجد بيانات متاحة</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}