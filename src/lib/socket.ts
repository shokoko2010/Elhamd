import { Server } from 'socket.io';

interface NotificationPayload {
  type: 'booking' | 'vehicle' | 'customer' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  data: any;
  timestamp: string;
}

export const setupSocket = (io: Server) => {
  // Track client connections to prevent welcome message spam
  const clientConnections = new Map<string, { lastWelcome: number, welcomeCount: number }>()
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join rooms based on user role
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    // Leave room
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      console.log(`Client ${socket.id} left room: ${room}`);
    });

    // Handle booking notifications
    socket.on('booking-notification', (payload: NotificationPayload) => {
      // Broadcast to admin room
      io.to('admin').emit('notification', {
        ...payload,
        timestamp: new Date().toISOString()
      });
      
      // Broadcast to staff room
      io.to('staff').emit('notification', {
        ...payload,
        timestamp: new Date().toISOString()
      });
    });

    // Handle vehicle updates
    socket.on('vehicle-update', (payload: NotificationPayload) => {
      // Broadcast to all admin and staff
      io.to('admin').emit('notification', {
        ...payload,
        timestamp: new Date().toISOString()
      });
      io.to('staff').emit('notification', {
        ...payload,
        timestamp: new Date().toISOString()
      });
    });

    // Handle customer updates
    socket.on('customer-update', (payload: NotificationPayload) => {
      // Broadcast to admin room
      io.to('admin').emit('notification', {
        ...payload,
        timestamp: new Date().toISOString()
      });
    });

    // Handle system notifications
    socket.on('system-notification', (payload: NotificationPayload) => {
      // Broadcast to all connected clients
      io.emit('notification', {
        ...payload,
        timestamp: new Date().toISOString()
      });
    });

    // Send real-time booking status updates
    socket.on('booking-status-update', (bookingId: string, status: string, customerEmail: string) => {
      const payload: NotificationPayload = {
        type: 'booking',
        action: 'status_changed',
        data: {
          bookingId,
          status,
          customerEmail
        },
        timestamp: new Date().toISOString()
      };

      // Send to admin/staff
      io.to('admin').emit('notification', payload);
      io.to('staff').emit('notification', payload);

      // Send to customer room (if exists)
      io.to(`customer-${customerEmail}`).emit('notification', payload);
    });

    // Handle test drive booking created
    socket.on('test-drive-created', (bookingData: any) => {
      const payload: NotificationPayload = {
        type: 'booking',
        action: 'created',
        data: {
          bookingType: 'test-drive',
          ...bookingData
        },
        timestamp: new Date().toISOString()
      };

      // Notify admin and staff
      io.to('admin').emit('notification', payload);
      io.to('staff').emit('notification', payload);
    });

    // Handle service booking created
    socket.on('service-booking-created', (bookingData: any) => {
      const payload: NotificationPayload = {
        type: 'booking',
        action: 'created',
        data: {
          bookingType: 'service',
          ...bookingData
        },
        timestamp: new Date().toISOString()
      };

      // Notify admin and staff
      io.to('admin').emit('notification', payload);
      io.to('staff').emit('notification', payload);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Clean up client connection tracking
      clientConnections.delete(socket.id);
    });

    // Send welcome message with rate limiting
    const now = Date.now();
    const clientInfo = clientConnections.get(socket.id) || { lastWelcome: 0, welcomeCount: 0 };
    
    // Only send welcome message if:
    // 1. It's been more than 30 seconds since the last welcome message
    // 2. The client hasn't received more than 3 welcome messages in this session
    if (now - clientInfo.lastWelcome > 30000 && clientInfo.welcomeCount < 3) {
      socket.emit('notification', {
        type: 'system',
        action: 'created',
        data: {
          message: 'Connected to Al-Hamd Cars real-time notifications'
        },
        timestamp: new Date().toISOString()
      });
      
      // Update client tracking
      clientConnections.set(socket.id, {
        lastWelcome: now,
        welcomeCount: clientInfo.welcomeCount + 1
      });
    }
  });
};

// Helper functions to emit notifications
export const emitNotification = (io: Server, room: string, payload: NotificationPayload) => {
  io.to(room).emit('notification', {
    ...payload,
    timestamp: new Date().toISOString()
  });
};

export const emitBookingNotification = (io: Server, payload: NotificationPayload) => {
  io.to('admin').emit('notification', payload);
  io.to('staff').emit('notification', payload);
  
  // Also send to customer if email is provided
  if (payload.data.customerEmail) {
    io.to(`customer-${payload.data.customerEmail}`).emit('notification', payload);
  }
};