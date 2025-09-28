import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: user.id },
      include: { role: true }
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role.name as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if quotation exists and user has access
    const quotation = await db.quotation.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: true
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role.name === UserRole.BRANCH_MANAGER && user.branchId && quotation.customer.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if quotation can be converted (only accepted quotations)
    if (quotation.status !== 'ACCEPTED') {
      return NextResponse.json({ 
        error: 'Only accepted quotations can be converted to invoices' 
      }, { status: 400 })
    }

    // Check if quotation is not already converted
    if (quotation.status === 'CONVERTED_TO_INVOICE') {
      return NextResponse.json({ 
        error: 'Quotation already converted to invoice' 
      }, { status: 400 })
    }

    // Generate invoice number
    const lastInvoice = await db.invoice.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const invoiceNumber = lastInvoice 
      ? `INV-${parseInt(lastInvoice.invoiceNumber.replace('INV-', '')) + 1}`.padStart(6, '0')
      : 'INV-000001'

    // Create invoice from quotation
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        customerId: quotation.customerId,
        type: 'PRODUCT', // Default type, can be customized
        status: 'DRAFT',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: quotation.subtotal,
        taxAmount: quotation.taxAmount,
        totalAmount: quotation.totalAmount,
        currency: quotation.currency,
        notes: quotation.notes,
        terms: quotation.terms,
        createdById: user.id,
        items: {
          create: quotation.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            metadata: item.metadata || {}
          }))
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Update quotation status
    const updatedQuotation = await db.quotation.update({
      where: { id: params.id },
      data: {
        status: 'CONVERTED_TO_INVOICE'
      }
    })

    // Log activity for quotation
    await db.activityLog.create({
      data: {
        action: 'CONVERT_QUOTATION_TO_INVOICE',
        entityType: 'QUOTATION',
        entityId: params.id,
        userId: user.id,
        details: {
          quotationNumber: quotation.quotationNumber,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: quotation.totalAmount
        }
      }
    })

    // Log activity for invoice
    await db.activityLog.create({
      data: {
        action: 'CREATE_INVOICE_FROM_QUOTATION',
        entityType: 'INVOICE',
        entityId: invoice.id,
        userId: user.id,
        details: {
          invoiceNumber: invoice.invoiceNumber,
          quotationNumber: quotation.quotationNumber,
          customerId: quotation.customerId,
          totalAmount: invoice.totalAmount
        }
      }
    })

    return NextResponse.json({
      message: 'Quotation converted to invoice successfully',
      invoice,
      quotation: updatedQuotation
    })
  } catch (error) {
    console.error('Error converting quotation to invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}