'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { io, Socket } from 'socket.io-client'

interface Notification {
  id: string
  type: 'booking' | 'vehicle' | 'customer' | 'system' | 'payment'
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'payment_received'
  title: string
  message: string
  data: any
  timestamp: string
  read: boolean
  severity: 'low' | 'medium' | 'high' | 'urgent'
}

interface NotificationCenterProps {
  userId?: string
  userRole?: 'admin' | 'staff' | 'customer'
  onNotificationClick?: (notification: Notification) => void
}

export default function NotificationCenter({ 
  userId, 
  userRole = 'customer', 
  onNotificationClick 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Check if socket should be enabled
    const isDevelopment = process.env.NODE_ENV === 'development'
    const enableSocket = false // Disabled until Socket.IO server is properly configured
    
    if (!enableSocket) {
      console.log('Socket.IO is disabled - Socket.IO server not configured')
      loadInitialNotifications()
      return
    }
    
    // Initialize socket connection with production-friendly configuration
    
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

    // Listen for specific booking events
    socketInstance.on('booking-status-update', (bookingId: string, status: string, customerEmail: string) => {
      const notification: Notification = {
        id: `booking-${bookingId}-${Date.now()}`,
        type: 'booking',
        action: 'status_changed',
        title: 'تحديث حالة الحجز',
        message: `تم تحديث حالة الحجز #${bookingId} إلى ${getStatusText(status)}`,
        data: { bookingId, status, customerEmail },
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'medium'
      }
      addNotification(notification)
    })

    socketInstance.on('test-drive-created', (bookingData: any) => {
      const notification: Notification = {
        id: `test-drive-${bookingData.id}-${Date.now()}`,
        type: 'booking',
        action: 'created',
        title: 'حجز تجربة قيادة جديد',
        message: `حجز جديد لتجربة قيادة ${bookingData.vehicle?.make || ''} ${bookingData.vehicle?.model || ''}`,
        data: bookingData,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'medium'
      }
      addNotification(notification)
    })

    socketInstance.on('service-booking-created', (bookingData: any) => {
      const notification: Notification = {
        id: `service-${bookingData.id}-${Date.now()}`,
        type: 'booking',
        action: 'created',
        title: 'حجز خدمة جديد',
        message: `حجز خدمة جديد بتاريخ ${bookingData.date}`,
        data: bookingData,
        timestamp: new Date().toISOString(),
        read: false,
        severity: 'medium'
      }
      addNotification(notification)
    })

    setSocket(socketInstance)

    // Load initial notifications
    loadInitialNotifications()

    return () => {
      socketInstance.disconnect()
    }
  }, [userId, userRole])

  const loadInitialNotifications = () => {
    // Mock initial notifications - in real implementation, fetch from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'system',
        action: 'created',
        title: 'مرحباً بك في نظام الحمد للسيارات',
        message: 'تم تفعيل الإشعارات الفورية لحسابك',
        data: {},
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: true,
        severity: 'low'
      }
    ]
    setNotifications(mockNotifications)
    updateUnreadCount(mockNotifications)
  }

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    updateUnreadCount([notification, ...notifications])
    
    // Play notification sound (optional)
    if (notification.severity === 'high' || notification.severity === 'urgent') {
      playNotificationSound()
    }
  }

  const updateUnreadCount = (notificationList: Notification[]) => {
    const count = notificationList.filter(n => !n.read).length
    setUnreadCount(count)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    updateUnreadCount(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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

  const playNotificationSound = () => {
    // Play a subtle notification sound
    const audio = new Audio('/notification.mp3')
    audio.play().catch(() => {
      // Ignore errors if audio fails to play
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'قيد الانتظار',
      'CONFIRMED': 'مؤكد',
      'CANCELLED': 'ملغي',
      'COMPLETED': 'مكتمل',
      'NO_SHOW': 'لم يحضر'
    }
    return statusMap[status] || status
  }

  const getNotificationIcon = (type: string, action: string) => {
    if (type === 'booking') {
      if (action === 'created') return <Calendar className="h-4 w-4" />
      if (action === 'status_changed') return <Clock className="h-4 w-4" />
      return <Car className="h-4 w-4" />
    }
    if (type === 'vehicle') return <Car className="h-4 w-4" />
    if (type === 'customer') return <User className="h-4 w-4" />
    if (type === 'payment') return <CreditCard className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-blue-600 bg-blue-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
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

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 z-50 shadow-xl border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الإشعارات</CardTitle>
              <div className="flex items-center gap-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              {connected ? 'متصل' : 'غير متصل'} • {unreadCount} غير مقروء
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      } ${getSeverityColor(notification.severity)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.action)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Additional details based on notification type */}
                          {notification.type === 'booking' && notification.data.vehicle && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Car className="h-3 w-3" />
                              <span>{notification.data.vehicle.make} {notification.data.vehicle.model}</span>
                            </div>
                          )}
                          
                          {notification.type === 'booking' && notification.data.date && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{notification.data.date} {notification.data.timeSlot}</span>
                            </div>
                          )}
                          
                          {notification.type === 'payment' && notification.data.amount && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <CreditCard className="h-3 w-3" />
                              <span>EGP {notification.data.amount.toLocaleString()}</span>
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
          </CardContent>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Navigate to full notifications page
                  setIsOpen(false)
                }}
              >
                عرض جميع الإشعارات
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// Helper function to transform socket payload to notification
function transformPayloadToNotification(payload: any): Notification {
  const { type, action, data, timestamp } = payload
  
  let title = ''
  let message = ''
  let severity: Notification['severity'] = 'medium'
  
  switch (type) {
    case 'booking':
      switch (action) {
        case 'created':
          title = 'حجز جديد'
          message = data.bookingType === 'test-drive' 
            ? `حجز تجربة قيادة جديد لـ ${data.vehicle?.make || ''} ${data.vehicle?.model || ''}`
            : `حجز خدمة جديد بتاريخ ${data.date}`
          severity = 'medium'
          break
        case 'status_changed':
          title = 'تحديث حالة الحجز'
          message = `تم تحديث حالة الحجز #${data.bookingId} إلى ${data.status}`
          severity = 'high'
          break
        case 'updated':
          title = 'تحديث الحجز'
          message = `تم تحديث معلومات الحجز #${data.bookingId}`
          severity = 'low'
          break
      }
      break
      
    case 'payment':
      title = 'إشعار دفع'
      message = `تم استلام دفع بقيمة ${data.amount} جنيه`
      severity = 'high'
      break
      
    case 'vehicle':
      title = 'تحديث المركبة'
      message = `تم تحديث معلومات المركبة ${data.make || ''} ${data.model || ''}`
      severity = 'low'
      break
      
    case 'customer':
      title = 'تحديث العميل'
      message = `تم تحديث معلومات العميل ${data.name || ''}`
      severity = 'low'
      break
      
    case 'system':
      title = data.title || 'إشعار النظام'
      message = data.message || 'إشعار من النظام'
      severity = data.severity || 'low'
      break
  }
  
  return {
    id: `${type}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    action,
    title,
    message,
    data,
    timestamp: timestamp || new Date().toISOString(),
    read: false,
    severity
  }
}