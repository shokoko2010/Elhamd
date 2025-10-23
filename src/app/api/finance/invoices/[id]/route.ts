interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    return NextResponse.json(invoice)
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
    console.log('=== INVOICE UPDATE START ===')
    
    // Ensure database connection
    await db.$connect()
    isConnected = true
    console.log('Database connected successfully')
    
    const { id } = await context.params
    const body = await request.json()
    console.log('Invoice ID:', id)
    console.log('Request body:', body)
    
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
      console.log('Missing required fields:', { customerId: !!customerId, items: !!items, itemsLength: items?.length })
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
      console.log('Invoice not found:', id)
      return NextResponse.json({ 
        error: 'Invoice not found',
        code: 'INVOICE_NOT_FOUND'
      }, { status: 404 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    console.log('Calculated subtotal:', subtotal)

    // Calculate taxes from database tax rates
    let taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    // Create default VAT rate if none exists
    if (taxRates.length === 0) {
      console.log('No tax rates found, creating default VAT rate...')
      const defaultVAT = await db.taxRate.create({
        data: {
          name: 'ضريبة القيمة المضافة',
          type: 'STANDARD',
          rate: 14.0, // 14% VAT in Egypt
          description: 'ضريبة القيمة المضافة القياسية في مصر',
          isActive: true,
          effectiveFrom: new Date('2020-01-01')
        }
      })
      taxRates = [defaultVAT]
      console.log('Created default VAT rate:', defaultVAT)
    }

    // Calculate total tax amount from all applicable tax rates
    const totalTaxAmount = taxRates.reduce((sum, taxRate) => {
      return sum + (subtotal * taxRate.rate / 100)
    }, 0)

    const totalAmount = subtotal + totalTaxAmount
    
    console.log('Calculated amounts:', {
      subtotal,
      totalTaxAmount,
      totalAmount,
      currentPaid: existingInvoice.paidAmount
    })

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
        data: items.map((item: any) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          taxRate: item.taxRate || 0,
          taxAmount: (item.quantity * item.unitPrice) * (item.taxRate || 0) / 100,
          metadata: item.metadata || {}
        }))
      })
      
      // Create new taxes
      await tx.invoiceTax.createMany({
        data: taxRates.map(taxRate => ({
          invoiceId: id,
          taxType: taxRate.type,
          rate: taxRate.rate,
          taxAmount: subtotal * taxRate.rate / 100,
          description: taxRate.description
        }))
      })
      
      return invoice
    })
    
    console.log('Invoice updated successfully:', updatedInvoice.invoiceNumber)

    const successResponse = NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
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
      console.log('Database disconnected')
    }
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    // Check if invoice can be deleted (only draft invoices)
    const invoice = await db.invoice.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    await db.invoice.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}