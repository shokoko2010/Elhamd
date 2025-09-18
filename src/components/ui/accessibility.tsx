'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Keyboard, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun,
  ZoomIn,
  ZoomOut,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Skip to main content link for screen readers
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
    >
      تخطي إلى المحتوى الرئيسي
    </a>
  )
}

// Accessible button component
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  variant = 'default',
  size = 'md'
}: AccessibleButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {children}
    </button>
  )
}

// Screen reader announcements
interface AnnouncerProps {
  message: string
  politeness?: 'polite' | 'assertive'
}

export function Announcer({ message, politeness = 'polite' }: AnnouncerProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Focus trap for modals
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    document.addEventListener('keydown', handleEscape)

    // Focus first element when trap is activated
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTab)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isActive])

  return containerRef
}

// Keyboard navigation helper
export function useKeyboardNavigation(
  items: string[],
  onSelect: (index: number) => void,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length)
        break
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          e.preventDefault()
          onSelect(focusedIndex)
        }
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(items.length - 1)
        break
    }
  }

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown
  }
}

// High contrast mode toggle
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isHighContrast])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsHighContrast(!isHighContrast)}
      aria-label={isHighContrast ? 'إيقاف التباين العالي' : 'تفعيل التباين العالي'}
    >
      {isHighContrast ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </Button>
  )
}

// Text size controls
export function TextSizeControls() {
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md')

  useEffect(() => {
    document.documentElement.classList.remove('text-sm', 'text-md', 'text-lg')
    document.documentElement.classList.add(`text-${textSize}`)
  }, [textSize])

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTextSize('sm')}
        aria-label="نص صغير"
        className={textSize === 'sm' ? 'bg-blue-100' : ''}
      >
        <Type className="w-3 h-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTextSize('md')}
        aria-label="نص متوسط"
        className={textSize === 'md' ? 'bg-blue-100' : ''}
      >
        <Type className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTextSize('lg')}
        aria-label="نص كبير"
        className={textSize === 'lg' ? 'bg-blue-100' : ''}
      >
        <Type className="w-5 h-5" />
      </Button>
    </div>
  )
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Accessible form controls
interface AccessibleInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  type?: string
  id?: string
  className?: string
}

export function AccessibleInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  type = 'text',
  id,
  className = ''
}: AccessibleInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
      />
      {error && (
        <div id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

// Accessible image component
interface AccessibleImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
}

export function AccessibleImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy'
}: AccessibleImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.alt = `فشل تحميل الصورة: ${alt}`
        target.style.border = '2px dashed red'
      }}
    />
  )
}

// Accessibility toolbar
export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isScreenReader, setIsScreenReader] = useState(false)

  useEffect(() => {
    if (isReducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [isReducedMotion])

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="إعدادات الوصولية"
        className="rounded-full w-12 h-12 p-0"
      >
        <Keyboard className="w-5 h-5" />
      </Button>

      {isOpen && (
        <Card className="absolute bottom-16 left-0 w-80 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">إعدادات الوصولية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">حجم النص</span>
              <TextSizeControls />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">التباين العالي</span>
              <HighContrastToggle />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">تقليل الحركة</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReducedMotion(!isReducedMotion)}
                aria-label={isReducedMotion ? 'إيقاف تقليل الحركة' : 'تفعيل تقليل الحركة'}
              >
                {isReducedMotion ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">وضع قارئ الشاشة</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScreenReader(!isScreenReader)}
                aria-label={isScreenReader ? 'إيقاف وضع قارئ الشاشة' : 'تفعيل وضع قارئ الشاشة'}
              >
                {isScreenReader ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                className="w-full"
              >
                إعادة ضبط الإعدادات
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Landmark regions for better screen reader navigation
export function LandmarkRegions({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SkipToContent />
      <header role="banner" aria-label="رأس الصفحة">
        {/* Header content */}
      </header>
      
      <nav role="navigation" aria-label="التنقل الرئيسي">
        {/* Navigation content */}
      </nav>
      
      <main id="main-content" role="main" aria-label="المحتوى الرئيسي">
        {children}
      </main>
      
      <aside role="complementary" aria-label="معلومات إضافية">
        {/* Sidebar content */}
      </aside>
      
      <footer role="contentinfo" aria-label="تذييل الصفحة">
        {/* Footer content */}
      </footer>
      
      <AccessibilityToolbar />
    </div>
  )
}