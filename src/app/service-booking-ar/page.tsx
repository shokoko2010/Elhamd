'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
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
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

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
  time: string
  available: boolean
}

interface ServiceBookingFormData {
  vehicleId: string
  serviceTypes: string[]
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
  message: string
  totalPrice: number
}

export default function ServiceBookingArabicPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [formData, setFormData] = useState<ServiceBookingFormData>({
    vehicleId: '',
    serviceTypes: [],
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
    message: '',
    totalPrice: 0
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    // Mock vehicles data
    const mockVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'تاتا',
        model: 'نيكسون',
        year: 2022,
        licensePlate: 'ABC123',
        vin: 'MAT625487K1L5B4321'
      },
      {
        id: '2',
        make: 'تاتا',
        model: 'بانش',
        year: 2023,
        licensePlate: 'XYZ789',
        vin: 'JTMBHREV3MJ123456'
      },
      {
        id: '3',
        make: 'تاتا',
        model: 'تياجو',
        year: 2024,
        licensePlate: 'DEF456',
        vin: 'MAT625487K1L5C4321'
      }
    ]
    setVehicles(mockVehicles)

    // Mock service types
    const mockServiceTypes: ServiceType[] = [
      {
        id: '1',
        name: 'تغيير الزيت والفلتر',
        description: 'صيانة دورية شاملة لتغيير زيت المحرك والفلتر',
        duration: 30,
        price: 350,
        category: 'صيانة دورية'
      },
      {
        id: '2',
        name: 'صيانة شاملة',
        description: 'فحص وصيانة شاملة للمركبة',
        duration: 120,
        price: 1200,
        category: 'صيانة دورية'
      },
      {
        id: '3',
        name: 'فحص الفرامل',
        description: 'فحص وصيانة نظام الفرامل بالكامل',
        duration: 60,
        price: 450,
        category: 'نظام الفرامل'
      },
      {
        id: '4',
        name: 'صيانة المكيف',
        description: 'صيانة وتنظيف نظام تكييف الهواء',
        duration: 45,
        price: 600,
        category: 'نظام التكييف'
      },
      {
        id: '5',
        name: 'اتزان العجلات',
        description: 'اتزان العجلات وضبط زوايا العجلة الأمامية',
        duration: 60,
        price: 300,
        category: 'العجلات'
      },
      {
        id: '6',
        name: 'تنظيف وتلميع',
        description: 'تنظيف وتلميع داخل وخارج السيارة',
        duration: 180,
        price: 800,
        category: 'التنظيف'
      },
      {
        id: '7',
        name: 'فحص البطارية',
        description: 'فحص وصيانة البطارية واستبدالها إذا لزم الأمر',
        duration: 30,
        price: 200,
        category: 'الكهرباء'
      },
      {
        id: '8',
        name: 'تشخيص المحرك',
        description: 'تشخيص شامل للمحرك باستخدام أحدث الأجهزة',
        duration: 90,
        price: 400,
        category: 'المحرك'
      }
    ]
    setServiceTypes(mockServiceTypes)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      // Generate mock time slots based on selected date
      const mockTimeSlots: TimeSlot[] = [
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '13:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
        { time: '17:00', available: false }
      ]
      setAvailableTimeSlots(mockTimeSlots)
      setSelectedTimeSlot('')
    }
  }, [selectedDate])

  useEffect(() => {
    // Calculate total price based on selected services
    const totalPrice = selectedServices.reduce((total, serviceId) => {
      const service = serviceTypes.find(s => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
    setFormData(prev => ({ ...prev, totalPrice, serviceTypes: selectedServices }))
  }, [selectedServices, serviceTypes])

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

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices(prev => [...prev, serviceId])
    } else {
      setSelectedServices(prev => prev.filter(id => id !== serviceId))
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setFormData(prev => ({ ...prev, date }))
    if (date) {
      setStep(4)
    }
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    setFormData(prev => ({ ...prev, timeSlot }))
    setStep(5)
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Service booking:', formData)
      setSubmitSuccess(true)
      setStep(6)
    } catch (error) {
      setSubmitError('فشل حجز الخدمة. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedVehicle(null)
    setSelectedServices([])
    setSelectedDate(undefined)
    setSelectedTimeSlot('')
    setFormData({
      vehicleId: '',
      serviceTypes: [],
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
      message: '',
      totalPrice: 0
    })
    setStep(1)
    setSubmitSuccess(false)
    setSubmitError('')
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || date > new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // Max 30 days ahead
  }

  const getServiceDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = serviceTypes.find(s => s.id === serviceId)
      return total + (service?.duration || 0)
    }, 0)
  }

  const groupedServices = serviceTypes.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, ServiceType[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Link href="/booking" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للحجز
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">حجز موعد صيانة</h1>
              <p className="text-xl text-blue-100">
                خدمات صيانة احترافية لسيارتك تاتا مع فنيين معتمدين
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 && 'المركبة'}
                    {stepNumber === 2 && 'الخدمات'}
                    {stepNumber === 3 && 'الملخص'}
                    {stepNumber === 4 && 'التاريخ'}
                    {stepNumber === 5 && 'البيانات'}
                    {stepNumber === 6 && 'تأكيد'}
                  </span>
                  {stepNumber < 6 && (
                    <div className={`w-16 h-1 mx-4 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {submitSuccess ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">تم حجز موعد الصيانة بنجاح!</h2>
                <p className="text-gray-600 mb-6">
                  شكراً لحجزك موعد صيانة مع الحمد للسيارات. تم إرسال تأكيد الحجز عبر البريد الإلكتروني.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right max-w-md mx-auto">
                  <h3 className="font-semibold mb-2">تفاصيل الحجز:</h3>
                  <p><strong>المركبة:</strong> {selectedVehicle?.make} {selectedVehicle?.model}</p>
                  <p><strong>الخدمات:</strong> {selectedServices.length} خدمة مختارة</p>
                  <p><strong>التاريخ:</strong> {selectedDate && format(selectedDate, 'PPP')}</p>
                  <p><strong>الوقت:</strong> {selectedTimeSlot}</p>
                  <p><strong>المدة:</strong> {getServiceDuration()} دقيقة</p>
                  <p><strong>التكلفة الإجمالية:</strong> {formData.totalPrice.toLocaleString()} جنيه</p>
                  <p><strong>الاسم:</strong> {formData.customerInfo.name}</p>
                  <p><strong>البريد الإلكتروني:</strong> {formData.customerInfo.email}</p>
                  <p><strong>الهاتف:</strong> {formData.customerInfo.phone}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                  <MapPin className="h-4 w-4" />
                  <span>مركز الخدمة: القاهرة، مصر</span>
                </div>
                <Button onClick={resetForm} size="lg">
                  حجز خدمة أخرى
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Vehicle Selection */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">اختر مركبتك</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehicles.map((vehicle) => (
                        <Card 
                          key={vehicle.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedVehicle?.id === vehicle.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Car className="h-8 w-8 text-blue-600" />
                              <div>
                                <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                                <p className="text-sm text-gray-600">{vehicle.year}</p>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><strong>رقم اللوحة:</strong> {vehicle.licensePlate}</p>
                              <p><strong>الشاصي:</strong> {vehicle.vin}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Card className="cursor-pointer transition-all hover:shadow-md border-dashed border-2">
                        <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
                          <Car className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">إضافة مركبة جديدة</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 2: Service Selection */}
                {step === 2 && selectedVehicle && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">اختر الخدمات</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Car className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{selectedVehicle.make} {selectedVehicle.model}</h3>
                              <p className="text-sm text-gray-600">{selectedVehicle.year} • {selectedVehicle.licensePlate}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-6">
                      {Object.entries(groupedServices).map(([category, services]) => (
                        <div key={category}>
                          <h3 className="text-lg font-semibold mb-3">{category}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {services.map((service) => (
                              <Card 
                                key={service.id} 
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  selectedServices.includes(service.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleServiceToggle(service.id, !selectedServices.includes(service.id))}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <Checkbox
                                        checked={selectedServices.includes(service.id)}
                                        onChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                                      />
                                      <div className="flex-1">
                                        <h4 className="font-semibold">{service.name}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {service.duration} دقيقة
                                          </span>
                                          {service.price && (
                                            <span className="font-semibold text-blue-600">
                                              {service.price.toLocaleString()} جنيه
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">الخدمات المختارة:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formData.totalPrice.toLocaleString()} جنيه
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          المدة الإجمالية: {getServiceDuration()} دقيقة
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        السابق
                      </Button>
                      <Button 
                        type="button" 
                        disabled={selectedServices.length === 0}
                        onClick={() => setStep(3)}
                        className="flex-1"
                      >
                        التالي
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Service Summary */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">ملخص الخدمات</h2>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">معلومات المركبة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">الماركة والموديل</Label>
                              <p className="font-medium">{selectedVehicle?.make} {selectedVehicle?.model}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">السنة</Label>
                              <p className="font-medium">{selectedVehicle?.year}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">رقم اللوحة</Label>
                              <Input
                                value={formData.vehicleInfo.licensePlate}
                                onChange={(e) => handleVehicleInfoChange('licensePlate', e.target.value)}
                                placeholder="أدخل رقم اللوحة"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">المسافة المقطوعة</Label>
                              <Input
                                type="number"
                                value={formData.vehicleInfo.mileage}
                                onChange={(e) => handleVehicleInfoChange('mileage', e.target.value)}
                                placeholder="أدخل المسافة المقطوعة"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">الخدمات المختارة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedServices.map(serviceId => {
                              const service = serviceTypes.find(s => s.id === serviceId)
                              return service ? (
                                <div key={serviceId} className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-gray-600">{service.duration} دقيقة</p>
                                  </div>
                                  <span className="font-semibold">{service.price?.toLocaleString()} جنيه</span>
                                </div>
                              ) : null
                            })}
                          </div>
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">المدة الإجمالية:</span>
                              <span>{getServiceDuration()} دقيقة</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-semibold text-lg">التكلفة الإجمالية:</span>
                              <span className="font-bold text-xl text-blue-600">
                                {formData.totalPrice.toLocaleString()} جنيه
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        السابق
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep(4)}
                        className="flex-1"
                      >
                        اختيار التاريخ
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Date Selection */}
                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">اختر التاريخ</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Car className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{selectedVehicle?.make} {selectedVehicle?.model}</h3>
                              <p className="text-sm text-gray-600">
                                {selectedServices.length} خدمات • {getServiceDuration()} دقيقة
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={isDateDisabled}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <p>الحد الأقصى 30 يوم مقدماً. ساعات العمل: 8:00 ص - 6:00 م</p>
                    </div>
                  </div>
                )}

                {/* Step 5: Customer Information */}
                {step === 5 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">معلوماتك</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Car className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{selectedVehicle?.make} {selectedVehicle?.model}</h3>
                              <p className="text-sm text-gray-600">
                                {selectedDate && format(selectedDate, 'PPP')} الساعة {selectedTimeSlot}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">الاسم الكامل *</Label>
                          <Input
                            id="name"
                            value={formData.customerInfo.name}
                            onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">البريد الإلكتروني *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.customerInfo.email}
                            onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">رقم الهاتف *</Label>
                          <Input
                            id="phone"
                            value={formData.customerInfo.phone}
                            onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeSlot">الوقت المفضل</Label>
                          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الوقت" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTimeSlots.map((slot) => (
                                <SelectItem 
                                  key={slot.time} 
                                  value={slot.time}
                                  disabled={!slot.available}
                                >
                                  {slot.time} {!slot.available && '(محجوز)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message">ملاحظات إضافية</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="أي مشاكل محددة أو متطلبات..."
                          rows={3}
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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-700">
                            مركز الخدمة: القاهرة، مصر. يرجى الحضور 10 دقائق قبل الموعد.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(4)}>
                          السابق
                        </Button>
                        <Button type="submit" disabled={loading || !selectedTimeSlot} className="flex-1">
                          {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}