'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorComponentProps {
  title?: string
  description?: string
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  retryAction?: () => void
  className?: string
}

export function ErrorComponent({
  title = 'حدث خطأ',
  description = 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  showRetry = true,
  showHome = true,
  showBack = false,
  retryAction,
  className = ''
}: ErrorComponentProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (retryAction) {
      retryAction()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {showRetry && (
            <Button 
              onClick={handleRetry} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
          )}
          
          {showHome && (
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          )}
          
          {showBack && (
            <Button 
              onClick={() => router.back()} 
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للخلف
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Error boundary component for React
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorComponent
          title="حدث خطأ في التطبيق"
          description="عذراً، حدث خطأ في التطبيق. يرجى تحديث الصفحة أو العودة للصفحة الرئيسية."
        />
      )
    }

    return this.props.children
  }
}