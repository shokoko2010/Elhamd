'use client'

import { useState, useEffect, useRef, TouchEvent } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { buildSliderImageAlt } from '@/lib/media-utils'

const normalizeContentPosition = (position?: string): SliderContentPosition => {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
    case 'top-center':
    case 'bottom-center':
    case 'top-left':
    case 'bottom-left':
    case 'middle-left':
    case 'middle-center':
    case 'middle-right':
      return position
    case 'left':
      return 'middle-left'
    case 'center':
      return 'middle-center'
    case 'right':
      return 'middle-right'
    case 'top':
      return 'top-center'
    case 'bottom':
      return 'bottom-center'
    default:
      return 'top-right'
  }
}

type SliderContentPosition =
  | 'top-right'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
  | 'top-left'
  | 'bottom-left'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'

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
    contentPosition?: SliderContentPosition
    contentSize?: 'sm' | 'md' | 'lg'
    contentColor?: string
    contentShadow?: boolean
    contentStrokeColor?: string
    contentStrokeWidth?: number
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
      <div
        className="relative w-full h-[70vh] md:h-[80vh]"
        style={{
          background: 'linear-gradient(135deg, var(--brand-primary-900, #030815), var(--brand-primary-600, #081432))'
        }}
      >
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
      <div
        className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--brand-primary-900, #030815), var(--brand-primary-700, #061028))'
        }}
      >
        <div className="text-center text-white">
          <p className="text-lg">لا توجد عروض متاحة حالياً</p>
        </div>
      </div>
    )
  }

  const currentItem = items[currentIndex]
  const heroAlt = buildSliderImageAlt(
    {
      title: currentItem.title,
      subtitle: currentItem.subtitle,
      description: currentItem.description,
      badge: currentItem.badge
    },
    { index: currentIndex }
  )
  const contentPosition = normalizeContentPosition(currentItem.contentPosition)
  const contentColor = currentItem.contentColor || '#ffffff'
  const contentShadow = currentItem.contentShadow !== false
  const contentStrokeColor = currentItem.contentStrokeColor || '#000000'
  const contentStrokeWidth =
    typeof currentItem.contentStrokeWidth === 'number' && currentItem.contentStrokeWidth >= 0
      ? currentItem.contentStrokeWidth
      : 0
  const [verticalAlign, horizontalAlign] = contentPosition.split('-') as [
    'top' | 'middle' | 'bottom',
    'right' | 'center' | 'left'
  ]
  const verticalClass =
    verticalAlign === 'top'
      ? 'justify-start'
      : verticalAlign === 'middle'
        ? 'justify-center'
        : 'justify-end'
  const horizontalAlignmentClass =
    horizontalAlign === 'left'
      ? 'items-start text-left'
      : horizontalAlign === 'center'
        ? 'items-center text-center'
        : 'items-end text-right'
  const textAlignmentClass =
    horizontalAlign === 'left'
      ? 'text-left'
      : horizontalAlign === 'center'
        ? 'text-center'
        : 'text-right'

  const gridPositionClass: Record<SliderContentPosition, string> = {
    'top-left': 'row-start-1 col-start-1',
    'top-center': 'row-start-1 col-start-2',
    'top-right': 'row-start-1 col-start-3',
    'middle-left': 'row-start-2 col-start-1',
    'middle-center': 'row-start-2 col-start-2',
    'middle-right': 'row-start-2 col-start-3',
    'bottom-left': 'row-start-3 col-start-1',
    'bottom-center': 'row-start-3 col-start-2',
    'bottom-right': 'row-start-3 col-start-3'
  }

  const typographyScale: Record<NonNullable<typeof currentItem.contentSize>, {
    title: string
    subtitle: string
    description: string
  }> = {
    sm: {
      title: 'text-2xl md:text-4xl lg:text-5xl',
      subtitle: 'text-lg md:text-xl lg:text-2xl',
      description: 'text-base md:text-lg'
    },
    md: {
      title: 'text-3xl md:text-5xl lg:text-6xl',
      subtitle: 'text-xl md:text-2xl lg:text-3xl',
      description: 'text-lg md:text-xl'
    },
    lg: {
      title: 'text-4xl md:text-6xl lg:text-7xl',
      subtitle: 'text-2xl md:text-3xl lg:text-4xl',
      description: 'text-xl md:text-2xl'
    }
  }

  const sizeKey = (currentItem.contentSize || 'lg') as NonNullable<typeof currentItem.contentSize>
  const typography = typographyScale[sizeKey] || typographyScale.lg
  const textStyle: CSSProperties = {
    color: contentColor,
    textShadow: contentShadow ? '0 8px 30px rgba(0,0,0,0.45)' : undefined,
    WebkitTextStroke: contentStrokeWidth > 0 ? `${contentStrokeWidth}px ${contentStrokeColor}` : undefined
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Full viewport height */}
      <div
        className="relative w-full h-[70vh] md:h-[80vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image - Using standard img for better compatibility with dynamic sources */}
        <div className="absolute inset-0">
          {/* Fallback background color */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary-900, #030815), var(--brand-primary-600, #081432))'
            }}
          />

          <Image
            src={currentItem.imageUrl}
            alt={heroAlt}
            fill
            className="object-cover z-5"
            priority={currentIndex === 0}
            quality={80}
            sizes="(max-width: 768px) 100vw, 100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.triedFallback) {
                target.dataset.triedFallback = 'true';
                // Try fallback image
                target.src = '/slider-punch.jpg';
                console.log('Image load failed, switched to fallback:', currentItem.imageUrl);
              }
            }}
          />

          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 h-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div
              className="grid h-full grid-cols-3 grid-rows-3 pt-16 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20"
              dir="ltr"
            >
              <div
                className={`${gridPositionClass[contentPosition]} flex flex-col gap-4 md:gap-6 ${horizontalAlignmentClass} ${verticalClass}`}
                dir="rtl"
              >
                {/* Badge */}
                {currentItem.badge && (
                  <div className="mb-4">
                    <Badge className="text-white px-4 py-2 rounded-full shadow-lg" style={{
                      backgroundColor: currentItem.badgeColor || 'var(--brand-secondary, #C1272D)'
                    }}>
                      {currentItem.badge}
                    </Badge>
                  </div>
                )}

                {/* Title */}
                <h1 className={`${typography.title} font-bold mb-4 leading-tight`} style={textStyle}>
                  {currentItem.title}
                </h1>

                {/* Subtitle */}
                <h2 className={`${typography.subtitle} mb-6 font-light`} style={textStyle}>
                  {currentItem.subtitle}
                </h2>

                {/* Description */}
                <p
                  className={`${typography.description} mb-8 leading-relaxed max-w-2xl ${textAlignmentClass}`}
                  style={textStyle}
                >
                  {currentItem.description}
                </p>

                {/* CTA Button */}
                <div
                  className={`flex flex-col sm:flex-row gap-4 ${horizontalAlign === 'left'
                    ? 'sm:justify-start'
                    : horizontalAlign === 'center'
                      ? 'sm:justify-center'
                      : 'sm:justify-end'
                    }`}
                >
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center"
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
                    className="border-2 border-white text-white hover:bg-white hover:text-[color:var(--brand-primary-900,#030815)] text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 w-full sm:w-auto justify-center bg-transparent"
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
            className="pointer-events-auto w-12 h-12 rounded-full border border-white/15 bg-[color:rgba(var(--brand-primary-900-rgb,3_8_21),0.7)] text-white shadow-lg transition hover:bg-[color:rgba(var(--brand-primary-700-rgb,6_16_40),0.9)] hover:border-white/25"
            aria-label="السابق"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="pointer-events-auto w-12 h-12 rounded-full border border-white/15 bg-[color:rgba(var(--brand-primary-900-rgb,3_8_21),0.7)] text-white shadow-lg transition hover:bg-[color:rgba(var(--brand-primary-700-rgb,6_16_40),0.9)] hover:border-white/25"
            aria-label="التالي"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        {/* Interactive Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 bg-[color:rgba(var(--brand-primary-900-rgb,3_8_21),0.6)] backdrop-blur-sm px-4 py-3 rounded-full border border-white/10 shadow-lg">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${currentIndex === index
                  ? 'bg-[color:var(--brand-secondary,#C1272D)] w-10 h-3 shadow-lg'
                  : 'bg-white/60 w-3 h-3 hover:bg-white/80 hover:scale-110'
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
          <div className="bg-white/25 backdrop-blur-sm rounded-full h-2 w-36 overflow-hidden border border-white/20 shadow">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear shadow-lg bg-gradient-to-r from-[color:var(--brand-secondary,#C1272D)] via-[color:var(--brand-primary,#0A1A3F)] to-[color:var(--brand-primary-400,#798fb0)]"
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
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all duration-300 ${currentIndex === index
                ? 'ring-2 ring-blue-500 transform scale-105 shadow-2xl'
                : 'opacity-70 hover:opacity-90 hover:scale-102'
                }`}
              style={{ width: '120px', height: '90px' }}
              aria-label={`عرض ${item.title}`}
            >
              <Image
                src={item.imageUrl}
                alt={buildSliderImageAlt(
                  {
                    title: item.title,
                    subtitle: item.subtitle,
                    description: item.description,
                    badge: item.badge
                  },
                  { index }
                )}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90px, 120px"
                quality={60}
                loading="lazy"
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