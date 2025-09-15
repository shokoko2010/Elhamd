'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Car, 
  Calendar, 
  Users,
  Settings,
  Clock,
  Trash2,
  Eye
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: string
  type: 'booking' | 'vehicle' | 'customer' | 'system'
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  data: any
  timestamp: string
  read: boolean
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Initialize socket connection
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
      console.log('Connecting to socket:', socketUrl)
      
      try {
        const newSocket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          timeout: 5000,
          retries: 3
        })
        
        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id)
          setSocket(newSocket)

          // Join appropriate room based on user role
          if (user.role === 'ADMIN') {
            newSocket.emit('join-room', 'admin')
          } else if (user.role === 'STAFF') {
            newSocket.emit('join-room', 'staff')
          } else {
            newSocket.emit('join-room', `customer-${user.email}`)
          }
        })

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
        })

        // Listen for notifications
        newSocket.on('notification', (payload: any) => {
          console.log('Received notification:', payload)
          if (payload && typeof payload === 'object') {
            const newNotification: Notification = {
              id: `notification-${Date.now()}-${Math.random()}`,
              type: payload.type || 'system',
              action: payload.action || 'created',
              data: payload.data || {},
              timestamp: payload.timestamp || new Date().toISOString(),
              read: false
            }

            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        })

        newSocket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason)
        })

        return () => {
          if (newSocket) {
            newSocket.disconnect()
          }
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error)
      }
    }
  }, [user])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
    if (!notifications.find(n => n.id === notificationId)?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string, action: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />
      case 'vehicle':
        return <Car className="h-4 w-4" />
      case 'customer':
        return <Users className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string, action: string) => {
    switch (type) {
      case 'booking':
        return 'text-blue-600 bg-blue-50'
      case 'vehicle':
        return 'text-green-600 bg-green-50'
      case 'customer':
        return 'text-purple-600 bg-purple-50'
      case 'system':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getNotificationMessage = (notification: Notification) => {
    const { type, action, data } = notification

    switch (type) {
      case 'booking':
        if (action === 'created') {
          if (data.bookingType === 'test-drive') {
            return `حجز قيادة تجريبية جديد لـ ${data.vehicleName}`
          } else {
            return `حجز خدمة جديد: ${data.serviceName}`
          }
        } else if (action === 'status_changed') {
          return `تم تحديث حالة الحجز إلى ${data.status}`
        }
        break
      case 'vehicle':
        if (action === 'created') {
          return `سيارة جديدة مضافة: ${data.make} ${data.model}`
        } else if (action === 'updated') {
          return `سيارة محدثة: ${data.make} ${data.model}`
        }
        break
      case 'customer':
        if (action === 'created') {
          return `عميل جديد مسجل: ${data.name}`
        }
        break
      case 'system':
        return data.message || 'إشعار نظام'
    }

    return 'إشعار جديد'
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'الآن فقط'
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `منذ ${hours} ساعة`
    } else {
      return date.toLocaleDateString('ar-EG')
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
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
      </Button>

      {/* Notification Panel */}
      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الإشعارات</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    تعليم الكل كمقروء
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-xs"
                  >
                    مسح الكل
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${getNotificationColor(
                            notification.type,
                            notification.action
                          )}`}
                        >
                          {getNotificationIcon(notification.type, notification.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {getNotificationMessage(notification)}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}