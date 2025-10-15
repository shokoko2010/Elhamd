'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/mobile-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Truck, 
  Bus, 
  Package, 
  Droplet, 
  Gauge, 
  Wrench, 
  Users, 
  ChevronDown,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Zap,
  Settings,
  Cog,
  Weight,
  Tachometer,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

// Tata Motors 车辆数据
const tataVehicles = [
  {
    id: 'prima-3328k',
    title: 'PRIMA 3328.K',
    category: 'المركبات التجارية الثقيلة',
    description: 'شاحنة Tata Motors Prima 3328.K هي شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'محرك CUMMINS ISBe 270 - ديزل مبرد بالماء، حقن مباشر، مزود بشاحن توربيني ومبرد بعدي.',
      'قوة المحرك': '266 حصان عند 2500 دورة/دقيقة',
      'عزم الدوران': '970 نيوتن.متر عند 1500 دورة/دقيقة',
      'سعة المحرك': '6700',
      'علبة التروس': 'ZF، عدد 9 أمامي + 1 خلفي',
      'الإطارات': '12R24 - 18PR',
      'الوزن الإجمالي المسموح به': '28500 كجم',
      'حمولة الصندوق': '21000 كجم',
      'سعة خزان الوقود': '260 لتر'
    },
    highlights: [
      '970 نيوتن.متر',
      '270 حصان',
      '35%',
      '260 لتر'
    ],
    features: [
      {
        title: 'منحنى عزم دوران ثابت',
        benefit: 'تقليل الحاجة لتغيير التروس',
        advantage: 'عزم ثابت عبر نطاق RPM واسع، وكفاءة عالية في استهلاك الوقود'
      },
      {
        title: 'مكونات موثوقة',
        benefit: 'تكنولوجيا عالمية',
        advantage: 'اعتمادية عالية'
      },
      {
        title: 'كابينا Prima عالمية مريحة',
        benefit: 'تقليل إجهاد السائق',
        advantage: 'عدد رحلات أكبر'
      }
    ]
  },
  {
    id: 'lp-613',
    title: 'LP 613',
    category: 'المركبات التجارية الخفيفة',
    description: 'صُممت حافلة تاتا LP 613 لتناسب تنقلات الموظفين والمدارس والرحلات داخل المدينة.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'Tata 697 TCIC E3',
      'قوة المحرك': '130 حصان عند 2400 دورة/دقيقة',
      'عزم الدوران': '430 نيوتن.متر عند 1400-1800 دورة/دقيقة',
      'سعة المحرك': '5675 سم³',
      'علبة التروس': 'Tata GBS40، يدوي',
      'الإطارات': '215/75 R17.5',
      'الوزن الإجمالي المسموح به': '7500 كجم',
      'الحمولة القصوى': '2290 كجم',
      'سعة خزان الوقود': '120 لتر'
    },
    highlights: [
      '130 حصان',
      '430 نيوتن.متر',
      '215/75 R17.5',
      '120 لتر'
    ],
    features: [
      {
        title: 'عزم دوران عالي',
        benefit: 'سهولة في التوقف والانطلاق',
        advantage: 'عزم دوران ثابت عبر نطاق واسع من دورات المحرك، مع كفاءة عالية في استهلاك الوقود'
      },
      {
        title: 'نوابض ورقية شبه بيضاوية',
        benefit: 'يقلل من الاهتزازات',
        advantage: 'يوفّر تجربة قيادة مريحة للركاب'
      }
    ]
  },
  {
    id: 'lpt-1618',
    title: 'LPT 1618',
    category: 'المركبات التجارية الخفيفة',
    description: 'تم تصميم تاتا LPT 1618 لإعادة تعريف الأداء والموثوقية، ويجسد القوة والدقة.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'CUMMINS B5.9-180 20',
      'قوة المحرك': '176.9 حصان عند 2500 دورة في الدقيقة',
      'عزم الدوران': '650 نيوتن متر عند 1500 دورة في الدقيقة',
      'سعة المحرك': '5883 cc',
      'علبة التروس': 'Tata G600-6/6.58',
      'الإطارات': '11R22.5- 16PR',
      'الوزن الإجمالي المسموح به': '16200',
      'الحمولة القصوى': '10325',
      'سعة خزان الوقود': '350'
    },
    highlights: [
      '650 نيوتن متر',
      '178 حصان قو',
      '27%',
      '350لتر'
    ],
    features: [
      {
        title: 'محرك TATA CUMMINS B5.9 سداسي الأسطوانات',
        benefit: 'انخفاض تكلفة الصيانة',
        advantage: 'عمر طويل للمحرك وأداء طاقة أعلى وقدرة دوران أفضل'
      },
      {
        title: 'فرامل S - CAM هوائية بالكامل',
        benefit: 'صيانة منخفضة وموثوقة',
        advantage: 'السلامة المعززة'
      }
    ]
  },
  {
    id: 'lpt-613',
    title: 'LPT 613',
    category: 'المركبات التجارية الخفيفة',
    description: 'تاتا LPT 613 هي مركبة تجارية قوية ومتعددة الاستخدامات مصممة لإعادة تعريف الأداء والموثوقية في مشهد النقل.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'TATA 697 TCIC',
      'قوة المحرك': '130 Ps@ 2400rpm',
      'عزم الدوران': '430 نيوتن متر @ 1350-1800 دورة في الدقيقة',
      'سعة المحرك': '5675 cc',
      'علبة التروس': 'GBS 40 synchromesh',
      'الإطارات': '7.50R16 14PR طبقة شعاعية',
      'الوزن الإجمالي المسموح به': '7500',
      'السعة القصوى': '4700',
      'سعة خزان الوقود': '90'
    },
    highlights: [
      '416 نيوتن متر',
      '130 حصان',
      '120 لتر',
      '36%'
    ],
    features: [
      {
        title: 'محرك ديزل TATA 697 TCIC',
        benefit: 'تكلفة صيانة منخفضة',
        advantage: 'عمر طويل للمحرك، أداء أقوى، وقدرة أفضل على المناورة'
      },
      {
        title: 'فرامل كاملة الهواء من نوع S-cam',
        benefit: 'صيانة منخفضة وموثوقية عالية',
        advantage: 'سلامة معززة'
      }
    ]
  },
  {
    id: 'ultra-t7',
    title: 'ULTRA T.7',
    category: 'المركبات التجارية الخفيفة',
    description: 'وجّه نجاح أعمالك مع Tata Ultra T.7 مدعومة بمحرك NG3.3L CR EIV المجرب.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'NG3.3L CR EIV',
      'قوة المحرك': '155 Ps @ 2600 rpm',
      'عزم الدوران': '450 نيوتن متر عند 2200-1500 دورة في الدقيقة',
      'سعة المحرك': '3300 سي سي',
      'علبة التروس': 'Tata G550 متزامن',
      'الإطارات': '215/75R 17.5',
      'الوزن الإجمالي المسموح به': '6450 kg',
      'الحمولة القصوى': '3480 kg',
      'سعة خزان الوقود': '90 L'
    },
    highlights: [
      '155 حصان',
      '450 نيوتن.متر',
      '215/75 R17.5',
      '90 لتر'
    ],
    features: [
      {
        title: 'محرك NG سعة 3.3 لتر',
        benefit: 'المحرك الأكثر كفاءة',
        advantage: 'نقل المدخرات بسبب انخفاض استهلاك الوقود، والسرعة الأعلى'
      },
      {
        title: 'عزم دوران عالي',
        benefit: 'أفضل عزم دوران في فئته',
        advantage: 'القدرة على سحب المزيد من الأحمال بسهولة'
      }
    ]
  },
  {
    id: 'ultra-t9',
    title: 'ULTRA T.9',
    category: 'المركبات التجارية الخفيفة',
    description: 'تخطَّ أصعب المهام مع الاعتمادية العالية لشاحنة Tata Ultra T.9، المصممة لرحلات لا تتوقف.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'NG3.3L CR EIV',
      'قوة المحرك': '155 Ps عند 2600 دورة في الدقيقة',
      'عزم الدوران': '450 نيوتن متر عند 2200-1500 دورة في الدقيقة',
      'سعة المحرك': '3300 سي سي',
      'علبة التروس': 'Tata G550 متزامن',
      'الإطارات': '215/75R 17.5',
      'الوزن الإجمالي المسموح به': '8990 kg',
      'الحمولة القصوى': '5620 kg',
      'سعة خزان الوقود': '120 L'
    },
    highlights: [
      '155 حصان',
      '450 نيوتن.متر',
      '215/75 R17.5',
      '120 لتر'
    ],
    features: [
      {
        title: 'محرك NG سعة 3.3 لتر',
        benefit: 'المحرك الأكثر كفاءة',
        advantage: 'نقل المدخرات بسبب انخفاض استهلاك الوقود'
      },
      {
        title: 'High Torque of 450Nm',
        benefit: 'أفضل عزم دوران في فئته',
        advantage: 'تغيير تروس أقل نسبيًا، وتسريع أفضل'
      }
    ]
  },
  {
    id: 'xenon-sc',
    title: 'XENON SC',
    category: 'بيك أب',
    description: 'يجمع تاتا زينون X2 SC بين القوة والمتانة، ما يوفّر أداءً معززًا ويساهم في زيادة الأرباح.',
    image: '/api/placeholder/400/300',
    specifications: {
      'موديل المحرك': 'محرك ديزل TATA 2.2L DICOR Euro IV',
      'قوة المحرك': '150 حصان عند 4000 دورة في الدقيقة',
      'عزم الدوران': '320 نيوتن متر @ 1500-3000 دورة في الدقيقة',
      'سعة المحرك': '2179',
      'علبة التروس': 'GBS -76-5/4.10',
      'الإطارات': '235/70 R16 إطارات بدون أنابيب',
      'الوزن الإجمالي المسموح به': '3100',
      'الحمولة القصوى': '1280',
      'سعة خزان الوقود': '70 لتر'
    },
    highlights: [
      '41%',
      '1280 كجم',
      '70 لتر',
      '320 نيوتن.متر'
    ],
    features: [
      {
        title: 'الطاقة والالتقاط',
        benefit: 'طاقة عالية',
        advantage: '150 حصان يساعد في السرعة العالية'
      },
      {
        title: 'محرك 2179cc',
        benefit: 'عدد الأميال',
        advantage: 'كفاءة الوقود'
      }
    ]
  }
]

const categories = [
  { id: 'all', name: 'الكل', icon: Truck },
  { id: 'المركبات التجارية الثقيلة', name: 'المركبات التجارية الثقيلة', icon: Truck },
  { id: 'المركبات التجارية الخفيفة', name: 'المركبات التجارية الخفيفة', icon: Package },
  { id: 'بيك أب', name: 'بيك أب', icon: Truck }
]

export default function TataMotorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVehicle, setSelectedVehicle] = useState(tataVehicles[0])
  const [activeTab, setActiveTab] = useState('overview')

  const filteredVehicles = selectedCategory === 'all' 
    ? tataVehicles 
    : tataVehicles.filter(vehicle => vehicle.category === selectedCategory)

  const handleContact = (type: string) => {
    toast.success(`سيتم التواصل معك عبر ${type === 'phone' ? 'الهاتف' : 'البريد الإلكتروني'} قريباً`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-orange-700 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6 text-lg">
              <Truck className="ml-2 h-5 w-5" />
              Tata Motors
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              تاتا موتورز
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-red-100 max-w-4xl mx-auto">
              القوة والاعتمادية في عالم النقل التجاري
            </p>
            <p className="text-lg md:text-xl mb-12 text-red-50 max-w-3xl mx-auto leading-relaxed">
              استعرض تشكيلتنا المتكاملة من المركبات التجارية الثقيلة والخفيفة وبيك أب، المصممة لتلبية جميع احتياجات أعمالك
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-red-600 hover:bg-red-50 text-lg font-semibold px-8 py-4"
                onClick={() => handleContact('phone')}
              >
                <Phone className="ml-2 h-5 w-5" />
                اطلب استشارة مجانية
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-red-600 text-lg font-semibold px-8 py-4"
              >
                <Mail className="ml-2 h-5 w-5" />
                احصل على كتالوج
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '7+', label: 'موديلات متاحة', icon: Truck },
              { number: '50+', label: 'سنة خبرة', icon: Shield },
              { number: '100+', label: 'وكيل معتمد', icon: Star },
              { number: '24/7', label: 'خدمة عملاء', icon: Clock }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category.id 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehicles List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <Card 
                    key={vehicle.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      selectedVehicle.id === vehicle.id ? 'ring-2 ring-red-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                        <img 
                          src={vehicle.image} 
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                          {vehicle.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {vehicle.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2">
                        {vehicle.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {vehicle.highlights.slice(0, 4).map((highlight, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-sm font-semibold text-red-600">{highlight}</div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedVehicle(vehicle)
                        }}
                      >
                        عرض التفاصيل
                        <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                      <img 
                        src={selectedVehicle.image} 
                        alt={selectedVehicle.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                        {selectedVehicle.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {selectedVehicle.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {selectedVehicle.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                        <TabsTrigger value="specs">المواصفات</TabsTrigger>
                        <TabsTrigger value="features">المميزات</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="mt-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedVehicle.highlights.map((highlight, index) => (
                              <div key={index} className="bg-red-50 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-red-600">{highlight}</div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4">
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-lg py-3">
                              <Phone className="ml-2 h-5 w-5" />
                              اطلب الآن
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="specs" className="mt-6">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {Object.entries(selectedVehicle.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium text-gray-600">{key}</span>
                              <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="features" className="mt-6">
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {selectedVehicle.features.map((feature, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <ChevronDown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-700">المنفعة:</div>
                                    <div className="text-sm text-gray-600">{feature.benefit}</div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-700">الميزة:</div>
                                    <div className="text-sm text-gray-600">{feature.advantage}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز لتعزيز أسطولك؟
          </h2>
          <p className="text-xl mb-8 text-red-100">
            تواصل معنا اليوم للحصول على استشارة مجانية وعرض سعر خاص
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-red-50 text-lg font-semibold px-8 py-4"
              onClick={() => handleContact('phone')}
            >
              <Phone className="ml-2 h-5 w-5" />
              اتصل بنا الآن
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-600 text-lg font-semibold px-8 py-4"
            >
              <Mail className="ml-2 h-5 w-5" />
              أرسل استفسار
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}