import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG OFFLINE PAYMENT START ===')
    
    const user = await getAuthUser()
    console.log('User authenticated:', !!user)
    
    if (!user) {
      console.log('Authentication failed - no user found')
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { invoiceId, amount, paymentMethod, notes, referenceNumber, paymentDate } = body

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod) {
      console.log('Missing required fields:', { 
        invoiceId: !!invoiceId, 
        amount: !!amount, 
        paymentMethod: !!paymentMethod 
      })
      return NextResponse.json({ 
        error: 'Missing required fields: invoiceId, amount, paymentMethod',
        code: 'MISSING_FIELDS'
      }, { status: 400 })
    }

    // Test database connection
    console.log('Testing database connection...')
    const invoiceCount = await db.invoice.count()
    console.log('Total invoices in database:', invoiceCount)

    // Get invoice details
    console.log('Fetching invoice:', invoiceId)
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      console.log('Invoice not found:', invoiceId)
      return NextResponse.json({ 
        error: 'Invoice not found',
        code: 'INVOICE_NOT_FOUND',
        invoiceId
      }, { status: 404 })
    }

    console.log('Invoice found:', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      status: invoice.status
    })

    console.log('=== DEBUG OFFLINE PAYMENT SUCCESS ===')
    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        status: invoice.status
      }
    })

  } catch (error) {
    console.error('Debug offline payment error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}