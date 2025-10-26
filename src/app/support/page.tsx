import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Headphones, MessageCircle, Phone, Mail, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'الدعم الفني | شركة الحمد لاستيراد السيارات',
  description: 'الدعم الفني المتخصص لجميع سياراتكم المستوردة',
}

export default function SupportPage() {
  const supportChannels = [
    {
      title: 'الدعم عبر الهاتف',
      description: 'دعم فني مباشر على مدار الساعة',
      icon: Phone,
      contact: '+20 2 1234 5678',
      hours: '24/7',
      action: 'اتصل الآن'
    },
    {
      title: 'الدعم عبر البريد',
      description: 'إرسال استفساراتكم التقنية',
      icon: Mail,
      contact: 'support@elhamdimport.com',
      hours: 'رد خلال 24 ساعة',
      action: 'أرسل بريداً'
    },
    {
      title: 'الدعم عبر الدردشة',
      description: 'محادثة مباشرة مع الفنيين',
      icon: MessageCircle,
      contact: 'متاح على الموقع',
      hours: '9 ص - 8 م',
      action: 'ابدأ الدردشة'
    }
  ]

  const supportServices = [
    {
      title: 'المساعدة الفنية',
      description: 'حل المشاكل التقنية والاستفسارات',
      icon: CheckCircle,
      features: [
        'تشخيص الأعطال',
        'إرشادات الصيانة',
        'مساعدة في البرمجة',
        'استشارات تقنية'
      ]
    },
    {
      title: 'دعم الطوارئ',
      description: 'مساعدة عاجلة على الطريق',
      icon: Clock,
      features: [
        'خدمة 24/7',
        'سحب السيارة',
        'إصلاح عاجل',
        'سيارة بديلة'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Headphones className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">الدعم الفني</h1>
            <p className="text-xl text-gray-600">
              فريق الدعم الفني المتخصص جاهز لمساعدتك في أي وقت
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {supportChannels.map((channel, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <channel.icon className="h-6 w-6 text-blue-600" />
                    {channel.title}
                  </CardTitle>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">التواصل:</p>
                      <p className="font-semibold">{channel.contact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ساعات العمل:</p>
                      <p className="font-semibold">{channel.hours}</p>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      {channel.action}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {supportServices.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-6 w-6 text-blue-600" />
                    {service.title}
                  </CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>الإجراءات المتبعة عند طلب الدعم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold">التواصل</h3>
                  <p className="text-sm text-gray-600">اختر قناة التواصل المناسبة</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold">التشخيص</h3>
                  <p className="text-sm text-gray-600">شرح المشكلة بالتفصيل</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold">الحل</h3>
                  <p className="text-sm text-gray-600">تقديم الحل المناسب</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <h3 className="font-semibold">المتابعة</h3>
                  <p className="text-sm text-gray-600">متابعة الحل حتى النهاية</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">هل تحتاج مساعدة عاجلة؟</h3>
            <p className="text-gray-600 mb-4">
              لا تتردد في التواصل معنا في أي وقت - فريق الدعم جاهز لمساعدتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+20212345678" 
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                طوارئ 24/7
              </a>
              <Link 
                href="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                نموذج الدعم
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}