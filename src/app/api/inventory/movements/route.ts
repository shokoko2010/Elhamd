import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { InventoryStatus, UserRole } from '@prisma/client'

const computeInventoryStatus = (quantity: number, minStockLevel: number) => {
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const itemId = searchParams.get('itemId')
    const warehouseId = searchParams.get('warehouseId')

    // Build where clause
    let whereClause: any = {}
    
    if (itemId) {
      whereClause.itemId = itemId
    }
    
    if (warehouseId) {
      whereClause.warehouseId = warehouseId
    }

    // Get stock movements (simulated since we don't have a StockMovement table)
    // We'll create mock data based on inventory items
    const inventoryItems = await db.inventoryItem.findMany({
      where: itemId || warehouseId ? {
        id: itemId || undefined,
        warehouse: warehouseId || undefined
      } : {},
      take: limit,
      orderBy: { updatedAt: 'desc' }
    })

    // Transform to stock movements format
    const movements = inventoryItems.map((item, index) => ({
      id: `movement-${item.id}`,
      item: {
        name: item.name,
        sku: item.partNumber
      },
      type: item.quantity > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(item.quantity),
      reference: `ADJ-${String(index + 1).padStart(4, '0')}`,
      reason: item.quantity > 0 ? 'إضافة مخزون' : 'سحب من المخزون',
      createdAt: item.updatedAt,
      createdBy: {
        name: user.name || 'مجهول'
      }
    }))

    return NextResponse.json({
      movements,
      pagination: {
        total: movements.length,
        page: 1,
        limit,
        pages: 1
      }
    })

  } catch (error) {
    console.error('Error fetching stock movements:', error)
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
      itemId,
      type,
      quantity,
      reason,
      reference,
      notes
    } = body

    // Validate required fields
    if (!itemId || !type || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Item ID, type, quantity, and reason are required' },
        { status: 400 }
      )
    }

    // Get the inventory item
    const inventoryItem = await db.inventoryItem.findUnique({
      where: { id: itemId }
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Calculate new quantity
    const currentQuantity = inventoryItem.quantity
    let newQuantity = currentQuantity
    
    if (type === 'IN') {
      newQuantity = currentQuantity + quantity
    } else if (type === 'OUT') {
      newQuantity = currentQuantity - quantity
      if (newQuantity < 0) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        )
      }
    }

    // Determine new status
    const newStatus =
      inventoryItem.status === InventoryStatus.DISCONTINUED
        ? InventoryStatus.DISCONTINUED
        : computeInventoryStatus(newQuantity, inventoryItem.minStockLevel)

    // Update inventory item
    const updatedItem = await db.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: newQuantity,
        status: newStatus,
        lastRestockDate: type === 'IN' ? new Date() : inventoryItem.lastRestockDate,
        updatedAt: new Date()
      }
    })

    // Create movement record (mock)
    const movement = {
      id: `movement-${Date.now()}`,
      item: {
        name: updatedItem.name,
        sku: updatedItem.partNumber
      },
      type,
      quantity,
      reference: reference || `ADJ-${Date.now()}`,
      reason,
      createdAt: new Date(),
      createdBy: {
        name: user.name || 'مجهول'
      }
    }

    return NextResponse.json(movement, { status: 201 })

  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}