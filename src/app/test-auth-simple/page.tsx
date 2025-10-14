'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function TestAuthSimplePage() {
  const { user, loading } = useAuth()
  const [testResult, setTestResult] = useState<string>('')

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

  const initializePermissions = async () => {
    try {
      setTestResult('🔄 Initializing permissions...')
      const response = await fetch('/api/admin/permissions/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Permissions initialized! Stats: ${JSON.stringify(data.stats, null, 2)}`)
      } else {
        setTestResult(`❌ Permission init failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const checkPermissions = async () => {
    try {
      setTestResult('🔄 Checking permissions...')
      const response = await fetch('/api/debug/auth/permissions-check')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Permissions check complete! Admin has ${data.adminUser?.permissions?.length || 0} permissions. Edit vehicles: ${data.adminUser?.permissions?.includes('edit_vehicles') ? '✅' : '❌'}`)
      } else {
        setTestResult(`❌ Permission check failed: ${data.error || response.statusText}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testImageUpload = async () => {
    try {
      setTestResult('🔄 Testing image upload permissions...')
      
      // First check auth
      const authResponse = await fetch('/api/test-auth')
      const authData = await authResponse.json()
      
      if (!authData.success) {
        setTestResult('❌ You must be logged in to test image upload')
        return
      }
      
      // Get first vehicle
      const vehiclesResponse = await fetch('/api/vehicles')
      const vehiclesData = await vehiclesResponse.json()
      
      if (!vehiclesData.success || !vehiclesData.data || vehiclesData.data.length === 0) {
        setTestResult('❌ No vehicles found for testing')
        return
      }
      
      const vehicle = vehiclesData.data[0]
      
      // Test image upload
      const testImageData = {
        imageUrl: 'https://via.placeholder.com/300x200.png?text=Test+Image',
        altText: 'Test Image',
        isPrimary: false
      }
      
      const uploadResponse = await fetch(`/api/admin/vehicles/${vehicle.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testImageData)
      })
      
      const uploadData = await uploadResponse.json()
      
      if (uploadResponse.ok) {
        setTestResult(`✅ Image upload test successful! Vehicle: ${vehicle.title}, Image ID: ${uploadData.id}`)
      } else {
        setTestResult(`❌ Image upload failed: ${uploadData.error || 'Permission denied'}. User role: ${authData.user.role}, Permissions: ${authData.user.permissions?.join(', ') || 'None'}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth & Media Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p className="mb-2">{testResult}</p>
              {user && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">User Details:</h3>
                  <ul className="text-sm space-y-1">
                    <li>Email: {user.email}</li>
                    <li>Name: {user.name}</li>
                    <li>Role: {user.role}</li>
                    <li>Phone: {user.phone}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testMediaAPI}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Media API
            </button>
            
            <button
              onClick={initializePermissions}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
            >
              Initialize Permissions
            </button>
            
            <button
              onClick={checkPermissions}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ml-2"
            >
              Check Permissions
            </button>
            
            <button
              onClick={testImageUpload}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 ml-2"
            >
              Test Image Upload
            </button>
            
            <div className="text-sm text-gray-600">
              <p>If you're not logged in, please:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Go to <a href="/login" className="text-blue-600 underline">Login page</a></li>
                <li>Login with: admin@elhamdimports.com / admin123</li>
                <li>Return to this test page</li>
                <li>Try the media API test again</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}