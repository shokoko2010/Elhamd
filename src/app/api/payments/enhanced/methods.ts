import { NextRequest, NextResponse } from 'next/server'
import { enhancedPaymentService } from '@/lib/enhanced-payment-service'
import { getAuthUser } from '@/lib/auth-server'
import { SecurityService } from '@/lib/security-service'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await SecurityService.checkRateLimit(clientIP, 'payment_methods')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get available payment methods with details
    const methods = enhancedPaymentService.getAllPaymentMethodsDetails()

    return NextResponse.json({
      success: true,
      paymentMethods: methods,
      message: 'Payment methods retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}