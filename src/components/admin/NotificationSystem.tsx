'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useAuth } from '@/hooks/use-auth'

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
  const socketRef = useRef<Socket | null>(null)
  const isMountedRef = useRef(true)
  const welcomeReceivedRef = useRef(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Only reconnect if user has changed
      if (userIdRef.current !== user.id) {
        // Clean up previous connection
        if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current.removeAllListeners()
          socketRef.current = null
        }
        
        userIdRef.current = user.id
        welcomeReceivedRef.current = false
        
        // Initialize socket connection
        console.log('Initializing socket connection for user:', user.id)
        
        try {
          const newSocket = io({
            path: '/api/socketio',
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
            timeout: 30000,
            forceNew: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 5000,
            reconnectionDelayMax: 30000,
            autoConnect: false, // Don't auto-connect, we'll connect manually
            // Add additional options for better connection handling
            upgrade: true,
            rememberUpgrade: true,
          })
          
          socketRef.current = newSocket
          
          // Add connection state tracking
          let connectionAttempts = 0
          let lastConnectionTime = 0
          
          const connectSocket = () => {
            const now = Date.now()
            if (now - lastConnectionTime < 2000) {
              console.log('Throttling connection attempts')
              return
            }
            lastConnectionTime = now
            connectionAttempts++
            console.log(`Connection attempt ${connectionAttempts}`)
            newSocket.connect()
          }
          
          newSocket.on('connect', () => {
            if (!isMountedRef.current) return
            console.log('Socket connected:', newSocket.id, 'after', connectionAttempts, 'attempts')
            setSocket(newSocket)
            connectionAttempts = 0 // Reset attempts on successful connection

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
            if (!isMountedRef.current) return
            console.log('Socket connection error:', error.message, 'attempts:', connectionAttempts)
          })

          // Listen for notifications
          newSocket.on('notification', (payload: any) => {
            if (!isMountedRef.current) return
            // Only log important notifications, not system messages
            if (payload.type !== 'system' || !payload.data?.message?.includes('Connected to Al-Hamd Cars')) {
              console.log('Received notification:', payload)
            }
            
            // Skip welcome messages after the first one
            if (payload.type === 'system' && payload.data?.message?.includes('Connected to Al-Hamd Cars')) {
              if (welcomeReceivedRef.current) {
                return
              }
              welcomeReceivedRef.current = true
            }
            
            if (payload && typeof payload === 'object') {
              const newNotification: Notification = {
                id: `notification-${Date.now()}-${Math.random()}`,
                type: payload.type || 'system',
                action: payload.action || 'created',
                data: payload.data || {},
                timestamp: payload.timestamp || new Date().toISOString(),
                read: false
              }

              setNotifications(prev => {
                // Avoid duplicate notifications
                const isDuplicate = prev.some(notif => 
                  notif.type === newNotification.type && 
                  notif.action === newNotification.action &&
                  JSON.stringify(notif.data) === JSON.stringify(newNotification.data) &&
                  // Consider it duplicate if it's within 5 seconds
                  Math.abs(new Date(notif.timestamp).getTime() - new Date(newNotification.timestamp).getTime()) < 5000
                )
                
                if (isDuplicate) {
                  return prev
                }
                
                return [newNotification, ...prev]
              })
              setUnreadCount(prev => prev + 1)
            }
          })

          newSocket.on('disconnect', (reason) => {
            if (!isMountedRef.current) return
            console.log('Socket disconnected:', reason)
            if (reason === 'io server disconnect') {
              welcomeReceivedRef.current = false
            }
          })
          
          // Start connection
          setTimeout(connectSocket, 1000)

          return () => {
            if (newSocket) {
              newSocket.disconnect()
              newSocket.removeAllListeners()
            }
            socketRef.current = null
          }
        } catch (error) {
          console.error('Failed to initialize socket:', error)
          socketRef.current = null
        }
      }
    }

    return () => {
      // Only cleanup if user is changing or component is unmounting
      if (socketRef.current && (!user || userIdRef.current !== user?.id)) {
        socketRef.current.disconnect()
        socketRef.current.removeAllListeners()
        socketRef.current = null
        setSocket(null)
        welcomeReceivedRef.current = false
        if (!user) {
          userIdRef.current = null
        }
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