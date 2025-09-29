interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuthHandler, UserRole } from '@/lib/unified-auth'

const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER])

export async function GET(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    const user = auth.user

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')
    const dateRange = searchParams.get('dateRange') || 'month'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build date filter
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate
      }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (supplierId && supplierId !== 'all') {
      where.supplierId = supplierId
    }

    // Add branch filter for branch managers
    if (user.role === UserRole.BRANCH_MANAGER && user.branchId) {
      where.warehouse = {
        branchId: user.branchId
      }
    }

    const [orders, total] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contact: true,
              email: true,
              phone: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          items: true,
          createdBy: {
            select: {
              id: true,
              name: true
            }
          },
          approvedBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.purchaseOrder.count({ where })
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
    console.error('Error fetching purchase orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    const user = auth.user

    const body = await request.json()
    const { supplierId, warehouseId, expectedDeliveryDate, shippingCost, notes, terms, items } = body

    if (!supplierId || !warehouseId || !expectedDeliveryDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate supplier exists
    const supplier = await db.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Validate warehouse exists and user has access
    const warehouse = await db.warehouse.findUnique({
      where: { id: warehouseId }
    })

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role === UserRole.BRANCH_MANAGER && user.branchId && warehouse.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Cannot create purchase order for warehouse from different branch' }, { status: 403 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    const taxAmount = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0)
    const totalAmount = subtotal + taxAmount + (shippingCost || 0)

    // Generate purchase order number
    const lastOrder = await db.purchaseOrder.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const orderNumber = lastOrder 
      ? `PO-${parseInt(lastOrder.orderNumber.replace('PO-', '')) + 1}`.padStart(6, '0')
      : 'PO-000001'

    // Create purchase order
    const order = await db.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        warehouseId,
        status: 'DRAFT',
        orderDate: new Date(),
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        subtotal,
        taxAmount,
        shippingCost: shippingCost || 0,
        totalAmount,
        currency: 'EGP',
        notes,
        terms,
        createdById: user.id,
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
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
        supplier: {
          select: {
            id: true,
            name: true,
            contact: true,
            email: true,
            phone: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true
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

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'CREATE_PURCHASE_ORDER',
        entityType: 'PURCHASE_ORDER',
        entityId: order.id,
        userId: user.id,
        details: {
          orderNumber: order.orderNumber,
          supplierId: supplier.id,
          warehouseId: warehouse.id,
          totalAmount: order.totalAmount
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}