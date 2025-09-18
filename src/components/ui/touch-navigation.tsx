'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Home,
  Car,
  Phone,
  Menu,
  X,
  Search,
  User,
  Heart,
  Share2,
  Filter,
  Grid,
  List,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Touch-optimized navigation button
interface TouchNavButtonProps {
  icon: React.ReactNode
  label?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'floating'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'static' | 'fixed' | 'absolute'
  className?: string
  badge?: string | number
  disabled?: boolean
  active?: boolean
  ariaLabel?: string
}

export function TouchNavButton({
  icon,
  label,
  onClick,
  variant = 'default',
  size = 'md',
  position = 'static',
  className = '',
  badge,
  disabled = false,
  active = false,
  ariaLabel
}: TouchNavButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  }

  const iconSizeClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-6 h-6 sm:w-7 sm:h-7',
    lg: 'w-7 h-7 sm:w-8 sm:h-8',
    xl: 'w-8 h-8 sm:w-10 sm:h-10'
  }

  const positionClasses = {
    static: '',
    fixed: 'fixed',
    absolute: 'absolute'
  }

  const baseClasses = `
    flex items-center justify-center rounded-full transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-blue-500/30
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    select-none touch-manipulation
  `

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
    outline: 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md',
    ghost: 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-md',
    floating: 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl border-2 border-white'
  }

  const activeClasses = active ? 'ring-4 ring-blue-500/50 scale-105' : ''

  const handleTouchStart = () => {
    setIsPressed(true)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${positionClasses[position]}
        ${variantClasses[variant]}
        ${activeClasses}
        ${className}
        ${isPressed ? 'scale-90' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className={iconSizeClasses[size]}>
        {icon}
      </div>
      
      {badge && (
        <Badge 
          className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white border-2 border-white"
        >
          {badge}
        </Badge>
      )}
      
      {label && (
        <span className="absolute -bottom-6 text-xs font-medium text-gray-600 whitespace-nowrap">
          {label}
        </span>
      )}
    </Button>
  )
}

// Touch-optimized floating action button
interface TouchFABProps {
  icon: React.ReactNode
  label?: string
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'md' | 'lg' | 'xl'
  className?: string
  badge?: string | number
}

export function TouchFAB({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'lg',
  className = '',
  badge
}: TouchFABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <TouchNavButton
      icon={icon}
      label={label}
      onClick={onClick}
      variant="floating"
      size={size}
      position="fixed"
      className={`${positionClasses[position]} ${className}`}
      badge={badge}
    />
  )
}

// Touch-optimized bottom navigation bar
interface TouchBottomNavProps {
  items: Array<{
    id: string
    icon: React.ReactNode
    label: string
    onClick?: () => void
    badge?: string | number
  }>
  activeId?: string
  className?: string
}

export function TouchBottomNav({
  items,
  activeId,
  className = ''
}: TouchBottomNavProps) {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${className}`}>
      <div className="flex justify-around items-center py-2 px-4">
        {items.map((item) => (
          <TouchNavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            variant="ghost"
            size="md"
            active={activeId === item.id}
            badge={item.badge}
            className="flex-col"
          />
        ))}
      </div>
    </nav>
  )
}

// Touch-optimized carousel navigation
interface TouchCarouselNavProps {
  currentIndex: number
  totalItems: number
  onPrevious?: () => void
  onNext?: () => void
  onGoTo?: (index: number) => void
  className?: string
  showDots?: boolean
  showArrows?: boolean
  autoHide?: boolean
}

export function TouchCarouselNav({
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  onGoTo,
  className = '',
  showDots = true,
  showArrows = true,
  autoHide = false
}: TouchCarouselNavProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!autoHide) return

    let timeout: NodeJS.Timeout
    const showControls = () => {
      setIsVisible(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsVisible(false), 3000)
    }

    showControls()
    return () => clearTimeout(timeout)
  }, [autoHide, currentIndex])

  if (!isVisible && autoHide) return null

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto">
            <TouchNavButton
              icon={<ChevronRight />}
              onClick={onPrevious}
              variant="floating"
              size="md"
              ariaLabel="السابق"
              disabled={currentIndex === 0}
            />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-auto">
            <TouchNavButton
              icon={<ChevronLeft />}
              onClick={onNext}
              variant="floating"
              size="md"
              ariaLabel="التالي"
              disabled={currentIndex === totalItems - 1}
            />
          </div>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoTo?.(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`الانتقال إلى العنصر ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {totalItems}
        </div>
      </div>
    </div>
  )
}

// Touch-optimized pagination
interface TouchPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showPageNumbers?: boolean
}

export function TouchPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showPageNumbers = true
}: TouchPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <TouchNavButton
        icon={<ChevronRight />}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        ariaLabel="الصفحة السابقة"
      />

      {showPageNumbers && getPageNumbers().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="text-gray-500 px-2">...</span>
          ) : (
            <TouchNavButton
              icon={<span className="text-sm font-medium">{page}</span>}
              onClick={() => onPageChange(page as number)}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              active={currentPage === page}
              ariaLabel={`الصفحة ${page}`}
            />
          )}
        </div>
      ))}

      <TouchNavButton
        icon={<ChevronLeft />}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        ariaLabel="الصفحة التالية"
      />
    </div>
  )
}

// Touch-optimized filter button
interface TouchFilterButtonProps {
  isActive?: boolean
  count?: number
  onClick?: () => void
  className?: string
  label?: string
}

export function TouchFilterButton({
  isActive = false,
  count,
  onClick,
  className = '',
  label = 'فلاتر'
}: TouchFilterButtonProps) {
  return (
    <TouchNavButton
      icon={<Filter />}
      label={label}
      onClick={onClick}
      variant={isActive ? 'default' : 'outline'}
      size="md"
      badge={count}
      active={isActive}
      className={className}
    />
  )
}

// Touch-optimized view toggle
interface TouchViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  className?: string
}

export function TouchViewToggle({
  view,
  onViewChange,
  className = ''
}: TouchViewToggleProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <TouchNavButton
        icon={<Grid />}
        onClick={() => onViewChange('grid')}
        variant={view === 'grid' ? 'default' : 'outline'}
        size="sm"
        active={view === 'grid'}
        ariaLabel="عرض شبكة"
      />
      <TouchNavButton
        icon={<List />}
        onClick={() => onViewChange('list')}
        variant={view === 'list' ? 'default' : 'outline'}
        size="sm"
        active={view === 'list'}
        ariaLabel="عرض قائمة"
      />
    </div>
  )
}

// Touch-optimized back button
interface TouchBackButtonProps {
  onClick?: () => void
  label?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function TouchBackButton({
  onClick,
  label = 'رجوع',
  className = '',
  variant = 'outline'
}: TouchBackButtonProps) {
  return (
    <TouchNavButton
      icon={<ArrowRight />}
      label={label}
      onClick={onClick || (() => window.history.back())}
      variant={variant}
      size="md"
      className={className}
    />
  )
}

// Touch-optimized action group
interface TouchActionGroupProps {
  actions: Array<{
    id: string
    icon: React.ReactNode
    label: string
    onClick?: () => void
    variant?: 'default' | 'outline' | 'ghost'
    badge?: string | number
  }>
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function TouchActionGroup({
  actions,
  className = '',
  orientation = 'horizontal'
}: TouchActionGroupProps) {
  return (
    <div className={`
      flex ${orientation === 'horizontal' ? 'flex-row gap-2' : 'flex-col gap-2'}
      ${className}
    `}>
      {actions.map((action) => (
        <TouchNavButton
          key={action.id}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
          variant={action.variant || 'outline'}
          size="md"
          badge={action.badge}
          className={orientation === 'vertical' ? 'w-full' : ''}
        />
      ))}
    </div>
  )
}

// Touch-optimized quick actions for vehicle pages
export function VehicleQuickActions({
  vehicleId,
  className = ''
}: {
  vehicleId: string
  className?: string
}) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isShared, setIsShared] = useState(false)

  const actions = [
    {
      id: 'favorite',
      icon: <Heart className={isFavorited ? 'fill-current' : ''} />,
      label: 'مفضلة',
      onClick: () => setIsFavorited(!isFavorited),
      variant: isFavorited ? 'default' : 'outline' as const,
      badge: isFavorited ? '1' : undefined
    },
    {
      id: 'share',
      icon: <Share2 />,
      label: 'مشاركة',
      onClick: () => {
        setIsShared(true)
        setTimeout(() => setIsShared(false), 2000)
      },
      variant: 'outline' as const
    },
    {
      id: 'test-drive',
      icon: <Car />,
      label: 'اختبار قيادة',
      onClick: () => {
        window.location.href = `/test-drive?vehicle=${vehicleId}`
      },
      variant: 'default' as const
    }
  ]

  return (
    <TouchActionGroup
      actions={actions}
      className={className}
      orientation="horizontal"
    />
  )
}