import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, verifyAuth } from '@/lib/auth-server'
import { getApiUser } from '@/lib/api-auth'
import { PaymentStatus, PaymentMethod, InvoiceStatus } from '@prisma/client'

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export async function POST(request: NextRequest) {
  let isConnected = false
  
  try {
    console.log('=== OFFLINE PAYMENT API START ===')
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    console.log('Database connected successfully')
    
    // Try both authentication methods
    let user = null
    
    // First try NextAuth session
    user = await getAuthUser()
    console.log('NextAuth user authenticated:', !!user)
    
    // If no session user, try API token authentication
    if (!user) {
      user = await getApiUser(request)
      console.log('API token user authenticated:', !!user)
    }
    
    if (!user) {
      console.log('Authentication failed - no user found')
      const errorResponse = NextResponse.json({ 
        error: 'Authentication required. Please log in to access this feature.',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return errorResponse
    }

    // Check if user has permission for offline payments
    const hasOfflinePaymentPermission = user.permissions.includes('financial.offline.payments') || 
                                       user.role === 'ADMIN' || 
                                       user.role === 'SUPER_ADMIN' ||
                                       user.role === 'BRANCH_MANAGER'
    
    if (!hasOfflinePaymentPermission) {
      console.log('Permission denied - user does not have offline payment permission')
      const errorResponse = NextResponse.json({ 
        error: 'Access denied. You do not have permission to record offline payments.',
        code: 'PERMISSION_DENIED'
      }, { status: 403 })
      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return errorResponse
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { invoiceId, amount, paymentMethod, notes, referenceNumber, paymentDate } = body

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod) {
      console.log('Missing required fields:', { 
        invoiceId: !!invoiceId, 
        amount: !!amount, 
        paymentMethod: !!paymentMethod,
        invoiceIdValue: invoiceId,
        amountValue: amount,
        paymentMethodValue: paymentMethod
      })
      return NextResponse.json({ 
        error: 'Missing required fields: invoiceId, amount, paymentMethod',
        code: 'MISSING_FIELDS',
        details: {
          invoiceId: !!invoiceId,
          amount: !!amount,
          paymentMethod: !!paymentMethod
        }
      }, { status: 400 })
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.log('Invalid amount:', amount)
      return NextResponse.json({ 
        error: 'Payment amount must be a positive number',
        code: 'INVALID_AMOUNT',
        details: {
          providedAmount: amount,
          parsedAmount
        }
      }, { status: 400 })
    }

    // Validate payment method
    const validPaymentMethods = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_WALLET', 'CHECK']
    if (!validPaymentMethods.includes(paymentMethod)) {
      console.log('Invalid payment method:', paymentMethod)
      return NextResponse.json({ 
        error: `Invalid payment method: ${paymentMethod}. Valid methods are: ${validPaymentMethods.join(', ')}`,
        code: 'INVALID_PAYMENT_METHOD',
        details: {
          providedMethod: paymentMethod,
          validMethods
        }
      }, { status: 400 })
    }

    // Get invoice details
    console.log('Fetching invoice details...')
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          include: {
            payment: true
          }
        }
      }
    })

    if (!invoice) {
      console.log('Invoice not found:', invoiceId)
      const errorResponse = NextResponse.json({ 
        error: 'Invoice not found. Please check the invoice ID and try again.',
        code: 'INVOICE_NOT_FOUND',
        details: {
          invoiceId,
          message: 'The specified invoice does not exist in the database'
        }
      }, { status: 404 })
      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return errorResponse
    }
    
    console.log('Invoice found:', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      currentPaid: invoice.paidAmount,
      status: invoice.status,
      customerName: invoice.customer?.name
    })

    // Calculate total paid amount
    const totalPaid = invoice.payments.reduce((sum, ip) => sum + ip.payment.amount, 0)
    const newTotalPaid = totalPaid + parsedAmount

    // Check if payment amount exceeds invoice total
    if (newTotalPaid > invoice.totalAmount) {
      console.log('Payment amount exceeds invoice total:', {
        paymentAmount: parsedAmount,
        currentTotal: totalPaid,
        newTotal: newTotalPaid,
        invoiceTotal: invoice.totalAmount
      })
      return NextResponse.json({ 
        error: `Payment amount (¥${parsedAmount.toFixed(2)}) exceeds invoice total (¥${invoice.totalAmount.toFixed(2)}). Current paid amount: ¥${totalPaid.toFixed(2)}`,
        code: 'PAYMENT_EXCEEDS_TOTAL',
        details: {
          paymentAmount: parsedAmount,
          invoiceTotal: invoice.totalAmount,
          currentPaid: totalPaid,
          remainingAmount: invoice.totalAmount - totalPaid
        }
      }, { status: 400 })
    }

    // Create payment record
    console.log('Creating payment record...')
    
    // For offline payments, we need to create a service booking first
    // to satisfy the foreign key constraint in the Payment model
    let serviceBooking
    try {
      // Find or create a default service type for offline payments
      let serviceType = await db.serviceType.findFirst({
        where: { name: 'Offline Payment Service' }
      })
      
      if (!serviceType) {
        serviceType = await db.serviceType.create({
          data: {
            name: 'Offline Payment Service',
            description: 'Service booking created for offline invoice payments',
            duration: 1,
            price: parsedAmount,
            category: 'MAINTENANCE'
          }
        })
        console.log('Created default service type for offline payments:', serviceType.id)
      }
      
      serviceBooking = await db.serviceBooking.create({
        data: {
          customerId: invoice.customerId,
          serviceTypeId: serviceType.id,
          date: new Date(paymentDate || Date.now()),
          timeSlot: 'OFFLINE-PAYMENT',
          status: 'COMPLETED',
          paymentStatus: 'COMPLETED',
          totalPrice: parsedAmount,
          notes: `Service booking for offline payment of invoice ${invoice.invoiceNumber} - ${paymentMethod}`
        }
      })
      console.log('Service booking created for offline payment:', serviceBooking.id)
    } catch (bookingError) {
      console.error('Failed to create service booking:', bookingError)
      throw new Error(`Failed to create service booking: ${bookingError instanceof Error ? bookingError.message : 'Unknown error'}`)
    }
    
    // Prepare payment data
    const paymentData = {
      bookingId: serviceBooking.id,
      bookingType: 'SERVICE' as const,
      amount: parsedAmount,
      currency: invoice.currency,
      status: PaymentStatus.COMPLETED,
      paymentMethod: paymentMethod as PaymentMethod,
      transactionId: referenceNumber || `OFFLINE-${Date.now()}`,
      notes: notes || `Offline payment - ${paymentMethod}`,
      branchId: invoice.branchId
    }
    
    console.log('Payment data prepared:', paymentData)
    
    // Create payment with error handling
    let payment
    try {
      payment = await db.payment.create({
        data: paymentData
      })
      console.log('Payment record created:', payment.id)
    } catch (createError) {
      console.error('Failed to create payment:', createError)
      throw new Error(`Failed to create payment record: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
    }

    // Create invoice payment relationship
    console.log('Creating invoice payment relationship...')
    await db.invoicePayment.create({
      data: {
        invoiceId,
        paymentId: payment.id,
        amount: parsedAmount,
        paymentDate: new Date(paymentDate || Date.now()),
        paymentMethod: paymentMethod as PaymentMethod,
        transactionId: payment.transactionId,
        notes: notes || `Offline payment - ${paymentMethod}`
      }
    })
    console.log('Invoice payment relationship created')

    // Update invoice status based on payment
    let newStatus: InvoiceStatus = invoice.status
    if (Math.abs(newTotalPaid - invoice.totalAmount) < 0.01) {
      newStatus = InvoiceStatus.PAID
    } else if (newTotalPaid > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID
    }

    // Update invoice
    console.log('Updating invoice status...')
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newTotalPaid,
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? new Date() : invoice.paidAt,
        updatedAt: new Date()
      }
    })
    console.log('Invoice updated with status:', newStatus)

    // Create transaction record
    console.log('Creating transaction record...')
    
    // Prepare transaction data without metadata to avoid schema issues
    const transactionData = {
      referenceId: `TXN-${Date.now()}`,
      branchId: invoice.branchId,
      type: 'INCOME',
      category: 'INVOICE_PAYMENT',
      amount: parsedAmount,
      currency: invoice.currency,
      description: `Offline payment for invoice ${invoice.invoiceNumber}`,
      date: new Date(paymentDate || Date.now()),
      paymentMethod: paymentMethod as PaymentMethod,
      reference: payment.transactionId,
      customerId: invoice.customerId,
      invoiceId
    }
    
    console.log('Transaction data prepared:', transactionData)
    
    try {
      await db.transaction.create({
        data: transactionData
      })
      console.log('Transaction record created')
    } catch (transactionError) {
      console.error('Failed to create transaction:', transactionError)
      // Don't throw here, just log the error as payment is already created
      console.warn('Transaction creation failed, but payment was successful')
    }

    // Log activity
    console.log('Creating activity log...')
    await db.activityLog.create({
      data: {
        action: 'RECORDED_OFFLINE_PAYMENT',
        entityType: 'INVOICE',
        entityId: invoiceId,
        userId: user.id,
        details: {
          amount: parsedAmount,
          paymentMethod,
          referenceNumber,
          invoiceNumber: invoice.invoiceNumber
        }
      }
    })
    console.log('Activity log created')

    console.log('=== OFFLINE PAYMENT API SUCCESS ===')
    const successResponse = NextResponse.json({
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
    
    // Add CORS headers
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return successResponse

  } catch (error) {
    console.error('=== OFFLINE PAYMENT API ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check for specific database connection errors
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        cause: error.cause
      })
      
      if (error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ 
          error: 'Database connection error. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR',
          details: 'Unable to connect to the database. Please try again later.'
        }, { status: 503 })
      }
      
      if (error.message.includes('prisma') || error.message.includes('query') || error.message.includes('P2025')) {
        return NextResponse.json({ 
          error: 'Database query error. Please try again.',
          code: 'DATABASE_QUERY_ERROR',
          details: 'A database error occurred while processing your request.'
        }, { status: 500 })
      }
      
      if (error.message.includes('Invalid') || error.message.includes('validation')) {
        return NextResponse.json({ 
          error: 'Validation error. Please check your input.',
          code: 'VALIDATION_ERROR',
          details: error.message
        }, { status: 400 })
      }
    }
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to record offline payment',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR',
      type: typeof error,
      name: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 })
    
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return errorResponse
  } finally {
    if (isConnected) {
      try {
        await db.$disconnect()
        console.log('Database disconnected')
      } catch (disconnectError) {
        console.error('Error disconnecting from database:', disconnectError)
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try both authentication methods
    let user = null
    
    // First try NextAuth session
    user = await getAuthUser()
    
    // If no session user, try API token authentication
    if (!user) {
      user = await getApiUser(request)
    }
    
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

    let payments
    try {
      // Try to fetch with metadata field
      payments = await db.invoicePayment.findMany({
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
    } catch (error) {
      // If metadata field doesn't exist, fetch without it
      console.log('Metadata field not found, fetching payments without metadata')
      payments = await db.invoicePayment.findMany({
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
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              paymentMethod: true,
              transactionId: true,
              notes: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          paymentDate: 'desc'
        }
      })
    }

    // Filter for offline payments only (safely check metadata)
    const offlinePayments = payments.filter(ip => 
      ip.payment.notes?.includes('Offline') || 
      (ip.payment as any).metadata?.type === 'OFFLINE'
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