'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      addResult(`Testing ${method} ${endpoint}...`)
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      if (body) {
        options.body = JSON.stringify(body)
      }
      
      const response = await fetch(endpoint, options)
      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ ${method} ${endpoint} - Success: ${JSON.stringify(data).slice(0, 100)}...`)
      } else {
        addResult(`❌ ${method} ${endpoint} - Error ${response.status}: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      addResult(`❌ ${method} ${endpoint} - Network Error: ${error}`)
    }
  }

  const testCustomerCreation = () => {
    testAPI('/api/crm/customers', 'POST', {
      name: 'Test Customer',
      email: `test${Date.now()}@example.com`,
      phone: '01234567890',
      segment: 'LEAD'
    })
  }

  const testInvoiceCreation = () => {
    testAPI('/api/finance/invoices', 'POST', {
      customerId: 'test-customer-id',
      type: 'SERVICE',
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          unitPrice: 100
        }
      ],
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'admin'
    })
  }

  const testGetCustomers = () => {
    testAPI('/api/crm/customers')
  }

  const testGetInvoices = () => {
    testAPI('/api/finance/invoices')
  }

  useEffect(() => {
    addResult(`Session status: ${status}`)
    if (session) {
      addResult(`Session user: ${session.user?.email} (${session.user?.role})`)
    }
  }, [session, status])

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار المصادقة و API</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">معلومات الجلسة</h2>
            <div className="space-y-2">
              <p><strong>الحالة:</strong> {status}</p>
              {session?.user && (
                <>
                  <p><strong>البريد:</strong> {session.user.email}</p>
                  <p><strong>الاسم:</strong> {session.user.name}</p>
                  <p><strong>الدور:</strong> {session.user.role}</p>
                </>
              )}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">اختبارات API</h2>
            <div className="space-y-3">
              <button
                onClick={testGetCustomers}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                اختبار جلب العملاء
              </button>
              <button
                onClick={testCustomerCreation}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                اختبار إنشاء عميل
              </button>
              <button
                onClick={testGetInvoices}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                اختبار جلب الفواتير
              </button>
              <button
                onClick={testInvoiceCreation}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                اختبار إنشاء فاتورة
              </button>
              <button
                onClick={() => setTestResults([])}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                مسح النتائج
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">نتائج الاختبار</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">اضغط على أزرار الاختبار لبدء الاختبار</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : 'text-gray-600'}>
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}