import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enhancedNotificationService } from '@/lib/enhanced-notification-service'
import { SecurityService } from '@/lib/security-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await security.checkRateLimit(clientIP, 'notification_send')
    
    if (!rateLimitResult) {
      return NextResponse.json(
        { error: 'Too many notification requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      recipient,
      channel,
      templateId,
      variables,
      type,
      priority = 'MEDIUM',
      scheduledAt,
      metadata
    } = body

    // Validate required fields
    if (!recipient || !channel || !templateId || !variables) {
      return NextResponse.json(
        { error: 'Missing required fields: recipient, channel, templateId, variables' },
        { status: 400 }
      )
    }

    // Validate channel
    const validChannels = ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP']
    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedData = {
      recipient: security.sanitizeEmail(recipient),
      channel: channel as 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP',
      templateId: security.sanitizeInput(templateId),
      variables: security.sanitizeObject(variables),
      type: type ? security.sanitizeInput(type) : 'CUSTOM',
      priority: security.sanitizeInput(priority),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      metadata: metadata ? security.sanitizeObject(metadata) : undefined
    }

    // Send notification
    const result = await enhancedNotificationService.sendNotification(sanitizedData)

    return NextResponse.json({
      success: result.success,
      notificationId: result.notificationId,
      messageId: result.messageId,
      channel: result.channel,
      error: result.error,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification'
    })

  } catch (error) {
    console.error('Notification sending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}