'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && (
        <span className="mr-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
}

interface LoadingPageProps {
  message?: string
  submessage?: string
}

export function LoadingPage({ 
  message = 'جاري التحميل...', 
  submessage 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h2>
        {submessage && (
          <p className="text-gray-600">{submessage}</p>
        )}
      </div>
    </div>
  )
}

interface LoadingCardProps {
  lines?: number
  className?: string
}

export function LoadingCard({ lines = 3, className = '' }: LoadingCardProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="rounded-full bg-gray-200 h-4 w-4"></div>
            <div className="flex-1 space-y-1 py-1">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'profile'
  count?: number
}

export function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="flex items-center space-x-4 p-4 border-b">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex-1 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        )
      
      case 'table':
        return (
          <div className="animate-pulse">
            <div className="flex space-x-4 p-4 border-b">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-1">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'profile':
        return (
          <div className="flex items-center space-x-4 p-4">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}