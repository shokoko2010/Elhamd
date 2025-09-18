import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called by a cron job to send automatic reminders
    const sentCount = await emailService.sendPendingReminders()

    return NextResponse.json({
      success: true,
      sentCount,
      message: `Sent ${sentCount} booking reminders`
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}

// This endpoint can be called to test the email service
export async function GET() {
  try {
    // Test sending a welcome email
    const testEmail = process.env.TEST_EMAIL || 'test@example.com'
    const success = await emailService.sendWelcomeEmail(testEmail, 'Test User')

    return NextResponse.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email'
    })
  } catch (error) {
    console.error('Error testing email service:', error)
    return NextResponse.json(
      { error: 'Failed to test email service' },
      { status: 500 }
    )
  }
}