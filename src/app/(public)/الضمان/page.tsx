'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  Car,
  FileText,
  AlertCircle,
  Award,
  Users
} from 'lucide-react'
import Link from 'next/link'

export default function WarrantyPage() {
  const warrantyTypes = [
    {
      title: 'ضمان الشركة المصنعة',
      description: 'ضمان من الشركة المصنعة للسيارة',
      duration: '3 سنوات أو 100,000 كم',
      coverage: 'شامل',
      features: ['جميع الأعطال الميكانيكية', 'قطع غيار أصلية', 'صيانة في الوكالات المعتمدة']
    },
    {
      title: 'ضمان الهامد الممتد',
      description: 'ضمان إضافي من الهامد',
      duration: 'سنة إضافية',
      coverage: 'شامل',
      features: ['تغطية المحرك والناقل', 'خدمة طريق 24/7', 'سيارة بديلة']
    },
    {
      title: 'ضمان قطع الغيار',
      description: 'ضمان على قطع الغيار المركبة',
      duration: '6 أشهر',
      coverage: 'قطع الغيار فقط',
      features: ['قطع أصلية فقط', 'استبدال مجاني', 'تركيب مجاني']
    },
    {
      title: 'ضمان طلاء السيارة',
      description: 'ضمان ضد الصدأ وتقشر الطلاء',
      duration: '5 سنوات',
      coverage: 'الطلاء والهيكل',
      features: ['الحماية من الصدأ', 'لمعان الطلاء', 'الحفاظ على اللون']
    }
  ]

  const coveredItems = [
    'المحرك وناقل الحركة',
    'نظام التعليق',
    'نظام الفرامل',
    'نظام التكييف والتدفئة',
    'النظام الكهربائي',
    'هيكل السيارة',
    'نظام العادم'
  ]

  const notCoveredItems = [
    'قطع التآكل الطبيعي (فرامل، إطارات)',
    'الزيوت والسوائل',
    'الفلاتر',
    'الضرر الناتج عن الحوادث',
    'الاستخدام الخاطئ للسيارة',
    'التعديلات غير المصرح بها'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">الضمان والكفالة</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              نقدم أفضل برامج الضمان لضمان راحة بالكامل
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Warranty Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {warrantyTypes.map((warranty, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{warranty.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{warranty.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المدة:</span>
                    <Badge variant="outline">{warranty.duration}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">التغطية:</span>
                    <Badge variant={warranty.coverage === 'شامل' ? 'default' : 'secondary'}>
                      {warranty.coverage}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">المميزات:</h4>
                    <ul className="space-y-1">
                      {warranty.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coverage Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                ما يغطيه الضمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {coveredItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                ما لا يغطيه الضمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {notCoveredItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Warranty Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">كيفية استخدام الضمان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">اكتشاف المشكلة</h3>
                <p className="text-gray-600 text-sm">عند اكتشاف أي عطل في سيارتك</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">تواصل معنا</h3>
                <p className="text-gray-600 text-sm">اتصل بنا أو زر مركز الخدمة</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">الفحص والتشخيص</h3>
                <p className="text-gray-600 text-sm">يقوم فريقنا بفحص السيارة</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">الإصلاح المجاني</h3>
                <p className="text-gray-600 text-sm">إصلاح العطل تحت الضمان</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">جودة معتمدة</h3>
            <p className="text-gray-600">ضمان معتمد من الشركات المصنعة</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">خدمة سريعة</h3>
            <p className="text-gray-600">معالجة سريعة لجميع المطالبات</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">دعم كامل</h3>
            <p className="text-gray-600">فريق دعم متخصص لمساعدتك</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">لديك استفسار عن الضمان؟</h2>
          <p className="text-xl mb-8 text-blue-100">
            فريق خدمة العملاء جاهز للإجابة على جميع أسئلتك
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">خط الضمان</h3>
              <p className="text-blue-100">+20 2 1234 5678</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">بريد الضمان</h3>
              <p className="text-blue-100">warranty@elhamdimport.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">الشروط الكاملة</h3>
              <p className="text-blue-100">متاحة في المركز</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                تحقق من ضمان سيارتك
              </Button>
            </Link>
            <Link href="/service-booking">
              <Button size="lg" className="w-full sm:w-auto">
                احجز موعد للصيانة
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}