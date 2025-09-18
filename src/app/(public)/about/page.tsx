'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Award, 
  Globe, 
  Heart, 
  Target, 
  Clock, 
  Car, 
  Wrench,
  Star,
  TrendingUp,
  Shield,
  MapPin,
  Smartphone,
  Zap,
  Lightbulb,
  Package
} from 'lucide-react'

export default function AboutPage() {
  const [timeline, setTimeline] = useState<any[]>([])
  const [values, setValues] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch timeline events
        const timelineResponse = await fetch('/api/about/timeline')
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json()
          setTimeline(timelineData)
        }

        // Fetch company values
        const valuesResponse = await fetch('/api/about/values')
        if (valuesResponse.ok) {
          const valuesData = await valuesResponse.json()
          setValues(valuesData)
        }

        // Fetch company stats
        const statsResponse = await fetch('/api/about/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching about page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Car': Car,
      'Wrench': Wrench,
      'TrendingUp': TrendingUp,
      'Award': Award,
      'Globe': Globe,
      'Smartphone': Smartphone,
      'Zap': Zap,
      'Shield': Shield,
      'Heart': Heart,
      'Users': Users,
      'Target': Target,
      'Lightbulb': Lightbulb,
      'Star': Star,
      'Clock': Clock,
      'MapPin': MapPin,
      'Package': Package
    }
    return iconMap[iconName] || Car
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الصفحة...</p>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">من نحن</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              تعرف على قصة شركة الحمد للسيارات، رحلتنا نحو التميز، والتزامنا بتقديم أفضل الخدمات لعملائنا في مصر
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Company Story */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">قصتنا</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  تأسست شركة الحمد للسيارات في عام 1999 كأحد الوكلاء الرائدين لسيارات تاتا في مصر. 
                  بدأنا رحلتنا بشغف كبير لتقديم سيارات عالية الجودة وأسعار تنافسية للسوق المصري.
                </p>
                <p className="leading-relaxed">
                  ومنذ اليوم الأول، ونحن نلتزم بقيم النزاهة والجودة والخدمة المتميزة. 
                  عملنا بجد واجتهاد لبناء سمعة قوية في السوق، وكسب ثقة آلاف العملاء الراضين.
                </p>
                <p className="leading-relaxed">
                  اليوم، وبعد أكثر من ربع قرن من الخبرة، نحن فخورون بكوننا أحد أكبر وأهم وكلاء تاتا في مصر، 
                  مع شبكة واسعة من المعارض ومراكز الخدمة تغطي جميع أنحاء الجمهورية.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/uploads/showroom-luxury.jpg" 
                  alt="معرض الحمد للسيارات" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-3xl font-bold">1999</div>
                <div className="text-sm">تأسست الشركة</div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  رؤيتنا
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  أن نكون الخيار الأول والأفضل لكل من يبحث عن سيارة عالية الجودة بأسعار تنافسية في مصر، 
                  من خلال تقديم تجربة شراء استثنائية وخدمة ما بعد بيع لا مثيل لها.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-blue-600" />
                  مهمتنا
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  تقديم أفضل منتجات وخدمات تاتا للعملاء المصريين، مع ضمان أعلى مستويات الجودة 
                  والخدمة، والمساهمة في تطوير صناعة السيارات في مصر من خلال الابتكار والاستدامة.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">رحلتنا الزمنية</h2>
            <p className="text-gray-600">أهم المحطات في تاريخ شركة الحمد للسيارات</p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>
            
            <div className="space-y-12">
              {timeline.map((item, index) => {
                const IconComponent = getIconComponent(item.icon)
                return (
                  <div key={index} className={`relative flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}>
                    <div className="w-1/2 pr-8">
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                            <Badge variant="outline">{item.year}</Badge>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                    
                    <div className="w-1/2 pl-8"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">أرقام تتحدث عنا</h2>
              <p className="text-blue-100">إنجازاتنا على مدار سنوات الخبرة</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = getIconComponent(stat.icon)
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <IconComponent className="h-12 w-12 text-blue-200" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="text-blue-100">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">قيمنا</h2>
            <p className="text-gray-600">المبادئ التي توجه أعمالنا وتصرفاتنا</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = getIconComponent(value.icon)
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <IconComponent className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">انضم إلى عائلة الحمد للسيارات</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              اكتشف لماذا نحن الخيار المفضل لآلاف العملاء في مصر. زر أحد معارضنا أو تواصل معنا اليوم للحصول على استشارة مجانية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/vehicles" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                استعرض السيارات
              </a>
              <a 
                href="/contact" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                تواصل معنا
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}