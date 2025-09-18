'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
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
}

export function OptimizedImage({
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
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Convert image URLs to WebP format when possible
  const getOptimizedSrc = (originalSrc: string) => {
    // If it's already an external URL or data URL, return as-is
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return originalSrc
    }

    // For local images, always use the original format to avoid WebP conversion issues
    return originalSrc
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  const optimizedSrc = getOptimizedSrc(imgSrc)

  const imageProps = {
    src: optimizedSrc,
    alt,
    width,
    height,
    fill,
    className,
    priority,
    quality,
    sizes,
    placeholder: placeholder as 'blur' | 'empty',
    blurDataURL,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      transition: 'opacity 0.3s ease-in-out',
      opacity: isLoading ? 0 : 1,
    } as React.CSSProperties,
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image {...imageProps} />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
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
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for responsive images with art direction
export function ResponsiveImage({
  src,
  alt,
  breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
  ...props
}: OptimizedImageProps & {
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
}) {
  const sizes = `(max-width: ${breakpoints.mobile - 1}px) 100vw, 
                   (max-width: ${breakpoints.tablet - 1}px) 50vw, 
                   (max-width: ${breakpoints.desktop - 1}px) 33vw, 
                   25vw`

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      sizes={sizes}
      {...props}
    />
  )
}

// Helper component for hero/background images
export function BackgroundImage({
  src,
  alt,
  children,
  className = '',
  overlay = true,
  overlayOpacity = 0.5,
}: {
  src: string
  alt: string
  children?: React.ReactNode
  className?: string
  overlay?: boolean
  overlayOpacity?: number
}) {
  // Ensure we're using the correct file extension
  const getImageSrc = (originalSrc: string) => {
    // If it's already an external URL or data URL, return as-is
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return originalSrc
    }

    // For local images, ensure we're using the correct path
    // Remove any .webp extension and use the original format
    let cleanSrc = originalSrc.replace('.webp', '')
    
    // Ensure the path starts with /
    if (!cleanSrc.startsWith('/')) {
      cleanSrc = '/' + cleanSrc
    }
    
    return cleanSrc
  }

  const imageSrc = getImageSrc(src)

  return (
    <div className={`relative ${className}`}>
      {/* Use regular img tag for background images to avoid Next.js Image issues */}
      <img
        src={imageSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
        loading="eager"
        onError={(e) => {
          // If image fails to load, try alternative paths
          const target = e.target as HTMLImageElement
          const currentSrc = target.src
          
          console.log('Image failed to load:', currentSrc)
          
          // Try different path variations
          if (!currentSrc.includes('/public') && !currentSrc.startsWith('http')) {
            console.log('Trying with /public prefix')
            target.src = `/public${imageSrc}`
          } else if (currentSrc.includes('/public')) {
            console.log('Trying without /public prefix')
            target.src = imageSrc.replace('/public', '')
          } else if (!currentSrc.startsWith('http')) {
            console.log('Trying with full URL')
            target.src = `http://localhost:3000${imageSrc}`
          }
        }}
      />
      
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {children && (
        <div className="absolute inset-0 z-10">{children}</div>
      )}
    </div>
  )
}