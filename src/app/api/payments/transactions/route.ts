interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const method = searchParams.get('method')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (status) {
      where.status = status
    }
    
    if (method) {
      where.paymentMethod = method
    }
    
    if (startDate && endDate) {
      where.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              customerName: true,
              customerEmail: true
            }
          },
          invoicePayments: {
            include: {
              invoice: {
                select: {
                  id: true,
                  invoiceNumber: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.payment.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerId,
      amount,
      paymentMethod,
      paymentDate,
      reference,
      notes,
      invoiceId
    } = body

    // Validate required fields
    if (!customerId || !amount || !paymentMethod || !paymentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        customerId,
        amount,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        reference,
        notes,
        status: 'COMPLETED'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // If this payment is for an invoice, create the invoice payment relationship
    if (invoiceId) {
      await db.invoicePayment.create({
        data: {
          invoiceId,
          paymentId: payment.id,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId
        }
      })

      // Update invoice paid amount and status
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId }
      })

      if (invoice) {
        const newPaidAmount = invoice.paidAmount + payment.amount
        let newStatus = invoice.status

        if (newPaidAmount >= invoice.totalAmount) {
          newStatus = 'PAID'
        } else if (newPaidAmount > 0) {
          newStatus = 'PARTIALLY_PAID'
        }

        await db.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date() : null
          }
        })
      }
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}