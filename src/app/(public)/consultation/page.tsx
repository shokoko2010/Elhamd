'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, Calendar, MapPin, Mail, Clock, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { TouchButton, useDeviceInfo } from '@/components/ui/enhanced-mobile-optimization'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

export default function ConsultationPage() {
  const deviceInfo = useDeviceInfo()
  const [loadingAction, setLoadingAction] = useState<'call' | 'whatsapp' | 'booking' | null>(null)

  const handlePhoneCall = () => {
    setLoadingAction('call')
    // Simulate call action
    setTimeout(() => {
      window.open('tel:+201234567890', '_blank')
      setLoadingAction(null)
    }, 500)
  }

  const handleWhatsApp = () => {
    setLoadingAction('whatsapp')
    // Simulate WhatsApp action
    setTimeout(() => {
      const message = encodeURIComponent('مرحبا، أود الاستفسار عن سيارات تاتا المتاحة.')
      window.open(`https://wa.me/201234567890?text=${message}`, '_blank')
      setLoadingAction(null)
    }, 500)
  }

  const handleBooking = () => {
    setLoadingAction('booking')
    // Navigate to booking page
    setTimeout(() => {
      window.location.href = '/booking'
      setLoadingAction(null)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700">
      {/* Navigation Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-white hover:text-orange-200 transition-colors">
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
        <div className="max-w-4xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              <Phone className="ml-2 h-4 w-4" />
              خدمة العملاء
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              هل تريد الاستفسار عن سياراتنا؟
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              نحن هنا لمساعدتك في الاستفسار عن أي سيارة من سياراتنا تاتا أو حجز موعد للقيادة التجريبية
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Contact Us Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  اتصل بنا
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  تواصل معنا مباشرة للحصول على مساعدة فورية
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">+20 123 456 7890</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">24/7 خدمة متاحة</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <TouchButton
                    onClick={handlePhoneCall}
                    disabled={loadingAction !== null}
                    variant="primary"
                    size={deviceInfo.isMobile ? "lg" : "xl"}
                    fullWidth
                    hapticFeedback={true}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-4 border-orange-600"
                  >
                    {loadingAction === 'call' ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري الاتصال...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Phone className="ml-2 h-5 w-5" />
                        اتصال هاتفي
                      </div>
                    )}
                  </TouchButton>
                  <TouchButton
                    onClick={handleWhatsApp}
                    disabled={loadingAction !== null}
                    variant="outline"
                    size={deviceInfo.isMobile ? "lg" : "xl"}
                    fullWidth
                    hapticFeedback={true}
                    className="border-green-600 text-green-700 hover:bg-green-50"
                  >
                    {loadingAction === 'whatsapp' ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                        جاري فتح واتساب...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <MessageCircle className="ml-2 h-5 w-5" />
                        مراسلة واتساب
                      </div>
                    )}
                  </TouchButton>
                </div>
              </CardContent>
            </Card>

            {/* Book Visit Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  حجز زيارة
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  احجز موعداً لزيارة المعرض والقيادة التجريبية
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">المعرض الرئيسي</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">9:00 ص - 10:00 م</span>
                  </div>
                </div>
                <TouchButton
                  onClick={handleBooking}
                  disabled={loadingAction !== null}
                  variant="primary"
                  size={deviceInfo.isMobile ? "lg" : "xl"}
                  fullWidth
                  hapticFeedback={true}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-4 border-orange-600"
                >
                  {loadingAction === 'booking' ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري الحجز...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Calendar className="ml-2 h-5 w-5" />
                      احجز الآن
                    </div>
                  )}
                </TouchButton>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-orange-100 text-lg">
                يمكنك التواصل معنا عبر الاتصال الهاتفي أو رسائل واتساب، كما يمكنك زيارة المعرض مباشرة أو مراسلتنا عبر البريد الإلكتروني
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="h-4 w-4" />
                  <span>123 شارع الرئيسي، القاهرة</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Mail className="h-4 w-4" />
                  <span>info@elhamdimport.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-orange-100">
            © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}