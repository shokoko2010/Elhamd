'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Car, Shield, Eye, EyeOff } from 'lucide-react'
import { UserRole } from '@prisma/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result?.ok) {
        console.log('Login successful')
        
        // Get user role to determine redirect
        try {
          const response = await fetch('/api/auth/session')
          if (response.ok) {
            const session = await response.json()
            const userRole = session?.user?.role
            
            // Redirect based on role
            if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
              console.log('Redirecting to admin dashboard...')
              router.push('/admin')
            } else if (userRole === UserRole.STAFF || userRole === UserRole.BRANCH_MANAGER) {
              console.log('Redirecting to employee dashboard...')
              router.push('/employee/dashboard')
            } else if (userRole === UserRole.CUSTOMER) {
              console.log('Redirecting to customer dashboard...')
              router.push('/customer')
            } else {
              console.log('Redirecting to general dashboard...')
              router.push('/dashboard')
            }
          } else {
            console.log('Failed to get session after login')
            setError('فشل في الحصول على معلومات الجلسة')
          }
        } catch (sessionError) {
          console.error('Error getting session after login:', sessionError)
          setError('فشل في التحقق من الجلسة')
        }
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Car className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">الحمد للسيارات</h1>
          <p className="text-blue-100">لوحة تحكم المشرفين</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>
              قم بتسجيل الدخول للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">معلومات تسجيل الدخول:</p>
              <ul className="text-xs space-y-1">
                <li>• مدير النظام: admin@elhamdimport.online / admin123</li>
                <li>• مدير الفرع: manager@elhamdimport.online / manager123</li>
                <li>• مدير المبيعات: sales.manager@elhamdimport.online / salesmanager123</li>
                <li>• مدير الخدمة: service.manager@elhamdimport.online / servicemanager123</li>
              </ul>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <Button 
            variant="link" 
            className="text-white hover:text-blue-200"
            onClick={() => router.push('/')}
          >
            العودة إلى الصفحة الرئيسية
          </Button>
          <div>
            <Button 
              variant="link" 
              className="text-white hover:text-blue-200 text-sm"
              onClick={() => router.push('/create-admin')}
            >
              إنشاء حساب مشرف جديد
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}