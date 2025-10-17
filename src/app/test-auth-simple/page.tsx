'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

export default function TestAuthSimplePage() {
  const { user, loading, authenticated, error } = useAuth()
  const [testResult, setTestResult] = useState<string>('')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Test API directly
    fetch('/api/simple-auth/me', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      setApiResponse(data)
    })
    .catch(err => {
      setApiResponse({ error: err.message })
    })
  }, [])

  useEffect(() => {
    if (!loading) {
      if (user) {
        setTestResult(`✅ Logged in as: ${user.email} (${user.role})`)
      } else {
        setTestResult('❌ Not logged in')
      }
    }
  }, [user, loading])

  const testMediaAPI = async () => {
    try {
      setTestResult('🔄 Testing media API...')
      const response = await fetch('/api/media/stats')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Media API works! Found: ${JSON.stringify(data.data?.totalFiles || 0)} files`)
      } else {
        setTestResult(`❌ Media API failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testAdminAccess = async () => {
    try {
      setTestResult('🔄 Testing admin access...')
      const response = await fetch('/api/admin/dashboard-data')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Admin API works!`)
      } else {
        setTestResult(`❌ Admin API failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth & Media Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p className="mb-2">{testResult}</p>
              <p className="mb-2"><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
              <p className="mb-2"><strong>Error:</strong> {error || 'None'}</p>
              {user && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">User Details:</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>ID:</strong> {user.id}</li>
                    <li><strong>Email:</strong> {user.email}</li>
                    <li><strong>Name:</strong> {user.name}</li>
                    <li><strong>Role:</strong> {user.role}</li>
                    <li><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</li>
                    <li><strong>Phone:</strong> {user.phone}</li>
                    <li><strong>Branch ID:</strong> {user.branchId || 'None'}</li>
                    <li><strong>Permissions:</strong> {user.permissions.join(', ')}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Response</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={testMediaAPI}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Media API
              </button>
              
              <button
                onClick={testAdminAccess}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test Admin API
              </button>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Go to Admin Dashboard
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Go to Dashboard
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>If you're not logged in, please:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Go to <a href="/login" className="text-blue-600 underline">Login page</a></li>
                <li>Login with your admin credentials</li>
                <li>Return to this test page</li>
                <li>Try the tests again</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}