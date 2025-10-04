'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Car } from 'lucide-react'

interface VehicleImageProps {
  vehicle: {
    id: string
    make: string
    model: string
    images: { imageUrl: string; isPrimary: boolean; altText?: string }[]
  }
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function VehicleImage({ 
  vehicle, 
  className = '', 
  width = 400, 
  height = 300,
  priority = false 
}: VehicleImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Get the primary image or first image
  const primaryImage = vehicle.images.find(img => img.isPrimary) || vehicle.images[0]
  
  // Construct the image URL
  const imageUrl = primaryImage?.imageUrl ? encodeURI(primaryImage.imageUrl) : null
  
  // Fallback placeholder URL
  const placeholderUrl = `/api/placeholder?width=${width}&height=${height}&text=${encodeURIComponent(vehicle.make + ' ' + vehicle.model)}`

  const handleImageError = () => {
    console.error('Failed to load vehicle image:', imageUrl)
    setImageError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <Car className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={primaryImage?.altText || `${vehicle.make} ${vehicle.model}`}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          priority={priority}
        />
      ) : (
        <img
          src={placeholderUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          width={width}
          height={height}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}