'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CalendarDays, 
  Car, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface Booking {
  id: string
  type: 'test_drive' | 'service'
  status: string
  date: string
  timeSlot: string
  notes?: string
  totalPrice?: number
  paymentStatus?: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  vehicle?: {
    id: string
    make: string
    model: string
    year: number
    stockNumber: string
    vin?: string
    color?: string
    mileage?: number
    images: Array<{
      id: string
      imageUrl: string
      isPrimary: boolean
    }>
  }
  serviceType?: {
    id: string
    name: string
    description?: string
    duration: number
    price?: number
    category: string
  }
  payments?: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
    transactionId?: string
    createdAt: string
  }>
}

interface TimelineEvent {
  id: string
  type: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'payment'
  title: string
  description: string
  timestamp: string
  status: string
}

export default function BookingDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const bookingId = params.id as string

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && bookingId) {
      fetchBookingDetails()
    }
  }, [status, router, bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/dashboard/bookings/${bookingId}`)
      if (response.ok) {
        const bookingData = await response.json()
        setBooking(bookingData)
        generateTimeline(bookingData)
      } else {
        throw new Error('Failed to fetch booking details')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load booking details',
        variant: 'destructive'
      })
      router.push('/dashboard/bookings')
    } finally {
      setLoading(false)
    }
  }

  const generateTimeline = (bookingData: Booking) => {
    const events: TimelineEvent[] = []

    // Booking created
    events.push({
      id: 'created',
      type: 'created',
      title: 'Booking Created',
      description: `Your ${bookingData.type === 'test_drive' ? 'test drive' : 'service'} booking was created`,
      timestamp: bookingData.createdAt,
      status: 'completed'
    })

    // Status changes
    if (bookingData.status === 'CONFIRMED') {
      events.push({
        id: 'confirmed',
        type: 'confirmed',
        title: 'Booking Confirmed',
        description: 'Your booking has been confirmed by our team',
        timestamp: bookingData.updatedAt,
        status: 'completed'
      })
    }

    if (bookingData.status === 'CANCELLED') {
      events.push({
        id: 'cancelled',
        type: 'cancelled',
        title: 'Booking Cancelled',
        description: 'This booking has been cancelled',
        timestamp: bookingData.updatedAt,
        status: 'cancelled'
      })
    }

    if (bookingData.status === 'COMPLETED') {
      events.push({
        id: 'completed',
        type: 'completed',
        title: 'Booking Completed',
        description: 'Your booking has been completed successfully',
        timestamp: bookingData.updatedAt,
        status: 'completed'
      })
    }

    if (bookingData.status === 'NO_SHOW') {
      events.push({
        id: 'no_show',
        type: 'no_show',
        title: 'No Show',
        description: 'The booking was marked as no show',
        timestamp: bookingData.updatedAt,
        status: 'cancelled'
      })
    }

    // Payment events
    if (bookingData.payments && bookingData.payments.length > 0) {
      bookingData.payments.forEach(payment => {
        events.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          title: `Payment ${payment.status === 'COMPLETED' ? 'Received' : payment.status}`,
          description: `Payment of EGP ${payment.amount} via ${payment.paymentMethod}`,
          timestamp: payment.createdAt,
          status: payment.status === 'COMPLETED' ? 'completed' : 'pending'
        })
      })
    }

    // Sort by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    setTimeline(events)
  }

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      setCancelling(true)
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Booking cancelled successfully'
        })
        fetchBookingDetails()
      } else {
        throw new Error('Failed to cancel booking')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive'
      })
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary', label: 'Pending', icon: Clock },
      CONFIRMED: { variant: 'default', label: 'Confirmed', icon: CheckCircle },
      COMPLETED: { variant: 'outline', label: 'Completed', icon: CheckCircle },
      CANCELLED: { variant: 'destructive', label: 'Cancelled', icon: XCircle },
      NO_SHOW: { variant: 'destructive', label: 'No Show', icon: AlertTriangle }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', label: status, icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null

    const statusConfig = {
      PENDING: { variant: 'secondary', label: 'Payment Pending' },
      COMPLETED: { variant: 'default', label: 'Paid' },
      FAILED: { variant: 'destructive', label: 'Payment Failed' },
      REFUNDED: { variant: 'outline', label: 'Refunded' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' }
    } as const

    const config = statusConfig[paymentStatus as keyof typeof statusConfig]

    return config ? (
      <Badge variant={config.variant as any} className="ml-2">
        {config.label}
      </Badge>
    ) : null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <Button onClick={() => router.push('/dashboard/bookings')}>
            Back to Bookings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push('/dashboard/bookings')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {booking.type === 'test_drive' ? 'Test Drive Booking' : 'Service Booking'}
                  </CardTitle>
                  <CardDescription>
                    Created on {formatDate(booking.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-gray-600">
                        {formatDate(booking.date)} at {booking.timeSlot}
                      </p>
                    </div>
                  </div>
                  
                  {booking.vehicle && (
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Vehicle</p>
                        <p className="text-gray-600">
                          {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {booking.vehicle.stockNumber}
                          {booking.vehicle.vin && ` • VIN: ${booking.vehicle.vin}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {booking.serviceType && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Service Type</p>
                        <p className="text-gray-600">{booking.serviceType.name}</p>
                        <p className="text-sm text-gray-500">
                          Duration: {booking.serviceType.duration} minutes
                          {booking.serviceType.price && ` • EGP ${booking.serviceType.price}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Total Price</p>
                      <p className="text-gray-600">
                        {booking.totalPrice ? `EGP ${booking.totalPrice.toLocaleString()}` : 'Free'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-gray-600">
                        {formatDateTime(booking.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {booking.notes && (
                <div className="mt-6">
                  <p className="font-medium mb-2">Notes</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {booking.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Timeline</CardTitle>
              <CardDescription>
                Track the progress of your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.status === 'completed' ? 'bg-green-500' : 
                        event.status === 'cancelled' ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }`}></div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-medium">
                    {booking.customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{booking.customer.name}</p>
                  <p className="text-sm text-gray-600">{booking.customer.email}</p>
                </div>
              </div>
              
              {booking.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{booking.customer.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{booking.customer.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              )}
              
              {booking.type === 'test_drive' && booking.status === 'CONFIRMED' && (
                <Button variant="outline" className="w-full">
                  Reschedule
                </Button>
              )}
              
              {booking.totalPrice && booking.paymentStatus !== 'COMPLETED' && (
                <Button className="w-full">
                  Pay Now
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                Download Receipt
              </Button>
              
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Vehicle Images */}
          {booking.vehicle && booking.vehicle.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {booking.vehicle.images.slice(0, 4).map((image) => (
                    <div key={image.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={image.imageUrl} 
                        alt={`${booking.vehicle?.make} ${booking.vehicle?.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}