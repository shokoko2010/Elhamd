'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function TestLogoutPage() {
  const { user, loading, logout } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<string>('')

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    // Check current cookies
    const allCookies = document.cookie
    setCookies(allCookies)
    addLog(`Current cookies: ${allCookies}`)
  }, [])

  const testLogout = async () => {
    addLog('🔄 Starting logout test...')
    
    try {
      // Check cookies before logout
      const cookiesBefore = document.cookie
      addLog(`Cookies before logout: ${cookiesBefore}`)
      
      // Call logout API directly
      addLog('Calling logout API...')
      const response = await fetch('/api/simple-auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      addLog(`Logout API response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog(`Logout API response: ${JSON.stringify(data)}`)
      } else {
        addLog(`Logout API failed: ${response.statusText}`)
      }
      
      // Check cookies after API call
      setTimeout(() => {
        const cookiesAfter = document.cookie
        addLog(`Cookies after API call: ${cookiesAfter}`)
        
        // Check if auth cookie is still there
        const hasAuthCookie = cookiesAfter.includes('staff_token')
        addLog(`Auth cookie still exists: ${hasAuthCookie}`)
        
        if (hasAuthCookie) {
          addLog('⚠️ Auth cookie was not cleared properly')
          // Try to clear it manually
          document.cookie = 'staff_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          addLog('🧹 Attempted manual cookie clear')
        }
      }, 1000)
      
      // Use the hook logout method
      addLog('Calling useAuth logout method...')
      await logout()
      
    } catch (error) {
      addLog(`❌ Error during logout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const checkAuthStatus = async () => {
    addLog('🔍 Checking auth status...')
    try {
      const response = await fetch('/api/simple-auth/me', {
        credentials: 'include'
      })
      
      addLog(`Auth check status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Still logged in as: ${data.user?.email}`)
      } else {
        addLog('✅ Not logged in (good!)')
      }
    } catch (error) {
      addLog(`❌ Error checking auth: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const clearAllLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Logout Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Logged in:</strong> {user ? `Yes (${user.email})` : 'No'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-xs break-all">{cookies || 'No cookies found'}</pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Test Logout
            </button>
            
            <button
              onClick={checkAuthStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Auth Status
            </button>
            
            <button
              onClick={clearAllLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded h-96 overflow-y-auto">
            <pre className="text-xs font-mono">
              {logs.length > 0 ? logs.join('\n') : 'No logs yet...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}