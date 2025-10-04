'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { io, Socket } from 'socket.io-client'

export default function WebSocketTest() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  useEffect(() => {
    const connectSocket = () => {
      setConnectionStatus('connecting')
      setMessages(prev => [...prev, 'Attempting to connect to WebSocket...'])

      try {
        // Determine the protocol and host based on current environment
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
        const host = window.location.host
        const socketUrl = `${protocol}//${host}`

        const socketInstance = io(socketUrl, {
          path: '/api/socketio',
          transports: ['websocket', 'polling'],
          timeout: 5000,
          reconnection: true,
          reconnectionAttempts: 2,
          reconnectionDelay: 1000,
          // Force WebSocket in production for better performance
          ...(process.env.NODE_ENV === 'production' && {
            upgrade: true,
            rememberUpgrade: true,
            transports: ['websocket', 'polling']
          })
        })

        socketInstance.on('connect', () => {
          console.log('WebSocket connected successfully!')
          setIsConnected(true)
          setConnectionStatus('connected')
          setMessages(prev => [...prev, `✅ Connected to WebSocket server (ID: ${socketInstance.id})`])
          
          // Join a test room
          socketInstance.emit('join-room', 'test-room')
          setMessages(prev => [...prev, '📥 Joined test-room'])
        })

        socketInstance.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error)
          setConnectionStatus('error')
          setMessages(prev => [...prev, `❌ Connection error: ${error.message}`])
          setMessages(prev => [...prev, 'ℹ️ Note: WebSocket functionality requires server configuration'])
        })

        socketInstance.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason)
          setIsConnected(false)
          setConnectionStatus('disconnected')
          setMessages(prev => [...prev, `🔌 Disconnected: ${reason}`])
        })

        // Listen for notifications
        socketInstance.on('notification', (payload: any) => {
          console.log('Received notification:', payload)
          setMessages(prev => [...prev, `📨 Received notification: ${JSON.stringify(payload)}`])
        })

        // Listen for welcome message
        socketInstance.on('notification', (payload: any) => {
          if (payload.type === 'system' && payload.data?.message?.includes('Connected to Al-Hamd Cars')) {
            setMessages(prev => [...prev, `🎉 Welcome message received: ${payload.data.message}`])
          }
        })

        setSocket(socketInstance)

        return () => {
          socketInstance.disconnect()
        }
      } catch (error) {
        console.error('Failed to create socket connection:', error)
        setConnectionStatus('error')
        setMessages(prev => [...prev, `❌ Failed to create socket: ${error instanceof Error ? error.message : 'Unknown error'}`])
        setMessages(prev => [...prev, 'ℹ️ Note: WebSocket functionality requires server configuration'])
      }
    }

    connectSocket()
  }, [])

  const sendTestMessage = () => {
    if (socket && isConnected) {
      const testPayload = {
        type: 'test',
        action: 'message',
        data: {
          message: 'Hello from WebSocket test!',
          timestamp: new Date().toISOString()
        }
      }
      
      socket.emit('notification', testPayload)
      setMessages(prev => [...prev, `📤 Sent test message: ${JSON.stringify(testPayload)}`])
    } else {
      setMessages(prev => [...prev, '❌ Cannot send message - not connected'])
    }
  }

  const reconnect = () => {
    if (socket) {
      socket.disconnect()
    }
    setMessages([])
    setIsConnected(false)
    setConnectionStatus('disconnected')
    
    // Force reconnection by re-running the effect
    setTimeout(() => {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
      const host = window.location.host
      const socketUrl = `${protocol}//${host}`
      
      const socketInstance = io(socketUrl, {
        path: '/api/socketio',
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      })
      setSocket(socketInstance)
    }, 100)
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Error'
      default: return 'Disconnected'
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            WebSocket Connection Test
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
                {getStatusText()}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Test the WebSocket connection to the Socket.IO server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={sendTestMessage} 
              disabled={!isConnected}
              variant={isConnected ? 'default' : 'secondary'}
            >
              Send Test Message
            </Button>
            <Button 
              onClick={reconnect} 
              variant="outline"
            >
              Reconnect
            </Button>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Connection Log:</h3>
            <div className="space-y-1 font-mono text-sm">
              {messages.length === 0 ? (
                <p className="text-gray-500">No connection attempts yet...</p>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="border-b border-gray-200 pb-1 last:border-0">
                    {message}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Connection Details:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Server URL: {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'}</li>
                <li>• Socket Path: /api/socketio</li>
                <li>• Transports: websocket, polling</li>
                <li>• Socket ID: {socket?.id || 'N/A'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Troubleshooting:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Check if server is running on port 3000</li>
                <li>• Verify CORS settings</li>
                <li>• Check browser console for errors</li>
                <li>• Ensure WebSocket is not blocked</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}