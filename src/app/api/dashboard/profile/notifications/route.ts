import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const preferences = await request.json()

    // Delete existing notification preferences for this user
    await db.notification.deleteMany({
      where: { userId: userId }
    })

    // Create new notification preferences based on the input
    const notificationsToCreate = []
    
    for (const pref of preferences) {
      if (pref.email) {
        notificationsToCreate.push({
          userId: userId,
          type: pref.type,
          title: `${pref.type.replace(/_/g, ' ')} Notification`,
          message: `Notification for ${pref.type.replace(/_/g, ' ')}`,
          status: 'PENDING',
          channel: 'EMAIL',
          recipient: session.user.email!
        })
      }
      
      if (pref.sms) {
        notificationsToCreate.push({
          userId: userId,
          type: pref.type,
          title: `${pref.type.replace(/_/g, ' ')} Notification`,
          message: `Notification for ${pref.type.replace(/_/g, ' ')}`,
          status: 'PENDING',
          channel: 'SMS',
          recipient: session.user.email! // This should be phone number in real implementation
        })
      }
      
      if (pref.push) {
        notificationsToCreate.push({
          userId: userId,
          type: pref.type,
          title: `${pref.type.replace(/_/g, ' ')} Notification`,
          message: `Notification for ${pref.type.replace(/_/g, ' ')}`,
          status: 'PENDING',
          channel: 'PUSH',
          recipient: session.user.email!
        })
      }
    }

    if (notificationsToCreate.length > 0) {
      await db.notification.createMany({
        data: notificationsToCreate
      })
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}