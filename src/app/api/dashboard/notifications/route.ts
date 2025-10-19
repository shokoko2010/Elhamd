interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Get notifications for the user
    const notifications = await db.notification.findMany({
      where: { 
        OR: [
          { userId: userId },
          { recipient: user.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 notifications
    })

    // Format notifications
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      status: notification.status,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString()
    }))

    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error('Error fetching dashboard notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Mark notification as read
    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: { 
        readAt: new Date(),
        status: 'READ'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}