'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Map, 
  Search, 
  Home, 
  Car, 
  Wrench, 
  Phone, 
  FileText,
  Users,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Calendar,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface SitePage {
  id: string
  title: string
  description: string
  url: string
  category: string
  icon: string
}

export default function SiteMapPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')

  const pages: SitePage[] = [
    {
      id: '1',
      title: 'الرئيسية',
      description: 'صفحة البداية مع عرض أحدث السيارات والعروض',
      url: '/',
      category: 'أساسي',
      icon: 'Home'
    },
    {
      id: '2',
      title: 'السيارات',
      description: 'استعرض جميع السيارات المتوفرة مع تفاصيل كاملة',
      url: '/vehicles',
      category: 'أساسي',
      icon: 'Car'
    },
    {
      id: '3',
      title: 'من نحن',
      description: 'تعرف على تاريخ شركة الهامد وقيمها',
      url: '/about',
      category: 'أساسي',
      icon: 'Users'
    },
    {
      id: '4',
      title: 'اتصل بنا',
      description: 'طرق التواصل معنا ومعلومات الاتصال',
      url: '/contact',
      category: 'أساسي',
      icon: 'Phone'
    },
    {
      id: '5',
      title: 'الخدمات',
      description: 'جميع خدمات الصيانة والإصلاح المتوفرة',
      url: '/services',
      category: 'خدمات',
      icon: 'Wrench'
    },
    {
      id: '6',
      title: 'حجز خدمة',
      description: 'احجز موعد لصيانة سيارتك',
      url: '/service-booking',
      category: 'خدمات',
      icon: 'Calendar'
    },
    {
      id: '7',
      title: 'تجربة قيادة',
      description: 'احجز تجربة قيادة للسيارة التي تريدها',
      url: '/test-drive',
      category: 'خدمات',
      icon: 'Car'
    },
    {
      id: '8',
      title: 'التمويل',
      description: 'خيارات التمويل والتقسيط للسيارات',
      url: '/financing',
      category: 'خدمات',
      icon: 'CreditCard'
    },
    {
      id: '9',
      title: 'الأسئلة الشائعة',
      description: 'إجابات على أكثر الأسئلة شيوعاً',
      url: '/الأسئلة-الشائعة',
      category: 'مساعدة',
      icon: 'HelpCircle'
    },
    {
      id: '10',
      title: 'الدعم الفني',
      description: 'الدعم الفني والمساعدة التقنية',
      url: '/الدعم-الفني',
      category: 'مساعدة',
      icon: 'Wrench'
    },
    {
      id: '11',
      title: 'قطع الغيار',
      description: 'قطع الغيار الأصلية والبدائل',
      url: '/قطع-الغيار',
      category: 'منتجات',
      icon: 'Settings'
    },
    {
      id: '12',
      title: 'الضمان',
      description: 'معلومات الضمان والكفالة',
      url: '/الضمان',
      category: 'خدمات',
      icon: 'Shield'
    },
    {
      id: '13',
      title: 'سياسة الخصوصية',
      description: 'سياسة الخصوصية وحماية البيانات',
      url: '/سياسة-الخصوصية',
      category: 'قانوني',
      icon: 'FileText'
    },
    {
      id: '14',
      title: 'الشروط والأحكام',
      description: 'الشروط والأحكام لاستخدام الموقع',
      url: '/الشروط-والأحكام',
      category: 'قانوني',
      icon: 'FileText'
    },
    {
      id: '15',
      title: 'البحث',
      description: 'ابحث عن السيارات والخدمات',
      url: '/search',
      category: 'أدوات',
      icon: 'Search'
    },
    {
      id: '16',
      title: 'تتبع الطلب',
      description: 'تتبع حالة طلبك أو حجزك',
      url: '/order-tracking',
      category: 'خدمات',
      icon: 'Map'
    }
  ]

  const categories = ['الكل', 'أساسي', 'خدمات', 'مساعدة', 'منتجات', 'قانوني', 'أدوات']

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Home': Home,
      'Car': Car,
      'Wrench': Wrench,
      'Phone': Phone,
      'FileText': FileText,
      'Users': Users,
      'Shield': Shield,
      'CreditCard': CreditCard,
      'HelpCircle': HelpCircle,
      'Calendar': Calendar,
      'Search': Search,
      'Map': Map,
      'Settings': Settings
    }
    return iconMap[iconName] || FileText
  }

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'الكل' || page.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedPages = categories.slice(1).reduce((acc, category) => {
    const categoryPages = filteredPages.filter(page => page.category === category)
    if (categoryPages.length > 0) {
      acc[category] = categoryPages
    }
    return acc
  }, {} as Record<string, SitePage[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">خريطة الموقع</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              اكتشف جميع صفحات وأقسام موقع الهامد للسيارات
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="ابحث في صفحات الموقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {pages.length}
              </div>
              <div className="text-sm text-gray-600">إجمالي الصفحات</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {pages.filter(p => p.category === 'أساسي').length}
              </div>
              <div className="text-sm text-gray-600">صفحات أساسية</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {pages.filter(p => p.category === 'خدمات').length}
              </div>
              <div className="text-sm text-gray-600">خدمات</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {categories.length - 1}
              </div>
              <div className="text-sm text-gray-600">فئات</div>
            </CardContent>
          </Card>
        </div>

        {/* Pages by Category */}
        {selectedCategory === 'الكل' ? (
          <div className="space-y-8">
            {Object.entries(groupedPages).map(([category, categoryPages]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {category}
                  </Badge>
                  <span className="text-gray-500 text-lg">
                    ({categoryPages.length} صفحة)
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPages.map((page) => {
                    const IconComponent = getIconComponent(page.icon)
                    return (
                      <Card key={page.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{page.title}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {page.description}
                          </p>
                          <Link href={page.url}>
                            <Button variant="outline" size="sm" className="w-full">
                              زيارة الصفحة
                              <ChevronLeft className="mr-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => {
              const IconComponent = getIconComponent(page.icon)
              return (
                <Card key={page.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {page.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {page.description}
                    </p>
                    <Link href={page.url}>
                      <Button variant="outline" size="sm" className="w-full">
                        زيارة الصفحة
                        <ChevronLeft className="mr-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب تغيير كلمات البحث أو اختيار فئة مختلفة</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">روابط سريعة</h2>
          <p className="text-xl mb-8 text-blue-100">
            وصول سريع لأهم الصفحات في الموقع
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/">
              <Button variant="secondary" className="w-full">
                <Home className="ml-2 h-4 w-4" />
                الرئيسية
              </Button>
            </Link>
            <Link href="/vehicles">
              <Button variant="secondary" className="w-full">
                <Car className="ml-2 h-4 w-4" />
                السيارات
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="w-full">
                <Phone className="ml-2 h-4 w-4" />
                اتصل بنا
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" className="w-full">
                <Wrench className="ml-2 h-4 w-4" />
                الخدمات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}