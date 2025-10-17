'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
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

const mapContainerStyle = {
  width: '100%',
  height: '400px',
}

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

  const center = {
    lat: contactInfo?.mapLat || 30.0444,
    lng: contactInfo?.mapLng || 31.2357,
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  // Don't attempt to load Google Maps if API key is not available
  const shouldShowMap = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && isLoaded && !loadError

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

  // Ensure departments is always an array for map function
  const safeDepartments = Array.isArray(departments) ? departments : []
  const safeWorkingHours = Array.isArray(workingHours) ? workingHours : []

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`
    window.open(url, '_blank')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">تواصل معنا</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              نحن هنا لمساعدتك على مدار الساعة. تواصل معنا لأي استفسار أو مساعدة.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  إرسال رسالة
                </CardTitle>
                <CardDescription>
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">تم إرسال الرسالة بنجاح!</h3>
                    <p className="text-gray-600 mb-6">شكراً لتواصلك معنا. سنتواصل معك قريباً.</p>
                    <Button onClick={resetForm}>
                      إرسال رسالة أخرى
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <p className="text-red-700">{submitError}</p>
                        </div>
                      </div>
                    )}

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
                            {safeDepartments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">الموضوع</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="موضوع الرسالة"
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

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">الهاتف</h3>
                      <p className="text-gray-600">{contactInfo?.primaryPhone || '+20 2 1234 5678'}</p>
                      {contactInfo?.secondaryPhone && (
                        <p className="text-sm text-gray-500">{contactInfo.secondaryPhone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">البريد الإلكتروني</h3>
                      <p className="text-gray-600">{contactInfo?.primaryEmail || 'info@elhamdimport.com'}</p>
                      {contactInfo?.secondaryEmail && (
                        <p className="text-sm text-gray-500">{contactInfo.secondaryEmail}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">العنوان</h3>
                    <p className="text-gray-600">{contactInfo?.address || 'القاهرة، مصر'}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={openInGoogleMaps}
                      className="mt-2"
                    >
                      فتح في خرائط جوجل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ساعات العمل</h3>
                    <div className="space-y-1 mt-2">
                      {safeWorkingHours.map((hours, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{hours.day}</span>
                          <span className="font-medium">{hours.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Departments Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">الأقسام</h3>
                    <div className="space-y-3 mt-3">
                      {safeDepartments.map((dept) => {
                        const IconComponent = getIconComponent(dept.icon)
                        return (
                          <div key={dept.value} className="flex items-start gap-3">
                            <IconComponent className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{dept.label}</p>
                              <p className="text-xs text-gray-500">{dept.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            {shouldShowMap ? (
              <Card>
                <CardContent className="p-0">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={15}
                    options={{
                      styles: [
                        {
                          featureType: 'all',
                          elementType: 'geometry.fill',
                          stylers: [{ color: '#f5f5f5' }]
                        },
                        {
                          featureType: 'water',
                          elementType: 'geometry',
                          stylers: [{ color: '#e9e9e9' }]
                        },
                        {
                          featureType: 'landscape.man_made',
                          elementType: 'geometry',
                          stylers: [{ color: '#d7d7d7' }]
                        },
                        {
                          featureType: 'road',
                          elementType: 'geometry.stroke',
                          stylers: [{ color: '#ffffff' }]
                        },
                        {
                          featureType: 'road',
                          elementType: 'geometry.fill',
                          stylers: [{ color: '#f2f2f2' }]
                        },
                        {
                          featureType: 'poi',
                          elementType: 'geometry.fill',
                          stylers: [{ color: '#e5e5e5' }]
                        }
                      ]
                    }}
                  >
                    <Marker position={center} />
                  </GoogleMap>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">الخريطة غير متاحة</h3>
                    <p className="text-gray-600 mb-4">لا يمكن تحميل الخريطة حالياً</p>
                    <Button 
                      variant="outline" 
                      onClick={openInGoogleMaps}
                    >
                      فتح في خرائط جوجل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}