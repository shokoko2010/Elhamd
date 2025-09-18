// Simple in-memory cache utility
import { useState, useEffect } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class Cache {
  private cache: Map<string, CacheItem<any>> = new Map()

  // Default TTL values (in milliseconds)
  private static readonly DEFAULT_TTL = {
    STATIC: 30 * 60 * 1000, // 30 minutes for static data
    DYNAMIC: 5 * 60 * 1000, // 5 minutes for dynamic data
    API: 10 * 60 * 1000, // 10 minutes for API responses
  }

  set<T>(key: string, data: T, ttl: number = Cache.DEFAULT_TTL.STATIC): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Convenience methods for different cache types
  setStatic<T>(key: string, data: T): void {
    this.set(key, data, Cache.DEFAULT_TTL.STATIC)
  }

  setDynamic<T>(key: string, data: T): void {
    this.set(key, data, Cache.DEFAULT_TTL.DYNAMIC)
  }

  setApiResponse<T>(key: string, data: T): void {
    this.set(key, data, Cache.DEFAULT_TTL.API)
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let validItems = 0
    let expiredItems = 0

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredItems++
      } else {
        validItems++
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
    }
  }
}

// Export singleton instance
export const cache = new Cache()

// Export a hook for React components
export function useCache<T>(key: string, fetchFn: () => Promise<T>, ttl?: number) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to get from cache first
        const cachedData = cache.get<T>(key)
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return
        }

        // Fetch fresh data
        const freshData = await fetchFn()
        
        // Cache the data
        if (ttl) {
          cache.set(key, freshData, ttl)
        } else {
          cache.setApiResponse(key, freshData)
        }

        setData(freshData)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [key, fetchFn, ttl])

  return { data, loading, error, refetch: () => fetchData() }
}