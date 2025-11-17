'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Wrench, 
  Clock, 
  Shield, 
  Car, 
  Phone, 
  Mail, 
  CheckCircle,
  ArrowLeft,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
  price?: string
  duration?: string
  category: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceCopy, setServiceCopy] = useState({
    title: 'خدماتنا',
    subtitle: 'نقدم مجموعة شاملة من خدمات الصيانة والإصلاح لضمان أداء سيارتك المثالي',
    description: '',
    ctaText: 'احجز الآن'
  })

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/service-items')
        if (response.ok) {
          const data = await response.json()
          setServices(Array.isArray(data) ? data : [])
        }

        const settingsResponse = await fetch('/api/homepage-settings')
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json()
          setServiceCopy({
            title: typeof settings?.servicesTitle === 'string' ? settings.servicesTitle : 'خدماتنا',
            subtitle:
              typeof settings?.servicesSubtitle === 'string'
                ? settings.servicesSubtitle
                : 'نقدم مجموعة شاملة من خدمات الصيانة والإصلاح لضمان أداء سيارتك المثالي',
            description: typeof settings?.servicesDescription === 'string' ? settings.servicesDescription : '',
            ctaText: typeof settings?.servicesCtaText === 'string' ? settings.servicesCtaText : 'احجز الآن'
          })
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Wrench': Wrench,
      'Clock': Clock,
      'Shield': Shield,
      'Car': Car,
      'Users': Users,
      'Zap': Zap
    }
    return iconMap[iconName] || Wrench
  }

  const defaultServices: Service[] = [
    {
      id: '1',
      title: 'صيانة دورية',
      description: 'فحص شامل وصيانة منتظمة لضمان أداء سيارتك المثالي',
      icon: 'Wrench',
      features: ['تغيير الزيت', 'فحص الفرامل', 'فحص الإطارات', 'فحص البطارية'],
      price: 'من 500 ج.م',
      duration: '2-3 ساعات',
      category: 'صيانة'
    },
    {
      id: '2',
      title: 'إصلاح محركات',
      description: 'خدمات متخصصة لإصلاح وصيانة محركات السيارات',
      icon: 'Car',
      features: ['تشخيص أعطال المحرك', 'إصلاح كامل', 'صيانة وقائية', 'تحسين الأداء'],
      price: 'يبدأ من 1500 ج.م',
      duration: 'حسب الحالة',
      category: 'إصلاحات'
    },
    {
      id: '3',
      title: 'خدمة كاملة',
      description: 'خدمة شاملة تشمل جميع جوانب صيانة سيارتك',
      icon: 'Shield',
      features: ['فحص 50 نقطة', 'تنظيف داخل وخارج', 'تغيير فلتر', 'ضبط المحرك'],
      price: 'من 1200 ج.م',
      duration: '4-5 ساعات',
      category: 'خدمات'
    },
    {
      id: '4',
      title: 'فحص كهرباء',
      description: 'تشخيص وإصلاح جميع المشاكل الكهربائية في السيارة',
      icon: 'Zap',
      features: ['تشخيص كمبيوتر', 'إصلاح أسلاك', 'صيانة بطارية', 'فحص إضاءة'],
      price: 'من 300 ج.م',
      duration: '1-2 ساعة',
      category: 'كهرباء'
    }
  ]

  const displayServices = services.length > 0 ? services : defaultServices

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الخدمات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{serviceCopy.title}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">{serviceCopy.subtitle}</p>
            {serviceCopy.description && (
              <p className="mt-4 text-blue-100/90 max-w-4xl mx-auto text-lg">{serviceCopy.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayServices.map((service) => {
            const IconComponent = getIconComponent(service.icon)
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">المميزات:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {service.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">السعر:</span>
                        <Badge variant="secondary">{service.price}</Badge>
                      </div>
                    )}
                    
                    {service.duration && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">المدة:</span>
                        <span className="text-sm font-medium">{service.duration}</span>
                      </div>
                    )}

                    <Button className="w-full mt-4">
                      {serviceCopy.ctaText}
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">هل تحتاج إلى مساعدة؟</h2>
          <p className="text-xl mb-8 text-blue-100">
            فريقنا من الخبراء جاهز لمساعدتك في أي وقت
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Phone className="ml-2 h-5 w-5" />
                اتصل بنا
              </Button>
            </Link>
            <Link href="/service-booking">
              <Button size="lg" className="w-full sm:w-auto">
                <Clock className="ml-2 h-5 w-5" />
                احجز موعد
              </Button>
            </Link>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تختارنا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">فريق محترف</h3>
              <p className="text-gray-600">فنيون مدربون وذوو خبرة في جميع أنواع السيارات</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ضمان الجودة</h3>
              <p className="text-gray-600">نضمن جودة الخدمة واستخدام قطع غيار أصلية</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">خدمة سريعة</h3>
              <p className="text-gray-600">نقدم خدمات سريعة وفعالة دون التضحية بالجودة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}