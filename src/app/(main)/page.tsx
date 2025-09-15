'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Car, Phone, Mail, MapPin, Calendar, Wrench, Star, ArrowLeft, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import Link from 'next/link'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
  fuelType: string
  transmission: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface SliderItem {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  badge?: string
  badgeColor?: string
}

export default function Home() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const sliderItems: SliderItem[] = [
    {
      id: '1',
      title: 'تاتا نيكسون 2024',
      subtitle: 'سيارة SUV عائلية متطورة',
      description: 'تجربة القيادة المثالية مع أحدث تقنيات السلامة والراحة',
      imageUrl: '/api/placeholder/1200/600',
      ctaText: 'اكتشف المزيد',
      ctaLink: '/vehicles',
      badge: 'جديد',
      badgeColor: 'bg-green-500'
    },
    {
      id: '2',
      title: 'عرض خاص على تاتا بانش',
      subtitle: 'خصم 15% على جميع الفئات',
      description: 'فرصة محدودة للحصول على سيارتك المفضلة بأفضل سعر',
      imageUrl: '/api/placeholder/1200/600',
      ctaText: 'اطلب العرض الآن',
      ctaLink: '/vehicles',
      badge: 'عرض خاص',
      badgeColor: 'bg-red-500'
    },
    {
      id: '3',
      title: 'تاتا تياجو إلكتريك',
      subtitle: 'مستقبل التنقل المستدام',
      description: 'انضم إلى ثورة السيارات الكهربائية مع تاتا تياجو إلكتريك',
      imageUrl: '/api/placeholder/1200/600',
      ctaText: 'جرب القيادة',
      ctaLink: '/test-drive',
      badge: 'إلكتريك',
      badgeColor: 'bg-blue-500'
    },
    {
      id: '4',
      title: 'خدمة الصيانة الاحترافية',
      subtitle: 'اهتم بمركبتك مع خبراء تاتا',
      description: 'خدمة صيانة شاملة بأسعار تنافسية وضمان أصلي',
      imageUrl: '/api/placeholder/1200/600',
      ctaText: 'احجز موعد الصيانة',
      ctaLink: '/maintenance',
      badge: 'خدمة',
      badgeColor: 'bg-orange-500'
    }
  ]

  useEffect(() => {
    // Mock data for now - will be replaced with API call
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Tata',
        model: 'Nexon',
        year: 2024,
        price: 850000,
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true }]
      },
      {
        id: '2',
        make: 'Tata',
        model: 'Punch',
        year: 2024,
        price: 650000,
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true }]
      },
      {
        id: '3',
        make: 'Tata',
        model: 'Tiago',
        year: 2024,
        price: 550000,
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        images: [{ imageUrl: '/api/placeholder/400/300', isPrimary: true }]
      }
    ]
    setFeaturedVehicles(mockVehicles)
    setLoading(false)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderItems.length)
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlay, sliderItems.length])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen">
      {/* Professional Slider Section */}
      <section className="relative">
        <Carousel
          opts={{
            loop: true,
            align: "start",
          }}
          className="w-full"
          setApi={(api) => {
            if (api) {
              api.on("select", () => {
                setCurrentSlide(api.selectedScrollSnap())
              })
            }
          }}
        >
          <CarouselContent>
            {sliderItems.map((item) => (
              <CarouselItem key={item.id} className="relative">
                <div className="relative h-[600px] md:h-[700px] overflow-hidden">
                  {/* Background Image with Overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-in-out hover:scale-105"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-3xl text-right">
                        {/* Badge */}
                        {item.badge && (
                          <Badge className={`${item.badgeColor} text-white mb-4 text-sm px-3 py-1`}>
                            {item.badge}
                          </Badge>
                        )}
                        
                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                          {item.title}
                        </h1>
                        
                        {/* Subtitle */}
                        <h2 className="text-xl md:text-2xl lg:text-3xl text-blue-200 mb-6 font-light">
                          {item.subtitle}
                        </h2>
                        
                        {/* Description */}
                        <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl ml-auto">
                          {item.description}
                        </p>
                        
                        {/* CTA Button */}
                        <Link href={item.ctaLink}>
                          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                            {item.ctaText}
                            <ChevronLeft className="mr-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Controls */}
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30 w-12 h-12 rounded-full" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30 w-12 h-12 rounded-full" />
          
          {/* Custom Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex space-x-2">
              {sliderItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Auto-play Toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
          >
            {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </Carousel>
      </section>

      {/* Company Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-right">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                  مرحباً بك في<br />
                  <span className="text-blue-600">الحمد للسيارات</span>
                </h1>
                <p className="text-xl md:text-2xl mb-6 text-blue-600 font-semibold">
                  الوكيل الرسمي المعتمد لسيارات تاتا في مصر
                </p>
                <p className="text-lg mb-8 text-gray-700 leading-relaxed">
                  نحن فخورون بتمثيل علامة تاتا التجارية في مصر، حيث نقدم لكم أحدث الموديلات 
                  مع ضمان الجودة الأصلي وخدمة ما بعد البيع المتميزة. اكتشف السيارة المثالية لأسلوب حياتك 
                  مع تشكيلتنا الواسعة من سيارات تاتا، والخدمة الاستثنائية، وخيارات التمويل التنافسية.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">أحدث موديلات تاتا 2024</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">ضمان المصنع لمدة 3 سنوات</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">خدمة صيانة على مدار الساعة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">تمويل سيارات بأفضل الأسعار</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/vehicles">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Car className="ml-2 h-5 w-5" />
                      استعرض السيارات
                    </Button>
                  </Link>
                  <Link href="/test-drive">
                    <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                      <Calendar className="ml-2 h-5 w-5" />
                      قيادة تجريبية
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://source.unsplash.com/800x600/?tata,showroom,luxury" 
                    alt="معرض الحمد للسيارات" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-4 rounded-lg shadow-lg">
                  <div className="text-2xl font-bold">25+</div>
                  <div className="text-sm">سنة خبرة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">السيارات المميزة</h2>
            <p className="text-lg text-gray-600 mb-2">
              استكشف أحدث وأشهر موديلات تاتا لعام 2024
            </p>
            <p className="text-sm text-gray-500">
              جميع السيارات جديدة مع ضمان المصنع الكامل
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={vehicle.images[0]?.imageUrl || '/api/placeholder/400/300'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 left-2 bg-orange-500">
                      مميزة
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-gray-600">{vehicle.year}</p>
                      </div>
                      <Badge variant="outline">{vehicle.category}</Badge>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Badge variant="secondary">{vehicle.fuelType}</Badge>
                      <Badge variant="secondary">{vehicle.transmission}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-900">
                        {formatPrice(vehicle.price)}
                      </span>
                      <Link href={`/vehicles/${vehicle.id}`}>
                        <Button size="sm">التفاصيل</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/vehicles">
              <Button size="lg" variant="outline">
                عرض جميع السيارات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا المتميزة</h2>
            <p className="text-lg text-gray-600 mb-2">
              حلول سيارات شاملة تلبي جميع احتياجاتك
            </p>
            <p className="text-sm text-gray-500">
              نقدم لكم أفضل الخدمات بمعايير عالمية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <Link href="/vehicles">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>سيارات جديدة</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    أحدث موديلات تاتا 2024 مع أحدث التقنيات والمميزات المتطورة وضمان المصنع الكامل
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <Link href="/test-drive">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>قيادة تجريبية</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    احجز قيادة تجريبية مجانية لسيارتك المفضلة واختبر الأداء بنفسك مع فنيينا المتخصصين
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <Link href="/maintenance">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle>الصيانة والإصلاح</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    خدمات صيانة وإصلاح احترافية من قبل فنيين معتمدين من تاتا باستخدام قطع غيار أصلية
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <Link href="/financing">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>تمويل سيارات</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    حلول تمويلية ميسرة بشروط مرنة وأقساط تناسب جميع الميزانيات بفوائد تنافسية
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
              <Link href="/contact">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle>تواصل معنا</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    تواصل مع فريق الخبراء لدينا للحصول على استشارة مجانية ومساعدة في اختيار سيارتك
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختار الحمد للسيارات؟</h2>
            <p className="text-lg text-gray-600 mb-2">
              نحن نقدم لك أفضل تجربة لشراء وامتلاك السيارات
            </p>
            <p className="text-sm text-gray-500">
              أكثر من 25 عاماً من الخبرة في سوق السيارات المصري
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Car className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">تشكيلة واسعة</h3>
              <p className="text-gray-600 mb-3">
                أحدث موديلات تاتا 2024 بمواصفات عالمية وأسعار تنافسية
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <span>نيكسون • بانش • تياجو</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <span>تيغور • ألتروز • هارير</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Wrench className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">خدمة مميزة</h3>
              <p className="text-gray-600 mb-3">
                فريق محترف من الفنيين المعتمدين وخدمة عملاء على مدار الساعة
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  <span>صيانة معتمدة</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  <span>قطع غيار أصلية</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">تمويل سهل</h3>
              <p className="text-gray-600 mb-3">
                خيارات تمويل مرنة وبنود سداد مريحة تناسب جميع الميزانيات
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>فوائد تنافسية</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>موافقات سريعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Company Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">من نحن</h2>
              <p className="text-lg text-gray-600 mb-2">
                الحمد للسيارات - شريككم الموثوق في عالم السيارات
              </p>
              <p className="text-sm text-gray-500">
                أكثر من ربع قرن من الخبرة والتميز
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">قصتنا</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    تأسست الحمد للسيارات في عام 1999 كأحد الوكلاء الرائدين لسيارات تاتا في مصر. 
                    ومنذ ذلك الحين، ونحن نلتزم بتقديم أفضل المنتجات والخدمات لعملائنا الكرام.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    اليوم، نحن فخورون بكوننا أحد أكبر وأهم وكلاء تاتا في مصر، مع شبكة واسعة من المعارض 
                    ومراكز الخدمة تغطي جميع أنحاء الجمهورية.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">رؤيتنا</h3>
                  <p className="text-gray-700 leading-relaxed">
                    أن نكون الخيار الأول والأفضل لكل من يبحث عن سيارة عالية الجودة بأسعار تنافسية في مصر، 
                    من خلال تقديم تجربة شراء فريدة وخدمة ما بعد بيع لا مثيل لها.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">رسالتنا</h3>
                  <p className="text-gray-700 leading-relaxed">
                    تقديم سيارات تاتا عالية الجودة مع ضمان الجودة الأصلي، وخدمة عملاء استثنائية، 
                    وأسعار تنافسية تجعلنا الخيار الأمثل للعملاء في جميع أنحاء مصر.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">إنجازاتنا</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">25+</div>
                      <div className="text-sm text-gray-600">سنة خبرة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">50K+</div>
                      <div className="text-sm text-gray-600">سيارة مباعة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">15+</div>
                      <div className="text-sm text-gray-600">معرض وخدمة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">100K+</div>
                      <div className="text-sm text-gray-600">عميل راضٍ</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-orange-600 mb-4">قيمنا</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold">الجودة</div>
                        <div className="text-sm text-gray-600">نلتزم بأعلى معايير الجودة في كل ما نقدمه</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold">الثقة</div>
                        <div className="text-sm text-gray-600">نبني علاقات طويلة الأمد مبنية على الثقة والشفافية</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold">الابتكار</div>
                        <div className="text-sm text-gray-600">نسعى دائماً لتقديم أحدث التقنيات والحلول</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-semibold">الخدمة</div>
                        <div className="text-sm text-gray-600">نضع العميل في مركز كل ما نقوم به</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link href="/about">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                      تعرف المزيد عن الشركة
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            جاهز لتجربة سيارة تاتا؟
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            زرنا اليوم واكتشف بنفسك تميز سيارات تاتا
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/test-drive">
              <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
                <Calendar className="ml-2 h-5 w-5" />
                قيادة تجريبية
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                <Phone className="ml-2 h-5 w-5" />
                اتصل بنا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-lg text-blue-100 mb-2">
              نحن هنا لمساعدتك على مدار الساعة
            </p>
            <p className="text-sm text-blue-200">
              لا تتردد في الاتصال بنا لأي استفسار أو مساعدة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">اتصل بنا</h3>
              <p className="text-blue-100 mb-1">+20 2 1234 5678</p>
              <p className="text-sm text-blue-200">خدمة عملاء 24/7</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">البريد الإلكتروني</h3>
              <p className="text-blue-100 mb-1">info@alhamdcars.com</p>
              <p className="text-sm text-blue-200">رد خلال 24 ساعة</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">الفروع</h3>
              <p className="text-blue-100 mb-1">القاهرة، مصر</p>
              <p className="text-sm text-blue-200">15 فرع في جميع المحافظات</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                <Mail className="ml-2 h-5 w-5" />
                إرسال رسالة
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}