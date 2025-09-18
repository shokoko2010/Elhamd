'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  CalendarDays, 
  Car, 
  Settings, 
  Bell, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  TrendingUp,
  Target,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  Activity,
  ClipboardList
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import TaskManagement from '@/components/employee/EnhancedTaskManagement'

interface EmployeeStats {
  totalBookings: number
  todayBookings: number
  completedBookings: number
  pendingBookings: number
  customerSatisfaction: number
  averageResponseTime: number
}

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate: string
  assignedBy: string
  customer?: {
    name: string
    email: string
    phone: string
  }
  booking?: {
    id: string
    type: string
    date: string
    timeSlot: string
  }
}

interface Appointment {
  id: string
  type: 'test_drive' | 'service'
  customerName: string
  customerPhone: string
  customerEmail: string
  vehicle?: {
    make: string
    model: string
    year: number
  }
  serviceType?: {
    name: string
  }
  date: string
  timeSlot: string
  status: string
  notes?: string
}

interface PerformanceMetrics {
  bookingsHandled: number
  averageHandlingTime: number
  customerRating: number
  conversionRate: number
  revenueGenerated: number
  tasksCompleted: number
}

export default function EmployeeDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [stats, setStats] = useState<EmployeeStats>({
    totalBookings: 0,
    todayBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    customerSatisfaction: 0,
    averageResponseTime: 0
  })
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    bookingsHandled: 0,
    averageHandlingTime: 0,
    customerRating: 0,
    conversionRate: 0,
    revenueGenerated: 0,
    tasksCompleted: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      // Check if user is staff or admin
      if (!user?.isStaff()) {
        router.push('/dashboard')
        return
      }
      
      fetchDashboardData()
    }
  }, [status, router, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch employee stats
      const statsResponse = await fetch('/api/employee/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch tasks
      const tasksResponse = await fetch('/api/employee/dashboard/tasks')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }

      // Fetch appointments
      const appointmentsResponse = await fetch('/api/employee/dashboard/appointments')
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)
      }

      // Fetch performance metrics
      const performanceResponse = await fetch('/api/employee/dashboard/performance')
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json()
        setPerformance(performanceData)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'outline', label: 'Low' },
      medium: { variant: 'secondary', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      urgent: { variant: 'destructive', label: 'Urgent' }
    } as const

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low

    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock },
      in_progress: { variant: 'default', icon: Activity },
      completed: { variant: 'outline', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getAppointmentStatusBadge = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/employee/dashboard/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setTasks(prev => 
          prev.map(task => task.id === taskId ? { ...task, status: newStatus as any } : task)
        )
        toast({
          title: 'Success',
          description: 'Task status updated successfully'
        })
      } else {
        throw new Error('Failed to update task status')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}` : undefined} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'E'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Employee Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name || 'Employee'}!</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/employee/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total: {stats.totalBookings}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerSatisfaction}%</div>
            <p className="text-xs text-muted-foreground">
              Customer rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{performance.bookingsHandled}</div>
              <p className="text-sm text-gray-600">Bookings Handled</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{performance.customerRating}%</div>
              <p className="text-sm text-gray-600">Customer Rating</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">EGP {performance.revenueGenerated.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Revenue Generated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                Your scheduled appointments for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {appointment.type === 'test_drive' ? 'Test Drive' : 'Service Appointment'}
                              </h3>
                              {getAppointmentStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium">Customer</p>
                                <p className="text-gray-600">{appointment.customerName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{appointment.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{appointment.customerEmail}</span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium">Time</p>
                                <p className="text-gray-600">
                                  {formatDate(appointment.date)} at {appointment.timeSlot}
                                </p>
                                {appointment.vehicle && (
                                  <p className="text-gray-600 mt-1">
                                    {appointment.vehicle.make} {appointment.vehicle.model} ({appointment.vehicle.year})
                                  </p>
                                )}
                                {appointment.serviceType && (
                                  <p className="text-gray-600 mt-1">
                                    Service: {appointment.serviceType.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mt-4">
                                <p className="font-medium text-sm">Notes</p>
                                <p className="text-gray-600 text-sm mt-1">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/employee/appointments/${appointment.id}`)}
                          >
                            View Details
                          </Button>
                          
                          {appointment.status === 'PENDING' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                // Handle confirmation
                                toast({
                                  title: 'Success',
                                  description: 'Appointment confirmed successfully'
                                })
                              }}
                            >
                              Confirm
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
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskManagement />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Bookings Handled</span>
                  <span className="font-semibold">{performance.bookingsHandled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Handling Time</span>
                  <span className="font-semibold">{performance.averageHandlingTime} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Rating</span>
                  <span className="font-semibold">{performance.customerRating}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-semibold">{performance.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Revenue Generated</span>
                  <span className="font-semibold">EGP {performance.revenueGenerated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tasks Completed</span>
                  <span className="font-semibold">{performance.tasksCompleted}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => router.push('/employee/bookings')}>
                  <Car className="w-4 h-4 mr-2" />
                  Manage Bookings
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/employee/tasks')}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View All Tasks
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/employee/calendar')}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/employee/customers')}>
                  <Users className="w-4 h-4 mr-2" />
                  Customer Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Detailed performance analysis and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">View detailed analytics and reports</p>
                <Button onClick={() => router.push('/employee/performance')}>
                  View Full Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}