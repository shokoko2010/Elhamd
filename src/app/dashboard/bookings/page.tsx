'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Car, Settings, Search, Filter, Eye, Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-safe'

interface Booking {
  id: string
  type: 'test_drive' | 'service'
  status: string
  date: string
  timeSlot: string
  vehicle?: {
    make: string
    model: string
    year: number
    stockNumber: string
  }
  serviceType?: {
    name: string
    duration: number
  }
  totalPrice?: number
  notes?: string
  createdAt: string
  paymentStatus?: string
}

interface Filters {
  type: 'all' | 'test_drive' | 'service'
  status: 'all' | string
  dateRange: 'all' | 'week' | 'month' | 'year'
  search: string
}

export default function BookingsManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status, router])

  useEffect(() => {
    filterBookings()
  }, [bookings, filters])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/dashboard/bookings')
      if (response.ok) {
        const bookingsData = await response.json()
        setBookings(bookingsData)
      } else {
        throw new Error('Failed to fetch bookings')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(booking => booking.type === filters.type)
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status)
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(booking => 
        new Date(booking.date) >= cutoffDate
      )
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.vehicle?.make.toLowerCase().includes(searchTerm) ||
        booking.vehicle?.model.toLowerCase().includes(searchTerm) ||
        booking.serviceType?.name.toLowerCase().includes(searchTerm) ||
        booking.id.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredBookings(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      CONFIRMED: { variant: 'default', label: 'Confirmed' },
      COMPLETED: { variant: 'outline', label: 'Completed' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
      NO_SHOW: { variant: 'destructive', label: 'No Show' }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', label: status }

    return (
      <Badge variant={config.variant as any}>
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
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Booking cancelled successfully'
        })
        fetchBookings()
      } else {
        throw new Error('Failed to cancel booking')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive'
      })
    }
  }

  const handleExportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Type', 'Vehicle', 'Service', 'Date', 'Time', 'Status', 'Price'],
      ...filteredBookings.map(booking => [
        booking.id,
        booking.type === 'test_drive' ? 'Test Drive' : 'Service',
        booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'N/A',
        booking.serviceType?.name || 'N/A',
        formatDate(booking.date),
        booking.timeSlot,
        booking.status,
        booking.totalPrice ? `EGP ${booking.totalPrice}` : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-600">Manage your test drive and service bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportBookings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchBookings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="test_drive">Test Drive</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>
            {filteredBookings.length === 0 
              ? 'No bookings found matching your filters'
              : 'Click on a booking to view details'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No bookings found</p>
              <div className="space-x-4">
                <Button onClick={() => router.push('/test-drive')}>
                  Book Test Drive
                </Button>
                <Button variant="outline" onClick={() => router.push('/service-booking')}>
                  Book Service
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {booking.type === 'test_drive' ? 'Test Drive' : 'Service Booking'}
                        </h3>
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Vehicle:</span>
                          <p className="text-gray-600">
                            {booking.vehicle 
                              ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`
                              : 'N/A'
                            }
                          </p>
                          {booking.vehicle?.stockNumber && (
                            <p className="text-gray-500">Stock: {booking.vehicle.stockNumber}</p>
                          )}
                        </div>
                        
                        <div>
                          <span className="font-medium">Service:</span>
                          <p className="text-gray-600">
                            {booking.serviceType?.name || 'N/A'}
                          </p>
                          {booking.serviceType?.duration && (
                            <p className="text-gray-500">Duration: {booking.serviceType.duration} minutes</p>
                          )}
                        </div>
                        
                        <div>
                          <span className="font-medium">Date & Time:</span>
                          <p className="text-gray-600">
                            {formatDate(booking.date)} at {booking.timeSlot}
                          </p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Price:</span>
                          <p className="text-gray-600">
                            {booking.totalPrice ? `EGP ${booking.totalPrice.toLocaleString()}` : 'Free'}
                          </p>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-4">
                          <span className="font-medium">Notes:</span>
                          <p className="text-gray-600 text-sm mt-1">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}