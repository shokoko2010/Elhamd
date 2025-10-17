'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Car,
  Wrench,
  FileText,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  icon: string
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('الكل')

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'ما هي ساعات العمل الخاصة بكم؟',
      answer: 'نعمل من السبت إلى الخميس من 9 صباحاً حتى 8 مساءً، ومن الجمعة من 2 مساءً حتى 8 مساءً. مركز الخدمة متاح أيضاً في أيام العطلات بجدول محدد.',
      category: 'عام',
      icon: 'Clock'
    },
    {
      id: '2',
      question: 'هل تقدمون ضمان على الخدمات؟',
      answer: 'نعم، نقدم ضمان شامل على جميع خدمات الصيانة والإصلاحات لمدة تصل إلى 6 أشهر، بالإضافة إلى ضمان الشركة المصنعة على القطع الأصلية.',
      category: 'ضمان',
      icon: 'Shield'
    },
    {
      id: '3',
      question: 'كيف يمكنني حجز موعد للصيانة؟',
      answer: 'يمكنك حجز موعد عبر موقعنا الإلكتروني، أو بالاتصال بنا على الهاتف، أو زيارة مركز الخدمة مباشرة. نوصي بالحجز المسبق لضمان الخدمة الفورية.',
      category: 'حجز',
      icon: 'Calendar'
    },
    {
      id: '4',
      question: 'هل تقدمون خدمة السيارات في الموقع؟',
      answer: 'نعم، نقدم خدمة الصيانة المنزلية للعملاء في القاهرة الكبرى. يمكنكم طلب الخدمة عبر الهاتف وسنقوم بإرسال فني متخصص إلى موقعكم.',
      category: 'خدمات',
      icon: 'Car'
    },
    {
      id: '5',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نقبل جميع طرق الدفع الإلكترونية (البطاقات الائتمانية والخصم المباشر)، والدفع نقداً، والدفع عند الاستلام، والتقسيط عبر شركات التمويل المتعاقد معها.',
      category: 'دفع',
      icon: 'CreditCard'
    },
    {
      id: '6',
      question: 'هل تستخدمون قطع غيار أصلية؟',
      answer: 'نعم، نستخدم فقط القطع الأصلية المعتمدة من الشركات المصنعة، ونضمن جودتها وأصالتها. كما نتوفر خيارات قطع بديلة عالية الجودة بناءً على طلب العميل.',
      category: 'قطع غيار',
      icon: 'Wrench'
    },
    {
      id: '7',
      question: 'كم تستغرق الخدمة الشاملة؟',
      answer: 'الخدمة الشاملة تستغرق عادةً من 4 إلى 6 ساعات، تشمل فحصاً شاملاً لأكثر من 50 نقطة في السيارة، وتغيير الزيت والفلاتر، والتنظيف الداخلي والخارجي.',
      category: 'خدمات',
      icon: 'Wrench'
    },
    {
      id: '8',
      question: 'هل تقدمون خصومات للعملاء الدائمين؟',
      answer: 'نعم، لدينا برنامج ولاء للعملاء الدائمين يقدم خصومات تصل إلى 20% على الخدمات، بالإضافة إلى عروض خاصة موسمية وعروض على الخدمات المتعددة.',
      category: 'عروض',
      icon: 'Gift'
    }
  ]

  const categories = ['الكل', 'عام', 'ضمان', 'حجز', 'خدمات', 'دفع', 'قطع غيار', 'عروض']

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'HelpCircle': HelpCircle,
      'Car': Car,
      'Wrench': Wrench,
      'FileText': FileText,
      'CreditCard': CreditCard
    }
    return iconMap[iconName] || HelpCircle
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'الكل' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسئلة الشائعة</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              تجدون هنا إجابات على أكثر الأسئلة شيوعاً حول خدماتنا وسياساتنا
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
              placeholder="ابحث عن سؤال..."
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

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">جرب تغيير كلمات البحث أو اختيار فئة مختلفة</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const IconComponent = getIconComponent(faq.icon)
              const isExpanded = expandedItems.includes(faq.id)
              
              return (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-right mb-2">
                            {faq.question}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mr-3">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="pr-13 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">لم تجد إجابة سؤالك؟</h2>
          <p className="text-xl mb-8 text-blue-100">
            فريق خدمة العملاء جاهز لمساعدتك في أي وقت
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
              <p className="text-blue-100">info@elhamdimport.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">دردشة مباشرة</h3>
              <p className="text-blue-100">متاح 24/7</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                تواصل معنا الآن
              </Button>
            </Link>
            <Link href="/service-booking">
              <Button size="lg" className="w-full sm:w-auto">
                احجز موعد للصيانة
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}