'use client'

import { useState, useEffect, useRef, TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { EnhancedLoadingIndicator } from '@/components/ui/enhanced-loading'

interface MobileSliderProps {
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

export function MobileSlider({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  className = '',
  loading = false
}: MobileSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
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
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <EnhancedLoadingIndicator 
            size="xl" 
            variant="car" 
            text="جاري تحميل السلايدر..." 
            className="text-white"
          />
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg">لا توجد عروض متاحة حالياً</p>
        </div>
      </div>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Mobile-optimized height */}
      <div 
        ref={containerRef}
        className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image with enhanced mobile optimization */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={currentItem.imageUrl}
            alt={`${currentItem.title} - ${currentItem.subtitle}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
          />
          
          {/* Enhanced gradient overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 sm:from-black/70 sm:via-black/50 sm:to-black/80 md:from-black/60 md:via-black/40 md:to-black/70" />
          
          {/* Mobile-specific overlay pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMwIDBMMzAgNjBNMCAzMEw2MCAzME0xNSAxNUw0NSA0NU0xNSA0NUw0NSAxNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPgo8L3N2Zz4K')] bg-repeat"></div>
          </div>
        </div>

        {/* Content with mobile-first responsive design */}
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-right">
              {/* Badge with enhanced mobile visibility */}
              {currentItem.badge && (
                <div className="mb-3 sm:mb-4">
                  <Badge 
                    className={`${currentItem.badgeColor || 'bg-blue-600'} text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg transform hover:scale-105 transition-transform`}
                  >
                    {currentItem.badge}
                  </Badge>
                </div>
              )}
              
              {/* Title with mobile-optimized typography */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {currentItem.title}
              </h1>
              
              {/* Subtitle with better mobile spacing */}
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-200 mb-4 sm:mb-6 font-light">
                {currentItem.subtitle}
              </h2>
              
              {/* Description with improved mobile readability */}
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-2xl ml-auto">
                {currentItem.description}
              </p>
              
              {/* CTA Button with mobile-optimized sizing */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center"
                  asChild
                >
                  <a href={currentItem.ctaLink}>
                    {currentItem.ctaText}
                    <ChevronLeft className="mr-2 h-5 w-5" />
                  </a>
                </Button>
                
                {/* Secondary CTA for mobile */}
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-900 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 w-full sm:w-auto justify-center"
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

        {/* Mobile-optimized navigation controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 pointer-events-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white border-white/30 w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="pointer-events-auto bg-white/20 hover:bg-white/30 text-white border-white/30 w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile-optimized dots */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index 
                    ? 'bg-white w-8 sm:w-10 h-2 sm:h-2.5' 
                    : 'bg-white/50 w-2 sm:w-3 h-2 sm:h-2.5 hover:bg-white/70'
                }`}
                aria-label={`الانتقال إلى الشريحة ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile-optimized controls */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-8 h-8 sm:w-10 sm:h-10 rounded-full backdrop-blur-sm"
            aria-label={isAutoPlay ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
          >
            {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-8 h-8 sm:w-10 sm:h-10 rounded-full backdrop-blur-sm"
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-2 sm:bottom-4 left-4 sm:left-6 z-20">
          <div className="bg-white/20 rounded-full h-1 sm:h-1.5 w-24 sm:w-32 backdrop-blur-sm">
            <div 
              className="bg-white h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: isAutoPlay ? '100%' : '0%',
                transitionDuration: `${autoPlayInterval}ms`
              }}
            />
          </div>
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-2 sm:bottom-4 right-4 sm:right-6 z-20">
          <div className="bg-white/20 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {items.length}
          </div>
        </div>
      </div>

      {/* Mobile-optimized thumbnail strip */}
      <div className="bg-black/80 backdrop-blur-sm p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300 ${
                currentIndex === index 
                  ? 'ring-2 ring-blue-600 transform scale-105' 
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{ width: '80px', height: '60px' }}
              aria-label={`عرض ${item.title}`}
            >
              <OptimizedImage
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="80px"
              />
              <div className="absolute inset-0 bg-black/40" />
              {currentIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mobile-specific carousel component
interface MobileCarouselProps {
  children: React.ReactNode
  className?: string
  showArrows?: boolean
  showDots?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function MobileCarousel({
  children,
  className = '',
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 3000
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay)
  const childrenArray = Array.isArray(children) ? children : [children]
  
  useEffect(() => {
    if (isAutoPlay && childrenArray.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % childrenArray.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [isAutoPlay, childrenArray.length, autoPlayInterval])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + childrenArray.length) % childrenArray.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % childrenArray.length)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && childrenArray.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 rounded-full shadow-md"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 rounded-full shadow-md"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </>
      )}

      {showDots && childrenArray.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {childrenArray.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300'
              }`}
              aria-label={`الانتقال إلى العنصر ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}