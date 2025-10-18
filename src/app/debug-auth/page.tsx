'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function DebugAuthPage() {
  const { user, loading, error, authenticated, logout } = useAuth()
  const [dbTest, setDbTest] = useState<any>(null)
  const [cookies, setCookies] = useState<string>('')

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setDbTest(data)
    } catch (error) {
      setDbTest({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const checkCookies = () => {
    setCookies(document.cookie)
  }

  useEffect(() => {
    checkCookies()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Authentication & Database</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
          </div>
          {user && (
            <button
              onClick={logout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <p className="text-sm font-mono bg-gray-100 p-3 rounded">{cookies || 'No cookies'}</p>
          <button
            onClick={checkCookies}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Cookies
          </button>
        </div>

        {/* Database Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
          <button
            onClick={testDatabase}
            className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Database Connection
          </button>
          {dbTest && (
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(dbTest, null, 2)}
            </pre>
          )}
        </div>

        {/* Site Settings Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Site Settings API Test</h2>
          <SiteSettingsTest />
        </div>
      </div>
    </div>
  )
}

function SiteSettingsTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSiteSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/site-settings')
      const data = await response.json()
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={testSiteSettings}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Site Settings API'}
      </button>
      {result && (
        <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}