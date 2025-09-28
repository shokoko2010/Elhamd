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
    const paymentStatus = searchParams.get('paymentStatus') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus.toUpperCase()
    }

    const orders = await db.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the expected format
    const transformedOrders = orders.map(order => {
      // Get the first item or create a default
      const firstItem = order.items[0];
      
      return {
        id: order.id,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone || '',
        carId: firstItem?.productId || '',
        carDetails: firstItem?.product ? {
          make: firstItem.product.name.split(' ')[0] || '',
          model: firstItem.product.name.split(' ').slice(1).join(' ') || '',
          year: new Date().getFullYear(), // Default to current year
          price: firstItem.product.price
        } : {
          make: '',
          model: '',
          year: 0,
          price: 0
        },
        status: order.status.toLowerCase(),
        orderDate: order.createdAt.toISOString(),
        totalAmount: order.total,
        paymentStatus: order.paymentStatus.toLowerCase(),
        notes: order.notes
      };
    })

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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
      customerName,
      customerEmail,
      customerPhone,
      productId, // Changed from carId to productId
      totalAmount,
      notes
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !productId || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find or create customer
    let customer = await db.user.findUnique({
      where: { email: customerEmail }
    })

    if (!customer) {
      customer = await db.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          role: 'CUSTOMER'
        }
      })
    }

    // Find the product
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create order
    const order = await db.order.create({
      data: {
        customerId: customer.id,
        orderNumber: `ORD-${Date.now()}`, // Generate a simple order number
        subtotal: product.price,
        total: totalAmount,
        shippingAddress: {}, // Default empty address
        notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdBy: customer.id,
        items: {
          create: {
            productId: productId,
            quantity: 1,
            price: product.price,
            totalPrice: product.price
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    const firstItem = order.items[0];
    
    return NextResponse.json({
      id: order.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',
      carId: firstItem?.productId || '',
      carDetails: firstItem?.product ? {
        make: firstItem.product.name.split(' ')[0] || '',
        model: firstItem.product.name.split(' ').slice(1).join(' ') || '',
        year: new Date().getFullYear(),
        price: firstItem.product.price
      } : {
        make: '',
        model: '',
        year: 0,
        price: 0
      },
      status: order.status.toLowerCase(),
      orderDate: order.createdAt.toISOString(),
      totalAmount: order.total,
      paymentStatus: order.paymentStatus.toLowerCase(),
      notes: order.notes
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}