'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock,
  Car,
  Wrench,
  User,
  CreditCard,
  Calendar,
  MapPin,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  BarChart3,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { io, Socket } from 'socket.io-client'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP'
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  recipient: string
  metadata?: Record<string, any>
  createdAt: string
  sentAt?: string
  readAt?: string
  error?: string
}

interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  whatsapp: boolean
  marketingEmails: boolean
  bookingReminders: boolean
  paymentConfirmations: boolean
  promotionalOffers: boolean
}

interface NotificationStats {
  total: number
  sent: number
  failed: number
  pending: number
  byChannel: Record<string, { sent: number; failed: number; total: number }>
  byType: Record<string, { sent: number; failed: number; total: number }>
  byPriority: Record<string, { sent: number; failed: number; total: number }>
}

interface EnhancedNotificationCenterProps {
  userId?: string
  userRole?: 'admin' | 'staff' | 'customer'
  onNotificationClick?: (notification: Notification) => void
}

export default function EnhancedNotificationCenter({ 
  userId, 
  userRole = 'customer', 
  onNotificationClick 
}: EnhancedNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [filter, setFilter] = useState<'all' | 'unread' | 'sent' | 'failed'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize socket connection with production-friendly configuration
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    const socketConfig: any = {
      path: '/api/socketio',
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      auth: {
        userId,
        role: userRole
      }
    }
    
    // In production, force polling first to avoid WSS issues
    if (!isDevelopment) {
      socketConfig.transports = ['polling']
    }
    
    const socketInstance = io(socketConfig)
    
    // In production, try to upgrade to websocket after polling succeeds
    if (!isDevelopment) {
      setTimeout(() => {
        if (socketInstance && socketInstance.connected) {
          socketInstance.io.engine.transport = ['polling', 'websocket']
        }
      }, 5000)
    }

    socketInstance.on('connect', () => {
      console.log('Connected to notification server')
      setConnected(true)
      
      // Join appropriate rooms based on user role
      if (userRole === 'admin') {
        socketInstance.emit('join-room', 'admin')
      } else if (userRole === 'staff') {
        socketInstance.emit('join-room', 'staff')
      } else if (userId) {
        socketInstance.emit('join-room', `customer-${userId}`)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from notification server')
      setConnected(false)
    })

    // Listen for notifications
    socketInstance.on('notification', (payload: any) => {
      const notification = transformPayloadToNotification(payload)
      addNotification(notification)
    })

    setSocket(socketInstance)

    // Load initial data
    loadInitialData()

    return () => {
      socketInstance.disconnect()
    }
  }, [userId, userRole])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load notifications
      await loadNotifications()
      // Load preferences
      await loadPreferences()
      // Load stats
      await loadStats()
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      // In production, fetch from API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'BOOKING_CONFIRMATION',
          title: 'تأكيد الحجز',
          message: 'تم تأكيد حجز خدمة الصيانة بنجاح',
          channel: 'EMAIL',
          status: 'SENT',
          priority: 'HIGH',
          recipient: 'customer@example.com',
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          sentAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
          metadata: { bookingId: 'BK001', vehicleMake: 'Tata', vehicleModel: 'Nexon' }
        },
        {
          id: '2',
          type: 'PAYMENT_CONFIRMATION',
          title: 'تأكيد الدفع',
          message: 'تم استلام الدفع بنجاح',
          channel: 'SMS',
          status: 'DELIVERED',
          priority: 'HIGH',
          recipient: '+201234567890',
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          sentAt: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
          metadata: { amount: 1500, currency: 'EGP', transactionId: 'TXN123456' }
        }
      ]
      setNotifications(mockNotifications)
      updateUnreadCount(mockNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const loadPreferences = async () => {
    try {
      // In production, fetch from API
      const mockPreferences: NotificationPreferences = {
        email: true,
        sms: true,
        push: true,
        whatsapp: false,
        marketingEmails: false,
        bookingReminders: true,
        paymentConfirmations: true,
        promotionalOffers: false
      }
      setPreferences(mockPreferences)
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  const loadStats = async () => {
    try {
      // In production, fetch from API
      const mockStats: NotificationStats = {
        total: 25,
        sent: 20,
        failed: 3,
        pending: 2,
        byChannel: {
          EMAIL: { sent: 15, failed: 1, total: 16 },
          SMS: { sent: 8, failed: 2, total: 10 },
          PUSH: { sent: 2, failed: 0, total: 2 },
          WHATSAPP: { sent: 0, failed: 0, total: 0 }
        },
        byType: {
          BOOKING_CONFIRMATION: { sent: 10, failed: 0, total: 10 },
          PAYMENT_CONFIRMATION: { sent: 8, failed: 1, total: 9 },
          BOOKING_REMINDER: { sent: 5, failed: 2, total: 7 }
        },
        byPriority: {
          HIGH: { sent: 12, failed: 1, total: 13 },
          MEDIUM: { sent: 8, failed: 2, total: 10 },
          LOW: { sent: 3, failed: 0, total: 3 }
        }
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    updateUnreadCount([notification, ...notifications])
    
    // Play notification sound for high priority
    if (notification.priority === 'HIGH' || notification.priority === 'URGENT') {
      playNotificationSound()
    }
  }

  const updateUnreadCount = (notificationList: Notification[]) => {
    const count = notificationList.filter(n => n.status !== 'READ').length
    setUnreadCount(count)
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() } : n)
    )
    updateUnreadCount(notifications.map(n => n.id === notificationId ? { ...n, status: 'READ' as const } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' as const, readAt: new Date().toISOString() })))
    setUnreadCount(0)
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    updateUnreadCount(notifications.filter(n => n.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    onNotificationClick?.(notification)
    setIsOpen(false)
  }

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)

    // In production, save to API
    try {
      // await fetch('/api/notifications/enhanced/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ preferences: newPreferences })
      // })
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {
      // Ignore errors if audio fails to play
    })
  }

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => n.status !== 'READ')
      case 'sent':
        return notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED')
      case 'failed':
        return notifications.filter(n => n.status === 'FAILED')
      default:
        return notifications
    }
  }

  const getNotificationIcon = (type: string, channel: string) => {
    const channelIcons = {
      EMAIL: <Mail className="h-4 w-4" />,
      SMS: <MessageSquare className="h-4 w-4" />,
      PUSH: <Smartphone className="h-4 w-4" />,
      WHATSAPP: <MessageSquare className="h-4 w-4" />
    }

    return channelIcons[channel as keyof typeof channelIcons] || <Bell className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-green-600'
      case 'DELIVERED': return 'text-blue-600'
      case 'FAILED': return 'text-red-600'
      case 'READ': return 'text-gray-600'
      default: return 'text-yellow-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'border-red-500 bg-red-50'
      case 'HIGH': return 'border-blue-600 bg-blue-50'
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50'
      case 'LOW': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return format(date, 'dd/MM/yyyy', { locale: ar })
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {!connected && (
          <div className="absolute bottom-0 right-0 h-2 w-2 bg-red-500 rounded-full"></div>
        )}
      </Button>

      {/* Enhanced Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-[500px] max-h-[600px] z-50 shadow-xl border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                مركز الإشعارات
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-xs">
              {connected ? 'متصل' : 'غير متصل'} • {unreadCount} غير مقروء
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notifications" className="text-xs">
                  الإشعارات
                </TabsTrigger>
                <TabsTrigger value="preferences" className="text-xs">
                  الإعدادات
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs">
                  الإحصائيات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="m-0">
                {/* Filter Controls */}
                <div className="p-3 border-b flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <div className="flex gap-2">
                    {(['all', 'unread', 'sent', 'failed'] as const).map((filterType) => (
                      <Button
                        key={filterType}
                        variant={filter === filterType ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(filterType)}
                        className="text-xs h-7"
                      >
                        {filterType === 'all' && 'الكل'}
                        {filterType === 'unread' && 'غير مقروء'}
                        {filterType === 'sent' && 'مرسل'}
                        {filterType === 'failed' && 'فشل'}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        تحديد الكل كمقروء
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-xs"
                    >
                      مسح الكل
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-96">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="mr-2 text-sm">جاري التحميل...</span>
                    </div>
                  ) : getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">لا توجد إشعارات</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {getFilteredNotifications().map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            notification.status !== 'READ' ? 'bg-blue-50' : ''
                          } ${getPriorityColor(notification.priority)}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type, notification.channel)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium truncate ${
                                  notification.status !== 'READ' ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getStatusColor(notification.status)}`}
                                  >
                                    {notification.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                  {notification.status !== 'READ' && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {/* Additional details */}
                              {notification.metadata && (
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {notification.metadata.vehicleMake && (
                                    <div className="flex items-center gap-1">
                                      <Car className="h-3 w-3" />
                                      <span>{notification.metadata.vehicleMake} {notification.metadata.vehicleModel}</span>
                                    </div>
                                  )}
                                  {notification.metadata.amount && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CreditCard className="h-3 w-3" />
                                      <span>{notification.metadata.amount} {notification.metadata.currency}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preferences" className="m-0">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold mb-4">تفضيلات الإشعارات</h3>
                  
                  {preferences && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">قنوات الإشعارات</h4>
                        <div className="space-y-2">
                          {preferences && Object.entries(preferences).filter(([key]) => 
                            ['email', 'sms', 'push', 'whatsapp'].includes(key)
                          ).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {key === 'email' && <Mail className="h-4 w-4" />}
                                  {key === 'sms' && <MessageSquare className="h-4 w-4" />}
                                  {key === 'push' && <Smartphone className="h-4 w-4" />}
                                  {key === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                                  <Label htmlFor={key} className="text-sm capitalize">
                                    {key === 'email' && 'البريد الإلكتروني'}
                                    {key === 'sms' && 'الرسائل النصية'}
                                    {key === 'push' && 'الإشعارات الفورية'}
                                    {key === 'whatsapp' && 'واتساب'}
                                  </Label>
                                </div>
                                <Switch
                                  id={key}
                                  checked={value}
                                  onCheckedChange={(checked) => 
                                    handlePreferenceChange(key as keyof NotificationPreferences, checked)
                                  }
                                />
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">أنواع الإشعارات</h4>
                        <div className="space-y-2">
                          {preferences && Object.entries(preferences).filter(([key]) => 
                            ['marketingEmails', 'bookingReminders', 'paymentConfirmations', 'promotionalOffers'].includes(key)
                          ).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="flex items-center justify-between">
                                <Label htmlFor={key} className="text-sm">
                                  {key === 'marketingEmails' && 'الرسائل التسويقية'}
                                  {key === 'bookingReminders' && 'تذكيرات الحجوزات'}
                                  {key === 'paymentConfirmations' && 'تأكيدات الدفع'}
                                  {key === 'promotionalOffers' && 'العروض الترويجية'}
                                </Label>
                                <Switch
                                  id={key}
                                  checked={value}
                                  onCheckedChange={(checked) => 
                                    handlePreferenceChange(key as keyof NotificationPreferences, checked)
                                  }
                                />
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="m-0">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    إحصائيات الإشعارات
                  </h3>
                  
                  {stats && (
                    <div className="space-y-4">
                      {/* Overall Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                          <div className="text-xs text-blue-600">الإجمالي</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                          <div className="text-xs text-green-600">مرسل</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                          <div className="text-xs text-red-600">فشل</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                          <div className="text-xs text-yellow-600">قيد الانتظار</div>
                        </div>
                      </div>

                      {/* By Channel */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">حسب القناة</h4>
                        <div className="space-y-2">
                          {stats?.byChannel && Object.entries(stats.byChannel).map(([channel, data]) => (
                            data && (
                              <div key={channel} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{channel}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600">{data.sent || 0}</span>
                                  <span className="text-red-600">{data.failed || 0}</span>
                                  <span className="text-gray-500">({data.total || 0})</span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* By Priority */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">حسب الأولوية</h4>
                        <div className="space-y-2">
                          {stats?.byPriority && Object.entries(stats.byPriority).map(([priority, data]) => (
                            data && (
                              <div key={priority} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{priority}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600">{data.sent || 0}</span>
                                  <span className="text-red-600">{data.failed || 0}</span>
                                  <span className="text-gray-500">({data.total || 0})</span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to transform socket payload to notification
function transformPayloadToNotification(payload: any): Notification {
  return {
    id: `notification_${Date.now()}_${Math.random()}`,
    type: payload.type || 'CUSTOM',
    title: payload.title || 'إشعار جديد',
    message: payload.message || '',
    channel: payload.channel || 'EMAIL',
    status: 'SENT',
    priority: payload.priority || 'MEDIUM',
    recipient: payload.recipient || '',
    metadata: payload.metadata || {},
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString()
  }
}