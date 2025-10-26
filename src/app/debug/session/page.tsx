'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function DebugSessionPage() {
  const { data: session, status, update } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    // Collect debug information
    const info = {
      userAgent: navigator.userAgent,
      cookies: document.cookie,
      localStorage: {},
      sessionStorage: {},
      indexedDB: 'supported',
      serviceWorker: 'unsupported'
    }

    // Check localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          info.localStorage[key] = localStorage.getItem(key)
        }
      }
    } catch (e) {
      info.localStorage = `Error: ${e.message}`
    }

    // Check sessionStorage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          info.sessionStorage[key] = sessionStorage.getItem(key)
        }
      }
    } catch (e) {
      info.sessionStorage = `Error: ${e.message}`
    }

    // Check service worker
    if ('serviceWorker' in navigator) {
      info.serviceWorker = 'supported'
      navigator.serviceWorker.getRegistrations().then(registrations => {
        info.serviceWorkerRegistrations = registrations.length
        setDebugInfo(info)
      })
    } else {
      setDebugInfo(info)
    }
  }, [session, status])

  const testSessionAPI = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      const data = await response.json()
      alert(`Session API Test:\nStatus: ${response.status}\nData: ${JSON.stringify(data)}`)
    } catch (error) {
      alert(`Session API Error: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  const clearAllStorage = () => {
    try {
      localStorage.clear()
      sessionStorage.clear()
      alert('Storage cleared')
    } catch (error) {
      alert(`Error clearing storage: ${error.message}`)
    }
  }

  const unregisterServiceWorkers = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (let registration of registrations) {
          await registration.unregister()
        }
        alert('Service workers unregistered')
      } catch (error) {
        alert(`Error unregistering service workers: ${error.message}`)
      }
    }
  }

  return (
    <div className="container mx-auto p-6" dir="ltr">
      <h1 className="text-2xl font-bold mb-6">Session Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Status */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
          {session && (
            <div className="mt-2">
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Debug Information</h2>
          <div className="text-sm max-h-64 overflow-y-auto">
            <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
            <p><strong>Service Worker:</strong> {debugInfo.serviceWorker}</p>
            {debugInfo.serviceWorkerRegistrations !== undefined && (
              <p><strong>SW Registrations:</strong> {debugInfo.serviceWorkerRegistrations}</p>
            )}
            <p><strong>Cookies:</strong> {debugInfo.cookies || 'None'}</p>
          </div>
        </div>

        {/* Storage Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Storage</h2>
          <div className="text-sm max-h-64 overflow-y-auto">
            <h3 className="font-semibold">LocalStorage:</h3>
            <pre>{JSON.stringify(debugInfo.localStorage, null, 2)}</pre>
            <h3 className="font-semibold mt-2">SessionStorage:</h3>
            <pre>{JSON.stringify(debugInfo.sessionStorage, null, 2)}</pre>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Debug Actions</h2>
          <div className="space-y-2">
            <button
              onClick={testSessionAPI}
              disabled={testing}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {testing ? 'Testing...' : 'Test Session API'}
            </button>
            <button
              onClick={() => update()}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Refresh Session
            </button>
            <button
              onClick={clearAllStorage}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Clear All Storage
            </button>
            <button
              onClick={unregisterServiceWorkers}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Unregister Service Workers
            </button>
            <button
              onClick={() => signOut()}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Console Output */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Browser Console</h2>
        <p className="text-sm text-gray-600">
          Check the browser console (F12) for NextAuth debug information and any errors.
        </p>
      </div>
    </div>
  )
}