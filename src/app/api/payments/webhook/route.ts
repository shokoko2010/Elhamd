interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { egyptianPaymentService } from '@/lib/egyptian-payment'
import { paymentService } from '@/lib/payment'
import { PaymentStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gateway = searchParams.get('gateway')

    if (!gateway) {
      return NextResponse.json({ error: 'Gateway not specified' }, { status: 400 })
    }

    // Get webhook data
    const headers = Object.fromEntries(request.headers.entries())
    const body = await request.json()

    console.log(`Received webhook from ${gateway}:`, body)

    // Validate and process webhook
    const result = await egyptianPaymentService.handleWebhook(gateway, {
      headers,
      body
    })

    if (!result.success) {
      console.error('Webhook validation failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Update payment status based on webhook data
    if (result.paymentId && result.status) {
      try {
        await paymentService.updatePaymentStatus(
          result.paymentId,
          result.status,
          body.transaction_id || body.TransactionID,
          body.receipt_url
        )

        console.log(`Payment ${result.paymentId} status updated to ${result.status}`)
      } catch (error) {
        console.error('Error updating payment status:', error)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Gateway-specific webhook endpoints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gateway = searchParams.get('gateway')

    if (gateway === 'fawry') {
      // Handle Fawry callback
      return handleFawryCallback(request)
    } else if (gateway === 'paymob') {
      // Handle PayMob callback
      return handlePayMobCallback(request)
    }

    return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 })

  } catch (error) {
    console.error('Callback processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleFawryCallback(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract Fawry callback parameters
  const merchantRefNum = searchParams.get('merchantRefNum')
  const fawryRefNum = searchParams.get('fawryRefNum')
  const paymentStatus = searchParams.get('paymentStatus')
  const amount = searchParams.get('amount')
  const signature = searchParams.get('signature')

  console.log('Fawry callback:', {
    merchantRefNum,
    fawryRefNum,
    paymentStatus,
    amount
  })

  if (!merchantRefNum || !paymentStatus) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // Map Fawry status to our status
  let status: PaymentStatus
  switch (paymentStatus) {
    case 'PAID':
    case 'DELIVERED':
      status = PaymentStatus.COMPLETED
      break
    case 'FAILED':
    case 'EXPIRED':
    case 'CANCELED':
      status = PaymentStatus.FAILED
      break
    default:
      status = PaymentStatus.PENDING
  }

  try {
    await paymentService.updatePaymentStatus(
      merchantRefNum,
      status,
      fawryRefNum
    )

    console.log(`Fawry payment ${merchantRefNum} status updated to ${status}`)
  } catch (error) {
    console.error('Error updating Fawry payment status:', error)
  }

  // Return success response to Fawry
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/success?payment=${merchantRefNum}`)
}

async function handlePayMobCallback(request: NextRequest) {
  const body = await request.json()
  
  console.log('PayMob callback:', body)

  const { obj } = body
  if (!obj) {
    return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 })
  }

  const orderId = obj.order?.id
  const transactionId = obj.id
  const success = obj.success

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
  }

  const status = success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED

  try {
    await paymentService.updatePaymentStatus(
      orderId,
      status,
      transactionId.toString()
    )

    console.log(`PayMob payment ${orderId} status updated to ${status}`)
  } catch (error) {
    console.error('Error updating PayMob payment status:', error)
  }

  return NextResponse.json({ success: true })
}