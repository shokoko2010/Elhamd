import { NextRequest, NextResponse } from 'next/server'
import { enhancedPaymentService } from '@/lib/enhanced-payment-service'
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
    const rateLimitResult = await securityService.checkRateLimit(clientIP, 'payment_verify')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { transactionId } = body

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedTransactionId = securityService.sanitizeInput(transactionId)

    // Verify payment
    const isValid = await enhancedPaymentService.verifyPayment(sanitizedTransactionId)

    return NextResponse.json({
      success: true,
      isValid,
      transactionId: sanitizedTransactionId,
      message: isValid ? 'Payment verified successfully' : 'Payment verification failed'
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}