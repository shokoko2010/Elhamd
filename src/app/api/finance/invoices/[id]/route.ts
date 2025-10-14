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
  try {
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

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    // Get tax rates
    const taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    // Calculate taxes (simplified)
    const taxAmount = subtotal * 0.14 // 14% VAT as example
    const totalAmount = subtotal + taxAmount

    // Update invoice
    const updatedInvoice = await db.invoice.update({
      where: { id },
      data: {
        customerId,
        type,
        status,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        terms,
        // Update items
        items: {
          deleteMany: {},
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            taxRate: item.taxRate || 0,
            taxAmount: (item.quantity * item.unitPrice) * (item.taxRate || 0) / 100,
            metadata: item.metadata || {}
          }))
        },
        // Update taxes
        taxes: {
          deleteMany: {},
          create: taxRates.map(taxRate => ({
            taxType: taxRate.type,
            rate: taxRate.rate,
            taxAmount: subtotal * taxRate.rate / 100,
            description: taxRate.description
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
        taxes: true
      }
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
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