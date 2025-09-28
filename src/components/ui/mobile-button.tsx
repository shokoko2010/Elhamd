'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        mobile: 'h-12 px-6 py-3 text-base rounded-lg', // Mobile-optimized larger touch target
        mobileSm: 'h-10 px-4 py-2.5 text-sm rounded-lg', // Mobile medium
        mobileIcon: 'h-12 w-12 rounded-lg', // Mobile icon button
      },
      responsive: {
        true: 'text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4 py-2 sm:py-2.5',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      alignment: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
        between: 'justify-between',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      responsive: false,
      fullWidth: false,
      alignment: 'center',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  responsive?: boolean
  fullWidth?: boolean
  alignment?: 'left' | 'center' | 'right' | 'between'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    responsive,
    fullWidth,
    alignment,
    loading = false,
    loadingText = 'جاري التحميل...',
    icon,
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className="animate-spin" />
            <span>{loadingText}</span>
          </>
        )
      }

      return (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )
    }

    return (
      <button
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            responsive,
            fullWidth,
            alignment,
            className 
          }),
          // Mobile-specific improvements
          'min-h-[44px] min-w-[44px]', // iOS minimum touch target size
          'active:scale-95 transition-transform', // Touch feedback
          'select-none', // Prevent text selection on touch
          loading && 'cursor-not-allowed'
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Mobile-optimized button group component
interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  responsive?: boolean
}

const ButtonGroup = ({
  children,
  orientation = 'horizontal',
  spacing = 'sm',
  className,
  responsive = false
}: ButtonGroupProps) => {
  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'gap-2' : 'gap-1',
    md: orientation === 'horizontal' ? 'gap-3' : 'gap-2',
    lg: orientation === 'horizontal' ? 'gap-4' : 'gap-3'
  }

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  }

  const responsiveClasses = responsive
    ? orientation === 'horizontal'
      ? 'flex-col sm:flex-row'
      : 'flex-row sm:flex-col'
    : ''

  return (
    <div className={cn(
      'flex',
      orientationClasses[orientation],
      spacingClasses[spacing],
      responsiveClasses,
      className
    )}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child as React.ReactElement<ButtonProps>, {
            key: index,
            fullWidth: responsive ? orientation === 'vertical' : false
          })
        }
        return child
      })}
    </div>
  )
}

// Mobile-optimized action button component for cards and lists
interface ActionButtonProps {
  icon: React.ReactNode
  label?: string
  onClick?: () => void
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showLabel?: 'always' | 'mobile' | 'desktop' | 'never'
  disabled?: boolean
}

const ActionButton = ({
  icon,
  label,
  onClick,
  variant = 'ghost',
  size = 'default',
  className,
  showLabel = 'mobile',
  disabled = false
}: ActionButtonProps) => {
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'mobileSm'
      case 'lg': return 'mobile'
      default: return 'mobile'
    }
  }

  const shouldShowLabel = () => {
    switch (showLabel) {
      case 'always': return true
      case 'never': return false
      case 'mobile': return typeof window !== 'undefined' && window.innerWidth < 768
      case 'desktop': return typeof window !== 'undefined' && window.innerWidth >= 768
      default: return false
    }
  }

  return (
    <Button
      variant={variant}
      size={getButtonSize()}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2',
        showLabel === 'mobile' && 'flex-col sm:flex-row sm:gap-2',
        className
      )}
    >
      {icon}
      {label && shouldShowLabel() && (
        <span className="text-xs sm:text-sm">{label}</span>
      )}
    </Button>
  )
}

// Floating action button for mobile
interface FloatingActionButtonProps {
  icon: React.ReactNode
  label?: string
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  variant?: 'default' | 'destructive' | 'secondary'
  className?: string
  showLabel?: boolean
}

const FloatingActionButton = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  variant = 'default',
  className,
  showLabel = false
}: FloatingActionButtonProps) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  return (
    <Button
      variant={variant}
      size="mobileIcon"
      onClick={onClick}
      className={cn(
        'fixed z-50 shadow-lg rounded-full',
        positionClasses[position],
        'md:hidden', // Only show on mobile
        className
      )}
    >
      {icon}
      {showLabel && label && (
        <span className="absolute left-full ml-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {label}
        </span>
      )}
    </Button>
  )
}

// Mobile-optimized navigation button component
interface NavButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
  badge?: string | number
}

const NavButton = ({
  icon,
  label,
  active = false,
  onClick,
  className,
  badge
}: NavButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] min-h-[60px]',
        'active:scale-95 transition-transform',
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

export {
  Button,
  ButtonGroup,
  ActionButton,
  FloatingActionButton,
  NavButton,
  buttonVariants,
}

export type { ButtonProps, ButtonGroupProps, ActionButtonProps, FloatingActionButtonProps, NavButtonProps }