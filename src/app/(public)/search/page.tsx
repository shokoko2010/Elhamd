'use client'

import { useState, useEffect } from 'react'
import { AdvancedPublicSearch } from '@/components/search/AdvancedPublicSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/mobile-button'
import { Car, Filter, Grid, List, ArrowUpDown, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { TouchButton } from '@/components/ui/enhanced-mobile-optimization'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

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

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()
  const isMobile = useIsMobile()

  // Get search query from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [])

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results)
  }

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
        {result.relevanceScore > 0.8 && (
          <Badge className="absolute top-2 right-2 bg-green-600">
            تطابق عالي
          </Badge>
        )}
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
          <Badge variant="outline" className="text-xs">{result.metadata.status}</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {result.description}
        </p>
        <div className="flex gap-2">
          <Link href={`/vehicles/${result.id}`} className="flex-1">
            <TouchButton size="sm" fullWidth>
              عرض التفاصيل
            </TouchButton>
          </Link>
          <Link href={`/booking?vehicleId=${result.id}`} className="flex-1">
            <TouchButton size="sm" variant="outline" fullWidth>
              احجز الآن
            </TouchButton>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">بحث متقدم</h1>
              <p className="text-gray-600">ابحث عن السيارة المثالية من بين مئات الخيارات</p>
            </div>
          </div>
          
          {/* Compact Search Bar */}
          <AdvancedPublicSearch 
            placeholder="ابحث عن سيارة..."
            className="max-w-2xl"
            showResults={false}
            onSearch={handleSearchResults}
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {searchResults.length > 0 ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">نتائج البحث</h2>
                <p className="text-gray-600">
                  تم العثور على {searchResults.length} سيارة{searchQuery && ` لـ "${searchQuery}"`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
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
              </div>
            </div>

            {/* Results Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'ابدأ البحث عن سيارتك'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'لم نجد سيارات تطابق معايير بحثك. جرب تعديل الفلاتر أو البحث بكلمات مختلفة.'
                : 'استخدم شريط البحث أعلاه للعثور على السيارة المثالية من بين تشكيلتنا الواسعة.'
              }
            </p>
            
            {/* Quick Search Suggestions */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">اقتراحات للبحث</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {['تاتا نيكسون', 'تاتا بانش', 'تاتا تياجو', 'SUV', 'سيدان', 'أوتوماتيك'].map((suggestion) => (
                  <TouchButton
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
                      if (searchInput) {
                        searchInput.value = suggestion
                        searchInput.dispatchEvent(new Event('input'))
                        searchInput.focus()
                      }
                    }}
                  >
                    {suggestion}
                  </TouchButton>
                ))}
              </div>
            </div>

            {/* Browse by Category */}
            <div className="mt-12 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-6">تصفح حسب الفئة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'SUV', icon: '🚙', description: 'سيارات الدفع الرباعي' },
                  { name: 'سيدان', icon: '🚗', description: 'سيارات السيدان الأنيقة' },
                  { name: 'هاتشباك', icon: '🚕', description: 'سيارات الهاتشباك العملية' }
                ].map((category) => (
                  <Link key={category.name} href={`/vehicles?category=${category.name.toLowerCase()}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <h4 className="font-semibold mb-1">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}