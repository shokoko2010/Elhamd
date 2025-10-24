import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { InvoiceStatus } from '@prisma/client'

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let isConnected = false
  
  try {
    console.log('=== INVOICE STATUS UPDATE START ===')
    console.log('Invoice ID:', params.id)
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    console.log('Database connected successfully')
    
    // Use NextAuth only
    const user = await getAuthUser()
    console.log('NextAuth user authenticated:', !!user)
    
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

    // Check if user has permission for invoice management
    const hasInvoicePermission = user.permissions.includes('financial.invoices.manage') || 
                                user.permissions.includes('financial.invoices.update') ||
                                user.role === 'ADMIN' || 
                                user.role === 'SUPER_ADMIN' ||
                                user.role === 'BRANCH_MANAGER'
    
    if (!hasInvoicePermission) {
      console.log('Permission denied - user does not have invoice management permission')
      const errorResponse = NextResponse.json({ 
        error: 'Access denied. You do not have permission to update invoice status.',
        code: 'PERMISSION_DENIED'
      }, { status: 403 })
      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return errorResponse
    }

    const invoiceId = params.id
    const body = await request.json()
    console.log('Request body:', body)
    
    const { status, notes, sendNotification } = body

    // Validate status
    const validStatuses = Object.values(InvoiceStatus)
    if (!validStatuses.includes(status)) {
      console.log('Invalid status:', status)
      return NextResponse.json({ 
        error: `Invalid invoice status: ${status}. Valid statuses: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS'
      }, { status: 400 })
    }

    // Get current invoice
    console.log('Fetching current invoice...')
    const currentInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        payments: {
          include: {
            payment: true
          }
        }
      }
    })

    if (!currentInvoice) {
      console.log('Invoice not found:', invoiceId)
      return NextResponse.json({ 
        error: 'Invoice not found. Please check the invoice ID and try again.',
        code: 'INVOICE_NOT_FOUND'
      }, { status: 404 })
    }
    
    console.log('Current invoice found:', currentInvoice.invoiceNumber, 'Status:', currentInvoice.status)

    // Validate status transition
    console.log('Validating status transition:', currentInvoice.status, '->', status)
    const validation = validateStatusTransition(currentInvoice.status, status)
    if (!validation.valid) {
      console.log('Invalid status transition:', validation.error)
      return NextResponse.json({ 
        error: validation.error || 'Invalid status transition',
        code: 'INVALID_STATUS_TRANSITION',
        details: {
          currentStatus: currentInvoice.status,
          requestedStatus: status,
          allowedTransitions: getAllowedTransitions(currentInvoice.status)
        }
      }, { status: 400 })
    }
    
    // Additional validation for PAID status
    if (status === InvoiceStatus.PAID) {
      const totalPaid = currentInvoice.payments.reduce((sum, ip) => sum + ip.payment.amount, 0)
      if (totalPaid < currentInvoice.totalAmount) {
        console.log('Cannot mark as paid - insufficient payment:', {
          totalPaid,
          totalAmount: currentInvoice.totalAmount,
          remaining: currentInvoice.totalAmount - totalPaid
        })
        return NextResponse.json({
          error: `Cannot mark invoice as paid. Only ${totalPaid.toFixed(2)} EGP paid out of ${currentInvoice.totalAmount.toFixed(2)} EGP total.`,
          code: 'INSUFFICIENT_PAYMENT',
          details: {
            totalPaid,
            totalAmount: currentInvoice.totalAmount,
            remainingAmount: currentInvoice.totalAmount - totalPaid
          }
        }, { status: 400 })
      }
    }

    // Update invoice status
    console.log('Updating invoice status...')
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Set timestamps based on status
    if (status === InvoiceStatus.PAID && !currentInvoice.paidAt) {
      updateData.paidAt = new Date()
    } else if (status === InvoiceStatus.CANCELLED && !currentInvoice.cancelledAt) {
      updateData.cancelledAt = new Date()
    } else if (status === InvoiceStatus.SENT && !currentInvoice.sentAt) {
      updateData.sentAt = new Date()
    }

    // Add notes if provided
    if (notes) {
      updateData.metadata = {
        ...currentInvoice.metadata,
        statusChangeNotes: notes,
        statusChangedBy: user.id,
        statusChangedAt: new Date().toISOString()
      }
    }

    console.log('Update data prepared:', updateData)
    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: updateData,
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
    console.log('Invoice updated successfully:', updatedInvoice.invoiceNumber)

    // Log activity
    console.log('Creating activity log...')
    await db.activityLog.create({
      data: {
        action: 'UPDATED_INVOICE_STATUS',
        entityType: 'INVOICE',
        entityId: invoiceId,
        userId: user.id,
        details: {
          oldStatus: currentInvoice.status,
          newStatus: status,
          notes,
          invoiceNumber: currentInvoice.invoiceNumber
        }
      }
    })
    console.log('Activity log created')

    // Send notification if requested
    if (sendNotification && currentInvoice.customer?.email) {
      console.log('Sending notification to:', currentInvoice.customer.email)
      try {
        await sendInvoiceStatusNotification(currentInvoice, status, notes)
        console.log('Notification sent successfully')
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't fail the request if notification fails
      }
    }

    console.log('=== INVOICE STATUS UPDATE SUCCESS ===')
    const successResponse = NextResponse.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice: updatedInvoice
    })
    
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return successResponse

  } catch (error) {
    console.error('Error updating invoice status:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    // Check for specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Database connection error. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR',
          details: 'Unable to connect to the database. Please try again later.'
        }, { status: 503 })
      }
      
      if (error.message.includes('prisma') || error.message.includes('query')) {
        return NextResponse.json({ 
          error: 'Database query error. Please try again.',
          code: 'DATABASE_QUERY_ERROR',
          details: 'A database error occurred while processing your request.'
        }, { status: 500 })
      }
    }
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to update invoice status',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
    
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return errorResponse
  } finally {
    if (isConnected) {
      await db.$disconnect()
      console.log('Database disconnected')
    }
  }
}

function validateStatusTransition(currentStatus: InvoiceStatus, newStatus: InvoiceStatus) {
  // Define allowed transitions
  const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [
      InvoiceStatus.SENT,
      InvoiceStatus.CANCELLED
    ],
    [InvoiceStatus.SENT]: [
      InvoiceStatus.PAID,
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.CANCELLED
    ],
    [InvoiceStatus.PARTIALLY_PAID]: [
      InvoiceStatus.PAID,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.CANCELLED
    ],
    [InvoiceStatus.PAID]: [
      InvoiceStatus.REFUNDED
    ],
    [InvoiceStatus.OVERDUE]: [
      InvoiceStatus.PAID,
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.CANCELLED
    ],
    [InvoiceStatus.CANCELLED]: [
      InvoiceStatus.DRAFT // Allow reactivation
    ],
    [InvoiceStatus.REFUNDED]: [] // No transitions from refunded
  }

  const allowed = allowedTransitions[currentStatus]?.includes(newStatus)
  
  return {
    valid: allowed,
    error: allowed ? null : `Cannot transition from ${currentStatus} to ${newStatus}`
  }
}

function getAllowedTransitions(status: InvoiceStatus): InvoiceStatus[] {
  const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT, InvoiceStatus.CANCELLED],
    [InvoiceStatus.SENT]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
    [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
    [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED],
    [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.CANCELLED],
    [InvoiceStatus.CANCELLED]: [InvoiceStatus.DRAFT],
    [InvoiceStatus.REFUNDED]: []
  }
  
  return transitions[status] || []
}

async function sendInvoiceStatusNotification(
  invoice: any,
  newStatus: InvoiceStatus,
  notes?: string
) {
  // This would integrate with your email service
  // For now, we'll just log it
  console.log('Invoice status notification:', {
    invoiceNumber: invoice.invoiceNumber,
    customerEmail: invoice.customer?.email,
    newStatus,
    notes
  })

  // TODO: Implement actual email sending
  // Example:
  // await sendEmail({
  //   to: invoice.customer.email,
  //   subject: `Invoice ${invoice.invoiceNumber} Status Update`,
  //   template: 'invoice-status-update',
  //   data: {
  //     invoice,
  //     newStatus,
  //     notes
  //   }
  // })
}