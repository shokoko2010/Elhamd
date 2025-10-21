import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { InvoiceStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceId = params.id
    const body = await request.json()
    const { status, notes, sendNotification } = body

    // Validate status
    const validStatuses = Object.values(InvoiceStatus)
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid invoice status' 
      }, { status: 400 })
    }

    // Get current invoice
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
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Validate status transition
    const validation = validateStatusTransition(currentInvoice.status, status)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error 
      }, { status: 400 })
    }

    // Update invoice status
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

    // Log activity
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

    // Send notification if requested
    if (sendNotification && currentInvoice.customer?.email) {
      try {
        await sendInvoiceStatusNotification(currentInvoice, status, notes)
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice: updatedInvoice
    })

  } catch (error) {
    console.error('Error updating invoice status:', error)
    return NextResponse.json({ 
      error: 'Failed to update invoice status' 
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