import { NextRequest, NextResponse } from 'next/server'
import { enhancedNotificationService } from '@/lib/enhanced-notification-service'
import { getAuthUser } from '@/lib/auth-server'
import { securityService } from '@/lib/security-service'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await securityService.checkRateLimit(clientIP, 'notification_preferences')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get user notification preferences
    const preferences = await enhancedNotificationService.getUserNotificationPreferences(user.id)

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Notification preferences retrieved successfully'
    })

  } catch (error) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await securityService.checkRateLimit(clientIP, 'notification_preferences')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const preferences = body.preferences

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Preferences must be an object' },
        { status: 400 }
      )
    }

    // Sanitize preferences
    const sanitizedPreferences = securityService.sanitizeObject(preferences)

    // Update user notification preferences
    const result = await enhancedNotificationService.updateUserNotificationPreferences(
      user.id,
      sanitizedPreferences
    )

    return NextResponse.json({
      success: result.success,
      preferences: sanitizedPreferences,
      message: 'Notification preferences updated successfully'
    })

  } catch (error) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}