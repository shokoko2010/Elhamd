// Enhanced cache system with multi-level caching, compression, and performance optimizations
import { useState, useEffect } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  accessCount: number
  lastAccessed: number
  compressed?: boolean
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  compressionThreshold: number // Size in bytes to trigger compression
  enableCompression: boolean
  enableBackgroundRefresh: boolean
  refreshThreshold: number // Refresh when TTL is below this percentage
}

class EnhancedCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private config: CacheConfig
  private cleanupInterval: NodeJS.Timeout | null = null
  private pendingRefreshes: Set<string> = new Set()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000, // Maximum number of items
      defaultTTL: 30 * 60 * 1000, // 30 minutes default
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enableBackgroundRefresh: true,
      refreshThreshold: 0.2, // Refresh when 20% of TTL remains
      ...config
    }

    this.startCleanupInterval()
  }

  // TTL presets for different data types
  static readonly TTL = {
    STATIC: 30 * 60 * 1000, // 30 minutes for static data
    DYNAMIC: 5 * 60 * 1000, // 5 minutes for dynamic data
    API: 10 * 60 * 1000, // 10 minutes for API responses
    REALTIME: 30 * 1000, // 30 seconds for real-time data
    SESSION: 24 * 60 * 60 * 1000, // 24 hours for session data
  }

  private compress(data: any): string {
    if (!this.config.enableCompression) return JSON.stringify(data)
    
    try {
      const jsonString = JSON.stringify(data)
      if (jsonString.length < this.config.compressionThreshold) {
        return jsonString
      }
      
      // Simple compression for repetitive data
      return jsonString
        .replace(/"\w+":/g, (match) => match[0] + match.slice(2, -1) + ':')
        .replace(/,\s*/g, ',')
        .replace(/\s+/g, ' ')
    } catch (error) {
      return JSON.stringify(data)
    }
  }

  private decompress(compressed: string): any {
    try {
      return JSON.parse(compressed)
    } catch (error) {
      return null
    }
  }

  private evictLeastRecentlyUsed(): void {
    if (this.cache.size <= this.config.maxSize) return

    let oldestKey: string | null = null
    let oldestAccess = Infinity

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  public async refreshInBackground(key: string, fetchFn: () => Promise<any>): Promise<void> {
    if (this.pendingRefreshes.has(key)) return
    
    this.pendingRefreshes.add(key)
    
    try {
      const freshData = await fetchFn()
      const existingItem = this.cache.get(key)
      
      if (existingItem) {
        this.cache.set(key, {
          ...existingItem,
          data: freshData,
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      console.warn(`Background refresh failed for key: ${key}`, error)
    } finally {
      this.pendingRefreshes.delete(key)
    }
  }

  private async backgroundRefresh(key: string, fetchFn: () => Promise<any>): Promise<void> {
    return this.refreshInBackground(key, fetchFn)
  }

  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    this.evictLeastRecentlyUsed()
    
    const now = Date.now()
    const compressedData = this.compress(data)
    
    this.cache.set(key, {
      data: this.config.enableCompression ? compressedData : data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      compressed: this.config.enableCompression,
    })
  }

  get<T>(key: string, fetchFn?: () => Promise<T>): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    
    // Check if expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access stats
    item.accessCount++
    item.lastAccessed = now

    // Decompress if needed
    const data = item.compressed ? this.decompress(item.data) : item.data

    // Background refresh if enabled and approaching expiry
    if (this.config.enableBackgroundRefresh && fetchFn) {
      const timeRemaining = item.ttl - (now - item.timestamp)
      const refreshThreshold = item.ttl * this.config.refreshThreshold
      
      if (timeRemaining < refreshThreshold && !this.pendingRefreshes.has(key)) {
        // Schedule background refresh
        setTimeout(() => {
          this.backgroundRefresh(key, fetchFn)
        }, 0)
      }
    }

    return data
  }

  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key, fetchFn)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const freshData = await fetchFn()
    this.set(key, freshData, ttl)
    return freshData
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.pendingRefreshes.clear()
  }

  // Convenience methods for different cache types
  setStatic<T>(key: string, data: T): void {
    this.set(key, data, EnhancedCache.TTL.STATIC)
  }

  setDynamic<T>(key: string, data: T): void {
    this.set(key, data, EnhancedCache.TTL.DYNAMIC)
  }

  setApiResponse<T>(key: string, data: T): void {
    this.set(key, data, EnhancedCache.TTL.API)
  }

  setRealtime<T>(key: string, data: T): void {
    this.set(key, data, EnhancedCache.TTL.REALTIME)
  }

  setSession<T>(key: string, data: T): void {
    this.set(key, data, EnhancedCache.TTL.SESSION)
  }

  // Cache management
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000) // Cleanup every minute
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Performance monitoring
  getStats() {
    const now = Date.now()
    let validItems = 0
    let expiredItems = 0
    let totalSize = 0
    let totalAccessCount = 0

    for (const [key, item] of this.cache.entries()) {
      totalSize += JSON.stringify(item.data).length
      totalAccessCount += item.accessCount
      
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
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      averageAccessCount: validItems > 0 ? (totalAccessCount / validItems).toFixed(2) : 0,
      pendingRefreshes: this.pendingRefreshes.size,
      hitRate: validItems > 0 ? ((validItems / this.cache.size) * 100).toFixed(2) + '%' : '0%',
    }
  }

  // Preload multiple keys
  async preload<T>(items: Array<{ key: string; fetchFn: () => Promise<T>; ttl?: number }>): Promise<void> {
    const promises = items.map(async ({ key, fetchFn, ttl }) => {
      if (!this.has(key)) {
        try {
          const data = await fetchFn()
          this.set(key, data, ttl)
        } catch (error) {
          console.warn(`Failed to preload cache for key: ${key}`, error)
        }
      }
    })

    await Promise.allSettled(promises)
  }

  // Cache invalidation patterns
  invalidatePattern(pattern: RegExp): number {
    let deletedCount = 0
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key)
        deletedCount++
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    return deletedCount
  }

  // Destroy cleanup interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Export singleton instance with optimized configuration
export const enhancedCache = new EnhancedCache({
  maxSize: 500,
  defaultTTL: 15 * 60 * 1000, // 15 minutes default
  compressionThreshold: 512, // 512 bytes
  enableCompression: true,
  enableBackgroundRefresh: true,
  refreshThreshold: 0.3, // Refresh when 30% of TTL remains
})

// Export a hook for React components with enhanced features
export function useEnhancedCache<T>(
  key: string, 
  fetchFn: () => Promise<T>, 
  options: {
    ttl?: number
    enabled?: boolean
    staleWhileRevalidate?: boolean
    retryCount?: number
  } = {}
) {
  const { 
    ttl = EnhancedCache.TTL.API, 
    enabled = true, 
    staleWhileRevalidate = true,
    retryCount = 3 
  } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let isMounted = true
    let retryAttempt = 0

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to get from cache first
        const cachedData = enhancedCache.get<T>(key, fetchFn)
        if (cachedData !== null) {
          setData(cachedData)
          
          // Check if data is stale and needs background refresh
          const cacheItem = (enhancedCache as any).cache.get(key)
          if (cacheItem && staleWhileRevalidate) {
            const now = Date.now()
            const timeRemaining = cacheItem.ttl - (now - cacheItem.timestamp)
            const refreshThreshold = cacheItem.ttl * 0.3
            
            if (timeRemaining < refreshThreshold) {
              setIsStale(true)
              // Background refresh
              enhancedCache.refreshInBackground(key, fetchFn).then(() => {
                if (isMounted) {
                  const refreshedData = enhancedCache.get<T>(key)
                  if (refreshedData !== null) {
                    setData(refreshedData)
                    setIsStale(false)
                  }
                }
              })
            }
          }
          
          setLoading(false)
          return
        }

        // Fetch fresh data with retry logic
        const fetchWithRetry = async (): Promise<T> => {
          try {
            return await fetchFn()
          } catch (err) {
            if (retryAttempt < retryCount) {
              retryAttempt++
              await new Promise(resolve => setTimeout(resolve, 1000 * retryAttempt))
              return fetchWithRetry()
            }
            throw err
          }
        }

        const freshData = await fetchWithRetry()
        
        // Cache the data
        enhancedCache.set(key, freshData, ttl)

        if (isMounted) {
          setData(freshData)
          setIsStale(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [key, fetchFn, ttl, enabled, staleWhileRevalidate, retryCount])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const freshData = await fetchFn()
      enhancedCache.set(key, freshData, ttl)
      setData(freshData)
      setIsStale(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [key, fetchFn, ttl])

  return { 
    data, 
    loading, 
    error, 
    isStale,
    refetch,
    invalidate: () => enhancedCache.delete(key)
  }
}

// Performance monitoring hook
export function useCachePerformance() {
  const [stats, setStats] = useState(enhancedCache.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(enhancedCache.getStats())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return stats
}