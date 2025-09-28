'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MapPin, Clock, ArrowLeft, Building, Globe } from 'lucide-react'
import Link from 'next/link'
import { TouchButton, useDeviceInfo } from '@/components/ui/enhanced-mobile-optimization'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

export default function ContactInfoPage() {
  const deviceInfo = useDeviceInfo()
  const [isLoading, setIsLoading] = useState(false)

  const handlePhoneCall = () => {
    setIsLoading(true)
    setTimeout(() => {
      window.open('tel:+201234567890', '_blank')
      setIsLoading(false)
    }, 500)
  }

  const handleEmailClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      window.open('mailto:info@alhamdcars.com', '_blank')
      setIsLoading(false)
    }, 500)
  }

  const handleMapClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      window.open('https://maps.google.com/?q=123+Main+Street+Cairo+Egypt', '_blank')
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Navigation Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-white hover:text-blue-200 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">العودة للرئيسية</span>
            </Link>
            <div className="text-white text-xl font-bold">
              الحمد للسيارات
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              <Building className="ml-2 h-4 w-4" />
              معلومات الاتصال
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              مرحباً بكم في الحمد للسيارات
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              نحن وكيل تاتا المعتمد في مصر، نقدم أفضل الخدمات والمنتجات لعملائنا الكرام
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Address Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  العنوان
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  موقع المعرض الرئيسي
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">المعرض الرئيسي</p>
                    <p className="text-sm leading-relaxed">
                      123 شارع الرئيسي<br />
                      منطقة التجارة<br />
                      القاهرة، مصر<br />
                      الرمز البريدي: 11511
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-sm">
                      السبت - الخميس: 9:00 ص - 10:00 م<br />
                      الجمعة: 2:00 م - 10:00 م
                    </span>
                  </div>
                </div>
                <TouchButton
                  onClick={handleMapClick}
                  disabled={isLoading}
                  variant="default"
                  size={deviceInfo.isMobile ? "lg" : "xl"}
                  fullWidth
                  hapticFeedback={true}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري التحميل...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <MapPin className="ml-2 h-5 w-5" />
                      عرض على الخريطة
                    </div>
                  )}
                </TouchButton>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  البريد الإلكتروني
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  تواصل معنا عبر البريد
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">البريد الرئيسي</p>
                    <p className="text-sm text-blue-600 font-medium">
                      info@alhamdcars.com
                    </p>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">خدمة العملاء</p>
                    <p className="text-sm text-blue-600 font-medium">
                      support@alhamdcars.com
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-sm">خدمة 24/7 متاحة</span>
                  </div>
                </div>
                <TouchButton
                  onClick={handleEmailClick}
                  disabled={isLoading}
                  variant="default"
                  size={deviceInfo.isMobile ? "lg" : "xl"}
                  fullWidth
                  hapticFeedback={true}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري التحميل...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mail className="ml-2 h-5 w-5" />
                      ارسل بريداً
                    </div>
                  )}
                </TouchButton>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  الهاتف
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  اتصل بنا مباشرة
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">الخط الرئيسي</p>
                    <p className="text-sm text-blue-600 font-medium">
                      +20 2 1234 5678
                    </p>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium mb-2">الجوال</p>
                    <p className="text-sm text-blue-600 font-medium">
                      +20 10 1234 5678
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-sm">خدمة 24/7 متاحة</span>
                  </div>
                </div>
                <TouchButton
                  onClick={handlePhoneCall}
                  disabled={isLoading}
                  variant="default"
                  size={deviceInfo.isMobile ? "lg" : "xl"}
                  fullWidth
                  hapticFeedback={true}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري الاتصال...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Phone className="ml-2 h-5 w-5" />
                      اتصل الآن
                    </div>
                  )}
                </TouchButton>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                معلومات إضافية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white mb-1">الموقع الإلكتروني</p>
                    <p className="text-blue-100 text-sm">www.alhamdcars.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white mb-1">الفروع</p>
                    <p className="text-blue-100 text-sm">القاهرة - الإسكندرية - الجيزة</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white mb-1">موعد العمل</p>
                    <p className="text-blue-100 text-sm">7 أيام في الأسبوع</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-blue-100">
            © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}