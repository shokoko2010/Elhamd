'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function VercelDebugPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    // Collect debug information
    const info = {
      environment: process.env.NODE_ENV,
      domain: window.location.origin,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      cookies: document.cookie,
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV
    }
    setDebugInfo(info)
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testAuthStatus = () => {
    addResult(`Session Status: ${status}`)
    addResult(`Session User: ${session?.user?.email || 'No user'}`)
    addResult(`Session Role: ${session?.user?.role || 'No role'}`)
    addResult(`Session ID: ${session?.user?.id || 'No ID'}`)
  }

  const testAPI = async (endpoint: string) => {
    try {
      addResult(`Testing GET ${endpoint}...`)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ ${endpoint} - Success (${response.status})`)
        addResult(`Data: ${JSON.stringify(data).slice(0, 100)}...`)
      } else {
        addResult(`❌ ${endpoint} - Error ${response.status}: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      addResult(`❌ ${endpoint} - Network Error: ${error}`)
    }
  }

  const testAllAPIs = () => {
    testAPI('/api/crm/customers')
    testAPI('/api/finance/invoices')
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">Vercel Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Debug Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Environment:</strong> {debugInfo.environment}</div>
              <div><strong>Domain:</strong> {debugInfo.domain}</div>
              <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
              <div><strong>NEXTAUTH_URL:</strong> {debugInfo.nextAuthUrl || 'Not set'}</div>
              <div><strong>Cookies:</strong> {debugInfo.cookies || 'No cookies'}</div>
            </div>
          </div>

          {/* Session Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              {session?.user && (
                <>
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>Name:</strong> {session.user.name}</p>
                  <p><strong>Role:</strong> {session.user.role}</p>
                  <p><strong>ID:</strong> {session.user.id}</p>
                  <p><strong>Permissions:</strong> {session.user.permissions?.length || 0} permissions</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testAuthStatus}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Auth Status
            </button>
            <button
              onClick={testAllAPIs}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test All APIs
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click test buttons to see results</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className={
                    result.includes('✅') ? 'text-green-600' : 
                    result.includes('❌') ? 'text-red-600' : 
                    'text-gray-600'
                  }>
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vercel Checklist */}
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg shadow border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Vercel Deployment Checklist</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <input type="checkbox" className="ml-2" />
              <label>NEXTAUTH_SECRET is set in Vercel Environment Variables</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="ml-2" />
              <label>NEXTAUTH_URL matches your Vercel domain</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="ml-2" />
              <label>DATABASE_URL is the production database URL</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="ml-2" />
              <label>Node.js version is compatible (18.x or higher)</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="ml-2" />
              <label>Database is accessible from Vercel</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}