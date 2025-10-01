import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export interface ImageOptimizationConfig {
  enabled: boolean
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[]
  quality: {
    low: number
    medium: number
    high: number
    original: number
  }
  sizes: {
    thumbnail: { width: number; height: number }
    small: { width: number; height: number }
    medium: { width: number; height: number }
    large: { width: number; height: number }
    xlarge: { width: number; height: number }
  }
  compression: {
    enabled: boolean
    level: number // 1-9
  }
  lazyLoading: boolean
  placeholder: {
    enabled: boolean
    type: 'blur' | 'color' | 'gradient'
  }
  cdn: {
    enabled: boolean
    url?: string
  }
  watermark: {
    enabled: boolean
    text?: string
    opacity?: number
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  }
}

export interface ImageMetadata {
  id: string
  originalUrl: string
  optimizedUrls: Record<string, string> // size -> url
  formats: Record<string, string> // format -> url
  dimensions: {
    width: number
    height: number
  }
  fileSize: {
    original: number
    optimized: number
    savings: number
  }
  format: string
  quality: string
  createdAt: Date
  updatedAt: Date
}

export class EnhancedImageService {
  private static instance: EnhancedImageService
  private config: ImageOptimizationConfig
  private cache: Map<string, ImageMetadata> = new Map()

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): EnhancedImageService {
    if (!EnhancedImageService.instance) {
      EnhancedImageService.instance = new EnhancedImageService()
    }
    return EnhancedImageService.instance
  }

  private getDefaultConfig(): ImageOptimizationConfig {
    return {
      enabled: true,
      formats: ['webp', 'avif', 'jpeg', 'png'],
      quality: {
        low: 60,
        medium: 75,
        high: 85,
        original: 100
      },
      sizes: {
        thumbnail: { width: 150, height: 150 },
        small: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 1200, height: 1200 },
        xlarge: { width: 1920, height: 1920 }
      },
      compression: {
        enabled: true,
        level: 6
      },
      lazyLoading: true,
      placeholder: {
        enabled: true,
        type: 'blur'
      },
      cdn: {
        enabled: false
      },
      watermark: {
        enabled: false,
        text: 'Al-Hamd Cars',
        opacity: 0.5,
        position: 'bottom-right'
      }
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<ImageOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): ImageOptimizationConfig {
    return { ...this.config }
  }

  // Optimize image URL
  optimizeImageUrl(
    originalUrl: string,
    options: {
      width?: number
      height?: number
      quality?: 'low' | 'medium' | 'high' | 'original'
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
      size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge'
    } = {}
  ): string {
    if (!this.config.enabled) {
      return originalUrl
    }

    const {
      width,
      height,
      quality = 'medium',
      format = 'webp',
      size
    } = options

    // Use predefined size if specified
    let finalWidth = width
    let finalHeight = height

    if (size && this.config.sizes[size]) {
      finalWidth = this.config.sizes[size].width
      finalHeight = this.config.sizes[size].height
    }

    // Build optimized URL
    const params = new URLSearchParams()
    
    if (finalWidth) params.set('w', finalWidth.toString())
    if (finalHeight) params.set('h', finalHeight.toString())
    if (quality) params.set('q', this.config.quality[quality].toString())
    if (format) params.set('f', format)

    const queryString = params.toString()
    return queryString ? `${originalUrl}?${queryString}` : originalUrl
  }

  // Generate responsive image sources
  generateResponsiveSources(
    originalUrl: string,
    options: {
      baseWidth?: number
      baseHeight?: number
      quality?: 'low' | 'medium' | 'high' | 'original'
      sizes?: Array<{ width: number; breakpoint?: number }>
    } = {}
  ): {
    src: string
    srcSet: string
    sizes?: string
    placeholder?: string
  } {
    const {
      baseWidth = 800,
      baseHeight = 600,
      quality = 'medium',
      sizes = [
        { width: 300, breakpoint: 640 },
        { width: 600, breakpoint: 768 },
        { width: 900, breakpoint: 1024 },
        { width: 1200, breakpoint: 1440 }
      ]
    } = options

    // Generate srcset
    const srcSetEntries = sizes.map(size => {
      const url = this.optimizeImageUrl(originalUrl, {
        width: size.width,
        quality
      })
      return `${url} ${size.width}w`
    })

    const srcSet = srcSetEntries.join(', ')

    // Generate sizes attribute
    const sizesAttr = sizes.map(size => {
      if (size.breakpoint) {
        return `(max-width: ${size.breakpoint}px) ${size.width}px`
      }
      return `${size.width}px`
    }).join(', ')

    // Generate placeholder
    let placeholder: string | undefined = undefined
    if (this.config.placeholder.enabled) {
      placeholder = this.generatePlaceholder(originalUrl)
    }

    return {
      src: this.optimizeImageUrl(originalUrl, { width: baseWidth, height: baseHeight, quality }),
      srcSet,
      sizes: sizesAttr,
      placeholder
    }
  }

  // Generate placeholder image
  private generatePlaceholder(originalUrl: string): string {
    if (this.config.placeholder.type === 'blur') {
      return this.optimizeImageUrl(originalUrl, {
        width: 20,
        height: 20,
        quality: 'low',
        format: 'webp'
      })
    } else if (this.config.placeholder.type === 'color') {
      // Return a base64 encoded color placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IxMiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'
    } else {
      // Gradient placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2U1ZTdlYiIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjM2M2ZDUiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IxMiBoZWlnaHQ9IxIgZmlsbD0idXJsKCNnKSIgLz48L3N2Zz4='
    }
  }

  // Generate image metadata
  async generateImageMetadata(imageUrl: string): Promise<ImageMetadata> {
    // Check cache first
    const cached = this.cache.get(imageUrl)
    if (cached) {
      return cached
    }

    // Simulate image metadata generation
    // In a real implementation, this would analyze the actual image
    const metadata: ImageMetadata = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalUrl: imageUrl,
      optimizedUrls: {},
      formats: {},
      dimensions: {
        width: 1200,
        height: 800
      },
      fileSize: {
        original: 2500000, // 2.5MB
        optimized: 500000, // 500KB
        savings: 2000000 // 2MB saved
      },
      format: 'jpeg',
      quality: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Generate optimized URLs for different sizes
    Object.entries(this.config.sizes).forEach(([sizeName, size]) => {
      metadata.optimizedUrls[sizeName] = this.optimizeImageUrl(imageUrl, {
        width: size.width,
        height: size.height,
        quality: 'medium'
      })
    })

    // Generate URLs for different formats
    this.config.formats.forEach(format => {
      metadata.formats[format] = this.optimizeImageUrl(imageUrl, {
        format,
        quality: 'medium'
      })
    })

    // Cache the metadata
    this.cache.set(imageUrl, metadata)

    return metadata
  }

  // Batch optimize images
  async batchOptimizeImages(imageUrls: string[]): Promise<ImageMetadata[]> {
    const promises = imageUrls.map(url => this.generateImageMetadata(url))
    return Promise.all(promises)
  }

  // Get image optimization statistics
  getOptimizationStats(): {
    totalImages: number
    totalSizeSaved: number
    averageCompressionRatio: number
    formatDistribution: Record<string, number>
    sizeDistribution: Record<string, number>
  } {
    const allMetadata = Array.from(this.cache.values())
    
    const totalSizeSaved = allMetadata.reduce((sum, meta) => sum + meta.fileSize.savings, 0)
    const averageCompressionRatio = allMetadata.length > 0 
      ? allMetadata.reduce((sum, meta) => sum + (meta.fileSize.optimized / meta.fileSize.original), 0) / allMetadata.length
      : 0

    const formatDistribution: Record<string, number> = {}
    const sizeDistribution: Record<string, number> = {}

    allMetadata.forEach(meta => {
      // Count formats
      Object.keys(meta.formats).forEach(format => {
        formatDistribution[format] = (formatDistribution[format] || 0) + 1
      })

      // Count sizes
      Object.keys(meta.optimizedUrls).forEach(size => {
        sizeDistribution[size] = (sizeDistribution[size] || 0) + 1
      })
    })

    return {
      totalImages: allMetadata.length,
      totalSizeSaved,
      averageCompressionRatio,
      formatDistribution,
      sizeDistribution
    }
  }

  // Generate image optimization report
  generateOptimizationReport(): {
    summary: {
      totalImages: number
      totalSizeSaved: number
      totalSizeSavedFormatted: string
      averageCompressionRatio: number
      estimatedBandwidthSavings: string
    }
    recommendations: string[]
    stats: ReturnType<EnhancedImageService['getOptimizationStats']>
  } {
    const stats = this.getOptimizationStats()
    const totalSizeSavedMB = stats.totalSizeSaved / (1024 * 1024)
    
    const recommendations: string[] = []

    if (!this.config.enabled) {
      recommendations.push('Enable image optimization to reduce page load times')
    }

    if (!this.config.formats.includes('webp')) {
      recommendations.push('Enable WebP format for better compression')
    }

    if (!this.config.formats.includes('avif')) {
      recommendations.push('Consider enabling AVIF format for even better compression')
    }

    if (!this.config.lazyLoading) {
      recommendations.push('Enable lazy loading to improve initial page load performance')
    }

    if (!this.config.placeholder.enabled) {
      recommendations.push('Enable image placeholders to improve perceived performance')
    }

    if (stats.averageCompressionRatio < 0.5) {
      recommendations.push('Review image quality settings - compression ratio could be improved')
    }

    return {
      summary: {
        totalImages: stats.totalImages,
        totalSizeSaved: stats.totalSizeSaved,
        totalSizeSavedFormatted: `${totalSizeSavedMB.toFixed(2)} MB`,
        averageCompressionRatio: stats.averageCompressionRatio,
        estimatedBandwidthSavings: `${(totalSizeSavedMB * 0.5).toFixed(2)} MB/month` // Rough estimate
      },
      recommendations,
      stats
    }
  }

  // Validate image URL
  validateImageUrl(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      new URL(url)
    } catch {
      errors.push('Invalid URL format')
    }

    if (!url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
      errors.push('Unsupported image format')
    }

    if (url.length > 2048) {
      errors.push('URL too long')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Clean up old cache entries
  cleanupCache(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    const cutoff = now - maxAge

    for (const [key, metadata] of this.cache.entries()) {
      if (metadata.updatedAt.getTime() < cutoff) {
        this.cache.delete(key)
      }
    }
  }

  // Get cached metadata
  getCachedMetadata(imageUrl: string): ImageMetadata | undefined {
    return this.cache.get(imageUrl)
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: {
      cache: boolean
      config: boolean
      optimization: boolean
    }
    metrics: {
      cacheSize: number
      totalImages: number
      totalSizeSaved: number
    }
  }> {
    const checks = {
      cache: this.cache.size < 10000, // Less than 10,000 cached images
      config: this.config.enabled,
      optimization: true // Always true for now
    }

    const failedChecks = Object.values(checks).filter(check => !check).length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (failedChecks >= 2) {
      status = 'unhealthy'
    } else if (failedChecks >= 1) {
      status = 'degraded'
    }

    const stats = this.getOptimizationStats()

    return {
      status,
      checks,
      metrics: {
        cacheSize: this.cache.size,
        totalImages: stats.totalImages,
        totalSizeSaved: stats.totalSizeSaved
      }
    }
  }
}

// Export singleton instance
export const enhancedImageService = EnhancedImageService.getInstance()