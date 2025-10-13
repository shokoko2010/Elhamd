'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@elhamd.com')
  const [password, setPassword] = useState('admin123')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testLogin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDbConnection = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/debug/db-check')
      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setupAdmin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">登录测试页面</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>数据库连接测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testDbConnection} disabled={isLoading}>
              {isLoading ? '测试中...' : '测试数据库连接'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>创建管理员用户</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={setupAdmin} disabled={isLoading}>
              {isLoading ? '创建中...' : '创建管理员用户'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>登录测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@elhamd.com"
              />
            </div>
            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
              />
            </div>
            <Button onClick={testLogin} disabled={isLoading} className="w-full">
              {isLoading ? '测试中...' : '测试登录'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={result.success ? 'border-green-200' : 'border-red-200'}>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}