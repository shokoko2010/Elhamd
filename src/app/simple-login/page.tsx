'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: '', // Add if needed
          json: 'true'
        })
      })

      if (response.ok) {
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'جاري تحويلك إلى لوحة التحكم...'
        })
        
        // Redirect to finance page
        setTimeout(() => {
          router.push('/admin/finance')
        }, 1000)
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      toast({
        title: 'فشل تسجيل الدخول',
        description: 'يرجى التحقق من بيانات الاعتماد',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>تسجيل الدخول للنظام المالي</CardTitle>
          <CardDescription>
            استخدم حساب المدير للوصول إلى القسم المالي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/admin/finance/debug')}
            >
              صفحة تشخيص الصلاحيات
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              تسجيل الدخول العادي
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}