interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'EGP', description, metadata } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون أكبر من صفر' },
        { status: 400 }
      )
    }

    const paymentService = PaymentService.getInstance()
    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      description,
      metadata
    })

    return NextResponse.json({ paymentIntent })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء نية الدفع' },
      { status: 500 }
    )
  }
}