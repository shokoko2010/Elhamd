interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { InventoryStatus, UserRole } from '@prisma/client'

const resolveStatus = (quantity: number, minStockLevel: number, status?: string) => {
  const normalizedStatus = status?.toUpperCase() as keyof typeof InventoryStatus | undefined

  if (normalizedStatus && InventoryStatus[normalizedStatus]) {
    return InventoryStatus[normalizedStatus]
  }

  if (quantity <= 0) {
    return InventoryStatus.OUT_OF_STOCK
  }

  if (quantity <= Math.max(minStockLevel, 0)) {
    return InventoryStatus.LOW_STOCK
  }

  return InventoryStatus.IN_STOCK
}

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
    const stats = searchParams.get('stats') === 'true'
    const lowStock = searchParams.get('lowStock') === 'true'

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

    // Handle low stock filter
    const shouldFilterLowStock = lowStock

    // Handle stats request
    if (stats) {
      const currentMonthStart = new Date()
      currentMonthStart.setDate(1)
      currentMonthStart.setHours(0, 0, 0, 0)
      
      const previousMonthStart = new Date(currentMonthStart)
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)

      const [
        totalItems,
        totalValue,
        lowStockItems,
        activeSuppliers,
        currentMonthItems,
        previousMonthItems,
        currentMonthValue,
        previousMonthValue
      ] = await Promise.all([
        // Total items
        db.inventoryItem.count(),
        // Total value
        db.inventoryItem.aggregate({
          _sum: { unitPrice: true }
        }),
        // Low stock items
        db.inventoryItem.count({
          where: {
            quantity: {
              lte: db.inventoryItem.fields.minStockLevel
            }
          }
        }),
        // Active suppliers (unique)
        db.inventoryItem.groupBy({
          by: ['supplier'],
          _count: true
        }),
        // Current month items
        db.inventoryItem.count({
          where: {
            createdAt: { gte: currentMonthStart }
          }
        }),
        // Previous month items
        db.inventoryItem.count({
          where: {
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart
            }
          }
        }),
        // Current month value
        db.inventoryItem.aggregate({
          where: {
            createdAt: { gte: currentMonthStart }
          },
          _sum: { unitPrice: true }
        }),
        // Previous month value
        db.inventoryItem.aggregate({
          where: {
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart
            }
          },
          _sum: { unitPrice: true }
        })
      ])

      const monthlyGrowth = {
        items: previousMonthItems > 0 ? ((currentMonthItems - previousMonthItems) / previousMonthItems) * 100 : 0,
        value: previousMonthValue._sum.unitPrice ? 
          ((currentMonthValue._sum.unitPrice || 0) - previousMonthValue._sum.unitPrice) / previousMonthValue._sum.unitPrice * 100 : 0
      }

      return NextResponse.json({
        totalItems,
        totalValue: totalValue._sum.unitPrice || 0,
        lowStockItems,
        activeSuppliers: activeSuppliers.length,
        monthlyGrowth
      })
    }

    // Get inventory items
    const items = await db.inventoryItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })

    const filteredItems = shouldFilterLowStock
      ? items.filter(item => item.quantity <= item.minStockLevel)
      : items

    const transformedItems = filteredItems.map(item => ({
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

    const baseWhere = { ...whereClause }

    if (shouldFilterLowStock) {
      const lowStockFilter = {
        OR: [
          { quantity: { lte: 0 } },
          {
            AND: [
              { quantity: { gt: 0 } },
              { quantity: { lte: db.inventoryItem.fields.minStockLevel } }
            ]
          }
        ]
      }

      baseWhere.AND = Array.isArray(baseWhere.AND)
        ? [...baseWhere.AND, lowStockFilter]
        : [lowStockFilter]
    }

    const totalCount = await db.inventoryItem.count({ where: baseWhere })

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
    if (!partNumber || !name || !category || unitPrice === undefined || unitPrice === null || !supplier || !warehouse) {
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
    const status = resolveStatus(quantity || 0, minStockLevel || 0, body.status)

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