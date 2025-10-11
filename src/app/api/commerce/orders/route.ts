interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to access orders
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (customerId) {
      where.customerId = customerId
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = body

    // Validate required fields
    if (!customerId || !items || !items.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get commerce settings
    const commerceSettings = await db.commerceSettings.findFirst()
    const settings = commerceSettings?.settings || {}

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const settingsObj = settings as any
    const taxAmount = subtotal * (settingsObj.ecommerce?.taxRate || 0) / 100
    const shippingAmount = subtotal >= (settingsObj.ecommerce?.freeShippingThreshold || 0) ? 0 : (settingsObj.ecommerce?.shippingFee || 0)
    const total = subtotal + taxAmount + shippingAmount

    // Generate order number
    const orderNumber = settingsObj.orders?.autoGenerateNumber 
      ? `${settingsObj.orders?.numberPrefix || 'ORD-'}${Date.now()}`
      : `ORD-${Date.now()}`

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId,
        status: settingsObj.ecommerce?.requireApproval ? 'PENDING' : 'CONFIRMED',
        subtotal,
        taxAmount,
        shippingAmount,
        total,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        notes,
        createdBy: user.id
      }
    })

    // Create order items
    for (const item of items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity
        }
      })
    }

    // Update product quantities
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          },
          inStock: {
            set: true // Will be updated by a trigger or additional logic
          }
        }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}