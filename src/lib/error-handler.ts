// Global error handler for Chrome extension conflicts and other runtime errors

export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    
    // Check if it's a Chrome extension error
    if (error?.message?.includes('Receiving end does not exist') ||
        error?.message?.includes('Could not establish connection')) {
      console.warn('Chrome extension error caught by global handler:', error.message)
      event.preventDefault() // Prevent the error from showing in console
      return
    }
    
    // Log other errors
    console.error('Unhandled promise rejection:', error)
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error
    
    // Check if it's a Chrome extension error
    if (error?.message?.includes('Receiving end does not exist') ||
        error?.message?.includes('Could not establish connection')) {
      console.warn('Chrome extension error caught by global error handler:', error.message)
      event.preventDefault() // Prevent the error from showing in console
      return
    }
    
    // Log other errors
    console.error('Uncaught error:', error)
  })
}

// Function to check if error is related to Chrome extensions
export function isChromeExtensionError(error: any): boolean {
  return error?.message?.includes('Receiving end does not exist') ||
         error?.message?.includes('Could not establish connection') ||
         error?.message?.includes('Extension context invalidated')
}

// Function to safely execute functions that might fail due to Chrome extensions
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  onError?: (error: Error) => void
): T {
  try {
    return fn()
  } catch (error) {
    if (isChromeExtensionError(error)) {
      console.warn('Chrome extension error in safeExecute:', error)
      return fallback
    }
    
    console.error('Error in safeExecute:', error)
    if (onError) {
      onError(error as Error)
    }
    return fallback
  }
}