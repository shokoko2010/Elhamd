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
      customerName,
      customerEmail,
      customerPhone,
      carId,
      totalAmount,
      notes
    } = body

    // Find or update customer
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
    } else {
      customer = await db.user.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          phone: customerPhone
        }
      })
    }

    // Update order
    const order = await db.order.update({
      where: { id },
      data: {
        customerId: customer.id,
        vehicleId: carId,
        totalAmount,
        notes
      }
    })

    return NextResponse.json({
      id: order.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',
      carId: order.vehicleId,
      carDetails: {
        make: '',
        model: '',
        year: 0,
        price: 0
      },
      status: order.status.toLowerCase(),
      orderDate: order.createdAt.toISOString(),
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus.toLowerCase(),
      notes: order.notes
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
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

    // Delete order
    await db.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}