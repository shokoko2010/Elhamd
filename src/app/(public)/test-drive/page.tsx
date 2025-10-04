'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon, 
  Car, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { bookingSchemas, validationUtils } from '@/lib/validation'
import { useFormValidation } from '@/hooks/use-form-validation'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  category: string
  fuelType: string
  transmission: string
  color: string
  images: { imageUrl: string; isPrimary: boolean }[]
}

interface TimeSlot {
  time: string
  available: boolean
}

interface BookingFormData {
  vehicleId: string
  date: Date | undefined
  timeSlot: string
  customerInfo: {
    name: string
    email: string
    phone: string
    licenseNumber: string
  }
  message: string
}

export default function TestDrivePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    date: new Date(),
    timeSlot: '',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      licenseNumber: ''
    },
    message: ''
  })
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Form validation
  const formValidation = useFormValidation({
    schema: bookingSchemas.testDrive,
    initialValues: {
      vehicleId: '',
      date: new Date(),
      timeSlot: '',
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        licenseNumber: ''
      },
      message: ''
    },
    onSubmit: async (data) => {
      setLoading(true)
      setSubmitError('')
      
      try {
        const response = await fetch('/api/bookings/test-drive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'فشل في حجز تجربة القيادة')
        }

        setSubmitSuccess(true)
        setStep(5)
      } catch (error) {
        throw error
      } finally {
        setLoading(false)
      }
    }
  })

  useEffect(() => {
    // Fetch vehicles from API
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?featured=true&limit=12')
        const data = await response.json()
        if (data.vehicles) {
          setVehicles(data.vehicles)
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        // Show error message instead of using mock data
        toast.error('فشل في تحميل المركبات. يرجى المحاولة مرة أخرى لاحقاً.')
        setVehicles([])
      }
    }
    
    fetchVehicles()
  }, [])

  useEffect(() => {
    if (selectedDate && selectedVehicle) {
      // Fetch available time slots from API
      const fetchTimeSlots = async () => {
        try {
          const response = await fetch('/api/availability/test-drive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vehicleId: selectedVehicle.id,
              date: selectedDate.toISOString().split('T')[0]
            })
          })
          const data = await response.json()
          if (data.availableTimeSlots) {
            setAvailableTimeSlots(data.availableTimeSlots)
          }
        } catch (error) {
          console.error('Error fetching time slots:', error)
          // Show error message instead of using mock data
          toast.error('فشل في تحميل الأوقات المتاحة. يرجى المحاولة مرة أخرى.')
          setAvailableTimeSlots([])
        }
      }
      
      fetchTimeSlots()
    }
  }, [selectedDate, selectedVehicle])

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    formValidation.setFieldValue('vehicleId', vehicle.id)
    setStep(2)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    formValidation.setFieldValue('date', date)
    if (date) {
      setStep(3)
    }
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    formValidation.setFieldValue('timeSlot', timeSlot)
    setStep(4)
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [field]: value }
    }))
    formValidation.setFieldValue(`customerInfo.${field}` as any, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await formValidation.handleSubmit(e)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'فشل في حجز تجربة القيادة. يرجى المحاولة مرة أخرى.')
    }
  }

  const resetForm = () => {
    setSelectedVehicle(null)
    setSelectedDate(undefined)
    setSelectedTimeSlot('')
    setFormData({
      vehicleId: '',
      date: new Date(),
      timeSlot: '',
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        licenseNumber: ''
      },
      message: ''
    })
    formValidation.reset()
    setStep(1)
    setSubmitSuccess(false)
    setSubmitError('')
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || date > new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // Max 30 days ahead
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">حجز تجربة قيادة</h1>
            <p className="text-xl text-blue-100">
              جرب بنفسك سيارتك المفضلة من تاتا
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-0">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${
                    step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 && 'المركبة'}
                    {stepNumber === 2 && 'التاريخ'}
                    {stepNumber === 3 && 'الوقت'}
                    {stepNumber === 4 && 'التفاصيل'}
                    {stepNumber === 5 && 'تأكيد'}
                  </span>
                  {stepNumber < 5 && (
                    <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-4 ${
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
                <h2 className="text-2xl font-bold mb-4">تم حجز تجربة القيادة بنجاح!</h2>
                <p className="text-gray-600 mb-6">
                  شكراً لحجزك تجربة قيادة مع شركة الحمد للسيارات. لقد أرسلنا بريداً إلكترونياً للتأكيد يحتوي على جميع التفاصيل.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
                  <h3 className="font-semibold mb-2">تفاصيل الحجز:</h3>
                  <p><strong>المركبة:</strong> {selectedVehicle?.make} {selectedVehicle?.model}</p>
                  <p><strong>التاريخ:</strong> {selectedDate && format(selectedDate, 'PPP')}</p>
                  <p><strong>الوقت:</strong> {selectedTimeSlot}</p>
                  <p><strong>الاسم:</strong> {formData.customerInfo.name}</p>
                  <p><strong>البريد الإلكتروني:</strong> {formData.customerInfo.email}</p>
                  <p><strong>الهاتف:</strong> {formData.customerInfo.phone}</p>
                </div>
                <Button onClick={resetForm} size="lg">
                  حجز تجربة قيادة أخرى
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Vehicle Selection */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">اختر مركبة</h2>
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
                            <div className="h-32 bg-gray-200 rounded-lg mb-4">
                              <img
                                src={vehicle.images[0]?.imageUrl || '/uploads/vehicles/1/nexon-front-new.jpg'}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.category}</p>
                            <div className="flex gap-1 mt-2">
                              <Badge variant="secondary" className="text-xs">{vehicle.fuelType}</Badge>
                              <Badge variant="secondary" className="text-xs">{vehicle.transmission}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Date Selection */}
                {step === 2 && selectedVehicle && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">اختر التاريخ</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 bg-gray-200 rounded-lg">
                              <img
                                src={selectedVehicle.images[0]?.imageUrl || '/api/placeholder/400/300'}
                                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">{selectedVehicle.make} {selectedVehicle.model}</h3>
                              <p className="text-sm text-gray-600">{selectedVehicle.year} • {selectedVehicle.category}</p>
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
                        modifiers={{
                          weekend: isWeekend
                        }}
                        modifiersStyles={{
                          weekend: { color: '#ef4444' }
                        }}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <p>عطلة نهاية الأسبوع موضحة باللون الأحمر. الحد الأقصى 30 يوماً مقدماً.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Time Slot Selection */}
                {step === 3 && selectedDate && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">اختر الوقت</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 bg-gray-200 rounded-lg">
                              <img
                                src={selectedVehicle?.images[0]?.imageUrl || '/api/placeholder/400/300'}
                                alt={`${selectedVehicle?.make} ${selectedVehicle?.model}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">{selectedVehicle?.make} {selectedVehicle?.model}</h3>
                              <p className="text-sm text-gray-600">
                                {selectedDate && format(selectedDate, 'PPP')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableTimeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                          className="h-12"
                          disabled={!slot.available}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {slot.time}
                          {!slot.available && (
                            <span className="ml-2 text-xs text-red-500">(محجوز)</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Customer Information */}
                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">معلوماتك</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 bg-gray-200 rounded-lg">
                              <img
                                src={selectedVehicle?.images[0]?.imageUrl || '/api/placeholder/400/300'}
                                alt={`${selectedVehicle?.make} ${selectedVehicle?.model}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">{selectedVehicle?.make} {selectedVehicle?.model}</h3>
                              <p className="text-sm text-gray-600">
                                {selectedDate && format(selectedDate, 'PPP')} at {selectedTimeSlot}
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
                          <Label htmlFor="license">رقم رخصة القيادة *</Label>
                          <Input
                            id="license"
                            value={formData.customerInfo.licenseNumber}
                            onChange={(e) => handleCustomerInfoChange('licenseNumber', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message">ملاحظات إضافية</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="أي متطلبات أو أسئلة محددة..."
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
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(3)}>
                          رجوع
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
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