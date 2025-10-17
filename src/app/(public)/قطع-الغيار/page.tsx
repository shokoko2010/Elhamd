'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Search, 
  Phone, 
  Mail, 
  Car,
  CheckCircle,
  Truck,
  Shield,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface Part {
  id: string
  name: string
  description: string
  price: string
  category: string
  availability: string
  original: boolean
}

export default function PartsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('الكل')

  const parts: Part[] = [
    {
      id: '1',
      name: 'فلاتر زيت أصلية',
      description: 'فلاتر زيت عالية الجودة لجميع أنواع السيارات',
      price: '150 ج.م',
      category: 'فلاتر',
      availability: 'متوفر',
      original: true
    },
    {
      id: '2',
      name: 'بطاريات سيارات',
      description: 'بطاريات عالية الأداء بضمان سنتين',
      price: '1,200 ج.م',
      category: 'بطاريات',
      availability: 'متوفر',
      original: true
    },
    {
      id: '3',
      name: 'وسادات فرامل',
      description: 'وسادات فرامل أمامية وخلفية عالية الجودة',
      price: '450 ج.م',
      category: 'فرامل',
      availability: 'متوفر',
      original: true
    },
    {
      id: '4',
      name: 'إطارات',
      description: 'إطارات من أفضل الشركات العالمية',
      price: '800 ج.م',
      category: 'إطارات',
      availability: 'طلب مسبق',
      original: true
    },
    {
      id: '5',
      name: 'زيت محركات',
      description: 'زيوت محركات اصطناعية من الدرجة الأولى',
      price: '250 ج.م',
      category: 'زيوت',
      availability: 'متوفر',
      original: true
    },
    {
      id: '6',
      name: 'شموع إشعال',
      description: 'شموع إشعال أصلية لجميع أنواع المحركات',
      price: '80 ج.م',
      category: 'إشعال',
      availability: 'متوفر',
      original: true
    }
  ]

  const categories = ['الكل', 'فلاتر', 'بطاريات', 'فرامل', 'إطارات', 'زيوت', 'إشعال']

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'الكل' || part.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">قطع الغيار</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              قطع غيار أصلية ومعتمدة لضمان أفضل أداء لسيارتك
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="ابحث عن قطعة غيار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredParts.map((part) => (
            <Card key={part.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{part.name}</CardTitle>
                      {part.original && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          أصلي
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={part.availability === 'متوفر' ? 'default' : 'secondary'}>
                    {part.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{part.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-blue-600">{part.price}</span>
                  <Badge variant="outline">{part.category}</Badge>
                </div>
                <Button className="w-full">
                  اطلب الآن
                  <Truck className="mr-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">قطع أصلية فقط</h3>
            <p className="text-gray-600">نضمن أصالة وجودة جميع قطع الغيار</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">توصيل سريع</h3>
            <p className="text-gray-600">توصيل خلال 24-48 ساعة داخل القاهرة</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ضمان الجودة</h3>
            <p className="text-gray-600">ضمان على جميع القطع لمدة تصل إلى سنة</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">لا تجد القطعة التي تبحث عنها؟</h2>
          <p className="text-xl mb-8 text-blue-100">
            فريقنا متخصص في توفير القطع النادرة والصعبة
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">اتصل بنا</h3>
              <p className="text-blue-100">+20 2 1234 5678</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">راسلنا</h3>
              <p className="text-blue-100">parts@elhamdimport.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">زيارة المركز</h3>
              <p className="text-blue-100">القاهرة، مصر</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                اطلب قطعة خاصة
              </Button>
            </Link>
            <Link href="/service-booking">
              <Button size="lg" className="w-full sm:w-auto">
                احجز تركيب
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}