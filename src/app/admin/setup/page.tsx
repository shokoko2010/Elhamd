'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAdminExists, setIsAdminExists] = useState<boolean | null>(null)

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup')
      const data = await response.json()
      setIsAdminExists(data.hasAdmin)
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const createAdmin = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message}`)
        setIsAdminExists(true)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ حدث خطأ في الاتصال بالخادم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">إعداد المدير</h1>
          <p className="text-blue-100">الحمد للوكلاء والتجارة</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">إعداد حساب المدير</CardTitle>
            <CardDescription>
              قم بإنشاء حساب المدير للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdminExists === null && (
              <div className="text-center">
                <Button 
                  onClick={checkAdminStatus}
                  variant="outline"
                  className="w-full"
                >
                  التحقق من وجود مدير
                </Button>
              </div>
            )}

            {isAdminExists === false && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    لا يوجد مستخدم مدير حالي. قم بإنشاء واحد للوصول إلى لوحة التحكم.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={createAdmin}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'جاري الإنشاء...' : 'إنشاء مستخدم مدير'}
                </Button>
              </div>
            )}

            {isAdminExists === true && (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    مستخدم المدير موجود بالفعل. يمكنك تسجيل الدخول الآن.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">معلومات تسجيل الدخول:</h3>
                  <p className="text-sm text-gray-600">
                    <strong>البريد الإلكتروني:</strong> admin@elhamd.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>كلمة المرور:</strong> admin123
                  </p>
                </div>

                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                >
                  الذهاب إلى تسجيل الدخول
                </Button>
              </div>
            )}

            {message && (
              <Alert className={message.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="link" 
            className="text-white hover:text-blue-200"
            onClick={() => window.location.href = '/'}
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}