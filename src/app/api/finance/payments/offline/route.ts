import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, verifyAuth } from '@/lib/auth-server'
import { getApiUser } from '@/lib/api-auth'
import { PaymentStatus, PaymentMethod, InvoiceStatus, UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      // Try API token authentication
      const apiUser = await getApiUser(request)
      if (!apiUser) {
        return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
      }
    }
    
    // Check if user has required role or permissions
    const currentUser = user || await getApiUser(request)
    const hasAccess = currentUser.role === UserRole.ADMIN || 
                      currentUser.role === UserRole.SUPER_ADMIN ||
                      currentUser.role === UserRole.BRANCH_MANAGER ||
                      currentUser.role === UserRole.ACCOUNTANT ||
                      currentUser.permissions.includes(PERMISSIONS.VIEW_PAYMENTS) ||
                      currentUser.permissions.includes('financial.offline.payments')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const customerId = searchParams.get('customerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    const invoiceId = searchParams.get('invoiceId')
    const branchId = searchParams.get('branchId')

    const skip = (page - 1) * limit

    // Build where clause for invoice payments
    const where: any = {}
    
    if (status) {
      where.payment = { status: status }
    } else {
      // Default to completed payments for offline payments
      where.payment = { status: 'COMPLETED' }
    }
    
    if (paymentMethod) {
      where.payment = { ...where.payment, paymentMethod: paymentMethod }
    }
    
    if (customerId) {
      where.invoice = { customerId: customerId }
    }
    
    if (invoiceId) {
      where.invoiceId = invoiceId
    }

    if (branchId) {
      where.invoice = { ...where.invoice, branchId: branchId }
    }
    
    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }
    
    if (search) {
      where.OR = [
        { payment: { transactionId: { contains: search, mode: 'insensitive' } } },
        { payment: { notes: { contains: search, mode: 'insensitive' } } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
        { invoice: { customer: { name: { contains: search, mode: 'insensitive' } } } },
        { invoice: { customer: { email: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Get invoice payments with pagination
    const [invoicePayments, total] = await Promise.all([
      db.invoicePayment.findMany({
        where,
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          payment: true
        },
        orderBy: {
          paymentDate: 'desc'
        },
        skip,
        take: limit
      }),
      db.invoicePayment.count({ where })
    ])

    // Transform data to match expected format
    const payments = invoicePayments.map(ip => ({
      id: ip.id,
      amount: ip.amount,
      currency: ip.invoice.currency,
      status: ip.payment.status,
      paymentMethod: ip.paymentMethod,
      transactionId: ip.transactionId,
      notes: ip.notes,
      paymentDate: ip.paymentDate.toISOString(),
      invoice: {
        id: ip.invoice.id,
        invoiceNumber: ip.invoice.invoiceNumber,
        customer: ip.invoice.customer,
        totalAmount: ip.invoice.totalAmount,
        paidAmount: ip.invoice.paidAmount,
        status: ip.invoice.status
      },
      payment: {
        id: ip.payment.id,
        metadata: ip.payment.metadata
      }
    }))

    // Filter for offline payments only
    const offlinePayments = payments.filter(p => 
      p.notes?.includes('Offline') || 
      p.payment.metadata?.type === 'OFFLINE' ||
      p.paymentMethod === 'CASH' ||
      p.paymentMethod === 'BANK_TRANSFER' ||
      p.paymentMethod === 'CHECK'
    )

    const totalPages = Math.ceil(total / limit)
    const totalAmount = offlinePayments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      payments: offlinePayments,
      total: offlinePayments.length,
      totalAmount,
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
    console.error('Error fetching offline payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offline payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let isConnected = false
  
  try {
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    
    // Try both authentication methods
    let user = null
    
    // First try NextAuth session
    user = await getAuthUser()
    
    // If no session user, try API token authentication
    if (!user) {
      user = await getApiUser(request)
    }
    
    if (!user) {
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
    
    const { invoiceId, amount, paymentMethod, notes, referenceNumber, paymentDate } = body

    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod) {
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
    
    // For offline payments, we need to create a service booking first
    // to satisfy the foreign key constraint in the Payment model
    let serviceBooking
    try {
      // Ensure database connection for service operations
      await db.$connect()
      
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
      } else {
      }
      
      // Create service booking with proper error handling
      const bookingData = {
        customerId: invoice.customerId,
        serviceTypeId: serviceType.id,
        date: new Date(paymentDate || Date.now()),
        timeSlot: 'OFFLINE-PAYMENT',
        status: 'COMPLETED' as const,
        paymentStatus: 'COMPLETED' as const,
        totalPrice: parsedAmount,
        notes: `Service booking for offline payment of invoice ${invoice.invoiceNumber} - ${paymentMethod}`
      }
      
      serviceBooking = await db.serviceBooking.create({
        data: bookingData
      })
      
    } catch (bookingError) {
      console.error('Failed to create service booking:', bookingError)
      console.error('Booking error details:', {
        message: bookingError instanceof Error ? bookingError.message : 'Unknown error',
        stack: bookingError instanceof Error ? bookingError.stack : 'No stack',
        cause: bookingError instanceof Error ? bookingError.cause : 'No cause'
      })
      
      // Try to provide more specific error messages
      if (bookingError instanceof Error) {
        if (bookingError.message.includes('Unique constraint')) {
          throw new Error(`Service booking already exists for this invoice. Please contact support.`)
        }
        if (bookingError.message.includes('Foreign key constraint')) {
          throw new Error(`Invalid customer or service type. Please check the invoice details.`)
        }
        if (bookingError.message.includes('connection') || bookingError.message.includes('timeout')) {
          throw new Error(`Database connection error while creating service booking. Please try again.`)
        }
      }
      
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
    
    
    // Create payment with enhanced error handling
    let payment
    try {
      // Ensure database connection
      await db.$connect()
      
      payment = await db.payment.create({
        data: paymentData
      })
    } catch (createError) {
      console.error('Failed to create payment:', createError)
      console.error('Payment creation error details:', {
        message: createError instanceof Error ? createError.message : 'Unknown error',
        stack: createError instanceof Error ? createError.stack : 'No stack',
        cause: createError instanceof Error ? createError.cause : 'No cause',
        paymentData
      })
      
      // Provide specific error messages
      if (createError instanceof Error) {
        if (createError.message.includes('Unique constraint')) {
          throw new Error(`Payment with this transaction ID already exists. Please use a different reference number.`)
        }
        if (createError.message.includes('Foreign key constraint')) {
          throw new Error(`Invalid service booking or branch. Please check the payment details.`)
        }
        if (createError.message.includes('connection') || createError.message.includes('timeout')) {
          throw new Error(`Database connection error while creating payment. Please try again.`)
        }
        if (createError.message.includes('Invalid value for enum')) {
          throw new Error(`Invalid payment method or status. Please check the payment details.`)
        }
      }
      
      throw new Error(`Failed to create payment record: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
    }

    // Create invoice payment relationship
    try {
      // Ensure database connection
      await db.$connect()
      
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
    } catch (relationshipError) {
      console.error('Failed to create invoice payment relationship:', relationshipError)
      console.error('Relationship error details:', {
        message: relationshipError instanceof Error ? relationshipError.message : 'Unknown error',
        stack: relationshipError instanceof Error ? relationshipError.stack : 'No stack',
        invoiceId,
        paymentId: payment.id
      })
      
      // Provide specific error messages
      if (relationshipError instanceof Error) {
        if (relationshipError.message.includes('Unique constraint')) {
          throw new Error(`This payment is already linked to this invoice.`)
        }
        if (relationshipError.message.includes('Foreign key constraint')) {
          throw new Error(`Invalid invoice or payment ID. Please check the details.`)
        }
        if (relationshipError.message.includes('connection') || relationshipError.message.includes('timeout')) {
          throw new Error(`Database connection error while linking payment to invoice. Please try again.`)
        }
      }
      
      throw new Error(`Failed to link payment to invoice: ${relationshipError instanceof Error ? relationshipError.message : 'Unknown error'}`)
    }

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
    
    
    try {
      await db.transaction.create({
        data: transactionData
      })
    } catch (transactionError) {
      console.error('Failed to create transaction:', transactionError)
      // Don't throw here, just log the error as payment is already created
      console.warn('Transaction creation failed, but payment was successful')
    }

    // Log activity
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
      } catch (disconnectError) {
        console.error('Error disconnecting from database:', disconnectError)
      }
    }
  }
}
