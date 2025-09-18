import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user profile
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        emailVerified: true,
        securitySettings: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get notification preferences
    const notificationPreferences = await db.notification.findMany({
      where: { userId: userId },
      select: {
        type: true,
        channel: true
      },
      distinct: ['type', 'channel']
    })

    // Format notification preferences
    const formattedPreferences = notificationPreferences.reduce((acc, notification) => {
      const existing = acc.find(p => p.type === notification.type)
      if (existing) {
        switch (notification.channel) {
          case 'EMAIL':
            existing.email = true
            break
          case 'SMS':
            existing.sms = true
            break
          case 'PUSH':
            existing.push = true
            break
        }
      } else {
        acc.push({
          type: notification.type,
          email: notification.channel === 'EMAIL',
          sms: notification.channel === 'SMS',
          push: notification.channel === 'PUSH'
        })
      }
      return acc
    }, [] as Array<{
      type: string
      email: boolean
      sms: boolean
      push: boolean
    }>)

    const profile = {
      ...user,
      notificationPreferences: formattedPreferences,
      addresses: [], // To be implemented with address model
      paymentMethods: [] // To be implemented with payment method model
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { name, email, phone } = await request.json()

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone })
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        emailVerified: true,
        securitySettings: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}