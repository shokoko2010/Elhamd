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

const LOW_STOCK_STATUSES = [InventoryStatus.OUT_OF_STOCK, InventoryStatus.LOW_STOCK]

const normalizeDate = (value?: Date | null) => (value ? value.toISOString() : null)

const buildFilters = ({
  search,
  category,
  status,
  warehouse,
  lowStock
}: {
  search?: string
  category?: string
  status?: string
  warehouse?: string
  lowStock?: boolean
}) => {
  const filters: any[] = []

  const trimmedSearch = search?.trim()

  if (trimmedSearch) {
    filters.push({
      OR: [
        { name: { contains: trimmedSearch, mode: 'insensitive' } },
        { partNumber: { contains: trimmedSearch, mode: 'insensitive' } },
        { description: { contains: trimmedSearch, mode: 'insensitive' } }
      ]
    })
  }

  if (category && category !== 'all') {
    filters.push({ category })
  }

  if (status && status !== 'all') {
    const normalizedStatus = status.toUpperCase() as keyof typeof InventoryStatus
    if (InventoryStatus[normalizedStatus]) {
      filters.push({ status: InventoryStatus[normalizedStatus] })
    }
  }

  if (warehouse && warehouse !== 'all') {
    filters.push({ warehouse })
  }

  if (lowStock && (!status || status === 'all')) {
    filters.push({ status: { in: LOW_STOCK_STATUSES } })
  }

  if (!filters.length) {
    return {}
  }

  return { AND: filters }
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
    const shouldFilterLowStock = lowStock
    const where = buildFilters({
      search,
      category,
      status,
      warehouse,
      lowStock: shouldFilterLowStock
    })

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
        db.inventoryItem.count(),
        db.inventoryItem.aggregate({
          _sum: { unitPrice: true }
        }),
        db.inventoryItem.count({
          where: { status: { in: LOW_STOCK_STATUSES } }
        }),
        db.inventoryItem.groupBy({
          by: ['supplier'],
          where: { supplier: { not: '' } },
          _count: true
        }),
        db.inventoryItem.count({
          where: {
            createdAt: { gte: currentMonthStart }
          }
        }),
        db.inventoryItem.count({
          where: {
            createdAt: {
              gte: previousMonthStart,
              lt: currentMonthStart
            }
          }
        }),
        db.inventoryItem.aggregate({
          where: {
            createdAt: { gte: currentMonthStart }
          },
          _sum: { unitPrice: true }
        }),
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

      const currentMonthValueSum = currentMonthValue._sum.unitPrice ?? 0
      const previousMonthValueSum = previousMonthValue._sum.unitPrice ?? 0

      const monthlyGrowth = {
        items: previousMonthItems > 0 ? ((currentMonthItems - previousMonthItems) / previousMonthItems) * 100 : 0,
        value:
          previousMonthValueSum > 0
            ? ((currentMonthValueSum - previousMonthValueSum) / previousMonthValueSum) * 100
            : 0
      }

      return NextResponse.json({
        totalItems,
        totalValue: totalValue._sum.unitPrice ?? 0,
        lowStockItems,
        activeSuppliers: activeSuppliers.length,
        monthlyGrowth
      })
    }

    // Get inventory items
    const items = await db.inventoryItem.findMany({
      where,
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
      lastRestockDate: normalizeDate(item.lastRestockDate),
      nextRestockDate: normalizeDate(item.nextRestockDate),
      leadTime: item.leadTime,
      notes: item.notes
    }))

    const totalCount = await db.inventoryItem.count({ where })

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