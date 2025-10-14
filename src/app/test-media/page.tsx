'use client'

import { useState, useEffect } from 'react'

export default function TestMediaPage() {
  const [mediaData, setMediaData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    testMediaAPI()
  }, [])

  const testMediaAPI = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/media', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      const data = await response.json()
      console.log('Media API Response:', data)
      setMediaData(data)
    } catch (error) {
      console.error('Error testing media API:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testMediaStatsAPI = async () => {
    try {
      const response = await fetch('/api/media/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      const data = await response.json()
      console.log('Media Stats API Response:', data)
      return data
    } catch (error) {
      console.error('Error testing media stats API:', error)
      return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Media API</h1>
        
        <div className="mb-6">
          <button
            onClick={testMediaAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            Test Media API
          </button>
          <button
            onClick={testMediaStatsAPI}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Media Stats API
          </button>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {mediaData && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Media API Response</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(mediaData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}