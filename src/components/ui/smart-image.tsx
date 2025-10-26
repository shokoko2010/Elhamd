import Image from 'next/image'
import { useState } from 'react'

interface SmartImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onError?: () => void
  onLoad?: () => void
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onError,
  onLoad
}: SmartImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if the src is a base64 data URL
  const isBase64 = src.startsWith('data:')
  
  // Check if the src is a relative path that might not exist
  const isRelativePath = src.startsWith('/') && !src.startsWith('data:')
  
  // For base64 images, we need to handle them differently
  if (isBase64) {
    return (
      <div className={`relative ${className || ''}`} style={fill ? {} : { width, height }}>
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className || ''}`}
          onLoad={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setImageError(true)
            onError?.()
          }}
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {imageError && (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    )
  }

  // For regular images, use Next.js Image component with fallback
  return (
    <div className={`relative ${className || ''}`} style={fill ? {} : { width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        fill={fill}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`w-full h-full object-cover ${className || ''}`}
        onLoad={() => {
          setIsLoading(false)
          onLoad?.()
        }}
        onError={() => {
          setImageError(true)
          onError?.()
        }}
        // Add fallback for missing images
        unoptimized={isBase64}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {imageError && (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Image not available</span>
        </div>
      )}
    </div>
  )
}

// Utility function to check if an image URL is valid
export async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    // Skip base64 URLs
    if (url.startsWith('data:')) {
      return true
    }

    // For relative URLs, we can't easily validate them on the client side
    if (url.startsWith('/')) {
      return true // Assume valid, will be caught by onError if not
    }

    // For absolute URLs, we can try to fetch them
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && response.headers.get('content-type')?.startsWith('image/')
  } catch {
    return false
  }
}

// Utility function to get a placeholder image
export function getPlaceholderImage(width: number = 400, height: number = 300): string {
  return `data:image/svg+xml,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E`
}