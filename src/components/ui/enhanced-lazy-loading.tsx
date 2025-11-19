'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'

interface EnhancedLazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  threshold?: number
  rootMargin?: string
  fadeIn?: boolean
  eagerLoad?: boolean
  mobileOptimized?: boolean
  retryCount?: number
  fallbackSrc?: string
}

interface ProgressiveImage {
  low: string
  medium: string
  high: string
}

export function EnhancedLazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '200px',
  fadeIn = true,
  eagerLoad = false,
  mobileOptimized = true,
  retryCount = 3,
  fallbackSrc,
}: EnhancedLazyImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(!priority && !eagerLoad)
  const [hasError, setHasError] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(priority || eagerLoad)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [imageQuality, setImageQuality] = useState(quality)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate progressive image sources
  const progressiveSrc = useMemo(() => {
    if (!src.startsWith('/')) return { low: src, medium: src, high: src }

    const base = src.replace(/\.[^/.]+$/, '')
    const ext = src.includes('.') ? src.split('.').pop() : 'jpg'

    return {
      low: `${base}-small.${ext}`,
      medium: `${base}-medium.${ext}`,
      high: src
    }
  }, [src])

  // Reset internal state whenever the source changes so new images render immediately
  useEffect(() => {
    setImgSrc(src)
    setRetryAttempt(0)
    setHasError(false)
    if (!priority && !eagerLoad) {
      setIsLoading(true)
    }
  }, [src, priority, eagerLoad])

  // Detect mobile device for optimization
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  // Adaptive quality based on device and connection
  const getAdaptiveQuality = useCallback(() => {
    if (typeof window === 'undefined') return quality
    
    // Lower quality for mobile devices
    if (isMobile) return Math.max(quality - 15, 30)
    
    // Check connection type if available
    const connection = (navigator as any).connection
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return Math.max(quality - 25, 20)
      }
      if (connection.effectiveType === '3g') {
        return Math.max(quality - 10, 40)
      }
    }
    
    return quality
  }, [quality, isMobile])

  // Intersection Observer for lazy loading
  useEffect(() => {
    // Set initial image quality based on device
    if (mobileOptimized && typeof window !== 'undefined') {
      setImageQuality(window.innerWidth < 768 ? 60 : quality)
    }
    
    if (priority || eagerLoad) {
      setIsIntersecting(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority, eagerLoad, rootMargin, threshold])

  // Load image with progressive enhancement
  useEffect(() => {
    if (!isIntersecting || isLoading === false) return

    const loadImage = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        // Progressive loading strategy
        const loadSequence = async () => {
          // Start with low quality if mobile
          if (isMobile && placeholder === 'blur') {
            await new Promise<void>((resolve, reject) => {
              const img = new Image()
              img.onload = () => resolve()
              img.onerror = reject
              img.src = progressiveSrc.low
            })
          }

          // Load main image
          await new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              setImgSrc(src)
              resolve()
            }
            img.onerror = reject
            
            // Set adaptive quality
            const adaptiveQuality = getAdaptiveQuality()
            setImageQuality(adaptiveQuality)
            
            // Add cache-busting parameter for better caching control
            const cacheBuster = `?v=${Date.now()}`
            img.src = src + cacheBuster
          })
        }

        // Set timeout for slow connections
        loadTimeoutRef.current = setTimeout(() => {
          if (isLoading) {
            console.warn(`Image load timeout for: ${src}`)
            // Fallback to low quality
            setImgSrc(progressiveSrc.low)
            setIsLoading(false)
          }
        }, isMobile ? 8000 : 15000) // Shorter timeout for mobile

        await loadSequence()

        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
        }

        setIsLoading(false)
        onLoad?.()
      } catch (error) {
        console.error('Failed to load image:', error)
        
        if (retryAttempt < retryCount) {
          setRetryAttempt(prev => prev + 1)
          // Exponential backoff
          const backoffTime = Math.pow(2, retryAttempt) * 1000
          setTimeout(loadImage, backoffTime)
        } else {
          setIsLoading(false)
          setHasError(true)
          if (fallbackSrc) {
            setImgSrc(fallbackSrc)
          }
          onError?.()
        }
      }
    }

    loadImage()

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [isIntersecting, src, onLoad, onError, retryAttempt, retryCount, isMobile, placeholder, progressiveSrc, getAdaptiveQuality, isLoading])

  // Handle window resize for adaptive quality
  useEffect(() => {
    const handleResize = () => {
      const newQuality = getAdaptiveQuality()
      setImageQuality(newQuality)
    }

    if (mobileOptimized) {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [mobileOptimized, getAdaptiveQuality])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    if (retryAttempt < retryCount) {
      setRetryAttempt(prev => prev + 1)
      // Retry with fallback source
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc)
      }
    } else {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }
  }

  const imageProps = {
    src: imgSrc,
    alt,
    width,
    height,
    fill,
    className: `${className} ${fadeIn ? 'transition-opacity duration-300' : ''}`,
    priority: priority || eagerLoad,
    quality: imageQuality,
    sizes: sizes || (isMobile ? '100vw' : '50vw'),
    placeholder: placeholder as 'blur' | 'empty',
    blurDataURL,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      transition: fadeIn ? 'opacity 0.3s ease-in-out' : 'none',
      opacity: isLoading ? 0 : 1,
    } as React.CSSProperties,
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Main Image */}
      <Image {...imageProps} alt={imageProps.alt || ''} />
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">فشل تحميل الصورة</p>
            {retryCount > 0 && retryAttempt < retryCount && (
              <p className="text-xs mt-1">إعادة المحاولة {retryAttempt + 1}/{retryCount}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Lazy Section with better performance and advanced features
interface EnhancedLazySectionProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  rootMargin?: string
  threshold?: number | number[]
  className?: string
  triggerOnce?: boolean
  preload?: boolean
  onIntersection?: () => void
  onError?: () => void
  // New performance features
  priority?: 'high' | 'medium' | 'low'
  debounceTime?: number
  enableAnimations?: boolean
  cacheKey?: string
  retryCount?: number
  fallbackStrategy?: 'placeholder' | 'skeleton' | 'error'
}

export function EnhancedLazySection({
  children,
  placeholder,
  rootMargin = '150px',
  threshold = 0.1,
  className = '',
  triggerOnce = true,
  preload = false,
  onIntersection,
  onError,
  priority = 'medium',
  debounceTime = 100,
  enableAnimations = true,
  cacheKey,
  retryCount = 2,
  fallbackStrategy = 'placeholder',
}: EnhancedLazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cache management
  const getCacheKey = useCallback(() => {
    return cacheKey || `lazy-section-${Math.random().toString(36).substr(2, 9)}`
  }, [cacheKey])

  const getCachedState = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const cacheKey = getCacheKey()
      const cached = sessionStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }, [getCacheKey])

  const setCachedState = useCallback((state: any) => {
    if (typeof window === 'undefined') return
    try {
      const cacheKey = getCacheKey()
      sessionStorage.setItem(cacheKey, JSON.stringify(state))
    } catch {
      // Ignore cache errors
    }
  }, [getCacheKey])

  // Adaptive root margin based on priority
  const getAdaptiveRootMargin = useCallback(() => {
    if (priority === 'high') return '300px'
    if (priority === 'low') return '50px'
    return rootMargin
  }, [priority, rootMargin])

  // Adaptive threshold based on priority
  const getAdaptiveThreshold = useCallback(() => {
    if (priority === 'high') return [0, 0.25, 0.5, 0.75, 1.0]
    if (priority === 'low') return 0.5
    return threshold
  }, [priority, threshold])

  // Debounced intersection handler
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        if (!triggerOnce || !hasTriggered.current) {
          setIsVisible(true)
          hasTriggered.current = true
          
          // Cache the visible state
          setCachedState({ visible: true, timestamp: Date.now() })
          
          onIntersection?.()
          
          if (triggerOnce) {
            observerRef.current?.disconnect()
          }
        }
      }
    }, debounceTime)
  }, [triggerOnce, debounceTime, onIntersection, setCachedState])

  useEffect(() => {
    // Check cache first
    const cachedState = getCachedState()
    if (cachedState?.visible) {
      setIsVisible(true)
      onIntersection?.()
      return
    }

    if (preload) {
      setIsVisible(true)
      setCachedState({ visible: true, timestamp: Date.now() })
      onIntersection?.()
      return
    }

    // Create intersection observer with adaptive settings
    const observer = new IntersectionObserver(
      handleIntersection,
      {
        rootMargin: getAdaptiveRootMargin(),
        threshold: getAdaptiveThreshold(),
      }
    )

    observerRef.current = observer

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef)
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [
    rootMargin,
    threshold,
    triggerOnce,
    preload,
    onIntersection,
    handleIntersection,
    getAdaptiveRootMargin,
    getAdaptiveThreshold,
    getCachedState,
    setCachedState,
  ])

  // Error handling with retry mechanism
  useEffect(() => {
    if (isVisible && !hasError) {
      setIsLoading(true)
      
      try {
        // Simulate content validation
        if (ref.current) {
          // Check if children are valid
          const hasValidContent = ref.current.children.length > 0 || 
                                ref.current.textContent?.trim().length > 0
          
          if (!hasValidContent && retryAttempt < retryCount) {
            // Retry loading
            setRetryAttempt(prev => prev + 1)
            const backoffTime = Math.pow(2, retryAttempt) * 500
            setTimeout(() => {
              setIsLoading(false)
            }, backoffTime)
            return
          }
          
          if (!hasValidContent) {
            setHasError(true)
            onError?.()
          }
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('EnhancedLazySection error:', error)
        
        if (retryAttempt < retryCount) {
          setRetryAttempt(prev => prev + 1)
          const backoffTime = Math.pow(2, retryAttempt) * 500
          setTimeout(() => {
            setIsLoading(false)
          }, backoffTime)
        } else {
          setHasError(true)
          setIsLoading(false)
          onError?.()
        }
      }
    }
  }, [isVisible, hasError, retryAttempt, retryCount, onError])

  // Render based on state and strategy
  const renderContent = () => {
    if (hasError) {
      switch (fallbackStrategy) {
        case 'skeleton':
          return (
            <div className="p-6 bg-gray-100 rounded-lg animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          )
        case 'error':
          return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-center text-red-600">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">حدث خطأ في تحميل المحتوى</p>
                {retryCount > 0 && (
                  <p className="text-xs mt-1 text-red-500">تمت المحاولة {retryAttempt + 1} من {retryCount}</p>
                )}
              </div>
            </div>
          )
        default:
          return placeholder || <div className="h-32 bg-gray-100 rounded-lg" />
      }
    }

    if (isLoading) {
      return (
        <div className={`p-6 bg-gray-50 rounded-lg ${enableAnimations ? 'animate-pulse' : ''}`}>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    }

    if (isVisible) {
      return (
        <div className={`transition-all duration-500 ease-out ${enableAnimations ? 'animate-fadeIn' : ''}`}>
          {children}
        </div>
      )
    }

    return placeholder || <div className="h-32 bg-gray-100 rounded-lg" />
  }

  return (
    <div 
      ref={ref} 
      className={`relative ${className}`}
      data-priority={priority}
      data-cache-key={cacheKey}
    >
      {renderContent()}
    </div>
  )
}

// Heavy component lazy loader with resource management
interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  props?: any
  preloadStrategy?: 'none' | 'hover' | 'visible' | 'immediate'
  rootMargin?: string
}

export function LazyComponent({
  loader,
  fallback,
  errorFallback,
  props = {},
  preloadStrategy = 'visible',
  rootMargin = '200px',
}: LazyComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const loadComponent = useCallback(async () => {
    if (isLoading || Component) return

    try {
      setIsLoading(true)
      setHasError(false)
      
      const loadedModule = await loader()
      setComponent(() => loadedModule.default)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load component:', error)
      setIsLoading(false)
      setHasError(true)
    }
  }, [loader, isLoading, Component])

  // Preload based on strategy
  useEffect(() => {
    if (preloadStrategy === 'immediate') {
      loadComponent()
      return
    }

    if (preloadStrategy === 'visible') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadComponent()
            observer.disconnect()
          }
        },
        { rootMargin }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return () => observer.disconnect()
    }

    if (preloadStrategy === 'hover' && ref.current) {
      const element = ref.current
      const handleMouseEnter = () => {
        loadComponent()
        element.removeEventListener('mouseenter', handleMouseEnter)
      }
      
      element.addEventListener('mouseenter', handleMouseEnter)
      return () => element.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [loadComponent, preloadStrategy, rootMargin])

  if (hasError) {
    return errorFallback || (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center text-red-600">
          <p className="text-sm">فشل تحميل المكون</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return fallback || (
      <div className="p-8 bg-gray-100 animate-pulse rounded-lg">
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (Component) {
    return <Component {...props} />
  }

  return <div ref={ref}>{fallback}</div>
}

// Performance monitoring hook for lazy loading
export function useLazyLoadingPerformance() {
  const [metrics, setMetrics] = useState({
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
  })

  useEffect(() => {
    // Monitor image loading performance
    const handleImageLoad = (event: Event) => {
      const img = event.target as HTMLImageElement
      const loadTime = performance.now() - (img as any).loadStartTime
      
      setMetrics(prev => ({
        ...prev,
        loadedImages: prev.loadedImages + 1,
        averageLoadTime: (prev.averageLoadTime * prev.loadedImages + loadTime) / (prev.loadedImages + 1)
      }))
    }

    const handleImageError = () => {
      setMetrics(prev => ({
        ...prev,
        failedImages: prev.failedImages + 1
      }))
    }

    // Add event listeners to all images
    document.addEventListener('load', handleImageLoad, true)
    document.addEventListener('error', handleImageError, true)

    return () => {
      document.removeEventListener('load', handleImageLoad, true)
      document.removeEventListener('error', handleImageError, true)
    }
  }, [])

  return metrics
}