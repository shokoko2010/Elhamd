import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { PaymentStatus, PaymentMethod, InvoiceStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('=== OFFLINE PAYMENT API START ===')
    
    const user = await getAuthUser()
    console.log('User authenticated:', !!user)
    
    if (!user) {
      console.log('Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { invoiceId, amount, paymentMethod, notes, referenceNumber, paymentDate } = body

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod) {
      console.log('Missing required fields:', { invoiceId, amount, paymentMethod })
      return NextResponse.json({ 
        error: 'Missing required fields: invoiceId, amount, paymentMethod' 
      }, { status: 400 })
    }

    // Get invoice details
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: {
          include: {
            payment: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Calculate total paid amount
    const totalPaid = invoice.payments.reduce((sum, ip) => sum + ip.payment.amount, 0)
    const newTotalPaid = totalPaid + amount

    // Check if payment amount exceeds invoice total
    if (newTotalPaid > invoice.totalAmount) {
      return NextResponse.json({ 
        error: 'Payment amount exceeds invoice total' 
      }, { status: 400 })
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId: invoiceId, // Using invoiceId as bookingId for offline payments
        bookingType: 'SERVICE', // Default booking type
        amount,
        currency: invoice.currency,
        status: PaymentStatus.COMPLETED,
        paymentMethod: paymentMethod as PaymentMethod,
        transactionId: referenceNumber || `OFFLINE-${Date.now()}`,
        notes: notes || `Offline payment - ${paymentMethod}`,
        branchId: invoice.branchId,
        metadata: {
          type: 'OFFLINE',
          recordedBy: user.id,
          referenceNumber,
          paymentDate: paymentDate || new Date().toISOString()
        }
      }
    })

    // Create invoice payment relationship
    await db.invoicePayment.create({
      data: {
        invoiceId,
        paymentId: payment.id,
        amount,
        paymentDate: new Date(paymentDate || Date.now()),
        paymentMethod: paymentMethod as PaymentMethod,
        transactionId: payment.transactionId,
        notes: notes || `Offline payment - ${paymentMethod}`
      }
    })

    // Update invoice status based on payment
    let newStatus: InvoiceStatus = invoice.status
    if (Math.abs(newTotalPaid - invoice.totalAmount) < 0.01) {
      newStatus = InvoiceStatus.PAID
    } else if (newTotalPaid > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID
    }

    // Update invoice
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newTotalPaid,
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? new Date() : invoice.paidAt,
        updatedAt: new Date()
      }
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        referenceId: `TXN-${Date.now()}`,
        branchId: invoice.branchId,
        type: 'INCOME',
        category: 'INVOICE_PAYMENT',
        amount,
        currency: invoice.currency,
        description: `Offline payment for invoice ${invoice.invoiceNumber}`,
        date: new Date(paymentDate || Date.now()),
        paymentMethod: paymentMethod as PaymentMethod,
        reference: payment.transactionId,
        customerId: invoice.customerId,
        invoiceId,
        metadata: {
          type: 'OFFLINE',
          recordedBy: user.id,
          paymentId: payment.id
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'RECORDED_OFFLINE_PAYMENT',
        entityType: 'INVOICE',
        entityId: invoiceId,
        userId: user.id,
        details: {
          amount,
          paymentMethod,
          referenceNumber,
          invoiceNumber: invoice.invoiceNumber
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Offline payment recorded successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: payment.status,
        createdAt: payment.createdAt
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidAmount: newTotalPaid,
        status: newStatus
      }
    })

  } catch (error) {
    console.error('Error recording offline payment:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({ 
      error: 'Failed to record offline payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const branchId = searchParams.get('branchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')

    // Build where clause
    const where: any = {
      payment: {
        status: PaymentStatus.COMPLETED
      }
    }

    if (invoiceId) {
      where.invoiceId = invoiceId
    }

    if (branchId) {
      where.invoice = {
        branchId: branchId
      }
    }

    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }

    const payments = await db.invoicePayment.findMany({
      where,
      include: {
        invoice: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        payment: true
      },
      orderBy: {
        paymentDate: 'desc'
      }
    })

    // Filter for offline payments only
    const offlinePayments = payments.filter(ip => 
      ip.payment.notes?.includes('Offline') || 
      ip.payment.metadata?.type === 'OFFLINE'
    )

    return NextResponse.json({
      payments: offlinePayments,
      total: offlinePayments.length,
      totalAmount: offlinePayments.reduce((sum, ip) => sum + ip.amount, 0)
    })

  } catch (error) {
    console.error('Error fetching offline payments:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch offline payments' 
    }, { status: 500 })
  }
}