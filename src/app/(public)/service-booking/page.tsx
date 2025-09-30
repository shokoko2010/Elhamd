'use client'

import { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
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
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [calendarLoading, setCalendarLoading] = useState(false)

  useEffect(() => {
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
        toast.error('فشل في تحميل المركبات. يرجى المحاولة مرة أخرى لاحقاً.')
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
        toast.error('فشل في تحميل أنواع الخدمات. يرجى المحاولة مرة أخرى لاحقاً.')
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
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">حجز موعد خدمة</h1>
            <p className="text-xl text-blue-100">
              خدمات صيانة وإصلاح احترافية لمركبتك
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center flex-wrap">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
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
                    {stepNumber === 2 && 'الخدمة'}
                    {stepNumber === 3 && 'الموعد'}
                    {stepNumber === 4 && 'البيانات'}
                    {stepNumber === 5 && 'التأكيد'}
                  </span>
                  {stepNumber < 5 && (
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
                <h2 className="text-2xl font-bold mb-4">تم حجز الخدمة بنجاح!</h2>
                <p className="text-gray-600 mb-6">
                  شكراً لحجزك مع الحمد للسيارات. تم إرسال تأكيد الحجز على بريدك الإلكتروني.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right max-w-md mx-auto">
                  <h3 className="font-semibold mb-2">تفاصيل الحجز:</h3>
                  <p><strong>المركبة:</strong> {selectedVehicle?.make} {selectedVehicle?.model}</p>
                  <p><strong>الخدمة:</strong> {getSelectedService()?.name}</p>
                  <p><strong>التاريخ:</strong> {selectedDate && format(selectedDate, 'PPP', { locale: ar })}</p>
                  <p><strong>الوقت:</strong> {formData.timeSlot}</p>
                  <p><strong>المدة:</strong> {getSelectedService()?.duration} دقيقة</p>
                  <p><strong>التكلفة:</strong> {formData.totalPrice.toLocaleString()} ج.م</p>
                  <p><strong>الاسم:</strong> {formData.customerInfo.name}</p>
                  <p><strong>البريد:</strong> {formData.customerInfo.email}</p>
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
                              <p><strong>VIN:</strong> {vehicle.vin}</p>
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">اختر الخدمة</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(1)}
                      >
                        السابق
                      </Button>
                    </div>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {serviceTypes.map((service) => (
                        <Card 
                          key={service.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedService === service.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={selectedService === service.id}
                                  onCheckedChange={(checked) => {
                                    if (checked) handleServiceSelect(service.id)
                                  }}
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
                                        {service.price.toLocaleString()} ج.م
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
                )}

                {/* Step 3: Calendar & Time Slot Selection */}
                {step === 3 && selectedVehicle && selectedService && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">اختر الموعد</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(2)}
                      >
                        السابق
                      </Button>
                    </div>
                    
                    {calendarLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="mr-2">جاري تحميل التقويم...</span>
                      </div>
                    ) : (
                      <BookingCalendar
                        bookings={calendarData.bookings}
                        timeSlots={calendarData.timeSlots}
                        holidays={calendarData.holidays}
                        onDateSelect={handleDateSelect}
                        selectedDate={selectedDate}
                        selectedTimeSlot={selectedTimeSlot}
                      />
                    )}
                  </div>
                )}

                {/* Step 4: Customer Information */}
                {step === 4 && selectedVehicle && selectedService && selectedDate && selectedTimeSlot && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">معلومات العميل</h2>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep(3)}
                      >
                        السابق
                      </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Booking Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle>ملخص الحجز</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">المركبة</Label>
                              <p className="text-lg">{selectedVehicle.make} {selectedVehicle.model}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">الخدمة</Label>
                              <p className="text-lg">{getSelectedService()?.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">التاريخ</Label>
                              <p className="text-lg">{format(selectedDate, 'PPP', { locale: ar })}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">الوقت</Label>
                              <p className="text-lg">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>معلومات العميل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">الاسم الكامل *</Label>
                              <Input
                                id="name"
                                type="text"
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
                          </div>
                          <div>
                            <Label htmlFor="phone">رقم الهاتف *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.customerInfo.phone}
                              onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                              required
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Vehicle Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>معلومات المركبة الإضافية</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="mileage">المسافة المقطوعة (كم)</Label>
                              <Input
                                id="mileage"
                                type="number"
                                value={formData.vehicleInfo.mileage}
                                onChange={(e) => handleVehicleInfoChange('mileage', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="notes">ملاحظات إضافية</Label>
                              <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="أي ملاحظات إضافية عن الخدمة المطلوبة..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Total Price */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">الإجمالي:</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {formData.totalPrice.toLocaleString()} ج.م
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {submitError && (
                        <Card className="border-red-200 bg-red-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-800">
                              <AlertCircle className="h-5 w-5" />
                              <span>{submitError}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          size="lg" 
                          disabled={loading || !formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.phone}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              جاري الحجز...
                            </>
                          ) : (
                            'تأكيد الحجز'
                          )}
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