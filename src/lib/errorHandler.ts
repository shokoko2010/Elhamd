// Comprehensive error handling system

export interface AppError {
  code: string
  message: string
  details?: string
  retryable?: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class ErrorHandler {
  private static readonly ERROR_MESSAGES: Record<string, AppError> = {
    // Network errors
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: 'مشكلة في الاتصال بالإنترنت',
      details: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
      retryable: true,
      severity: 'medium'
    },
    
    TIMEOUT_ERROR: {
      code: 'TIMEOUT_ERROR',
      message: 'انتهت مهلة الاتصال',
      details: 'استغرق الخادم وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى',
      retryable: true,
      severity: 'medium'
    },
    
    // API errors
    API_ERROR: {
      code: 'API_ERROR',
      message: 'خطأ في الخادم',
      details: 'حدث خطأ غير متوقع في الخادم. يرجى المحاولة مرة أخرى لاحقاً',
      retryable: true,
      severity: 'high'
    },
    
    NOT_FOUND: {
      code: 'NOT_FOUND',
      message: 'البيانات غير موجودة',
      details: 'عذراً، البيانات المطلوبة غير متوفرة',
      retryable: false,
      severity: 'low'
    },
    
    UNAUTHORIZED: {
      code: 'UNAUTHORIZED',
      message: 'غير مصرح بالدخول',
      details: 'يرجى تسجيل الدخول للمتابعة',
      retryable: false,
      severity: 'medium'
    },
    
    FORBIDDEN: {
      code: 'FORBIDDEN',
      message: 'الوصول مرفوض',
      details: 'ليس لديك صلاحية الوصول إلى هذه البيانات',
      retryable: false,
      severity: 'medium'
    },
    
    VALIDATION_ERROR: {
      code: 'VALIDATION_ERROR',
      message: 'بيانات غير صالحة',
      details: 'يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى',
      retryable: false,
      severity: 'low'
    },
    
    // Database errors
    DATABASE_ERROR: {
      code: 'DATABASE_ERROR',
      message: 'خطأ في قاعدة البيانات',
      details: 'حدث خطأ أثناء الوصول إلى قاعدة البيانات',
      retryable: true,
      severity: 'high'
    },
    
    // File upload errors
    FILE_TOO_LARGE: {
      code: 'FILE_TOO_LARGE',
      message: 'حجم الملف كبير جداً',
      details: 'الحد الأقصى لحجم الملف هو 5 ميجابايت',
      retryable: false,
      severity: 'low'
    },
    
    INVALID_FILE_TYPE: {
      code: 'INVALID_FILE_TYPE',
      message: 'نوع الملف غير مدعوم',
      details: 'يرجى رفع ملفات من نوع: JPG, PNG, WebP',
      retryable: false,
      severity: 'low'
    },
    
    // Generic errors
    UNKNOWN_ERROR: {
      code: 'UNKNOWN_ERROR',
      message: 'حدث خطأ غير متوقع',
      details: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
      retryable: true,
      severity: 'medium'
    }
  }

  static getError(error: any): AppError {
    // Handle network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return this.ERROR_MESSAGES.NETWORK_ERROR
    }
    
    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      return this.ERROR_MESSAGES.TIMEOUT_ERROR
    }
    
    // Handle HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return this.ERROR_MESSAGES.VALIDATION_ERROR
        case 401:
          return this.ERROR_MESSAGES.UNAUTHORIZED
        case 403:
          return this.ERROR_MESSAGES.FORBIDDEN
        case 404:
          return this.ERROR_MESSAGES.NOT_FOUND
        case 500:
        case 502:
        case 503:
          return this.ERROR_MESSAGES.API_ERROR
        default:
          return this.ERROR_MESSAGES.UNKNOWN_ERROR
      }
    }
    
    // Handle custom error codes
    if (error.code && this.ERROR_MESSAGES[error.code]) {
      return this.ERROR_MESSAGES[error.code]
    }
    
    // Default to unknown error
    return this.ERROR_MESSAGES.UNKNOWN_ERROR
  }

  static getUserFriendlyMessage(error: any): string {
    const appError = this.getError(error)
    return appError.message
  }

  static getDetailedMessage(error: any): string {
    const appError = this.getError(error)
    return appError.details || appError.message
  }

  static shouldRetry(error: any): boolean {
    const appError = this.getError(error)
    return appError.retryable || false
  }

  static getSeverity(error: any): AppError['severity'] {
    const appError = this.getError(error)
    return appError.severity
  }

  static logError(error: any, context?: string) {
    const appError = this.getError(error)
    const timestamp = new Date().toISOString()
    
    console.error(`[${timestamp}] Error: ${appError.code}`, {
      error: error.message || error,
      context,
      severity: appError.severity,
      retryable: appError.retryable
    })
    
    // Here you could also send errors to a monitoring service
    // like Sentry, LogRocket, etc.
  }

  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (!this.shouldRetry(error) || i === maxRetries - 1) {
          throw error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
    
    throw lastError
  }
}

// React hook for error handling
import { useState, useCallback } from 'react'

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((error: any) => {
    const appError = ErrorHandler.getError(error)
    ErrorHandler.logError(error)
    setError(appError)
    return appError
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const executeWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>,
    options?: {
      retries?: number
      delay?: number
      setLoading?: boolean
    }
  ): Promise<T | null> => {
    const { retries = 0, delay = 1000, setLoading = true } = options || {}
    
    try {
      if (setLoading) setIsLoading(true)
      clearError()
      
      if (retries > 0) {
        return await ErrorHandler.retry(fn, retries, delay)
      } else {
        return await fn()
      }
    } catch (error) {
      handleError(error)
      return null
    } finally {
      if (setLoading) setIsLoading(false)
    }
  }, [handleError, clearError])

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  }
}

// Toast notification helper
export function showErrorToast(error: any, toast: any) {
  const appError = ErrorHandler.getError(error)
  ErrorHandler.logError(error)
  
  toast.error(appError.message, {
    description: appError.details,
    duration: appError.severity === 'critical' ? 10000 : 5000,
    action: appError.retryable ? {
      label: 'إعادة المحاولة',
      onClick: () => window.location.reload()
    } : undefined
  })
}

export function showSuccessToast(message: string, toast: any) {
  toast.success(message, {
    duration: 3000
  })
}

export function showWarningToast(message: string, toast: any) {
  toast.warning(message, {
    duration: 4000
  })
}

export function showInfoToast(message: string, toast: any) {
  toast.info(message, {
    duration: 3000
  })
}