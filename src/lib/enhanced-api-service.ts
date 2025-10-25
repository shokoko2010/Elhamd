// Enhanced API service with performance optimizations, batching, retry logic, and monitoring
import { useState, useEffect } from 'react'
import { enhancedCache } from './enhanced-cache'

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  cacheKey?: string
  cacheTTL?: number
  retryCount?: number
  timeout?: number
  abortController?: AbortController
  priority?: 'high' | 'normal' | 'low'
}

interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  cached: boolean
  duration: number
}

interface BatchRequest {
  id: string
  url: string
  config: ApiRequestConfig
  resolve: (value: ApiResponse) => void
  reject: (reason: any) => void
}

interface PerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  cacheHitRate: number
  bandwidthSaved: number
}

class EnhancedApiService {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private requestQueue: BatchRequest[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private metrics: PerformanceMetrics
  private activeRequests: Map<string, AbortController> = new Map()
  private retryDelays: number[] = [1000, 2000, 4000, 8000] // Exponential backoff
  private maxConcurrentRequests: number = 6
  private requestPriorities: Map<string, 'high' | 'normal' | 'low'> = new Map()

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      bandwidthSaved: 0,
    }
    
    this.startBatchProcessor()
    this.startMetricsReporter()
  }

  // Main request method with all optimizations
  async request<T = any>(
    url: string, 
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now()
    const requestId = this.generateRequestId()
    
    // Update metrics
    this.metrics.totalRequests++

    // Check cache first
    if (config.cacheKey) {
      const cachedData = enhancedCache.get<ApiResponse<T>>(config.cacheKey)
      if (cachedData) {
        this.metrics.bandwidthSaved += JSON.stringify(cachedData.data).length
        return {
          ...cachedData,
          cached: true,
          duration: performance.now() - startTime,
        }
      }
    }

    // Priority handling
    if (config.priority) {
      this.requestPriorities.set(requestId, config.priority)
    }

    // Abort controller for request cancellation
    const abortController = config.abortController || new AbortController()
    this.activeRequests.set(requestId, abortController)

    try {
      // Add to batch queue or execute immediately for high priority
      if (config.priority === 'high' || this.requestQueue.length === 0) {
        const response = await this.executeRequest<T>(url, config, abortController, startTime)
        return response
      } else {
        // Add to batch queue
        return new Promise((resolve, reject) => {
          this.requestQueue.push({
            id: requestId,
            url,
            config,
            resolve,
            reject,
          })
          
          // Reset batch timeout
          if (this.batchTimeout) {
            clearTimeout(this.batchTimeout)
          }
          
          this.batchTimeout = setTimeout(() => {
            this.processBatch()
          }, config.priority === 'low' ? 100 : 50) // Longer delay for low priority
        })
      }
    } finally {
      this.activeRequests.delete(requestId)
      this.requestPriorities.delete(requestId)
    }
  }

  // Execute individual request with retry logic
  private async executeRequest<T>(
    url: string, 
    config: ApiRequestConfig, 
    abortController: AbortController,
    startTime: number
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.baseUrl + url
    const retryCount = config.retryCount || 3
    const timeout = config.timeout || (config.priority === 'high' ? 5000 : 10000)

    let lastError: any = null

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await this.fetchWithTimeout<T>(
          fullUrl,
          {
            method: config.method || 'GET',
            headers: { ...this.defaultHeaders, ...config.headers },
            body: config.body,
            signal: abortController.signal,
          },
          timeout
        )

        // Cache successful responses
        if (config.cacheKey && response.status < 400) {
          enhancedCache.set(config.cacheKey, response, config.cacheTTL || 300000) // 5 minutes default
        }

        // Update metrics
        this.metrics.successfulRequests++
        const duration = performance.now() - startTime
        this.updateAverageResponseTime(duration)

        return {
          ...response,
          cached: false,
          duration,
        }
      } catch (error) {
        lastError = error
        
        // Don't retry on abort or certain status codes
        if (error.name === 'AbortError' || 
            (error.response && [400, 401, 403, 404].includes(error.response.status))) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < retryCount) {
          const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)]
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // Update metrics for failed request
    this.metrics.failedRequests++
    throw lastError
  }

  // Fetch with timeout
  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Omit<ApiResponse<T>, 'cached' | 'duration'>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.response = response
        throw error
      }

      const data = await response.json()

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // Batch processing for multiple requests
  private async processBatch(): Promise<void> {
    if (this.requestQueue.length === 0) return

    const batch = [...this.requestQueue]
    this.requestQueue = []

    // Sort by priority
    batch.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      const aPriority = this.requestPriorities.get(a.id) || 'normal'
      const bPriority = this.requestPriorities.get(b.id) || 'normal'
      return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder]
    })

    // Process requests in parallel with concurrency limit
    const concurrency = Math.min(this.maxConcurrentRequests, batch.length)
    const chunks = this.chunkArray(batch, concurrency)

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(async (batchRequest) => {
          try {
            const startTime = performance.now()
            const response = await this.executeRequest(
              batchRequest.url,
              batchRequest.config,
              new AbortController(),
              startTime
            )
            batchRequest.resolve(response)
          } catch (error) {
            batchRequest.reject(error)
          }
        })
      )
    }
  }

  // Utility functions
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateAverageResponseTime(newDuration: number): void {
    const total = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1)
    this.metrics.averageResponseTime = (total + newDuration) / this.metrics.successfulRequests
  }

  private startBatchProcessor(): void {
    // Process batch every 100ms max
    setInterval(() => {
      if (this.requestQueue.length > 0) {
        this.processBatch()
      }
    }, 100)
  }

  private startMetricsReporter(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics()
    }, 30000)
  }

  private reportMetrics(): void {
    const cacheStats = enhancedCache.getStats()
    this.metrics.cacheHitRate = parseFloat(cacheStats.hitRate) || 0

    console.log('API Service Metrics:', {
      ...this.metrics,
      activeRequests: this.activeRequests.size,
      queueSize: this.requestQueue.length,
      cacheStats,
    })
  }

  // Public utility methods
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  cancelRequest(requestId: string): boolean {
    const controller = this.activeRequests.get(requestId)
    if (controller) {
      controller.abort()
      this.activeRequests.delete(requestId)
      return true
    }
    return false
  }

  cancelAllRequests(): void {
    for (const controller of this.activeRequests.values()) {
      controller.abort()
    }
    this.activeRequests.clear()
    this.requestQueue = []
  }

  clearCache(): void {
    enhancedCache.clear()
  }

  // Convenience methods
  async get<T = any>(url: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T = any>(url: string, body: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body })
  }

  async put<T = any>(url: string, body: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body })
  }

  async delete<T = any>(url: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  async patch<T = any>(url: string, body: any, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body })
  }

  // Prefetch multiple endpoints
  async prefetch<T = any>(requests: Array<{ url: string; config: ApiRequestConfig }>): Promise<void> {
    const promises = requests.map(({ url, config }) => 
      this.get<T>(url, { ...config, priority: 'low' }).catch(() => {
        // Silently fail prefetch requests
      })
    )
    
    await Promise.allSettled(promises)
  }

  // Health check
  async healthCheck(url: string = '/health'): Promise<boolean> {
    try {
      const response = await this.get(url, { 
        timeout: 5000, 
        priority: 'high',
        retryCount: 1 
      })
      return response.status === 200
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const apiService = new EnhancedApiService()

// Export React hook for API calls
export function useApi<T = any>() {
  const request = async (
    url: string, 
    config: ApiRequestConfig = {}
  ): Promise<{ data: T | null; loading: boolean; error: Error | null }> => {
    try {
      const response = await apiService.request<T>(url, config)
      return {
        data: response.data,
        loading: false,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  }

  return { request }
}

// Export hook for API metrics
export function useApiMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(apiService.getMetrics())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(apiService.getMetrics())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return metrics
}