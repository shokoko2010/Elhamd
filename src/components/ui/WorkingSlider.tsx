'use client'

import { useState, useEffect, useRef, TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WorkingSliderProps {
  items: Array<{
    id: string
    title: string
    subtitle: string
    description: string
    imageUrl: string
    ctaText: string
    ctaLink: string
    badge?: string
    badgeColor?: string
  }>
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
  loading?: boolean
}

export function WorkingSlider({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = '',
  loading = false
}: WorkingSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout>()

  // Handle auto-play
  useEffect(() => {
    if (isAutoPlay && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
      }, autoPlayInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlay, items.length, autoPlayInterval])

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsAutoPlay(false) // Pause auto-play during user interaction
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const diff = touchStart - touchEnd
    const threshold = 50 // Minimum distance for swipe

    if (diff > threshold) {
      // Swipe left, go to next
      handleNext()
    } else if (diff < -threshold) {
      // Swipe right, go to previous
      handlePrevious()
    }

    // Resume auto-play after a delay
    setTimeout(() => setIsAutoPlay(true), 3000)
  }

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % items.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[70vh] md:h-[80vh] bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-white border-t-blue-300 rounded-full animate-spin mx-auto mb-4"></div>
            <p>جاري تحميل السلايدر...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="relative w-full h-[70vh] md:h-[80vh] bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg">لا توجد عروض متاحة حالياً</p>
        </div>
      </div>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Full viewport height */}
      <div 
        className="relative w-full h-[70vh] md:h-[80vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={currentItem.imageUrl}
            alt={`${currentItem.title} - ${currentItem.subtitle}`}
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
            onLoad={() => {
              console.log('✅ Image loaded successfully:', currentItem.imageUrl)
            }}
            onError={(e) => {
              console.log('❌ Image failed to load:', currentItem.imageUrl)
              const target = e.target as HTMLImageElement
              
              // Only try fallback once to prevent infinite loop
              if (!target.dataset.triedFallback) {
                target.dataset.triedFallback = 'true'
                console.log('🔄 Trying fallback with absolute URL...')
                // Try with absolute URL if relative fails
                if (currentItem.imageUrl.startsWith('/')) {
                  target.src = currentItem.imageUrl
                } else {
                  target.src = `/${currentItem.imageUrl}`
                }
              } else {
                console.log('💥 All fallbacks failed, hiding image')
                target.style.display = 'none'
              }
            }}
          />
          
          {/* Fallback background color */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 z-0" />
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 h-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex h-full items-center pt-16 md:pt-24 lg:pt-28">
              <div className="max-w-4xl ml-auto text-right">
                {/* Badge */}
                {currentItem.badge && (
                  <div className="mb-4">
                    <Badge
                      className={`${currentItem.badgeColor || 'bg-blue-600'} text-white px-4 py-2 rounded-full shadow-lg`}
                    >
                      {currentItem.badge}
                    </Badge>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentItem.title}
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl md:text-2xl lg:text-3xl text-blue-200 mb-6 font-light">
                  {currentItem.subtitle}
                </h2>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl ml-auto">
                  {currentItem.description}
                </p>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center"
                    asChild
                  >
                    <a href={currentItem.ctaLink}>
                      {currentItem.ctaText}
                      <ChevronLeft className="mr-2 h-5 w-5" />
                    </a>
                  </Button>

                  {/* Secondary CTA */}
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-900 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 w-full sm:w-auto justify-center bg-transparent"
                    asChild
                  >
                    <a href="/vehicles">
                      عرض جميع السيارات
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white border-white/30 w-12 h-12 rounded-full backdrop-blur-sm"
            aria-label="السابق"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white border-white/30 w-12 h-12 rounded-full backdrop-blur-sm"
            aria-label="التالي"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        {/* Interactive Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm px-4 py-3 rounded-full">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index 
                    ? 'bg-white w-10 h-3 shadow-lg' 
                    : 'bg-white/40 w-3 h-3 hover:bg-white/60 hover:scale-110'
                }`}
                aria-label={`الانتقال إلى الشريحة ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Auto-play Control */}
        <div className="absolute top-6 right-6 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-10 h-10 rounded-full backdrop-blur-sm"
            aria-label={isAutoPlay ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
          >
            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-6 z-20">
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 w-36 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full transition-all duration-1000 ease-linear shadow-lg"
              style={{ 
                width: isAutoPlay ? '100%' : '0%',
                transitionDuration: `${autoPlayInterval}ms`
              }}
            />
          </div>
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-4 right-6 z-20">
          <div className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full shadow-lg border border-white/10">
            <span className="font-bold">{currentIndex + 1}</span>
            <span className="mx-1 opacity-70">/</span>
            <span className="opacity-80">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="bg-gradient-to-t from-black/90 to-black/70 backdrop-blur-sm p-4 border-t border-white/10">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300 ${
                currentIndex === index 
                  ? 'ring-2 ring-blue-500 transform scale-105 shadow-2xl' 
                  : 'opacity-70 hover:opacity-90 hover:scale-102'
              }`}
              style={{ width: '120px', height: '90px' }}
              aria-label={`عرض ${item.title}`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true'
                    console.log('🔄 Trying fallback for thumbnail:', item.imageUrl)
                    // Try with absolute URL if relative fails
                    if (item.imageUrl.startsWith('/')) {
                      target.src = item.imageUrl
                    } else {
                      target.src = `/${item.imageUrl}`
                    }
                  } else {
                    target.style.display = 'none'
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {currentIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}