'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw, Sparkles, Zap, Car, Settings } from 'lucide-react'

interface EnhancedLoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse' | 'wave' | 'car' | 'gear' | 'sparkle'
  text?: string
  className?: string
  showProgress?: boolean
  progress?: number
  animated?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export function EnhancedLoadingIndicator({
  size = 'md',
  variant = 'spinner',
  text,
  className = '',
  showProgress = false,
  progress = 0,
  animated = true,
  color = 'primary'
}: EnhancedLoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  }

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }

  const colorClasses = {
    primary: 'text-blue-600 bg-blue-600',
    secondary: 'text-gray-600 bg-gray-600',
    success: 'text-green-600 bg-green-600',
    warning: 'text-yellow-600 bg-yellow-600',
    error: 'text-red-600 bg-red-600'
  }

  const [currentProgress, setCurrentProgress] = useState(0)

  useEffect(() => {
    if (showProgress && animated) {
      const interval = setInterval(() => {
        setCurrentProgress(prev => Math.min(prev + 1, progress))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [showProgress, progress, animated])

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg">
          <div className="space-y-3 p-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
        {text && <p className={`text-gray-500 mt-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${colorClasses[color].split(' ')[1]} rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${colorClasses[color].split(' ')[1]} rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${colorClasses[color].split(' ')[1]} rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '300ms' }}></div>
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[1]} rounded-full animate-pulse`}></div>
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'wave') {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[1]} rounded-sm`}
            style={{
              animation: animated ? 'wave 1.2s ease-in-out infinite' : 'none',
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'car') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          <Car className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[0]} ${animated ? 'animate-pulse' : ''}`} />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              <div className={`w-1 h-1 ${colorClasses[color].split(' ')[1]} rounded-full animate-ping`}></div>
              <div className={`w-1 h-1 ${colorClasses[color].split(' ')[1]} rounded-full animate-ping`} style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'gear') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Settings className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[0]} ${animated ? 'animate-spin' : ''}`} />
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'sparkle') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative">
          <Sparkles className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[0]} ${animated ? 'animate-pulse' : ''}`} />
          <div className="absolute -top-1 -right-1">
            <Zap className={`w-3 h-3 ${colorClasses[color].split(' ')[0]} ${animated ? 'animate-bounce' : ''}`} />
          </div>
        </div>
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color].split(' ')[0]} ${animated ? 'animate-spin' : ''}`} />
      {text && <p className={`text-gray-600 mt-2 ${textClasses[size]}`}>{text}</p>}
      {showProgress && (
        <div className="w-full mt-3">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`${colorClasses[color].split(' ')[1]} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{currentProgress}%</p>
        </div>
      )}
    </div>
  )
}

interface EnhancedLoadingCardProps {
  title?: string
  description?: string
  className?: string
  variant?: 'default' | 'minimal' | 'elegant' | 'modern'
  icon?: React.ReactNode
}

export function EnhancedLoadingCard({ 
  title = 'جاري التحميل...', 
  description, 
  className = '',
  variant = 'default',
  icon
}: EnhancedLoadingCardProps) {
  const baseClasses = "rounded-lg shadow-lg p-6 backdrop-blur-sm"
  
  const variantClasses = {
    default: "bg-white/90 border border-gray-200",
    minimal: "bg-transparent border-0",
    elegant: "bg-gradient-to-br from-white/95 to-gray-50/95 border border-gray-100",
    modern: "bg-gray-900/90 text-white border border-gray-700"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex flex-col items-center justify-center">
        {icon || (
          <div className="mb-4">
            <EnhancedLoadingIndicator size="lg" variant="sparkle" color="primary" />
          </div>
        )}
        <h3 className={`text-lg font-semibold text-center mb-2 ${variant === 'modern' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-center ${variant === 'modern' ? 'text-gray-300' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

interface EnhancedLoadingOverlayProps {
  text?: string
  className?: string
  transparent?: boolean
  blur?: boolean
  variant?: 'default' | 'glass' | 'solid'
}

export function EnhancedLoadingOverlay({ 
  text = 'جاري التحميل...', 
  className = '', 
  transparent = false,
  blur = true,
  variant = 'default'
}: EnhancedLoadingOverlayProps) {
  const overlayClasses = {
    default: transparent ? 'bg-black/20' : 'bg-white/80',
    glass: 'bg-black/40 backdrop-blur-md',
    solid: 'bg-white/95'
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClasses[variant]} ${blur ? 'backdrop-blur-sm' : ''} ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm mx-4">
        <div className="mb-4">
          <EnhancedLoadingIndicator size="xl" variant="car" color="primary" />
        </div>
        <p className="text-gray-700 text-center font-medium">{text}</p>
      </div>
    </div>
  )
}

interface EnhancedErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'detailed'
  icon?: React.ReactNode
}

export function EnhancedErrorState({ 
  title = 'حدث خطأ', 
  message = 'فشل تحميل البيانات. يرجى المحاولة مرة أخرى.', 
  onRetry,
  className = '',
  variant = 'default',
  icon
}: EnhancedErrorStateProps) {
  const baseClasses = "text-center py-8"
  
  if (variant === 'minimal') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="flex flex-col items-center">
          {icon || <AlertCircle className="h-8 w-8 text-red-500 mb-2" />}
          <p className="text-gray-600 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              إعادة المحاولة
            </button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="max-w-md mx-auto">
          {icon || <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="flex flex-col items-center">
        {icon || <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  )
}

// Preset loading components for common use cases
export function EnhancedPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedLoadingCard 
        title="جاري تحميل الصفحة..."
        description="يرجى الانتظار بينما نقوم بتحميل المحتوى"
        variant="elegant"
        icon={<EnhancedLoadingIndicator size="xl" variant="sparkle" color="primary" />}
      />
    </div>
  )
}

export function EnhancedContentLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <EnhancedLoadingIndicator key={i} variant="skeleton" />
      ))}
    </div>
  )
}

export function EnhancedButtonLoading({ text = 'جاري المعالجة...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <EnhancedLoadingIndicator size="sm" variant="dots" color="primary" />
      <span>{text}</span>
    </div>
  )
}

// Add custom animation for wave effect (client-side only)
export function useWaveAnimation() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.3); }
        }
      `
      document.head.appendChild(style)
      
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])
}