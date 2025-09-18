export interface ApiError {
  message: string
  code?: string
  details?: any
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: 'APP_ERROR',
      details: error.stack
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: error.stack
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  }
}

export const createErrorResponse = (error: unknown, statusCode: number = 500) => {
  const apiError = handleApiError(error)
  return new Response(
    JSON.stringify(apiError),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

export const logError = (error: unknown, context?: string) => {
  console.error(`[${context || 'APP'}] Error:`, error)
  
  // Here you could add error reporting service integration
  // like Sentry, LogRocket, etc.
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('Network Error') ||
    error.message.includes('fetch') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ENOTFOUND')
  )
}

export const retryAsync = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    
    if (isNetworkError(error)) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryAsync(fn, retries - 1, delay * 2)
    }
    
    throw error
  }
}