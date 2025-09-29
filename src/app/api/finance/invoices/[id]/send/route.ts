interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Update invoice status to SENT
    const invoice = await db.invoice.update({
      where: { id },
      data: { status: 'SENT' },
      include: {
        customer: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // TODO: Implement actual email sending logic here
    // This would typically involve:
    // 1. Generate PDF invoice
    // 2. Send email to customer with invoice attached
    // 3. Log the email sending activity

    // For now, we'll just simulate the email sending
    console.log(`Sending invoice ${invoice.invoiceNumber} to ${invoice.customer.email}`)

    return NextResponse.json({ 
      success: true,
      message: 'Invoice sent successfully',
      invoice 
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}