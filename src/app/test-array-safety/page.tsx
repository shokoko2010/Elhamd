'use client'

import { useState } from 'react'
import { ensureArray, safeMap, isMappable, safeLength } from '@/lib/array-utils'

export default function TestArraySafety() {
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []

    // Test 1: Normal array
    const normalArray = [1, 2, 3]
    results.push(`✅ Normal array: ${ensureArray(normalArray).join(', ')}`)

    // Test 2: Null value
    const nullValue = null
    results.push(`✅ Null value: ${ensureArray(nullValue).join(', ')}`)

    // Test 3: Undefined value
    const undefinedValue = undefined
    results.push(`✅ Undefined value: ${ensureArray(undefinedValue).join(', ')}`)

    // Test 4: Object
    const objectValue = { a: 1, b: 2 }
    results.push(`✅ Object value: ${ensureArray(objectValue).join(', ')}`)

    // Test 5: String
    const stringValue = "hello"
    results.push(`✅ String value: ${ensureArray(stringValue).join(', ')}`)

    // Test 6: Safe map with array
    const mappedArray = safeMap(normalArray, (item) => item * 2)
    results.push(`✅ Safe map array: ${mappedArray.join(', ')}`)

    // Test 7: Safe map with null
    const mappedNull = safeMap(null, (item) => item * 2)
    results.push(`✅ Safe map null: ${mappedNull.join(', ')}`)

    // Test 8: Is mappable checks
    results.push(`✅ Array is mappable: ${isMappable(normalArray)}`)
    results.push(`✅ Null is mappable: ${isMappable(null)}`)
    results.push(`✅ Object is mappable: ${isMappable(objectValue)}`)

    // Test 9: Safe length
    results.push(`✅ Array length: ${safeLength(normalArray)}`)
    results.push(`✅ Null length: ${safeLength(null)}`)
    results.push(`✅ Object length: ${safeLength(objectValue)}`)

    setTestResults(results)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Array Safety Tests</h1>
        
        <button
          onClick={runTests}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-8"
        >
          Run Array Safety Tests
        </button>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test .map() with various inputs:</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Array input:</h3>
              <div>{ensureArray([1, 2, 3]).map(x => x * 2).join(', ')}</div>
            </div>
            <div>
              <h3 className="font-medium">Null input:</h3>
              <div>{ensureArray(null).map(x => x * 2).join(', ') || 'Empty array'}</div>
            </div>
            <div>
              <h3 className="font-medium">Object input:</h3>
              <div>{ensureArray({ a: 1, b: 2 }).map(x => x * 2).join(', ')}</div>
            </div>
            <div>
              <h3 className="font-medium">String input:</h3>
              <div>{ensureArray('hello').map(x => x.toUpperCase()).join(', ')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}