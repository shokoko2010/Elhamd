'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'
import { Suspense } from 'react'

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            الصفحة غير موجودة
          </h2>
          <p className="text-gray-600 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/vehicles" className="flex items-center justify-center gap-2">
              <Search className="h-4 w-4" />
              تصفح السيارات
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            تحتاج مساعدة؟{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800">
              تواصل معنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
}