'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface EnhancedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
  showLoading?: boolean
  showError?: boolean
  fallback?: React.ReactNode
  aspectRatio?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  lazy?: boolean
  threshold?: number
  rootMargin?: string
  fadeIn?: boolean
  zoomOnHover?: boolean
}

export function EnhancedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  onLoad,
  onError,
  showLoading = true,
  showError = true,
  fallback,
  aspectRatio = 'auto',
  objectFit = 'cover',
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px',
  fadeIn = true,
  zoomOnHover = false
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const [imageSrc, setImageSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [lazy, threshold, rootMargin])

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  // Handle image error
  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Retry loading image
  const retryLoad = useCallback(() => {
    setHasError(false)
    setIsLoading(true)
    setImageSrc(`${src}?retry=${Date.now()}`) // Add cache busting
  }, [src])

  // Reset image source when original src changes
  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src)
      setHasError(false)
      setIsLoading(true)
    }
  }, [src, imageSrc])

  const imageClasses = `
    transition-all duration-300 ease-in-out
    ${fadeIn ? 'opacity-0' : 'opacity-100'}
    ${!isLoading && !hasError ? 'opacity-100' : ''}
    ${zoomOnHover ? 'hover:scale-105' : ''}
    ${className}
  `.trim()

  const containerClasses = `
    relative overflow-hidden
    ${aspectRatio !== 'auto' ? `aspect-[${aspectRatio}]` : ''}
    ${zoomOnHover ? 'group' : ''}
  `.trim()

  const renderFallback = () => {
    if (fallback) {
      return <div className="w-full h-full flex items-center justify-center">{fallback}</div>
    }
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
        <ImageIcon className="h-12 w-12 mb-2" />
        <span className="text-sm">فشل تحميل الصورة</span>
        {showError && (
          <button
            onClick={retryLoad}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={containerClasses}>
      {isInView && !hasError ? (
        <>
          <Image
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={imageClasses}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            sizes={sizes}
            quality={quality}
            onLoad={handleLoad}
            onError={handleError}
            style={{ 
              objectFit,
              ...(fadeIn && !isLoading ? { transition: 'opacity 0.3s ease-in-out' } : {})
            }}
          />
          
          {/* Loading overlay */}
          {showLoading && isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">جاري تحميل الصورة...</span>
              </div>
            </div>
          )}
        </>
      ) : hasError ? (
        renderFallback()
      ) : (
        // Placeholder for lazy loading
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {showLoading && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">جاري التحميل...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ImageGalleryProps {
  images: Array<{
    id: string
    src: string
    alt: string
    thumbnail?: string
  }>
  className?: string
  showThumbnails?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  onImageChange?: (index: number) => void
}

export function ImageGallery({
  images,
  className = '',
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  onImageChange
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
    onImageChange?.(index)
  }, [onImageChange])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(nextImage, autoPlayInterval)
    return () => clearInterval(interval)
  }, [isPlaying, nextImage, autoPlayInterval])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  if (images.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <span>لا توجد صور متاحة</span>
        </div>
      </div>
    )
  }

  const currentImage = images[currentIndex]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <EnhancedImage
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full"
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={currentIndex === 0}
          fadeIn={true}
        />

        {/* Controls */}
        {showControls && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Play/Pause button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 relative rounded overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-500 scale-105' 
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              <EnhancedImage
                src={image.thumbnail || image.src}
                alt={image.alt}
                width={80}
                height={60}
                className="w-20 h-15 object-cover"
                lazy={false}
                priority={index < 4}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook for preloading images
export function useImagePreloader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve()
        return
      }

      setLoadingImages(prev => new Set(prev).add(src))
      
      const img = new Image()
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src))
        setLoadingImages(prev => {
          const newSet = new Set(prev)
          newSet.delete(src)
          return newSet
        })
        resolve()
      }
      
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev)
          newSet.delete(src)
          return newSet
        })
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }, [loadedImages])

  const preloadImages = useCallback((srcs: string[]): Promise<void[]> => {
    return Promise.all(srcs.map(preloadImage))
  }, [preloadImage])

  const isImageLoaded = useCallback((src: string) => loadedImages.has(src), [loadedImages])
  const isImageLoading = useCallback((src: string) => loadingImages.has(src), [loadingImages])

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageLoading,
    loadedImages: Array.from(loadedImages),
    loadingImages: Array.from(loadingImages)
  }
}