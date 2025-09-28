import { NextRequest, NextResponse } from 'next/server'
import { PerformanceService } from './performance-service'

export interface EnhancedPerformanceConfig {
  caching: {
    enabled: boolean
    defaultTtl: number
    maxSize: number
    strategies: {
      api: boolean
      static: boolean
      database: boolean
      image: boolean
    }
  }
  compression: {
    enabled: boolean
    threshold: number
    types: string[]
  }
  optimization: {
    enabled: boolean
    minify: boolean
    bundle: boolean
    lazyLoad: boolean
    prefetch: boolean
  }
  monitoring: {
    enabled: boolean
    sampleRate: number
    realTimeMetrics: boolean
    alerting: boolean
  }
  cdn: {
    enabled: boolean
    url?: string
    fallback: boolean
  }
}

export interface PerformanceAnalytics {
  pageLoad: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
    timeToInteractive: number
  }
  network: {
    requestCount: number
    totalSize: number
    cachedRequests: number
    compressionRatio: number
  }
  userExperience: {
    bounceRate: number
    sessionDuration: number
    pagesPerSession: number
  }
  system: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    uptime: number
  }
}

export class EnhancedPerformanceService {
  private static instance: EnhancedPerformanceService
  private config: EnhancedPerformanceConfig
  private performanceService: PerformanceService
  private analytics: PerformanceAnalytics
  private alerts: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: Date
    resolved: boolean
  }> = []

  private constructor() {
    this.performanceService = PerformanceService.getInstance()
    this.config = this.getDefaultConfig()
    this.analytics = this.getDefaultAnalytics()
    
    // Initialize monitoring
    this.initializeMonitoring()
  }

  static getInstance(): EnhancedPerformanceService {
    if (!EnhancedPerformanceService.instance) {
      EnhancedPerformanceService.instance = new EnhancedPerformanceService()
    }
    return EnhancedPerformanceService.instance
  }

  private getDefaultConfig(): EnhancedPerformanceConfig {
    return {
      caching: {
        enabled: true,
        defaultTtl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000,
        strategies: {
          api: true,
          static: true,
          database: true,
          image: true
        }
      },
      compression: {
        enabled: true,
        threshold: 1024, // 1KB
        types: ['text/html', 'text/css', 'application/javascript', 'application/json']
      },
      optimization: {
        enabled: true,
        minify: true,
        bundle: true,
        lazyLoad: true,
        prefetch: true
      },
      monitoring: {
        enabled: true,
        sampleRate: 0.1, // 10% of requests
        realTimeMetrics: true,
        alerting: true
      },
      cdn: {
        enabled: false,
        fallback: true
      }
    }
  }

  private getDefaultAnalytics(): PerformanceAnalytics {
    return {
      pageLoad: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0
      },
      network: {
        requestCount: 0,
        totalSize: 0,
        cachedRequests: 0,
        compressionRatio: 0
      },
      userExperience: {
        bounceRate: 0,
        sessionDuration: 0,
        pagesPerSession: 0
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0
      }
    }
  }

  private initializeMonitoring(): void {
    if (!this.config.monitoring.enabled) return

    // Collect performance metrics every 30 seconds
    setInterval(() => this.collectMetrics(), 30 * 1000)
    
    // Check for performance alerts every minute
    setInterval(() => this.checkAlerts(), 60 * 1000)
    
    // Cleanup old alerts every hour
    setInterval(() => this.cleanupAlerts(), 60 * 60 * 1000)
  }

  // Enhanced response optimization
  async optimizeResponse(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = performance.now()
    
    try {
      // Apply CDN if enabled
      if (this.config.cdn.enabled && this.config.cdn.url) {
        const cdnResponse = await this.serveFromCDN(request)
        if (cdnResponse) {
          return cdnResponse
        }
      }

      // Use existing performance service optimization
      const response = await this.performanceService.optimizeResponse(request, handler)

      // Apply additional optimizations
      const optimizedResponse = await this.applyAdditionalOptimizations(response, request)

      // Record metrics
      await this.recordRequestMetrics(request, optimizedResponse, startTime)

      return optimizedResponse
    } catch (error) {
      await this.recordError(error as Error)
      throw error
    }
  }

  private async serveFromCDN(request: NextRequest): Promise<NextResponse | null> {
    // Placeholder for CDN serving logic
    // In a real implementation, this would check if the resource exists in CDN
    return null
  }

  private async applyAdditionalOptimizations(
    response: NextResponse,
    request: NextRequest
  ): Promise<NextResponse> {
    const optimizedResponse = response.clone()

    // Add performance headers
    optimizedResponse.headers.set('X-Performance-Optimized', 'true')
    optimizedResponse.headers.set('X-Cache-Strategy', this.config.caching.enabled ? 'enabled' : 'disabled')
    optimizedResponse.headers.set('X-Compression-Enabled', this.config.compression.enabled.toString())

    // Add lazy loading hints for images
    if (this.config.optimization.lazyLoad) {
      optimizedResponse.headers.set('X-Lazy-Loading', 'enabled')
    }

    // Add prefetch hints
    if (this.config.optimization.prefetch) {
      optimizedResponse.headers.set('X-Prefetch-Enabled', 'enabled')
    }

    return optimizedResponse
  }

  private async recordRequestMetrics(
    request: NextRequest,
    response: NextResponse,
    startTime: number
  ): Promise<void> {
    if (!this.config.monitoring.enabled) return

    const duration = performance.now() - startTime
    const url = new URL(request.url)
    
    // Update network metrics
    this.analytics.network.requestCount++
    
    // Simulate size calculation (in real implementation, this would be actual)
    const estimatedSize = this.estimateResponseSize(response)
    this.analytics.network.totalSize += estimatedSize

    // Check if response was cached
    const cacheHeader = response.headers.get('X-Cache')
    if (cacheHeader === 'HIT') {
      this.analytics.network.cachedRequests++
    }

    // Update page load metrics (simplified)
    if (url.pathname === '/') {
      this.analytics.pageLoad.firstContentfulPaint = duration * 0.3
      this.analytics.pageLoad.largestContentfulPaint = duration * 0.8
      this.analytics.pageLoad.timeToInteractive = duration
    }
  }

  private estimateResponseSize(response: NextResponse): number {
    // Simplified size estimation
    // In real implementation, this would calculate actual response size
    return 1024 // Default 1KB estimate
  }

  private async recordError(error: Error): Promise<void> {
    if (!this.config.monitoring.enabled) return

    // Log error for performance analysis
    console.error('Performance Service Error:', error)
    
    // Create alert for critical errors
    if (this.config.monitoring.alerting) {
      this.createAlert('error', 'high', `Performance error: ${error.message}`)
    }
  }

  private collectMetrics(): void {
    if (!this.config.monitoring.enabled) return

    // Collect system metrics
    const memUsage = process.memoryUsage()
    this.analytics.system.memoryUsage = memUsage.heapUsed / 1024 / 1024 // MB
    this.analytics.system.uptime = process.uptime()

    // Calculate compression ratio
    if (this.analytics.network.requestCount > 0) {
      const compressionSavings = this.analytics.network.cachedRequests * 0.7 // 70% savings for cached requests
      this.analytics.network.compressionRatio = compressionSavings / this.analytics.network.totalSize
    }

    // Collect user experience metrics (simplified)
    // In real implementation, this would come from analytics service
    this.analytics.userExperience.bounceRate = Math.random() * 0.5 // 0-50%
    this.analytics.userExperience.sessionDuration = Math.random() * 300 + 60 // 1-6 minutes
    this.analytics.userExperience.pagesPerSession = Math.random() * 3 + 1 // 1-4 pages
  }

  private checkAlerts(): void {
    if (!this.config.monitoring.alerting) return

    // Check for performance issues
    if (this.analytics.system.memoryUsage > 500) {
      this.createAlert('memory', 'high', `High memory usage: ${this.analytics.system.memoryUsage}MB`)
    }

    if (this.analytics.pageLoad.firstContentfulPaint > 3000) {
      this.createAlert('performance', 'medium', `Slow FCP: ${this.analytics.pageLoad.firstContentfulPaint}ms`)
    }

    if (this.analytics.network.compressionRatio < 0.3) {
      this.createAlert('compression', 'low', `Low compression ratio: ${(this.analytics.network.compressionRatio * 100).toFixed(1)}%`)
    }
  }

  private createAlert(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string
  ): void {
    this.alerts.push({
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false
    })

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }
  }

  private cleanupAlerts(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo && !alert.resolved)
  }

  // Public methods for configuration
  updateConfig(newConfig: Partial<EnhancedPerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Public methods for analytics
  getAnalytics(): PerformanceAnalytics {
    return { ...this.analytics }
  }

  getAlerts(): Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: Date
    resolved: boolean
  }> {
    return [...this.alerts]
  }

  resolveAlert(index: number): void {
    if (this.alerts[index]) {
      this.alerts[index].resolved = true
    }
  }

  // Performance optimization utilities
  generateCacheKey(request: NextRequest): string {
    const url = new URL(request.url)
    const key = `${request.method}:${url.pathname}${url.search}`
    
    // Add user-specific cache key if authenticated
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      return `${key}:${authHeader}`
    }
    
    return key
  }

  shouldCompressResponse(response: NextResponse): boolean {
    if (!this.config.compression.enabled) return false

    const contentType = response.headers.get('content-type')
    if (!contentType) return false

    return this.config.compression.types.some(type => contentType.includes(type))
  }

  generatePerformanceReport(): {
    summary: {
      overallScore: number
      recommendations: string[]
    }
    details: PerformanceAnalytics
    alerts: typeof this.alerts
  } {
    const score = this.calculatePerformanceScore()
    const recommendations = this.generateRecommendations()

    return {
      summary: {
        overallScore: score,
        recommendations
      },
      details: this.getAnalytics(),
      alerts: this.getAlerts()
    }
  }

  private calculatePerformanceScore(): number {
    let score = 100

    // Deduct points for slow page load
    if (this.analytics.pageLoad.firstContentfulPaint > 2000) score -= 20
    if (this.analytics.pageLoad.largestContentfulPaint > 4000) score -= 20

    // Deduct points for high memory usage
    if (this.analytics.system.memoryUsage > 500) score -= 15

    // Deduct points for poor compression
    if (this.analytics.network.compressionRatio < 0.5) score -= 10

    // Deduct points for high bounce rate
    if (this.analytics.userExperience.bounceRate > 0.6) score -= 15

    return Math.max(0, score)
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.analytics.pageLoad.firstContentfulPaint > 2000) {
      recommendations.push('Consider enabling image lazy loading and optimizing critical CSS')
    }

    if (this.analytics.system.memoryUsage > 500) {
      recommendations.push('High memory usage detected. Consider optimizing database queries and implementing better caching')
    }

    if (this.analytics.network.compressionRatio < 0.5) {
      recommendations.push('Enable compression for static assets to reduce bandwidth usage')
    }

    if (this.analytics.userExperience.bounceRate > 0.6) {
      recommendations.push('High bounce rate detected. Consider improving page load speed and user experience')
    }

    if (!this.config.cdn.enabled) {
      recommendations.push('Consider enabling CDN for better content delivery performance')
    }

    return recommendations
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: PerformanceAnalytics
    checks: {
      memory: boolean
      performance: boolean
      caching: boolean
      alerts: boolean
    }
  }> {
    const checks = {
      memory: this.analytics.system.memoryUsage < 500, // Less than 500MB
      performance: this.analytics.pageLoad.firstContentfulPaint < 3000, // Less than 3 seconds
      caching: this.config.caching.enabled,
      alerts: this.alerts.filter(a => !a.resolved && a.severity === 'critical').length === 0
    }

    const failedChecks = Object.values(checks).filter(check => !check).length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (failedChecks >= 3) {
      status = 'unhealthy'
    } else if (failedChecks >= 1) {
      status = 'degraded'
    }

    return {
      status,
      metrics: this.getAnalytics(),
      checks
    }
  }
}

// Export singleton instance
export const enhancedPerformanceService = EnhancedPerformanceService.getInstance()