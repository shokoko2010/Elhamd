interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!user?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.session.user.id
    const { twoFactorEnabled, loginNotifications, emailNotifications } = await request.json()

    // Get current security settings
    const currentUser = await db.session.user.findUnique({
      where: { id: userId },
      select: { securitySettings: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update security settings
    const currentSettings = currentUser.securitySettings || {}
    const updatedSettings = {
      ...currentSettings,
      twoFactorEnabled: twoFactorEnabled ?? currentSettings.twoFactorEnabled ?? false,
      loginNotifications: loginNotifications ?? currentSettings.loginNotifications ?? true,
      emailNotifications: emailNotifications ?? currentSettings.emailNotifications ?? true,
      updatedAt: new Date().toISOString()
    }

    const updatedUser = await db.session.user.update({
      where: { id: userId },
      data: {
        securitySettings: updatedSettings
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        securitySettings: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating security settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}