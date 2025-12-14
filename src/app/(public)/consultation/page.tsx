'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, Calendar, MapPin, Mail, Clock, ArrowLeft, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { TouchButton, useDeviceInfo } from '@/components/ui/enhanced-mobile-optimization'

interface ContactInfo {
  primaryPhone?: string
  primaryEmail?: string
  address?: string
  workingHours?: { day: string; hours: string }[]
}

export default function ConsultationPage() {
  const deviceInfo = useDeviceInfo()
  const [loadingAction, setLoadingAction] = useState<'call' | 'whatsapp' | 'booking' | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      }
    }
    fetchContactInfo()
  }, [])

  const handlePhoneCall = () => {
    setLoadingAction('call')
    setTimeout(() => {
      window.open(`tel:${contactInfo?.primaryPhone || '+201234567890'}`, '_blank')
      setLoadingAction(null)
    }, 500)
  }

  const handleWhatsApp = () => {
    setLoadingAction('whatsapp')
    setTimeout(() => {
      const phone = contactInfo?.primaryPhone?.replace(/\D/g, '') || '201234567890'
      const message = encodeURIComponent('مرحبا، أود الاستفسار عن خدمات الحمد للسيارات.')
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
      setLoadingAction(null)
    }, 500)
  }

  const handleBooking = () => {
    setLoadingAction('booking')
    setTimeout(() => {
      window.location.href = '/booking'
      setLoadingAction(null)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-white hover:text-blue-200 transition-colors group">
              <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">العودة للرئيسية</span>
            </Link>
            <div className="text-white text-xl font-bold tracking-tight">
              الحمد للسيارات
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-2 backdrop-blur-sm">
              <Star className="h-4 w-4 fill-blue-300" />
              <span className="text-sm font-medium">خدمة عملاء متميزة</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                كيف يمكننا مساعدتك اليوم؟
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/70 max-w-2xl mx-auto leading-relaxed font-light">
              سواء كنت تبحث عن سيارة جديدة، تحتاج إلى صيانة، أو لديك استفسار، فريقنا هنا لخدمتك
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Contact Us Card */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-blue-500/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10">
              <CardHeader className="text-center pb-8 border-b border-white/5">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-3">
                  تواصل معنا
                </CardTitle>
                <CardDescription className="text-lg text-blue-200/60">
                  للاستفسارات العاجلة والمساعدة الفورية
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 px-8">
                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 text-blue-100">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Phone className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-semibold text-lg" dir="ltr">{contactInfo?.primaryPhone || 'جاري التحميل...'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 text-blue-100">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Clock className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-medium">خدمة متاحة على مدار اليوم</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <TouchButton
                    onClick={handlePhoneCall}
                    disabled={loadingAction !== null}
                    variant="primary"
                    size={deviceInfo.isMobile ? "lg" : "xl"}
                    fullWidth
                    hapticFeedback={true}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 shadow-lg shadow-blue-600/30 border-0 flex-1 rounded-xl"
                  >
                    {loadingAction === 'call' ? (
                      <span className="flex items-center gap-3">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        جاري الاتصال...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Phone className="h-5 w-5" />
                        اتصال هاتفي
                      </span>
                    )}
                  </TouchButton>
                  <TouchButton
                    onClick={handleWhatsApp}
                    disabled={loadingAction !== null}
                    variant="outline"
                    size={deviceInfo.isMobile ? "lg" : "xl"}
                    fullWidth
                    hapticFeedback={true}
                    className="bg-white/10 hover:bg-green-600 border-0 text-white hover:text-white font-bold py-6 backdrop-blur-md flex-1 rounded-xl transition-all duration-300"
                  >
                    {loadingAction === 'whatsapp' ? (
                      <span className="flex items-center gap-3">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        جاري الفتح...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5" />
                        واتساب
                      </span>
                    )}
                  </TouchButton>
                </div>
              </CardContent>
            </Card>

            {/* Book Visit Card */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-orange-500/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-orange-500/10">
              <CardHeader className="text-center pb-8 border-b border-white/5">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-3">
                  حجز زيارة
                </CardTitle>
                <CardDescription className="text-lg text-blue-200/60">
                  احجز موعداً لزيارة المعرض وتجربة القيادة
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 px-8">
                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 text-orange-100">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <MapPin className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="font-semibold text-lg">المعرض الرئيسي</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 text-orange-100">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Clock className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="font-medium">
                        {contactInfo?.workingHours?.[0]?.hours || '9:00 ص - 10:00 م'}
                      </span>
                    </div>
                  </div>
                </div>
                <TouchButton
                  onClick={handleBooking}
                  disabled={loadingAction !== null}
                  variant="primary"
                  size={deviceInfo.isMobile ? "lg" : "xl"}
                  fullWidth
                  hapticFeedback={true}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-6 shadow-lg shadow-orange-600/30 border-0 rounded-xl"
                >
                  {loadingAction === 'booking' ? (
                    <span className="flex items-center gap-3">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      جاري التحويل...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      احجز موعد الآن
                    </span>
                  )}
                </TouchButton>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <p className="text-blue-200/50 text-sm">
              © 2024 الحمد للسيارات. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}