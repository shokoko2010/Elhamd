'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, Clock, TrendingUp, Car } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SearchSuggestion {
  id: string
  text: string
  type: 'make' | 'model' | 'category' | 'fuel' | 'transmission'
  count?: number
  popularity?: number
}

interface RecentSearch {
  id: string
  query: string
  timestamp: number
  results?: number
}

interface EnhancedSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  showSuggestions?: boolean
  showRecentSearches?: boolean
  maxSuggestions?: number
}

export function EnhancedSearch({
  value,
  onChange,
  onSearch,
  placeholder = "ابحث عن سيارة...",
  className = "",
  showSuggestions = true,
  showRecentSearches = true,
  maxSuggestions = 8
}: EnhancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      try {
        const saved = localStorage.getItem('recentVehicleSearches')
        if (saved) {
          const searches = JSON.parse(saved)
          // Keep only last 10 searches, sorted by timestamp
          setRecentSearches(searches.slice(0, 10).sort((a: any, b: any) => b.timestamp - a.timestamp))
        }
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [showRecentSearches])

  // Save search to recent searches
  const saveToRecentSearches = useCallback((query: string, resultsCount?: number) => {
    if (!showRecentSearches || !query.trim()) return

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
      results: resultsCount
    }

    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(search => search.query.toLowerCase() !== query.toLowerCase())
      // Add new search to beginning
      const updated = [newSearch, ...filtered].slice(0, 10)
      
      // Save to localStorage
      try {
        localStorage.setItem('recentVehicleSearches', JSON.stringify(updated))
      } catch (error) {
        console.error('Error saving recent searches:', error)
      }
      
      return updated
    })
  }, [showRecentSearches])

  // Fetch suggestions based on input
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/vehicles/suggestions?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        // Fallback to local suggestions if API fails
        const fallbackSuggestions: SearchSuggestion[] = [
          { id: '1', text: 'تاتا نيكسون', type: 'model', popularity: 95 },
          { id: '2', text: 'تاتا بانش', type: 'model', popularity: 88 },
          { id: '3', text: 'تاتا تياجو', type: 'model', popularity: 82 },
          { id: '4', text: 'SUV', type: 'category', count: 15 },
          { id: '5', text: 'سيدان', type: 'category', count: 12 },
          { id: '6', text: 'بنزين', type: 'fuel', count: 20 },
          { id: '7', text: 'أوتوماتيك', type: 'transmission', count: 18 }
        ].filter(suggestion => 
          suggestion.text.toLowerCase().includes(query.toLowerCase())
        ).slice(0, maxSuggestions)
        
        setSuggestions(fallbackSuggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [showSuggestions, maxSuggestions])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && isOpen) {
        fetchSuggestions(value)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value, isOpen, fetchSuggestions])

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    const totalItems = [...suggestions, ...recentSearches].length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          const allItems = [...recentSearches, ...suggestions]
          const selectedItem = allItems[highlightedIndex]
          if (selectedItem) {
            if ('query' in selectedItem) {
              handleSearch(selectedItem.query)
            } else {
              handleSearch(selectedItem.text)
            }
          }
        } else {
          handleSearch(value)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) return

    onChange(query)
    onSearch(query)
    setIsOpen(false)
    setHighlightedIndex(-1)
    saveToRecentSearches(query)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text)
  }

  const handleRecentSearchClick = (search: RecentSearch) => {
    handleSearch(search.query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem('recentVehicleSearches')
      toast({
        title: "تم مسح البحوث الحديثة",
        description: "تم حذف جميع البحوث الحديثة بنجاح"
      })
    } catch (error) {
      console.error('Error clearing recent searches:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'make':
      case 'model':
        return <Car className="h-3 w-3" />
      case 'category':
        return <Car className="h-3 w-3" />
      default:
        return <Search className="h-3 w-3" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'make': return 'ماركة'
      case 'model': return 'موديل'
      case 'category': return 'فئة'
      case 'fuel': return 'وقود'
      case 'transmission': return 'ناقل حركة'
      default: return ''
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10 pl-10"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || recentSearches.length > 0) && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border max-h-96 overflow-hidden"
        >
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="border-b">
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">البحوث الحديثة</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearRecentSearches}
                    >
                      مسح الكل
                    </Button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={search.id}
                      className={`w-full text-right px-3 py-2 hover:bg-gray-50 transition-colors ${
                        highlightedIndex === index ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{search.query}</span>
                        {search.results && (
                          <Badge variant="secondary" className="text-xs">
                            {search.results} نتيجة
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">اقتراحات</span>
                  </div>
                  {suggestions.map((suggestion, index) => {
                    const globalIndex = recentSearches.length + index
                    return (
                      <button
                        key={suggestion.id}
                        className={`w-full text-right px-3 py-2 hover:bg-gray-50 transition-colors ${
                          highlightedIndex === globalIndex ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(suggestion.type)}
                            <span className="text-sm">{suggestion.text}</span>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(suggestion.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {suggestion.count && (
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.count}
                              </Badge>
                            )}
                            {suggestion.popularity && (
                              <div className="flex items-center gap-1">
                                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${suggestion.popularity}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{suggestion.popularity}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="p-3 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    جاري تحميل الاقتراحات...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}