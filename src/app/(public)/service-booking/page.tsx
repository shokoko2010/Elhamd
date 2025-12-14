'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar as CalendarIcon,
  Wrench,
  Clock,
  User,
  Mail,
  Phone,
  Car,
  CheckCircle,
  AlertCircle,
  MapPin,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ensureArray } from '@/lib/array-utils'
import BookingCalendar from '@/components/booking/BookingCalendar'
import { toast } from 'sonner'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate?: string
  vin?: string
}

interface ServiceType {
  id: string
  name: string
  description: string
  duration: number
  price?: number
  category: string
}

interface TimeSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  maxBookings: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ServiceBookingFormData {
  vehicleId: string
  serviceTypeId: string
  date: Date | undefined
  timeSlot: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  vehicleInfo: {
    licensePlate: string
    vin?: string
    mileage: string
  }
  notes: string
  totalPrice: number
}

export default function ServiceBookingPage() {
  const { status } = useSession()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined)
  const [calendarData, setCalendarData] = useState<{
    timeSlots: TimeSlot[]
    holidays: any[]
    bookings: any[]
  }>({
    timeSlots: [],
    holidays: [],
    bookings: []
  })
  const [formData, setFormData] = useState<ServiceBookingFormData>({
    vehicleId: '',
    serviceTypeId: '',
    date: new Date(),
    timeSlot: '',
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    vehicleInfo: {
      licensePlate: '',
      vin: '',
      mileage: ''
    },
    notes: '',
    totalPrice: 0
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [calendarLoading, setCalendarLoading] = useState(false)

  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Only clear if explicitly unauthenticated
      setVehicles([])
      return
    }
    if (status === 'loading') return

    // Fetch vehicles from API
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?limit=20')
        const data = await response.json()
        if (data.vehicles) {
          setVehicles(data.vehicles)
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        // toast.error('فشل في تحميل المركبات. يرجى المحاولة مرة أخرى لاحقاً.')
        setVehicles([])
      }
    }

    // Fetch service types from API
    const fetchServiceTypes = async () => {
      try {
        const response = await fetch('/api/admin/service-types')
        const data = await response.json()
        if (data.serviceTypes) {
          setServiceTypes(data.serviceTypes)
        }
      } catch (error) {
        console.error('Error fetching service types:', error)
        // toast.error('فشل في تحميل أنواع الخدمات. يرجى المحاولة مرة أخرى لاحقاً.')
        setServiceTypes([])
      }
    }

    // Fetch calendar data
    const fetchCalendarData = async () => {
      setCalendarLoading(true)
      try {
        const response = await fetch('/api/booking/calendar')
        const data = await response.json()
        if (data) {
          setCalendarData(data)
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error)
      } finally {
        setCalendarLoading(false)
      }
    }

    fetchVehicles()
    fetchServiceTypes()
    fetchCalendarData()
  }, [status])

  useEffect(() => {
    // Calculate total price based on selected service
    if (selectedService) {
      const service = serviceTypes.find(s => s.id === selectedService)
      setFormData(prev => ({
        ...prev,
        serviceTypeId: selectedService,
        totalPrice: service?.price || 0
      }))
    }
  }, [selectedService, serviceTypes])

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData(prev => ({
      ...prev,
      vehicleId: vehicle.id,
      vehicleInfo: {
        ...prev.vehicleInfo,
        licensePlate: vehicle.licensePlate || '',
        vin: vehicle.vin || ''
      }
    }))
    setStep(2)
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setStep(3)
  }

  const handleSkipVehicleSelection = () => {
    setSelectedVehicle(null)
    setFormData(prev => ({
      ...prev,
      vehicleId: '',
      vehicleInfo: {
        ...prev.vehicleInfo,
        licensePlate: '',
        vin: ''
      }
    }))
    setStep(2)
  }

  const handleDateSelect = (date: Date, timeSlot: TimeSlot | undefined) => {
    setSelectedDate(date)
    if (timeSlot) {
      setSelectedTimeSlot(timeSlot)
      setFormData(prev => ({
        ...prev,
        date,
        timeSlot: timeSlot.startTime
      }))
      setStep(4)
    } else {
      setSelectedTimeSlot(undefined)
    }
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [field]: value }
    }))
  }

  const handleVehicleInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleInfo: { ...prev.vehicleInfo, [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/bookings/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          serviceType: formData.serviceTypeId,
          date: formData.date?.toISOString(),
          timeSlot: formData.timeSlot,
          customerInfo: {
            ...formData.customerInfo,
            licenseNumber: formData.vehicleInfo.licensePlate
          },
          vehicleInfo: formData.vehicleInfo,
          message: formData.notes,
          urgency: 'MEDIUM'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حجز الخدمة')
      }

      setSubmitSuccess(true)
      setStep(5)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'فشل في حجز الخدمة. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedVehicle(null)
    setSelectedService('')
    setSelectedDate(undefined)
    setSelectedTimeSlot(undefined)
    setFormData({
      vehicleId: '',
      serviceTypeId: '',
      date: undefined,
      timeSlot: '',
      customerInfo: {
        name: '',
        email: '',
        phone: ''
      },
      vehicleInfo: {
        licensePlate: '',
        vin: '',
        mileage: ''
      },
      notes: '',
      totalPrice: 0
    })
    setStep(1)
    setSubmitSuccess(false)
    setSubmitError('')
  }

  const getSelectedService = () => {
    return serviceTypes.find(s => s.id === selectedService)
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-t-4 border-t-red-500">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">تسجيل الدخول مطلوب</CardTitle>
            <CardDescription className="text-gray-600">
              يرجى تسجيل الدخول للوصول إلى نظام حجز الخدمات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Button onClick={() => signIn()} size="lg" className="w-full font-bold">
              تسجيل الدخول الآن
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Page Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/95 to-slate-900/90"></div>
        <div className="container relative mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-blue-500/50 backdrop-blur-sm">
              نظام الحجز الإلكتروني
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">حجز موعد صيانة</h1>
            <p className="text-lg text-blue-100/80 leading-relaxed max-w-2xl">
              احجز موعد صيانتك القادم بكل سهولة. اختر نوع الخدمة، الموعد المناسب، ودع فريقنا المتخصص يهتم بسيارتك.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          {!submitSuccess && (
            <div className="mb-10 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[600px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {[1, 2, 3, 4, 5].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= stepNumber
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                    >
                      {step > stepNumber ? <CheckCircle className="h-6 w-6" /> : stepNumber}
                    </div>
                    <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${step >= stepNumber ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                      {stepNumber === 1 && 'المركبة'}
                      {stepNumber === 2 && 'الخدمة'}
                      {stepNumber === 3 && 'الموعد'}
                      {stepNumber === 4 && 'البيانات'}
                      {stepNumber === 5 && 'التأكيد'}
                    </span>
                  </div>
                ))}

                {/* Connecting Lines */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-0 hidden"></div>
                {/* (Note: Positioning absolute lines perfectly in a flex container is tricky without absolute positioning the container. simplified for now) */}
              </div>
            </div>
          )}

          <div className="transition-all duration-500 ease-in-out">
            {submitSuccess ? (
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-green-500 h-2 w-full"></div>
                <CardContent className="text-center py-16 px-4">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900">تم حجز الموعد بنجاح!</h2>
                  <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                    شكراً لاختيارك مركز الحمد للصيانة. لقد تم تأكيد حجزك، وتم إرسال تفاصيل الموعد إلى بريدك الإلكتروني.
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-8 mb-8 text-right max-w-xl mx-auto border border-slate-100 shadow-inner">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">ملخص الحجز</h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="flex justify-between">
                        <span className="text-gray-500">المركبة:</span>
                        <span className="font-medium">{selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'N/A'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">الخدمة:</span>
                        <span className="font-medium">{getSelectedService()?.name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">الموعد:</span>
                        <span className="font-medium" dir="ltr">
                          {selectedDate && format(selectedDate, 'PPP', { locale: ar })} - {formData.timeSlot}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">التكلفة المتوقعة:</span>
                        <span className="font-bold text-blue-600">{formData.totalPrice.toLocaleString()} ج.م</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={resetForm} size="lg" variant="outline">
                      حجز موعد جديد
                    </Button>
                    <Link href="/">
                      <Button size="lg">العودة للرئيسية</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Step 1: Vehicle Selection */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">اختر المركبة</h2>
                      <Button variant="ghost" className="text-blue-600" onClick={handleSkipVehicleSelection}>
                        تخطي اختيار المركبة <ArrowRight className="mr-2 h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ensureArray(vehicles).map((vehicle) => (
                        <Card
                          key={vehicle.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl group border-2 ${selectedVehicle?.id === vehicle.id ? 'border-blue-500 shadow-md bg-blue-50/10' : 'border-transparent hover:border-blue-200'
                            }`}
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-blue-100/50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <Car className="h-8 w-8 text-blue-600" />
                              </div>
                              {selectedVehicle?.id === vehicle.id && <Badge className="bg-blue-600">تم الاختيار</Badge>}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-gray-500 mb-4">{vehicle.year} • {vehicle.licensePlate}</p>
                            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded block truncate">
                              VIN: {vehicle.vin || 'N/A'}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Card
                        className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/5 transition-all text-center flex flex-col items-center justify-center min-h-[220px] group"
                        // In a real app, this would open a modal or navigate to add vehicle page
                        onClick={() => toast.info('هذه الميزة ستكون متاحة قريباً')}
                      >
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                          <Car className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-gray-600 group-hover:text-blue-600">إضافة مركبة جديدة</h3>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 2: Service Selection */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Button variant="outline" size="icon" onClick={() => setStep(1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-2xl font-bold text-gray-900">نوع الخدمة المطلوبة</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ensureArray(serviceTypes).map((service) => (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-200 border-2 ${selectedService === service.id
                              ? 'border-blue-600 shadow-lg bg-blue-50/20'
                              : 'border-transparent hover:border-blue-200 hover:shadow-md'
                            }`}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={selectedService === service.id}
                                className="mt-1"
                                onCheckedChange={() => handleServiceSelect(service.id)}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h4>
                                  {service.price && (
                                    <Badge variant="secondary" className="font-bold text-blue-700 bg-blue-100">
                                      {service.price.toLocaleString()} ج.م
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>المدة التقديرية: {service.duration} دقيقة</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Calendar */}
                {step === 3 && selectedService && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Button variant="outline" size="icon" onClick={() => setStep(2)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-2xl font-bold text-gray-900">تحديد الموعد</h2>
                    </div>

                    {calendarLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500 font-medium">جاري تحميل المواعيد المتاحة...</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border p-1 md:p-6">
                        <BookingCalendar
                          bookings={calendarData.bookings}
                          timeSlots={calendarData.timeSlots}
                          holidays={calendarData.holidays}
                          onDateSelect={handleDateSelect}
                          selectedDate={selectedDate}
                          selectedTimeSlot={selectedTimeSlot}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Customer Details & Confirmation */}
                {step === 4 && selectedService && selectedDate && selectedTimeSlot && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Button variant="outline" size="icon" onClick={() => setStep(3)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-2xl font-bold text-gray-900">مراجعة البيانات وتأكيد الحجز</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form Fields */}
                        <div className="lg:col-span-2 space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>بيانات التواصل</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name">الاسم الكامل *</Label>
                                  <Input
                                    id="name"
                                    value={formData.customerInfo.name}
                                    onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                                    required
                                    className="bg-gray-50"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="phone">رقم الهاتف *</Label>
                                  <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.customerInfo.phone}
                                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                                    required
                                    className="bg-gray-50"
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={formData.customerInfo.email}
                                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                                    required
                                    className="bg-gray-50"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>معلومات إضافية عن المركبة</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="mileage">قراءة العداد (كم)</Label>
                                  <Input
                                    id="mileage"
                                    type="number"
                                    value={formData.vehicleInfo.mileage}
                                    onChange={(e) => handleVehicleInfoChange('mileage', e.target.value)}
                                    className="bg-gray-50"
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="notes">ملاحظات لفريق الصيانة</Label>
                                  <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="أية أعطال محددة أو أصوات غريبة لاحظتها..."
                                    className="min-h-[100px] bg-gray-50"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:col-span-1">
                          <Card className="sticky top-4 border-blue-100 shadow-lg bg-slate-50/50">
                            <CardHeader className="bg-blue-600 text-white rounded-t-xl mb-4">
                              <CardTitle>تفاصيل الحجز</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                                  <span className="text-gray-500">المركبة</span>
                                  <span className="font-semibold text-gray-900 text-end">
                                    {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'غير محدد'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                                  <span className="text-gray-500">الخدمة</span>
                                  <span className="font-semibold text-gray-900 text-end">{getSelectedService()?.name}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                                  <span className="text-gray-500">التاريخ</span>
                                  <span className="font-semibold text-gray-900 text-end">{format(selectedDate, 'PPP', { locale: ar })}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                                  <span className="text-gray-500">الوقت</span>
                                  <span className="font-semibold text-gray-900 text-end">{selectedTimeSlot.startTime}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-lg font-bold text-gray-900">الإجمالي</span>
                                  <span className="text-xl font-bold text-blue-600">{formData.totalPrice.toLocaleString()} ج.م</span>
                                </div>
                              </div>

                              {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                  <span>{submitError}</span>
                                </div>
                              )}

                              <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg shadow-blue-600/20"
                                disabled={loading || !formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.phone}
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    جاري المعالجة...
                                  </>
                                ) : (
                                  'تأكيد وحجز الموعد'
                                )}
                              </Button>
                              <p className="text-xs text-center text-gray-400">
                                بالنقر على تأكيد الحجز، فإنك توافق على شروط الخدمة وسياسة الخصوصية.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}