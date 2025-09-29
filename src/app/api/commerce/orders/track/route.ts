interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (!orderNumber || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Order number and either email or phone are required' },
        { status: 400 }
      )
    }

    // Find order by order number
    const order = await db.order.findUnique({
      where: { orderNumber },
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
                images: true
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        promotions: {
          include: {
            promotion: {
              select: {
                id: true,
                title: true,
                code: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify customer identity
    if (email && order.customer.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match order records' },
        { status: 403 }
      )
    }

    if (phone && order.customer.phone !== phone) {
      return NextResponse.json(
        { error: 'Phone number does not match order records' },
        { status: 403 }
      )
    }

    // Get order status timeline
    const statusTimeline = getOrderStatusTimeline(order)

    // Calculate estimated delivery dates
    const deliveryEstimates = getDeliveryEstimates(order)

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone
        },
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          images: item.product.images
        })),
        payment: order.payments[0] || null,
        promotions: order.promotions.map(up => ({
          id: up.promotion.id,
          title: up.promotion.title,
          code: up.promotion.code,
          discount: up.discount
        })),
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        notes: order.notes
      },
      timeline: statusTimeline,
      deliveryEstimates
    })

  } catch (error) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    )
  }
}

function getOrderStatusTimeline(order: any) {
  const timeline = []
  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
  
  // Add confirmed status
  timeline.push({
    status: 'CONFIRMED',
    label: 'تم تأكيد الطلب',
    description: 'تم استلام طلبك وجاري معالجته',
    timestamp: order.createdAt,
    completed: true
  })

  // Add processing status if order is past pending
  if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
    timeline.push({
      status: 'PROCESSING',
      label: 'قيد المعالجة',
      description: 'جاري تجهيز طلبك للشحن',
      timestamp: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000), // Estimate 1 day after confirmation
      completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
    })
  }

  // Add shipped status if applicable
  if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
    timeline.push({
      status: 'SHIPPED',
      label: 'تم الشحن',
      description: 'تم شحن طلبك وهو في طريقه إليك',
      timestamp: new Date(order.createdAt.getTime() + 48 * 60 * 60 * 1000), // Estimate 2 days after confirmation
      completed: order.status === 'SHIPPED' || order.status === 'DELIVERED'
    })
  }

  // Add delivered status if applicable
  if (order.status === 'DELIVERED') {
    timeline.push({
      status: 'DELIVERED',
      label: 'تم التسليم',
      description: 'تم تسليم طلبك بنجاح',
      timestamp: order.updatedAt,
      completed: true
    })
  }

  // Add cancelled status if applicable
  if (order.status === 'CANCELLED') {
    timeline.push({
      status: 'CANCELLED',
      label: 'تم الإلغاء',
      description: 'تم إلغاء الطلب',
      timestamp: order.updatedAt,
      completed: true
    })
  }

  return timeline
}

function getDeliveryEstimates(order: any) {
  const estimates = {
    processing: null,
    shipping: null,
    delivery: null
  }

  const baseDate = new Date(order.createdAt)

  switch (order.status) {
    case 'PENDING':
      estimates.processing = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      estimates.shipping = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000)
      estimates.delivery = new Date(baseDate.getTime() + 96 * 60 * 60 * 1000) // 4 days
      break
    
    case 'CONFIRMED':
      estimates.processing = baseDate
      estimates.shipping = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      estimates.delivery = new Date(baseDate.getTime() + 72 * 60 * 60 * 1000) // 3 days
      break
    
    case 'PROCESSING':
      estimates.processing = baseDate
      estimates.shipping = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      estimates.delivery = new Date(baseDate.getTime() + 72 * 60 * 60 * 1000) // 3 days
      break
    
    case 'SHIPPED':
      estimates.processing = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000)
      estimates.shipping = baseDate
      estimates.delivery = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000) // 2 days
      break
    
    case 'DELIVERED':
      estimates.processing = new Date(baseDate.getTime() - 72 * 60 * 60 * 1000)
      estimates.shipping = new Date(baseDate.getTime() - 48 * 60 * 60 * 1000)
      estimates.delivery = baseDate
      break
    
    case 'CANCELLED':
      // No delivery estimates for cancelled orders
      break
  }

  return estimates
}