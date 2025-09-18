'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
  showLoading?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  loading = 'lazy',
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  objectFit = 'cover',
  onClick,
  onLoad,
  onError,
  fallback,
  showLoading = true
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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

  // Generate responsive sizes if not provided
  const generateSizes = () => {
    if (sizes) return sizes
    
    const defaultSizes = [
      '(max-width: 640px) 100vw',
      '(max-width: 768px) 50vw',
      '(max-width: 1024px) 33vw',
      '(max-width: 1280px) 25vw',
      '20vw'
    ]
    
    return defaultSizes.join(', ')
  }

  // Generate srcSet for different image sizes
  const generateSrcSet = (baseSrc: string) => {
    // Remove file extension and add different sizes
    const srcWithoutExt = baseSrc.replace(/\.[^/.]+$/, '')
    
    return [
      `${srcWithoutExt}_small.webp 150w`,
      `${srcWithoutExt}_medium.webp 300w`,
      `${srcWithoutExt}_large.webp 600w`,
      `${srcWithoutExt}.webp 1200w`
    ].join(', ')
  }

  const imageProps = {
    src,
    alt,
    width: width || 400,
    height: height || 300,
    className: cn(
      'transition-opacity duration-300',
      isLoading && showLoading ? 'opacity-0' : 'opacity-100',
      hasError ? 'hidden' : '',
      className
    ),
    priority,
    loading,
    placeholder,
    blurDataURL,
    sizes: generateSizes(),
    quality,
    style: { objectFit },
    onLoad: handleLoad,
    onError: handleError,
    onClick
  }

  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && showLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Error fallback */}
      {hasError && !fallback && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center p-4">
            <div>Failed to load image</div>
            <div className="text-xs mt-1">{alt}</div>
          </div>
        </div>
      )}
      
      {/* Main image */}
      <Image
        {...imageProps}
        srcSet={generateSrcSet(src)}
        alt={alt || ''}
      />
    </div>
  )
}

// Specialized components for different use cases
export function VehicleImage({ 
  src, 
  alt, 
  className,
  ...props 
}: Omit<OptimizedImageProps, 'objectFit'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded-lg', className)}
      objectFit="cover"
      quality={85}
      {...props}
    />
  )
}

export function ServiceImage({ 
  src, 
  alt, 
  className,
  ...props 
}: Omit<OptimizedImageProps, 'objectFit'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded-md', className)}
      objectFit="contain"
      quality={80}
      {...props}
    />
  )
}

export function AvatarImage({ 
  src, 
  alt, 
  className,
  ...props 
}: Omit<OptimizedImageProps, 'objectFit'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded-full', className)}
      objectFit="cover"
      width={40}
      height={40}
      quality={70}
      {...props}
    />
  )
}

export function ThumbnailImage({ 
  src, 
  alt, 
  className,
  size = 'medium',
  ...props 
}: Omit<OptimizedImageProps, 'objectFit' | 'width' | 'height'> & {
  size?: 'small' | 'medium' | 'large'
}) {
  const sizeMap = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 200, height: 200 }
  }

  const { width, height } = sizeMap[size]

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('rounded-md object-cover', className)}
      width={width}
      height={height}
      quality={60}
      {...props}
    />
  )
}

// Lazy loading wrapper for better performance
export function LazyImage({ 
  children, 
  placeholder,
  className 
}: { 
  children: React.ReactNode
  placeholder?: React.ReactNode
  className?: string 
}) {
  const [isInView, setIsInView] = useState(false)

  return (
    <div className={cn('relative', className)}>
      {!isInView && (
        <div className="absolute inset-0">
          {placeholder || (
            <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
          )}
        </div>
      )}
      <div
        ref={(el) => {
          if (el && !isInView) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  setIsInView(true)
                  observer.disconnect()
                }
              },
              { threshold: 0.1 }
            )
            observer.observe(el)
          }
        }}
      >
        {isInView && children}
      </div>
    </div>
  )
}