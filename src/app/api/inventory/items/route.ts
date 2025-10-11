interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const warehouse = searchParams.get('warehouse') || ''

    const offset = (page - 1) * limit

    // Build where clause
    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category && category !== 'all') {
      whereClause.category = category
    }
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (warehouse && warehouse !== 'all') {
      whereClause.warehouse = warehouse
    }

    // Get inventory items
    const items = await db.inventoryItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })

    // Transform items data
    const transformedItems = items.map(item => ({
      id: item.id,
      partNumber: item.partNumber,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
      location: item.location,
      warehouse: item.warehouse,
      status: item.status,
      lastRestockDate: item.lastRestockDate.toISOString(),
      nextRestockDate: item.nextRestockDate?.toISOString(),
      leadTime: item.leadTime,
      notes: item.notes
    }))

    // Get total count for pagination
    const totalCount = await db.inventoryItem.count({ where: whereClause })

    return NextResponse.json({
      items: transformedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      partNumber,
      name,
      description,
      category,
      quantity,
      minStockLevel,
      maxStockLevel,
      unitPrice,
      supplier,
      location,
      warehouse,
      leadTime,
      notes
    } = body

    // Validate required fields
    if (!partNumber || !name || !category || !unitPrice || !supplier || !warehouse) {
      return NextResponse.json(
        { error: 'Part number, name, category, unit price, supplier, and warehouse are required' },
        { status: 400 }
      )
    }

    // Check if item already exists
    const existingItem = await db.inventoryItem.findFirst({
      where: { partNumber }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item with this part number already exists' },
        { status: 400 }
      )
    }

    // Determine status based on quantity
    let status: string = 'in_stock'
    if (quantity === 0) {
      status = 'out_of_stock'
    } else if (quantity <= (minStockLevel || 0)) {
      status = 'low_stock'
    }

    // Create new inventory item
    const item = await db.inventoryItem.create({
      data: {
        partNumber,
        name,
        description,
        category,
        quantity,
        minStockLevel,
        maxStockLevel,
        unitPrice,
        supplier,
        location,
        warehouse,
        status,
        lastRestockDate: new Date(),
        leadTime,
        notes
      }
    })

    return NextResponse.json({
      id: item.id,
      partNumber: item.partNumber,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
      location: item.location,
      warehouse: item.warehouse,
      status: item.status,
      lastRestockDate: item.lastRestockDate.toISOString(),
      nextRestockDate: item.nextRestockDate?.toISOString(),
      leadTime: item.leadTime,
      notes: item.notes
    })

  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}