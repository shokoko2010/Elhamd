'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Headphones, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Car,
  FileText,
  Send
} from 'lucide-react'
import Link from 'next/link'

export default function TechnicalSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    issue: '',
    urgency: 'normal'
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const supportServices = [
    {
      title: 'دعم هاتفي',
      description: 'فريق دعم متاح 24/7 للمساعدة الفنية',
      icon: 'Phone',
      contact: '+20 2 1234 5678',
      available: 'طوال اليوم'
    },
    {
      title: 'دردشة مباشرة',
      description: 'محادثة فورية مع خبراء الدعم الفني',
      icon: 'MessageCircle',
      contact: 'متاحة الآن',
      available: '24/7'
    },
    {
      title: 'بريد إلكتروني',
      description: 'إرسال المشاكل المعقدة بالبريد الإلكتروني',
      icon: 'Mail',
      contact: 'support@elhamdimport.com',
      available: 'رد خلال 24 ساعة'
    },
    {
      title: 'زيارة فنية',
      description: 'فني متخصص يزورك في الموقع',
      icon: 'Car',
      contact: 'حجز مسبق',
      available: 'ضمن القاهرة الكبرى'
    }
  ]

  const commonIssues = [
    {
      title: 'مشاكل في المحرك',
      description: 'صعوبة في التشغيل، اهتزازات، ضعف في الأداء',
      solution: 'فحص شامل للمحرك وأنظمة الوقود'
    },
    {
      title: 'مشاكل كهربائية',
      description: 'مشاكل في البطارية، الأنوار، نظام الكهرباء',
      solution: 'تشخيص كمبيوتري وإصلاح الأسلاك'
    },
    {
      title: 'مشاكل في الفرامل',
      description: 'أصوات غريبة، ضعف في الكبح، اهتزاز عند الفرملة',
      solution: 'فحص وصيانة نظام الفرامل بالكامل'
    },
    {
      title: 'مشاكل في التكييف',
      description: 'عدم خروج هواء بارد، رائحة كريهة',
      solution: 'فحص نظام التكييف وشحن الفريون'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">الدعم الفني</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              فريق من الخبراء جاهز لمساعدتك في حل أي مشكلة تقنية
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Support Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportServices.map((service, index) => {
            const IconComponent = service.icon === 'Phone' ? Phone : 
                               service.icon === 'MessageCircle' ? MessageCircle :
                               service.icon === 'Mail' ? Mail : Car
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full">
                      {service.contact}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {service.available}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  طلب دعم فني
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">تم إرسال الطلب بنجاح!</h3>
                    <p className="text-gray-600 mb-4">سنتواصل معك في أقرب وقت ممكن</p>
                    <Button onClick={() => setSubmitted(false)}>
                      إرسال طلب آخر
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">الاسم *</label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="أدخل اسمك"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">البريد الإلكتروني *</label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="أدخل بريدك الإلكتروني"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">رقم اله *</label>
                      <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="أدخل رقم هاتفك"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">الموضوع *</label>
                      <Input
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="موضوع المشكلة"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">وصف المشكلة *</label>
                      <Textarea
                        required
                        rows={4}
                        value={formData.issue}
                        onChange={(e) => setFormData({...formData, issue: e.target.value})}
                        placeholder="صف مشكلتك بالتفصيل..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">درجة الإلحاح</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={formData.urgency}
                        onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                      >
                        <option value="low">منخفض</option>
                        <option value="normal">عادي</option>
                        <option value="high">مرتفع</option>
                        <option value="urgent">طارئ</option>
                      </select>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Send className="ml-2 h-4 w-4" />
                      إرسال طلب الدعم
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Common Issues */}
          <div>
            <h2 className="text-2xl font-bold mb-6">مشاكل شائعة وحلولها</h2>
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />
                      <div>
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <p className="text-gray-600 text-sm mt-1">{issue.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{issue.solution}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Support */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">دعم طارئ</h2>
            <p className="text-red-600 mb-6">
              إذا واجهت مشكلة طارئة على الطريق، اتصل بنا فوراً
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+20123456789" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
                <Phone className="inline ml-2 h-5 w-5" />
                طوارئ الطرق: +20 1 2345 6789
              </a>
              <Link href="/contact">
                <Button variant="outline">
                  <Mail className="ml-2 h-5 w-5" />
                  خيارات أخرى
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}