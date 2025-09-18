'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  Car, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  Mail,
  Phone
} from 'lucide-react'
import { TestDriveBookingService, ServiceBookingService, BookingStatus } from '@/lib/firestore'

interface Booking {
  id: string
  type: 'test-drive' | 'service'
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleName?: string
  serviceName?: string
  date: any // Firestore Timestamp
  timeSlot: string
  status: BookingStatus
  notes?: string
  createdAt: any // Firestore Timestamp
}

export default function AdminAppointmentsPage() {
  const [testDriveBookings, setTestDriveBookings] = useState<Booking[]>([])
  const [serviceBookings, setServiceBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('test-drive')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      // Load test drive bookings
      const testDriveData = await TestDriveBookingService.getUserBookings('dummy') // This should be modified to get all bookings
      // For now, we'll use mock data
      setTestDriveBookings([
        {
          id: '1',
          type: 'test-drive',
          customerName: 'Ahmed Mohamed',
          customerEmail: 'ahmed@email.com',
          customerPhone: '+20 123 456 7890',
          vehicleName: 'Tata Nexon',
          date: { toDate: () => new Date('2024-01-20') },
          timeSlot: '14:00',
          status: BookingStatus.PENDING,
          notes: 'Interested in automatic transmission',
          createdAt: { toDate: () => new Date('2024-01-15') }
        },
        {
          id: '2',
          type: 'test-drive',
          customerName: 'Sara Ali',
          customerEmail: 'sara@email.com',
          customerPhone: '+20 987 654 3210',
          vehicleName: 'Tata Punch',
          date: { toDate: () => new Date('2024-01-21') },
          timeSlot: '10:00',
          status: BookingStatus.CONFIRMED,
          createdAt: { toDate: () => new Date('2024-01-16') }
        }
      ] as Booking[])

      // Load service bookings
      setServiceBookings([
        {
          id: '3',
          type: 'service',
          customerName: 'Mahmoud Hassan',
          customerEmail: 'mahmoud@email.com',
          customerPhone: '+20 555 123 4567',
          serviceName: 'Full Service',
          date: { toDate: () => new Date('2024-01-22') },
          timeSlot: '09:00',
          status: BookingStatus.PENDING,
          notes: 'Regular maintenance check',
          createdAt: { toDate: () => new Date('2024-01-17') }
        },
        {
          id: '4',
          type: 'service',
          customerName: 'Fatima Ahmed',
          customerEmail: 'fatima@email.com',
          customerPhone: '+20 444 555 6666',
          serviceName: 'Oil Change',
          date: { toDate: () => new Date('2024-01-23') },
          timeSlot: '11:00',
          status: BookingStatus.COMPLETED,
          createdAt: { toDate: () => new Date('2024-01-18') }
        }
      ] as Booking[])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, type: 'test-drive' | 'service', status: BookingStatus) => {
    try {
      if (type === 'test-drive') {
        await TestDriveBookingService.updateBookingStatus(bookingId, status)
      } else {
        await ServiceBookingService.updateBookingStatus(bookingId, status)
      }
      await loadBookings()
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case BookingStatus.CONFIRMED:
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case BookingStatus.COMPLETED:
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case BookingStatus.CANCELLED:
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case BookingStatus.NO_SHOW:
        return <Badge className="bg-blue-600"><AlertCircle className="h-3 w-3 mr-1" />No Show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filterBookings = (bookings: Booking[]) => {
    return bookings.filter(booking => {
      const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (booking.vehicleName && booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (booking.serviceName && booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }

  const filteredTestDriveBookings = filterBookings(testDriveBookings)
  const filteredServiceBookings = filterBookings(serviceBookings)

  const BookingTable = ({ bookings, type }: { bookings: Booking[]; type: 'test-drive' | 'service' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>{type === 'test-drive' ? 'Vehicle' : 'Service'}</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>
              <div>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-gray-500">{booking.customerEmail}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{booking.customerPhone}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {type === 'test-drive' ? (
                  <Car className="h-4 w-4 text-blue-600" />
                ) : (
                  <Wrench className="h-4 w-4 text-green-600" />
                )}
                <span>{booking.vehicleName || booking.serviceName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm">
                  {booking.date.toDate().toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">{booking.timeSlot}</p>
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(booking.status)}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {booking.status === BookingStatus.PENDING && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, type, BookingStatus.CONFIRMED)}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateBookingStatus(booking.id, type, BookingStatus.CANCELLED)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === BookingStatus.CONFIRMED && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateBookingStatus(booking.id, type, BookingStatus.COMPLETED)}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBookingStatus(booking.id, type, BookingStatus.NO_SHOW)}
                    >
                      No Show
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600">Manage test drive and service bookings</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testDriveBookings.length + serviceBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {testDriveBookings.filter(b => b.status === BookingStatus.PENDING).length +
               serviceBookings.filter(b => b.status === BookingStatus.PENDING).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {testDriveBookings.filter(b => b.status === BookingStatus.CONFIRMED).length +
               serviceBookings.filter(b => b.status === BookingStatus.CONFIRMED).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {testDriveBookings.filter(b => b.status === BookingStatus.COMPLETED).length +
               serviceBookings.filter(b => b.status === BookingStatus.COMPLETED).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="test-drive">
            Test Drives ({filteredTestDriveBookings.length})
          </TabsTrigger>
          <TabsTrigger value="service">
            Service Bookings ({filteredServiceBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-drive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Drive Bookings</CardTitle>
              <CardDescription>
                Manage customer test drive appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <BookingTable bookings={filteredTestDriveBookings} type="test-drive" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Bookings</CardTitle>
              <CardDescription>
                Manage vehicle service and maintenance appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <BookingTable bookings={filteredServiceBookings} type="service" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}