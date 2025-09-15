'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wrench, 
  Car, 
  Clock, 
  Shield, 
  Users, 
  Star,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Settings,
  Fuel,
  Battery,
  Circle,
  Cog,
  AirVent,
  Square,
  Lightbulb,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  description: string
  duration: string
  price: string
  category: string
  features: string[]
  icon: any
  popular: boolean
}

interface MaintenancePackage {
  id: string
  name: string
  description: string
  price: string
  savings: string
  services: string[]
  includes: string[]
  validity: string
}

interface Technician {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  certifications: string[]
}

export default function MaintenancePage() {
  const [services, setServices] = useState<Service[]>([])
  const [packages, setPackages] = useState<MaintenancePackage[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')

  useEffect(() => {
    // Mock services data
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'تغيير الزيت والفلتر',
        description: 'صيانة دورية شاملة لتغيير زيت المحرك والفلتر',
        duration: '30 دقيقة',
        price: '350 جنيه',
        category: 'صيانة دورية',
        features: ['زيت محرك أصلي', 'فلتر زيت جديد', 'فحص شامل', 'تقرير حالة'],
        icon: Fuel,
        popular: true
      },
      {
        id: '2',
        name: 'فحص الفرامل',
        description: 'فحص وصيانة نظام الفرامل بالكامل',
        duration: '60 دقيقة',
        price: '450 جنيه',
        category: 'نظام الفرامل',
        features: ['فحص تآكل الفرامل', 'تغيير أسطوانات الفرامل', 'فحص سائل الفرامل', 'ضبط الفرامل'],
        icon: Square,
        popular: true
      },
      {
        id: '3',
        name: 'صيانة المكيف',
        description: 'صيانة وتنظيف نظام تكييف الهواء',
        duration: '45 دقيقة',
        price: '600 جنيه',
        category: 'نظام التكييف',
        features: ['تنظيف مكيف', 'شحن غاز التكييف', 'فحص ضاغط الهواء', 'تعقيم النظام'],
        icon: AirVent,
        popular: false
      },
      {
        id: '4',
        name: 'خدمة البطارية',
        description: 'فحص وصيانة البطارية واستبدالها إذا لزم الأمر',
        duration: '30 دقيقة',
        price: '200 جنيه',
        category: 'الكهرباء',
        features: ['فحص البطارية', 'تنظيف أقطاب البطارية', 'قياس الشحن', 'استبدال البطارية'],
        icon: Battery,
        popular: false
      },
      {
        id: '5',
        name: 'اتزان العجلات',
        description: 'اتزان العجلات وضبط زوايا العجلة الأمامية',
        duration: '60 دقيقة',
        price: '300 جنيه',
        category: 'العجلات',
        features: ['اتزان العجلات', 'ضبط زوايا العجلة', 'فحص ضغط الهواء', 'فحص الإطارات'],
        icon: Circle,
        popular: false
      },
      {
        id: '6',
        name: 'تشخيص المحرك',
        description: 'تشخيص شامل للمحرك باستخدام أحدث الأجهزة',
        duration: '90 دقيقة',
        price: '400 جنيه',
        category: 'المحرك',
        features: ['تشخيص كمبيوتر', 'فحص أعطال المحرك', 'قراءة رموز الأخطاء', 'تقرير تفصيلي'],
        icon: Cog,
        popular: false
      },
      {
        id: '7',
        name: 'صيانة الأنظمة الكهربائية',
        description: 'فحص وصيانة جميع الأنظمة الكهربائية',
        duration: '120 دقيقة',
        price: '800 جنيه',
        category: 'الكهرباء',
        features: ['فحص الأسلاك', 'فحص المصابيح', 'فحص أجهزة القياس', 'فحص نظام الشحن'],
        icon: Lightbulb,
        popular: false
      },
      {
        id: '8',
        name: 'خدمة التنظيف الشاملة',
        description: 'تنظيف وتلميع داخل وخارج السيارة',
        duration: '180 دقيقة',
        price: '800 جنيه',
        category: 'التنظيف',
        features: ['غسيل خارجي', 'تنظيف داخلي', 'تلميع وتلميع', 'تنظيف المقاعد'],
        icon: Car,
        popular: true
      }
    ]
    setServices(mockServices)

    // Mock packages data
    const mockPackages: MaintenancePackage[] = [
      {
        id: '1',
        name: 'الباقة الأساسية',
        description: 'صيانة دورية أساسية للحفاظ على سيارتك',
        price: '1200 جنيه',
        savings: 'توفير 15%',
        services: ['تغيير الزيت', 'فحص الفرامل', 'فحص البطارية', 'فحص الإطارات'],
        includes: ['فحص شامل', 'تقرير حالة', 'ضمان 6 أشهر'],
        validity: '6 أشهر'
      },
      {
        id: '2',
        name: 'الباقة المتقدمة',
        description: 'صيانة شاملة لسيارتك مع ضمان ممتد',
        price: '2500 جنيه',
        savings: 'توفير 25%',
        services: ['تغيير الزيت', 'فحص الفرامل', 'صيانة المكيف', 'اتزان العجلات', 'تشخيص المحرك'],
        includes: ['صيانة شاملة', 'قطع غيار أصلية', 'ضمان سنة', 'خدمة سيارة بديلة'],
        validity: 'سنة واحدة'
      },
      {
        id: '3',
        name: 'باقة السيارة الجديدة',
        description: 'حزمة صيانة كاملة للسيارات الجديدة',
        price: '4500 جنيه',
        savings: 'توفير 30%',
        services: ['جميع الخدمات الأساسية', 'صيانة المكيف', 'خدمة التنظيف', 'فحص سنوي'],
        includes: ['صيانة كاملة', 'قطع غيار أصلية', 'ضمان سنتين', 'خدمة طوارئ', 'سيارة بديلة'],
        validity: 'سنتان'
      }
    ]
    setPackages(mockPackages)

    // Mock technicians data
    const mockTechnicians: Technician[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        specialty: 'محركات تاتا',
        experience: '10 سنوات',
        rating: 4.9,
        certifications: ['شهادة تاتا المتقدمة', 'شهادة الخدمة المعتمدة', 'شهادة السلامة']
      },
      {
        id: '2',
        name: 'محمد علي',
        specialty: 'أنظمة الفرامل',
        experience: '8 سنوات',
        rating: 4.8,
        certifications: ['شهادة الفرامل المعتمدة', 'شهادة السلامة', 'شهادة الخدمة']
      },
      {
        id: '3',
        name: 'عمر خالد',
        specialty: 'الكهرباء والإلكترونيات',
        experience: '12 سنة',
        rating: 4.9,
        certifications: ['شهادة الكهرباء المتقدمة', 'شهادة التشخيص', 'شهادة السلامة']
      },
      {
        id: '4',
        name: 'إبراهيم حسن',
        specialty: 'تكييف وتبريد',
        experience: '6 سنوات',
        rating: 4.7,
        certifications: ['شهادة التكييف المعتمدة', 'شهادة السلامة', 'شهادة الخدمة']
      }
    ]
    setTechnicians(mockTechnicians)
    setLoading(false)
  }, [])

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للرئيسية
            </Link>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                مركز الصيانة والإصلاح
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                خدمة احترافية لسيارتك تاتا مع فنيين معتمدين وقطع غيار أصلية
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                الخدمات
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                الباقات
              </TabsTrigger>
              <TabsTrigger value="technicians" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                الفنيين
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                معلومات
              </TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">خدمات الصيانة والإصلاح</h2>
                <p className="text-gray-600">
                  نقدم مجموعة شاملة من خدمات الصيانة والإصلاح لسيارات تاتا
                </p>
              </div>

              {/* Popular Services */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-orange-500" />
                  الخدمات الأكثر طلباً
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.filter(s => s.popular).map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow border-orange-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <service.icon className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <CardDescription className="text-sm">{service.category}</CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-orange-500">الأكثر طلباً</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {service.duration}
                          </span>
                          <span className="font-semibold text-blue-600">{service.price}</span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">يشمل:</h4>
                          <ul className="space-y-1">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link href="/booking">
                          <Button className="w-full">
                            <Calendar className="ml-2 h-4 w-4" />
                            احجز الآن
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Services by Category */}
              <div>
                <h3 className="text-2xl font-semibold mb-4">جميع الخدمات</h3>
                <div className="space-y-8">
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <div key={category}>
                      <h4 className="text-xl font-semibold mb-4">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryServices.map((service) => (
                          <Card key={service.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <service.icon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{service.name}</CardTitle>
                                  <CardDescription className="text-xs">{service.duration}</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-blue-600">{service.price}</span>
                              </div>
                              <Link href="/booking">
                                <Button size="sm" className="w-full">
                                  احجز
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">باقات الصيانة</h2>
                <p className="text-gray-600">
                  اختر الباقة المناسبة لسيارتك ووفر على خدمات الصيانة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg, index) => (
                  <Card key={pkg.id} className={`relative hover:shadow-lg transition-shadow ${
                    index === 1 ? 'border-blue-500 ring-2 ring-blue-200' : ''
                  }`}>
                    {index === 1 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-3 py-1">
                          الأكثر مبيعاً
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-blue-600">{pkg.price}</span>
                        <div className="text-sm text-green-600">{pkg.savings}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">الخدمات المشمولة:</h4>
                        <ul className="space-y-1">
                          {pkg.services.map((service, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">يشمل أيضاً:</h4>
                        <ul className="space-y-1">
                          {pkg.includes.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-blue-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline">{pkg.validity}</Badge>
                      </div>
                      <Link href="/booking">
                        <Button className="w-full" size="lg">
                          اشترك الآن
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Package Benefits */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    مميزات الباقات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">توفير يصل إلى 30%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">قطع غيار أصلية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ضمان ممتد</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">خدمة سيارة بديلة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">تذكير بالصيانة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">أولوية في الخدمة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technicians Tab */}
            <TabsContent value="technicians" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">فريق الفنيين</h2>
                <p className="text-gray-600">
                  فريق من الفنيين المعتمدين والخبراء في صيانة سيارات تاتا
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {technicians.map((technician) => (
                  <Card key={technician.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-semibold">{technician.name}</h3>
                              <p className="text-gray-600">{technician.specialty}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{technician.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">الخبرة: {technician.experience}</p>
                          <div>
                            <h4 className="font-medium mb-2">الشهادات:</h4>
                            <div className="flex flex-wrap gap-2">
                              {technician.certifications.map((cert, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Service Quality */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    جودة الخدمة المضمونة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">فنيون معتمدون من تاتا</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">استخدام أحدث الأجهزة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">قطع غيار أصلية فقط</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">ضمان على جميع الخدمات</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">معلومات مركز الصيانة</h2>
                <p className="text-gray-600">
                  كل ما تحتاج معرفته عن خدمات الصيانة لدينا
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Working Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      ساعات العمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>السبت - الخميس</span>
                        <span className="font-medium">8:00 ص - 8:00 م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الجمعة</span>
                        <span className="font-medium">2:00 م - 8:00 م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>خدمة الطوارئ</span>
                        <span className="font-medium text-red-600">24/7</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          يفضل حجز المواعيد مسبقاً لتجنب الانتظار
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-600" />
                      معلومات الاتصال
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">خدمة العملاء</p>
                          <p className="text-gray-600">+20 2 1234 5678</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">الطوارئ</p>
                          <p className="text-gray-600">+20 2 1234 5679</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">البريد الإلكتروني</p>
                          <p className="text-gray-600">service@alhamdcars.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">العنوان</p>
                          <p className="text-gray-600">القاهرة، مصر</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Services Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    خطوات الخدمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <h4 className="font-medium mb-2">الحجز</h4>
                      <p className="text-sm text-gray-600">احجز موعدك عبر الموقع أو الهاتف</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <h4 className="font-medium mb-2">التشخيص</h4>
                      <p className="text-sm text-gray-600">فحص شامل وتشخيص دقيق</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold">3</span>
                      </div>
                      <h4 className="font-medium mb-2">الصيانة</h4>
                      <p className="text-sm text-gray-600">تنفيذ الخدمة بدقة وجودة</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold">4</span>
                      </div>
                      <h4 className="font-medium mb-2">التسليم</h4>
                      <p className="text-sm text-gray-600">تسليم السيارة مع تقرير الحالة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Services */}
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    خدمة الطوارئ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">خدمة الطوارئ 24/7</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        نقدم خدمة الطوارئ على مدار الساعة لجميع عملائنا
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">سحب السيارة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">إصلاح فوري</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">سيارة بديلة</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">للطوارئ اتصل بـ:</h4>
                      <div className="text-2xl font-bold text-red-600 mb-3">
                        +20 2 1234 5679
                      </div>
                      <p className="text-sm text-gray-600">
                        متاح على مدار الساعة طوال أيام الأسبوع
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <div className="text-center">
                <div className="flex gap-4 justify-center">
                  <Link href="/booking">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                      <Calendar className="ml-2 h-4 w-4" />
                      احجز موعد الآن
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline">
                      <Phone className="ml-2 h-4 w-4" />
                      اتصل بنا
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}