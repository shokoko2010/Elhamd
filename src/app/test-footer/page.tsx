'use client'

import { useEffect, useState } from 'react'
import Footer from '@/components/footer'

export default function TestFooterPage() {
  const [footerData, setFooterData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/footer')
        const data = await response.json()
        setFooterData(data)
      } catch (error) {
        console.error('Error fetching footer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الفوتر...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">اختبار الفوتر</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">بيانات الفوتر الخام:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(footerData, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">أعمدة الفوتر:</h2>
          {footerData?.columns?.map((column: any, index: number) => (
            <div key={column.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{column.title} ({column.type})</h3>
              <div className="text-sm text-gray-600">
                <p><strong>المحتوى:</strong> {column.content}</p>
                <p><strong>المحتوى بعد التحليل:</strong></p>
                <ul className="list-disc list-inside mt-2">
                  {JSON.parse(column.content).map((item: any, itemIndex: number) => (
                    <li key={itemIndex}>
                      <strong>النص:</strong> {item.text} | <strong>الرابط:</strong> {item.href}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 text-white rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">الفوتر الفعلي:</h2>
          <Footer />
        </div>
      </div>
    </div>
  )
}