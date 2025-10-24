'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  Trash2,
  Settings,
  ArrowLeft,
  Calendar,
  Car,
  CreditCard,
  User,
  Wrench,
  MapPin,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-safe'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  status: string
  channel: string
  recipient: string
  sentAt?: string
  readAt?: string
  createdAt: string
  data?: any
  severity?: 'low' | 'medium' | 'high' | 'urgent'
}

interface Filters {
  type: 'all' | string
  status: 'all' | 'unread' | 'read'
  channel: 'all' | string
  search: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    channel: 'all',
    search: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchNotifications()
    }
  }, [status, router])

  useEffect(() => {
    filterNotifications()
  }, [notifications, filters])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/dashboard/notifications')
      if (response.ok) {
        const notificationsData = await response.json()
        setNotifications(notificationsData)
      } else {
        throw new Error('Failed to fetch notifications')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = [...notifications]

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === filters.type)
    }

    // Filter by status
    if (filters.status === 'unread') {
      filtered = filtered.filter(notification => !notification.readAt)
    } else if (filters.status === 'read') {
      filtered = filtered.filter(notification => notification.readAt)
    }

    // Filter by channel
    if (filters.channel !== 'all') {
      filtered = filtered.filter(notification => notification.channel === filters.channel)
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.message.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n)
        )
        toast({
          title: 'Success',
          description: 'Notification marked as read'
        })
      } else {
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      })
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.readAt)
    
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/dashboard/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast({
          title: 'Success',
          description: 'Notification deleted'
        })
      } else {
        throw new Error('Failed to delete notification')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      })
    }
  }

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) {
      return
    }

    for (const notification of notifications) {
      await deleteNotification(notification.id)
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      'BOOKING_CONFIRMATION': Calendar,
      'BOOKING_REMINDER': Clock,
      'BOOKING_CANCELLATION': AlertCircle,
      'PAYMENT_RECEIVED': CreditCard,
      'PAYMENT_FAILED': AlertCircle,
      'PROMOTION': Info,
      'SYSTEM': Bell,
      'booking': Car,
      'vehicle': Car,
      'customer': User,
      'payment': CreditCard,
      'system': Info
    }

    const Icon = iconMap[type as keyof typeof iconMap] || Bell
    return <Icon className="w-5 h-5" />
  }

  const getStatusBadge = (notification: Notification) => {
    if (notification.readAt) {
      return (
        <Badge variant="outline" className="text-xs">
          Read
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="text-xs">
          Unread
        </Badge>
      )
    }
  }

  const getChannelBadge = (channel: string) => {
    const channelConfig = {
      'EMAIL': { variant: 'default', label: 'Email' },
      'SMS': { variant: 'secondary', label: 'SMS' },
      'PUSH': { variant: 'outline', label: 'Push' }
    } as const

    const config = channelConfig[channel as keyof typeof channelConfig] || { variant: 'secondary', label: channel }

    return (
      <Badge variant={config.variant as any} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const unreadCount = notifications.filter(n => !n.readAt).length

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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" onClick={clearAllNotifications}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
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
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BOOKING_CONFIRMATION">Booking Confirmation</SelectItem>
                  <SelectItem value="BOOKING_REMINDER">Booking Reminder</SelectItem>
                  <SelectItem value="BOOKING_CANCELLATION">Booking Cancellation</SelectItem>
                  <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                  <SelectItem value="PAYMENT_FAILED">Payment Failed</SelectItem>
                  <SelectItem value="PROMOTION">Promotion</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
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
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Channel</label>
              <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="PUSH">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
          <CardDescription>
            {filteredNotifications.length === 0 
              ? 'No notifications found matching your filters'
              : 'Click on a notification to view details'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No notifications found</p>
              <Button onClick={() => setFilters({ type: 'all', status: 'all', channel: 'all', search: '' })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-6 hover:shadow-md transition-all ${
                    !notification.readAt ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        !notification.readAt ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold text-lg ${
                            !notification.readAt ? 'text-blue-900' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          {getStatusBadge(notification)}
                          {getChannelBadge(notification.channel)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.recipient && (
                            <span>• {notification.recipient}</span>
                          )}
                        </div>
                        
                        {/* Additional data based on notification type */}
                        {notification.data && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {Object.entries(notification.data).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium text-gray-700 capitalize">
                                    {key.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {!notification.readAt && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Read
                        </Button>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
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