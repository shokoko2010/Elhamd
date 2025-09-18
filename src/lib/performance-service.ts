import { NextRequest, NextResponse } from 'next/server'

export interface PerformanceConfig {
  caching: {
    enabled: boolean
    defaultTtl: number
    maxSize: number
  }
  compression: {
    enabled: boolean
    threshold: number
  }
  optimization: {
    enabled: boolean
    minify: boolean
    bundle: boolean
  }
  monitoring: {
    enabled: boolean
    sampleRate: number
  }
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

export interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  cpuUsage?: number
  cacheHitRate: number
  errorRate: number
  requestCount: number
}

export class PerformanceService {
  private static instance: PerformanceService
  private config: PerformanceConfig
  private cache: Map<string, CacheEntry<any>> = new Map()
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    errorRate: 0,
    requestCount: 0
  }
  private responseTimes: number[] = []
  private errorCount = 0

  private constructor() {
    this.config = {
      caching: {
        enabled: true,
        defaultTtl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000
      },
      compression: {
        enabled: true,
        threshold: 1024 // 1KB
      },
      optimization: {
        enabled: true,
        minify: true,
        bundle: true
      },
      monitoring: {
        enabled: true,
        sampleRate: 0.1 // 10% of requests
      }
    }

    // Start cleanup interval
    setInterval(() => this.cleanupCache(), 60 * 1000) // Cleanup every minute
    
    // Start metrics collection
    setInterval(() => this.collectMetrics(), 10 * 1000) // Collect every 10 seconds
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService()
    }
    return PerformanceService.instance
  }

  // Caching methods
  get<T>(key: string): T | null {
    if (!this.config.caching.enabled) {
      return null
    }

    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    entry.hits++
    return entry.data
  }

  set<T>(key: string, data: T, ttl: number = this.config.caching.defaultTtl): void {
    if (!this.config.caching.enabled) {
      return
    }

    // Evict least recently used items if cache is full
    if (this.cache.size >= this.config.caching.maxSize) {
      const lruKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].hits - b[1].hits)[0][0]
      this.cache.delete(lruKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Response compression
  compressResponse(response: NextResponse): NextResponse {
    if (!this.config.compression.enabled) {
      return response
    }

    // Next.js automatically handles compression
    // This method can be extended for custom compression logic
    return response
  }

  // Performance monitoring
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordResponseTime(duration)
      return result
    } catch (error) {
      this.recordError()
      throw error
    }
  }

  private recordResponseTime(duration: number): void {
    this.responseTimes.push(duration)
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100)
    }

    this.metrics.responseTime = this.getAverageResponseTime()
  }

  private recordError(): void {
    this.errorCount++
    this.metrics.errorRate = (this.errorCount / Math.max(this.metrics.requestCount, 1)) * 100
  }

  private getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0
    return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
  }

  private collectMetrics(): void {
    const memUsage = process.memoryUsage()
    this.metrics.memoryUsage = memUsage.heapUsed / 1024 / 1024 // MB
    this.metrics.cacheHitRate = this.calculateCacheHitRate()
  }

  private calculateCacheHitRate(): number {
    if (this.cache.size === 0) return 0
    
    const totalHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0)
    const totalRequests = totalHits + this.cache.size // Approximation
    return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0
  }

  // Performance optimization middleware
  async optimizeResponse(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = performance.now()
    this.metrics.requestCount++

    try {
      // Check cache for GET requests
      const cacheKey = this.generateCacheKey(request)
      if (request.method === 'GET') {
        const cachedResponse = this.get(cacheKey)
        if (cachedResponse) {
          const response = NextResponse.json(cachedResponse)
          response.headers.set('X-Cache', 'HIT')
          response.headers.set('X-Response-Time', `${performance.now() - startTime}ms`)
          return this.compressResponse(response)
        }
      }

      // Execute handler
      const response = await handler(request)

      // Cache successful GET responses
      if (request.method === 'GET' && response.status === 200) {
        try {
          const clonedResponse = response.clone()
          const data = await clonedResponse.json()
          this.set(cacheKey, data)
          response.headers.set('X-Cache', 'MISS')
        } catch (error) {
          // Ignore caching errors
        }
      }

      // Add performance headers
      const endTime = performance.now()
      const duration = endTime - startTime
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Memory-Usage', `${this.metrics.memoryUsage}MB`)
      response.headers.set('X-Cache-Hit-Rate', `${this.metrics.cacheHitRate.toFixed(2)}%`)

      // Apply compression
      const optimizedResponse = this.compressResponse(response)

      // Record metrics
      this.recordResponseTime(duration)

      return optimizedResponse
    } catch (error) {
      this.recordError()
      throw error
    }
  }

  private generateCacheKey(request: NextRequest): string {
    const url = new URL(request.url)
    const key = `${request.method}:${url.pathname}${url.search}`
    
    // Add user-specific cache key if authenticated
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      return `${key}:${authHeader}`
    }
    
    return key
  }

  // Database query optimization
  optimizeQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    ttl: number = this.config.caching.defaultTtl
  ): Promise<T> {
    const cacheKey = `query:${queryName}`
    
    const cached = this.get<T>(cacheKey)
    if (cached) {
      return Promise.resolve(cached)
    }

    return queryFn().then(result => {
      this.set(cacheKey, result, ttl)
      return result
    })
  }

  // Image optimization utilities
  optimizeImageUrl(
    url: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'png'
    } = {}
  ): string {
    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)

    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  // Bundle optimization utilities
  getOptimizedBundlePath(bundleName: string): string {
    if (!this.config.optimization.enabled) {
      return `/static/js/${bundleName}.js`
    }

    // Return optimized bundle path
    return `/static/js/${bundleName}.min.js`
  }

  // Performance monitoring
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getDetailedMetrics(): {
    metrics: PerformanceMetrics
    cacheStats: {
      size: number
      hitRate: number
      averageTtl: number
    }
    responseTimeStats: {
      average: number
      min: number
      max: number
      p95: number
    }
  } {
    const cacheStats = {
      size: this.cache.size,
      hitRate: this.metrics.cacheHitRate,
      averageTtl: this.calculateAverageTtl()
    }

    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b)
    const responseTimeStats = {
      average: this.metrics.responseTime,
      min: sortedTimes[0] || 0,
      max: sortedTimes[sortedTimes.length - 1] || 0,
      p95: this.calculatePercentile(sortedTimes, 95)
    }

    return {
      metrics: this.metrics,
      cacheStats,
      responseTimeStats
    }
  }

  private calculateAverageTtl(): number {
    if (this.cache.size === 0) return 0
    
    const totalTtl = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.ttl, 0)
    return totalTtl / this.cache.size
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))]
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: PerformanceMetrics
    checks: {
      cache: boolean
      memory: boolean
      responseTime: boolean
    }
  }> {
    const checks = {
      cache: this.cache.size < this.config.caching.maxSize,
      memory: this.metrics.memoryUsage < 500, // Less than 500MB
      responseTime: this.metrics.responseTime < 1000 // Less than 1 second
    }

    const failedChecks = Object.values(checks).filter(check => !check).length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (failedChecks >= 2) {
      status = 'unhealthy'
    } else if (failedChecks >= 1) {
      status = 'degraded'
    }

    return {
      status,
      metrics: this.metrics,
      checks
    }
  }
}

// Utility functions
export const performanceUtils = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>()
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      
      if (cache.has(key)) {
        return cache.get(key)!
      }
      
      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  },

  lazyLoad: <T>(
    loader: () => Promise<T>,
    options: {
      timeout?: number
      retryCount?: number
    } = {}
  ): () => Promise<T> => {
    let cachedPromise: Promise<T> | null = null
    
    return () => {
      if (cachedPromise) {
        return cachedPromise
      }
      
      cachedPromise = loader()
        .catch(error => {
          cachedPromise = null
          throw error
        })
      
      return cachedPromise
    }
  }
}