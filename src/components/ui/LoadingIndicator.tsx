'use client'

import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse'
  text?: string
  className?: string
  showProgress?: boolean
  progress?: number
}

export function LoadingIndicator({
  size = 'md',
  variant = 'spinner',
  text,
  className = '',
  showProgress = false,
  progress = 0,
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

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
        <div className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '0ms' }}></div>
        <div className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '150ms' }}></div>
        <div className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses[size]}`} style={{ animationDelay: '300ms' }}></div>
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
        {text && <p className={`text-gray-600 mr-2 ${textClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      {text && <p className={`text-gray-600 mt-2 ${textClasses[size]}`}>{text}</p>}
      {showProgress && (
        <div className="w-full mt-3">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
        </div>
      )}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ title = 'جاري التحميل...', description, className = '' }: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <LoadingIndicator size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 text-center">{description}</p>}
    </div>
  )
}

interface LoadingOverlayProps {
  text?: string
  className?: string
  transparent?: boolean
}

export function LoadingOverlay({ text = 'جاري التحميل...', className = '', transparent = false }: LoadingOverlayProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${transparent ? 'bg-black/20' : 'bg-white/80'} ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center">
        <LoadingIndicator size="lg" />
        <p className="text-gray-700 mt-3">{text}</p>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title = 'حدث خطأ', 
  message = 'فشل تحميل البيانات. يرجى المحاولة مرة أخرى.', 
  onRetry,
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
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
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  title = 'لا توجد بيانات', 
  message = 'لا توجد بيانات لعرضها حالياً.', 
  icon,
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Preset loading components for common use cases
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingCard 
        title="جاري تحميل الصفحة..."
        description="يرجى الانتظار بينما نقوم بتحميل المحتوى"
      />
    </div>
  )
}

export function ContentLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <LoadingIndicator key={i} variant="skeleton" />
      ))}
    </div>
  )
}

export function ButtonLoading({ text = 'جاري المعالجة...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingIndicator size="sm" />
      <span>{text}</span>
    </div>
  )
}