'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthTestPage() {
  const { data: session, status } = useSession()
  const [authCheck, setAuthCheck] = useState(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      setAuthCheck(data)
    } catch (error) {
      console.error('Auth test failed:', error)
      setAuthCheck({ error: error.message })
    }
    setLoading(false)
  }

  const createAdmin = async () => {
    try {
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Create admin response:', data)
      alert(data.message || (data.success ? 'Admin created successfully' : 'Failed to create admin'))
    } catch (error) {
      console.error('Create admin failed:', error)
      alert('Failed to create admin: ' + error.message)
    }
  }

  const testSiteSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      const data = await response.json()
      console.log('Site settings response:', data)
      alert('Site settings loaded successfully')
    } catch (error) {
      console.error('Site settings test failed:', error)
      alert('Failed to load site settings: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
          {session && (
            <div className="mt-4">
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
            </div>
          )}
        </div>

        {/* Auth Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Server Auth Check</h2>
          <button
            onClick={testAuth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Server Auth'}
          </button>
          {authCheck && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(authCheck, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {!session && (
              <button
                onClick={() => signIn('credentials', {
                  email: 'admin@elhamd.com',
                  password: 'admin123',
                  redirect: false
                })}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              >
                Sign In as Admin
              </button>
            )}
            
            {session && (
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
              >
                Sign Out
              </button>
            )}
            
            <button
              onClick={createAdmin}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 w-full"
            >
              Create Default Admin
            </button>
            
            <button
              onClick={testSiteSettings}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
            >
              Test Site Settings API
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>First, click "Create Default Admin" to create an admin user</li>
            <li>Then click "Sign In as Admin" to log in</li>
            <li>Click "Test Server Auth" to check server-side authentication</li>
            <li>Click "Test Site Settings API" to test API access</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded">
            <p><strong>Default Admin Credentials:</strong></p>
            <p>Email: admin@elhamd.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}