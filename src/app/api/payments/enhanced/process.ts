import { NextRequest, NextResponse } from 'next/server'
import { enhancedPaymentService } from '@/lib/enhanced-payment-service'
import { PaymentMethod } from '@prisma/client'
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
    const rateLimitResult = await securityService.checkRateLimit(clientIP, 'payment_process')
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      bookingId,
      bookingType,
      amount,
      paymentMethod,
      customerEmail,
      customerPhone,
      customerName,
      description,
      notes,
      metadata
    } = body

    // Validate required fields
    if (!bookingId || !bookingType || !amount || !paymentMethod || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment method
    const availableMethods = enhancedPaymentService.getAvailablePaymentMethods()
    
    if (!availableMethods.includes(paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { error: 'Payment method not available' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedData = {
      bookingId: securityService.sanitizeInput(bookingId),
      bookingType: securityService.sanitizeInput(bookingType),
      amount: securityService.sanitizeNumber(amount),
      paymentMethod: securityService.sanitizeInput(paymentMethod),
      customerEmail: securityService.sanitizeEmail(customerEmail),
      customerPhone: customerPhone ? securityService.sanitizeInput(customerPhone) : undefined,
      customerName: customerName ? securityService.sanitizeInput(customerName) : undefined,
      description: description ? securityService.sanitizeInput(description) : undefined,
      notes: notes ? securityService.sanitizeInput(notes) : undefined,
      metadata: metadata ? securityService.sanitizeObject(metadata) : undefined
    }

    // Process payment
    const result = await enhancedPaymentService.processPayment(sanitizedData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        payment: result.payment,
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId,
        fees: result.fees,
        totalAmount: result.totalAmount,
        paymentInstructions: result.paymentInstructions,
        requiresRedirect: result.requiresRedirect,
        message: 'Payment processed successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Payment processing failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}