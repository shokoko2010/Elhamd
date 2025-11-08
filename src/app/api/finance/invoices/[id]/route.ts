interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateProductionUser } from '@/lib/auth-server'
import { PERMISSIONS } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import {
  normalizeInvoiceItemsFromInput,
  normalizeInvoiceRecord,
} from '@/lib/invoice-normalizer'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    
    const invoice = await db.invoice.findUnique({
      where: { id },
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
        taxes: true,
        payments: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                createdAt: true,
                paymentMethod: true,
                status: true,
                transactionId: true,
                notes: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const normalized = normalizeInvoiceRecord({
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      items: invoice.items,
      taxes: invoice.taxes,
    })

    const paidAmount = normalized.totalAmount - normalized.outstanding

    const payload = {
      ...invoice,
      subtotal: normalized.subtotal,
      taxAmount: normalized.taxAmount,
      totalAmount: normalized.totalAmount,
      paidAmount,
      outstanding: normalized.outstanding,
      items: normalized.items,
      taxes: normalized.taxes,
      deletedAt: invoice.deletedAt,
      deletedBy: invoice.deletedBy,
      deletedReason: invoice.deletedReason,
      isDeleted: invoice.isDeleted,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  let isConnected = false
  
  try {
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    
    const { id } = await context.params
    const body = await request.json()
    
    const {
      customerId,
      type,
      items,
      issueDate,
      dueDate,
      notes,
      terms,
      status
    } = body

    // Validate required fields
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: customerId, items (non-empty array)',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 })
    }

    // Check if invoice exists
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
      include: { payments: true }
    })

    if (!existingInvoice) {
      return NextResponse.json({
        error: 'Invoice not found',
        code: 'INVOICE_NOT_FOUND'
      }, { status: 404 })
    }

    if (existingInvoice.isDeleted) {
      return NextResponse.json({
        error: 'Invoice has been archived and cannot be modified',
        code: 'INVOICE_ARCHIVED'
      }, { status: 400 })
    }

    const { items: normalizedItems, totals } = normalizeInvoiceItemsFromInput(items)

    const subtotal = totals.subtotal
    const totalTaxAmount = totals.taxAmount
    const totalAmount = totals.totalAmount
    
    // Update invoice with transaction
    const updatedInvoice = await db.$transaction(async (tx) => {
      // Delete existing items and taxes
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      })
      
      await tx.invoiceTax.deleteMany({
        where: { invoiceId: id }
      })
      
      // Update invoice
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          customerId,
          type,
          status,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          subtotal,
          taxAmount: totalTaxAmount,
          totalAmount,
          notes,
          terms,
          // Don't reset paidAmount if there are existing payments
          paidAmount: existingInvoice.payments.length > 0 ? existingInvoice.paidAmount : 0
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
          taxes: true,
          payments: {
            include: {
              payment: {
                select: {
                  id: true,
                  amount: true,
                  createdAt: true,
                  paymentMethod: true,
                  status: true,
                  transactionId: true,
                  notes: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
      
      // Create new items
      await tx.invoiceItem.createMany({
        data: normalizedItems.map(item => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          metadata: item.metadata ?? {},
        })),
      })

      if (totals.breakdown.length > 0) {
        await tx.invoiceTax.createMany({
          data: totals.breakdown.map(tax => ({
            invoiceId: id,
            taxType: tax.taxType,
            rate: tax.rate,
            taxAmount: tax.taxAmount,
            description: tax.description,
          })),
        })
      }
      
      return invoice
    })
    

    const normalizedInvoice = normalizeInvoiceRecord({
      subtotal: updatedInvoice.subtotal,
      taxAmount: updatedInvoice.taxAmount,
      totalAmount: updatedInvoice.totalAmount,
      paidAmount: updatedInvoice.paidAmount,
      items: updatedInvoice.items,
      taxes: updatedInvoice.taxes,
    })

    const paidAmount = normalizedInvoice.totalAmount - normalizedInvoice.outstanding

    const successResponse = NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: {
        ...updatedInvoice,
        subtotal: normalizedInvoice.subtotal,
        taxAmount: normalizedInvoice.taxAmount,
        totalAmount: normalizedInvoice.totalAmount,
        paidAmount,
        outstanding: normalizedInvoice.outstanding,
        items: normalizedInvoice.items,
        taxes: normalizedInvoice.taxes,
      },
    })
    
    successResponse.headers.set('Access-Control-Allow-Origin', '*')
    successResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    successResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return successResponse
  } catch (error) {
    console.error('=== INVOICE UPDATE ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check for specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        const errorResponse = NextResponse.json({ 
          error: 'Database connection error. Please try again.',
          code: 'DATABASE_CONNECTION_ERROR',
          details: 'Unable to connect to the database. Please try again later.'
        }, { status: 503 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
      
      if (error.message.includes('prisma') || error.message.includes('query')) {
        const errorResponse = NextResponse.json({ 
          error: 'Database query error. Please try again.',
          code: 'DATABASE_QUERY_ERROR',
          details: 'A database error occurred while processing your request.'
        }, { status: 500 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
      
      if (error.message.includes('Foreign key constraint')) {
        const errorResponse = NextResponse.json({ 
          error: 'Invalid customer or related data. Please check your input.',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: 'The specified customer or related data does not exist.'
        }, { status: 400 })
        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        return errorResponse
      }
    }
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to update invoice',
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
    }
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const applyCorsHeaders = (response: NextResponse) => {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      return response
    }
    const user = await authenticateProductionUser(request)

    if (!user) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'غير مصرح لك - يرجى تسجيل الدخول', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ))
    }

    const hasDeletePermission =
      user.permissions.includes('*') ||
      user.permissions.includes(PERMISSIONS.DELETE_INVOICES)

    const hasRoleAccess =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.BRANCH_MANAGER ||
      user.role === UserRole.ACCOUNTANT

    if (!hasDeletePermission && !hasRoleAccess) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'غير مصرح لك - صلاحيات غير كافية', code: 'FORBIDDEN' },
        { status: 403 }
      ))
    }

    let deleteReason: string | null = null

    const contentType = request.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const body = await request.json().catch(() => null)
      if (body && typeof body.reason === 'string') {
        const trimmed = body.reason.trim()
        if (trimmed.length > 0) {
          deleteReason = trimmed.slice(0, 500)
        }
      }
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        isDeleted: true,
        invoiceNumber: true,
      },
    })

    if (!invoice) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'Invoice not found', code: 'INVOICE_NOT_FOUND' },
        { status: 404 }
      ))
    }

    if (invoice.isDeleted) {
      return applyCorsHeaders(NextResponse.json(
        { error: 'Invoice already archived', code: 'INVOICE_ALREADY_ARCHIVED' },
        { status: 409 }
      ))
    }

    const archivedInvoice = await db.invoice.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
        deletedReason: deleteReason,
      },
      select: {
        id: true,
        invoiceNumber: true,
        deletedAt: true,
        deletedBy: true,
        deletedReason: true,
        status: true,
      },
    })

    return applyCorsHeaders(NextResponse.json({
      success: true,
      invoice: archivedInvoice,
    }))
  } catch (error) {
    console.error('Error deleting invoice:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    return response
  }
}