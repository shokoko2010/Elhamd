import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { PaymentMethod } from '@prisma/client'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      description
    } = body

    // Validate required fields
    if (!bookingId || !bookingType || !amount || !paymentMethod || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment method
    const paymentService = PaymentService.getInstance()
    const availableMethods = paymentService.getAvailablePaymentMethods()
    
    if (!availableMethods.includes(paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { error: 'Payment method not available' },
        { status: 400 }
      )
    }

    // Calculate fees
    const fees = paymentService.getPaymentFees(paymentMethod as PaymentMethod, amount)
    const totalAmount = amount + fees

    // Create payment data
    const paymentData = {
      bookingId,
      bookingType,
      amount: totalAmount,
      currency: 'EGP',
      paymentMethod: paymentMethod as PaymentMethod,
      customerEmail,
      customerPhone,
      customerName,
      description: description || `Payment for ${bookingType} booking`,
      notes: fees > 0 ? `Includes payment fees: ${fees} EGP` : undefined
    }

    // Process payment
    const result = await paymentService.processPayment(paymentData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        payment: result.payment,
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId,
        message: paymentService.getPaymentInstructions(paymentMethod as PaymentMethod),
        fees,
        totalAmount
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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return available payment methods
    const paymentService = PaymentService.getInstance()
    const availableMethods = paymentService.getAvailablePaymentMethods()
    
    const methodsWithDetails = availableMethods.map(method => ({
      method,
      label: paymentService.getPaymentInstructions(method),
      available: true,
      fees: paymentService.getPaymentFees(method, 1000) // Example amount for fee calculation
    }))

    return NextResponse.json({
      paymentMethods: methodsWithDetails
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}