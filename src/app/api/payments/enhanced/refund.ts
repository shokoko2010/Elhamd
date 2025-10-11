import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enhancedPaymentService } from '@/lib/enhanced-payment-service'
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
    const rateLimitResult = await SecurityService.checkRateLimit(clientIP, 'payment_refund')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many refund attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { paymentId, amount, reason } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedPaymentId = SecurityService.sanitizeInput(paymentId)
    const sanitizedAmount = amount ? SecurityService.sanitizeNumber(amount) : undefined
    const sanitizedReason = reason ? SecurityService.sanitizeInput(reason) : undefined

    // Process refund
    const result = await enhancedPaymentService.refundPayment(
      sanitizedPaymentId,
      sanitizedAmount,
      sanitizedReason
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        paymentId: sanitizedPaymentId,
        message: 'Refund processed successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Refund processing failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Refund processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}