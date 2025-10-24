interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get warehouses with current stock count
    const warehouses = await db.warehouse.findMany({
      include: {
        inventoryItems: {
          select: {
            id: true,
            quantity: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform warehouses data
    const transformedWarehouses = warehouses.map(warehouse => {
      const currentStock = warehouse.inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
      return {
        id: warehouse.id,
        name: warehouse.name,
        location: warehouse.location,
        capacity: warehouse.capacity,
        currentStock,
        manager: warehouse.manager,
        contact: warehouse.contact,
        status: warehouse.status
      }
    })

    return NextResponse.json(transformedWarehouses)

  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, capacity, manager, contact } = body

    // Validate required fields
    if (!name || !location || !capacity || !manager) {
      return NextResponse.json(
        { error: 'Name, location, capacity, and manager are required' },
        { status: 400 }
      )
    }

    // Create new warehouse
    const warehouse = await db.warehouse.create({
      data: {
        name,
        location,
        capacity,
        manager,
        contact,
        status: 'active'
      }
    })

    return NextResponse.json({
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
      currentStock: 0,
      manager: warehouse.manager,
      contact: warehouse.contact,
      status: warehouse.status
    })

  } catch (error) {
    console.error('Error creating warehouse:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}