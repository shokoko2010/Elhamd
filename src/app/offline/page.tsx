'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, RefreshCw, Home, Car, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  useEffect(() => {
    // Check if user comes back online
    const handleOnline = () => {
      window.location.reload()
    }
    
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">أنت غير متصل بالإنترنت</CardTitle>
            <CardDescription className="text-gray-600">
              يبدو أنك فقدت الاتصال بالإنترنت. لا تقلق، يمكنك الوصول إلى بعض الميزات دون اتصال.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Home className="w-6 h-6" />
                  <span className="text-sm">الرئيسية</span>
                </Button>
              </Link>
              
              <Link href="/vehicles">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Car className="w-6 h-6" />
                  <span className="text-sm">السيارات</span>
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Phone className="w-6 h-6" />
                  <span className="text-sm">اتصل بنا</span>
                </Button>
              </Link>
              
              <Link href="/service">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Mail className="w-6 h-6" />
                  <span className="text-sm">الخدمات</span>
                </Button>
              </Link>
            </div>
            
            {/* Offline Features */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">ميزات متاحة دون اتصال</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-right">
                <li>• تصفح السيارات المخبأة</li>
                <li>• عرض معلومات الاتصال</li>
                <li>• قراءة مواصفات السيارات</li>
                <li>• الوصول للصفحات الرئيسية</li>
              </ul>
            </div>
            
            {/* Retry Button */}
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
            
            <p className="text-xs text-gray-500">
              سيتم إعادة التحميل تلقائياً عند عودة الاتصال بالإنترنت
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}