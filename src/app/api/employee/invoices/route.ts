import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User already available from requireUnifiedAuth

    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        items: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the expected format
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      orderId: invoice.orderId || '',
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status.toLowerCase(),
      issueDate: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidDate: invoice.paidDate?.toISOString()
    }))

    return NextResponse.json(transformedInvoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
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

    // Validate required fields
    if (!customerName || !customerEmail || !items || !items.length || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (tax / 100)
    const total = subtotal + taxAmount

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        orderId,
        customerName,
        customerEmail,
        subtotal,
        tax: taxAmount,
        total,
        status: 'DRAFT',
        dueDate: new Date(dueDate)
      }
    })

    // Create invoice items
    await db.invoiceItem.createMany({
      data: items.map((item: any) => ({
        invoiceId: invoice.id,
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
      dueDate: invoice.dueDate.toISOString()
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}