'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar as CalendarIcon, 
  Settings, 
  BarChart3,
  Users,
  Car,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import EnhancedCalendar from '@/components/calendar/EnhancedCalendar'

interface CalendarStats {
  totalEvents: number
  todayEvents: number
  upcomingEvents: number
  completedEvents: number
}

export default function EmployeeCalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isStaff } = useAuth()
  
  const [stats, setStats] = useState<CalendarStats>({
    totalEvents: 0,
    todayEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && user) {
      // Check if user is staff or admin
      try {
        if (!isStaff()) {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking staff status:', error)
        router.push('/dashboard')
        return
      }
      
      fetchCalendarStats()
    }
  }, [status, router, user, isStaff])

  const fetchCalendarStats = async () => {
    try {
      setLoading(true)
      
      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))
      
      // Get upcoming date range (next 7 days)
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
      const [todayResponse, upcomingResponse, totalResponse] = await Promise.all([
        fetch(`/api/calendar?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`),
        fetch(`/api/calendar?startDate=${today.toISOString()}&endDate=${nextWeek.toISOString()}`),
        fetch('/api/calendar')
      ])

      if (todayResponse.ok) {
        const todayEvents = await todayResponse.json()
        setStats(prev => ({ ...prev, todayEvents: todayEvents.length }))
      }

      if (upcomingResponse.ok) {
        const upcomingEvents = await upcomingResponse.json()
        setStats(prev => ({ ...prev, upcomingEvents: upcomingEvents.length }))
      }

      if (totalResponse.ok) {
        const allEvents = await totalResponse.json()
        const completedEvents = allEvents.filter((event: any) => event.status === 'completed')
        setStats(prev => ({ 
          ...prev, 
          totalEvents: allEvents.length,
          completedEvents: completedEvents.length
        }))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar statistics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-600">Manage your schedule and appointments</p>
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
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayEvents}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedEvents}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All calendar events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar */}
      <EnhancedCalendar />

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" onClick={() => router.push('/employee/dashboard')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/employee/bookings')}>
            <Car className="w-4 h-4 mr-2" />
            Manage Bookings
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/employee/tasks')}>
            <Target className="w-4 h-4 mr-2" />
            Task Management
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/employee/customers')}>
            <Users className="w-4 h-4 mr-2" />
            Customer Management
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}