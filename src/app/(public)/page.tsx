import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Car, Phone, Mail, MapPin, Calendar, Wrench, Star, Award } from 'lucide-react'
import Image from 'next/image'

// Static data to avoid API calls during build
const staticCompanyInfo = {
  title: "الحمد للسيارات",
  subtitle: "وكيل تاتا المعتمد في مصر",
  description: "نقدم أحدث سيارات تاتا بأسعار ممتازة وخدمات ما بعد البيع المتكاملة",
  features: [
    "وكيل معتمد رسمياً",
    "أفضل الأسعار في السوق",
    "خدمة ما بعد البيع متميزة",
    "ضمان مصنعي شامل"
  ],
  ctaButtons: [
    { text: "استعرض السيارات", link: "/vehicles", variant: "primary" },
    { text: "قيادة تجريبية", link: "/test-drive", variant: "outline" }
  ],
  imageUrl: "/uploads/showroom-luxury.jpg"
}

const staticStats = [
  { number: "25+", label: "سنة خبرة" },
  { number: "10000+", label: "عميل راضٍ" },
  { number: "15+", label: "فرع في مصر" },
  { number: "24/7", label: "خدمة عملاء" }
]

const staticServices = [
  {
    title: "بيع سيارات جديدة",
    description: "أحدث موديلات تاتا بأسعار ممتازة"
  },
  {
    title: "خدمة الصيانة",
    description: "صيانة معتمدة باستقطع أصلية"
  },
  {
    title: "قطع غيار",
    description: "توفير جميع قطع الغيار الأصلية"
  },
  {
    title: "تمويل سيارات",
    description: "خطط تمويلية ميسرة وبأسعار تنافسية"
  },
  {
    title: "تأمين شامل",
    description: "تأمين على السيارات بشركات موثوقة"
  },
  {
    title: "تبديل لوحات",
    description: "خدمات نقل الملكية والترخيص"
  }
]

const staticContactInfo = {
  phone: "+20 123 456 7890",
  email: "info@alhamd-cars.com",
  address: "القاهرة، مصر - شارع التحرير"
}

const staticFeaturedVehicles = [
  {
    id: "1",
    make: "تاتا",
    model: "نيكسون",
    year: 2024,
    price: 550000,
    category: "SUV",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    images: [{ imageUrl: "/uploads/vehicles/tata-nexon-1.jpg", isPrimary: true }]
  },
  {
    id: "2", 
    make: "تاتا",
    model: "بانش",
    year: 2024,
    price: 380000,
    category: "هاجباك",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    images: [{ imageUrl: "/uploads/vehicles/tata-punch-1.jpg", isPrimary: true }]
  },
  {
    id: "3",
    make: "تاتا", 
    model: "تياجو",
    year: 2024,
    price: 320000,
    category: "سيدان",
    fuelType: "بنزين",
    transmission: "أوتوماتيك",
    images: [{ imageUrl: "/uploads/vehicles/tata-tiago-1.jpg", isPrimary: true }]
  }
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  }).format(price)
}

function VehicleCard({ vehicle }: { vehicle: typeof staticFeaturedVehicles[0] }) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden">
          <Image
            src={vehicle.images[0]?.imageUrl || "/placeholder-car.jpg"}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
          مميزة
        </Badge>
      </div>
      <CardHeader className="text-right pb-3">
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {vehicle.make} {vehicle.model}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {vehicle.year} • {vehicle.category} • {vehicle.fuelType}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(vehicle.price)}
          </div>
          <div className="text-sm text-gray-500">
            {vehicle.transmission}
          </div>
        </div>
        <Link href={`/vehicles/${vehicle.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            عرض التفاصيل
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            <div className="text-right">
              <div className="mb-6">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  <Award className="ml-2 h-4 w-4" />
                  وكيل معتمد
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {staticCompanyInfo.title}
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-blue-100 font-semibold">
                {staticCompanyInfo.subtitle}
              </p>
              <p className="text-lg md:text-xl mb-8 text-blue-50 leading-relaxed">
                {staticCompanyInfo.description}
              </p>
              <div className="space-y-4 mb-10">
                {staticCompanyInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-3 h-3 bg-white rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                    <span className="text-blue-50 text-lg group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {staticCompanyInfo.ctaButtons.map((button, index) => (
                  <Link key={index} href={button.link} className="flex-1 sm:flex-none">
                    <Button
                      variant={button.variant === 'primary' ? 'default' : 'outline'}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 border-blue-600 flex items-center justify-center"
                    >
                      {button.text === 'استعرض السيارات' && <Car className="ml-3 h-6 w-6" />}
                      {button.text === 'قيادة تجريبية' && <Calendar className="ml-3 h-6 w-6" />}
                      {button.text}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/20">
                <Image
                  src={staticCompanyInfo.imageUrl}
                  alt="معرض الحمد للسيارات"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl border border-blue-100">
                <div className="text-3xl font-bold mb-1">
                  {staticStats[0].number}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  {staticStats[0].label}
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <div className="h-8 md:h-12 bg-gradient-to-b from-blue-800 to-gray-50"></div>

      {/* Featured Vehicles */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full opacity-30 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <Star className="ml-2 h-4 w-4" />
              مميزة
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              السيارات المميزة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              استعرض أحدث سيارات تاتا المميزة بعروض حصرية وأسعار ممتازة
            </p>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {staticFeaturedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/vehicles">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300 px-8 py-4 text-lg font-semibold"
              >
                استعرض جميع السيارات
                <Car className="mr-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              <Wrench className="ml-2 h-4 w-4" />
              خدماتنا
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              خدماتنا المتكاملة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              نقدم مجموعة شاملة من الخدمات لضمان رحلة شراء سيارة ممتعة وخالية من المتاعب
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {staticServices.map((service, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Wrench className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Phone className="ml-2 h-4 w-4" />
              تواصل معنا
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              نحن هنا لمساعدتك
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              لا تتردد في التواصل معنا لأي استفسار أو لتحديد موعد زيارة للمعرض
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
              <CardContent className="p-8 text-center">
                <Phone className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-xl font-bold mb-2">الهاتف</h3>
                <p className="text-blue-100">{staticContactInfo.phone}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
                <p className="text-blue-100">{staticContactInfo.email}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="text-xl font-bold mb-2">العنوان</h3>
                <p className="text-blue-100">{staticContactInfo.address}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white hover:bg-blue-50 text-blue-600 border-white hover:border-blue-100 px-8 py-4 text-lg font-semibold"
              >
                تواصل معنا الآن
                <Phone className="mr-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}