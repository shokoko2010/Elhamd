'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SimpleImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallback?: string
}

export function SimpleImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  onLoad,
  onError,
  fallback = '/placeholder-car.jpg'
}: SimpleImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
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
    if (imgSrc !== fallback) {
      setImgSrc(fallback)
    }
    onError?.()
  }

  const imageProps = {
    src: imgSrc,
    alt,
    width,
    height,
    fill,
    className,
    priority,
    quality,
    sizes,
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
      {hasError && imgSrc === fallback && (
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
            <p className="text-sm">صورة غير متاحة</p>
          </div>
        </div>
      )}
    </div>
  )
}