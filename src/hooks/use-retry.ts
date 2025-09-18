'use client'

import { useState, useCallback, useRef } from 'react'

interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoffFactor?: number
  jitter?: boolean
  onRetry?: (attempt: number, error: Error) => void
  onSuccess?: (attempt: number) => void
  onFailure?: (error: Error) => void
}

interface RetryState {
  attempt: number
  isRetrying: boolean
  lastError: Error | null
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffFactor = 2,
    jitter = true,
    onRetry,
    onSuccess,
    onFailure
  } = options

  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const calculateDelay = useCallback((attempt: number): number => {
    let baseDelay = delay * Math.pow(backoffFactor, attempt - 1)
    
    if (jitter) {
      // Add random jitter to prevent thundering herd
      baseDelay = baseDelay * (0.5 + Math.random() * 0.5)
    }
    
    return Math.min(baseDelay, 30000) // Cap at 30 seconds
  }, [delay, backoffFactor, jitter])

  const execute = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel any previous retry
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    let attempt = 0
    let lastError: Error | null = null

    while (attempt < maxAttempts) {
      attempt++
      
      try {
        setState(prev => ({
          ...prev,
          attempt,
          isRetrying: true,
          lastError: null
        }))

        // Check if aborted
        if (signal.aborted) {
          throw new Error('Operation aborted')
        }

        const result = await fn(...args)
        
        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: null
        }))

        onSuccess?.(attempt)
        return result

      } catch (error) {
        lastError = error as Error
        
        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: error as Error
        }))

        // Don't retry on abort
        if (signal.aborted) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt >= maxAttempts) {
          break
        }

        // Call retry callback
        onRetry?.(attempt, error as Error)

        // Wait before retrying
        const retryDelay = calculateDelay(attempt)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    // All attempts failed
    onFailure?.(lastError!)
    throw lastError!
  }, [fn, maxAttempts, calculateDelay, onRetry, onSuccess, onFailure])

  const reset = useCallback(() => {
    setState({
      attempt: 0,
      isRetrying: false,
      lastError: null
    })
  }, [])

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(prev => ({
      ...prev,
      isRetrying: false
    }))
  }, [])

  return {
    execute,
    reset,
    abort,
    ...state
  }
}

// Hook for exponential backoff with circuit breaker
export function useCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    failureThreshold?: number
    resetTimeout?: number
    monitoringPeriod?: number
  } = {}
) {
  const {
    failureThreshold = 5,
    resetTimeout = 60000, // 1 minute
    monitoringPeriod = 60000 // 1 minute
  } = options

  const [state, setState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED')
  const failures = useRef(0)
  const lastFailureTime = useRef(0)
  const nextAttemptTime = useRef(0)

  const recordFailure = useCallback(() => {
    failures.current++
    lastFailureTime.current = Date.now()
    
    if (failures.current >= failureThreshold) {
      setState('OPEN')
      nextAttemptTime.current = Date.now() + resetTimeout
    }
  }, [failureThreshold, resetTimeout])

  const recordSuccess = useCallback(() => {
    failures.current = 0
    setState('CLOSED')
  }, [])

  const shouldAllowRequest = useCallback(() => {
    if (state === 'CLOSED') {
      return true
    }
    
    if (state === 'OPEN') {
      if (Date.now() >= nextAttemptTime.current) {
        setState('HALF_OPEN')
        return true
      }
      return false
    }
    
    // HALF_OPEN - allow one request to test
    return true
  }, [state])

  const execute = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!shouldAllowRequest()) {
      throw new Error('Circuit breaker is OPEN - service unavailable')
    }

    try {
      const result = await fn(...args)
      recordSuccess()
      return result
    } catch (error) {
      recordFailure()
      throw error
    }
  }, [fn, shouldAllowRequest, recordSuccess, recordFailure])

  const getState = useCallback(() => ({
    state,
    failures: failures.current,
    lastFailureTime: lastFailureTime.current,
    nextAttemptTime: nextAttemptTime.current
  }), [state])

  const reset = useCallback(() => {
    failures.current = 0
    lastFailureTime.current = 0
    nextAttemptTime.current = 0
    setState('CLOSED')
  }, [])

  return {
    execute,
    getState,
    reset,
    state
  }
}

// Hook for network-aware retry with connection status
export function useNetworkRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions & {
    checkConnection?: () => Promise<boolean>
    offlineTimeout?: number
  } = {}
) {
  const {
    checkConnection = () => Promise.resolve(navigator.onLine),
    offlineTimeout = 5000,
    ...retryOptions
  } = options

  const retry = useRetry(fn, retryOptions)

  const execute = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Check connection first
    const isConnected = await checkConnection()
    if (!isConnected) {
      // Wait for connection to be restored
      const startTime = Date.now()
      while (Date.now() - startTime < offlineTimeout) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (await checkConnection()) {
          break
        }
      }
      
      // If still offline, throw error
      if (!(await checkConnection())) {
        throw new Error('No internet connection available')
      }
    }

    return retry.execute(...args)
  }, [fn, checkConnection, offlineTimeout, retry])

  return {
    ...retry,
    execute
  }
}

// Utility function for retry with async/await
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffFactor = 2,
    jitter = true,
    onRetry
  } = options

  let attempt = 0
  let lastError: Error

  while (attempt < maxAttempts) {
    attempt++
    
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt >= maxAttempts) {
        break
      }

      onRetry?.(attempt, error as Error)

      const retryDelay = delay * Math.pow(backoffFactor, attempt - 1)
      const actualDelay = jitter 
        ? retryDelay * (0.5 + Math.random() * 0.5)
        : retryDelay

      await new Promise(resolve => setTimeout(resolve, Math.min(actualDelay, 30000)))
    }
  }

  throw lastError!
}