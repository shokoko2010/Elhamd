'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Car, Wrench, ArrowLeft, CheckCircle, Clock, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState('test-drive')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للرئيسية
            </Link>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                مركز الحجز
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                احجز تجربة قيادة أو موعد صيانة لسيارتك تاتا
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="test-drive" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                تجربة قيادة
              </TabsTrigger>
              <TabsTrigger value="service" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                حجز صيانة
              </TabsTrigger>
            </TabsList>

            {/* Test Drive Tab */}
            <TabsContent value="test-drive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    احجز تجربة قيادة
                  </CardTitle>
                  <CardDescription>
                    جرب بنفسك قيادة سيارات تاتا واختبر أدائها وجودتها
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">لماذا تجربة القيادة؟</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          اختبر أداء السيارة بشكل عملي
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          تعرف على مميزات السيارة الداخلية
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          استشر مع مندوبينا المتخصصين
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          قارن بين الموديلات المختلفة
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">معلومات الحجز</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>المدة: 30 - 45 دقيقة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>الموقع: القاهرة، مصر</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>للحجز: +20 2 1234 5678</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Link href="/test-drive">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="ml-2 h-4 w-4" />
                        احجز تجربة قيادة الآن
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Booking Tab */}
            <TabsContent value="service" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    حجز موعد صيانة
                  </CardTitle>
                  <CardDescription>
                    احجز موعداً لصيانة سيارتك تاتا مع فنيين معتمدين وقطع غيار أصلية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">خدماتنا</h3>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="mr-2 mb-2">صيانة دورية</Badge>
                        <Badge variant="secondary" className="mr-2 mb-2">إصلاح عام</Badge>
                        <Badge variant="secondary" className="mr-2 mb-2">فحص شامل</Badge>
                        <Badge variant="secondary" className="mr-2 mb-2">تغيير زيت</Badge>
                        <Badge variant="secondary" className="mr-2 mb-2">صيانة مكيف</Badge>
                        <Badge variant="secondary" className="mr-2 mb-2">فحص فرامل</Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">مميزاتنا</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          فنيون معتمدون من تاتا
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          قطع غيار أصلية فقط
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          ضمان على جميع الخدمات
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          خدمة سيارة بديلة
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-center">
                    <Link href="/service-booking-ar">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="ml-2 h-4 w-4" />
                        احجز موعد صيانة الآن
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}