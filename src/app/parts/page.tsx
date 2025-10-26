import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Package, Truck, CheckCircle, Clock, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'قطع الغيار | شركة الحمد لاستيراد السيارات',
  description: 'قطع الغيار الأصلية لجميع السيارات المستوردة مع ضمان الجودة',
}

export default function PartsPage() {
  const partsCategories = [
    {
      title: 'قطع غيار المحرك',
      description: 'جميع قطع غيار المحرك الأصلية',
      icon: Wrench,
      items: [
        'فلاتر الزيت والهواء',
        'شمعات الإشعال',
        'أحزمة التوقيت',
        'مضخات الماء والزيت',
        'رؤوس الأسطوانات'
      ]
    },
    {
      title: 'نظام الفرامل',
      description: 'قطع نظام الفرامل عالية الجودة',
      icon: Shield,
      items: [
        'تيل الفرامل',
        'أسطوانات الفرامل',
        'سوائل الفرامل',
        'أقراص الفرامل',
        'مضخات الفرامل'
      ]
    },
    {
      title: 'الإطارات والعجلات',
      description: 'إطارات وعجلات من أفضل الشركات',
      icon: Package,
      items: [
        'إطارات صيفية وشتوية',
        'عجلات ألومنيوم',
        'براغي وصواميل العجلات',
        'موازنات العجلات',
        'غطاء العجلات'
      ]
    },
    {
      title: 'الإلكترونيات',
      description: 'قطع إلكترونية وكهربائية',
      icon: CheckCircle,
      items: [
        'بطاريات السيارات',
        'مولدات الكهرباء',
        'أنظمة الصوت',
        'كاميرات الرجوع',
        'أجهزة الاستشعار'
      ]
    }
  ]

  const services = [
    {
      title: 'توصيل سريع',
      description: 'توصيل قطع الغيار خلال 24-48 ساعة',
      icon: Truck
    },
    {
      title: 'ضمان الجودة',
      description: 'جميع القطع أصلية ومعتمدة من المصنع',
      icon: Shield
    },
    {
      title: 'خدمة 24/7',
      description: 'دعم فني على مدار الساعة',
      icon: Clock
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Package className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">قطع الغيار الأصلية</h1>
            <p className="text-xl text-gray-600">
              نوفر جميع قطع الغيار الأصلية لسياراتكم المستوردة مع ضمان الجودة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {partsCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <service.icon className="h-6 w-6 text-blue-600" />
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>لماذا تختار قطع الغيار منا؟</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">المميزات:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>قطع أصلية 100% من المصنع</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>ضمان على جميع القطع</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>أسعار تنافسية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>توصيل سريع لجميع المحافظات</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">الخدمات الإضافية:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>تركيب مجاني للقطع</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>استشارة فنية مجانية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>تتبع الطلبات عبر الإنترنت</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>دعم فني 24/7</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">هل تبحث عن قطعة غيار معينة؟</h3>
            <p className="text-gray-600 mb-4">
              تواصل معنا وسنجد لك القطعة الأصلية بأفضل سعر
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+20212345678" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                اطلب الآن
              </a>
              <a 
                href="/contact" 
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                استفسار عن قطعة
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}