'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ReauthPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear any existing auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }, [])

  const handleRelogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">تحديث المصادقة</CardTitle>
            <CardDescription>
              نحن نقوم بتحديث نظام المصادقة لتجربة أفضل. يرجى تسجيل الدخول مرة أخرى.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">ماذا يحدث؟</h4>
              <p className="text-sm text-blue-700">
                قمنا بتحسين نظام المصادقة ليعمل بشكل أفضل مع جميع الأجهزة والمتصفحات.
                هذا يتطلب منك تسجيل الدخول مرة واحدة فقط.
              </p>
            </div>
            
            <Button 
              onClick={handleRelogin} 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تسجيل الدخول مرة أخرى
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
