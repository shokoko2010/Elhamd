'use client'

import { useState, useEffect } from 'react'
import { 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  ServerCrash, 
  ShieldAlert, 
  TriangleAlert,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EnhancedErrorHandlerProps {
  error: any
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  className?: string
  variant?: 'inline' | 'card' | 'banner' | 'modal' | 'toast'
}

export function EnhancedErrorHandler({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = '',
  variant = 'inline'
}: EnhancedErrorHandlerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Generate helpful suggestions based on error type
    const generateSuggestions = () => {
      const errorType = getErrorType(error)
      const suggestionMap: Record<string, string[]> = {
        network: [
          'تحقق من اتصال الإنترنت',
          'حاول إعادة تشغيل الواي فاي',
          'انتظر قليلاً ثم حاول مرة أخرى'
        ],
        timeout: [
          'تحقق من سرعة الإنترنت',
          'حاول تقليل عدد البيانات المطلوبة',
          'جرب مرة أخرى بعد دقيقة'
        ],
        server: [
          'الخادم قد يكون تحت الصيانة',
          'حاول مرة أخرى بعد بضع دقائق',
          'تحقق من حالة الخادم'
        ],
        auth: [
          'تأكد من تسجيل الدخول',
          'تحقق من صلاحياتك',
          'حاول تسجيل الخروج ثم الدخول مرة أخرى'
        ],
        validation: [
          'تحقق من البيانات المدخلة',
          'تأكد من تعبئة جميع الحقول المطلوبة',
          'تحقق من صغة البريد الإلكتروني'
        ],
        notfound: [
          'الصفحة أو البيانات غير موجودة',
          'تحقق من الرابط',
          'عد إلى الصفحة الرئيسية'
        ],
        unknown: [
          'حاول تحديث الصفحة',
          'أغلق المتصفح وأعد فتحه',
          'اتصل بالدعم الفني'
        ]
      }

      return suggestionMap[errorType] || suggestionMap.unknown
    }

    setSuggestions(generateSuggestions())
  }, [error])

  const getErrorType = (error: any): string => {
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') return 'network'
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') return 'timeout'
    if (error.status === 500 || error.status === 502 || error.status === 503) return 'server'
    if (error.status === 401 || error.status === 403) return 'auth'
    if (error.status === 400) return 'validation'
    if (error.status === 404) return 'notfound'
    return 'unknown'
  }

  const getErrorIcon = (errorType: string) => {
    const iconMap = {
      network: <WifiOff className="h-5 w-5" />,
      timeout: <Clock className="h-5 w-5" />,
      server: <ServerCrash className="h-5 w-5" />,
      auth: <ShieldAlert className="h-5 w-5" />,
      validation: <TriangleAlert className="h-5 w-5" />,
      notfound: <XCircle className="h-5 w-5" />,
      unknown: <AlertCircle className="h-5 w-5" />
    }
    return iconMap[errorType] || iconMap.unknown
  }

  const getErrorInfo = (error: any) => {
    const errorType = getErrorType(error)
    const infoMap = {
      network: {
        title: 'مشكلة في الاتصال',
        description: 'لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت.',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        badge: 'اتصال'
      },
      timeout: {
        title: 'انتهت مهلة الاتصال',
        description: 'استغرق الخادم وقتاً طويلاً للرد.',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        badge: 'مهلة'
      },
      server: {
        title: 'خطأ في الخادم',
        description: 'حدث خطأ في الخادم. نحن نعمل على إصلاحه.',
        color: 'text-red-600 bg-red-50 border-red-200',
        badge: 'خادم'
      },
      auth: {
        title: 'مشكلة في المصادقة',
        description: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة.',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        badge: 'مصادقة'
      },
      validation: {
        title: 'بيانات غير صالحة',
        description: 'البيانات المدخلة غير صحيحة.',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        badge: 'تحقق'
      },
      notfound: {
        title: 'الصفحة غير موجودة',
        description: 'الصفحة المطلوبة غير موجودة.',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        badge: '404'
      },
      unknown: {
        title: 'خطأ غير متوقع',
        description: 'حدث خطأ غير متوقع.',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        badge: 'خطأ'
      }
    }
    return infoMap[errorType] || infoMap.unknown
  }

  const errorType = getErrorType(error)
  const errorInfo = getErrorInfo(error)
  const errorIcon = getErrorIcon(errorType)

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  if (variant === 'banner') {
    return (
      <div className={`w-full p-4 rounded-lg border ${errorInfo.color} ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {errorIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{errorInfo.title}</h3>
              <Badge variant="outline" className="text-xs">
                {errorInfo.badge}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mb-2">{errorInfo.description}</p>
            {showDetails && isExpanded && (
              <div className="mt-2 p-2 bg-black/5 rounded text-xs font-mono overflow-x-auto">
                {error.message || error.toString()}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={handleRetry}>
                <RefreshCw className="w-3 h-3 mr-1" />
                إعادة المحاولة
              </Button>
              {showDetails && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={`${errorInfo.color} ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {errorIcon}
            {errorInfo.title}
            <Badge variant="outline">{errorInfo.badge}</Badge>
          </CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {showDetails && (
            <div className="mb-4 p-3 bg-black/5 rounded text-sm font-mono overflow-x-auto">
              {error.message || error.toString()}
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">اقتراحات للحل:</h4>
              <ul className="text-sm space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة المحاولة
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                تحديث الصفحة
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="w-4 h-4 mr-2" />
                الرئيسية
              </Button>
              {onDismiss && (
                <Button variant="ghost" onClick={onDismiss}>
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${errorInfo.color}`}>
                {errorIcon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{errorInfo.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {errorInfo.badge}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{errorInfo.description}</p>
            
            {showDetails && (
              <div className="mb-4 p-3 bg-gray-50 rounded text-sm font-mono overflow-x-auto">
                {error.message || error.toString()}
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-2">ماذا يمكنك فعله:</h4>
              <ul className="text-sm space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة المحاولة
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  تحديث الصفحة
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  الرئيسية
                </Button>
              </div>
              {onDismiss && (
                <Button variant="ghost" onClick={onDismiss}>
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default inline variant
  return (
    <div className={`p-4 rounded-lg border ${errorInfo.color} ${className}`}>
      <div className="flex items-center gap-3">
        {errorIcon}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{errorInfo.title}</span>
            <Badge variant="outline" className="text-xs">
              {errorInfo.badge}
            </Badge>
          </div>
          <p className="text-sm opacity-90">{errorInfo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Error boundary component for React
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true)
      setError(event.error)
      onError?.(event.error, { componentStack: '' })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true)
      setError(new Error(event.reason))
      onError?.(new Error(event.reason), { componentStack: '' })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onError])

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EnhancedErrorHandler
          error={error}
          variant="card"
          onRetry={() => {
            setHasError(false)
            setError(null)
            window.location.reload()
          }}
          showDetails={true}
        />
      </div>
    )
  }

  return <>{children}</>
}

// Network status indicator
export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs">
        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
        متصل
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-red-600 text-xs">
      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
      غير متصل
    </div>
  )
}