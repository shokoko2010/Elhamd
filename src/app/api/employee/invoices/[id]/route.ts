interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User already available from requireUnifiedAuth

    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      orderId,
      customerName,
      customerEmail,
      items,
      tax,
      dueDate
    } = body

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (tax / 100)
    const total = subtotal + taxAmount

    // Update invoice
    const invoice = await db.invoice.update({
      where: { id },
      data: {
        orderId,
        customerName,
        customerEmail,
        subtotal,
        tax: taxAmount,
        total,
        dueDate: new Date(dueDate)
      }
    })

    // Delete existing items and create new ones
    await db.invoiceItem.deleteMany({
      where: { invoiceId: id }
    })

    await db.invoiceItem.createMany({
      data: items.map((item: any) => ({
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    })

    return NextResponse.json({
      id: invoice.id,
      orderId: invoice.orderId || '',
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      items: items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status.toLowerCase(),
      issueDate: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidDate?.toISOString()
    })
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User already available from requireUnifiedAuth

    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete invoice and related items
    await db.invoiceItem.deleteMany({
      where: { invoiceId: id }
    })

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