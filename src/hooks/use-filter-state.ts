'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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

interface UseFilterStateProps {
  defaultFilters?: Partial<Filters>
  persistToLocalStorage?: boolean
  syncWithUrl?: boolean
  storageKey?: string
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  category: 'all',
  fuelType: 'all',
  transmission: 'all',
  minPrice: '',
  maxPrice: '',
  minYear: '',
  maxYear: '',
  minMileage: '',
  maxMileage: '',
  colors: [],
  sortBy: 'price-asc'
}

export function useFilterState({
  defaultFilters = {},
  persistToLocalStorage = true,
  syncWithUrl = true,
  storageKey = 'vehicle-filters'
}: UseFilterStateProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFiltersState] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    ...defaultFilters
  }))

  // Load filters from localStorage and URL on mount
  useEffect(() => {
    const loadFilters = () => {
      let loadedFilters: Partial<Filters> = {}

      // Load from URL parameters
      if (syncWithUrl) {
        const urlFilters: Partial<Filters> = {}
        searchParams.forEach((value, key) => {
          if (key in DEFAULT_FILTERS) {
            if (key === 'colors') {
              urlFilters.colors = value.split(',').filter(Boolean)
            } else {
              urlFilters[key as keyof Filters] = value
            }
          }
        })
        loadedFilters = { ...loadedFilters, ...urlFilters }
      }

      // Load from localStorage
      if (persistToLocalStorage) {
        try {
          const saved = localStorage.getItem(storageKey)
          if (saved) {
            const savedFilters = JSON.parse(saved)
            loadedFilters = { ...loadedFilters, ...savedFilters }
          }
        } catch (error) {
          console.error('Error loading filters from localStorage:', error)
        }
      }

      // Merge with defaults
      const mergedFilters = {
        ...DEFAULT_FILTERS,
        ...defaultFilters,
        ...loadedFilters
      }

      setFiltersState(mergedFilters)
    }

    loadFilters()
  }, [searchParams, persistToLocalStorage, syncWithUrl, storageKey, defaultFilters])

  // Save filters to localStorage and update URL
  const saveFilters = useCallback((newFilters: Filters) => {
    // Save to localStorage
    if (persistToLocalStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters))
      } catch (error) {
        console.error('Error saving filters to localStorage:', error)
      }
    }

    // Update URL
    if (syncWithUrl) {
      const params = new URLSearchParams()
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all' && 
            !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, value.toString())
          }
        }
      })

      const queryString = params.toString()
      const newUrl = queryString ? `?${queryString}` : window.location.pathname
      
      // Update URL without triggering navigation
      window.history.replaceState({}, '', newUrl)
    }
  }, [persistToLocalStorage, syncWithUrl, storageKey])

  const setFilters = useCallback((newFilters: Filters) => {
    setFiltersState(newFilters)
    saveFilters(newFilters)
  }, [saveFilters])

  const updateFilter = useCallback((key: keyof Filters, value: string | string[]) => {
    const newFilters = {
      ...filters,
      [key]: value
    }
    setFilters(newFilters)
  }, [filters, setFilters])

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      ...DEFAULT_FILTERS,
      ...defaultFilters
    }
    setFilters(clearedFilters)
  }, [defaultFilters, setFilters])

  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy') return value !== DEFAULT_FILTERS.sortBy
      if (Array.isArray(value)) return value.length > 0
      return value && value !== '' && value !== 'all'
    })
  }, [filters])

  const getActiveFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy') return value !== DEFAULT_FILTERS.sortBy
      if (Array.isArray(value)) return value.length > 0
      return value && value !== '' && value !== 'all'
    }).length
  }, [filters])

  const getFilterSummary = useCallback(() => {
    const summary: string[] = []
    
    if (filters.search) summary.push(`بحث: ${filters.search}`)
    if (filters.category && filters.category !== 'all') summary.push(`فئة: ${filters.category}`)
    if (filters.fuelType && filters.fuelType !== 'all') summary.push(`وقود: ${filters.fuelType}`)
    if (filters.transmission && filters.transmission !== 'all') summary.push(`ناقل حركة: ${filters.transmission}`)
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || '0'
      const max = filters.maxPrice || '∞'
      summary.push(`السعر: ${min} - ${max}`)
    }
    if (filters.minYear || filters.maxYear) {
      const min = filters.minYear || '0'
      const max = filters.maxYear || '∞'
      summary.push(`السنة: ${min} - ${max}`)
    }
    if (filters.minMileage || filters.maxMileage) {
      const min = filters.minMileage || '0'
      const max = filters.maxMileage || '∞'
      summary.push(`المسافة: ${min} - ${max}`)
    }
    if (filters.colors && filters.colors.length > 0) {
      summary.push(`الألوان: ${filters.colors.join(', ')}`)
    }
    if (filters.sortBy && filters.sortBy !== DEFAULT_FILTERS.sortBy) {
      summary.push(`الترتيب: ${filters.sortBy}`)
    }

    return summary
  }, [filters])

  const shareFilters = useCallback(() => {
    const url = new URL(window.location.href)
    
    // Clear existing params
    url.search = ''
    
    // Add current filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && 
          !(Array.isArray(value) && value.length === 0)) {
        if (Array.isArray(value)) {
          url.searchParams.set(key, value.join(','))
        } else {
          url.searchParams.set(key, value.toString())
        }
      }
    })

    // Copy to clipboard
    navigator.clipboard.writeText(url.toString()).then(() => {
      // You could show a toast notification here
      console.log('Filter URL copied to clipboard')
    }).catch((error) => {
      console.error('Error copying URL to clipboard:', error)
    })
  }, [filters])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getActiveFiltersCount,
    getFilterSummary,
    shareFilters
  }
}