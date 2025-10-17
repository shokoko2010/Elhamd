'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle } from 'lucide-react'

export default function CreateAdminPage() {
  const [email, setEmail] = useState('admin@elhamd.com')
  const [password, setPassword] = useState('admin123')
  const [name, setName] = useState('Administrator')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/debug/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ تم إنشاء مستخدم المشرف بنجاح! يمكنك الآن تسجيل الدخول باستخدام هذه البيانات.')
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (err) {
      console.error('Create admin error:', err)
      setMessage('❌ حدث خطأ أثناء إنشاء المستخدم')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">إنشاء مشرف</h1>
          <p className="text-blue-100">إنشاء مستخدم مشرف للوصول إلى لوحة التحكم</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">إنشاء حساب مشرف</CardTitle>
            <CardDescription>
              قم بإنشاء حساب مشرف للوصول إلى لوحة تحكم الإدارة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل الاسم"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>

              <div>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء مشرف'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => window.location.href = '/login'}
              >
                الذهاب إلى تسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}