import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PaymentStatus, PaymentMethod, InvoiceStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG OFFLINE PAYMENT API START ===')
    
    // Test database connection
    await db.$connect()
    console.log('Database connected successfully')
    
    // Test authentication
    const user = await getAuthUser()
    console.log('User authenticated:', !!user)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { invoiceId, amount, paymentMethod } = body

    // Simple validation
    if (!invoiceId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        received: { invoiceId, amount, paymentMethod }
      }, { status: 400 })
    }

    // Test if invoice exists
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      return NextResponse.json({ 
        error: 'Invoice not found',
        code: 'INVOICE_NOT_FOUND',
        invoiceId
      }, { status: 404 })
    }

    // Test payment method validation
    const validPaymentMethods = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_WALLET', 'CHECK']
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ 
        error: 'Invalid payment method',
        code: 'INVALID_PAYMENT_METHOD',
        providedMethod: paymentMethod,
        validMethods
      }, { status: 400 })
    }

    // Test simple payment creation
    try {
      const payment = await db.payment.create({
        data: {
          bookingId: invoiceId,
          bookingType: 'SERVICE',
          amount: parseFloat(amount),
          currency: invoice.currency,
          status: PaymentStatus.COMPLETED,
          paymentMethod: paymentMethod as PaymentMethod,
          transactionId: `TEST-${Date.now()}`,
          notes: 'Test offline payment',
          branchId: invoice.branchId
        }
      })
      
      console.log('Test payment created:', payment.id)
      
      return NextResponse.json({
        success: true,
        message: 'Test payment created successfully',
        payment: {
          id: payment.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status
        }
      })
    } catch (paymentError) {
      console.error('Payment creation failed:', paymentError)
      return NextResponse.json({
        error: 'Payment creation failed',
        details: paymentError instanceof Error ? paymentError.message : 'Unknown error',
        code: 'PAYMENT_CREATION_ERROR'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Debug API failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'DEBUG_ERROR'
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}