'use client'

import { useState, useEffect } from 'react'
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
  Send,
  ArrowLeft,
  Globe
} from 'lucide-react'
import CompanyMap from '@/components/ui/CompanyMap'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  department: string
}

interface ContactInfo {
  id: string
  primaryPhone?: string
  secondaryPhone?: string
  primaryEmail?: string
  secondaryEmail?: string
  address?: string
  mapLat?: number
  mapLng?: number
  workingHours?: { day: string; hours: string }[]
  departments?: { value: string; label: string; icon: string; description: string }[]
  isActive: boolean
  branches?: Branch[]
  googleMapLink?: string
}

interface Branch {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
  mapLat?: number
  mapLng?: number
  googleMapLink?: string
  workingHours?: any
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
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
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          department: ''
        })
      } else {
        setSubmitError(data.error || 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitError('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitSuccess(false)
    setSubmitError('')
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Car': Car,
      'Wrench': Wrench,
      'Users': Users,
      'Phone': Phone,
      'Mail': Mail,
      'MapPin': MapPin,
      'Clock': Clock
    }
    return iconMap[iconName] || Users
  }

  const departments = contactInfo?.departments || [
    { value: 'sales', label: 'قسم المبيعات', icon: 'Car', description: 'للاستفسارات عن السيارات الجديدة والأسعار' },
    { value: 'service', label: 'قسم الخدمة', icon: 'Wrench', description: 'لحجز مواعيد الصيانة والاستفسارات الفنية' },
    { value: 'support', label: 'قسم الدعم', icon: 'Users', description: 'للمساعدة العامة والدعم الفني' }
  ]

  const workingHours = contactInfo?.workingHours || [
    { day: 'السبت - الخميس', hours: '9:00 ص - 8:00 م' },
    { day: 'الجمعة', hours: '2:00 م - 8:00 م' }
  ]

  const safeDepartments = Array.isArray(departments) ? departments :
    (typeof departments === 'object' && departments !== null ? Object.values(departments) : [])
  const safeWorkingHours = Array.isArray(workingHours) ? workingHours :
    (typeof workingHours === 'object' && workingHours !== null ? Object.values(workingHours) : [])

  const openInGoogleMaps = (lat?: number, lng?: number, link?: string) => {
    if (link) {
      window.open(link, '_blank')
      return
    }
    if (!lat && !lng && contactInfo?.googleMapLink) {
      window.open(contactInfo.googleMapLink, '_blank')
      return
    }

    // Fallback if no specific logic but we have coords
    if (lat && lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      window.open(url, '_blank')
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل صفحة الاتصال...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#0A1A3F] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-transparent"></div>

        {/* Animated Shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="container relative mx-auto px-4 text-center z-10">
          <Badge className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-none mb-6 px-4 py-2 text-base transition-all">
            نحن هنا لخدمتك
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            تواصل معنا <span className="text-blue-400">في أي وقت</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            فريق خدمة العملاء جاهز للإجابة على استفساراتكم وتقديم الدعم اللازم.
            نسعد بتواصلكم معنا عبر القنوات المختلفة.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-16 pb-24 relative z-20">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">اتصل بنا</h3>
              <p className="text-gray-500 mb-4 text-sm">متاحون للرد على استفساراتكم</p>
              <div className="space-y-1">
                <a href={`tel:${contactInfo?.primaryPhone}`} className="block text-lg font-semibold text-blue-700 hover:text-blue-800 dir-ltr">
                  {contactInfo?.primaryPhone}
                </a>
                {contactInfo?.secondaryPhone && (
                  <a href={`tel:${contactInfo?.secondaryPhone}`} className="block text-base text-gray-600 hover:text-blue-700 dir-ltr">
                    {contactInfo.secondaryPhone}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">البريد الإلكتروني</h3>
              <p className="text-gray-500 mb-4 text-sm">راسلنا في أي وقت</p>
              <div className="space-y-1">
                <a href={`mailto:${contactInfo?.primaryEmail}`} className="block text-lg font-semibold text-green-700 hover:text-green-800">
                  {contactInfo?.primaryEmail}
                </a>
                {contactInfo?.secondaryEmail && (
                  <a href={`mailto:${contactInfo.secondaryEmail}`} className="block text-base text-gray-600 hover:text-green-700">
                    {contactInfo.secondaryEmail}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">العنوان الرئيسي</h3>
              <p className="text-gray-500 mb-4 text-sm">تفضل بزيارتنا</p>
              <p className="text-lg text-gray-700 mb-4 font-medium px-4">
                {contactInfo?.address}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                onClick={() => openInGoogleMaps(contactInfo?.mapLat, contactInfo?.mapLng, contactInfo?.googleMapLink)}
              >
                الموقع على الخريطة
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Main Form Section */}
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0A1A3F] mb-3">أرسل لنا رسالة</h2>
              <p className="text-gray-600">املأ النموذج أدناه وسيقوم فريقنا بالرد عليك في أقرب وقت.</p>
            </div>

            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <CardContent className="p-8">
                {submitSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">تم الإرسال بنجاح!</h3>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">شكراً لتواصلك معنا. تم استلام رسالتك وسنرد عليك قريباً.</p>
                    <Button onClick={resetForm} className="min-w-[200px] bg-[#0A1A3F] hover:bg-[#061028]">
                      إرسال رسالة أخرى
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                        <p className="text-red-700 text-sm font-medium">{submitError}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">الاسم الكامل <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          placeholder="أدخل اسمك"
                          className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">البريد الإلكتروني <span className="text-red-500">*</span></Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          placeholder="username@example.com"
                          className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">رقم الهاتف <span className="text-red-500">*</span></Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          placeholder="01xxxxxxxxx"
                          className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-gray-700 font-medium">القسم المعني</Label>
                        <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                          <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:bg-white">
                            <SelectValue placeholder="اختر القسم" />
                          </SelectTrigger>
                          <SelectContent>
                            {safeDepartments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-gray-700 font-medium">الموضوع</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="ملخص الرسالة"
                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700 font-medium">الرسالة <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        placeholder="اكتب تفاصيل رسالتك هنا..."
                        rows={6}
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none p-4"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg bg-[#0A1A3F] hover:bg-[#061028] shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>جاري الإرسال...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          <span>إرسال الرسالة</span>
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar & Map Section */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Map Card */}
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-[400px] relative z-0">
              <CompanyMap contactInfo={contactInfo} />
            </div>

            {/* Working Hours */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-[#0A1A3F] to-[#112d6e] text-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">المقر الرئيسي</h4>
                    <p className="text-blue-100/70">{contactInfo.address}</p>
                  </div>
                </div>

                {/* Branches Addresses */}
                {contactInfo.branches?.map((branch) => (
                  <div key={branch.id} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{branch.name}</h4>
                      <p className="text-blue-100/70">{branch.address}</p>
                    </div>
                  </div>
                ))}

                <div className="space-y-4">
                  {safeWorkingHours.map((hours: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                      <span className="text-blue-100 font-medium">{hours.day}</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold dir-ltr">{hours.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Branches List */}
            {contactInfo?.branches && contactInfo.branches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#0A1A3F] px-2 flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  فروعنا
                </h3>
                <div className="grid gap-4">
                  {contactInfo.branches.map((branch) => (
                    <Card key={branch.id} className="border hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {branch.name}
                            </h4>
                            {branch.address && <p className="text-gray-500 text-sm mb-2">{branch.address}</p>}
                            {branch.phone && (
                              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                                <Phone className="h-3 w-3" />
                                <span dir="ltr">{branch.phone}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => openInGoogleMaps(branch.mapLat, branch.mapLng, branch.googleMapLink)}
                          >
                            <MapPin className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}