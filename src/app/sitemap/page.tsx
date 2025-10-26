import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, Home, Car, Wrench, Users, Phone, FileText, HelpCircle, Shield, Settings } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'خريطة الموقع | شركة الحمد لاستيراد السيارات',
  description: 'خريطة شاملة لجميع صفحات وأقسام موقع شركة الحمد لاستيراد السيارات',
}

export default function SitemapPage() {
  const sections = [
    {
      title: 'الصفحات الرئيسية',
      description: 'الصفحات الأساسية في الموقع',
      icon: Home,
      links: [
        { name: 'الرئيسية', href: '/', description: 'الصفحة الرئيسية للموقع' },
        { name: 'السيارات', href: '/vehicles', description: 'معرض السيارات المتاحة' },
        { name: 'الخدمات', href: '/service-booking', description: 'حجز الخدمات والصيانة' },
        { name: 'من نحن', href: '/about', description: 'معلومات عن الشركة' },
        { name: 'اتصل بنا', href: '/contact', description: 'طرق التواصل معنا' },
      ]
    },
    {
      title: 'الخدمات',
      description: 'جميع الخدمات التي نقدمها',
      icon: Wrench,
      links: [
        { name: 'بيع السيارات', href: '/vehicles', description: 'شراء السيارات المستوردة' },
        { name: 'قيادة تجريبية', href: '/test-drive', description: 'حجز قيادة تجريبية' },
        { name: 'حجز الخدمة', href: '/service-booking', description: 'حجز موعد للصيانة' },
        { name: 'التمويل', href: '/financing', description: 'خدمات التمويل السيارات' },
        { name: 'الصيانة', href: '/maintenance', description: 'خدمات الصيانة الدورية' },
      ]
    },
    {
      title: 'الدعم والمساعدة',
      description: 'صفحات الدعم والمساعدة',
      icon: HelpCircle,
      links: [
        { name: 'الدعم الفني', href: '/support', description: 'الدعم الفني والمساعدة' },
        { name: 'الضمان', href: '/warranty', description: 'معلومات الضمان' },
        { name: 'قطع الغيار', href: '/parts', description: 'قطع الغيار الأصلية' },
        { name: 'الأسئلة الشائعة', href: '/faq', description: 'الإجابة على الأسئلة المتكررة' },
      ]
    },
    {
      title: 'المعلومات القانونية',
      description: 'الصفحات القانونية والسياسات',
      icon: FileText,
      links: [
        { name: 'سياسة الخصوصية', href: '/privacy', description: 'سياسة خصوصية الموقع' },
        { name: 'الشروط والأحكام', href: '/terms', description: 'شروط استخدام الموقع' },
        { name: 'خريطة الموقع', href: '/sitemap', description: 'خريطة الموقع الحالية' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Map className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">خريطة الموقع</h1>
            <p className="text-xl text-gray-600">
              اكتشف جميع صفحات وأقسام موقع شركة الحمد لاستيراد السيارات
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-6 w-6 text-blue-600" />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex} className="border-b border-gray-100 pb-2 last:border-0">
                        <Link 
                          href={link.href}
                          className="block hover:bg-gray-50 p-2 rounded transition-colors"
                        >
                          <div className="font-medium text-gray-900 hover:text-blue-600">
                            {link.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {link.description}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              هل تحتاج مساعدة في العثور على ما تبحث عنه؟
            </h2>
            <p className="text-gray-600 text-center mb-6">
              فريق الدعم لدينا جاهز لمساعدتك في العثور على أي معلومة تحتاجها
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                اتصل بنا
              </Link>
              <Link 
                href="/faq" 
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-center"
              >
                الأسئلة الشائعة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}