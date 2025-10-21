import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { InvoiceStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INVOICE STATUS UPDATE START ===')
    console.log('Invoice ID:', params.id)
    
    const user = await getAuthUser()
    console.log('User authenticated:', !!user)
    
    if (!user) {
      console.log('Authentication failed - no user found')
      return NextResponse.json({ 
        error: 'Authentication required. Please log in to access this feature.',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
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
    return NextResponse.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice: updatedInvoice
    })

  } catch (error) {
    console.error('Error updating invoice status:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({ 
      error: 'Failed to update invoice status',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
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