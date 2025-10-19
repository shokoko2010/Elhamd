'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Search, Filter, Star, Fuel, Settings, Calendar, Phone, Mail, MapPin, CheckCircle, ArrowRight, Engine, Gauge, Package } from 'lucide-react'
import Link from 'next/link'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'

interface TataVehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  description: string
  category: string
  fuelType: string
  transmission: string
  status: string
  featured: boolean
  images: { imageUrl: string; altText?: string; isPrimary: boolean }[]
  specifications: { key: string; label: string; value: string; category: string }[]
  pricing: { basePrice: number; totalPrice: number; currency: string }
}

const categoryLabels: Record<string, string> = {
  'HEAVY_COMMERCIAL': 'شاحنات ثقيلة',
  'LIGHT_COMMERCIAL': 'شاحنات خفيفة',
  'PICKUP': 'بيك أب'
}

const fuelTypeLabels: Record<string, string> = {
  'DIESEL': 'ديزل',
  'PETROL': 'بنزين',
  'ELECTRIC': 'كهربائي',
  'HYBRID': 'هايبرد'
}

const transmissionLabels: Record<string, string> = {
  'MANUAL': 'يدوي',
  'AUTOMATIC': 'أوتوماتيك',
  'CVT': 'CVT'
}

export default function TataCommercialVehiclesPage() {
  const [vehicles, setVehicles] = useState<TataVehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<TataVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterAndSortVehicles()
  }, [vehicles, searchTerm, selectedCategory, selectedFuelType, sortBy])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?make=Tata Motors')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVehicles = () => {
    let filtered = vehicles

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.category === selectedCategory)
    }

    // Filter by fuel type
    if (selectedFuelType !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.fuelType === selectedFuelType)
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.model.localeCompare(b.model))
        break
    }

    setFilteredVehicles(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getSpecificationValue = (vehicle: TataVehicle, key: string) => {
    const spec = vehicle.specifications.find(s => s.key === key)
    return spec?.value || ''
  }

  const getHighlightValue = (vehicle: TataVehicle, label: string) => {
    const spec = vehicle.specifications.find(s => s.key === `highlight_${label}`)
    return spec?.value || ''
  }

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gradient-to-b from-gray-50 to-white py-12\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <LoadingIndicator title=\"جاري تحميل سيارات تاتا التجارية...\" />
        </div>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-b from-gray-50 to-white\">
      {/* Header Section */}
      <section className=\"bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"text-center\">
            <Badge className=\"bg-white/20 text-white border-white/30 mb-4\">
              <Truck className=\"ml-2 h-4 w-4\" />
              Tata Motors Commercial
            </Badge>
            <h1 className=\"text-4xl md:text-5xl font-bold mb-6\">
              سيارات تاتا التجارية
            </h1>
            <p className=\"text-xl text-blue-100 max-w-3xl mx-auto\">
              استعرض مجموعة سيارات تاتا التجارية المتميزة - الشاحنات الثقيلة والخفيفة وبيك أب
              المصممة لتلبية جميع احتياجات أعمالك
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className=\"py-8 bg-white border-b\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
            <div className=\"relative\">
              <Search className=\"absolute right-3 top-3 h-4 w-4 text-gray-400\" />
              <Input
                placeholder=\"ابحث عن سيارة...\"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className=\"pr-10\"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder=\"الفئة\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">جميع الفئات</SelectItem>
                <SelectItem value=\"HEAVY_COMMERCIAL\">شاحنات ثقيلة</SelectItem>
                <SelectItem value=\"LIGHT_COMMERCIAL\">شاحنات خفيفة</SelectItem>
                <SelectItem value=\"PICKUP\">بيك أب</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
              <SelectTrigger>
                <SelectValue placeholder=\"نوع الوقود\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"all\">جميع أنواع الوقود</SelectItem>
                <SelectItem value=\"DIESEL\">ديزل</SelectItem>
                <SelectItem value=\"PETROL\">بنزين</SelectItem>
                <SelectItem value=\"HYBRID\">هايبرد</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder=\"ترتيب حسب\" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=\"featured\">المميزة أولاً</SelectItem>
                <SelectItem value=\"price-low\">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value=\"price-high\">السعر: من الأعلى للأقل</SelectItem>
                <SelectItem value=\"name\">الاسم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className=\"py-12\">
        <div className=\"max-w-7xl mx-auto px-4\">
          {filteredVehicles.length === 0 ? (
            <div className=\"text-center py-12\">
              <Truck className=\"mx-auto h-16 w-16 text-gray-400 mb-4\" />
              <h3 className=\"text-xl font-semibold text-gray-900 mb-2\">
                لم يتم العثور على سيارات
              </h3>
              <p className=\"text-gray-600\">
                جرب تغيير معايير البحث أو التصفية
              </p>
            </div>
          ) : (
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className=\"group hover:shadow-xl transition-all duration-300 overflow-hidden\">
                  {/* Vehicle Image */}
                  <div className=\"relative h-48 overflow-hidden\">
                    <OptimizedImage
                      src={vehicle.images.find(img => img.isPrimary)?.imageUrl || '/placeholder-car.jpg'}
                      alt={vehicle.model}
                      fill
                      className=\"object-cover group-hover:scale-105 transition-transform duration-300\"
                    />
                    {vehicle.featured && (
                      <Badge className=\"absolute top-4 right-4 bg-yellow-500 text-white\">
                        <Star className=\"ml-1 h-3 w-3\" />
                        مميزة
                      </Badge>
                    )}
                    <Badge className=\"absolute top-4 left-4 bg-blue-600 text-white\">
                      {categoryLabels[vehicle.category] || vehicle.category}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className=\"flex justify-between items-start\">
                      <div>
                        <CardTitle className=\"text-xl mb-2\">{vehicle.model}</CardTitle>
                        <CardDescription className=\"text-sm text-gray-600 line-clamp-2\">
                          {vehicle.description}
                        </CardDescription>
                      </div>
                      <div className=\"text-left\">
                        <div className=\"text-2xl font-bold text-blue-600\">
                          {formatPrice(vehicle.price)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Key Specifications */}
                    <div className=\"grid grid-cols-2 gap-4 mb-4\">
                      <div className=\"flex items-center gap-2 text-sm text-gray-600\">
                        <Engine className=\"h-4 w-4 text-blue-500\" />
                        <span>{getHighlightValue(vehicle, 'قوة المحرك') || 'N/A'}</span>
                      </div>
                      <div className=\"flex items-center gap-2 text-sm text-gray-600\">
                        <Gauge className=\"h-4 w-4 text-green-500\" />
                        <span>{getHighlightValue(vehicle, 'عزم الدوران') || 'N/A'}</span>
                      </div>
                      <div className=\"flex items-center gap-2 text-sm text-gray-600\">
                        <Fuel className=\"h-4 w-4 text-orange-500\" />
                        <span>{fuelTypeLabels[vehicle.fuelType] || vehicle.fuelType}</span>
                      </div>
                      <div className=\"flex items-center gap-2 text-sm text-gray-600\">
                        <Settings className=\"h-4 w-4 text-purple-500\" />
                        <span>{transmissionLabels[vehicle.transmission] || vehicle.transmission}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className=\"mb-4\">
                      <h4 className=\"font-semibold mb-2 text-sm\">المميزات الرئيسية:</h4>
                      <div className=\"space-y-1\">
                        {vehicle.specifications
                          .filter(spec => spec.key.startsWith('feature_'))
                          .slice(0, 2)
                          .map((spec, index) => (
                            <div key={index} className=\"flex items-start gap-2 text-xs text-gray-600\">
                              <CheckCircle className=\"h-3 w-3 text-green-500 mt-0.5 flex-shrink-0\" />
                              <span className=\"line-clamp-1\">{spec.value}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className=\"flex gap-2\">
                      <Link href={`/vehicles/${vehicle.id}`} className=\"flex-1\">
                        <Button className=\"w-full bg-blue-600 hover:bg-blue-700 text-white\">
                          <ArrowRight className=\"ml-2 h-4 w-4\" />
                          التفاصيل
                        </Button>
                      </Link>
                      <Link href={`/test-drive?vehicle=${vehicle.id}`} className=\"flex-1\">
                        <Button variant=\"outline\" className=\"w-full\">
                          <Calendar className=\"ml-2 h-4 w-4\" />
                          قيادة تجريبية
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className=\"bg-gray-50 py-16\">
        <div className=\"max-w-7xl mx-auto px-4\">
          <div className=\"text-center mb-12\">
            <h2 className=\"text-3xl font-bold mb-4\">هل تحتاج إلى مساعدة؟</h2>
            <p className=\"text-xl text-gray-600 max-w-2xl mx-auto\">
              فريقنا من الخبراء جاهز لمساعدتك في اختيار الشاحنة المناسبة لأعمالك
            </p>
          </div>
          
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">
            <Card className=\"text-center p-6\">
              <Phone className=\"mx-auto h-12 w-12 text-blue-600 mb-4\" />
              <h3 className=\"text-xl font-semibold mb-2\">اتصل بنا</h3>
              <p className=\"text-gray-600 mb-4\">+20 2 12345678</p>
              <Button variant=\"outline\" className=\"w-full\">
                <Phone className=\"ml-2 h-4 w-4\" />
                اتصل الآن
              </Button>
            </Card>
            
            <Card className=\"text-center p-6\">
              <Mail className=\"mx-auto h-12 w-12 text-blue-600 mb-4\" />
              <h3 className=\"text-xl font-semibold mb-2\">راسلنا</h3>
              <p className=\"text-gray-600 mb-4\">info@elhamdimport.online</p>
              <Button variant=\"outline\" className=\"w-full\">
                <Mail className=\"ml-2 h-4 w-4\" />
                إرسال بريد
              </Button>
            </Card>
            
            <Card className=\"text-center p-6\">
              <MapPin className=\"mx-auto h-12 w-12 text-blue-600 mb-4\" />
              <h3 className=\"text-xl font-semibold mb-2\">زيارة المعرض</h3>
              <p className=\"text-gray-600 mb-4\">القنطرة غرب، الجيزة</p>
              <Button variant=\"outline\" className=\"w-full\">
                <MapPin className=\"ml-2 h-4 w-4\" />
                الخريطة
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}