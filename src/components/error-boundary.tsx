'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Check if it's a Chrome extension error
    if (error.message.includes('Receiving end does not exist') || 
        error.message.includes('Could not establish connection')) {
      console.warn('Chrome extension error detected - this is usually safe to ignore')
    }
    
    this.setState({ error, errorInfo })
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback) {
        return <Fallback error={this.state.error} reset={this.reset} />
      }

      // Default error UI
      const isChromeExtensionError = 
        this.state.error?.message.includes('Receiving end does not exist') ||
        this.state.error?.message.includes('Could not establish connection')

      if (isChromeExtensionError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Chrome Extension Conflict
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                A browser extension is interfering with the application. 
                This is usually safe to ignore and doesn't affect functionality.
              </p>
              <div className="space-y-2">
                <Button onClick={this.reset} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Continue Anyway
                </Button>
                <p className="text-xs text-gray-500">
                  If issues persist, try disabling browser extensions or using incognito mode.
                </p>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.reset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary