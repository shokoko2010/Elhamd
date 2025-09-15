'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Car, 
  Wrench, 
  Users, 
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  department: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Contact form submission:', formData)
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        department: ''
      })
    } catch (error) {
      setSubmitError('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const departments = [
    { value: 'sales', label: 'قسم المبيعات', icon: Car, description: 'للاستفسارات عن السيارات الجديدة والأسعار' },
    { value: 'service', label: 'قسم الخدمة', icon: Wrench, description: 'لحجز مواعيد الصيانة والاستفسارات الفنية' },
    { value: 'support', label: 'قسم الدعم', icon: Users, description: 'للمساعدة العامة والدعم الفني' }
  ]

  const workingHours = [
    { day: 'السبت - الخميس', hours: '9:00 ص - 8:00 م' },
    { day: 'الجمعة', hours: '10:00 ص - 6:00 م' },
    { day: 'السبت', hours: 'مغلق' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">تواصل معنا</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              نحن هنا لمساعدتك. تواصل مع فريق الخبراء لدينا للحصول على المعلومات التي تحتاجها
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-6 w-6 text-blue-600" />
                  أرسل لنا رسالة
                </CardTitle>
                <CardDescription>
                 املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-4">تم إرسال رسالتك بنجاح!</h3>
                    <p className="text-gray-600 mb-6">
                      شكراً لتواصلك مع شركة الحمد للسيارات. سنعاود الاتصال بك في غضون 24 ساعة.
                    </p>
                    <Button onClick={() => setSubmitSuccess(false)} variant="outline">
                      إرسال رسالة أخرى
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">الاسم الكامل *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">البريد الإلكتروني *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          placeholder="أدخل بريدك الإلكتروني"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">رقم الهاتف *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          placeholder="أدخل رقم هاتفك"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">القسم المطلوب</Label>
                        <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">الموضوع *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                        placeholder="موضوع رسالتك"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">الرسالة *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        placeholder="اكتب رسالتك هنا..."
                        rows={5}
                      />
                    </div>

                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-700">{submitError}</span>
                        </div>
                      </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full" size="lg">
                      {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">الهاتف</h3>
                      <p className="text-gray-600">+20 2 1234 5678</p>
                      <p className="text-sm text-gray-500">مبيعات: 1234</p>
                      <p className="text-sm text-gray-500">خدمة: 5678</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">البريد الإلكتروني</h3>
                      <p className="text-gray-600">info@alhamdcars.com</p>
                      <p className="text-sm text-gray-500">sales@alhamdcars.com</p>
                      <p className="text-sm text-gray-500">service@alhamdcars.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">الموقع</h3>
                      <p className="text-gray-600">القاهرة، مصر</p>
                      <p className="text-sm text-gray-500">شارع التحرير، وسط البلد</p>
                      <p className="text-sm text-gray-500">بجانب ميدان التحرير</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  {workingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{schedule.day}</span>
                      <Badge variant={schedule.hours === 'مغلق' ? 'destructive' : 'secondary'}>
                        {schedule.hours}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Departments */}
            <Card>
              <CardHeader>
                <CardTitle>الأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.value} className="flex items-start gap-3">
                      <dept.icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{dept.label}</h4>
                        <p className="text-sm text-gray-600">{dept.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">معلومات سريعة</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• نقدم خدمة 24/7 للطوارئ</li>
                <li>• جميع سياراتنا جديدة مع ضمان المصنع</li>
                <li>• تمويل سيارات بأفضل الأسعار</li>
                <li>• خدمة توصيل السيارات للمنزل</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">موقعنا</h2>
            <p className="text-gray-600">زرنا في معرضنا الرئيسي في قلب القاهرة</p>
          </div>
          
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">خريطة موقع شركة الحمد للسيارات</p>
              <p className="text-sm text-gray-500">شارع التحرير، وسط البلد، القاهرة</p>
              <Button variant="outline" className="mt-4">
                افتح في خرائط جوجل
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}