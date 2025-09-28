'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDeviceInfo } from './enhanced-mobile-optimization'

// Touch target size guidelines (Apple HIG: 44pt minimum, Android: 48dp minimum)
interface TouchTargetConfig {
  minSize: number // Minimum touch target size in pixels
  preferredSize: number // Preferred touch target size in pixels
  spacing: number // Minimum spacing between touch targets
  visualFeedback: boolean // Enable visual feedback
  hapticFeedback: boolean // Enable haptic feedback
  adaptiveSize: boolean // Adapt size based on device type
}

interface EnhancedTouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  onLongPress?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'rounded' | 'pill' | 'square'
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
  badge?: string | number
  tooltip?: string
  longPressDelay?: number
  preventDoubleClick?: boolean
  ripple?: boolean
  adaptive?: boolean
}

interface TouchLinkProps {
  children: React.ReactNode
  href: string
  className?: string
  external?: boolean
  download?: boolean
  newTab?: boolean
  showExternalIcon?: boolean
  touchArea?: 'auto' | 'full' | 'icon'
}

// Enhanced touch button with comprehensive accessibility and mobile optimization
export function EnhancedTouchButton({
  children,
  onClick,
  onLongPress,
  className = '',
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  badge,
  tooltip,
  longPressDelay = 500,
  preventDoubleClick = true,
  ripple = true,
  adaptive = true,
}: EnhancedTouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [lastClickTime, setLastClickTime] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const longPressTimeout = useRef<NodeJS.Timeout>()
  const deviceInfo = useDeviceInfo()

  const config: TouchTargetConfig = {
    minSize: deviceInfo.isMobile ? 44 : 32,
    preferredSize: deviceInfo.isMobile ? 48 : 40,
    spacing: deviceInfo.isMobile ? 12 : 8,
    visualFeedback: true,
    hapticFeedback: deviceInfo.isMobile,
    adaptiveSize: adaptive,
  }

  const getVariantClasses = useCallback(() => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:border-gray-300 disabled:text-gray-400',
      ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
    }
    return variants[variant]
  }, [variant])

  const getSizeClasses = useCallback(() => {
    const baseSize = adaptive ? config.preferredSize : 48
    const sizes = {
      xs: `h-8 min-h-[2rem] text-xs px-3 py-1`,
      sm: `h-10 min-h-[2.5rem] text-sm px-4 py-2`,
      md: `h-12 min-h-[3rem] text-base px-6 py-3`,
      lg: `h-14 min-h-[3.5rem] text-lg px-8 py-4`,
      xl: `h-16 min-h-[4rem] text-xl px-10 py-5`,
    }
    
    // Adjust sizes for mobile
    if (deviceInfo.isMobile) {
      return sizes[size].replace(/min-h-\[([^\]]+)\]/g, (match, size) => {
        const numericSize = parseInt(size)
        return `min-h-[${Math.max(numericSize, config.minSize)}px]`
      })
    }
    
    return sizes[size]
  }, [size, adaptive, config, deviceInfo.isMobile])

  const getShapeClasses = useCallback(() => {
    const shapes = {
      rounded: 'rounded-lg',
      pill: 'rounded-full',
      square: 'rounded-none',
    }
    return shapes[shape]
  }, [shape])

  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || loading) return

    setIsPressed(true)
    
    // Haptic feedback
    if (config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimeout.current = setTimeout(() => {
        onLongPress()
        if (config.hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(20)
        }
      }, longPressDelay)
    }

    // Create ripple effect
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const x = clientX - rect.left
      const y = clientY - rect.top
      
      const newRipple = { x, y, id: Date.now() }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
  }, [disabled, loading, onLongPress, config.hapticFeedback, ripple, longPressDelay])

  const handlePressEnd = useCallback(() => {
    setIsPressed(false)
    
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current)
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled || loading) return

    // Prevent double clicks
    if (preventDoubleClick) {
      const now = Date.now()
      if (now - lastClickTime < 300) {
        e.preventDefault()
        return
      }
      setLastClickTime(now)
    }

    // Haptic feedback for click
    if (config.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5)
    }

    onClick?.()
  }, [disabled, loading, onClick, preventDoubleClick, lastClickTime, config.hapticFeedback])

  const baseClasses = [
    'relative',
    'overflow-hidden',
    'font-medium',
    'transition-all',
    'duration-200',
    'transform',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'select-none',
    getVariantClasses(),
    getSizeClasses(),
    getShapeClasses(),
    fullWidth && 'w-full',
    isPressed && 'scale-95',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        className={baseClasses}
        onClick={handleClick}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        disabled={disabled || loading}
        aria-busy={loading}
        title={tooltip}
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
        
        {/* Badge */}
        {badge && !loading && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </span>
        )}
        
        {/* Content */}
        <span className={`flex items-center justify-center gap-2 ${loading ? 'invisible' : ''} ${
          iconPosition === 'top' || iconPosition === 'bottom' ? 'flex-col' : ''
        }`}>
          {icon && (iconPosition === 'left' || iconPosition === 'top') && icon}
          {children}
          {icon && (iconPosition === 'right' || iconPosition === 'bottom') && icon}
        </span>
      </button>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}

// Enhanced touch-friendly link
export function EnhancedTouchLink({
  children,
  href,
  className = '',
  external = false,
  download = false,
  newTab = false,
  showExternalIcon = true,
  touchArea = 'auto',
}: TouchLinkProps) {
  const deviceInfo = useDeviceInfo()
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (deviceInfo.isMobile) {
      // Haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(5)
      }
    }

    if (external || newTab) {
      e.preventDefault()
      window.open(href, newTab ? '_blank' : '_self', 'noopener,noreferrer')
    }
  }, [href, external, newTab, deviceInfo.isMobile])

  const linkClasses = [
    'relative',
    'inline-flex',
    'items-center',
    'gap-1',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'rounded',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    touchArea === 'full' ? 'p-2 -m-2' : '',
    isPressed && 'scale-95',
    deviceInfo.isMobile ? 'min-h-[44px]' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <a
      href={href}
      className={linkClasses}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      download={download}
      target={external || newTab ? '_blank' : undefined}
      rel={external || newTab ? 'noopener noreferrer' : undefined}
    >
      {children}
      {external && showExternalIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </a>
  )
}

// Touch-friendly card with enhanced interaction
interface TouchCardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  pressable?: boolean
  hoverEffect?: boolean
  ripple?: boolean
  hapticFeedback?: boolean
}

export function TouchCard({
  children,
  onClick,
  className = '',
  disabled = false,
  pressable = true,
  hoverEffect = true,
  ripple = true,
  hapticFeedback = true,
}: TouchCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const deviceInfo = useDeviceInfo()

  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !onClick) return

    setIsPressed(true)
    
    if (hapticFeedback && deviceInfo.isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }

    if (ripple && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const x = clientX - rect.left
      const y = clientY - rect.top
      
      const newRipple = { x, y, id: Date.now() }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }
  }, [disabled, onClick, hapticFeedback, ripple, deviceInfo.isMobile])

  const handleInteractionEnd = useCallback(() => {
    setIsPressed(false)
  }, [])

  const handleClick = useCallback(() => {
    if (disabled || !onClick) return

    if (hapticFeedback && deviceInfo.isMobile && 'vibrate' in navigator) {
      navigator.vibrate(5)
    }

    onClick()
  }, [disabled, onClick, hapticFeedback, deviceInfo.isMobile])

  const cardClasses = [
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-200',
    'rounded-lg',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    pressable && !disabled ? 'cursor-pointer' : '',
    hoverEffect && !disabled ? 'hover:shadow-lg hover:scale-[1.02]' : '',
    isPressed && pressable ? 'scale-95' : '',
    deviceInfo.isMobile ? 'min-h-[44px]' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      onClick={pressable ? handleClick : undefined}
      onMouseDown={pressable ? handleInteractionStart : undefined}
      onMouseUp={pressable ? handleInteractionEnd : undefined}
      onMouseLeave={pressable ? handleInteractionEnd : undefined}
      onTouchStart={pressable ? handleInteractionStart : undefined}
      onTouchEnd={pressable ? handleInteractionEnd : undefined}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white opacity-20 rounded-full animate-ripple"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}
      
      {children}
    </div>
  )
}

// Touch-friendly form controls
interface TouchInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  className?: string
  icon?: React.ReactNode
  clearable?: boolean
}

export function TouchInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  icon,
  clearable = true,
}: TouchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const deviceInfo = useDeviceInfo()

  const inputClasses = [
    'w-full',
    'px-4',
    'py-3',
    'border',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    deviceInfo.isMobile ? 'text-lg min-h-[44px]' : '',
    icon ? 'pr-12' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

// Add CSS for ripple animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    .animate-ripple {
      animation: ripple 0.6s ease-out;
    }
  `
  document.head.appendChild(style)
}