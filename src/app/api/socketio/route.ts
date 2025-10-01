import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { setupSocket } from '@/lib/socket'

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    res.socket.server.io = io
    setupSocket(io)
  }
  res.end()
}

export default SocketHandler