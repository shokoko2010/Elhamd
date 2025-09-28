'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'

interface SwipeGestureConfig {
  threshold: number
  velocityThreshold: number
  preventDefaultTouchmoveEvent: boolean
  trackMouse: boolean
  rotationAngle: number
}

interface EnhancedSwipeHandlers {
  onSwipeStart?: (event: React.TouchEvent | React.MouseEvent) => void
  onSwipeMove?: (event: React.TouchEvent | React.MouseEvent, delta: { x: number; y: number }) => void
  onSwipeEnd?: (event: React.TouchEvent | React.MouseEvent, delta: { x: number; y: number }) => void
  onSwipeLeft?: (event: React.TouchEvent | React.MouseEvent) => void
  onSwipeRight?: (event: React.TouchEvent | React.MouseEvent) => void
  onSwipeUp?: (event: React.TouchEvent | React.MouseEvent) => void
  onSwipeDown?: (event: React.TouchEvent | React.MouseEvent) => void
  onSwipeCancel?: (event: React.TouchEvent | React.MouseEvent) => void
}

interface SwipePosition {
  x: number
  y: number
  rotation: number
  scale: number
  opacity: number
}

interface EnhancedSwipeCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
  className?: string
  disabled?: boolean
  threshold?: number
  enableRotation?: boolean
  maxRotation?: number
  enableScale?: boolean
  minScale?: number
  enableFade?: boolean
  snapBack?: boolean
  removeOnSwipe?: boolean
  hapticFeedback?: boolean
}

// Enhanced swipe hook with advanced gesture recognition
export function useEnhancedSwipe(
  handlers: EnhancedSwipeHandlers,
  config: Partial<SwipeGestureConfig> = {}
) {
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)
  const [swipeVelocity, setSwipeVelocity] = useState(0)
  const [swipeDistance, setSwipeDistance] = useState({ x: 0, y: 0 })

  const defaultConfig: SwipeGestureConfig = {
    threshold: 50,
    velocityThreshold: 0.3,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    rotationAngle: 0,
    ...config,
  }

  const enhancedHandlers = useSwipeable({
    onSwipeStart: (eventData) => {
      setIsSwiping(true)
      setSwipeDirection(null)
      handlers.onSwipeStart?.(eventData.event as React.TouchEvent | React.MouseEvent)
    },
    onSwiping: (eventData) => {
      setSwipeDistance({ x: eventData.deltaX, y: eventData.deltaY })
      setSwipeVelocity(eventData.velocity)
      handlers.onSwipeMove?.(eventData.event as React.TouchEvent | React.MouseEvent, {
        x: eventData.deltaX,
        y: eventData.deltaY,
      })
    },
    onSwiped: (eventData) => {
      setIsSwiping(false)
      setSwipeDistance({ x: 0, y: 0 })
      
      // Determine direction
      const { absX, absY, velocity } = eventData
      let direction: 'left' | 'right' | 'up' | 'down' | null = null
      
      if (absX > absY) {
        direction = eventData.deltaX > 0 ? 'right' : 'left'
      } else {
        direction = eventData.deltaY > 0 ? 'down' : 'up'
      }
      
      setSwipeDirection(direction)
      setSwipeVelocity(velocity)
      
      // Call appropriate handler
      switch (direction) {
        case 'left':
          handlers.onSwipeLeft?.(eventData.event as React.TouchEvent | React.MouseEvent)
          break
        case 'right':
          handlers.onSwipeRight?.(eventData.event as React.TouchEvent | React.MouseEvent)
          break
        case 'up':
          handlers.onSwipeUp?.(eventData.event as React.TouchEvent | React.MouseEvent)
          break
        case 'down':
          handlers.onSwipeDown?.(eventData.event as React.TouchEvent | React.MouseEvent)
          break
      }
      
      handlers.onSwipeEnd?.(eventData.event as React.TouchEvent | React.MouseEvent, {
        x: eventData.deltaX,
        y: eventData.deltaY,
      })
    },
    onSwipeCancel: (eventData) => {
      setIsSwiping(false)
      setSwipeDirection(null)
      setSwipeDistance({ x: 0, y: 0 })
      handlers.onSwipeCancel?.(eventData.event as React.TouchEvent | React.MouseEvent)
    },
    ...defaultConfig,
  })

  return {
    ...enhancedHandlers,
    isSwiping,
    swipeDirection,
    swipeVelocity,
    swipeDistance,
  }
}

// Enhanced swipe card with physics-based animations
export function EnhancedSwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeStart,
  onSwipeEnd,
  className = '',
  disabled = false,
  threshold = 100,
  enableRotation = true,
  maxRotation = 15,
  enableScale = true,
  minScale = 0.8,
  enableFade = true,
  snapBack = true,
  removeOnSwipe = false,
  hapticFeedback = true,
}: EnhancedSwipeCardProps) {
  const [position, setPosition] = useState<SwipePosition>({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
  })
  const [isSwiping, setIsSwiping] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlers = useEnhancedSwipe({
    onSwipeStart: () => {
      if (disabled) return
      setIsSwiping(true)
      onSwipeStart?.()
      
      // Haptic feedback
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    },
    onSwipeMove: (event, delta) => {
      if (disabled) return
      
      let rotation = 0
      if (enableRotation) {
        rotation = (delta.x / window.innerWidth) * maxRotation
      }
      
      let scale = 1
      if (enableScale) {
        const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y)
        scale = Math.max(minScale, 1 - (distance / 500))
      }
      
      let opacity = 1
      if (enableFade) {
        opacity = Math.max(0.3, 1 - Math.abs(delta.x) / window.innerWidth)
      }
      
      setPosition({
        x: delta.x,
        y: delta.y,
        rotation,
        scale,
        opacity,
      })
    },
    onSwipeEnd: (event, delta) => {
      if (disabled) return
      
      setIsSwiping(false)
      onSwipeEnd?.()
      
      const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y)
      
      if (distance > threshold) {
        // Determine direction and trigger action
        if (Math.abs(delta.x) > Math.abs(delta.y)) {
          if (delta.x > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          if (delta.y > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
        
        if (removeOnSwipe) {
          setIsExiting(true)
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.style.display = 'none'
            }
          }, 300)
        }
      } else if (snapBack) {
        // Snap back to center
        setPosition({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
        })
      }
    },
    onSwipeCancel: () => {
      if (disabled) return
      setIsSwiping(false)
      
      if (snapBack) {
        setPosition({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
        })
      }
    },
    threshold,
  })

  const cardStyle: React.CSSProperties = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${position.rotation}deg) scale(${position.scale})`,
    opacity: position.opacity,
    transition: isSwiping ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: disabled ? 'default' : 'grab',
    touchAction: 'none',
    userSelect: 'none',
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={cardStyle}
      {...handlers}
    >
      {children}
      
      {/* Swipe indicators */}
      {isSwiping && !disabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs opacity-70">
            ←
          </div>
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs opacity-70">
            →
          </div>
        </div>
      )}
    </div>
  )
}

// Image carousel with swipe gestures
interface SwipeImageCarouselProps {
  images: Array<{
    src: string
    alt: string
    title?: string
    description?: string
  }>
  onImageChange?: (index: number) => void
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  enableSwipe?: boolean
  hapticFeedback?: boolean
}

export function SwipeImageCarousel({
  images,
  onImageChange,
  className = '',
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  enableSwipe = true,
  hapticFeedback = true,
}: SwipeImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const nextImage = useCallback(() => {
    if (isTransitioning) return
    const nextIndex = (currentIndex + 1) % images.length
    setCurrentIndex(nextIndex)
    onImageChange?.(nextIndex)
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5)
    }
  }, [currentIndex, images.length, isTransitioning, onImageChange, hapticFeedback])

  const prevImage = useCallback(() => {
    if (isTransitioning) return
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(prevIndex)
    onImageChange?.(prevIndex)
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5)
    }
  }, [currentIndex, images.length, isTransitioning, onImageChange, hapticFeedback])

  const goToImage = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return
    setCurrentIndex(index)
    onImageChange?.(index)
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5)
    }
  }, [currentIndex, isTransitioning, onImageChange, hapticFeedback])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(nextImage, autoPlayInterval)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoPlay, autoPlayInterval, nextImage])

  // Handle transition state
  useEffect(() => {
    setIsTransitioning(true)
    const timeout = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [currentIndex])

  const swipeHandlers = useEnhancedSwipe(
    {
      onSwipeLeft: nextImage,
      onSwipeRight: prevImage,
    },
    { preventDefaultTouchmoveEvent: true }
  )

  if (images.length === 0) {
    return <div className="text-center p-4">No images to display</div>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main image container */}
      <div
        className="relative overflow-hidden rounded-lg"
        {...(enableSwipe ? swipeHandlers : {})}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 relative"
              style={{ aspectRatio: '16/9' }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold">{image.title}</h3>
                  {image.description && (
                    <p className="text-white/80 text-sm">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Dots indicator */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Touch-friendly slider with enhanced gestures
interface EnhancedSliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  className?: string
  disabled?: boolean
  showValue?: boolean
  hapticFeedback?: boolean
  orientation?: 'horizontal' | 'vertical'
}

export function EnhancedSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = '',
  disabled = false,
  showValue = true,
  hapticFeedback = true,
  orientation = 'horizontal',
}: EnhancedSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const updateValue = useCallback((clientX: number, clientY: number) => {
    if (!sliderRef.current || disabled) return

    const rect = sliderRef.current.getBoundingClientRect()
    let percentage: number

    if (orientation === 'horizontal') {
      percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    } else {
      percentage = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height))
    }

    const newValue = min + percentage * (max - min)
    const steppedValue = Math.round(newValue / step) * step
    
    if (steppedValue !== value) {
      onChange(steppedValue)
      
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(5)
      }
    }
  }, [min, max, step, value, onChange, disabled, orientation, hapticFeedback])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    updateValue(e.clientX, e.clientY)
  }, [updateValue, disabled])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return
    updateValue(e.clientX, e.clientY)
  }, [isDragging, updateValue, disabled])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`w-full ${orientation === 'vertical' ? 'h-32' : ''} ${className}`}>
      <div
        ref={sliderRef}
        className={`relative bg-gray-200 rounded-full cursor-pointer ${
          orientation === 'vertical' ? 'h-full w-2' : 'w-full h-2'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onMouseDown={handleMouseDown}
      >
        {/* Fill */}
        <div
          className={`absolute bg-blue-600 rounded-full transition-all duration-200 ${
            orientation === 'vertical' 
              ? 'bottom-0 w-full' 
              : 'right-0 h-full'
          }`}
          style={{
            [orientation === 'vertical' ? 'height' : 'width']: `${percentage}%`,
          }}
        />
        
        {/* Thumb */}
        <div
          className={`absolute bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
            isDragging ? 'scale-125' : ''
          } ${disabled ? 'cursor-not-allowed' : 'cursor-grab'}`}
          style={{
            [orientation === 'vertical' ? 'bottom' : 'left']: `${percentage}%`,
            top: orientation === 'vertical' ? 'auto' : '50%',
            left: orientation === 'vertical' ? '50%' : 'auto',
            width: orientation === 'vertical' ? '1.5rem' : '1.25rem',
            height: orientation === 'vertical' ? '1.25rem' : '1.5rem',
          }}
        />
      </div>
      
      {showValue && (
        <div className={`mt-2 text-center text-sm font-medium text-gray-700 ${
          orientation === 'vertical' ? 'ml-4' : ''
        }`}>
          {value}
        </div>
      )}
    </div>
  )
}