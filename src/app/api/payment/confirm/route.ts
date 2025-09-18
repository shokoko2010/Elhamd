import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'معرف نية الدفع مطلوب' },
        { status: 400 }
      )
    }

    const paymentService = PaymentService.getInstance()
    const success = await paymentService.confirmPayment(paymentIntentId)

    if (!success) {
      return NextResponse.json(
        { error: 'فشل في تأكيد الدفع' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'فشل في تأكيد الدفع' },
      { status: 500 }
    )
  }
}