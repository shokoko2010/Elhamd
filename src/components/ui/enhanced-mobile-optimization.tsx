'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'

// Enhanced mobile detection and responsive utilities
interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  isTouchDevice: boolean
  isIOS: boolean
  isAndroid: boolean
  connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'unknown'
  isOnline: boolean
}

interface ResponsiveConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  touchTargets: {
    minSize: number
    preferredSize: number
    spacing: number
  }
  animations: {
    enabled: boolean
    reducedMotion: boolean
  }
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
    orientation: 'landscape',
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    isOnline: true,
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      const ua = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(ua)
      const isAndroid = /Android/.test(ua)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      const orientation = width > height ? 'landscape' : 'portrait'
      
      // Get connection info if available
      const connection = (navigator as any).connection
      const connectionType = connection?.effectiveType || 'unknown'
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isTouchDevice,
        isIOS,
        isAndroid,
        connectionType,
        isOnline: navigator.onLine,
      })
    }

    updateDeviceInfo()
    
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
    window.addEventListener('online', updateDeviceInfo)
    window.addEventListener('offline', updateDeviceInfo)
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateDeviceInfo)
    }

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
      window.removeEventListener('online', updateDeviceInfo)
      window.removeEventListener('offline', updateDeviceInfo)
      
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateDeviceInfo)
      }
    }
  }, [])

  return deviceInfo
}

// Enhanced responsive container with mobile-first approach
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  maxWidth?: string
  centerContent?: boolean
  padding?: string | { mobile?: string; tablet?: string; desktop?: string }
}

export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  maxWidth = '1200px',
  centerContent = true,
  padding = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
}: ResponsiveContainerProps) {
  const deviceInfo = useDeviceInfo()
  
  const getPadding = useCallback(() => {
    if (typeof padding === 'string') return padding
    if (deviceInfo.isMobile && padding.mobile) return padding.mobile
    if (deviceInfo.isTablet && padding.tablet) return padding.tablet
    if (deviceInfo.isDesktop && padding.desktop) return padding.desktop
    return '1rem'
  }, [deviceInfo, padding])

  const responsiveClasses = [
    className,
    deviceInfo.isMobile && mobileClassName,
    deviceInfo.isTablet && tabletClassName,
    deviceInfo.isDesktop && desktopClassName,
  ].filter(Boolean).join(' ')

  const containerStyle = {
    maxWidth,
    margin: centerContent ? '0 auto' : undefined,
    padding: getPadding(),
  }

  return (
    <div className={responsiveClasses} style={containerStyle}>
      {children}
    </div>
  )
}

// Touch-friendly button with enhanced mobile features
interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  hapticFeedback?: boolean
  ripple?: boolean
}

export function TouchButton({
  children,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  hapticFeedback = true,
  ripple = true,
}: TouchButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const deviceInfo = useDeviceInfo()

  const getVariantClasses = useCallback(() => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--brand-primary,#0A1A3F)] text-white hover:bg-[color-mix(in_oklab,var(--brand-primary,#0A1A3F)_85%,white_15%)] active:bg-[color-mix(in_oklab,var(--brand-primary,#0A1A3F)_80%,black_20%)] shadow-[0_10px_30px_rgba(var(--brand-primary-500-rgb,10,26,63),0.2)]'
      case 'secondary':
        return 'bg-[var(--brand-secondary-50,#fbecec)] text-[var(--brand-secondary,#C1272D)] hover:bg-[color-mix(in_oklab,var(--brand-secondary-50,#fbecec)_80%,white_20%)] active:bg-[color-mix(in_oklab,var(--brand-secondary-50,#fbecec)_70%,var(--brand-secondary,#C1272D)_30%)]'
      case 'outline':
        return 'border-2 border-[var(--brand-primary,#0A1A3F)] text-[var(--brand-primary,#0A1A3F)] hover:bg-[color-mix(in_oklab,var(--brand-primary,#0A1A3F)_10%,white_90%)] active:bg-[color-mix(in_oklab,var(--brand-primary,#0A1A3F)_14%,white_86%)]'
      case 'ghost':
        return 'text-[var(--brand-primary-700,#061028)] hover:bg-[color-mix(in_oklab,var(--brand-primary-50,#eef1f6)_80%,white_20%)] active:bg-[color-mix(in_oklab,var(--brand-primary-50,#eef1f6)_70%,white_30%)]'
      default:
        return 'bg-[var(--brand-primary,#0A1A3F)] text-white hover:bg-[color-mix(in_oklab,var(--brand-primary,#0A1A3F)_85%,white_15%)] active:bg-[color-mix(in_oklab,var(--brand-primary,#0A1A3F)_80%,black_20%)] shadow-[0_10px_30px_rgba(var(--brand-primary-500-rgb,10,26,63),0.2)]'
    }
  }, [variant])

  const getSizeClasses = useCallback(() => {
    const sizes = {
      sm: deviceInfo.isMobile ? 'h-10 min-h-[2.5rem] text-sm px-4 py-2' : 'h-8 text-xs px-3 py-1',
      md: deviceInfo.isMobile ? 'h-12 min-h-[3rem] text-base px-6 py-3' : 'h-10 text-sm px-4 py-2',
      lg: deviceInfo.isMobile ? 'h-14 min-h-[3.5rem] text-lg px-8 py-4' : 'h-12 text-base px-6 py-3',
      xl: deviceInfo.isMobile ? 'h-16 min-h-[4rem] text-xl px-10 py-5' : 'h-14 text-lg px-8 py-4',
    }
    return sizes[size]
  }, [size, deviceInfo.isMobile])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled || loading) return

    // Haptic feedback for mobile devices
    if (hapticFeedback && deviceInfo.isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // Ripple effect
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newRipple = { x, y, id: Date.now() }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }

    onClick?.()
  }, [disabled, loading, hapticFeedback, ripple, deviceInfo.isMobile, onClick])

  const baseClasses = [
    'relative',
    'overflow-hidden',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'transform',
    'active:scale-95',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    getVariantClasses(),
    getSizeClasses(),
    fullWidth && 'w-full',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={buttonRef}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white opacity-30 rounded-full animate-ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Content */}
      <span className={`flex items-center justify-center gap-2 ${loading ? 'invisible' : ''}`}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </button>
  )
}

// Swipeable card component for mobile
interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
  disabled?: boolean
  threshold?: number
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  disabled = false,
  threshold = 50,
}: SwipeableCardProps) {
  const deviceInfo = useDeviceInfo()
  
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    onSwipedUp: () => onSwipeUp?.(),
    onSwipedDown: () => onSwipeDown?.(),
    delta: threshold,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  })

  if (!deviceInfo.isTouchDevice || disabled) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  return (
    <div
      {...handlers}
      className={`touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  )
}

// Mobile-optimized bottom sheet
interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxHeight?: string
  snapPoints?: number[]
  defaultSnap?: number
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  maxHeight = '80vh',
  snapPoints = [0.25, 0.5, 0.75],
  defaultSnap = 1,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [isDragging, setIsDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const deviceInfo = useDeviceInfo()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sheetRef.current) return
    
    setIsDragging(true)
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const sheetHeight = sheetRef.current.offsetHeight
    const windowHeight = window.innerHeight
    
    const progress = Math.max(0, Math.min(1, (windowHeight - clientY) / sheetHeight))
    const snapIndex = Math.round(progress * (snapPoints.length - 1))
    
    setCurrentSnap(snapIndex)
  }, [snapPoints])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    if (currentSnap === 0) {
      onClose()
    }
  }, [currentSnap, onClose])

  if (!deviceInfo.isMobile || !isOpen) return null

  const snapHeight = snapPoints[currentSnap] * 100

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform"
        style={{
          height: `${snapHeight}vh`,
          maxHeight,
          transform: isDragging ? 'none' : undefined,
        }}
        onMouseDown={handleDrag}
        onMouseMove={isDragging ? handleDrag : undefined}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDrag}
        onTouchMove={isDragging ? handleDrag : undefined}
        onTouchEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Title */}
        {title && (
          <div className="px-6 pb-4 border-b">
            <h3 className="text-lg font-semibold text-right">{title}</h3>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 100px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Mobile-first navigation
interface MobileNavProps {
  items: Array<{
    label: string
    href: string
    icon?: React.ReactNode
    badge?: string
  }>
  activeItem?: string
  onItemClick?: (item: string) => void
  className?: string
}

export function MobileNav({
  items,
  activeItem,
  onItemClick,
  className = '',
}: MobileNavProps) {
  const deviceInfo = useDeviceInfo()

  if (!deviceInfo.isMobile) {
    return null
  }

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${className}`}>
      <div className="grid grid-cols-5 gap-1 p-2">
        {items.map((item, index) => (
          <TouchButton
            key={item.href}
            variant={activeItem === item.href ? 'primary' : 'ghost'}
            size="sm"
            fullWidth
            onClick={() => onItemClick?.(item.href)}
            hapticFeedback={true}
            className="flex flex-col gap-1 py-2"
          >
            {item.icon && (
              <div className="text-lg">
                {item.icon}
              </div>
            )}
            <span className="text-xs font-medium">
              {item.label}
            </span>
            {item.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TouchButton>
        ))}
      </div>
    </nav>
  )
}

// Responsive grid with mobile-first approach
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string | { mobile?: string; tablet?: string; desktop?: string }
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  className = '',
}: ResponsiveGridProps) {
  const deviceInfo = useDeviceInfo()
  
  const getCurrentCols = useCallback(() => {
    if (deviceInfo.isMobile && cols.mobile) return cols.mobile
    if (deviceInfo.isTablet && cols.tablet) return cols.tablet
    if (deviceInfo.isDesktop && cols.desktop) return cols.desktop
    return 1
  }, [deviceInfo, cols])

  const getCurrentGap = useCallback(() => {
    if (typeof gap === 'string') return gap
    if (deviceInfo.isMobile && gap.mobile) return gap.mobile
    if (deviceInfo.isTablet && gap.tablet) return gap.tablet
    if (deviceInfo.isDesktop && gap.desktop) return gap.desktop
    return '1rem'
  }, [deviceInfo, gap])

  const gridClasses = [
    'grid',
    `grid-cols-${getCurrentCols()}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={gridClasses} style={{ gap: getCurrentGap() }}>
      {children}
    </div>
  )
}