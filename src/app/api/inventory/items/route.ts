interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { InventoryStatus, Prisma, UserRole } from '@prisma/client'
import { syncMaintenancePartFromInventory } from '@/lib/maintenance-part-sync'
import { shouldFallbackToEmptyResult } from '@/lib/prisma-error-helpers'

const resolveStatus = (
  quantity: number,
  minStockLevel: number,
  explicitStatus?: string | null
) => {
  const normalizedStatus = explicitStatus?.toUpperCase() as keyof typeof InventoryStatus | undefined

  if (normalizedStatus === 'DISCONTINUED') {
    return InventoryStatus.DISCONTINUED
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

const calculateInventoryValue = async (where?: Prisma.InventoryItemWhereInput) => {
  const items = await db.inventoryItem.findMany({
    where,
    select: {
      quantity: true,
      unitPrice: true
    }
  })

  return items.reduce((total, item) => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0

    return total + quantity * unitPrice
  }, 0)
}

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
  let page = 1
  let limit = 50
  let statsRequested = false
  let shouldFilterLowStock = false

  try {
    const user = await getApiUser(request)

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    page = parseInt(searchParams.get('page') || '1')
    limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const warehouse = searchParams.get('warehouse') || ''
    statsRequested = searchParams.get('stats') === 'true'
    shouldFilterLowStock = searchParams.get('lowStock') === 'true'

    const offset = (page - 1) * limit
    const where = buildFilters({
      search,
      category,
      status,
      warehouse,
      lowStock: shouldFilterLowStock
    })

    // Handle stats request
    if (statsRequested) {
      const currentMonthStart = new Date()
      currentMonthStart.setDate(1)
      currentMonthStart.setHours(0, 0, 0, 0)
      
      const previousMonthStart = new Date(currentMonthStart)
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)

      const currentMonthWhere: Prisma.InventoryItemWhereInput = {
        createdAt: { gte: currentMonthStart }
      }

      const previousMonthWhere: Prisma.InventoryItemWhereInput = {
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart
        }
      }

      const statsResults = await Promise.allSettled([
        db.inventoryItem.count(),
        db.inventoryItem.count({
          where: { status: { in: LOW_STOCK_STATUSES } }
        }),
        db.inventoryItem.findMany({
          where: { supplier: { notIn: ['', null] } },
          select: { supplier: true },
          distinct: ['supplier']
        }),
        db.inventoryItem.count({
          where: currentMonthWhere
        }),
        db.inventoryItem.count({
          where: previousMonthWhere
        }),
        calculateInventoryValue(),
        calculateInventoryValue(currentMonthWhere),
        calculateInventoryValue(previousMonthWhere)
      ])

      const [
        totalItemsResult,
        lowStockItemsResult,
        activeSuppliersResult,
        currentMonthItemsResult,
        previousMonthItemsResult,
        totalValueResult,
        currentMonthValueResult,
        previousMonthValueResult
      ] = statsResults

      const readResult = <T>(
        result: PromiseSettledResult<T>,
        fallback: T
      ): T => {
        if (result.status === 'rejected') {
          console.error('Inventory stats computation error:', result.reason)
          return fallback
        }
        return result.value
      }

      const totalItems = readResult(totalItemsResult, 0)
      const lowStockItems = readResult(lowStockItemsResult, 0)
      const activeSuppliers = readResult(activeSuppliersResult, []).length
      const currentMonthItems = readResult(currentMonthItemsResult, 0)
      const previousMonthItems = readResult(previousMonthItemsResult, 0)
      const totalValue = readResult(totalValueResult, 0)
      const currentMonthValue = readResult(currentMonthValueResult, 0)
      const previousMonthValue = readResult(previousMonthValueResult, 0)

      const monthlyGrowth = {
        items: previousMonthItems > 0 ? ((currentMonthItems - previousMonthItems) / previousMonthItems) * 100 : 0,
        value:
          previousMonthValue > 0
            ? ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100
            : 0
      }

      return NextResponse.json({
        totalItems,
        totalValue,
        lowStockItems,
        activeSuppliers,
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

    const statusUpdates: Array<Promise<unknown>> = []

    const normalizedItems = items.map(item => {
      const computedStatus = resolveStatus(item.quantity, item.minStockLevel, item.status)

      if (item.status !== computedStatus) {
        statusUpdates.push(
          db.inventoryItem.update({
            where: { id: item.id },
            data: {
              status: computedStatus
            }
          })
        )
      }

      return {
        ...item,
        status: computedStatus
      }
    })

    if (statusUpdates.length) {
      await Promise.all(statusUpdates)
    }

    const filteredItems = shouldFilterLowStock
      ? normalizedItems.filter(item => item.quantity <= item.minStockLevel)
      : normalizedItems

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
    if (shouldFallbackToEmptyResult(error)) {
      if (statsRequested) {
        return NextResponse.json({
          totalItems: 0,
          totalValue: 0,
          lowStockItems: 0,
          activeSuppliers: 0,
          monthlyGrowth: {
            items: 0,
            value: 0
          }
        })
      }

      return NextResponse.json({
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      })
    }
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

    await syncMaintenancePartFromInventory(
      {
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
        status
      },
      user.id
    )

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