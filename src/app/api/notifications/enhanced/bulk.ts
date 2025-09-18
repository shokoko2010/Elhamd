import { NextRequest, NextResponse } from 'next/server'
import { enhancedNotificationService } from '@/lib/enhanced-notification-service'
import { getAuthUser } from '@/lib/auth-server'
import { securityService } from '@/lib/security-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await securityService.checkRateLimit(clientIP, 'notification_bulk')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many bulk notification requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      recipients,
      channel,
      templateId,
      variables,
      priority = 'MEDIUM'
    } = body

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!channel || !templateId || !variables) {
      return NextResponse.json(
        { error: 'Missing required fields: channel, templateId, variables' },
        { status: 400 }
      )
    }

    // Validate recipients limit
    if (recipients.length > 1000) {
      return NextResponse.json(
        { error: 'Cannot send to more than 1000 recipients at once' },
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

    // Sanitize input
    const sanitizedData = {
      recipients: recipients.map((r: string) => securityService.sanitizeEmail(r)),
      channel: securityService.sanitizeInput(channel),
      templateId: securityService.sanitizeInput(templateId),
      variables: securityService.sanitizeObject(variables),
      priority: securityService.sanitizeInput(priority)
    }

    // Send bulk notification
    const results = await enhancedNotificationService.sendBulkNotification(
      sanitizedData.recipients,
      sanitizedData.channel,
      sanitizedData.templateId,
      sanitizedData.variables,
      sanitizedData.priority
    )

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failureCount,
      results,
      message: `Bulk notification completed: ${successCount} sent, ${failureCount} failed`
    })

  } catch (error) {
    console.error('Bulk notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}