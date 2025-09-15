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
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'

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

export default function ServiceBookingPage() {
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
        make: 'Tata',
        model: 'Nexon',
        year: 2022,
        licensePlate: 'ABC123',
        vin: 'MAT625487K1L5B4321'
      },
      {
        id: '2',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        licensePlate: 'XYZ789',
        vin: 'JTMBHREV3MJ123456'
      }
    ]
    setVehicles(mockVehicles)

    // Mock service types
    const mockServiceTypes: ServiceType[] = [
      {
        id: '1',
        name: 'Basic Oil Change',
        description: 'Standard oil change with filter replacement',
        duration: 30,
        price: 350,
        category: 'MAINTENANCE'
      },
      {
        id: '2',
        name: 'Full Service',
        description: 'Comprehensive vehicle maintenance check',
        duration: 120,
        price: 1200,
        category: 'MAINTENANCE'
      },
      {
        id: '3',
        name: 'Brake Inspection',
        description: 'Complete brake system check and maintenance',
        duration: 60,
        price: 450,
        category: 'INSPECTION'
      },
      {
        id: '4',
        name: 'Air Conditioning Service',
        description: 'AC system check and refrigerant recharge',
        duration: 45,
        price: 600,
        category: 'REPAIR'
      },
      {
        id: '5',
        name: 'Wheel Alignment',
        description: 'Precision wheel alignment and balancing',
        duration: 60,
        price: 300,
        category: 'MAINTENANCE'
      },
      {
        id: '6',
        name: 'Car Detailing',
        description: 'Complete interior and exterior cleaning',
        duration: 180,
        price: 800,
        category: 'DETAILING'
      },
      {
        id: '7',
        name: 'Battery Check',
        description: 'Battery health check and replacement if needed',
        duration: 30,
        price: 200,
        category: 'INSPECTION'
      },
      {
        id: '8',
        name: 'Engine Diagnostic',
        description: 'Complete engine computer diagnostic scan',
        duration: 60,
        price: 400,
        category: 'INSPECTION'
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
      setSubmitError('Failed to book service. Please try again.')
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
                    {stepNumber === 1 && 'Vehicle'}
                    {stepNumber === 2 && 'Services'}
                    {stepNumber === 3 && 'Summary'}
                    {stepNumber === 4 && 'Date'}
                    {stepNumber === 5 && 'Details'}
                    {stepNumber === 6 && 'Confirm'}
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
                <h2 className="text-2xl font-bold mb-4">Service Appointment Booked Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for booking a service appointment with Al-Hamd Cars. We have sent a confirmation email with all the details.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold mb-2">Appointment Details:</h3>
                  <p><strong>Vehicle:</strong> {selectedVehicle?.make} {selectedVehicle?.model}</p>
                  <p><strong>Services:</strong> {selectedServices.length} selected</p>
                  <p><strong>Date:</strong> {selectedDate && format(selectedDate, 'PPP')}</p>
                  <p><strong>Time:</strong> {selectedTimeSlot}</p>
                  <p><strong>Duration:</strong> {getServiceDuration()} minutes</p>
                  <p><strong>Total Cost:</strong> EGP {formData.totalPrice.toLocaleString()}</p>
                  <p><strong>Name:</strong> {formData.customerInfo.name}</p>
                  <p><strong>Email:</strong> {formData.customerInfo.email}</p>
                  <p><strong>Phone:</strong> {formData.customerInfo.phone}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                  <MapPin className="h-4 w-4" />
                  <span>Service Center Location: Cairo, Egypt</span>
                </div>
                <Button onClick={resetForm} size="lg">
                  Book Another Service
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
                              <p><strong>License:</strong> {vehicle.licensePlate}</p>
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
                          <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
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
                                            {service.duration} min
                                          </span>
                                          {service.price && (
                                            <span className="font-semibold text-blue-600">
                                              EGP {service.price.toLocaleString()}
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
                          <span className="font-semibold">الخدمات المحددة:</span>
                          <span className="text-lg font-bold text-blue-600">
                            EGP {formData.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Duration: {getServiceDuration()} minutes
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        disabled={selectedServices.length === 0}
                        onClick={() => setStep(3)}
                        className="flex-1"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Service Summary */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Service Summary</h2>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Vehicle Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">Make & Model</Label>
                              <p className="font-medium">{selectedVehicle?.make} {selectedVehicle?.model}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Year</Label>
                              <p className="font-medium">{selectedVehicle?.year}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">License Plate</Label>
                              <Input
                                value={formData.vehicleInfo.licensePlate}
                                onChange={(e) => handleVehicleInfoChange('licensePlate', e.target.value)}
                                placeholder="Enter license plate"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Current Mileage</Label>
                              <Input
                                type="number"
                                value={formData.vehicleInfo.mileage}
                                onChange={(e) => handleVehicleInfoChange('mileage', e.target.value)}
                                placeholder="Enter mileage"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">الخدمات المحددة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedServices.map(serviceId => {
                              const service = serviceTypes.find(s => s.id === serviceId)
                              return service ? (
                                <div key={serviceId} className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-gray-600">{service.duration} minutes</p>
                                  </div>
                                  <span className="font-semibold">EGP {service.price?.toLocaleString()}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total Duration:</span>
                              <span>{getServiceDuration()} minutes</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-semibold text-lg">Total Cost:</span>
                              <span className="font-bold text-xl text-blue-600">
                                EGP {formData.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep(4)}
                        className="flex-1"
                      >
                        Continue to Date Selection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Date Selection */}
                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Select Date</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Car className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{selectedVehicle?.make} {selectedVehicle?.model}</h3>
                              <p className="text-sm text-gray-600">
                                {selectedServices.length} services • {getServiceDuration()} minutes
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
                      <p>Maximum 30 days in advance. Service hours: 8:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                )}

                {/* Step 5: Customer Information */}
                {step === 5 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Your Information</h2>
                    <div className="mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Car className="h-8 w-8 text-blue-600" />
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
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.customerInfo.name}
                            onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.customerInfo.email}
                            onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.customerInfo.phone}
                            onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeSlot">Preferred Time</Label>
                          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTimeSlots.map((slot) => (
                                <SelectItem 
                                  key={slot.time} 
                                  value={slot.time}
                                  disabled={!slot.available}
                                >
                                  {slot.time} {!slot.available && '(Booked)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message">Additional Notes</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Any specific issues or requirements..."
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
                            Service Center: Cairo, Egypt. Please arrive 10 minutes before your appointment.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(4)}>
                          Back
                        </Button>
                        <Button type="submit" disabled={loading || !selectedTimeSlot} className="flex-1">
                          {loading ? 'Booking...' : 'Confirm Appointment'}
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